/**
 * Spoken guidance for the body scan.
 *
 * The person being scanned is three metres from the phone with their arms out.
 * They cannot read the screen, and they should not have to — the instruction
 * has to reach them as sound. This wraps the browser's own speech synthesis,
 * so there is no dependency, no network call and no cost.
 *
 * Two rules keep it from becoming a nag:
 *
 *   - The same line is never repeated back-to-back. Guidance that loops every
 *     frame is worse than silence.
 *   - A minimum gap between utterances, so a wobbling pose does not produce
 *     a stream of half-spoken corrections.
 *
 * Priority lets "hold still" interrupt a queued correction, because by the
 * time a correction finishes speaking the pose may already be right.
 */

const MIN_GAP_MS = 2200;

type Speaker = {
  say: (text: string, opts?: { priority?: boolean; force?: boolean }) => void;
  stop: () => void;
  /** iOS will not speak unless the first call happens inside a user gesture. */
  prime: () => void;
  setMuted: (muted: boolean) => void;
  isSupported: boolean;
};

export function createSpeaker(): Speaker {
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  let lastText = "";
  let lastAt = 0;
  let muted = false;
  let primed = false;

  function pickVoice(): SpeechSynthesisVoice | null {
    if (!supported) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    // Prefer an Indian English voice, then any English one, then whatever
    // the device offers.
    return (
      voices.find((v) => v.lang === "en-IN") ??
      voices.find((v) => v.lang?.startsWith("en")) ??
      voices[0]
    );
  }

  function speak(text: string, priority: boolean) {
    if (!supported || muted) return;
    const synth = window.speechSynthesis;
    if (priority) synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-IN";
    }
    // Slightly slow and loud: the listener is across the room.
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    synth.speak(utterance);
  }

  return {
    isSupported: supported,

    prime() {
      if (!supported || primed) return;
      primed = true;
      // A silent utterance unlocks synthesis on iOS Safari, which otherwise
      // ignores every later speak() that is not inside a gesture.
      const u = new SpeechSynthesisUtterance("");
      u.volume = 0;
      window.speechSynthesis.speak(u);
      // Voices load asynchronously on some browsers; touching the list here
      // means one is ready by the time the first real line is spoken.
      window.speechSynthesis.getVoices();
    },

    say(text, opts) {
      if (!supported || muted || !text) return;
      const now = Date.now();
      const force = opts?.force ?? false;

      if (!force) {
        if (text === lastText && now - lastAt < 6000) return;
        if (now - lastAt < MIN_GAP_MS) return;
      }

      // Never queue a correction behind one still being spoken: by the time it
      // plays the pose has usually changed, and a stale instruction is worse
      // than none. Priority lines cancel whatever is playing instead.
      if (!opts?.priority && !force && window.speechSynthesis.speaking) return;

      lastText = text;
      lastAt = now;
      speak(text, opts?.priority ?? false);
    },

    stop() {
      if (!supported) return;
      window.speechSynthesis.cancel();
      lastText = "";
      lastAt = 0;
    },

    setMuted(next) {
      muted = next;
      if (next && supported) window.speechSynthesis.cancel();
    },
  };
}

/**
 * One entry per instruction the scanner can give.
 *
 * `big` is the two-or-three-word command shown at poster size on screen, which
 * is the only thing readable from across a room. `spoken` is what the voice says.
 * The full written sentence stays on screen beneath `big` as the explanation.
 * Both are keyed by the exact string `body-scan.ts` produces.
 */
const ISSUE_COPY: Record<string, { big: string; spoken: string }> = {
  "Stand so your whole body — head to feet — is in frame.": {
    big: "Step back",
    spoken: "Step back. I need to see you head to toe.",
  },
  "Move into the frame.": { big: "Step in", spoken: "Step into the frame." },
  "Your head is cut off — move back or tilt the phone down.": {
    big: "Step back",
    spoken: "Your head is cut off. Move back.",
  },
  "Your feet are cut off — move back.": {
    big: "Step back",
    spoken: "Your feet are cut off. Move back.",
  },
  "Move closer — you're too small in the frame.": {
    big: "Come closer",
    spoken: "Come closer.",
  },
  "Move back a little.": { big: "Back a bit", spoken: "Move back a little." },
  "Turn to face the camera straight on.": {
    big: "Face me",
    spoken: "Turn and face the camera.",
  },
  "Turn fully sideways — one shoulder to the camera.": {
    big: "Turn sideways",
    spoken: "Turn sideways. One shoulder to the camera.",
  },
  "Hold your arms away from your body, about 30°.": {
    big: "Arms out",
    spoken: "Arms out, away from your body.",
  },
  "Raise both arms straight overhead.": {
    big: "Arms up",
    spoken: "Raise both arms over your head.",
  },
  "Stand upright — don't lean.": {
    big: "Stand tall",
    spoken: "Stand up straight. Don't lean.",
  },
  "Step into the frame.": { big: "Step in", spoken: "Step into the frame." },
  "Hold completely still.": {
    big: "Stand still",
    spoken: "Hold completely still.",
  },
};

/**
 * Shortens a written instruction for speech.
 *
 * On-screen text can carry a clause of explanation; spoken guidance must be
 * one short imperative or it arrives after the moment has passed.
 */
export function toSpoken(issue: string): string {
  return ISSUE_COPY[issue]?.spoken ?? issue;
}

/**
 * The poster-size command for an instruction, or `null` for a sentence we have no
 * short form for, in which case the screen shows the sentence itself.
 */
export function toBig(issue: string): string | null {
  return ISSUE_COPY[issue]?.big ?? null;
}
