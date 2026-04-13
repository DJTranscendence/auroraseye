const categories = [
  ["Animals, National Parks & Environment", "https://auroraseyefilms.com/animals/"],
  ["Arts & Entertainment", "https://auroraseyefilms.com/arts/"],
  ["Auroville", "https://auroraseyefilms.com/auroville/"],
  ["Ayurveda", "https://auroraseyefilms.com/ayurveda/"],
  ["Brands", "https://auroraseyefilms.com/brands/"],
  ["Charity/Volunteer", "https://auroraseyefilms.com/charity-volunteer/"],
  ["Citizen’s Assembly", "https://auroraseyefilms.com/citizensassembly/"],
  ["Dreamweaving", "https://auroraseyefilms.com/dreamweaving/"],
  ["Eco Solutions & Recycle", "https://auroraseyefilms.com/recycling/"],
  ["Exploring Auroville’s Capacity to Flourish", "https://auroraseyefilms.com/flourish/"],
  ["Feature Documentaries", "https://auroraseyefilms.com/featuredocumentary/"],
  ["Global Ecovillage Network", "https://auroraseyefilms.com/global-ecovillage-network/"],
  ["Green Energy", "https://auroraseyefilms.com/green-energy/"],
  ["Intentional Communities & Ecovillages", "https://auroraseyefilms.com/communities-sustainability/"],
  ["Joy Of Impermanence", "https://auroraseyefilms.com/joi/"],
  ["Natural Buildings", "https://auroraseyefilms.com/naturalbuildings/"],
  ["Permaculture & Farming", "https://auroraseyefilms.com/permaculture_farming/"],
  ["Spiritual", "https://auroraseyefilms.com/spiritual/"],
  ["Talks & Presentations", "https://auroraseyefilms.com/talkspresentation/"],
  ["Trailers", "https://auroraseyefilms.com/trailer-2/"],
  ["Travel", "https://auroraseyefilms.com/india/"],
  ["Water", "https://auroraseyefilms.com/water/"],
  ["தமிழ் ஆவணப்படம்", "https://auroraseyefilms.com/tamil_documentary/"],
];

const itemPattern = /data-video-url="([^"]+)"[\s\S]*?data-img-url="([^"]+)"[\s\S]*?<div class="tdm-caption">([\s\S]*?)<\/div>/g;

const decodeEntities = (value) => value
  .replace(/&#038;/g, '&')
  .replace(/&#8217;/g, '’')
  .replace(/&#8211;/g, '–')
  .replace(/&#8216;/g, '‘')
  .replace(/&#8220;/g, '"')
  .replace(/&#8221;/g, '"')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#039;/g, "'");

const stripHtml = (value) => decodeEntities(value)
  .replace(/<[^>]+>/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const inferYear = (title, thumbnailUrl) => {
  const text = `${title} ${thumbnailUrl}`;
  const match = text.match(/(?:19|20)\d{2}/);
  return match ? match[0] : '';
};

const normalizeUrl = (rawUrl) => {
  const url = rawUrl.replace(/^http:\/\//, 'https://');

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace('www.', '');

    if (hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/watch?v=${id}` : url;
    }

    if (hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/watch?v=${id}` : url;
    }

    return url;
  } catch {
    return url;
  }
};

const films = [];
let nextId = 1;

for (const [category, url] of categories) {
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Failed ${url}: ${response.status}`);
    continue;
  }

  const html = await response.text();
  const seen = new Set();
  let match;

  while ((match = itemPattern.exec(html)) !== null) {
    const videoUrl = normalizeUrl(match[1].trim());
    const thumbnail = normalizeUrl(match[2].trim());
    const title = stripHtml(match[3]);
    const dedupeKey = `${category}|${title}|${videoUrl}`;

    if (!title || !videoUrl || seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    films.push({
      id: String(nextId++),
      title,
      category,
      year: inferYear(title, thumbnail),
      thumbnail,
      description: `${title} from the ${category} documentary collection.`,
      videoUrl,
      sourcePage: url,
    });
  }
}

console.log(JSON.stringify(films, null, 2));
