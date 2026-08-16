import { fail, okCached } from "@/lib/api";
import { listStores } from "@/lib/queries";
import { storeQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = storeQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries())
  );

  if (!parsed.success) {
    return fail("Invalid query parameters.", 422, {
      issues: parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }

  const result = await listStores(parsed.data);
  return okCached(result);
}
