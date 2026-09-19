/**
 * Store imagery resolution.
 *
 * A StoreImage.url is either a file we host (a normal path or URL) or a
 * reference to a Google Places photo, written as "gplaces:places/…/photos/…".
 * Places photos may not be re-hosted, so a reference is resolved to our proxy
 * route at render time rather than downloaded.
 */

export const GPLACES_PREFIX = "gplaces:";

export function isPlacesRef(url: string | null | undefined): boolean {
  return !!url && url.startsWith(GPLACES_PREFIX);
}

/**
 * Turns a stored value into something an <img> can load.
 *
 * `width` should be the largest size the slot actually renders — it snaps to a
 * fixed ladder server-side, and each distinct size is a billable fetch.
 */
export function resolveStoreImage(
  url: string | null | undefined,
  width = 800
): string | null {
  if (!url) return null;
  if (!isPlacesRef(url)) return url;

  const ref = url.slice(GPLACES_PREFIX.length);
  return `/api/places/photo?ref=${encodeURIComponent(ref)}&w=${width}`;
}
