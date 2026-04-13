import { NextResponse } from "next/server";
import { getConfig } from "@/utils/cms";

const LATEST_UPLOAD_CACHE_TTL_MS = 10 * 60 * 1000;
let cachedLatestUpload: {
  title: string;
  subtitle: string;
  image: string;
  videoUrl: string;
  engagementText: string;
} | null = null;
let cachedLatestUploadExpiresAt = 0;

function formatCompactNumber(value: number) {
  if (!Number.isFinite(value) || value <= 0) return null;
  if (value >= 1_000_000) return `${Math.round(value / 100_000) / 10}M`;
  if (value >= 1_000) return `${Math.round(value / 100) / 10}K`;
  return `${Math.round(value)}`;
}

function formatExactNumber(value: number) {
  if (!Number.isFinite(value) || value <= 0) return null;
  return new Intl.NumberFormat("en-US").format(value);
}

function extractChannelId(channelUrl: string) {
  const match = channelUrl.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

function extractLatestVideoIdFromFeed(xml: string) {
  const match = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
  return match?.[1]?.trim() ?? null;
}

function extractVideoIdsFromFeed(xml: string) {
  // RSS/Atom feeds include multiple entries; pull them in order so we can validate availability.
  // We intentionally return a small ordered set (newest-first) to avoid extra complexity.
  const matches = Array.from(xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g));
  return matches.map((m) => m[1]?.trim()).filter((v): v is string => Boolean(v)).slice(0, 10);
}

async function fetchLatestFromRss(channelId: string) {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
  const response = await fetch(feedUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to fetch RSS feed");
  }
  const xml = await response.text();

  const videoIds = extractVideoIdsFromFeed(xml);
  if (videoIds.length === 0) {
    throw new Error("No video id in feed");
  }

  // Validate newest-first by probing oEmbed.
  for (const vid of videoIds) {
    const videoUrl = `https://www.youtube.com/watch?v=${vid}`;
    const oembed = await fetchOembed(videoUrl);
    if (oembed && !("error" in oembed) && (oembed.title || oembed.thumbnail_url)) {
      return vid;
    }
  }

  // If none validate, just return the newest id; the caller will fall back to fallback video.
  return videoIds[0];
}

