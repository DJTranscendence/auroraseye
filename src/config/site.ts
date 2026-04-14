/**
 * Canonical public origin for metadata, sitemap, and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL in Vercel (Production) to the live domain.
 * On Vercel previews, VERCEL_URL is used when NEXT_PUBLIC_SITE_URL is unset.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "").replace(/\/$/, "");
    return `https://${host}`;
  }
  return "https://auroras-eye-films.vercel.app";
}
