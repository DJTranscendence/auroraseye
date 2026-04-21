'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import styles from './Hero.module.css';
import { ArrowRight, Youtube, Settings } from 'lucide-react';
import Link from 'next/link';
import { trackYouTubeClick } from '@/utils/youtubeAnalytics';
import fallbackConfig from '@/data/config.json';
import { getNavbarDraggableForHeroPublish } from '@/config/navbar-draggable-publish-bridge';

const HERO_TITLES = [
  'Storytelling through Light & Life',
  'Direction. Camera. Truth.',
  'Cinematography that serves story',
  'From Auroville to the world',
];

const HERO_VIDEO_TIME_KEY = 'hero_video_time';
const HERO_TITLE_CYCLE_KEY = 'hero_title_cycle_state';
const HERO_VIDEO_CONTROL_KEY = 'hero_video_controls';
const HERO_VIDEO_CONTROL_MOBILE_KEY = 'hero_video_controls_mobile';
const HERO_TITLE_CYCLE_MS = 6000;
const HERO_VIDEO_START_OFFSET_SECONDS = 1;
const HERO_ACTIONS_HIDE_FROM_SECONDS = 36.98;
const HERO_ACTIONS_SHOW_AT_SECONDS = 6;
const HERO_YOUTUBE_LOOP_SECONDS = 49;

