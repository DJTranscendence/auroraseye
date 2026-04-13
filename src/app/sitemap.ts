import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://auroras-eye-films.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    "",
    "/documentaries",
    "/breaking-the-silence",
    "/karsha-nuns",
    "/matrimandir-and-i",
    "/team",
    "/news",
    "/contact",
    "/donations",
  ];

  return routes.map((route, index) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: index === 0 ? "daily" : "weekly",
    priority: index === 0 ? 1 : 0.7,
  }));
}
