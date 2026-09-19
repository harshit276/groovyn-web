/**
 * Two-photo body scan.
 *
 * Everything here runs in the browser. Frames are read from a <video>, measured,
 * and dropped — no image ever leaves the device and none is uploaded. That is a
 * deliberate product decision as much as a privacy one: people will not point a
 * camera at their body for a directory they have never heard of if the pictures
 * go to a server.
 *
 * ── How a girth is recovered ────────────────────────────────────────────
 * A front frame gives the body's WIDTH at a level; a side frame gives its
 * DEPTH at the same level. Treat that slice as an ellipse and its perimeter is
 * the girth. See `girthFromWidthDepth` in ./measurements.
 *
 * ── Why the poses differ ────────────────────────────────────────────────
 * Arms are the enemy of a torso silhouette. In the front pose the arms are held
 * out (A-pose) so that, scanning a row of the mask, the torso is a separate
 * contiguous run from each arm and can be isolated. In the side pose the arms
 * go overhead, because at the side there is no angle that separates a hanging
 * arm from the torso — it simply adds depth, and chest depth is the one number
 * a bad side pose ruins.
 */

import type {
  NormalizedLandmark,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

import { girthFromWidthDepth, type MeasurementKey, type MeasurementValue } from "./measurements";

export type ScanPose = "front" | "side";

/** MediaPipe pose landmark indices we rely on. */
const L = {
  nose: 0,
  shoulderL: 11,
  shoulderR: 12,
  elbowL: 13,
  elbowR: 14,
  wristL: 15,
  wristR: 16,
  hipL: 23,
  hipR: 24,
  kneeL: 25,
  kneeR: 26,
  ankleL: 27,
  ankleR: 28,
} as const;

/** Below this, a landmark is a guess and must not drive a measurement. */
const MIN_VISIBILITY = 0.6;
/** Mask confidence above which a pixel counts as body. */
const MASK_THRESHOLD = 0.5;

export type QualityCheck = {
  ok: boolean;
  /** Ordered so the UI can show the single most important fix. */
  issues: string[];
};

export type FrameSample = {
  landmarks: NormalizedLandmark[];
  /** Person-confidence per pixel, row-major, `width * height` long. */
  mask: Float32Array;
  width: number;
  height: number;
};

/* ───────────────────────────── detector ───────────────────────────── */

/**
 * Loads the WASM runtime and the pose model.
 *
 * Both are served from our own /public, so the scan does not depend on a CDN
 * being reachable and cannot silently start sending frames elsewhere.
 */
export async function createDetector(): Promise<PoseLandmarker> {
  const vision = await import("@mediapipe/tasks-vision");
  const fileset = await vision.FilesetResolver.forVisionTasks("/vision/wasm");

  return vision.PoseLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: "/vision/models/pose_landmarker_full.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 1,
    outputSegmentationMasks: true,
    minPoseDetectionConfidence: 0.6,
    minPosePresenceConfidence: 0.6,
    minTrackingConfidence: 0.6,
  });
}

/** Runs the model over one video frame. Returns null when no person is found. */
export function sampleFrame(
  detector: PoseLandmarker,
  video: HTMLVideoElement,
  timestampMs: number
): FrameSample | null {
  const result = detector.detectForVideo(video, timestampMs);
  const landmarks = result.landmarks?.[0];
  const maskObj = result.segmentationMasks?.[0];

  if (!landmarks || !maskObj) {
    result.close?.();
    return null;
  }

  // Copy before close() — the underlying buffer is recycled by the runtime.
  const mask = Float32Array.from(maskObj.getAsFloat32Array());
  const width = maskObj.width;
  const height = maskObj.height;
  result.close?.();

  return { landmarks, mask, width, height };
}

/* ───────────────────────────── quality ───────────────────────────── */

function visible(lm: NormalizedLandmark | undefined): boolean {
  return !!lm && (lm.visibility ?? 0) >= MIN_VISIBILITY;
}

/**
 * Gates a frame before it is allowed to produce numbers.
 *
 * Every one of these is a failure mode that yields a plausible-looking but
 * wrong measurement, which is worse than refusing to measure.
 */
