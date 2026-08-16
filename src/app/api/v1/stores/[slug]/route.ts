import { fail, okCached } from "@/lib/api";
import { getSimilarStores, getStoreDetail } from "@/lib/queries";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/v1/stores/[slug]">
) {
  const { slug } = await params;

  const store = await getStoreDetail(slug);
  if (!store) return fail("Store not found.", 404);

  const similar = await getSimilarStores(store);
  return okCached({ store, similar });
}
