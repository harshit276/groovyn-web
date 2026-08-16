import { okCached } from "@/lib/api";
import { getCities } from "@/lib/queries";

export async function GET() {
  const cities = await getCities();
  return okCached({ items: cities }, 3600);
}
