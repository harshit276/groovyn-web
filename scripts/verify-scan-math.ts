/**
 * Offline checks for the scan pipeline.
 *
 * Run with `npx tsx scripts/verify-scan-math.ts`.
 *
 * There is no camera and no body here. These are phantoms: synthetic masks
 * whose true dimensions are known exactly, so the pipeline's output can be
 * compared against an answer rather than eyeballed. That is the only kind of
 * accuracy claim worth making without real subjects.
 */

import { combineScan, extractProfile, type FrameSample } from "../src/lib/body-scan";
import { girthFromWidthDepth } from "../src/lib/measurements";

const W = 200;
const H = 400;
const HEIGHT_CM = 175;

type Shape = {
  /** Half-width of the torso in px. Constant, so the true width is unambiguous. */
  torsoHalf: number;
  withArms: boolean;
};

/**
 * A deliberately simple body: head, a constant-width torso from y=60 to y=200,
 * then two legs. Because the torso does not taper, the true width at every
 * torso row is the same number, and any deviation the pipeline reports is its
 * own error rather than a disagreement about where to measure.
 */
function makeMask({ torsoHalf, withArms }: Shape): Float32Array {
  const m = new Float32Array(W * H);
  const cx = W / 2;
  const put = (x: number, y: number) => {
    if (x >= 0 && x < W && y >= 0 && y < H) m[y * W + x] = 1;
  };
  const bar = (y: number, halfW: number) => {
    for (let x = Math.round(cx - halfW); x <= Math.round(cx + halfW); x++) put(x, y);
  };

  for (let y = 20; y < 55; y++) bar(y, 14);
  for (let y = 55; y < 60; y++) bar(y, 8);

  for (let y = 60; y < 200; y++) {
    bar(y, torsoHalf);
    if (withArms && y > 70 && y < 190) {
      const off = torsoHalf + 14;
      for (let d = -5; d <= 5; d++) {
        put(Math.round(cx - off + d), y);
        put(Math.round(cx + off + d), y);
      }
    }
  }

  for (let y = 200; y < 385; y++) {
    for (let d = -14; d <= 14; d++) {
      if (y < 210) {
        put(Math.round(cx + d), y);
        continue;
      }
      put(Math.round(cx - 20 + d * 0.5), y);
      put(Math.round(cx + 20 + d * 0.5), y);
    }
  }
  return m;
}

/**
 * Softens edges and adds uncertainty, the way a real segmenter does.
 *
 * Noise has to be large enough to cross the 0.5 threshold or it changes
 * nothing: a mask of exact 0s and 1s jittered by a small amount is still a mask
 * of exact 0s and 1s once thresholded.
 */
function degrade(m: Float32Array, amount: number): Float32Array {
  let seed = 12345;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const out = Float32Array.from(m);

  for (let y = 0; y < H; y++) {
    const row = y * W;
    const prev = Float32Array.from(out.subarray(row, row + W));
    for (let x = 1; x < W - 1; x++) {
      out[row + x] = (prev[x - 1] + 2 * prev[x] + prev[x + 1]) / 4;
    }
  }
  for (let i = 0; i < out.length; i++) {
    out[i] = Math.max(0, Math.min(1, out[i] + (rand() - 0.5) * amount));
  }
  return out;
}

function landmarks() {
  const cx = W / 2;
  const lm = (x: number, y: number) => ({ x: x / W, y: y / H, z: 0, visibility: 0.99 });
  const a = Array.from({ length: 33 }, () => lm(cx, 200));
  a[0] = lm(cx, 35);
  a[11] = lm(cx - 30, 62);
  a[12] = lm(cx + 30, 62);
  a[13] = lm(cx - 46, 120);
  a[14] = lm(cx + 46, 120);
  a[15] = lm(cx - 55, 180);
  a[16] = lm(cx + 55, 180);
  a[23] = lm(cx - 16, 200);
  a[24] = lm(cx + 16, 200);
  a[27] = lm(cx - 20, 380);
  a[28] = lm(cx + 20, 380);
  return a;
}

const sample = (mask: Float32Array): FrameSample => ({
  landmarks: landmarks() as never,
  mask,
  width: W,
  height: H,
});

/* 1. Arm rejection */

const armed = extractProfile(sample(makeMask({ torsoHalf: 34, withArms: true })));
if (!armed) throw new Error("extractProfile returned null");
console.log("1. ARM REJECTION");
console.log("   torso is 68px wide, arms sit 48px either side");
console.log(`   chest measured: ${armed.chestPx.toFixed(1)}px`);
const armsOk = armed.chestPx < 90;
console.log(`   arms excluded: ${armsOk ? "yes" : "NO - arms leaked in"}`);

