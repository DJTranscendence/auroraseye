import fs from 'fs';
import os from 'os';
import path from 'path';
import { DEFAULT_NAVBAR_DRAGGABLE, mergeNavbarDraggableFromApi } from '@/config/navbar-draggable-defaults';
import { normalizeDonationSectionHex } from '@/utils/donationSectionTheme';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const TMP_DATA_DIR = path.join(os.tmpdir(), 'auroras-eye-films-data');
const CONFIG_STORAGE_KEY = process.env.CMS_CONFIG_STORAGE_KEY ?? 'cms:config:v2';
const FILMS_STORAGE_KEY = 'cms:films:v1';
const TEAM_STORAGE_KEY = 'cms:team:v1';
const KARSHA_STORAGE_KEY = 'cms:karshaNuns:v1';
const BREAKING_STORAGE_KEY = 'cms:breakingTheSilence:v1';
const DONATION_CAMPAIGN_STORAGE_KEY = 'cms:donationCampaign:v1';
const DONATION_PROJECTS_STORAGE_KEY = 'cms:donationProjects:v1';
const NEWS_STORAGE_KEY = 'cms:news:v1';
const FEATURED_FILMS_STORAGE_KEY = 'cms:featuredFilms:v1';
const DISCUSSION_TABS_STORAGE_KEY = 'cms:discussionTabs:v1';
const DISCUSSION_MESSAGES_STORAGE_KEY = 'cms:discussionMessages:v1';
const USERS_STORAGE_KEY = 'cms:users:v1';
const NEWSLETTER_STORAGE_KEY = 'cms:newsletter:v1';
const NEWSLETTER_TEMPLATE_STORAGE_KEY = 'cms:newsletterTemplate:v1';

