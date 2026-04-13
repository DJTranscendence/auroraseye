import fs from 'fs';
import os from 'os';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const TMP_DATA_DIR = path.join(os.tmpdir(), 'auroras-eye-films-data');
const CONFIG_STORAGE_KEY = process.env.CMS_CONFIG_STORAGE_KEY ?? 'cms:config:v2';

const DEFAULT_THEME = {
  headerBackground: '#0a0b12',
  background: '#1b1512',
  foreground: '#f5efe7',
  primary: '#9a6446',
  primaryGlow: '#9a644633',
  surface: '#2c221c',
  surfaceMuted: '#3a2c23',
  textMuted: '#ceb8a8',
  border: '#6e5345',
  accent: '#42c5c0',
};

const DEFAULT_CONFIG = {
  hero: {
    title: 'Storytelling through Light & Life',
    description:
      "Aurora's Eye Films is an independent documentary film production house based in Auroville, dedicated to telling stories that matter - focusing on culture, environment, and the human spirit.",
    videoUrl: 'https://www.youtube.com/watch?v=irjXPzzv6iU&pp=0gcJCcUKAYcqIYzv',
    bgImage:
      'https://images.unsplash.com/photo-1492691523567-6170c8675fa8?q=80&w=2670&auto=format&fit=crop',
    controls: {
      iframeTopPercent: -1,
      iframeTopCm: 5,
      iframeLeftPercent: -10,
      iframeWidthPercent: 110,
      iframeHeightPercent: 110,
      videoScale: 1,
      containerTopPx: 0,
      containerPadPx: 0,
      actionsOffsetX: 0,
      actionsOffsetY: 0,
      actionsFadeOutFrom: 36.98,
      actionsFadeOutDuration: 2.5,
      actionsFadeInAt: 6,
      actionsFadeInDuration: 3,
      scrollOffsetX: 0,
      scrollOffsetY: 0,
      scrollFadeOutFrom: 36.98,
      scrollFadeOutDuration: 2.5,
      scrollFadeInAt: 6,
      scrollFadeInDuration: 3,
      supportCtaOffsetX: 0,
      supportCtaOffsetY: 0,
      recruitmentOffsetX: 0,
      recruitmentOffsetY: 0,
    },
    controlsMobile: {
      iframeTopPercent: -1,
      iframeTopCm: 5,
      iframeLeftPercent: -10,
      iframeWidthPercent: 110,
      iframeHeightPercent: 110,
      videoScale: 1,
      containerTopPx: 0,
      containerPadPx: 0,
      actionsOffsetX: 0,
      actionsOffsetY: 0,
      scrollOffsetX: 0,
      scrollOffsetY: 0,
      supportCtaOffsetX: 0,
      supportCtaOffsetY: 0,
      recruitmentOffsetX: 0,
      recruitmentOffsetY: 0,
    },
  },
  contact: {
    email: 'Serena_aurora@auroville.org.in',
    phone: '+91 00000 00000',
    address: 'Anitya community, Auroville, Tamil Nadu 605101, India',
    youtube: 'https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw',
    instagram: 'https://www.instagram.com/auroras_eye_films/',
    linkedin: 'https://linkedin.com/company/auroras-eye-films',
  },
  theme: DEFAULT_THEME,
  typography: {
    fontFamily: 'default',
  },
};

type SiteConfig = typeof DEFAULT_CONFIG;

let cachedRedisClient: {
  get: (key: string) => Promise<unknown | null>;
  set: (key: string, value: unknown) => Promise<unknown>;
} | null | undefined;

function getWritableDataFilePath(fileName: string, fallbackSeed = '[]') {
  const sourcePath = path.join(DATA_DIR, fileName);

  try {
    if (!fs.existsSync(sourcePath)) {
      fs.writeFileSync(sourcePath, fallbackSeed, 'utf8');
    }
    fs.accessSync(sourcePath, fs.constants.W_OK);
    return sourcePath;
  } catch {
    fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
    const fallbackPath = path.join(TMP_DATA_DIR, fileName);

    if (!fs.existsSync(fallbackPath)) {
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, fallbackPath);
      } else {
        fs.writeFileSync(fallbackPath, fallbackSeed, 'utf8');
      }
    }

    return fallbackPath;
  }
}

