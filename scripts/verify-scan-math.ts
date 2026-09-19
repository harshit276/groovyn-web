import { extractProfile, combineScan, type FrameSample } from "../src/lib/body-scan";

const W = 200, H = 400;

/** Paints a crude humanoid: head, torso, arms held out, two legs. */
function makeMask(o: {
  torsoW: number; hipW: number; waistW: number; withArms: boolean;
}): Float32Array {
  const m = new Float32Array(W * H);
  const cx = W / 2;
  const put = (x: number, y: number) => {
    if (x >= 0 && x < W && y >= 0 && y < H) m[y * W + x] = 1;
  };
  const bar = (y: number, halfW: number) => {
    for (let x = Math.round(cx - halfW); x <= Math.round(cx + halfW); x++) put(x, y);
  };

  // head 20..50, shoulders 60, hips 200, crotch 210, ankles 380
  for (let y = 20; y < 55; y++) bar(y, 14);          // head
  for (let y = 55; y < 60; y++) bar(y, 8);           // neck
  for (let y = 60; y < 200; y++) {
    const t = (y - 60) / 140;
    // shoulder wide -> chest -> waist narrow -> hip wide
    let hw: number;
    if (t < 0.25) hw = o.torsoW * (1 - t * 0.1);
    else if (t < 0.7) hw = o.waistW + (o.torsoW - o.waistW) * (1 - (t - 0.25) / 0.45);
    else hw = o.waistW + (o.hipW - o.waistW) * ((t - 0.7) / 0.3);
    bar(y, hw);

    // arms as separate blobs, clear of the torso
    if (o.withArms && y > 70 && y < 190) {
      const off = o.torsoW + 12 + (y - 70) * 0.15;
      for (let d = -5; d <= 5; d++) {
        put(Math.round(cx - off + d), y);
        put(Math.round(cx + off + d), y);
      }
    }
  }
  // legs, separated from y=210
  for (let y = 200; y < 385; y++) {
    for (let d = -14; d <= 14; d++) {
      if (y < 210) { put(Math.round(cx + d), y); continue; }
      put(Math.round(cx - 20 + d * 0.5), y);
      put(Math.round(cx + 20 + d * 0.5), y);
    }
  }
  return m;
}

function lm(x: number, y: number) {
  return { x: x / W, y: y / H, z: 0, visibility: 0.99 };
}
function landmarks() {
  const cx = W / 2;
  const a: ReturnType<typeof lm>[] = [];
  for (let i = 0; i < 33; i++) a.push(lm(cx, 200));
  a[0] = lm(cx, 35);
  a[11] = lm(cx - 30, 62); a[12] = lm(cx + 30, 62);      // shoulders
  a[13] = lm(cx - 46, 120); a[14] = lm(cx + 46, 120);    // elbows
  a[15] = lm(cx - 55, 180); a[16] = lm(cx + 55, 180);    // wrists
  a[23] = lm(cx - 16, 200); a[24] = lm(cx + 16, 200);    // hips
  a[27] = lm(cx - 20, 380); a[28] = lm(cx + 20, 380);    // ankles
  return a;
}

function sample(mask: Float32Array): FrameSample {
  return { landmarks: landmarks() as never, mask, width: W, height: H };
}

// Front: half-widths 34 (shoulder/chest), waist 26, hip 33  -> full 68/52/66
const front = extractProfile(sample(makeMask({ torsoW: 34, waistW: 26, hipW: 33, withArms: true })));
// Side: depth is smaller -> half 24 / 21 / 26
const side  = extractProfile(sample(makeMask({ torsoW: 24, waistW: 21, hipW: 26, withArms: false })));

if (!front || !side) throw new Error("extractProfile returned null");

console.log("front px:", { chest: front.chestPx, waist: front.waistPx, hip: front.hipPx, body: front.bodyPx });
console.log("side  px:", { chest: side.chestPx, waist: side.waistPx, hip: side.hipPx, body: side.bodyPx });

// Arms sit ~46px either side of centre; if they leaked in, chestPx would be >150.
console.log("arms excluded from chest:", front.chestPx < 90, `(got ${front.chestPx}px, torso is ~68px)`);

const r = combineScan(front, side, 175);
console.log("measurements:", JSON.stringify(
  Object.fromEntries(Object.entries(r.values).map(([k, v]) => [k, v!.cm])), null, 1));
console.log("scale agreement (cm):", r.scaleAgreementCm.toFixed(2));