const DEFAULT_THEME = {
  headerBackground: '#0a0b12',
  headerTextureOverlayOpacity: 0.14,
  headerDarkOverlayOpacity: 1,
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

const DEFAULT_PAGE_THEME = {
  pageBackground: '',
  textColor: '',
  headingTextColor: '',
  textMutedColor: '',
  accentColor: '',
  surfaceColor: '',
  surfaceMutedColor: '',
  border: '',
};

const DEFAULT_CONTACT_PAGE_COPY = {
  headerTitle: 'Get in touch with us',
  headerSubtitle:
    'Get in touch with us for collaborations, consultations, screenings or documentary inquiries via the links on the right. Visit us in person using the map links on the left.',
};

const DEFAULT_DOCUMENTARIES_PAGE_COPY = {
  badge: 'Catalog',
  headerTitle: 'Documentary Archive',
  headerSubtitle:
    'Select your interest, choose a category that interests you and then browse our catalog to select a video to enjoy!',
};

const DEFAULT_NEWS_PAGE_COPY = {
  badge: 'Newsroom',
  headerTitle: "Aurora's Eye News",
  headerSubtitle:
    'A live stream of documentary and impact-story updates, plus manually curated stories from our team.',
};

const DEFAULT_TEAM_PAGE_COPY = {
  badge: 'Our People',
  headerTitle: 'The Visionaries Behind the Lens',
  headerSubtitle: "Meet the documentary filmmakers and storytellers of Aurora's Eye Films.",
  missionTitle: 'Our Mission',
  missionBody:
    'We aim to inspire and inform through the art of documentary filmmaking. Our focus is on projects that promote human unity, ecological sustainability, and the diverse cultural tapestry of our world.',
  impactIntegrityTitle: 'Integrity',
  impactIntegrityBody: 'Honest storytelling that respects the subject and the audience.',
  impactInnovationTitle: 'Innovation',
  impactInnovationBody: 'Pushing the boundaries of visual language and sound design.',
  impactCommunityTitle: 'Community',
  impactCommunityBody: 'Fostering a global network of conscious viewers and creators.',
};

const DEFAULT_HOME_PAGE_COPY = {
  ctaTitle: 'Shape the Narrative With Us',
  ctaBody:
    'Stay connected to the stories that matter. Subscribe for project updates and exclusive documentary insights.',
  mediaWallEyebrow: 'From the field',
  mediaWallTitle: 'Instagram Highlights',
  mediaWallSubtitle: 'The latest and greatest from our social media feed.',
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
      iframeTopPercent: 2.5,
      iframeTopCm: 0.3,
      iframeLeftPercent: 0,
      iframeWidthPercent: 100,
      iframeHeightPercent: 100,
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
      iframeTopPercent: 2.5,
      iframeTopCm: 0.3,
      iframeLeftPercent: 0,
      iframeWidthPercent: 100,
      iframeHeightPercent: 100,
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
    facebook: 'https://www.facebook.com/AurorasEye/about/',
    instagram: 'https://www.instagram.com/auroras_eye_films/',
    linkedin: 'https://linkedin.com/company/auroras-eye-films',
  },
  theme: DEFAULT_THEME,
  typography: {
    fontFamily: 'default',
  },
  homePageTheme: { ...DEFAULT_PAGE_THEME },
  newsPageTheme: { ...DEFAULT_PAGE_THEME },
  documentariesPageTheme: { ...DEFAULT_PAGE_THEME },
  donationsPageTheme: { ...DEFAULT_PAGE_THEME },
  contactPageTheme: { ...DEFAULT_PAGE_THEME },
  teamPageTheme: { ...DEFAULT_PAGE_THEME },
  contactPageCopy: { ...DEFAULT_CONTACT_PAGE_COPY },
  documentariesPageCopy: { ...DEFAULT_DOCUMENTARIES_PAGE_COPY },
  newsPageCopy: { ...DEFAULT_NEWS_PAGE_COPY },
  teamPageCopy: { ...DEFAULT_TEAM_PAGE_COPY },
  homePageCopy: { ...DEFAULT_HOME_PAGE_COPY },
  navbarDraggable: { ...DEFAULT_NAVBAR_DRAGGABLE },
  /** Default fixed `top` (px) for Karsha floating section nav on desktop; see KarshaFloatingNav. */
  karshaFloatingNav: {
    desktopTopPx: 122,
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

function normalizePageTheme(value: unknown) {
  const candidate = isObject(value) ? value : {};
  return {
    pageBackground: asString(candidate.pageBackground, DEFAULT_PAGE_THEME.pageBackground),
    textColor: asString(candidate.textColor, DEFAULT_PAGE_THEME.textColor),
    headingTextColor: asString(candidate.headingTextColor, DEFAULT_PAGE_THEME.headingTextColor),
    textMutedColor: asString(candidate.textMutedColor, DEFAULT_PAGE_THEME.textMutedColor),
    accentColor: asString(candidate.accentColor, DEFAULT_PAGE_THEME.accentColor),
    surfaceColor: asString(candidate.surfaceColor, DEFAULT_PAGE_THEME.surfaceColor),
    surfaceMutedColor: asString(candidate.surfaceMutedColor, DEFAULT_PAGE_THEME.surfaceMutedColor),
    border: asString(candidate.border, DEFAULT_PAGE_THEME.border),
  };
}

function readDataFromFile<T>(fileName: string, fallback: T): T {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeDataToFile<T>(fileName: string, data: T) {
  if (isVercelRuntime()) return;
  const filePath = path.join(DATA_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

async function getStoredData<T>(fileName: string, key: string, fallback: T): Promise<T> {
  const redis = await getRedisClient();
  if (redis) {
    try {
      const stored = await redis.get(key);
      if (stored) {
        return (typeof stored === 'string' ? JSON.parse(stored) : stored) as T;
      }
      const seeded = readDataFromFile(fileName, fallback);
      await redis.set(key, JSON.stringify(seeded));
      return seeded;
    } catch (error) {
      console.error(`CMS: Failed to read ${key} from Redis:`, error);
    }
  }
  return readDataFromFile(fileName, fallback);
}

async function saveStoredData<T>(fileName: string, key: string, data: T): Promise<void> {
  const redis = await getRedisClient();
  if (redis) {
    try {
      await redis.set(key, JSON.stringify(data));
    } catch (error) {
      console.error(`CMS: Failed to save ${key} to Redis:`, error);
    }
  }
  writeDataToFile(fileName, data);
}

function normalizeConfig(config: unknown): SiteConfig {
  const candidate = isObject(config) ? config : {};
  const heroCandidate = isObject(candidate.hero) ? candidate.hero : {};
  const heroControlsCandidate = isObject(heroCandidate.controls) ? heroCandidate.controls : {};
  const heroControlsMobileCandidate = isObject(heroCandidate.controlsMobile) ? heroCandidate.controlsMobile : {};
  const contactCandidate = isObject(candidate.contact) ? candidate.contact : {};
  const themeCandidate = isObject(candidate.theme) ? candidate.theme : {};
  const typographyCandidate = isObject(candidate.typography) ? candidate.typography : {};
  const navbarDraggableCandidate = isObject(candidate.navbarDraggable) ? candidate.navbarDraggable : {};
  const homePageThemeCandidate = isObject(candidate.homePageTheme) ? candidate.homePageTheme : {};
  const newsPageThemeCandidate = isObject(candidate.newsPageTheme) ? candidate.newsPageTheme : {};
  const documentariesPageThemeCandidate = isObject(candidate.documentariesPageTheme)
    ? candidate.documentariesPageTheme
    : {};
  const donationsPageThemeCandidate = isObject(candidate.donationsPageTheme) ? candidate.donationsPageTheme : {};
  const contactPageThemeCandidate = isObject(candidate.contactPageTheme) ? candidate.contactPageTheme : {};
  const teamPageThemeCandidate = isObject(candidate.teamPageTheme) ? candidate.teamPageTheme : {};
  const contactPageCopyCandidate = isObject(candidate.contactPageCopy) ? candidate.contactPageCopy : {};
  const documentariesPageCopyCandidate = isObject(candidate.documentariesPageCopy)
    ? candidate.documentariesPageCopy
    : {};
  const newsPageCopyCandidate = isObject(candidate.newsPageCopy) ? candidate.newsPageCopy : {};
  const teamPageCopyCandidate = isObject(candidate.teamPageCopy) ? candidate.teamPageCopy : {};
  const homePageCopyCandidate = isObject(candidate.homePageCopy) ? candidate.homePageCopy : {};
  const karshaFloatingNavCandidate = isObject(candidate.karshaFloatingNav) ? candidate.karshaFloatingNav : {};
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
      facebook: asString(contactCandidate.facebook, DEFAULT_CONFIG.contact.facebook),
      instagram: asString(contactCandidate.instagram, DEFAULT_CONFIG.contact.instagram),
      linkedin: asString(contactCandidate.linkedin, DEFAULT_CONFIG.contact.linkedin),
    },
    theme: {
      headerBackground: asString(themeCandidate.headerBackground, DEFAULT_THEME.headerBackground),
      headerTextureOverlayOpacity: asNumber(
        themeCandidate.headerTextureOverlayOpacity,
        DEFAULT_THEME.headerTextureOverlayOpacity,
      ),
      headerDarkOverlayOpacity: asNumber(
        themeCandidate.headerDarkOverlayOpacity,
        DEFAULT_THEME.headerDarkOverlayOpacity,
      ),
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
    homePageTheme: normalizePageTheme(homePageThemeCandidate),
    newsPageTheme: normalizePageTheme(newsPageThemeCandidate),
    documentariesPageTheme: normalizePageTheme(documentariesPageThemeCandidate),
    donationsPageTheme: normalizePageTheme(donationsPageThemeCandidate),
    contactPageTheme: normalizePageTheme(contactPageThemeCandidate),
    teamPageTheme: normalizePageTheme(teamPageThemeCandidate),
    contactPageCopy: {
      headerTitle: asString(contactPageCopyCandidate.headerTitle, DEFAULT_CONTACT_PAGE_COPY.headerTitle),
      headerSubtitle: asString(
        contactPageCopyCandidate.headerSubtitle,
        DEFAULT_CONTACT_PAGE_COPY.headerSubtitle,
      ),
    },
    documentariesPageCopy: {
      badge: asString(documentariesPageCopyCandidate.badge, DEFAULT_DOCUMENTARIES_PAGE_COPY.badge),
      headerTitle: asString(documentariesPageCopyCandidate.headerTitle, DEFAULT_DOCUMENTARIES_PAGE_COPY.headerTitle),
      headerSubtitle: asString(
        documentariesPageCopyCandidate.headerSubtitle,
        DEFAULT_DOCUMENTARIES_PAGE_COPY.headerSubtitle,
      ),
    },
    newsPageCopy: {
      badge: asString(newsPageCopyCandidate.badge, DEFAULT_NEWS_PAGE_COPY.badge),
      headerTitle: asString(newsPageCopyCandidate.headerTitle, DEFAULT_NEWS_PAGE_COPY.headerTitle),
      headerSubtitle: asString(newsPageCopyCandidate.headerSubtitle, DEFAULT_NEWS_PAGE_COPY.headerSubtitle),
    },
    teamPageCopy: {
      badge: asString(teamPageCopyCandidate.badge, DEFAULT_TEAM_PAGE_COPY.badge),
      headerTitle: asString(teamPageCopyCandidate.headerTitle, DEFAULT_TEAM_PAGE_COPY.headerTitle),
      headerSubtitle: asString(teamPageCopyCandidate.headerSubtitle, DEFAULT_TEAM_PAGE_COPY.headerSubtitle),
      missionTitle: asString(teamPageCopyCandidate.missionTitle, DEFAULT_TEAM_PAGE_COPY.missionTitle),
      missionBody: asString(teamPageCopyCandidate.missionBody, DEFAULT_TEAM_PAGE_COPY.missionBody),
      impactIntegrityTitle: asString(
        teamPageCopyCandidate.impactIntegrityTitle,
        DEFAULT_TEAM_PAGE_COPY.impactIntegrityTitle,
      ),
      impactIntegrityBody: asString(
        teamPageCopyCandidate.impactIntegrityBody,
        DEFAULT_TEAM_PAGE_COPY.impactIntegrityBody,
      ),
      impactInnovationTitle: asString(
        teamPageCopyCandidate.impactInnovationTitle,
        DEFAULT_TEAM_PAGE_COPY.impactInnovationTitle,
      ),
      impactInnovationBody: asString(
        teamPageCopyCandidate.impactInnovationBody,
        DEFAULT_TEAM_PAGE_COPY.impactInnovationBody,
      ),
      impactCommunityTitle: asString(
        teamPageCopyCandidate.impactCommunityTitle,
        DEFAULT_TEAM_PAGE_COPY.impactCommunityTitle,
      ),
      impactCommunityBody: asString(
        teamPageCopyCandidate.impactCommunityBody,
        DEFAULT_TEAM_PAGE_COPY.impactCommunityBody,
      ),
    },
    homePageCopy: {
      ctaTitle: asString(homePageCopyCandidate.ctaTitle, DEFAULT_HOME_PAGE_COPY.ctaTitle),
      ctaBody: asString(homePageCopyCandidate.ctaBody, DEFAULT_HOME_PAGE_COPY.ctaBody),
      mediaWallEyebrow: asString(homePageCopyCandidate.mediaWallEyebrow, DEFAULT_HOME_PAGE_COPY.mediaWallEyebrow),
      mediaWallTitle: asString(homePageCopyCandidate.mediaWallTitle, DEFAULT_HOME_PAGE_COPY.mediaWallTitle),
      mediaWallSubtitle: asString(
        homePageCopyCandidate.mediaWallSubtitle,
        DEFAULT_HOME_PAGE_COPY.mediaWallSubtitle,
      ),
    },
    navbarDraggable: mergeNavbarDraggableFromApi(navbarDraggableCandidate),
    karshaFloatingNav: {
      desktopTopPx: asNumber(
        karshaFloatingNavCandidate.desktopTopPx,
        DEFAULT_CONFIG.karshaFloatingNav.desktopTopPx,
      ),
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
  writeDataToFile('config.json', config);
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
      set: async (key, value: unknown) =>
        redisSocketClient.set(key, typeof value === 'string' ? value : JSON.stringify(value)),
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
  return getStoredData('films.json', FILMS_STORAGE_KEY, []);
}

export async function saveFilms(films: any[]) {
  return saveStoredData('films.json', FILMS_STORAGE_KEY, films);
}

export async function getFeaturedFilms() {
  return getStoredData('featuredFilms.json', FEATURED_FILMS_STORAGE_KEY, []);
}

export async function saveFeaturedFilms(films: any[]) {
  return saveStoredData('featuredFilms.json', FEATURED_FILMS_STORAGE_KEY, films);
}

export async function getTeam() {
  return getStoredData('team.json', TEAM_STORAGE_KEY, []);
}

export async function saveTeam(team: any[]) {
  return saveStoredData('team.json', TEAM_STORAGE_KEY, team);
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
      await redis.set(CONFIG_STORAGE_KEY, JSON.stringify(seeded));
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
      // Upstash REST expects a string value; passing an object can fail or stringify incorrectly.
      await redis.set(CONFIG_STORAGE_KEY, JSON.stringify(normalized));
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
  return getStoredData('karshaNuns.json', KARSHA_STORAGE_KEY, {});
}

export async function saveKarshaNuns(content: any) {
  return saveStoredData('karshaNuns.json', KARSHA_STORAGE_KEY, content);
}

export async function getBreakingTheSilence() {
  return getStoredData('breakingTheSilence.json', BREAKING_STORAGE_KEY, {});
}

export async function saveBreakingTheSilence(content: any) {
  return saveStoredData('breakingTheSilence.json', BREAKING_STORAGE_KEY, content);
}

export async function getDonationCampaign() {
  return getStoredData('donationCampaign.json', DONATION_CAMPAIGN_STORAGE_KEY, {});
}

export async function saveDonationCampaign(campaign: any) {
  return saveStoredData('donationCampaign.json', DONATION_CAMPAIGN_STORAGE_KEY, campaign);
}

/**
 * Redis may hold donation projects saved before `sectionColor` existed. Merge that field from
 * repo `donationProjects.json` only when the key is absent (not when explicitly `null` — null
 * means “use page theme” from admin).
 */
function mergeDonationProjectsSectionColorsFromFile(stored: unknown, filePayload: unknown): unknown {
  if (!isObject(stored) || !Array.isArray((stored as { projects?: unknown }).projects)) {
    return stored;
  }
  const fileObj = isObject(filePayload) && Array.isArray((filePayload as { projects?: unknown }).projects)
    ? (filePayload as { projects: unknown[] })
    : { projects: [] as unknown[] };
  const defaultById = new Map<string, { sectionColor?: unknown }>();
  for (const row of fileObj.projects) {
    if (!isObject(row) || typeof row.id !== 'string') continue;
    defaultById.set(row.id, row as { sectionColor?: unknown });
  }
  const projects = (stored as { projects: Record<string, unknown>[] }).projects.map((p) => {
    if (!isObject(p) || typeof p.id !== 'string') return p;
    if ('sectionColor' in p) return p;
    const def = defaultById.get(p.id);
    const cand =
      def && typeof def.sectionColor === 'string' ? def.sectionColor : undefined;
    const normalized = normalizeDonationSectionHex(cand);
    return normalized ? { ...p, sectionColor: normalized } : p;
  });
  return { ...(stored as Record<string, unknown>), projects };
}

export async function getDonationProjects() {
  const raw = await getStoredData('donationProjects.json', DONATION_PROJECTS_STORAGE_KEY, {});
  const fileDefaults = readDataFromFile('donationProjects.json', { projects: [] });
  return mergeDonationProjectsSectionColorsFromFile(raw, fileDefaults);
}

export async function saveDonationProjects(payload: any) {
  return saveStoredData('donationProjects.json', DONATION_PROJECTS_STORAGE_KEY, payload);
}

export async function getDiscussionTabs() {
  return getStoredData('discussionTabs.json', DISCUSSION_TABS_STORAGE_KEY, { tabs: [] });
}

export async function saveDiscussionTabs(payload: any) {
  return saveStoredData('discussionTabs.json', DISCUSSION_TABS_STORAGE_KEY, payload);
}


export async function getDiscussionMessages(): Promise<Record<string, any[]>> {
  return getStoredData<Record<string, any[]>>('discussionMessages.json', DISCUSSION_MESSAGES_STORAGE_KEY, {});
}

export async function saveDiscussionMessages(payload: any) {
  return saveStoredData('discussionMessages.json', DISCUSSION_MESSAGES_STORAGE_KEY, payload);
}

export async function getUsers() {
  return getStoredData('users.json', USERS_STORAGE_KEY, []);
}

export async function saveUsers(users: any[]) {
  return saveStoredData('users.json', USERS_STORAGE_KEY, users);
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
  const normalized = await getStoredData('news.json', NEWS_STORAGE_KEY, []);
  const filtered = normalized.filter((item: any) => isAuroraEyeRelatedStory(item));
  const final = normalizeNewsList(filtered);
  return final;
}

export async function saveNews(news: NewsStory[]) {
  const filtered = news.filter((item) => isAuroraEyeRelatedStory(item));
  return saveStoredData('news.json', NEWS_STORAGE_KEY, normalizeNewsList(filtered));
}

function normalizeYouTubeUrl(url: string) {
  if (!url) return url;
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

export async function upsertGeneratedNews(
  generatedItems: Array<
    Pick<NewsStory, 'title' | 'summary' | 'url' | 'source' | 'image' | 'publishedAt' | 'tags'>
  >,
) {
  const current = await getNews();
  const now = new Date().toISOString();
  const byUrl = new Map(current.map((item) => [normalizeYouTubeUrl(item.url), item]));
  let createdCount = 0;
  let updatedCount = 0;

  for (const incoming of generatedItems) {
    if (!incoming.url || !incoming.title) {
      continue;
    }

    if (!isAuroraEyeRelatedStory(incoming)) {
      continue;
    }

    const normalizedUrl = normalizeYouTubeUrl(incoming.url);
    const existing = byUrl.get(normalizedUrl);

    if (existing) {
      byUrl.set(normalizedUrl, {
        ...existing,
        title: incoming.title || existing.title,
        summary: incoming.summary || existing.summary,
        source: incoming.source || existing.source,
        image: incoming.image || existing.image,
        publishedAt: incoming.publishedAt || existing.publishedAt,
        tags: incoming.tags?.length ? incoming.tags : existing.tags,
        url: normalizedUrl, // Use normalized URL
        updatedAt: now,
      });
      updatedCount += 1;
      continue;
    }

    const id = `news-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    byUrl.set(normalizedUrl, {
      id,
      title: incoming.title,
      summary: incoming.summary,
      url: normalizedUrl, // Use normalized URL
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