function getConfigFilePath() {
  return path.join(DATA_DIR, 'config.json');
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback: string) {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback: number) {
  return Number.isFinite(value) ? (value as number) : fallback;
}

function normalizeConfig(config: unknown): SiteConfig {
  const candidate = isObject(config) ? config : {};
  const heroCandidate = isObject(candidate.hero) ? candidate.hero : {};
  const heroControlsCandidate = isObject(heroCandidate.controls) ? heroCandidate.controls : {};
  const heroControlsMobileCandidate = isObject(heroCandidate.controlsMobile) ? heroCandidate.controlsMobile : {};
  const contactCandidate = isObject(candidate.contact) ? candidate.contact : {};
  const themeCandidate = isObject(candidate.theme) ? candidate.theme : {};
  const typographyCandidate = isObject(candidate.typography) ? candidate.typography : {};
  const normalizedFontFamily = asString(typographyCandidate.fontFamily, DEFAULT_CONFIG.typography.fontFamily);
  const fontFamily = normalizedFontFamily === 'patrick-hand' ? 'patrick-hand' : 'default';

  return {
    hero: {
      title: asString(heroCandidate.title, DEFAULT_CONFIG.hero.title),
      description: asString(heroCandidate.description, DEFAULT_CONFIG.hero.description),
      videoUrl: asString(heroCandidate.videoUrl, DEFAULT_CONFIG.hero.videoUrl),
      bgImage: asString(heroCandidate.bgImage, DEFAULT_CONFIG.hero.bgImage),
      controls: {
        iframeTopPercent: asNumber(heroControlsCandidate.iframeTopPercent, DEFAULT_CONFIG.hero.controls.iframeTopPercent),
        iframeTopCm: asNumber(heroControlsCandidate.iframeTopCm, DEFAULT_CONFIG.hero.controls.iframeTopCm),
        iframeLeftPercent: asNumber(heroControlsCandidate.iframeLeftPercent, DEFAULT_CONFIG.hero.controls.iframeLeftPercent),
        iframeWidthPercent: asNumber(heroControlsCandidate.iframeWidthPercent, DEFAULT_CONFIG.hero.controls.iframeWidthPercent),
        iframeHeightPercent: asNumber(heroControlsCandidate.iframeHeightPercent, DEFAULT_CONFIG.hero.controls.iframeHeightPercent),
        videoScale: asNumber(heroControlsCandidate.videoScale, DEFAULT_CONFIG.hero.controls.videoScale),
        containerTopPx: asNumber(heroControlsCandidate.containerTopPx, DEFAULT_CONFIG.hero.controls.containerTopPx),
        containerPadPx: asNumber(heroControlsCandidate.containerPadPx, DEFAULT_CONFIG.hero.controls.containerPadPx),
        actionsOffsetX: asNumber(heroControlsCandidate.actionsOffsetX, DEFAULT_CONFIG.hero.controls.actionsOffsetX),
        actionsOffsetY: asNumber(heroControlsCandidate.actionsOffsetY, DEFAULT_CONFIG.hero.controls.actionsOffsetY),
        actionsFadeOutFrom: asNumber(
          heroControlsCandidate.actionsFadeOutFrom,
          DEFAULT_CONFIG.hero.controls.actionsFadeOutFrom,
        ),
        actionsFadeOutDuration: asNumber(
          heroControlsCandidate.actionsFadeOutDuration,
          DEFAULT_CONFIG.hero.controls.actionsFadeOutDuration,
        ),
        actionsFadeInAt: asNumber(heroControlsCandidate.actionsFadeInAt, DEFAULT_CONFIG.hero.controls.actionsFadeInAt),
        actionsFadeInDuration: asNumber(
          heroControlsCandidate.actionsFadeInDuration,
          DEFAULT_CONFIG.hero.controls.actionsFadeInDuration,
        ),
        scrollOffsetX: asNumber(heroControlsCandidate.scrollOffsetX, DEFAULT_CONFIG.hero.controls.scrollOffsetX),
        scrollOffsetY: asNumber(heroControlsCandidate.scrollOffsetY, DEFAULT_CONFIG.hero.controls.scrollOffsetY),
        scrollFadeOutFrom: asNumber(
          heroControlsCandidate.scrollFadeOutFrom,
          DEFAULT_CONFIG.hero.controls.scrollFadeOutFrom,
        ),
        scrollFadeOutDuration: asNumber(
          heroControlsCandidate.scrollFadeOutDuration,
          DEFAULT_CONFIG.hero.controls.scrollFadeOutDuration,
        ),
        scrollFadeInAt: asNumber(heroControlsCandidate.scrollFadeInAt, DEFAULT_CONFIG.hero.controls.scrollFadeInAt),
        scrollFadeInDuration: asNumber(
          heroControlsCandidate.scrollFadeInDuration,
          DEFAULT_CONFIG.hero.controls.scrollFadeInDuration,
        ),
        supportCtaOffsetX: asNumber(heroControlsCandidate.supportCtaOffsetX, DEFAULT_CONFIG.hero.controls.supportCtaOffsetX),
        supportCtaOffsetY: asNumber(heroControlsCandidate.supportCtaOffsetY, DEFAULT_CONFIG.hero.controls.supportCtaOffsetY),
        recruitmentOffsetX: asNumber(heroControlsCandidate.recruitmentOffsetX, DEFAULT_CONFIG.hero.controls.recruitmentOffsetX),
        recruitmentOffsetY: asNumber(heroControlsCandidate.recruitmentOffsetY, DEFAULT_CONFIG.hero.controls.recruitmentOffsetY),
      },
      controlsMobile: {
        iframeTopPercent: asNumber(
          heroControlsMobileCandidate.iframeTopPercent,
          DEFAULT_CONFIG.hero.controlsMobile.iframeTopPercent,
        ),
        iframeTopCm: asNumber(heroControlsMobileCandidate.iframeTopCm, DEFAULT_CONFIG.hero.controlsMobile.iframeTopCm),
        iframeLeftPercent: asNumber(
          heroControlsMobileCandidate.iframeLeftPercent,
          DEFAULT_CONFIG.hero.controlsMobile.iframeLeftPercent,
        ),
        iframeWidthPercent: asNumber(
          heroControlsMobileCandidate.iframeWidthPercent,
          DEFAULT_CONFIG.hero.controlsMobile.iframeWidthPercent,
        ),
        iframeHeightPercent: asNumber(
          heroControlsMobileCandidate.iframeHeightPercent,
          DEFAULT_CONFIG.hero.controlsMobile.iframeHeightPercent,
        ),
        videoScale: asNumber(heroControlsMobileCandidate.videoScale, DEFAULT_CONFIG.hero.controlsMobile.videoScale),
        containerTopPx: asNumber(
          heroControlsMobileCandidate.containerTopPx,
          DEFAULT_CONFIG.hero.controlsMobile.containerTopPx,
        ),
        containerPadPx: asNumber(
          heroControlsMobileCandidate.containerPadPx,
          DEFAULT_CONFIG.hero.controlsMobile.containerPadPx,
        ),
        actionsOffsetX: asNumber(
          heroControlsMobileCandidate.actionsOffsetX,
          DEFAULT_CONFIG.hero.controlsMobile.actionsOffsetX,
        ),
        actionsOffsetY: asNumber(
          heroControlsMobileCandidate.actionsOffsetY,
          DEFAULT_CONFIG.hero.controlsMobile.actionsOffsetY,
        ),
        scrollOffsetX: asNumber(
          heroControlsMobileCandidate.scrollOffsetX,
          DEFAULT_CONFIG.hero.controlsMobile.scrollOffsetX,
        ),
        scrollOffsetY: asNumber(
          heroControlsMobileCandidate.scrollOffsetY,
          DEFAULT_CONFIG.hero.controlsMobile.scrollOffsetY,
        ),
        supportCtaOffsetX: asNumber(
          heroControlsMobileCandidate.supportCtaOffsetX,
          DEFAULT_CONFIG.hero.controlsMobile.supportCtaOffsetX,
        ),
        supportCtaOffsetY: asNumber(
          heroControlsMobileCandidate.supportCtaOffsetY,
          DEFAULT_CONFIG.hero.controlsMobile.supportCtaOffsetY,
        ),
        recruitmentOffsetX: asNumber(
          heroControlsMobileCandidate.recruitmentOffsetX,
          DEFAULT_CONFIG.hero.controlsMobile.recruitmentOffsetX,
        ),
        recruitmentOffsetY: asNumber(
          heroControlsMobileCandidate.recruitmentOffsetY,
          DEFAULT_CONFIG.hero.controlsMobile.recruitmentOffsetY,
        ),
      },
    },
    contact: {
      email: asString(contactCandidate.email, DEFAULT_CONFIG.contact.email),
      phone: asString(contactCandidate.phone, DEFAULT_CONFIG.contact.phone),
      address: asString(contactCandidate.address, DEFAULT_CONFIG.contact.address),
      youtube: asString(contactCandidate.youtube, DEFAULT_CONFIG.contact.youtube),
      instagram: asString(contactCandidate.instagram, DEFAULT_CONFIG.contact.instagram),
      linkedin: asString(contactCandidate.linkedin, DEFAULT_CONFIG.contact.linkedin),
    },
    theme: {
      headerBackground: asString(themeCandidate.headerBackground, DEFAULT_THEME.headerBackground),
      background: asString(themeCandidate.background, DEFAULT_THEME.background),
      foreground: asString(themeCandidate.foreground, DEFAULT_THEME.foreground),
      primary: asString(themeCandidate.primary, DEFAULT_THEME.primary),
      primaryGlow: asString(themeCandidate.primaryGlow, DEFAULT_THEME.primaryGlow),
      surface: asString(themeCandidate.surface, DEFAULT_THEME.surface),
      surfaceMuted: asString(themeCandidate.surfaceMuted, DEFAULT_THEME.surfaceMuted),
      textMuted: asString(themeCandidate.textMuted, DEFAULT_THEME.textMuted),
      border: asString(themeCandidate.border, DEFAULT_THEME.border),
      accent: asString(themeCandidate.accent, DEFAULT_THEME.accent),
    },
    typography: {
      fontFamily,
    },
  };
}

