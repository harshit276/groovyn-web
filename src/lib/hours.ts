/**
 * Opening-hours reasoning for the shopfront status pill.
 *
 * Everything resolves in IST regardless of the visitor's own timezone — a
 * Delhi shop is open on Delhi time, and an NRI checking from London must not
 * be told the shutter is up at 3am local.
 *
 * Hours arrive as Record<"mon".."sun", "10:00-20:00" | "closed">. An absent
 * key means we never collected that day, which is NOT the same as closed —
 * callers must render "unknown" rather than implying a trading shop is shut.
 */

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export type OpenState =
  | { status: "open"; until: string }
  | { status: "closing-soon"; until: string; minutesLeft: number }
  | { status: "closed"; opensAt: string | null; opensDay: string | null }
  | { status: "unknown" };

/** Minutes since midnight, or null if unparseable. */
function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** "18:30" → "6:30 pm" */
export function prettyTime(hhmm: string): string {
  const mins = toMinutes(hhmm);
  if (mins == null) return hhmm;
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Current IST weekday index (0=sun) and minutes since IST midnight. */
function nowInIST(now: Date): { day: number; minutes: number } {
  // en-CA gives ISO-ordered parts, so this parses predictably.
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = fmt.formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");

  const day = DAY_KEYS.indexOf(
    weekday.slice(0, 3).toLowerCase() as (typeof DAY_KEYS)[number]
  );

  // Intl can emit "24" for midnight in some engines; fold it back to 0.
  return { day: day < 0 ? 0 : day, minutes: (hour % 24) * 60 + minute };
}

const DAY_NAMES: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export function getOpenState(
  hours: Record<string, string>,
  now: Date = new Date(),
  closingSoonMins = 60
): OpenState {
  if (!hours || Object.keys(hours).length === 0) return { status: "unknown" };

  const { day, minutes } = nowInIST(now);
  const todayKey = DAY_KEYS[day];
  const today = hours[todayKey];

  if (today && today !== "closed") {
    const [rawOpen, rawClose] = today.split("-");
    const open = rawOpen ? toMinutes(rawOpen) : null;
    const close = rawClose ? toMinutes(rawClose) : null;

    if (open != null && close != null) {
      // Past-midnight closing ("18:00-01:00") wraps around.
      const wraps = close <= open;
      const isOpen = wraps
        ? minutes >= open || minutes < close
        : minutes >= open && minutes < close;

      if (isOpen) {
        const left = wraps && minutes >= open
          ? 24 * 60 - minutes + close
          : close - minutes;
        return left <= closingSoonMins
          ? { status: "closing-soon", until: prettyTime(rawClose), minutesLeft: left }
          : { status: "open", until: prettyTime(rawClose) };
      }

      // Before opening today.
      if (!wraps && minutes < open) {
        return { status: "closed", opensAt: prettyTime(rawOpen), opensDay: null };
      }
    }
  }

  // Find the next day with real hours, up to a week ahead.
  for (let i = 1; i <= 7; i++) {
    const key = DAY_KEYS[(day + i) % 7];
    const val = hours[key];
    if (!val || val === "closed") continue;
    const openStr = val.split("-")[0];
    if (!openStr || toMinutes(openStr) == null) continue;
    return {
      status: "closed",
      opensAt: prettyTime(openStr),
      opensDay: i === 1 ? "tomorrow" : DAY_NAMES[key] ?? key,
    };
  }

  return { status: "closed", opensAt: null, opensDay: null };
}
