import { NextResponse } from 'next/server';

const SOCIAL_STATS_CACHE_TTL_MS = 10 * 60 * 1000;
const socialStatsCache = new Map<string, { expiresAt: number; statisticsById: Map<string, any> }>();

type StatsRequestItem = {
  id: number;
  youtubeUrl?: string;
  facebookUrl?: string;
};

function getYouTubeVideoId(url: string) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace('www.', '');

    if (hostname === 'youtu.be') {
      return parsedUrl.pathname.slice(1) || null;
    }

    if (hostname.includes('youtube.com')) {
      if (parsedUrl.pathname.startsWith('/shorts/')) {
        return parsedUrl.pathname.split('/shorts/')[1]?.split('/')[0] || null;
      }

      if (parsedUrl.pathname.startsWith('/embed/')) {
        return parsedUrl.pathname.split('/embed/')[1]?.split('/')[0] || null;
      }

      return parsedUrl.searchParams.get('v');
    }

    return null;
  } catch {
    return null;
  }
}

function formatCompactNumber(value: number) {
  if (value >= 1_000_000) {
    return `${Math.round(value / 100_000) / 10}M`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 100) / 10}K`;
  }

  return `${value}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = (body?.items ?? []) as StatsRequestItem[];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const results: Record<number, { engagementText?: string; facebookText?: string; viewCount?: number }> = {};

    if (youtubeApiKey) {
      const youtubeIds = Array.from(
        new Set(
          items
            .map((item) => item.youtubeUrl)
            .filter((url): url is string => Boolean(url))
            .map((url) => getYouTubeVideoId(url))
            .filter((id): id is string => Boolean(id)),
        ),
      );

      if (youtubeIds.length > 0) {
        const sortedIds = [...youtubeIds].sort();
        const cacheKey = sortedIds.join(',');
        const cached = socialStatsCache.get(cacheKey);
        let statisticsById: Map<string, any>;

        if (cached && Date.now() < cached.expiresAt) {
          statisticsById = cached.statisticsById;
        } else {
          const youtubeResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${youtubeIds.join(',')}&key=${youtubeApiKey}`,
            { cache: 'no-store' },
          );

          if (!youtubeResponse.ok) {
            const errorBody = await youtubeResponse.text();
            console.error('YouTube social stats request failed:', youtubeResponse.status, errorBody);
            statisticsById = new Map();
          } else {
            const youtubeData = await youtubeResponse.json();
            statisticsById = new Map(
              (youtubeData.items ?? []).map((item: any) => [item.id, item.statistics]),
            );

            socialStatsCache.set(cacheKey, {
              statisticsById,
              expiresAt: Date.now() + SOCIAL_STATS_CACHE_TTL_MS,
            });
          }
        }

        for (const entry of items) {
          const youtubeId = entry.youtubeUrl ? getYouTubeVideoId(entry.youtubeUrl) : null;
          const stats = youtubeId ? statisticsById.get(youtubeId) : null;

          if (stats) {
            const views = Number(stats.viewCount ?? 0);
            const likes = Number(stats.likeCount ?? 0);
            results[entry.id] = {
              ...results[entry.id],
              viewCount: views,
              engagementText: `${formatCompactNumber(views)} views • ${formatCompactNumber(likes)} likes on YouTube`,
            };
          }
        }
      }
    }

    if (facebookAccessToken) {
      await Promise.all(
        items.map(async (entry) => {
          if (!entry.facebookUrl) {
            return;
          }

          const facebookResponse = await fetch(
            `https://graph.facebook.com/v22.0/?id=${encodeURIComponent(entry.facebookUrl)}&fields=engagement&access_token=${facebookAccessToken}`,
            { cache: 'no-store' },
          );

          if (!facebookResponse.ok) {
            return;
          }

          const facebookData = await facebookResponse.json();
          const engagement = facebookData.engagement;

          if (!engagement) {
            return;
          }

          const totalInteractions = Number(engagement.reaction_count ?? 0) + Number(engagement.comment_count ?? 0) + Number(engagement.share_count ?? 0);

          results[entry.id] = {
            ...results[entry.id],
            facebookText: `${formatCompactNumber(totalInteractions)} FB interactions`,
          };
        }),
      );
    }

    const payload = items.reduce<Record<number, { engagementText?: string; viewCount?: number }>>((accumulator, entry) => {
      const current = results[entry.id];

      if (current?.engagementText && current?.facebookText) {
        accumulator[entry.id] = {
          engagementText: `${current.engagementText} • ${current.facebookText}`,
          viewCount: current.viewCount,
        };
      } else if (current?.engagementText) {
        accumulator[entry.id] = {
          engagementText: current.engagementText,
          viewCount: current.viewCount,
        };
      } else if (current?.viewCount !== undefined) {
        accumulator[entry.id] = {
          viewCount: current.viewCount,
        };
      }

      return accumulator;
    }, {});

    return NextResponse.json({ stats: payload });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to fetch social stats',
        details: error.message || String(error),
      },
      { status: 500 },
    );
  }
}