/**
 * Body measurement domain.
 *
 * Pure functions only — no DOM, no model, no React. The scan pipeline feeds
 * this; the UI renders what comes out. Keeping the maths here means it can be
 * reasoned about and checked without a camera.
 *
 * ── On accuracy, stated plainly ─────────────────────────────────────────
 * A two-photo estimate is not a tape measure. Three things bound it:
 *
 *  1. A silhouette gives width and depth, not the true cross-section. Modelling
 *     a torso slice as an ellipse is the standard approach and is close, but a
 *     real waist is not an ellipse — the model tends to run slightly under.
 *  2. Clothing sits away from the body. Anything looser than a fitted t-shirt
 *     is measured instead of the person.
 *  3. Scale comes from stated height. A 2 cm error in height propagates
 *     proportionally into every girth.
 *
 * So the output is labelled an estimate everywhere it is shown, and the
 * confirmed profile is the one a tailor has checked with a tape. That is not
 * a hedge — it is the difference between a useful starting point and a garment
 * cut to the wrong numbers.
 */

export type MeasurementSource = "scan" | "manual" | "tailor";

/**
 * Which set of garment measurements to work in.
 *
 * This is the tailor's block, not a statement about the person: a women's
 * block adds bust/underbust and an armhole and carries different proportions,
 * a men's block does not. Anyone can pick either, and someone being fitted for
 * both will want both.
 */
export type MeasurementChart = "womens" | "mens";

export type MeasurementKey =
  | "height"
  | "neck"
  | "shoulder"
  | "chest"
  | "waist"
  | "hip"
  | "sleeveLength"
  | "bicep"
  | "wrist"
  | "shirtLength"
  | "inseam"
  | "outseam"
  | "thigh"
  | "underbust"
  | "armhole";

export type MeasurementDef = {
  key: MeasurementKey;
  label: string;
  /** Used instead of `label` on the women's chart, where the term differs. */
  labelWomens?: string;
  /** How a person (or tailor) takes this with a tape. Shown in the review step. */
  howTo: string;
  /** Plausible adult range in cm. Outside this we refuse to save silently. */
  min: number;
  max: number;
  /** Can the two-photo scan produce this at all? */
  scannable: boolean;
  group: "core" | "upper" | "lower";
  /** Charts this measurement belongs to. Omitted means both. */
  charts?: MeasurementChart[];
};

/** The term a chart uses for a measurement. */
export function labelFor(def: MeasurementDef, chart: MeasurementChart): string {
  return chart === "womens" && def.labelWomens ? def.labelWomens : def.label;
}

/** Measurements that belong on a given chart, in display order. */
export function measurementsFor(chart: MeasurementChart): MeasurementDef[] {
  return MEASUREMENTS.filter((m) => !m.charts || m.charts.includes(chart));
}