/** Baseline mobile framing when `controlsMobile` omits a field (avoid inheriting desktop crop). */
const MOBILE_HERO_MEDIA_DEFAULTS = {
  containerTopPx: 0,
  containerPadPx: 0,
  iframeTopPercent: 0,
  iframeLeftPercent: 0,
  iframeWidthPercent: 100,
  iframeHeightPercent: 100,
  videoScale: 1,
  iframeTopCm: 0,
} as const;

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const formatTimecode = (seconds: number) => {
  const safeSeconds = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const minutes = Math.floor(safeSeconds / 60);
  const wholeSeconds = Math.floor(safeSeconds % 60);
  const centiseconds = Math.floor((safeSeconds % 1) * 100);
  return `${minutes.toString().padStart(2, '0')}:${wholeSeconds
    .toString()
    .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
};

type HeroControlState = {
  iframeTopPercent?: number;
  iframeTopCm?: number;
  iframeLeftPercent?: number;
  iframeWidthPercent?: number;
  iframeHeightPercent?: number;
  videoScale?: number;
  containerTopPx?: number;
  containerPadPx?: number;
  actionsOffsetX?: number;
  actionsOffsetY?: number;
  actionsFadeOutFrom?: number;
  actionsFadeOutDuration?: number;
  actionsFadeInAt?: number;
  actionsFadeInDuration?: number;
  scrollOffsetX?: number;
  scrollOffsetY?: number;
  scrollFadeOutFrom?: number;
  scrollFadeOutDuration?: number;
  scrollFadeInAt?: number;
  scrollFadeInDuration?: number;
  supportCtaOffsetX?: number;
  supportCtaOffsetY?: number;
  recruitmentOffsetX?: number;
  recruitmentOffsetY?: number;
};

type PanelDragState = {
  offsetX: number;
  offsetY: number;
  pointerId: number;
};

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function Hero() {
  const [config, setConfig] = useState<any>(fallbackConfig);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [actionsOpacity, setActionsOpacity] = useState(1);
  const [playbackSecondsDisplay, setPlaybackSecondsDisplay] = useState(0);
  const [loopDurationSeconds, setLoopDurationSeconds] = useState(HERO_YOUTUBE_LOOP_SECONDS);
  const [activeTitleIndex, setActiveTitleIndex] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const [controlsVisible, setControlsVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPublishingLayout, setIsPublishingLayout] = useState(false);
  const [layoutStatus, setLayoutStatus] = useState('');
  const [hasLocalControlState, setHasLocalControlState] = useState<boolean | null>(null);
  const [hasLocalMobileControlState, setHasLocalMobileControlState] = useState<boolean | null>(null);
  const [mobileControlsHydrated, setMobileControlsHydrated] = useState(false);
  const [controlsMode, setControlsMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [panelOpacity, setPanelOpacity] = useState(0.8);
  const [iframeTopPercent, setIframeTopPercent] = useState(5);
  const [iframeTopCm, setIframeTopCm] = useState(-5);
  const [iframeLeftPercent, setIframeLeftPercent] = useState(-10);
  const [iframeWidthPercent, setIframeWidthPercent] = useState(110);
  const [iframeHeightPercent, setIframeHeightPercent] = useState(110);
  const [videoScale, setVideoScale] = useState(1);
  const [containerTopPx, setContainerTopPx] = useState(0);
  const [containerPadPx, setContainerPadPx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [panelPosition, setPanelPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [controlsHydrated, setControlsHydrated] = useState(false);
  const [actionsOffsetX, setActionsOffsetX] = useState(0);
  const [actionsOffsetY, setActionsOffsetY] = useState(0);
  const [actionsFadeOutFrom, setActionsFadeOutFrom] = useState(HERO_ACTIONS_HIDE_FROM_SECONDS);
  const [actionsFadeInAt, setActionsFadeInAt] = useState(HERO_ACTIONS_SHOW_AT_SECONDS);
  const [actionsFadeOutDuration, setActionsFadeOutDuration] = useState(2.5);
  const [actionsFadeInDuration, setActionsFadeInDuration] = useState(3);
  const [scrollOffsetX, setScrollOffsetX] = useState(0);
  const [scrollOffsetY, setScrollOffsetY] = useState(0);
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [scrollFadeOutFrom, setScrollFadeOutFrom] = useState(HERO_ACTIONS_HIDE_FROM_SECONDS);
  const [scrollFadeInAt, setScrollFadeInAt] = useState(HERO_ACTIONS_SHOW_AT_SECONDS);
  const [scrollFadeOutDuration, setScrollFadeOutDuration] = useState(2.5);
  const [scrollFadeInDuration, setScrollFadeInDuration] = useState(3);
  const [supportCtaOffsetX, setSupportCtaOffsetX] = useState(0);
  const [supportCtaOffsetY, setSupportCtaOffsetY] = useState(0);
  const [recruitmentOffsetX, setRecruitmentOffsetX] = useState(0);
  const [recruitmentOffsetY, setRecruitmentOffsetY] = useState(0);
  const [mobileControls, setMobileControls] = useState<HeroControlState>({});

  const updateMobileControl = (key: keyof HeroControlState, value: number) => {
    setMobileControls((prev) => ({ ...prev, [key]: value }));
  };

  const pickOverride = (override: number | undefined, fallback: number) =>
    isMobileViewport && Number.isFinite(override) ? (override as number) : fallback;

  const pickMobileHeroMedia = (
    key: keyof typeof MOBILE_HERO_MEDIA_DEFAULTS,
    override: number | undefined,
    desktopValue: number,
  ): number => {
    if (!isMobileViewport) {
      return desktopValue;
    }
    if (Number.isFinite(override)) {
      return override as number;
    }
    return MOBILE_HERO_MEDIA_DEFAULTS[key];
  };

  const buildControlState = (): HeroControlState => ({
    iframeTopPercent,
    iframeTopCm,
    iframeLeftPercent,
    iframeWidthPercent,
    iframeHeightPercent,
    videoScale,
    containerTopPx,
    containerPadPx,
    actionsOffsetX,
    actionsOffsetY,
    actionsFadeOutFrom,
    actionsFadeOutDuration,
    actionsFadeInAt,
    actionsFadeInDuration,
    scrollOffsetX,
    scrollOffsetY,
    scrollFadeOutFrom,
    scrollFadeOutDuration,
    scrollFadeInAt,
    scrollFadeInDuration,
    supportCtaOffsetX,
    supportCtaOffsetY,
    recruitmentOffsetX,
    recruitmentOffsetY,
  });

  const buildMobileControlState = (): HeroControlState => ({
    ...MOBILE_HERO_MEDIA_DEFAULTS,
    ...mobileControls,
  });

  const effectiveContainerTopPx = pickMobileHeroMedia(
    'containerTopPx',
    mobileControls.containerTopPx,
    containerTopPx,
  );
  const effectiveContainerPadPx = pickMobileHeroMedia(
    'containerPadPx',
    mobileControls.containerPadPx,
    containerPadPx,
  );
  const effectiveIframeTopPercent = pickMobileHeroMedia(
    'iframeTopPercent',
    mobileControls.iframeTopPercent,
    iframeTopPercent,
  );
  const effectiveIframeLeftPercent = pickMobileHeroMedia(
    'iframeLeftPercent',
    mobileControls.iframeLeftPercent,
    iframeLeftPercent,
  );
  const effectiveIframeWidthPercent = pickMobileHeroMedia(
    'iframeWidthPercent',
    mobileControls.iframeWidthPercent,
    iframeWidthPercent,
  );
  const effectiveIframeHeightPercent = pickMobileHeroMedia(
    'iframeHeightPercent',
    mobileControls.iframeHeightPercent,
    iframeHeightPercent,
  );
  const effectiveVideoScale = pickMobileHeroMedia('videoScale', mobileControls.videoScale, videoScale);
  const effectiveActionsOffsetX = pickOverride(mobileControls.actionsOffsetX, actionsOffsetX);
  const effectiveActionsOffsetY = pickOverride(mobileControls.actionsOffsetY, actionsOffsetY);
  const effectiveRecruitmentOffsetX = pickOverride(mobileControls.recruitmentOffsetX, recruitmentOffsetX);
  const effectiveRecruitmentOffsetY = pickOverride(mobileControls.recruitmentOffsetY, recruitmentOffsetY);
  const effectiveSupportCtaOffsetX = pickOverride(mobileControls.supportCtaOffsetX, supportCtaOffsetX);
  const effectiveSupportCtaOffsetY = pickOverride(mobileControls.supportCtaOffsetY, supportCtaOffsetY);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw);
        setIsAdmin(user?.role === 'admin');
      }
    } catch (e) {
      console.error('Failed to read user role', e);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateViewport = () => {
      setIsMobileViewport(window.innerWidth <= 768);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (isMobileViewport) {
      setControlsMode('mobile');
    }
  }, [isMobileViewport]);

  const togglePause = () => {
    setIsPaused((prev) => {
      const next = !prev;
      if (youtubePlayerRef.current) {
        if (next) {
          youtubePlayerRef.current.pauseVideo?.();
        } else {
          youtubePlayerRef.current.playVideo?.();
        }
      }
      if (videoRef.current) {
        if (next) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
      }
      return next;
    });
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(event.target.value);
    setPlaybackSecondsDisplay(time);
    if (isYouTube && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(time, true);
    } else if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const centerVideo = () => {
    if (controlsMode === 'mobile') {
      const w =
        mobileControls.iframeWidthPercent ?? MOBILE_HERO_MEDIA_DEFAULTS.iframeWidthPercent;
      const h =
        mobileControls.iframeHeightPercent ?? MOBILE_HERO_MEDIA_DEFAULTS.iframeHeightPercent;
      const nextLeft = (100 - w) / 2;
      const nextTop = (100 - h) / 2;
      setMobileControls((prev) => ({
        ...prev,
        iframeLeftPercent: Number.isFinite(nextLeft) ? nextLeft : 0,
        iframeTopPercent: Number.isFinite(nextTop) ? nextTop : 0,
        iframeTopCm: 0,
      }));
      return;
    }

    const nextLeft = (100 - iframeWidthPercent) / 2;
    const nextTop = (100 - iframeHeightPercent) / 2;
    setIframeLeftPercent(Number.isFinite(nextLeft) ? nextLeft : 0);
    setIframeTopPercent(Number.isFinite(nextTop) ? nextTop : 0);
    setIframeTopCm(0);
  };

  const centerScrollHoriz = () => {
    setScrollOffsetX(0);
  };

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    const savedState = readControlState();
    if (savedState) {
      if (savedState.actionsOffsetX) setActionsOffsetX(savedState.actionsOffsetX);
      if (savedState.actionsOffsetY) setActionsOffsetY(savedState.actionsOffsetY);
      if (savedState.scrollOffsetX) setScrollOffsetX(savedState.scrollOffsetX);
      if (savedState.scrollOffsetY) setScrollOffsetY(savedState.scrollOffsetY);
      if (savedState.supportCtaOffsetX) setSupportCtaOffsetX(savedState.supportCtaOffsetX);
      if (savedState.supportCtaOffsetY) setSupportCtaOffsetY(savedState.supportCtaOffsetY);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (controlsHydrated && isAdmin) {
      const state: HeroControlState = {
        iframeTopPercent,
        iframeTopCm,
        iframeLeftPercent,
        iframeWidthPercent,
        iframeHeightPercent,
        videoScale,
        containerTopPx,
        containerPadPx,
        actionsOffsetX,
        actionsOffsetY,
        scrollOffsetX,
        scrollOffsetY,
        supportCtaOffsetX,
        supportCtaOffsetY,
      };
      writeControlState(state);
    }
  }, [
    iframeTopPercent,
    iframeTopCm,
    iframeLeftPercent,
    iframeWidthPercent,
    iframeHeightPercent,
    videoScale,
    containerTopPx,
    containerPadPx,
    actionsOffsetX,
    actionsOffsetY,
    scrollOffsetX,
    scrollOffsetY,
    supportCtaOffsetX,
    supportCtaOffsetY,
    controlsHydrated,
    isAdmin,
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubePlayerHostRef = useRef<HTMLIFrameElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const savedVideoTimeRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelDragRef = useRef<PanelDragState | null>(null);

  const heroVideoUrl = config?.hero?.videoUrl ?? '';
  const youtubeChannelUrl =
    config?.contact?.youtube ?? 'https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw';
  const isYouTube = heroVideoUrl.includes('youtube.com') || heroVideoUrl.includes('youtu.be');
  const isDirectVideo = heroVideoUrl.endsWith('.mp4');
  const youtubeVideoId = useMemo(() => getYouTubeId(heroVideoUrl), [heroVideoUrl]);

  const readControlState = (): HeroControlState | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const raw = localStorage.getItem(HERO_VIDEO_CONTROL_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to read hero control state', e);
    }
    return null;
  };

  const writeControlState = (state: HeroControlState) => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(HERO_VIDEO_CONTROL_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to write hero control state', e);
    }
  };

  const youtubeEmbedUrl = useMemo(() => {
    if (!youtubeVideoId) {
      return '';
    }

    const url = new URL(`https://www.youtube-nocookie.com/embed/${youtubeVideoId}`);
    url.searchParams.set('autoplay', '1');
    url.searchParams.set('controls', '0');
    url.searchParams.set('mute', '1');
    url.searchParams.set('loop', '1');
    url.searchParams.set('rel', '0');
    url.searchParams.set('modestbranding', '1');
    url.searchParams.set('iv_load_policy', '3');
    url.searchParams.set('showinfo', '0');
    url.searchParams.set('disablekb', '1');
    url.searchParams.set('fs', '0');
    url.searchParams.set('playsinline', '1');
    url.searchParams.set('playlist', youtubeVideoId);
    url.searchParams.set('start', HERO_VIDEO_START_OFFSET_SECONDS.toString());
    url.searchParams.set('enablejsapi', '1');
    return url.toString();
  }, [youtubeVideoId]);
  const heroDescription = (config?.hero?.description ?? '').replace(/[—–]/g, '-');

  const readTitleCycleState = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const raw = sessionStorage.getItem(HERO_TITLE_CYCLE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as { index?: number; timestamp?: number };
      if (!Number.isFinite(parsed.index) || !Number.isFinite(parsed.timestamp)) {
        return null;
      }

      const index = Math.max(0, Math.floor(parsed.index as number)) % HERO_TITLES.length;
      const timestamp = Math.max(0, Math.floor(parsed.timestamp as number));
      return { index, timestamp };
    } catch {
      return null;
    }
  };

  const writeTitleCycleState = (index: number, timestamp: number) => {
    if (typeof window === 'undefined') {
      return;
    }

    const normalized = {
      index: ((index % HERO_TITLES.length) + HERO_TITLES.length) % HERO_TITLES.length,
      timestamp: Math.max(0, Math.floor(timestamp)),
    };

    sessionStorage.setItem(HERO_TITLE_CYCLE_KEY, JSON.stringify(normalized));
  };

  const readSavedTime = () => {
    if (typeof window === 'undefined') {
      return HERO_VIDEO_START_OFFSET_SECONDS;
    }

    const raw = sessionStorage.getItem(HERO_VIDEO_TIME_KEY);
    const numeric = raw ? Number(raw) : HERO_VIDEO_START_OFFSET_SECONDS;
    const normalized = Number.isFinite(numeric) ? numeric : HERO_VIDEO_START_OFFSET_SECONDS;
    return normalized > 0 ? normalized : HERO_VIDEO_START_OFFSET_SECONDS;
  };

  const writeSavedTime = (time: number) => {
    if (typeof window === 'undefined') {
      return;
    }

    const next = Number.isFinite(time) ? Math.max(0, time) : 0;
    sessionStorage.setItem(HERO_VIDEO_TIME_KEY, next.toString());
  };

  const readHeroControlState = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const raw = localStorage.getItem(HERO_VIDEO_CONTROL_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as HeroControlState;
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  };

  const writeHeroControlState = (state: HeroControlState) => {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(HERO_VIDEO_CONTROL_KEY, JSON.stringify(state));
  };

  const readMobileControlState = (): HeroControlState | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const raw = localStorage.getItem(HERO_VIDEO_CONTROL_MOBILE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as HeroControlState;
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  };

  const writeMobileControlState = (state: HeroControlState) => {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(HERO_VIDEO_CONTROL_MOBILE_KEY, JSON.stringify(state));
  };

  useEffect(() => {
    let isMounted = true;

    fetch('/api/cms?type=config', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch config: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setConfig(data);
      })
      .catch(() => {
        // Keep fallback config if CMS is unavailable.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || panelPosition || !controlsVisible) {
      return;
    }

    const rect = panelRef.current?.getBoundingClientRect();
    const panelHeight = rect?.height ?? 220;
    const nextY = Math.max(16, window.innerHeight - panelHeight - 32);
    setPanelPosition({ x: 32, y: nextY });
  }, [controlsVisible, panelPosition]);

  useEffect(() => {
    if (!isAdmin) {
      setHasLocalControlState(false);
      return;
    }
    const saved = readHeroControlState();
    if (!saved) {
      setHasLocalControlState(false);
      return;
    }

    if (Number.isFinite(saved.iframeTopPercent)) {
      setIframeTopPercent(saved.iframeTopPercent as number);
    }
    if (Number.isFinite(saved.iframeTopCm)) {
      setIframeTopCm(saved.iframeTopCm as number);
    }
    if (Number.isFinite(saved.iframeLeftPercent)) {
      setIframeLeftPercent(saved.iframeLeftPercent as number);
    }
    if (Number.isFinite(saved.iframeWidthPercent)) {
      setIframeWidthPercent(saved.iframeWidthPercent as number);
    }
    if (Number.isFinite(saved.iframeHeightPercent)) {
      setIframeHeightPercent(saved.iframeHeightPercent as number);
    }
    if (Number.isFinite(saved.videoScale)) {
      setVideoScale(saved.videoScale as number);
    }
    if (Number.isFinite(saved.containerTopPx)) {
      setContainerTopPx(saved.containerTopPx as number);
    }
    if (Number.isFinite(saved.containerPadPx)) {
      setContainerPadPx(saved.containerPadPx as number);
    }
    if (Number.isFinite(saved.actionsOffsetX)) {
      setActionsOffsetX(saved.actionsOffsetX as number);
    }
    if (Number.isFinite(saved.actionsOffsetY)) {
      setActionsOffsetY(saved.actionsOffsetY as number);
    }
    if (Number.isFinite(saved.actionsFadeOutFrom)) {
      setActionsFadeOutFrom(saved.actionsFadeOutFrom as number);
    }
    if (Number.isFinite(saved.actionsFadeOutDuration)) {
      setActionsFadeOutDuration(saved.actionsFadeOutDuration as number);
    }
    if (Number.isFinite(saved.actionsFadeInAt)) {
      setActionsFadeInAt(saved.actionsFadeInAt as number);
    }
    if (Number.isFinite(saved.actionsFadeInDuration)) {
      setActionsFadeInDuration(saved.actionsFadeInDuration as number);
    }
    if (Number.isFinite(saved.scrollOffsetX)) {
      setScrollOffsetX(saved.scrollOffsetX as number);
    }
    if (Number.isFinite(saved.scrollOffsetY)) {
      setScrollOffsetY(saved.scrollOffsetY as number);
    }
    if (Number.isFinite(saved.scrollFadeOutFrom)) {
      setScrollFadeOutFrom(saved.scrollFadeOutFrom as number);
    }
    if (Number.isFinite(saved.scrollFadeOutDuration)) {
      setScrollFadeOutDuration(saved.scrollFadeOutDuration as number);
    }
    if (Number.isFinite(saved.scrollFadeInAt)) {
      setScrollFadeInAt(saved.scrollFadeInAt as number);
    }
    if (Number.isFinite(saved.scrollFadeInDuration)) {
      setScrollFadeInDuration(saved.scrollFadeInDuration as number);
    }
    if (Number.isFinite(saved.supportCtaOffsetX)) {
      setSupportCtaOffsetX(saved.supportCtaOffsetX as number);
    }
    if (Number.isFinite(saved.supportCtaOffsetY)) {
      setSupportCtaOffsetY(saved.supportCtaOffsetY as number);
    }
    if (Number.isFinite(saved.recruitmentOffsetX)) {
      setRecruitmentOffsetX(saved.recruitmentOffsetX as number);
    }
    if (Number.isFinite(saved.recruitmentOffsetY)) {
      setRecruitmentOffsetY(saved.recruitmentOffsetY as number);
    }
    setHasLocalControlState(true);
    setControlsHydrated(true);
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      setHasLocalMobileControlState(false);
      return;
    }
    const savedMobile = readMobileControlState();
    if (!savedMobile) {
      setHasLocalMobileControlState(false);
      return;
    }

    setMobileControls(savedMobile);
    setHasLocalMobileControlState(true);
    setMobileControlsHydrated(true);
  }, [isAdmin]);

  useEffect(() => {
    if (hasLocalControlState !== false || controlsHydrated) {
      return;
    }

    const controlsFromConfig = config?.hero?.controls as HeroControlState | undefined;
    if (!controlsFromConfig) {
      setControlsHydrated(true);
      return;
    }

    if (Number.isFinite(controlsFromConfig.iframeTopPercent)) {
      setIframeTopPercent(controlsFromConfig.iframeTopPercent as number);
    }
    if (Number.isFinite(controlsFromConfig.iframeTopCm)) {
      setIframeTopCm(controlsFromConfig.iframeTopCm as number);
    }
    if (Number.isFinite(controlsFromConfig.iframeLeftPercent)) {
      setIframeLeftPercent(controlsFromConfig.iframeLeftPercent as number);
    }
    if (Number.isFinite(controlsFromConfig.iframeWidthPercent)) {
      setIframeWidthPercent(controlsFromConfig.iframeWidthPercent as number);
    }
    if (Number.isFinite(controlsFromConfig.iframeHeightPercent)) {
      setIframeHeightPercent(controlsFromConfig.iframeHeightPercent as number);
    }
    if (Number.isFinite(controlsFromConfig.videoScale)) {
      setVideoScale(controlsFromConfig.videoScale as number);
    }
    if (Number.isFinite(controlsFromConfig.containerTopPx)) {
      setContainerTopPx(controlsFromConfig.containerTopPx as number);
    }
    if (Number.isFinite(controlsFromConfig.containerPadPx)) {
      setContainerPadPx(controlsFromConfig.containerPadPx as number);
    }
    if (Number.isFinite(controlsFromConfig.actionsOffsetX)) {
      setActionsOffsetX(controlsFromConfig.actionsOffsetX as number);
    }
    if (Number.isFinite(controlsFromConfig.actionsOffsetY)) {
      setActionsOffsetY(controlsFromConfig.actionsOffsetY as number);
    }
    if (Number.isFinite(controlsFromConfig.actionsFadeOutFrom)) {
      setActionsFadeOutFrom(controlsFromConfig.actionsFadeOutFrom as number);
    }
    if (Number.isFinite(controlsFromConfig.actionsFadeOutDuration)) {
      setActionsFadeOutDuration(controlsFromConfig.actionsFadeOutDuration as number);
    }
    if (Number.isFinite(controlsFromConfig.actionsFadeInAt)) {
      setActionsFadeInAt(controlsFromConfig.actionsFadeInAt as number);
    }
    if (Number.isFinite(controlsFromConfig.actionsFadeInDuration)) {
      setActionsFadeInDuration(controlsFromConfig.actionsFadeInDuration as number);
    }
    if (Number.isFinite(controlsFromConfig.scrollOffsetX)) {
      setScrollOffsetX(controlsFromConfig.scrollOffsetX as number);
    }
    if (Number.isFinite(controlsFromConfig.scrollOffsetY)) {
      setScrollOffsetY(controlsFromConfig.scrollOffsetY as number);
    }
    if (Number.isFinite(controlsFromConfig.scrollFadeOutFrom)) {
      setScrollFadeOutFrom(controlsFromConfig.scrollFadeOutFrom as number);
    }
    if (Number.isFinite(controlsFromConfig.scrollFadeOutDuration)) {
      setScrollFadeOutDuration(controlsFromConfig.scrollFadeOutDuration as number);
    }
    if (Number.isFinite(controlsFromConfig.scrollFadeInAt)) {
      setScrollFadeInAt(controlsFromConfig.scrollFadeInAt as number);
    }
    if (Number.isFinite(controlsFromConfig.scrollFadeInDuration)) {
      setScrollFadeInDuration(controlsFromConfig.scrollFadeInDuration as number);
    }
    if (Number.isFinite(controlsFromConfig.supportCtaOffsetX)) {
      setSupportCtaOffsetX(controlsFromConfig.supportCtaOffsetX as number);
    }
    if (Number.isFinite(controlsFromConfig.supportCtaOffsetY)) {
      setSupportCtaOffsetY(controlsFromConfig.supportCtaOffsetY as number);
    }
    if (Number.isFinite(controlsFromConfig.recruitmentOffsetX)) {
      setRecruitmentOffsetX(controlsFromConfig.recruitmentOffsetX as number);
    }
    if (Number.isFinite(controlsFromConfig.recruitmentOffsetY)) {
      setRecruitmentOffsetY(controlsFromConfig.recruitmentOffsetY as number);
    }

    writeHeroControlState(controlsFromConfig);
    setControlsHydrated(true);
  }, [config, controlsHydrated, hasLocalControlState]);

  useEffect(() => {
    if (hasLocalMobileControlState !== false || mobileControlsHydrated) {
      return;
    }

    const controlsFromConfig = (config?.hero?.controlsMobile ?? config?.hero?.controls) as
      | HeroControlState
      | undefined;
    if (!controlsFromConfig) {
      setMobileControlsHydrated(true);
      return;
    }

    setMobileControls(controlsFromConfig);
    writeMobileControlState(controlsFromConfig);
    setMobileControlsHydrated(true);
  }, [config, hasLocalMobileControlState, mobileControlsHydrated]);

  useEffect(() => {
    if (!controlsHydrated) {
      return;
    }
    if (!isAdmin) {
      return;
    }
    const nextDesktopState = buildControlState();
    writeHeroControlState(nextDesktopState);
  }, [
    isAdmin,
    controlsHydrated,
    iframeTopPercent,
    iframeTopCm,
    iframeLeftPercent,
    iframeWidthPercent,
    iframeHeightPercent,
    videoScale,
    containerTopPx,
    containerPadPx,
    actionsOffsetX,
    actionsOffsetY,
    actionsFadeOutFrom,
    actionsFadeOutDuration,
    actionsFadeInAt,
    actionsFadeInDuration,
    scrollOffsetX,
    scrollOffsetY,
    scrollFadeOutFrom,
    scrollFadeOutDuration,
    scrollFadeInAt,
    scrollFadeInDuration,
    supportCtaOffsetX,
    supportCtaOffsetY,
    recruitmentOffsetX,
    recruitmentOffsetY,
  ]);

  useEffect(() => {
    if (!mobileControlsHydrated) {
      return;
    }
    if (!isAdmin) {
      return;
    }
    writeMobileControlState(buildMobileControlState());
  }, [mobileControls, mobileControlsHydrated, isAdmin]);

  const handlePublishLayout = async () => {
    if (!isAdmin || isPublishingLayout) {
      return;
    }

    setIsPublishingLayout(true);
    setLayoutStatus('Publishing layout...');

    try {
      const response = await fetch('/api/cms?type=config', { cache: 'no-store' });
      const current = response.ok ? await response.json() : config;
      const liveNav = getNavbarDraggableForHeroPublish();
      const nextConfig = {
        ...current,
        ...(liveNav ? { navbarDraggable: liveNav } : {}),
        hero: {
          ...current?.hero,
          controls: buildControlState(),
          controlsMobile: buildMobileControlState(),
        },
      };

      const saveResponse = await fetch('/api/cms?type=config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig),
      });

      if (!saveResponse.ok) {
        throw new Error('Save failed');
      }

      setConfig(nextConfig);
      setLayoutStatus('Layout published to site.');
    } catch (error) {
      console.error('Failed to publish layout', error);
      setLayoutStatus('Publish failed.');
    } finally {
      setIsPublishingLayout(false);
    }
  };

  const handlePanelPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !panelRef.current) {
      return;
    }

    const rect = panelRef.current.getBoundingClientRect();
    panelDragRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      pointerId: event.pointerId,
    };
    setIsDraggingPanel(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePanelPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = panelDragRef.current;
    if (!dragState || !panelRef.current || dragState.pointerId !== event.pointerId) {
      return;
    }

    const rect = panelRef.current.getBoundingClientRect();
    const nextX = event.clientX - dragState.offsetX;
    const nextY = event.clientY - dragState.offsetY;
    const maxX = window.innerWidth - rect.width - 16;
    const maxY = window.innerHeight - rect.height - 16;

    setPanelPosition({
      x: Math.min(Math.max(16, nextX), Math.max(16, maxX)),
      y: Math.min(Math.max(16, nextY), Math.max(16, maxY)),
    });
  };

  const handlePanelPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = panelDragRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    panelDragRef.current = null;
    setIsDraggingPanel(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const now = Date.now();
    const state = readTitleCycleState();

    if (!state) {
      setActiveTitleIndex(0);
      writeTitleCycleState(0, now);
    } else {
      const elapsed = Math.max(0, now - state.timestamp);
      const skippedSteps = Math.floor(elapsed / HERO_TITLE_CYCLE_MS);
      const initialIndex = (state.index + skippedSteps) % HERO_TITLES.length;
      const alignedTimestamp = state.timestamp + skippedSteps * HERO_TITLE_CYCLE_MS;

      setActiveTitleIndex(initialIndex);
      writeTitleCycleState(initialIndex, alignedTimestamp);
    }

    let interval: number;
    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        setActiveTitleIndex((current) => {
          const next = (current + 1) % HERO_TITLES.length;
          writeTitleCycleState(next, Date.now());
          return next;
        });
      }, HERO_TITLE_CYCLE_MS);
    }, HERO_TITLE_CYCLE_MS);

    return () => {
      window.clearTimeout(timeout);
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, []);

  useEffect(() => {
    setIsVideoReady(false);
    setActionsOpacity(1);
    setPlaybackSecondsDisplay(0);
    savedVideoTimeRef.current = 0;
  }, [heroVideoUrl]);

  useEffect(() => {
    if (!isDirectVideo || !videoRef.current) {
      return;
    }

    const videoEl = videoRef.current;

    const restoreDirectVideoTime = () => {
      const savedSeconds = readSavedTime();
      savedVideoTimeRef.current = savedSeconds;
      videoEl.currentTime = savedSeconds;
    };

    const saveDirectVideoTime = () => {
      const current = videoEl.currentTime;
      savedVideoTimeRef.current = current;
      writeSavedTime(current);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        saveDirectVideoTime();
        videoEl.pause();
        return;
      }

      void videoEl.play().catch(() => {});
    };

    const handlePageLeave = () => {
      saveDirectVideoTime();
      videoEl.pause();
    };

    if (videoEl.readyState >= 1) {
      restoreDirectVideoTime();
    }

    videoEl.addEventListener('loadedmetadata', restoreDirectVideoTime);
    videoEl.addEventListener('timeupdate', saveDirectVideoTime);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageLeave);
    window.addEventListener('beforeunload', handlePageLeave);

    const interval = window.setInterval(saveDirectVideoTime, 1500);

    return () => {
      saveDirectVideoTime();
      videoEl.removeEventListener('loadedmetadata', restoreDirectVideoTime);
      videoEl.removeEventListener('timeupdate', saveDirectVideoTime);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageLeave);
      window.removeEventListener('beforeunload', handlePageLeave);
      window.clearInterval(interval);
    };
  }, [isDirectVideo, heroVideoUrl]);

  useEffect(() => {
    if (!isYouTube || !youtubeVideoId) {
      return;
    }

    let isCancelled = false;

    const initPlayer = () => {
      if (isCancelled || !youtubePlayerHostRef.current || !window.YT?.Player) {
        return;
      }

      if (youtubePlayerRef.current?.destroy) {
        try {
          youtubePlayerRef.current.destroy();
        } catch {
          // Ignore stale player teardown issues.
        }
      }

      youtubePlayerRef.current = new window.YT.Player(youtubePlayerHostRef.current, {
        events: {
          onReady: (event: any) => {
            if (isCancelled) {
              return;
            }

            savedVideoTimeRef.current = 0;
            writeSavedTime(0);
            setIsVideoReady(true);
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            if (isCancelled || !window.YT?.PlayerState) {
              return;
            }

            if (event.data === window.YT.PlayerState.ENDED) {
              event.target.seekTo(0, true);
              event.target.playVideo();
              return;
            }

            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsVideoReady(true);
            }
          },
        },
      });
    };

    const ensureYouTubeApi = async () => {
      if (window.YT?.Player) {
        initPlayer();
        return;
      }

      await new Promise<void>((resolve) => {
        const existingScript = document.getElementById('youtube-iframe-api');
        const previousReadyHandler = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          previousReadyHandler?.();
          resolve();
        };

        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'youtube-iframe-api';
          script.src = 'https://www.youtube.com/iframe_api';
          document.body.appendChild(script);
        }
      });

      if (!isCancelled) {
        initPlayer();
      }
    };

    void ensureYouTubeApi();

    return () => {
      isCancelled = true;
      if (youtubePlayerRef.current?.destroy) {
        try {
          youtubePlayerRef.current.destroy();
        } catch {
          // Ignore stale player teardown issues.
        }
      }
      youtubePlayerRef.current = null;
    };
  }, [isYouTube, youtubeVideoId, youtubeEmbedUrl]);

  useEffect(() => {
    const updateActionsOpacity = () => {
      if (isMobileViewport && !isVideoReady) {
        setActionsOpacity(1);
        setScrollOpacity(1);
        return;
      }

      const directVideoTime = videoRef.current?.currentTime;
      const youtubeCurrentTime = youtubePlayerRef.current?.getCurrentTime?.();
      const playbackSeconds = Number.isFinite(directVideoTime)
        ? Number(directVideoTime)
        : Number.isFinite(youtubeCurrentTime)
          ? Number(youtubeCurrentTime)
          : savedVideoTimeRef.current;
      savedVideoTimeRef.current = Math.max(0, playbackSeconds);

      const directVideoDuration = videoRef.current?.duration;
      const youtubeDuration = youtubePlayerRef.current?.getDuration?.();
      const loopDuration = Number.isFinite(directVideoDuration) && Number(directVideoDuration) > 0
        ? Number(directVideoDuration)
        : Number.isFinite(youtubeDuration) && Number(youtubeDuration) > 0
          ? Number(youtubeDuration)
          : HERO_YOUTUBE_LOOP_SECONDS;
      setLoopDurationSeconds((current) => (Math.abs(current - loopDuration) < 0.01 ? current : loopDuration));
      const normalizedSeconds = ((playbackSeconds % loopDuration) + loopDuration) % loopDuration;
      setPlaybackSecondsDisplay(normalizedSeconds);

      let nextOpacity = 1;

      if (normalizedSeconds >= actionsFadeOutFrom) {
        const fadeProgress = (normalizedSeconds - actionsFadeOutFrom) / Math.max(0.1, actionsFadeOutDuration);
        nextOpacity = Math.max(0, 1 - fadeProgress);
      } else if (normalizedSeconds < actionsFadeInAt) {
        const fadeProgress = normalizedSeconds / Math.max(0.1, actionsFadeInDuration);
        nextOpacity = Math.min(1, Math.max(0, fadeProgress));
      }

      setActionsOpacity((current) => (Math.abs(current - nextOpacity) < 0.01 ? current : nextOpacity));

      let nextScrollOpacity = 1;

      if (normalizedSeconds >= scrollFadeOutFrom) {
        const fadeProgress = (normalizedSeconds - scrollFadeOutFrom) / Math.max(0.1, scrollFadeOutDuration);
        nextScrollOpacity = Math.max(0, 1 - fadeProgress);
      } else if (normalizedSeconds < scrollFadeInAt) {
        const fadeProgress = normalizedSeconds / Math.max(0.1, scrollFadeInDuration);
        nextScrollOpacity = Math.min(1, Math.max(0, fadeProgress));
      }

      setScrollOpacity((current) => (Math.abs(current - nextScrollOpacity) < 0.01 ? current : nextScrollOpacity));
    };

    updateActionsOpacity();
    const interval = window.setInterval(updateActionsOpacity, 100);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    isDirectVideo,
    isYouTube,
    heroVideoUrl,
    actionsFadeOutFrom,
    actionsFadeInAt,
    actionsFadeOutDuration,
    actionsFadeInDuration,
    scrollFadeOutFrom,
    scrollFadeInAt,
    scrollFadeOutDuration,
    scrollFadeInDuration,
  ]);

  const supportCtaVisible = playbackSecondsDisplay >= 47;
  const recruitmentOpacity = (() => {
    if (playbackSecondsDisplay < 3) {
      return 0;
    }
    if (playbackSecondsDisplay < 5) {
      return (playbackSecondsDisplay - 3) / 2;
    }
    if (playbackSecondsDisplay < 20) {
      return 1;
    }
    if (playbackSecondsDisplay < 22) {
      return 1 - (playbackSecondsDisplay - 20) / 2;
    }
    return 0;
  })();
  const recruitmentVisible = recruitmentOpacity > 0.02;

  return (
    <section
      className={styles.hero}
      style={
        {
          backgroundImage: `url(${config.hero.bgImage})`,
          '--video-container-top': `${effectiveContainerTopPx}px`,
          '--video-container-height-offset': `${effectiveContainerPadPx}px`,
          '--hero-media-top': `${effectiveIframeTopPercent}%`,
          '--hero-media-top-cm': `${iframeTopCm}cm`,
          '--hero-media-left': `${effectiveIframeLeftPercent}%`,
          '--hero-media-width': `${effectiveIframeWidthPercent}%`,
          '--hero-media-height': `${effectiveIframeHeightPercent}%`,
          '--hero-media-scale': `${effectiveVideoScale}`,
        } as React.CSSProperties
      }
    >
      <div className={styles.videoBackground}>
        <div className={styles.aspectRatioWrapper}>
          {isYouTube ? (
            <iframe
              src={youtubeEmbedUrl}
              title="Hero background video"
              ref={youtubePlayerHostRef}
              allow="autoplay; encrypted-media; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              className={`${styles.heroIframe} ${styles.mediaReady}`}
              onLoad={() => setIsVideoReady(true)}
            />
          ) : isDirectVideo ? (
            <video
              ref={videoRef}
              src={config.hero.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              onLoadedData={() => setIsVideoReady(true)}
              className={`${styles.heroVideo} ${isVideoReady ? styles.mediaReady : styles.mediaPending}`}
            />
          ) : null}
        </div>
        <div className={`${styles.videoOverlay} ${isVideoReady ? styles.videoOverlayHidden : ''}`} />
      </div>
      <Link
        href="/join"
        className={styles.recruitmentLink}
        style={{
          opacity: recruitmentOpacity,
          pointerEvents: recruitmentVisible ? 'auto' : 'none',
          transform: `translate(${effectiveRecruitmentOffsetX}px, ${effectiveRecruitmentOffsetY}px)`,
        }}
        aria-label="Join the Aurora's Eye Team"
      >
        <div className={styles.recruitmentWindow}>
          <div className={styles.recruitmentTrack}>
            <span>
              We want you! Join the dynamic Aurora's Eye Team! Writers, Editors, Designers, show us your stuff! Click here to get in touch.
            </span>
            <span>
              We want you! Join the dynamic Aurora's Eye Team! Writers, Editors, Designers, show us your stuff! Click here to get in touch.
            </span>
          </div>
        </div>
      </Link>
      <div className={`container ${styles.content} animate-fade-in`}>
        <div className={styles.badge}>
          <div className={styles.pulse}></div>
          <span>Documenting the Extraordinary</span>
        </div>
        <h1 className={styles.title}>
          <span key={HERO_TITLES[activeTitleIndex]} className={styles.titleSwap}>
            {HERO_TITLES[activeTitleIndex]}
          </span>
        </h1>
        <p className={styles.description}>{heroDescription}</p>
        <div
          className={styles.actions}
          style={{
            opacity: actionsOpacity,
            pointerEvents: actionsOpacity < 0.05 ? 'none' : 'auto',
            transform: `translate(${effectiveActionsOffsetX}px, ${effectiveActionsOffsetY}px)`,
          }}
        >
          <Link
            href={youtubeChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-primary ${styles.heroYoutubeButton}`}
            onClick={() =>
              trackYouTubeClick({
                label: 'Hero watch on YouTube',
                url: youtubeChannelUrl,
                location: 'hero-primary-cta',
              })
            }
          >
            Watch on YouTube <Youtube size={20} />
          </Link>
          <Link href="/documentaries" className={`btn btn-outline ${styles.exploreFilms}`}>
            Explore Films <ArrowRight size={20} />
          </Link>
          <Link href="#latest-work" className={styles.inlineLink}>
            Latest Work
          </Link>
        </div>
      </div>
      {isAdmin && (
        <div className={styles.timecodeOverlay}>
          <span className={styles.timecodeLabel}>{formatTimecode(playbackSecondsDisplay)}</span>
          <input
            className={styles.timecodeSlider}
            type="range"
            min="0"
            max={Math.max(0.01, loopDurationSeconds)}
            step="0.01"
            value={playbackSecondsDisplay}
            onChange={handleSeek}
            aria-label="Seek video timecode"
          />
        </div>
      )}
      {isAdmin && (
        <div
          style={{
            position: 'fixed',
            left: '2rem',
            bottom: '2rem',
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => setControlsVisible(!controlsVisible)}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '999px',
              padding: '0.6rem',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <Settings size={20} />
          </button>
        </div>
      )}
      {isAdmin && controlsVisible && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            left: panelPosition ? `${panelPosition.x}px` : '2rem',
            top: panelPosition ? `${panelPosition.y}px` : 'auto',
            bottom: panelPosition ? 'auto' : '5.5rem',
            zIndex: 10000,
            background: `rgba(15, 23, 42, ${panelOpacity})`,
            padding: '1.25rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            color: 'white',
            fontSize: '0.85rem',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <div
            onPointerDown={handlePanelPointerDown}
            onPointerMove={handlePanelPointerMove}
            onPointerUp={handlePanelPointerUp}
            onPointerCancel={handlePanelPointerUp}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: isDraggingPanel ? 'grabbing' : 'grab',
              userSelect: 'none',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>Video Adjustments</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Drag</span>
              <button
                type="button"
                onClick={() => setControlsVisible(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  borderRadius: '0.4rem',
                  padding: '0.15rem 0.4rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  lineHeight: 1,
                }}
                aria-label="Close panel"
              >
                ×
              </button>
            </div>
          </div>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            Panel Opacity
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.05"
              value={panelOpacity}
              onChange={(e) => setPanelOpacity(Number(e.target.value))}
              style={{ width: '120px' }}
            />
            <span style={{ width: '40px', textAlign: 'right' }}>{panelOpacity.toFixed(2)}</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <button
              onClick={() => setControlsMode('desktop')}
              style={{
                background: controlsMode === 'desktop' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '0.4rem 0.6rem',
                borderRadius: '0.4rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              Desktop
            </button>
            <button
              onClick={() => setControlsMode('mobile')}
              style={{
                background: controlsMode === 'mobile' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '0.4rem 0.6rem',
                borderRadius: '0.4rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              Mobile
            </button>
          </div>
            <button
              onClick={togglePause}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}
            >
              {isPaused ? 'Play Video' : 'Pause Video'}
            </button>
            <button
              onClick={centerVideo}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}
            >
              Center Video
            </button>
            <button
              onClick={handlePublishLayout}
              disabled={isPublishingLayout}
              style={{
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.6)',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                cursor: isPublishingLayout ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                marginBottom: '0.35rem',
              }}
            >
              {isPublishingLayout ? 'Publishing...' : 'Publish Layout to Site (Saves for all visitors)'}
            </button>
            {layoutStatus ? (
              <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>{layoutStatus}</span>
            ) : null}
            {controlsMode === 'desktop' && (
              <>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  Video X (%)
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={iframeLeftPercent}
                    onChange={(e) => setIframeLeftPercent(Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '30px', textAlign: 'right' }}>{iframeLeftPercent}</span>
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  Video Y (%)
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={iframeTopPercent}
                    onChange={(e) => setIframeTopPercent(Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '30px', textAlign: 'right' }}>{iframeTopPercent}</span>
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  Video Y (cm)
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    step="0.5"
                    value={iframeTopCm}
                    onChange={(e) => setIframeTopCm(Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '30px', textAlign: 'right' }}>{iframeTopCm}</span>
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  Video Scale
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.01"
                    value={videoScale}
                    onChange={(e) => setVideoScale(Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '40px', textAlign: 'right' }}>{videoScale.toFixed(2)}</span>
                </label>
                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.25rem 0' }} />
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  CTA Offset X (px)
                  <input
                    type="range"
                    min="-400"
                    max="400"
                    value={actionsOffsetX}
                    onChange={(e) => setActionsOffsetX(Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '30px', textAlign: 'right' }}>{actionsOffsetX}</span>
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  CTA Offset Y (px)
                  <input
                    type="range"
                    min="-400"
                    max="400"
                    value={actionsOffsetY}
                    onChange={(e) => setActionsOffsetY(Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '30px', textAlign: 'right' }}>{actionsOffsetY}</span>
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  Recruiter X (px)
                  <input
                    type="range"
                    min="-600"
                    max="600"
                    value={recruitmentOffsetX}
                    onChange={(e) => setRecruitmentOffsetX(Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '30px', textAlign: 'right' }}>{recruitmentOffsetX}</span>
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  Recruiter Y (px)
                  <input
                    type="range"
                    min="-600"
                    max="600"
                    value={recruitmentOffsetY}
                    onChange={(e) => setRecruitmentOffsetY(Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '30px', textAlign: 'right' }}>{recruitmentOffsetY}</span>
                </label>
              </>
            )}
            {controlsMode === 'mobile' && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setMobileControls((prev) => ({
                      ...prev,
                      ...MOBILE_HERO_MEDIA_DEFAULTS,
                    }))
                  }
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '0.35rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    marginBottom: '0.35rem',
                  }}
                >
                  Reset mobile framing
                </button>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  Video X (%)
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={mobileControls.iframeLeftPercent ?? MOBILE_HERO_MEDIA_DEFAULTS.iframeLeftPercent}
                    onChange={(e) => updateMobileControl('iframeLeftPercent', Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '30px', textAlign: 'right' }}>
                    {mobileControls.iframeLeftPercent ?? MOBILE_HERO_MEDIA_DEFAULTS.iframeLeftPercent}
                  </span>
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  Video Y (%)
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={mobileControls.iframeTopPercent ?? MOBILE_HERO_MEDIA_DEFAULTS.iframeTopPercent}
                    onChange={(e) => updateMobileControl('iframeTopPercent', Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '30px', textAlign: 'right' }}>
                    {mobileControls.iframeTopPercent ?? MOBILE_HERO_MEDIA_DEFAULTS.iframeTopPercent}
                  </span>
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  Video width (%)
                  <input
                    type="range"
                    min="50"
                    max="160"
                    value={mobileControls.iframeWidthPercent ?? MOBILE_HERO_MEDIA_DEFAULTS.iframeWidthPercent}
                    onChange={(e) => updateMobileControl('iframeWidthPercent', Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '30px', textAlign: 'right' }}>
                    {mobileControls.iframeWidthPercent ?? MOBILE_HERO_MEDIA_DEFAULTS.iframeWidthPercent}
                  </span>
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  Video height (%)
                  <input
                    type="range"
                    min="50"
                    max="160"
                    value={mobileControls.iframeHeightPercent ?? MOBILE_HERO_MEDIA_DEFAULTS.iframeHeightPercent}
                    onChange={(e) => updateMobileControl('iframeHeightPercent', Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '30px', textAlign: 'right' }}>
                    {mobileControls.iframeHeightPercent ?? MOBILE_HERO_MEDIA_DEFAULTS.iframeHeightPercent}
                  </span>
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  Video Scale
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.01"
                    value={mobileControls.videoScale ?? MOBILE_HERO_MEDIA_DEFAULTS.videoScale}
                    onChange={(e) => updateMobileControl('videoScale', Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '40px', textAlign: 'right' }}>
                    {(mobileControls.videoScale ?? MOBILE_HERO_MEDIA_DEFAULTS.videoScale).toFixed(2)}
                  </span>
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  Video area top (px)
                  <input
                    type="range"
                    min="-40"
                    max="120"
                    value={mobileControls.containerTopPx ?? MOBILE_HERO_MEDIA_DEFAULTS.containerTopPx}
                    onChange={(e) => updateMobileControl('containerTopPx', Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '30px', textAlign: 'right' }}>
                    {mobileControls.containerTopPx ?? MOBILE_HERO_MEDIA_DEFAULTS.containerTopPx}
                  </span>
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  Video area pad (px)
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={mobileControls.containerPadPx ?? MOBILE_HERO_MEDIA_DEFAULTS.containerPadPx}
                    onChange={(e) => updateMobileControl('containerPadPx', Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '30px', textAlign: 'right' }}>
                    {mobileControls.containerPadPx ?? MOBILE_HERO_MEDIA_DEFAULTS.containerPadPx}
                  </span>
                </label>
                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.25rem 0' }} />
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  CTA Offset X (px)
                  <input
                    type="range"
                    min="-400"
                    max="400"
                    value={mobileControls.actionsOffsetX ?? 0}
                    onChange={(e) => updateMobileControl('actionsOffsetX', Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '30px', textAlign: 'right' }}>{mobileControls.actionsOffsetX ?? 0}</span>
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  CTA Offset Y (px)
                  <input
                    type="range"
                    min="-400"
                    max="400"
                    value={mobileControls.actionsOffsetY ?? 0}
                    onChange={(e) => updateMobileControl('actionsOffsetY', Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '30px', textAlign: 'right' }}>{mobileControls.actionsOffsetY ?? 0}</span>
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  Recruiter X (px)
                  <input
                    type="range"
                    min="-600"
                    max="600"
                    value={mobileControls.recruitmentOffsetX ?? 0}
                    onChange={(e) => updateMobileControl('recruitmentOffsetX', Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '30px', textAlign: 'right' }}>{mobileControls.recruitmentOffsetX ?? 0}</span>
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  Recruiter Y (px)
                  <input
                    type="range"
                    min="-600"
                    max="600"
                    value={mobileControls.recruitmentOffsetY ?? 0}
                    onChange={(e) => updateMobileControl('recruitmentOffsetY', Number(e.target.value))}
                    style={{ width: '120px' }}
                  />
                  <span style={{ width: '30px', textAlign: 'right' }}>{mobileControls.recruitmentOffsetY ?? 0}</span>
                </label>
              </>
            )}
        </div>
      )}
    </section>
  );
}
