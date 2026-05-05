import fs from 'fs';
import path from 'path';

const newsPath = path.join(process.cwd(), 'src/data/news.json');

function normalizeYouTubeUrl(url: string) {
  try {
    const parsed = new URL(url);
    let videoId = '';

    if (parsed.hostname.includes('youtu.be')) {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.searchParams.has('v')) {
      videoId = parsed.searchParams.get('v') ?? '';
    } else if (parsed.pathname.includes('/embed/')) {
      videoId = parsed.pathname.split('/embed/')[1].split(/[?#]/)[0];
    } else if (parsed.pathname.includes('/v/')) {
       videoId = parsed.pathname.split('/v/')[1].split(/[?#]/)[0];
    } else if (parsed.pathname.includes('/watch/')) {
       videoId = parsed.pathname.split('/watch/')[1].split(/[?#]/)[0];
    }

    if (videoId) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
  } catch {}
  return url;
}

function dedupe() {
  if (!fs.existsSync(newsPath)) return;
  const raw = fs.readFileSync(newsPath, 'utf-8');
  const news = JSON.parse(raw);
  
  const map = new Map();
  
  // Sort by updatedAt descending to keep the freshest/most complete version
  news.sort((a: any, b: any) => {
    const da = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const db = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return db - da;
  });

  for (const item of news) {
    const key = normalizeYouTubeUrl(item.url || item.title);
    if (!map.has(key)) {
      map.set(key, item);
    }
  }

  const result = Array.from(map.values());
  fs.writeFileSync(newsPath, JSON.stringify(result, null, 2));
  console.log(`Deduped from ${news.length} to ${result.length} items.`);
}

dedupe();
