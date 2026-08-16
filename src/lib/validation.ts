import { z } from "zod";

// Indian mobile numbers, tolerant of +91, spaces and dashes.
const phone = z
  .string()
  .trim()
  .min(10, "Enter a valid phone number")
  .max(18)
  .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number");

const name = z.string().trim().min(2, "Please enter your name").max(80);

export const bookingSchema = z.object({
  storeId: z.string().min(1),
  type: z.enum(["STORE", "HOME"]).default("STORE"),
  name,
  phone,
  preferredDate: z.string().datetime().or(z.string().min(1)).nullish(),
  preferredSlot: z.string().max(40).nullish(),
  serviceWanted: z.string().max(200).nullish(),
  notes: z.string().max(1000).nullish(),
  source: z.string().max(100).nullish(),
});

export const claimSchema = z.object({
  storeSlug: z.string().trim().min(1, "Tell us which shop"),
  name,
  phone,
  email: z.email("Enter a valid email").nullish().or(z.literal("")),
  role: z.string().max(40).nullish(),
  message: z.string().max(1000).nullish(),
});

export const suggestionSchema = z.object({
  name: z.string().trim().min(2, "Shop name is required").max(120),
  category: z.enum(["tailors", "boutiques", "fabric-shops", "rental-shops"]),
  city: z.string().trim().min(2, "City is required").max(80),
  locality: z.string().max(80).nullish(),
  phone: phone.nullish().or(z.literal("")),
  address: z.string().max(400).nullish(),
  notes: z.string().max(1000).nullish(),
});

export const storeQuerySchema = z.object({
  city: z.string().optional(),
  category: z.string().optional(),
  locality: z.string().optional(),
  service: z.string().optional(),
  q: z.string().optional(),
  speciality: z.string().optional(),
  homeVisit: z.coerce.boolean().optional(),
  verifiedOnly: z.coerce.boolean().optional(),
  rateCardOnly: z.coerce.boolean().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  maxTurnaround: z.coerce.number().int().nonnegative().optional(),
  sort: z
    .enum(["relevance", "rating", "price_asc", "price_desc", "name"])
    .optional(),
  page: z.coerce.number().int().positive().optional(),
  perPage: z.coerce.number().int().positive().max(48).optional(),
});
