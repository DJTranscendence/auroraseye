import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
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