export function checkQuality(sample: FrameSample, pose: ScanPose): QualityCheck {
  const { landmarks, mask, width, height } = sample;
  const issues: string[] = [];

  const need = [
    L.shoulderL,
    L.shoulderR,
    L.hipL,
    L.hipR,
    L.ankleL,
    L.ankleR,
  ];
  if (!need.every((i) => visible(landmarks[i]))) {
    issues.push("Stand so your whole body — head to feet — is in frame.");
  }

  const top = topmostBodyRow(mask, width, height);
  const bottom = bottommostBodyRow(mask, width, height);

  if (top < 0 || bottom < 0) {
    issues.push("Move into the frame.");
    return { ok: false, issues };
  }

  // Cropped at either edge means the height scale is wrong, which corrupts
  // every girth derived from it.
  if (top <= 1) issues.push("Your head is cut off — move back or tilt the phone down.");
  if (bottom >= height - 2) issues.push("Your feet are cut off — move back.");

  const fill = (bottom - top) / height;
  if (fill < 0.55) issues.push("Move closer — you're too small in the frame.");
  if (fill > 0.97) issues.push("Move back a little.");

  // Facing check. Shoulders far apart = square to camera; close = side on.
  const sL = landmarks[L.shoulderL];
  const sR = landmarks[L.shoulderR];
  const shoulderSpan = Math.abs(sL.x - sR.x);
  const bodyHeightNorm = (bottom - top) / height;
  const spanRatio = shoulderSpan / Math.max(bodyHeightNorm, 0.01);

  if (pose === "front" && spanRatio < 0.16) {
    issues.push("Turn to face the camera straight on.");
  }
  if (pose === "side" && spanRatio > 0.11) {
    issues.push("Turn fully sideways — one shoulder to the camera.");
  }

  // Arms must be clear of the torso, or the silhouette measures arm + body.
  if (pose === "front") {
    const midY = (sL.y + landmarks[L.hipL].y) / 2;
    const row = Math.round(midY * height);
    if (runsInRow(mask, width, height, row).length < 3) {
      issues.push("Hold your arms away from your body, about 30°.");
    }
  } else {
    const wristAboveShoulder =
      (visible(landmarks[L.wristL]) && landmarks[L.wristL].y < sL.y) ||
      (visible(landmarks[L.wristR]) && landmarks[L.wristR].y < sR.y);
    if (!wristAboveShoulder) issues.push("Raise both arms straight overhead.");
  }

  return { ok: issues.length === 0, issues };
}

/* ─────────────────────────── mask geometry ─────────────────────────── */

type Run = { start: number; end: number };

/** Contiguous horizontal spans of body pixels in one row. */
function runsInRow(
  mask: Float32Array,
  width: number,
  height: number,
  row: number
): Run[] {
  if (row < 0 || row >= height) return [];
  const runs: Run[] = [];
  let start = -1;

  for (let x = 0; x < width; x++) {
    const on = mask[row * width + x] >= MASK_THRESHOLD;
    if (on && start < 0) start = x;
    if ((!on || x === width - 1) && start >= 0) {
      const end = on ? x : x - 1;
      // Drop 1–2px specks; they are mask noise, not anatomy.
      if (end - start >= 2) runs.push({ start, end });
      start = -1;
    }
  }
  return runs;
}

/**
 * Width of the run that contains `centreX` — the torso, when the arms are held
 * clear. Returns 0 when the row has no body at that position.
 */
function torsoWidthAtRow(
  mask: Float32Array,
  width: number,
  height: number,
  row: number,
  centreX: number
): number {
  const runs = runsInRow(mask, width, height, row);
  if (!runs.length) return 0;

  const hit = runs.find((r) => centreX >= r.start && centreX <= r.end);
  if (hit) return hit.end - hit.start + 1;

  // Centre fell in a gap: take the run nearest to it rather than the widest,
  // which would happily return an arm.
  let best = runs[0];
  let bestDist = Infinity;
  for (const r of runs) {
    const d = Math.min(Math.abs(centreX - r.start), Math.abs(centreX - r.end));
    if (d < bestDist) {
      bestDist = d;
      best = r;
    }
  }
  return best.end - best.start + 1;
}

function topmostBodyRow(mask: Float32Array, width: number, height: number): number {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x] >= MASK_THRESHOLD) return y;
    }
  }
  return -1;
}

function bottommostBodyRow(mask: Float32Array, width: number, height: number): number {
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x] >= MASK_THRESHOLD) return y;
    }
  }
  return -1;
}

/** First row below the hips where the legs separate — the crotch. */
function crotchRow(
  mask: Float32Array,
  width: number,
  height: number,
  hipRow: number,
  bottomRow: number
): number {
  for (let y = hipRow; y < bottomRow; y++) {
    if (runsInRow(mask, width, height, y).length >= 2) return y;
  }
  return hipRow;
}

/* ─────────────────────── per-pose extraction ─────────────────────── */

export type PoseProfile = {
  /** Pixel span from crown to sole — the scale reference. */
  bodyPx: number;
  shoulderPx: number;
  chestPx: number;
  waistPx: number;
  hipPx: number;
  /** Only meaningful from the front pose. */
  sleevePx: number;
  inseamPx: number;
  outseamPx: number;
};

/**
 * Reduces one frame to the pixel spans we care about.
 *
 * Levels are anchored to landmarks rather than fixed fractions of the frame, so
 * they track the person instead of the picture. Waist is found by searching for
 * the narrowest row in the band where a natural waist can be, and hip by the
 * widest — that is more robust than trusting a single landmark height.
 */