async function fetchOembed(videoUrl: string) {
  const oembedUrl = new URL("https://www.youtube.com/oembed");
  oembedUrl.searchParams.set("url", videoUrl);
  oembedUrl.searchParams.set("format", "json");

  const response = await fetch(oembedUrl.toString(), { cache: "no-store" });
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as any;
}

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const config = await getConfig();
  const channelUrl =
    config?.contact?.youtube || "https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw";

  const fallback = {
    title: "Latest upload",
    subtitle: "New video from Aurora's Eye Films",
    image: "",
    videoUrl: channelUrl,
    engagementText: "",
  };

  if (cachedLatestUpload && Date.now() < cachedLatestUploadExpiresAt) {
    return NextResponse.json(cachedLatestUpload);
  }

  try {
    let channelId = extractChannelId(channelUrl);

    // If we don't have a channelId, we can't use RSS. We'll only be able to use the Data API search
    // (which needs an API key). In that case, return fallback.
    if (!channelId && !apiKey) {
      return NextResponse.json(fallback);
    }

    // Prefer RSS feed for latest id even when API key is available; this avoids expensive search quota usage.
    if (channelId) {
      let videoId: string | null = null;

      try {
        videoId = await fetchLatestFromRss(channelId);
      } catch (rssError) {
        console.warn("RSS fetch for latest upload failed, falling back to Data API:", rssError);
      }

      if (videoId) {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const oembed = await fetchOembed(videoUrl);

        if (!apiKey) {
          const payload = {
            title: oembed?.title ?? "Latest upload",
            subtitle: "New video from Aurora's Eye Films",
            image: oembed?.thumbnail_url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            videoUrl,
            engagementText: "",
          };

          cachedLatestUpload = payload;
          cachedLatestUploadExpiresAt = Date.now() + LATEST_UPLOAD_CACHE_TTL_MS;

          return NextResponse.json(payload);
        }

        const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
        videosUrl.searchParams.set("part", "snippet,statistics,status");
        videosUrl.searchParams.set("id", videoId);
        videosUrl.searchParams.set("key", apiKey);

        const videosResponse = await fetch(videosUrl.toString(), { cache: "no-store" });
        if (!videosResponse.ok) {
          const payload = {
            title: oembed?.title ?? "Latest upload",
            subtitle: "New video from Aurora's Eye Films",
            image: oembed?.thumbnail_url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            videoUrl,
            engagementText: "",
          };

          cachedLatestUpload = payload;
          cachedLatestUploadExpiresAt = Date.now() + LATEST_UPLOAD_CACHE_TTL_MS;

          return NextResponse.json(payload);
        }

        const videosData = await videosResponse.json();
        const chosen = videosData.items?.[0];

        const title = chosen?.snippet?.title ?? oembed?.title ?? "Latest upload";
        const description = chosen?.snippet?.description ?? "";
        const subtitle = (() => {
          const cleaned = description.replace(/\s+/g, " ").trim();
          if (!cleaned) return "New video from Aurora's Eye Films";
          return cleaned.length > 90 ? `${cleaned.slice(0, 90)}...` : cleaned;
        })();

        const image =
          chosen?.snippet?.thumbnails?.maxres?.url ??
          chosen?.snippet?.thumbnails?.high?.url ??
          chosen?.snippet?.thumbnails?.medium?.url ??
          oembed?.thumbnail_url ??
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        const stats = chosen?.statistics;
        const views = Number(stats?.viewCount ?? 0);
        const likes = Number(stats?.likeCount ?? 0);
        const viewsCompact = formatCompactNumber(views);
        const likesCompact = formatCompactNumber(likes);
        const likesPart = likesCompact ? ` • ${likesCompact} likes on YouTube` : " • views on YouTube";
        const engagementText = viewsCompact ? `${viewsCompact} views${likesPart}` : "";

        const payload = {
          title,
          subtitle,
          image,
          videoUrl,
          engagementText,
        };

        cachedLatestUpload = payload;
        cachedLatestUploadExpiresAt = Date.now() + LATEST_UPLOAD_CACHE_TTL_MS;

        return NextResponse.json(payload);
      }
    }

    // With an API key, use the Data API and include view/like stats.
    if (!apiKey) return NextResponse.json(fallback);

    // Resolve channel id if `channelUrl` isn't a /channel/<id> link.
    if (!channelId) {
      const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
      searchUrl.searchParams.set("part", "snippet");
      searchUrl.searchParams.set("type", "channel");
      searchUrl.searchParams.set("maxResults", "1");
      searchUrl.searchParams.set("q", "Aurora Eye Films");
      searchUrl.searchParams.set("key", apiKey);

      const response = await fetch(searchUrl.toString(), { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to resolve channel id");
      const data = await response.json();
      channelId = (data.items?.[0]?.id?.channelId as string | undefined) ?? null;
    }

    if (!channelId) return NextResponse.json(fallback);

    // Ask for several newest candidates; we then validate embeddability via `videos.status.embeddable`.
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("channelId", channelId);
    searchUrl.searchParams.set("order", "date");
    searchUrl.searchParams.set("maxResults", "5");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("key", apiKey);

    const searchResponse = await fetch(searchUrl.toString(), { cache: "no-store" });
    if (!searchResponse.ok) throw new Error("Unable to fetch latest upload");

    const searchData = await searchResponse.json();
    const candidates = (searchData.items ?? []) as any[];

    const candidateIds = candidates
      .map((c) => c?.id?.videoId as string | undefined)
      .filter((v): v is string => Boolean(v))
      .slice(0, 10);

    if (candidateIds.length === 0) return NextResponse.json(fallback);

    const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    videosUrl.searchParams.set("part", "snippet,statistics,status");
    videosUrl.searchParams.set("id", candidateIds.join(","));
    videosUrl.searchParams.set("key", apiKey);

    const videosResponse = await fetch(videosUrl.toString(), { cache: "no-store" });
    if (!videosResponse.ok) throw new Error("Unable to fetch latest candidate video metadata");

    const videosData = await videosResponse.json();
    const videosById = new Map<string, any>(
      (videosData.items ?? []).map((item: any) => [item?.id as string, item]),
    );

    // Choose the first candidate that is embeddable/public.
    let chosenId: string | null = null;
    for (const cid of candidateIds) {
      const v = videosById.get(cid);
      const embeddable = v?.status?.embeddable;
      const privacyStatus = v?.status?.privacyStatus;
      if (embeddable === true && (privacyStatus === "public" || !privacyStatus)) {
        chosenId = cid;
        break;
      }
    }

    // If nothing is explicitly embeddable, fall back to the first candidate.
    if (!chosenId) chosenId = candidateIds[0];

    const chosen = videosById.get(chosenId);
    const videoId = chosenId;
    if (!chosen) return NextResponse.json(fallback);

    const title = chosen?.snippet?.title ?? "Latest upload";
    const description = chosen?.snippet?.description ?? "";
    const subtitle = (() => {
      const cleaned = description.replace(/\s+/g, " ").trim();
      if (!cleaned) return "New video from Aurora's Eye Films";
      return cleaned.length > 90 ? `${cleaned.slice(0, 90)}...` : cleaned;
    })();

    const image =
      chosen?.snippet?.thumbnails?.maxres?.url ??
      chosen?.snippet?.thumbnails?.high?.url ??
      chosen?.snippet?.thumbnails?.medium?.url ??
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const stats = chosen?.statistics;
    const views = Number(stats?.viewCount ?? 0);
    const likes = Number(stats?.likeCount ?? 0);
    const viewsCompact = formatCompactNumber(views);
    const likesCompact = formatCompactNumber(likes);
    const likesPart = likesCompact ? ` • ${likesCompact} likes on YouTube` : " • views on YouTube";
    const engagementText = viewsCompact ? `${viewsCompact} views${likesPart}` : "";

    const payload = {
      title,
      subtitle,
      image,
      videoUrl,
      engagementText,
    };

    cachedLatestUpload = payload;
    cachedLatestUploadExpiresAt = Date.now() + LATEST_UPLOAD_CACHE_TTL_MS;

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Failed to fetch latest upload:", error);

    if (cachedLatestUpload) {
      return NextResponse.json(cachedLatestUpload);
    }

    return NextResponse.json(fallback);
  }
}