/* 2. Accuracy against a known phantom */

const FRONT_HALF = 34;
const SIDE_HALF = 24;

function run(noise: number) {
  const mk = (half: number, arms: boolean) => {
    const base = makeMask({ torsoHalf: half, withArms: arms });
    return noise > 0 ? degrade(base, noise) : base;
  };
  const f = extractProfile(sample(mk(FRONT_HALF, true)));
  const s = extractProfile(sample(mk(SIDE_HALF, false)));
  if (!f || !s) throw new Error("extractProfile returned null");
  return { f, s, result: combineScan(f, s, HEIGHT_CM) };
}

const clean = run(0);
const scale = HEIGHT_CM / clean.f.bodyPx;
// A bar from cx-half to cx+half inclusive covers 2*half+1 pixels.
const trueGirth = girthFromWidthDepth((FRONT_HALF * 2 + 1) * scale, (SIDE_HALF * 2 + 1) * scale);

console.log(`\n2. ACCURACY vs PHANTOM (true girth at every torso row: ${trueGirth.toFixed(1)} cm)`);

let overallWorst = 0;
for (const [label, noise] of [
  ["clean mask", 0],
  ["blurred + 60% noise", 0.6],
] as const) {
  const { result } = run(noise);
  const errs = (["chest", "waist", "hip"] as const).map((k) => {
    const got = result.values[k]?.cm ?? 0;
    return { k, got, err: got - trueGirth };
  });
  const worst = Math.max(...errs.map((e) => Math.abs(e.err)));
  overallWorst = Math.max(overallWorst, worst);
  console.log(`   ${label}`);
  for (const e of errs) {
    console.log(
      `     ${e.k.padEnd(6)} ${e.got.toFixed(1).padStart(6)} cm   err ${e.err >= 0 ? "+" : ""}${e.err.toFixed(2)} cm`
    );
  }
  console.log(`     worst: ${worst.toFixed(2)} cm`);
}

/* 3. What sub-pixel edges buy */

// A real segmenter reports partial coverage on edge pixels. Give the torso a
// true half-width that falls between pixels and compare the two ways of reading
// it: snapping to the pixel count, or interpolating where the mask crosses 0.5.
console.log("\n3. SUB-PIXEL EDGES vs WHOLE-PIXEL (true edge falls between pixels)");

function fractionalTorso(half: number): Float32Array {
  const m = makeMask({ torsoHalf: 34, withArms: false });
  const cx = W / 2;
  for (let y = 60; y < 200; y++) {
    for (let x = 0; x < W; x++) {
      // Coverage of a pixel spanning [x-0.5, x+0.5] by a bar [cx-half-0.5, cx+half+0.5].
      // A pixel at offset dx is fully inside when dx <= half, and fades to zero
      // one pixel beyond: coverage = half + 1 - |dx|.
      const cover = Math.min(1, Math.max(0, half + 1 - Math.abs(x - cx)));
      m[y * W + x] = cover;
    }
  }
  return m;
}

console.log("   half-width   true px   sub-pixel   err      whole-pixel   err");
for (const half of [34.0, 34.25, 34.5, 34.75]) {
  const f = extractProfile(sample(fractionalTorso(half)));
  if (!f) throw new Error("extractProfile returned null");
  const truePx = half * 2 + 1;
  const whole = Math.round(f.chestPx);
  const row = [
    half.toFixed(2).padStart(10),
    truePx.toFixed(2).padStart(9),
    f.chestPx.toFixed(2).padStart(11),
    ((f.chestPx - truePx >= 0 ? "+" : "") + (f.chestPx - truePx).toFixed(2)).padStart(6),
    String(whole).padStart(13),
    ((whole - truePx >= 0 ? "+" : "") + (whole - truePx).toFixed(2)).padStart(6),
  ];
  console.log("   " + row.join("  "));
}
console.log("   (1 px = " + scale.toFixed(2) + " cm here, so every 0.5 px of width error is about " + (scale * 0.5 * Math.PI / 2).toFixed(2) + " cm of girth)");

// Exit non-zero on a regression so this can gate a build.
if (!armsOk || overallWorst > 2.5) {
  console.error(`\nFAIL: arms ok=${armsOk}, worst error ${overallWorst.toFixed(2)} cm (limit 2.5)`);
  process.exit(1);
}
console.log("\nPASS");
