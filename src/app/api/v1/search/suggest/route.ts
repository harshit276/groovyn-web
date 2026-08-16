import { okCached } from "@/lib/api";
import { searchSuggest } from "@/lib/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  const results = await searchSuggest(q);
  return okCached(results, 60);
}