export const MEASUREMENTS: MeasurementDef[] = [
  {
    key: "height",
    label: "Height",
    howTo: "Stand against a wall without shoes, heels together, and mark the top of your head.",
    min: 120,
    max: 220,
    scannable: false,
    group: "core",
  },
  {
    key: "chest",
    label: "Chest",
    labelWomens: "Bust",
    howTo: "Around the fullest part of the chest, tape level under the arms and flat across the back.",
    min: 60,
    max: 160,
    scannable: true,
    group: "upper",
  },
  {
    key: "waist",
    label: "Waist",
    howTo: "Around the natural waist — the narrowest point, roughly a thumb's width above the navel. Don't hold your breath.",
    min: 50,
    max: 160,
    scannable: true,
    group: "core",
  },
  {
    key: "hip",
    label: "Hip / Seat",
    howTo: "Around the fullest part of the seat, feet together.",
    min: 60,
    max: 170,
    scannable: true,
    group: "lower",
  },
  {
    key: "shoulder",
    label: "Shoulder width",
    howTo: "Across the back, from the bone at the edge of one shoulder to the other.",
    min: 30,
    max: 60,
    scannable: true,
    group: "upper",
  },
  {
    key: "neck",
    label: "Neck",
    howTo: "Around the base of the neck, one finger inside the tape.",
    min: 26,
    max: 55,
    scannable: false,
    group: "upper",
  },
  {
    key: "sleeveLength",
    label: "Sleeve length",
    howTo: "From the shoulder bone, over a slightly bent elbow, to the wrist bone.",
    min: 40,
    max: 75,
    scannable: true,
    group: "upper",
  },
  {
    key: "bicep",
    label: "Bicep",
    howTo: "Around the fullest part of the upper arm, relaxed.",
    min: 18,
    max: 55,
    scannable: false,
    group: "upper",
  },
  {
    key: "wrist",
    label: "Wrist",
    howTo: "Around the wrist bone.",
    min: 12,
    max: 25,
    scannable: false,
    group: "upper",
  },
  {
    key: "underbust",
    label: "Underbust",
    labelWomens: "Underbust",
    howTo: "Directly under the bust, tape snug and level all the way round. Needed for a blouse or choli.",
    min: 55,
    max: 140,
    scannable: false,
    group: "upper",
    charts: ["womens"],
  },
  {
    key: "armhole",
    label: "Armhole",
    howTo: "Around the shoulder joint, through the armpit, with the arm relaxed at your side.",
    min: 30,
    max: 70,
    scannable: false,
    group: "upper",
  },
  {
    key: "shirtLength",
    label: "Shirt length",
    labelWomens: "Kurta / Blouse length",
    howTo: "From the base of the neck at the back, straight down to where you want the hem.",
    min: 55,
    max: 130,
    scannable: false,
    group: "upper",
  },
  {
    key: "inseam",
    label: "Inseam",
    howTo: "From the crotch seam straight down the inside leg to the ankle bone.",
    min: 55,
    max: 100,
    scannable: true,
    group: "lower",
  },
  {
    key: "outseam",
    label: "Outseam",
    howTo: "From the natural waist down the outside of the leg to the ankle bone.",
    min: 80,
    max: 130,
    scannable: true,
    group: "lower",
  },
  {
    key: "thigh",
    label: "Thigh",
    howTo: "Around the fullest part of the upper thigh.",
    min: 35,
    max: 90,
    scannable: false,
    group: "lower",
  },
];

export const MEASUREMENT_BY_KEY = new Map(MEASUREMENTS.map((m) => [m.key, m]));

export type MeasurementValue = {
  /** Always stored in centimetres; the UI converts for display. */
  cm: number;
  source: MeasurementSource;
};

export type MeasurementProfile = {
  /** Bumped when the stored shape changes so old profiles can be discarded. */
  version: 2;
  updatedAt: string;
  unit: "cm" | "in";
  chart: MeasurementChart;
  values: Partial<Record<MeasurementKey, MeasurementValue>>;
  /** Set once a shop has checked these with a tape. */
  confirmedBy?: { storeName: string; at: string };
};

/* ────────────────────────── unit helpers ────────────────────────── */

export const CM_PER_INCH = 2.54;

export function toDisplay(cm: number, unit: "cm" | "in"): number {
  const v = unit === "in" ? cm / CM_PER_INCH : cm;
  return Math.round(v * 10) / 10;
}

export function fromDisplay(value: number, unit: "cm" | "in"): number {
  return unit === "in" ? value * CM_PER_INCH : value;
}

/* ────────────────────────── girth maths ────────────────────────── */

/**
 * Ramanujan's second approximation for the perimeter of an ellipse.
 *
 * Exact to better than 1e-5 for the eccentricities a human torso produces,
 * so the error in a girth is dominated by the silhouette, never by this.
 */
export function ellipsePerimeter(semiA: number, semiB: number): number {
  if (semiA <= 0 || semiB <= 0) return 0;
  const h = ((semiA - semiB) ** 2) / ((semiA + semiB) ** 2);
  return (
    Math.PI *
    (semiA + semiB) *
    (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)))
  );
}

/**
 * Girth at one level from the front width and the side depth.
 *
 * Both arguments are full widths in centimetres, not radii.
 */
export function girthFromWidthDepth(widthCm: number, depthCm: number): number {
  return ellipsePerimeter(widthCm / 2, depthCm / 2);
}