export function extractProfile(sample: FrameSample): PoseProfile | null {
  const { landmarks, mask, width, height } = sample;

  const top = topmostBodyRow(mask, width, height);
  const bottom = bottommostBodyRow(mask, width, height);
  if (top < 0 || bottom <= top) return null;

  const shoulderY = ((landmarks[L.shoulderL].y + landmarks[L.shoulderR].y) / 2) * height;
  const hipY = ((landmarks[L.hipL].y + landmarks[L.hipR].y) / 2) * height;
  const centreX = ((landmarks[L.hipL].x + landmarks[L.hipR].x) / 2) * width;
  const torso = hipY - shoulderY;
  if (torso <= 4) return null;

  const at = (row: number) =>
    torsoWidthAtRow(mask, width, height, Math.round(row), Math.round(centreX));

  // Chest sits just below the armpit, not at the shoulder line.
  const chestPx = at(shoulderY + torso * 0.22);
  const shoulderPx = at(shoulderY + torso * 0.04);

  let waistPx = Infinity;
  for (let y = shoulderY + torso * 0.45; y <= hipY; y += 1) {
    const w = at(y);
    if (w > 0 && w < waistPx) waistPx = w;
  }
  if (!Number.isFinite(waistPx)) waistPx = at(hipY - torso * 0.15);

  let hipPx = 0;
  const crotch = crotchRow(mask, width, height, Math.round(hipY), bottom);
  for (let y = hipY - torso * 0.05; y <= crotch; y += 1) {
    hipPx = Math.max(hipPx, at(y));
  }

  // Limb lengths follow the joint chain, so a bent elbow is measured along the
  // arm rather than as a straight line from shoulder to wrist.
  const px = (i: number) => ({ x: landmarks[i].x * width, y: landmarks[i].y * height });
  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  const sleevePx =
    dist(px(L.shoulderL), px(L.elbowL)) + dist(px(L.elbowL), px(L.wristL));

  const ankleY = ((landmarks[L.ankleL].y + landmarks[L.ankleR].y) / 2) * height;
  const inseamPx = Math.max(0, ankleY - crotch);
  const waistRowGuess = hipY - torso * 0.2;
  const outseamPx = Math.max(0, ankleY - waistRowGuess);

  return {
    bodyPx: bottom - top,
    shoulderPx,
    chestPx,
    waistPx,
    hipPx,
    sleevePx,
    inseamPx,
    outseamPx,
  };
}

/** Median is used everywhere frames are combined — one bad frame cannot move it. */
export function median(values: number[]): number {
  const clean = values.filter((v) => Number.isFinite(v) && v > 0).sort((a, b) => a - b);
  if (!clean.length) return 0;
  const mid = Math.floor(clean.length / 2);
  return clean.length % 2 ? clean[mid] : (clean[mid - 1] + clean[mid]) / 2;
}

/* ─────────────────────────── combination ─────────────────────────── */

export type ScanResult = {
  values: Partial<Record<MeasurementKey, MeasurementValue>>;
  /** Front and side must agree on stature or the two captures aren't comparable. */
  scaleAgreementCm: number;
};

/**
 * Turns a front and a side profile into measurements.
 *
 * Each view is scaled independently by the stated height, so the two only have
 * to agree on the person — not on where the phone was standing. The gap between
 * the two implied scales is returned as a confidence signal: if the person moved
 * closer between shots, it shows up here rather than silently skewing a girth.
 */
export function combineScan(
  front: PoseProfile,
  side: PoseProfile,
  heightCm: number
): ScanResult {
  const frontScale = heightCm / front.bodyPx;
  const sideScale = heightCm / side.bodyPx;

  const cm = (px: number, scale: number) => px * scale;
  const v = (value: number): MeasurementValue => ({
    cm: Math.round(value * 10) / 10,
    source: "scan",
  });

  const chestW = cm(front.chestPx, frontScale);
  const chestD = cm(side.chestPx, sideScale);
  const waistW = cm(front.waistPx, frontScale);
  const waistD = cm(side.waistPx, sideScale);
  const hipW = cm(front.hipPx, frontScale);
  const hipD = cm(side.hipPx, sideScale);

  const values: Partial<Record<MeasurementKey, MeasurementValue>> = {
    height: { cm: heightCm, source: "manual" },
    shoulder: v(cm(front.shoulderPx, frontScale)),
    sleeveLength: v(cm(front.sleevePx, frontScale)),
    inseam: v(cm(front.inseamPx, frontScale)),
    outseam: v(cm(front.outseamPx, frontScale)),
  };

  if (chestW > 0 && chestD > 0) values.chest = v(girthFromWidthDepth(chestW, chestD));
  if (waistW > 0 && waistD > 0) values.waist = v(girthFromWidthDepth(waistW, waistD));
  if (hipW > 0 && hipD > 0) values.hip = v(girthFromWidthDepth(hipW, hipD));

  // Both views are scaled to the same stated height, so this compares how much
  // of the frame the body filled in each — a proxy for the person having moved.
  const scaleAgreementCm =
    Math.abs(front.bodyPx * frontScale - side.bodyPx * sideScale) +
    Math.abs(frontScale - sideScale) * ((front.bodyPx + side.bodyPx) / 2);

  return { values, scaleAgreementCm };
}
