"use client";

import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import { Camera, Check, Loader2, RotateCcw, X } from "lucide-react";
import * as React from "react";

import {
  checkQuality,
  combineScan,
  createDetector,
  extractProfile,
  median,
  sampleFrame,
  type PoseProfile,
  type ScanPose,
} from "@/lib/body-scan";
import type { MeasurementKey, MeasurementValue } from "@/lib/measurements";
import { cn } from "@/lib/utils";

/**
 * The guided capture.
 *
 * Nothing is captured on a button press. The camera watches, and only once the
 * pose has been correct for a run of consecutive frames does it record — a
 * person reaching for a shutter button has already left the pose being scanned.
 *
 * Measurements are taken from a burst of frames and combined with a median, so
 * one blurred or mis-segmented frame cannot move the result.
 */

const STABLE_FRAMES_REQUIRED = 12;
const BURST_FRAMES = 20;

const POSE_COPY: Record<
  ScanPose,
  { title: string; steps: string[] }
> = {
  front: {
    title: "Face the camera",
    steps: [
      "Prop your phone against a wall, camera at hip height",
      "Step back until your whole body fits in the frame",
      "Feet together, arms out about 30° from your sides",
    ],
  },
  side: {
    title: "Turn sideways",
    steps: [
      "Turn 90° — one shoulder to the camera",
      "Raise both arms straight overhead",
      "Stand naturally, don't hold your breath",
    ],
  },
};

type Phase = "idle" | "loading" | "front" | "side" | "done" | "error";


/**
 * The per-frame driver.
 *
 * Deliberately module-level rather than a function inside the component: it
 * runs on every animation frame and reads the clock, neither of which belongs
 * in a component body, and hoisting it also removes the mutual reference
 * between `start` and the loop.
 */
type LoopContext = {
  video: HTMLVideoElement;
  detector: PoseLandmarker;
  phaseRef: React.RefObject<Phase>;
  stableRef: React.RefObject<number>;
  burstRef: React.RefObject<PoseProfile[]>;
  rafRef: React.RefObject<number | null>;
  setIssues: (v: string[]) => void;
  setProgress: (v: number) => void;
  onPoseComplete: (frames: PoseProfile[]) => void;
};

function runLoop(ctx: LoopContext): void {
  const pose = ctx.phaseRef.current;
  if (pose !== "front" && pose !== "side") return;

  if (ctx.video.readyState >= 2) {
    const sample = sampleFrame(ctx.detector, ctx.video, performance.now());

    if (!sample) {
      ctx.setIssues(["Step into the frame."]);
      ctx.stableRef.current = 0;
      ctx.burstRef.current = [];
      ctx.setProgress(0);
    } else {
      const quality = checkQuality(sample, pose);
      ctx.setIssues(quality.issues);

      if (!quality.ok) {
        // Any lapse resets the run — a pose held "mostly" is not held.
        ctx.stableRef.current = 0;
        ctx.burstRef.current = [];
        ctx.setProgress(0);
      } else {
        ctx.stableRef.current += 1;
        const profile = extractProfile(sample);

        if (profile && ctx.stableRef.current >= STABLE_FRAMES_REQUIRED) {
          ctx.burstRef.current.push(profile);
        }

        ctx.setProgress(
          Math.min(
            1,
            (ctx.stableRef.current + ctx.burstRef.current.length) /
              (STABLE_FRAMES_REQUIRED + BURST_FRAMES)
          )
        );

        if (ctx.burstRef.current.length >= BURST_FRAMES) {
          const frames = ctx.burstRef.current.slice();
          ctx.burstRef.current = [];
          ctx.stableRef.current = 0;
          ctx.setProgress(0);
          ctx.onPoseComplete(frames);
          return;
        }
      }
    }
  }

  ctx.rafRef.current = requestAnimationFrame(() => runLoop(ctx));
}

