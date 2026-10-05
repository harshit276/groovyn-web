"use client";

import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import { Camera, Check, Loader2, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import * as React from "react";

import {
  checkQuality,
  combineScan,
  createDetector,
  extractProfile,
  sampleFrame,
  trimmedMean,
  type PoseProfile,
  type ScanPose,
} from "@/lib/body-scan";
import type { MeasurementKey, MeasurementValue } from "@/lib/measurements";
import { createSpeaker, toBig, toSpoken } from "@/lib/speech";
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
/**
 * Largest frame-to-frame drift of the body centre, as a fraction of the frame,
 * that still counts as standing still. Tracking jitter on a motionless person is
 * well under half of this; a real step or sway is well over it.
 */
const MAX_DRIFT = 0.012;
const BURST_FRAMES = 20;

/**
 * `headline` is the one line that has to be readable from across a room, so it
 * is short enough to set at poster size. `spoken` is what is said aloud when the
 * pose begins; `steps` are for the prep screen, read up close before stepping
 * back.
 */
const POSE_COPY: Record<
  ScanPose,
  { title: string; headline: string; spoken: string }
> = {
  front: {
    title: "Face the camera",
    headline: "FACE ME, ARMS OUT",
    spoken:
      "Step one. Step back until I can see you from head to toe. Face the camera, with your arms out a little from your sides.",
  },
  side: {
    title: "Turn sideways",
    headline: "TURN SIDEWAYS, ARMS UP",
    spoken:
      "Got it. Step two. Turn sideways, one shoulder to the camera, and raise both arms over your head.",
  },
};

const PREP_STEPS = [
  "Prop your phone against a wall, at hip height, camera facing you.",
  "Wear something fitted. Loose clothes get measured instead of you.",
  "Shoes off, long hair tied up. Both add height the scan cannot tell apart from you.",
  "Turn your volume up. You will hear spoken instructions as you step back.",
  "Stand 2 to 3 metres away (6 to 8 feet) so your whole body fits.",
];

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
  centreRef: React.RefObject<{ x: number; y: number } | null>;
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

      // A pose can be correct and still moving, which smears the silhouette
      // edges the whole measurement depends on. Compare the body centre with the
      // previous frame and refuse to count a frame taken mid-sway.
      const lm = sample.landmarks;
      const centre = {
        x: (lm[11].x + lm[12].x + lm[23].x + lm[24].x) / 4,
        y: (lm[11].y + lm[12].y + lm[23].y + lm[24].y) / 4,
      };
      const last = ctx.centreRef.current;
      ctx.centreRef.current = centre;
      const moving =
        quality.ok &&
        !!last &&
        Math.hypot(centre.x - last.x, centre.y - last.y) > MAX_DRIFT;

      ctx.setIssues(moving ? ["Hold completely still."] : quality.issues);

      if (!quality.ok || moving) {
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

/** For a store that never changes: nothing to subscribe to. */
const noopSubscribe = () => () => {};

/**
 * A font size that is a share of the camera view rather than of the screen,
 * kept inside readable bounds. The class that sits beside each use is the
 * fallback for a browser without container query units.
 */
const fs = (minPx: number, cqmin: number, maxPx: number) =>
  `clamp(${minPx}px, ${cqmin}cqmin, ${maxPx}px)`;

/**
 * The pose as a picture. A person three metres away with their arms out cannot
 * read a sentence, but they can match a shape.
 */
function PoseGlyph({ pose }: { pose: ScanPose }) {
  const stroke = {
    stroke: "white",
    strokeWidth: 5,
    strokeLinecap: "round" as const,
    fill: "none",
  };
  return (
    <svg
      viewBox="0 0 80 110"
      aria-hidden
      className="size-16 shrink-0 rounded-2xl bg-white/10 p-[6%]"
      style={{ width: "19cqmin", height: "19cqmin" }}
    >
      <circle cx="40" cy="14" r="8" {...stroke} fill="white" />
      <line x1="40" y1="24" x2="40" y2="62" {...stroke} />
      {pose === "front" ? (
        <>
          {/* Arms out and slightly down, about 30 degrees from the body. */}
          <line x1="40" y1="32" x2="12" y2="56" {...stroke} />
          <line x1="40" y1="32" x2="68" y2="56" {...stroke} />
          <line x1="40" y1="62" x2="30" y2="100" {...stroke} />
          <line x1="40" y1="62" x2="50" y2="100" {...stroke} />
        </>
      ) : (
        <>
          {/* Side on: both arms straight up, legs together. */}
          <line x1="40" y1="32" x2="44" y2="2" {...stroke} />
          <line x1="40" y1="32" x2="36" y2="2" {...stroke} />
          <line x1="40" y1="62" x2="40" y2="100" {...stroke} />
        </>
      )}
    </svg>
  );
}

/**
 * Everything drawn over the live camera: the step and the pose picture at the
 * top, and the one thing to do right now at the bottom.
 *
 * Presentational only, so it can be looked at without a camera.
 *
 * It is built for a person two to three metres from the phone with their arms
 * out, who can read almost nothing on the screen. So the correction is a
 * two-word command at poster size, in black on amber, with the full sentence
 * beneath for anyone close enough to read it. The voice says the same thing.
 *
 * Every size is a share of the camera view (`cqmin`), not of the screen, so the
 * layout holds on a narrow phone and on a wide laptop webcam alike.
 */
export function ScanOverlay({
  pose,
  issues,
  progress,
}: {
  pose: ScanPose;
  issues: string[];
  progress: number;
}) {
  const holding = issues.length === 0;
  const copy = POSE_COPY[pose];
  const sentence = issues[0];
  const command = sentence ? toBig(sentence) : null;

  return (
    <div className="absolute inset-0 [container-type:size]">
      {/* Framing guide */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            "h-[84%] w-[40%] rounded-[45%] border-4 border-dashed transition-colors duration-300",
            holding ? "border-emerald-400" : "border-white/40"
          )}
        />
      </div>

      {/* Top: which step, and the pose as a picture. */}
      <div
        className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/90 via-black/60 to-transparent"
        style={{ padding: "3.5cqmin", gap: "3cqmin" }}
      >
        <div className="min-w-0">
          <p
            className="text-sm font-black uppercase tracking-[0.18em] text-brand-300"
            style={{ fontSize: fs(11, 4, 24) }}
          >
            Step {pose === "front" ? "1" : "2"} of 2
          </p>
          <p
            className="mt-1 font-display text-2xl font-black leading-[1.05] text-white"
            style={{
              fontSize: fs(20, 7.2, 56),
              textWrap: "balance",
              textShadow: "0 2px 12px rgba(0,0,0,0.9)",
            }}
          >
            {copy.headline}
          </p>
        </div>
        <PoseGlyph pose={pose} />
      </div>

      {/* Bottom: the one thing to do right now. */}
      <div
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent"
        style={{ padding: "3.5cqmin", paddingTop: "12cqmin" }}
      >
        {sentence ? (
          <div
            role="alert"
            className="rounded-2xl bg-amber-400 text-center text-black"
            style={{ padding: "3cqmin 4cqmin" }}
          >
            {command ? (
              <>
                <p
                  className="font-display text-4xl font-black uppercase leading-none tracking-tight"
                  style={{ fontSize: fs(30, 12.5, 76), textWrap: "balance" }}
                >
                  {command}
                </p>
                <p
                  className="font-bold leading-snug text-black/80"
                  style={{ fontSize: fs(13, 4.4, 26), marginTop: "1.5cqmin" }}
                >
                  {sentence}
                </p>
              </>
            ) : (
              <p
                className="font-display text-3xl font-black leading-tight"
                style={{ fontSize: fs(22, 7.5, 52), textWrap: "balance" }}
              >
                {sentence}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p
              className="text-center font-display text-4xl font-black uppercase tracking-wide text-emerald-300"
              style={{
                fontSize: fs(30, 13, 80),
                textShadow: "0 2px 14px rgba(0,0,0,0.9)",
              }}
            >
              Hold still
            </p>
            <div
              className="overflow-hidden rounded-full bg-white/20"
              style={{ marginTop: "2.5cqmin", height: "4.5cqmin", minHeight: 12 }}
            >
              <div
                className="h-full rounded-full bg-emerald-400 transition-[width] duration-150"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
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
  const centreRef = React.useRef<{ x: number; y: number } | null>(null);
  const phaseRef = React.useRef<Phase>("idle");

  const [phase, setPhase] = React.useState<Phase>("idle");
  const [issues, setIssues] = React.useState<string[]>([]);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  // Width over height of the real camera picture, known once it is playing.
  const [aspect, setAspect] = React.useState<number | null>(null);

  // Lazy init: the speaker reads `window`, so it must be built on the client.
  const [speaker] = React.useState(() => createSpeaker());
  const [voiceOn, setVoiceOn] = React.useState(true);
  // The server cannot know whether this browser can speak, so the toggle is left
  // out of the first render and appears once the page is live. Reading
  // `speaker.isSupported` directly would not match the server's HTML.
  const speechSupported = React.useSyncExternalStore(
    noopSubscribe,
    () => speaker.isSupported,
    () => false
  );

  React.useEffect(() => {
    speaker.setMuted(!voiceOn);
  }, [speaker, voiceOn]);

  // Stop talking the moment the scanner goes away.
  React.useEffect(() => () => speaker.stop(), [speaker]);

  // Announce each pose as it begins.
  React.useEffect(() => {
    if (phase === "front") speaker.say(POSE_COPY.front.spoken, { force: true, priority: true });
    if (phase === "side") speaker.say(POSE_COPY.side.spoken, { force: true, priority: true });
    if (phase === "done") speaker.say("All done. Check your numbers.", { force: true, priority: true });
  }, [phase, speaker]);

  // Speak the single most important correction. Keyed on the string rather than
  // the array, which is a new object every frame.
  const firstIssue = issues[0];
  const holding = issues.length === 0;
  const liveScan = phase === "front" || phase === "side";

  React.useEffect(() => {
    if (!liveScan || !firstIssue) return;
    speaker.say(toSpoken(firstIssue));
  }, [firstIssue, liveScan, speaker]);

  React.useEffect(() => {
    if (liveScan && holding) speaker.say("Good. Hold still.", { priority: true });
  }, [holding, liveScan, speaker]);

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
      centreRef,
      rafRef,
      setIssues,
      setProgress,
      onPoseComplete,
    });
  }

  function finishPose(frames: PoseProfile[]) {
    const merged: PoseProfile = {
      bodyPx: trimmedMean(frames.map((f) => f.bodyPx)),
      shoulderPx: trimmedMean(frames.map((f) => f.shoulderPx)),
      chestPx: trimmedMean(frames.map((f) => f.chestPx)),
      waistPx: trimmedMean(frames.map((f) => f.waistPx)),
      hipPx: trimmedMean(frames.map((f) => f.hipPx)),
      sleevePx: trimmedMean(frames.map((f) => f.sleevePx)),
      inseamPx: trimmedMean(frames.map((f) => f.inseamPx)),
      outseamPx: trimmedMean(frames.map((f) => f.outseamPx)),
    };

    burstRef.current = [];
    stableRef.current = 0;
    // Turning sideways moves the body centre a lot; that is not fidgeting.
    centreRef.current = null;
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
    // iOS only allows speech that begins inside a user gesture, so unlock it
    // here, synchronously, before the first await.
    speaker.prime();
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

      // Shape the frame to the real picture, so what the person sees is exactly
      // what the detector sees. A landscape stream squeezed into a portrait box
      // would hide its sides, and "your hands are cut off" would then be about
      // a part of the picture they cannot see.
      if (video.videoWidth && video.videoHeight) {
        setAspect(video.videoWidth / video.videoHeight);
      }

      detectorRef.current = await createDetector();

      frontRef.current = null;
      burstRef.current = [];
      stableRef.current = 0;
      setPhaseBoth("front");
      beginLoop(video, detectorRef.current, finishPose);
    } catch (err) {
      stop();
      setAspect(null);
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
  }, [setPhaseBoth, stop, speaker]);

  const active = phase === "front" || phase === "side";
  // While the camera is on (or starting) the frame takes the shape of the
  // picture. Every other state is ordinary content that grows to fit: a fixed
  // box clipped the instruction list and the Start button on a phone.
  const cameraOn = active || phase === "loading";

  // Starting the camera shrinks the frame from the tall instruction list to the
  // camera shape, so bring it back into view.
  const frameRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (cameraOn) frameRef.current?.scrollIntoView({ block: "center" });
  }, [cameraOn, aspect]);

  return (
    <div className="overflow-hidden rounded-3xl bg-ink-950 ring-1 ring-white/10">
      <div
        ref={frameRef}
        className={cn(
          "relative mx-auto w-full",
          // Until the picture is playing there is no shape to match yet.
          cameraOn && !aspect && "aspect-[3/4] sm:aspect-[4/3]"
        )}
        style={
          cameraOn && aspect
            ? {
                aspectRatio: aspect,
                // Never taller than the screen, or the bottom of the frame
                // (where the instruction sits) is off the page.
                width: `min(100%, calc((100dvh - 9rem) * ${aspect}))`,
              }
            : undefined
        }
      >
        <video
          ref={videoRef}
          playsInline
          muted
          // Mirrored so moving left on screen matches moving left in the room.
          className={cn(
            "size-full scale-x-[-1] object-cover",
            active ? "opacity-100" : "opacity-0",
            // Kept mounted so the stream can attach, but out of the layout.
            !cameraOn && "pointer-events-none absolute inset-0"
          )}
        />

        {active ? (
          <ScanOverlay
            pose={phase === "front" ? "front" : "side"}
            issues={issues}
            progress={progress}
          />
        ) : null}

        {/* Non-camera states */}
        {!active ? (
          <div
            className={cn(
              "grid place-items-center p-6 text-center",
              phase === "loading"
                ? "absolute inset-0"
                : "relative min-h-72 sm:p-8"
            )}
          >
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
                <ol className="mx-auto mt-4 max-w-md space-y-2.5 text-left">
                  {PREP_STEPS.map((step, i) => (
                    <li key={step} className="flex gap-3 text-base leading-snug text-white sm:text-lg">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-500 text-sm font-black text-white">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/60">
                  Nothing is uploaded: the camera is read on your phone and the
                  frames are discarded.
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

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/10 px-4 py-3">
        <p className="w-full text-xs text-white/50 sm:w-auto sm:flex-1">
          Estimates only. Your tailor confirms with a tape.
        </p>
        {speechSupported ? (
          <button
            type="button"
            onClick={() => setVoiceOn((v) => !v)}
            aria-pressed={voiceOn}
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/20"
          >
            {voiceOn ? (
              <Volume2 aria-hidden className="size-4" />
            ) : (
              <VolumeX aria-hidden className="size-4" />
            )}
            Voice {voiceOn ? "on" : "off"}
          </button>
        ) : null}
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
