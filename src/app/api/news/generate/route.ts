import { NextResponse } from 'next/server';
import { isAuroraEyeRelatedStory, upsertGeneratedNews } from '@/utils/cms';

type ParsedRssItem = {
  title: string;
  summary: string;
  url: string;
  source: string;
  image: string;
  publishedAt: string;
  tags: string[];
};

const NEWS_ARTICLES_PAGE_URL = 'https://auroraseyefilms.com/news-articles/';

const GOOGLE_NEWS_RSS_BASE = 'https://news.google.com/rss/search?q=';
const GOOGLE_NEWS_RSS_TAIL = '&hl=en-IN&gl=IN&ceid=IN:en';

const GOOGLE_NEWS_QUERIES = [
  {
    query:
      '("Aurora\'s Eye" OR "Auroras Eye" OR "Aurora Eye Films" OR auroraeyefilms OR auroraseyefilms.com) AND (Auroville OR documentary OR film OR filmmaking)',
    tags: ['auroras-eye', 'auroville', 'documentary'],
  },
  {
    query: '("Serena Aurora" AND Auroville) OR ("Aurora\'s Eye" AND Matrimandir) OR "Matrimandir and I"',
    tags: ['serena-aurora', 'matrimandir'],
  },
  {
    query: '"Karsha Nuns" OR "Breaking the Silence" OR ("Aurora Eye" AND documentary)',
    tags: ['project', 'documentary'],
  },
  {
    query:
      '("Auroville Film Festival" OR "Siding Film Festival" OR "Kobani Film Festival" OR "Qinling Mountains Film Festival" OR "Bharat International Film Festival" OR "Vianatur Environmental Film Festival" OR "Quinine Mountain Film Festival") AND ("Aurora\'s Eye" OR "Aurora Eye Films" OR auroraseyefilms)',
    tags: ['festival', 'awards'],
  },
  {
    query:
      '"30 Years of Harmony" OR "A Clay Connect" OR "Clay Connect" OR "Matrimandir and I" OR "Morning Star" OR "Rainbow School Zanskar" OR "Ladakh through the eyes of a motorcycle"',
    tags: ['projects', 'awards'],
  },
  {
    query: '"Auroville Choir" OR "Mandala Pottery" OR "Matrimandir" OR "Zanskar" OR "Ladakh"',
    tags: ['auroville', 'community'],
  },
];

const buildGoogleNewsUrl = (query: string) =>
  `${GOOGLE_NEWS_RSS_BASE}${encodeURIComponent(query)}${GOOGLE_NEWS_RSS_TAIL}`;

const FEEDS = GOOGLE_NEWS_QUERIES.map((item) => ({
  url: buildGoogleNewsUrl(item.query),
  tags: item.tags,
}));

function decodeEntities(value: string) {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripHtml(value: string) {
  return decodeEntities(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseItemTag(item: string, tag: string) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match?.[1]?.trim() ?? '';
}


function sourceFromUrl(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return hostname;
  } catch {
    return 'Unknown source';
  }
}

function normalizeHref(value: string) {
  const decoded = decodeEntities(value).trim();

  if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
    return decoded;
  }

  if (decoded.startsWith('/')) {
    return `https://auroraseyefilms.com${decoded}`;
  }

  return decoded;
}

function parseRss(xml: string, tags: string[]) {
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  const parsed: ParsedRssItem[] = [];

  for (const item of itemBlocks) {
    const rawTitle = parseItemTag(item, 'title');
    const rawLink = parseItemTag(item, 'link');
    const rawDescription = parseItemTag(item, 'description');
    const rawDate = parseItemTag(item, 'pubDate');
    const rawSource = parseItemTag(item, 'source');

    const title = stripHtml(rawTitle);
    const url = decodeEntities(rawLink);
    const summary = stripHtml(rawDescription).slice(0, 220);
    const publishedAt = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();

    if (!title || !url) {
      continue;
    }

    const imageMatch = rawDescription.match(/<img[^>]+src=["']([^"']+)["']/i);
    const image = imageMatch?.[1] ?? '';

    parsed.push({
      title,
      summary,
      url,
      source: stripHtml(rawSource) || sourceFromUrl(url),
      image,
      publishedAt,
      tags,
    });
  }

  return parsed;
}

function parseNewsArticlesPage(html: string) {
  const parsed: ParsedRssItem[] = [];
  const blockPattern =
    /<h3 class="tdm-title tdm-title-md">([\s\S]*?)<\/h3>[\s\S]*?<p class="tdm-descr td-fix-index">([\s\S]*?)<\/p>[\s\S]*?<a[^>]+href="([^"]+)"[^>]+title="(View Article|Watch film)"[\s\S]*?data-img-url="([^"]*)"/gi;

  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(html)) !== null) {
    const title = stripHtml(match[1] ?? '');
    const summary = stripHtml(match[2] ?? '').slice(0, 260);
    const actionUrl = normalizeHref(match[3] ?? '');
    const image = normalizeHref(match[5] ?? '');

    if (!title || !actionUrl) {
      continue;
    }

    parsed.push({
      title,
      summary,
      url: actionUrl,
      source: "Aurora's Eye News Articles",
      image,
      publishedAt: new Date().toISOString(),
      tags: ['aurora eye films', 'auroville', 'news-articles'],
    });
  }

  return parsed;
}


export async function POST() {
  try {
    const collected: ParsedRssItem[] = [];

    for (const feed of FEEDS) {
      try {
        const response = await fetch(feed.url, { cache: 'no-store' });

        if (!response.ok) {
          continue;
        }

        const xml = await response.text();
        collected.push(...parseRss(xml, feed.tags));
      } catch {
        continue;
      }
    }

    try {
      const newsArticlesResponse = await fetch(NEWS_ARTICLES_PAGE_URL, { cache: 'no-store' });

      if (newsArticlesResponse.ok) {
        const newsArticlesHtml = await newsArticlesResponse.text();
        collected.push(...parseNewsArticlesPage(newsArticlesHtml));
      }
    } catch {
      // No-op: generator still returns RSS-only results.
    }


    const relevant = collected.filter((item) => isAuroraEyeRelatedStory(item));
    const deduped = Array.from(new Map(relevant.map((item) => [item.url, item])).values());
    const result = await upsertGeneratedNews(deduped);

    return NextResponse.json({
      success: true,
      scanned: collected.length,
      relevant: relevant.length,
      unique: deduped.length,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate news',
        details: error.message || String(error),
      },
      { status: 500 },
    );
  }
}