export function BodyScanner({
  heightCm,
  onComplete,
  onCancel,
}: {
  heightCm: number;
  onComplete: (
    values: Partial<Record<MeasurementKey, MeasurementValue>>,
    scaleAgreementCm: number
  ) => void;
  onCancel: () => void;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const detectorRef = React.useRef<PoseLandmarker | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const frontRef = React.useRef<PoseProfile[] | null>(null);

  // Loop-local state kept in refs; re-rendering per frame would drop the frame
  // rate far enough to hurt the capture.
  const stableRef = React.useRef(0);
  const burstRef = React.useRef<PoseProfile[]>([]);
  const phaseRef = React.useRef<Phase>("idle");

  const [phase, setPhase] = React.useState<Phase>("idle");
  const [issues, setIssues] = React.useState<string[]>([]);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const setPhaseBoth = React.useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const stop = React.useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    detectorRef.current?.close();
    detectorRef.current = null;
  }, []);

  React.useEffect(() => stop, [stop]);

  /**
   * Wires the component's refs into the module-level driver and starts it.
   *
   * The completion callback is a parameter rather than a closed-over reference
   * so this can be declared before `finishPose`, which calls back into it.
   */
  function beginLoop(
    video: HTMLVideoElement,
    detector: PoseLandmarker,
    onPoseComplete: (frames: PoseProfile[]) => void
  ) {
    runLoop({
      video,
      detector,
      phaseRef,
      stableRef,
      burstRef,
      rafRef,
      setIssues,
      setProgress,
      onPoseComplete,
    });
  }

  function finishPose(frames: PoseProfile[]) {
    const merged: PoseProfile = {
      bodyPx: median(frames.map((f) => f.bodyPx)),
      shoulderPx: median(frames.map((f) => f.shoulderPx)),
      chestPx: median(frames.map((f) => f.chestPx)),
      waistPx: median(frames.map((f) => f.waistPx)),
      hipPx: median(frames.map((f) => f.hipPx)),
      sleevePx: median(frames.map((f) => f.sleevePx)),
      inseamPx: median(frames.map((f) => f.inseamPx)),
      outseamPx: median(frames.map((f) => f.outseamPx)),
    };

    burstRef.current = [];
    stableRef.current = 0;
    setProgress(0);

    if (phaseRef.current === "front") {
      frontRef.current = [merged];
      setPhaseBoth("side");
      const video = videoRef.current;
      const detector = detectorRef.current;
      if (video && detector) beginLoop(video, detector, finishPose);
      return;
    }

    const front = frontRef.current?.[0];
    if (!front) {
      setPhaseBoth("error");
      setError("Lost the first capture. Please start again.");
      stop();
      return;
    }

    const { values, scaleAgreementCm } = combineScan(front, merged, heightCm);
    setPhaseBoth("done");
    stop();
    onComplete(values, scaleAgreementCm);
  }

  const start = React.useCallback(async () => {
    setError(null);
    setPhaseBoth("loading");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) throw new Error("Camera view is not ready.");
      video.srcObject = stream;
      await video.play();

      detectorRef.current = await createDetector();

      frontRef.current = null;
      burstRef.current = [];
      stableRef.current = 0;
      setPhaseBoth("front");
      beginLoop(video, detectorRef.current, finishPose);
    } catch (err) {
      stop();
      setPhaseBoth("error");
      setError(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Camera access was blocked. Allow it in your browser settings, then try again."
          : err instanceof Error
            ? err.message
            : "Could not start the camera."
      );
    }
    // beginLoop and finishPose only touch refs and setters, both stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPhaseBoth, stop]);

  const active = phase === "front" || phase === "side";
  const copy = active ? POSE_COPY[phase] : null;

  return (
    <div className="overflow-hidden rounded-3xl bg-ink-950 ring-1 ring-white/10">
      <div className="relative aspect-[3/4] w-full sm:aspect-[4/3]">
        <video
          ref={videoRef}
          playsInline
          muted
          // Mirrored so moving left on screen matches moving left in the room.
          className={cn(
            "size-full scale-x-[-1] object-cover",
            active ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Framing guide */}
        {active ? (
          <>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className={cn(
                  "h-[86%] w-[38%] rounded-[45%] border-2 border-dashed transition-colors duration-300",
                  issues.length === 0 ? "border-emerald-400/70" : "border-white/30"
                )}
              />
            </div>

            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 to-transparent p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">
                Step {phase === "front" ? "1" : "2"} of 2
              </p>
              <p className="mt-0.5 font-display text-lg font-extrabold text-white">
                {copy?.title}
              </p>
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
              {issues.length ? (
                <p className="rounded-xl bg-amber-400/95 px-3 py-2 text-center text-sm font-bold text-amber-950">
                  {issues[0]}
                </p>
              ) : (
                <div>
                  <p className="text-center text-sm font-bold text-emerald-300">
                    Hold still…
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-[width] duration-150"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <ul className="mt-3 space-y-0.5">
                {copy?.steps.map((s) => (
                  <li key={s} className="text-[11px] leading-relaxed text-white/50">
                    · {s}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}

        {/* Non-camera states */}
        {!active ? (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            {phase === "loading" ? (
              <div>
                <Loader2 aria-hidden className="mx-auto size-8 animate-spin text-brand-300" />
                <p className="mt-3 text-sm font-medium text-white">
                  Starting camera…
                </p>
                <p className="mt-1 text-xs text-white/45">
                  The body model is about 9 MB and loads once.
                </p>
              </div>
            ) : phase === "error" ? (
              <div>
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-coral-500/15">
                  <X aria-hidden className="size-6 text-coral-400" />
                </div>
                <p className="mt-3 max-w-xs text-sm text-white/80">{error}</p>
                <button
                  type="button"
                  onClick={start}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink-950"
                >
                  <RotateCcw aria-hidden className="size-4" />
                  Try again
                </button>
              </div>
            ) : phase === "done" ? (
              <div>
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-500/15">
                  <Check aria-hidden className="size-6 text-emerald-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-white">Scan complete</p>
              </div>
            ) : (
              <div>
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-white/10">
                  <Camera aria-hidden className="size-7 text-white" />
                </div>
                <p className="mt-4 font-display text-lg font-extrabold text-white">
                  Two photos, about a minute
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/55">
                  Wear something fitted — loose clothes get measured instead of
                  you. Nothing is uploaded: the camera is read on your phone and
                  the frames are discarded.
                </p>
                <button
                  type="button"
                  onClick={start}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-bold text-white"
                >
                  <Camera aria-hidden className="size-4" />
                  Start camera
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
        <p className="text-[11px] text-white/40">
          Estimates only — your tailor confirms with a tape.
        </p>
        <button
          type="button"
          onClick={() => {
            stop();
            onCancel();
          }}
          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
