import { okCached } from "@/lib/api";
import { getServices } from "@/lib/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;

  const services = await getServices(category);
  return okCached({ items: services }, 3600);
}
