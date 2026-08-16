import "server-only";

/**
 * Telegram lead notifications.
 *
 * Every booking, claim and suggestion pings the owner's Telegram immediately.
 * A lead nobody sees is worse than no lead form at all — a customer who asked
 * for a visit and heard nothing back is a customer lost twice.
 *
 * Setup:
 *   1. Message @BotFather on Telegram, /newbot, copy the token.
 *   2. Send your new bot any message, then open
 *      https://api.telegram.org/bot<TOKEN>/getUpdates and copy result[0].message.chat.id
 *   3. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.
 *
 * Without those env vars this no-ops silently, so local dev and previews don't
 * spam the channel.
 */

const API_BASE = "https://api.telegram.org";

/** Telegram's HTML parse mode only needs these three escaped. */
function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

/**
 * Fire-and-forget send. Never throws — a notification failure must not turn a
 * successfully saved lead into an error for the customer.
 */
export async function sendTelegram(html: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    if (process.env.NODE_ENV === "development") {
      console.info("[telegram] not configured — would have sent:\n", html);
    }
    return false;
  }

  try {
    const res = await fetch(`${API_BASE}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: html,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      // Don't let a hanging Telegram call hold the serverless function open.
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[telegram] send failed", res.status, body.slice(0, 300));
      return false;
    }
    return true;
  } catch (error) {
    console.error("[telegram] send threw", error);
    return false;
  }
}

type BookingPayload = {
  type: string;
  name: string;
  phone: string;
  storeName: string;
  storeHref: string;
  preferredDate: Date | null;
  preferredSlot: string | null;
  serviceWanted: string | null;
  notes: string | null;
  source: string | null;
};

export function bookingMessage(b: BookingPayload, siteUrl: string): string {
  const kind = b.type === "HOME" ? "🏠 HOME VISIT" : "🏪 STORE VISIT";
  const when = b.preferredDate
    ? b.preferredDate.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "No date given";

  return [
    `<b>${kind} REQUEST</b>`,
    ``,
    `<b>Shop:</b> ${esc(b.storeName)}`,
    `<b>Customer:</b> ${esc(b.name)}`,
    `<b>Phone:</b> <code>${esc(b.phone)}</code>`,
    `<b>When:</b> ${esc(when)}${b.preferredSlot ? ` (${esc(b.preferredSlot)})` : ""}`,
    b.serviceWanted ? `<b>Wants:</b> ${esc(b.serviceWanted)}` : null,
    b.notes ? `<b>Notes:</b> ${esc(b.notes)}` : null,
    ``,
    `<a href="${esc(siteUrl)}${esc(b.storeHref)}">View listing</a> · <a href="${esc(siteUrl)}/admin/leads">Admin</a>`,
  ]
    .filter(Boolean)
    .join("\n");
}

type ClaimPayload = {
  name: string;
  phone: string;
  email: string | null;
  role: string | null;
  message: string | null;
  storeName: string;
  matched: boolean;
};

export function claimMessage(c: ClaimPayload, siteUrl: string): string {
  return [
    `<b>🏷️ LISTING CLAIM${c.matched ? "" : " (UNMATCHED)"}</b>`,
    ``,
    `<b>Shop:</b> ${esc(c.storeName)}`,
    `<b>From:</b> ${esc(c.name)}${c.role ? ` (${esc(c.role)})` : ""}`,
    `<b>Phone:</b> <code>${esc(c.phone)}</code>`,
    c.email ? `<b>Email:</b> ${esc(c.email)}` : null,
    c.message ? `<b>Message:</b> ${esc(c.message)}` : null,
    ``,
    `<a href="${esc(siteUrl)}/admin/claims">Review in admin</a>`,
  ]
    .filter(Boolean)
    .join("\n");
}

type SuggestionPayload = {
  name: string;
  category: string;
  city: string;
  locality: string | null;
  phone: string | null;
  notes: string | null;
};

export function suggestionMessage(
  s: SuggestionPayload,
  siteUrl: string
): string {
  return [
    `<b>💡 SHOP SUGGESTION</b>`,
    ``,
    `<b>Name:</b> ${esc(s.name)}`,
    `<b>Type:</b> ${esc(s.category)}`,
    `<b>Where:</b> ${esc([s.locality, s.city].filter(Boolean).join(", "))}`,
    s.phone ? `<b>Phone:</b> <code>${esc(s.phone)}</code>` : null,
    s.notes ? `<b>Notes:</b> ${esc(s.notes)}` : null,
    ``,
    `<a href="${esc(siteUrl)}/admin/suggestions">Review in admin</a>`,
  ]
    .filter(Boolean)
    .join("\n");
}
