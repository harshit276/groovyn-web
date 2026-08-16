"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createSession,
  destroySession,
  isAuthenticated,
  verifyPassword,
} from "@/lib/auth";
import { db } from "@/lib/db";

export type LoginState = { error: string | null };

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return {
      error:
        "Admin is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET, then restart.",
    };
  }

  if (!verifyPassword(password)) {
    // Deliberately vague — don't confirm whether a password merely got close.
    return { error: "Incorrect password." };
  }

  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/** Every mutation re-checks the session — never trust that the layout guarded it. */
async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/admin/login");
}

const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "visited",
  "no_show",
  "cancelled",
] as const;

export async function updateBookingStatus(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !BOOKING_STATUSES.includes(status as (typeof BOOKING_STATUSES)[number])) {
    return;
  }

  await db.visitBooking.update({ where: { id }, data: { status } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

const CLAIM_STATUSES = ["pending", "contacted", "approved", "rejected"] as const;

export async function updateClaimStatus(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !CLAIM_STATUSES.includes(status as (typeof CLAIM_STATUSES)[number])) {
    return;
  }

  const claim = await db.claim.update({
    where: { id },
    data: { status },
    select: { storeId: true },
  });

  // Approving a claim is what actually hands the listing to the owner.
  if (status === "approved") {
    await db.store.update({
      where: { id: claim.storeId },
      data: { claimed: true },
    });
  }

  revalidatePath("/admin/claims");
  revalidatePath("/admin");
}

const SUGGESTION_STATUSES = ["pending", "reviewed", "added", "rejected"] as const;

export async function updateSuggestionStatus(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (
    !id ||
    !SUGGESTION_STATUSES.includes(status as (typeof SUGGESTION_STATUSES)[number])
  ) {
    return;
  }

  await db.storeSuggestion.update({ where: { id }, data: { status } });
  revalidatePath("/admin/suggestions");
  revalidatePath("/admin");
}