function readConfigFromFile(): SiteConfig {
  const filePath = getConfigFilePath();
  if (!fs.existsSync(filePath)) {
    return DEFAULT_CONFIG;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return normalizeConfig(raw);
  } catch {
    return DEFAULT_CONFIG;
  }
}

function writeConfigToFile(config: SiteConfig) {
  const fallbackSeed = JSON.stringify(DEFAULT_CONFIG, null, 2);
  const filePath = getWritableDataFilePath('config.json', fallbackSeed);
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
}

function hasRedisEnv() {
  return Boolean(
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
      (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
      process.env.KV_REDIS_URL
  );
}

function isVercelRuntime() {
  return process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
}

async function getRedisClient() {
  if (cachedRedisClient !== undefined) {
    return cachedRedisClient;
  }

  if (!hasRedisEnv()) {
    cachedRedisClient = null;
    return cachedRedisClient;
  }

  const restUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (restUrl && restToken) {
    const { Redis } = await import('@upstash/redis');
    cachedRedisClient = new Redis({
      url: restUrl,
      token: restToken,
    });
    return cachedRedisClient;
  }

  if (process.env.KV_REDIS_URL) {
    const { createClient } = await import('redis');
    const redisSocketClient = createClient({
      url: process.env.KV_REDIS_URL,
    });

    redisSocketClient.on('error', (error) => {
      console.error('Redis socket client error:', error);
    });

    await redisSocketClient.connect();

    cachedRedisClient = {
      get: async (key) => redisSocketClient.get(key),
      set: async (key, value) => redisSocketClient.set(key, JSON.stringify(value)),
    };

    return cachedRedisClient;
  }

  cachedRedisClient = null;

  return cachedRedisClient;
}

export type NewsStory = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  image: string;
  publishedAt: string;
  tags: string[];
  isManual: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};