/* ────────────────────────── validation ────────────────────────── */

export type ValidationIssue = { key: MeasurementKey; message: string };

/** Range check plus the few cross-checks that catch a bad scan. */
export function validateProfile(
  values: Partial<Record<MeasurementKey, MeasurementValue>>
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const [key, value] of Object.entries(values) as [
    MeasurementKey,
    MeasurementValue,
  ][]) {
    const def = MEASUREMENT_BY_KEY.get(key);
    if (!def || !Number.isFinite(value.cm)) continue;
    if (value.cm < def.min || value.cm > def.max) {
      issues.push({
        key,
        message: `${def.label} looks off — expected ${def.min}–${def.max} cm.`,
      });
    }
  }

  // A shoulder wider than half the chest girth is anatomically impossible and
  // is the signature of a scan that caught an outstretched arm in the torso.
  const chest = values.chest?.cm;
  const shoulder = values.shoulder?.cm;
  if (chest && shoulder && shoulder > chest * 0.62) {
    issues.push({
      key: "shoulder",
      message: "Shoulder looks too wide for that chest — retake with arms clear of your body.",
    });
  }

  // Inseam must fit inside the height with room for a torso.
  const height = values.height?.cm;
  const inseam = values.inseam?.cm;
  if (height && inseam && inseam > height * 0.56) {
    issues.push({
      key: "inseam",
      message: "Inseam looks long for that height — check where you measured from.",
    });
  }

  return issues;
}

/**
 * Proportion ratios against stature, per chart.
 *
 * These are population averages for Indian adults, not a measurement of anyone.
 * They exist so the review screen opens with something to correct rather than
 * fifteen empty boxes — every value they produce is marked `manual`.
 *
 * The two charts differ most at the hip: using one set of ratios for everyone
 * under-reads a woman's hip by roughly six centimetres, which is exactly the
 * kind of quiet, plausible-looking error that ruins a garment.
 */
const RATIOS: Record<MeasurementChart, Partial<Record<MeasurementKey, number>>> = {
  mens: {
    chest: 0.53,
    waist: 0.46,
    hip: 0.545,
    shoulder: 0.259,
    neck: 0.222,
    sleeveLength: 0.34,
    shirtLength: 0.44,
    inseam: 0.45,
    outseam: 0.61,
    thigh: 0.31,
    bicep: 0.18,
    wrist: 0.098,
    armhole: 0.265,
  },
  womens: {
    chest: 0.525,
    underbust: 0.46,
    waist: 0.44,
    hip: 0.575,
    shoulder: 0.235,
    neck: 0.2,
    sleeveLength: 0.325,
    shirtLength: 0.55,
    inseam: 0.45,
    outseam: 0.6,
    thigh: 0.335,
    bicep: 0.175,
    wrist: 0.093,
    armhole: 0.245,
  },
};

/** Girths scale with build; lengths and widths barely do. */
const SCALES_WITH_BUILD = new Set<MeasurementKey>([
  "chest",
  "underbust",
  "waist",
  "hip",
  "thigh",
  "bicep",
  "neck",
  "armhole",
]);

/**
 * Rough starting values from height, build and chart, for someone who will not
 * scan. Population averages — a real person routinely sits 8-10 cm either side.
 */
export function seedFromBuild(
  heightCm: number,
  build: "slim" | "regular" | "broad",
  chart: MeasurementChart
): Partial<Record<MeasurementKey, MeasurementValue>> {
  const f = build === "slim" ? 0.92 : build === "broad" ? 1.1 : 1;
  const out: Partial<Record<MeasurementKey, MeasurementValue>> = {
    height: { cm: heightCm, source: "manual" },
  };

  for (const [key, ratio] of Object.entries(RATIOS[chart]) as [
    MeasurementKey,
    number,
  ][]) {
    const scaled = heightCm * ratio * (SCALES_WITH_BUILD.has(key) ? f : 1);
    out[key] = { cm: Math.round(scaled * 10) / 10, source: "manual" };
  }

  return out;
}
