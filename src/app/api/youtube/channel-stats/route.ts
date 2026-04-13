import { NextResponse } from 'next/server';
import { getConfig } from '@/utils/cms';

export const dynamic = 'force-dynamic';

const CHANNEL_STATS_CACHE_TTL_MS = 10 * 60 * 1000;

type ChannelStatsPayload = {
  title: string;
  description: string;
  channelUrl: string;
  subscriberCountText: string;
  viewCountText: string;
  videoCountText: string;
  totalViews: number | null;
  totalViewsText: string;
};

let cachedChannelStats: ChannelStatsPayload | null = null;
let cachedChannelStatsExpiresAt = 0;

function formatCompactCount(value?: string) {
  const numericValue = Number(value ?? '0');

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(numericValue);
}

function formatExactCount(value?: string | number) {
  const numericValue = Number(value ?? '0');

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  return new Intl.NumberFormat('en-US').format(numericValue);
}

function buildFallbackPayload(channelUrl: string): ChannelStatsPayload {
  return {
    title: "Aurora's Eye Films on YouTube",
    description: 'Subscribe for documentaries, field notes, premieres, and story-led films from Auroville and beyond.',
    channelUrl,
    subscriberCountText: 'Growing audience',
    viewCountText: '1M+',
    videoCountText: '50+',
    totalViews: null,
    totalViewsText: '1,700,000',
  };
}

function getChannelIdFromUrl(channelUrl: string) {
  const match = channelUrl.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

async function resolveChannelId(apiKey: string, query: string) {
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('type', 'channel');
  searchUrl.searchParams.set('maxResults', '1');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('key', apiKey);

  const response = await fetch(searchUrl.toString(), { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Unable to resolve channel id');
  }

  const data = await response.json();
  return data.items?.[0]?.id?.channelId as string | undefined;
}

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const config = await getConfig();
  const channelUrl = config?.contact?.youtube || 'https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw';
  const fallbackPayload = buildFallbackPayload(channelUrl);

  if (cachedChannelStats && Date.now() < cachedChannelStatsExpiresAt) {
    return NextResponse.json(cachedChannelStats);
  }

  if (!apiKey) {
    return NextResponse.json(fallbackPayload);
  }

  try {
    const channelId = getChannelIdFromUrl(channelUrl) ?? await resolveChannelId(apiKey, 'Aurora Eye Films');

    if (!channelId) {
      throw new Error('Channel not found');
    }

    const statsUrl = new URL('https://www.googleapis.com/youtube/v3/channels');
    statsUrl.searchParams.set('part', 'snippet,statistics');
    statsUrl.searchParams.set('id', channelId);
    statsUrl.searchParams.set('key', apiKey);

    const response = await fetch(statsUrl.toString(), { cache: 'no-store' });

    if (!response.ok) {
      throw new Error('Unable to fetch channel stats');
    }

    const data = await response.json();
    const channel = data.items?.[0];
    const rawViewCount = Number(channel?.statistics?.viewCount ?? '0');

    const payload = {
      title: channel?.snippet?.title ?? "Aurora's Eye Films on YouTube",
      description:
        channel?.snippet?.description?.slice(0, 160) ||
        'Subscribe for documentaries, field notes, premieres, and story-led films from Auroville and beyond.',
      channelUrl,
      subscriberCountText: formatCompactCount(channel?.statistics?.subscriberCount) ?? 'Growing audience',
      viewCountText: formatCompactCount(channel?.statistics?.viewCount) ?? 'Active viewership',
      videoCountText: formatCompactCount(channel?.statistics?.videoCount) ?? 'New stories',
      totalViews: Number.isFinite(rawViewCount) && rawViewCount > 0 ? rawViewCount : null,
      totalViewsText: formatExactCount(channel?.statistics?.viewCount) ?? '1,700,000',
    };

    cachedChannelStats = payload;
    cachedChannelStatsExpiresAt = Date.now() + CHANNEL_STATS_CACHE_TTL_MS;

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Failed to fetch YouTube channel stats:', error);

    if (cachedChannelStats) {
      return NextResponse.json(cachedChannelStats);
    }

    return NextResponse.json(fallbackPayload);
  }
}