const AURORA_EYE_KEYWORDS = [
  "aurora's eye",
  'auroras eye',
  'aurora eye films',
  'aurora eye film',
  'aurora eye',
  'auroraeyefilms',
  '@auroraeyefilms',
  'auroraseyefilms.com',
];

const AURORA_FOUNDATION_KEYWORDS = ['serena aurora'];
const AUROVILLE_KEYWORDS = ['auroville'];

export function isAuroraEyeRelatedStory(candidate: {
  title?: string;
  summary?: string;
  source?: string;
  url?: string;
  tags?: string[];
}) {
  const searchable = [
    candidate.title ?? '',
    candidate.summary ?? '',
    candidate.source ?? '',
    candidate.url ?? '',
    ...(candidate.tags ?? []),
  ]
    .join(' ')
    .toLowerCase();

  const hasDirectBrandMention = AURORA_EYE_KEYWORDS.some((keyword) => searchable.includes(keyword));
  const hasFounderMention = AURORA_FOUNDATION_KEYWORDS.some((keyword) => searchable.includes(keyword));
  const hasAurovilleMention = AUROVILLE_KEYWORDS.some((keyword) => searchable.includes(keyword));

  return hasDirectBrandMention || (hasFounderMention && hasAurovilleMention);
}

export async function getFilms() {
  const filePath = path.join(DATA_DIR, 'films.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export async function saveFilms(films: any[]) {
  const filePath = path.join(DATA_DIR, 'films.json');
  fs.writeFileSync(filePath, JSON.stringify(films, null, 2), 'utf8');
}

export async function getFeaturedFilms() {
  const filePath = getWritableDataFilePath('featuredFilms.json', '[]');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export async function saveFeaturedFilms(films: any[]) {
  const filePath = getWritableDataFilePath('featuredFilms.json', '[]');
  fs.writeFileSync(filePath, JSON.stringify(films, null, 2), 'utf8');
}

export async function getTeam() {
  const filePath = path.join(DATA_DIR, 'team.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export async function saveTeam(team: any[]) {
  const filePath = path.join(DATA_DIR, 'team.json');
  fs.writeFileSync(filePath, JSON.stringify(team, null, 2), 'utf8');
}

export async function getConfig() {
  const redis = await getRedisClient();

  if (redis) {
    try {
      const stored = await redis.get(CONFIG_STORAGE_KEY);

      if (typeof stored === 'string') {
        return normalizeConfig(JSON.parse(stored));
      }

      if (stored) {
        return normalizeConfig(stored);
      }

      const seeded = readConfigFromFile();
      await redis.set(CONFIG_STORAGE_KEY, seeded);
      return seeded;
    } catch (error) {
      console.error('Config read failed from Redis:', error);
      if (isVercelRuntime()) {
        throw new Error('Settings storage is unavailable. Check Redis/KV environment variables.');
      }
    }
  }

  return readConfigFromFile();
}

export async function saveConfig(config: any) {
  const normalized = normalizeConfig(config);
  const redis = await getRedisClient();

  if (redis) {
    try {
      await redis.set(CONFIG_STORAGE_KEY, normalized);
      return;
    } catch (error) {
      console.error('Config write failed to Redis:', error);
      throw new Error('Failed to persist settings in Redis.');
    }
  }

  if (isVercelRuntime()) {
    throw new Error(
      'Persistent settings storage is not configured for Vercel. Set KV_REDIS_URL, KV_REST_API_URL + KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.'
    );
  }

  writeConfigToFile(normalized);
}

export async function getKarshaNuns() {
  const filePath = path.join(DATA_DIR, 'karshaNuns.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export async function saveKarshaNuns(content: any) {
  const filePath = path.join(DATA_DIR, 'karshaNuns.json');
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
}

export async function getBreakingTheSilence() {
  const filePath = path.join(DATA_DIR, 'breakingTheSilence.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export async function saveBreakingTheSilence(content: any) {
  const filePath = path.join(DATA_DIR, 'breakingTheSilence.json');
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
}

export async function getDonationCampaign() {
  const filePath = path.join(DATA_DIR, 'donationCampaign.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export async function saveDonationCampaign(campaign: any) {
  const filePath = path.join(DATA_DIR, 'donationCampaign.json');
  fs.writeFileSync(filePath, JSON.stringify(campaign, null, 2), 'utf8');
}

export async function getDonationProjects() {
  const filePath = getWritableDataFilePath('donationProjects.json', '{}');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export async function saveDonationProjects(payload: any) {
  const filePath = getWritableDataFilePath('donationProjects.json', '{}');
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

export async function getDiscussionTabs() {
  const filePath = getWritableDataFilePath('discussionTabs.json', '{"tabs": []}');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export async function saveDiscussionTabs(payload: any) {
  const filePath = getWritableDataFilePath('discussionTabs.json', '{"tabs": []}');
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

export async function getDiscussionMessages() {
  const filePath = getWritableDataFilePath('discussionMessages.json', '{}');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export async function saveDiscussionMessages(payload: any) {
  const filePath = getWritableDataFilePath('discussionMessages.json', '{}');
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

export async function getUsers() {
  const filePath = getWritableDataFilePath('users.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export async function saveUsers(users: any[]) {
  const filePath = getWritableDataFilePath('users.json');
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');
}

export async function getSubscribers() {
  const filePath = path.join(DATA_DIR, 'newsletter.json');
  if (!fs.existsSync(filePath)) return [];
  const subs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return subs.map((s: any) => s.email);
}

export type NewsletterSubscriber = {
  email: string;
  subscribedAt: string;
};

export type NewsletterTemplate = {
  subject: string;
  preheader: string;
  heading: string;
  intro: string;
  bannerUrl: string;
  ctaText: string;
  ctaUrl: string;
  footerNote: string;
  logoUrl: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  selectedStoryIds: string[];
  updatedAt: string;
};

export async function getNewsletterSubscribers() {
  const filePath = path.join(DATA_DIR, 'newsletter.json');

  if (!fs.existsSync(filePath)) {
    return [] as NewsletterSubscriber[];
  }

  const subs = JSON.parse(fs.readFileSync(filePath, 'utf8')) as NewsletterSubscriber[];
  return subs.sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime());
}

const DEFAULT_NEWSLETTER_TEMPLATE: NewsletterTemplate = {
  subject: "The Lens - News & Events from Aurora's Eye",
  preheader: "Latest documentaries, awards, and story updates from Auroville.",
  heading: "The Lens - News & Events from Aurora's Eye",
  intro:
    'Here is what we have been filming, sharing, and celebrating this week. Thank you for following our work from Auroville.',
  bannerUrl: '',
  ctaText: 'Watch our channel',
  ctaUrl: 'https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw',
  footerNote: 'You are receiving this because you subscribed on auroraseyefilms.com.',
  logoUrl: 'https://auroraseyefilms.com/wp-content/uploads/2022/03/cropped-aurora-logo.png',
  backgroundColor: '#0f172a',
  textColor: '#e2e8f0',
  accentColor: '#3b82f6',
  selectedStoryIds: [],
  updatedAt: new Date().toISOString(),
};

function getNewsletterTemplateFilePath() {
  return path.join(DATA_DIR, 'newsletterTemplate.json');
}

export async function getNewsletterTemplate() {
  const filePath = getNewsletterTemplateFilePath();

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(DEFAULT_NEWSLETTER_TEMPLATE, null, 2), 'utf8');
    return DEFAULT_NEWSLETTER_TEMPLATE;
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Partial<NewsletterTemplate>;
  return {
    ...DEFAULT_NEWSLETTER_TEMPLATE,
    ...raw,
    selectedStoryIds: Array.isArray(raw.selectedStoryIds) ? raw.selectedStoryIds : [],
  };
}

export async function saveNewsletterTemplate(template: Partial<NewsletterTemplate>) {
  const filePath = getNewsletterTemplateFilePath();
  const current = await getNewsletterTemplate();
  const nextTemplate: NewsletterTemplate = {
    ...current,
    ...template,
    selectedStoryIds: Array.isArray(template.selectedStoryIds)
      ? template.selectedStoryIds
      : current.selectedStoryIds,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(filePath, JSON.stringify(nextTemplate, null, 2), 'utf8');
  return nextTemplate;
}

export async function generateNewsletterTemplateFromNews() {
  const stories = await getNews();
  const topStories = stories.slice(0, 5);
  const latestTitle = topStories[0]?.title ?? 'latest documentary updates';
  const generated = await saveNewsletterTemplate({
    subject: `Aurora's Eye Update: ${latestTitle}`,
    preheader: `This week from Auroville: ${topStories.length} highlighted stor${topStories.length === 1 ? 'y' : 'ies'}.`,
    heading: "The Lens - News & Events from Aurora's Eye",
    intro:
      'A curated update from our documentary work, awards, and community storytelling in and around Auroville.',
    selectedStoryIds: topStories.map((story) => story.id),
  });

  return {
    generated,
    storyCount: topStories.length,
  };
}

export async function addSubscriber(email: string) {
  const filePath = path.join(DATA_DIR, 'newsletter.json');
  let subs = [];
  if (fs.existsSync(filePath)) {
    subs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  if (!subs.find((s: any) => s.email === email)) {
    subs.push({ email, subscribedAt: new Date().toISOString() });
    fs.writeFileSync(filePath, JSON.stringify(subs, null, 2), 'utf8');
  }
}

type YouTubeClickRecord = {
  label: string;
  url: string;
  location: string;
  pathname: string;
  timestamp: string;
};

export async function recordYouTubeClick(click: YouTubeClickRecord) {
  const filePath = path.join(DATA_DIR, 'youtube-clicks.json');
  let clicks: YouTubeClickRecord[] = [];

  if (fs.existsSync(filePath)) {
    clicks = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  clicks.push(click);
  fs.writeFileSync(filePath, JSON.stringify(clicks, null, 2), 'utf8');
}

function getNewsFilePath() {
  return path.join(DATA_DIR, 'news.json');
}

function summarizeText(value: string, maxLength = 220) {
  const cleaned = value
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/#[\p{L}\p{N}_-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return '';
  }

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function parseMonthName(monthName: string) {
  const normalized = monthName.toLowerCase().slice(0, 3);
  const map: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  return map[normalized];
}

function normalizeExternalStoryUrl(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl);
    const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();

    if (hostname === 'youtu.be') {
      const id = parsed.pathname.replace(/^\//, '').split('/')[0];
      if (id) {
        return `https://youtu.be/${id}`;
      }
      return rawUrl;
    }

    if (hostname.includes('youtube.com')) {
      const watchId = parsed.searchParams.get('v');
      if (watchId) {
        return `https://youtu.be/${watchId}`;
      }

      if (parsed.pathname.startsWith('/shorts/')) {
        const shortId = parsed.pathname.split('/shorts/')[1]?.split('/')[0];
        if (shortId) {
          return `https://youtu.be/${shortId}`;
        }
      }
    }

    return rawUrl;
  } catch {
    return rawUrl;
  }
}

function inferStoryTimestamp(story: Pick<NewsStory, 'title' | 'summary' | 'url' | 'image'>) {
  const text = `${story.title} ${story.summary} ${story.url} ${story.image || ''}`;
  const candidates: number[] = [];

  const isoLikeMatches = text.match(/\b(20\d{2}|19\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/g) ?? [];
  for (const match of isoLikeMatches) {
    const parsed = new Date(match.replace(/\//g, '-')).getTime();
    if (!Number.isNaN(parsed)) {
      candidates.push(parsed);
    }
  }

  const longDatePattern = /\b(0?[1-9]|[12]\d|3[01])[\s,-]+([A-Za-z]{3,9})[\s,-]+(20\d{2}|19\d{2})\b/g;
  for (const match of text.matchAll(longDatePattern)) {
    const day = Number(match[1]);
    const month = parseMonthName(match[2]);
    const year = Number(match[3]);

    if (month !== undefined) {
      const parsed = new Date(year, month, day).getTime();
      if (!Number.isNaN(parsed)) {
        candidates.push(parsed);
      }
    }
  }

  const monthFirstPattern = /\b([A-Za-z]{3,9})[\s,-]+(0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?[\s,-]+(20\d{2}|19\d{2})\b/g;
  for (const match of text.matchAll(monthFirstPattern)) {
    const month = parseMonthName(match[1]);
    const day = Number(match[2]);
    const year = Number(match[3]);

    if (month !== undefined) {
      const parsed = new Date(year, month, day).getTime();
      if (!Number.isNaN(parsed)) {
        candidates.push(parsed);
      }
    }
  }

  const yearMatches = text.match(/\b(20\d{2}|19\d{2})\b/g) ?? [];
  for (const yearToken of yearMatches) {
    const year = Number(yearToken);
    const parsed = new Date(year, 0, 1).getTime();
    if (!Number.isNaN(parsed)) {
      candidates.push(parsed);
    }
  }

  // Common CMS/media and permalink shapes like /2022/03/... or /2021/01/10/...
  const pathDatePattern = /\/(20\d{2}|19\d{2})\/(0?[1-9]|1[0-2])(?:\/(0?[1-9]|[12]\d|3[01]))?\b/g;
  for (const match of text.matchAll(pathDatePattern)) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = match[3] ? Number(match[3]) : 1;
    const parsed = new Date(year, month, day).getTime();
    if (!Number.isNaN(parsed)) {
      candidates.push(parsed);
    }
  }

  if (!candidates.length) {
    return null;
  }

  return Math.max(...candidates);
}

function normalizeNewsStory(story: NewsStory) {
  const now = Date.now();
  const parsedPublishedAt = new Date(story.publishedAt).getTime();
  const inferredTimestamp = inferStoryTimestamp(story);

  const publishedYear = Number.isNaN(parsedPublishedAt) ? null : new Date(parsedPublishedAt).getUTCFullYear();
  const inferredYear = inferredTimestamp ? new Date(inferredTimestamp).getUTCFullYear() : null;
  const currentYear = new Date().getUTCFullYear();

  const shouldUseInferredDate =
    inferredTimestamp !== null &&
    (Number.isNaN(parsedPublishedAt) ||
      parsedPublishedAt > now + 86_400_000 ||
      (publishedYear === currentYear && inferredYear !== null && inferredYear < currentYear));

  const normalizedSummary = summarizeText(story.summary || '');
  const summaryLooksLikeJustLink = /^(https?:\/\/\S+|here is the link if you want to check it out\.?|link in bio\.?)+$/i.test(
    normalizedSummary,
  );
  const synthesizedSummary = summarizeText(`${story.title}. Source: ${story.source || "Aurora's Eye News"}`);
  const fallbackSummary = summarizeText(`${story.title} - ${story.source || 'Aurora\'s Eye News'}`);

  return {
    ...story,
    url: normalizeExternalStoryUrl(story.url),
    summary:
      normalizedSummary && !summaryLooksLikeJustLink
        ? normalizedSummary
        : synthesizedSummary || fallbackSummary || 'Story summary unavailable.',
    publishedAt: shouldUseInferredDate && inferredTimestamp ? new Date(inferredTimestamp).toISOString() : story.publishedAt,
  };
}

function normalizeNewsList(news: NewsStory[]) {
  return [...news].map(normalizeNewsStory).sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    const aTs = new Date(a.publishedAt).getTime();
    const bTs = new Date(b.publishedAt).getTime();
    const safeATs = Number.isFinite(aTs) ? aTs : 0;
    const safeBTs = Number.isFinite(bTs) ? bTs : 0;

    return safeBTs - safeATs;
  });
}

export async function getNews() {
  const filePath = getNewsFilePath();

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf8');
    return [] as NewsStory[];
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as NewsStory[];
  const filtered = raw.filter((item) => isAuroraEyeRelatedStory(item));
  const normalized = normalizeNewsList(filtered);

  if (filtered.length !== raw.length || JSON.stringify(raw) !== JSON.stringify(normalized)) {
    fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2), 'utf8');
  }

  return normalized;
}

export async function saveNews(news: NewsStory[]) {
  const filePath = getNewsFilePath();
  const filtered = news.filter((item) => isAuroraEyeRelatedStory(item));
  fs.writeFileSync(filePath, JSON.stringify(normalizeNewsList(filtered), null, 2), 'utf8');
}

export async function upsertGeneratedNews(
  generatedItems: Array<
    Pick<NewsStory, 'title' | 'summary' | 'url' | 'source' | 'image' | 'publishedAt' | 'tags'>
  >,
) {
  const current = await getNews();
  const now = new Date().toISOString();
  const byUrl = new Map(current.map((item) => [item.url, item]));
  let createdCount = 0;
  let updatedCount = 0;

  for (const incoming of generatedItems) {
    if (!incoming.url || !incoming.title) {
      continue;
    }

    if (!isAuroraEyeRelatedStory(incoming)) {
      continue;
    }

    const existing = byUrl.get(incoming.url);

    if (existing) {
      byUrl.set(incoming.url, {
        ...existing,
        title: incoming.title || existing.title,
        summary: incoming.summary || existing.summary,
        source: incoming.source || existing.source,
        image: incoming.image || existing.image,
        publishedAt: incoming.publishedAt || existing.publishedAt,
        tags: incoming.tags?.length ? incoming.tags : existing.tags,
        updatedAt: now,
      });
      updatedCount += 1;
      continue;
    }

    const id = `news-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    byUrl.set(incoming.url, {
      id,
      title: incoming.title,
      summary: incoming.summary,
      url: incoming.url,
      source: incoming.source,
      image: incoming.image,
      publishedAt: incoming.publishedAt || now,
      tags: incoming.tags ?? [],
      isManual: false,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    });
    createdCount += 1;
  }

  await saveNews(Array.from(byUrl.values()));
  return { createdCount, updatedCount };
}
