'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import styles from './VideoGallery.module.css';
import Link from 'next/link';
import { ExternalLink, Play, ThumbsUp, SendHorizontal } from 'lucide-react';
import { trackYouTubeClick } from '@/utils/youtubeAnalytics';
import fallbackFeaturedFilms from '@/data/featuredFilms.json';

type SocialStatsMap = Record<number, { engagementText?: string; viewCount?: number }>;

type VideoCard = (typeof fallbackFeaturedFilms)[number];
type FeaturedFilmThemeOverrides = {
  sectionBg?: string;
  cardBg?: string;
  titleColor?: string;
  subtitleColor?: string;
  pillBg?: string;
  buttonBg?: string;
};

const LATEST_UPLOAD_ID = 999999;

function getVideoIdFromUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.replace("www.", "").includes("youtu.be")) {
      return parsedUrl.pathname.slice(1);
    }
    if (parsedUrl.searchParams.get("v")) return parsedUrl.searchParams.get("v")!;
    if (parsedUrl.pathname.startsWith("/shorts/")) return parsedUrl.pathname.split("/shorts/")[1]?.split("/")[0] ?? null;
    if (parsedUrl.pathname.startsWith("/embed/")) return parsedUrl.pathname.split("/embed/")[1]?.split("/")[0] ?? null;
    return null;
  } catch {
    return null;
  }
}

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

function getPreviewEmbedUrl(url: string, startSeconds = 20, endSeconds = 28) {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return null;
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0&loop=1&playlist=${videoId}&start=${startSeconds}&end=${endSeconds}`;
}

/** Watch URL tuned for “go comment” — no `#comments` (YouTube often ignores it). Mobile uses m.youtube.com where the thread sits closer under the player. */
function getYouTubeWatchUrlForComments(url: string) {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) {
    return url;
  }
  const id = encodeURIComponent(videoId);
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent;
    const narrow =
      typeof window !== 'undefined' && window.matchMedia?.('(max-width: 768px)')?.matches;
    if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || narrow) {
      return `https://m.youtube.com/watch?v=${id}`;
    }
  }
  return `https://www.youtube.com/watch?v=${id}`;
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function VideoGallery() {
  const [socialStats, setSocialStats] = useState<SocialStatsMap>({});
  const [featuredFilms, setFeaturedFilms] = useState<VideoCard[]>(fallbackFeaturedFilms as VideoCard[]);
  const [cards, setCards] = useState<VideoCard[]>(fallbackFeaturedFilms as VideoCard[]);
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
  const [statsStatus, setStatsStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState<VideoCard | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [themeOverrides, setThemeOverrides] = useState<FeaturedFilmThemeOverrides>({});
  const [showThemeDock, setShowThemeDock] = useState(false);
  const [youtubeCommentDrafts, setYoutubeCommentDrafts] = useState<Record<number, string>>({});
  const [youtubeCommentSendConfirmed, setYoutubeCommentSendConfirmed] = useState<Record<number, boolean>>({});
  const [copyCommentErrorId, setCopyCommentErrorId] = useState<number | null>(null);
  const [pasteCommentToastId, setPasteCommentToastId] = useState<number | null>(null);

  const fallbackFilms = useMemo(() => fallbackFeaturedFilms as VideoCard[], []);

  const refreshFeaturedFilms = async (shouldUpdate?: () => boolean) => {
    const baseFilms = await (async () => {
      try {
        const response = await fetch('/api/cms?type=featuredFilms', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length) {
            return data as VideoCard[];
          }
        }
      } catch {
        // Fall back to bundled data.
      }

      return fallbackFilms;
    })();

    if (shouldUpdate && !shouldUpdate()) return;
    setFeaturedFilms(baseFilms);
    setStatsStatus("loading");
    const latestResult = await fetch("/api/youtube/latest-upload", { method: "GET" });
    let nextLatest: Partial<VideoCard> | null = null;

      if (latestResult.ok) {
        const latest = (await latestResult.json()) as any;
        const latestVideoUrl = latest?.videoUrl as string | undefined;
        const latestVideoId = latestVideoUrl ? getVideoIdFromUrl(latestVideoUrl) : null;

        nextLatest = {
          id: LATEST_UPLOAD_ID,
          title: latest?.title ?? "Latest upload",
          subtitle: latest?.subtitle ?? "New video from Aurora's Eye Films",
          viewerFit: latest?.viewerFit ?? 'Best for viewers who want the newest story from Aurora\'s Eye Films.',
          engagement: latest?.engagementText || "Tap to explore",
          image: latest?.image ?? "",
          videoUrl: latestVideoUrl ?? channelUrlForLatestFallback(),
          facebookUrl: "",
          previewStartSeconds: 0,
          previewEnabled: true,
        } as VideoCard;

        // Ensure the latest card doesn't accidentally keep an old preview embed.
        if (nextLatest && !nextLatest.image) {
          // No-op: we still render the card and links.
        }

        // If thumbnail isn't available but we have a video id, we can still render a thumbnail.
        if (nextLatest && !nextLatest.image && latestVideoId) {
          nextLatest.image = `https://i.ytimg.com/vi/${latestVideoId}/hqdefault.jpg`;
        }
      }

    const statsItems = [
      ...baseFilms.map((film) => ({
        id: film.id,
        youtubeUrl: film.videoUrl,
        facebookUrl: film.facebookUrl,
      })),
      ...(nextLatest
        ? [
            {
              id: LATEST_UPLOAD_ID,
              youtubeUrl: (nextLatest as VideoCard).videoUrl,
              facebookUrl: "",
            },
          ]
        : []),
    ];

    const nextSocialStats: SocialStatsMap = {};
    let nextStatsStatus: typeof statsStatus = "unavailable";

    try {
      const statsResponse = await fetch("/api/social-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: statsItems }),
      });

      if (statsResponse.ok) {
        const data = await statsResponse.json();
        Object.assign(nextSocialStats, data.stats ?? {});
        nextStatsStatus = Object.keys(nextSocialStats).length > 0 ? "ready" : "unavailable";
      }
    } catch {
      nextStatsStatus = "unavailable";
    }

    if (shouldUpdate && !shouldUpdate()) return;
    setSocialStats(nextSocialStats);
    setStatsStatus(nextStatsStatus);

    const sortedFeatured = [...baseFilms].sort((a, b) => {
      const viewsA = nextSocialStats[a.id]?.viewCount ?? 0;
      const viewsB = nextSocialStats[b.id]?.viewCount ?? 0;
      return viewsB - viewsA;
    });

    if (nextLatest) {
      // Per request: replace the first (top-left) card with the latest upload.
      sortedFeatured[0] = nextLatest as VideoCard;
    }

    if (shouldUpdate && !shouldUpdate()) return;
    setCards(sortedFeatured);
  };

  useEffect(() => {
    let isMounted = true;
    refreshFeaturedFilms(() => isMounted).catch(() => {
      if (!isMounted) return;
      setSocialStats({});
      setFeaturedFilms(fallbackFilms);
      setCards(fallbackFilms);
      setStatsStatus("unavailable");
    });
    return () => {
      isMounted = false;
    };
  }, [fallbackFilms]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const parsed = JSON.parse(raw);
        setIsAdmin(parsed?.role === 'admin');
      }
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('featured-films-likes');
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, boolean>;
        if (parsed && typeof parsed === 'object') {
          setLikedVideos(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('featured-films-likes', JSON.stringify(likedVideos));
  }, [likedVideos]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('featured-films-theme-overrides');
      if (!raw) return;
      const parsed = JSON.parse(raw) as FeaturedFilmThemeOverrides;
      if (parsed && typeof parsed === 'object') {
        setThemeOverrides(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('featured-films-theme-overrides', JSON.stringify(themeOverrides));
    } catch {
      // ignore
    }
  }, [themeOverrides]);

  const updateThemeColor = (key: keyof FeaturedFilmThemeOverrides, value: string) => {
    setThemeOverrides((prev) => ({ ...prev, [key]: value }));
  };

  const clearThemeColor = (key: keyof FeaturedFilmThemeOverrides) => {
    setThemeOverrides((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const galleryStyle: CSSProperties = {};
  const galleryStyleVars = galleryStyle as Record<string, string>;
  if (themeOverrides.sectionBg) galleryStyleVars['--featured-gallery-bg'] = themeOverrides.sectionBg;
  if (themeOverrides.cardBg) galleryStyleVars['--featured-card-bg'] = themeOverrides.cardBg;
  if (themeOverrides.titleColor) galleryStyleVars['--featured-title-color'] = themeOverrides.titleColor;
  if (themeOverrides.subtitleColor) galleryStyleVars['--featured-subtitle-color'] = themeOverrides.subtitleColor;
  if (themeOverrides.pillBg) galleryStyleVars['--featured-pill-bg'] = themeOverrides.pillBg;
  if (themeOverrides.buttonBg) galleryStyleVars['--featured-button-bg'] = themeOverrides.buttonBg;

  const handleEdit = (film: VideoCard) => {
    setIsEditing(film);
    setEditUrl(film.videoUrl ?? '');
  };

  const handleSaveEdit = async () => {
    if (!isEditing) return;

    const nextVideoId = getYouTubeVideoId(editUrl);
    const nextImage = nextVideoId ? `https://i.ytimg.com/vi/${nextVideoId}/hqdefault.jpg` : isEditing.image;

    const updatedFilms = featuredFilms.map((film) =>
      film.id === isEditing.id
        ? {
            ...film,
            videoUrl: editUrl,
            image: nextImage,
          }
        : film
    );

    await fetch('/api/cms?type=featuredFilms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFilms),
    });

    setIsEditing(null);
    setEditUrl('');
    setFeaturedFilms(updatedFilms);
    refreshFeaturedFilms().catch(() => undefined);
  };

  return (
    <section className={styles.gallerySection} style={galleryStyle}>
      <div className="container">
        {isAdmin ? (
          <div className={styles.themeDock}>
            <button type="button" className={styles.themeDockToggle} onClick={() => setShowThemeDock((prev) => !prev)}>
              {showThemeDock ? 'Hide colors' : 'Section colors'}
            </button>
            {showThemeDock ? (
              <div className={styles.themeDockPanel}>
                <label>
                  Section
                  <input type="color" value={themeOverrides.sectionBg ?? '#f59e0b'} onChange={(e) => updateThemeColor('sectionBg', e.target.value)} />
                  <button type="button" onClick={() => clearThemeColor('sectionBg')}>Clear</button>
                </label>
                <label>
                  Cards
                  <input type="color" value={themeOverrides.cardBg ?? '#09111f'} onChange={(e) => updateThemeColor('cardBg', e.target.value)} />
                  <button type="button" onClick={() => clearThemeColor('cardBg')}>Clear</button>
                </label>
                <label>
                  Title text
                  <input type="color" value={themeOverrides.titleColor ?? '#f5efe7'} onChange={(e) => updateThemeColor('titleColor', e.target.value)} />
                  <button type="button" onClick={() => clearThemeColor('titleColor')}>Clear</button>
                </label>
                <label>
                  Body text
                  <input type="color" value={themeOverrides.subtitleColor ?? '#ceb8a8'} onChange={(e) => updateThemeColor('subtitleColor', e.target.value)} />
                  <button type="button" onClick={() => clearThemeColor('subtitleColor')}>Clear</button>
                </label>
                <label>
                  Viewer-fit pill
                  <input type="color" value={themeOverrides.pillBg ?? '#f8ede3'} onChange={(e) => updateThemeColor('pillBg', e.target.value)} />
                  <button type="button" onClick={() => clearThemeColor('pillBg')}>Clear</button>
                </label>
                <label>
                  Watch button
                  <input type="color" value={themeOverrides.buttonBg ?? '#f59e0b'} onChange={(e) => updateThemeColor('buttonBg', e.target.value)} />
                  <button type="button" onClick={() => clearThemeColor('buttonBg')}>Clear</button>
                </label>
              </div>
            ) : null}
          </div>
        ) : null}
        {isEditing ? (
          <div className={styles.adminEditOverlay}>
            <div className={styles.adminEditModal}>
              <h3>Edit Featured Film</h3>
              <p className={styles.adminEditMeta}>{isEditing.title}</p>
              <div className={styles.adminEditField}>
                <label htmlFor="featured-film-url">YouTube link</label>
                <input
                  id="featured-film-url"
                  value={editUrl}
                  onChange={(event) => setEditUrl(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div className={styles.adminEditActions}>
                <button type="button" className="btn btn-outline" onClick={() => setIsEditing(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSaveEdit}>
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : null}
        <div className={styles.header}>
          <div className="badge">Latest Work</div>
          <h2 className="title">Featured Films</h2>
        </div>
        <div className={styles.posterGrid}>
          {cards.map((film) => {
            const isLatestCard = Number(film.id) === LATEST_UPLOAD_ID;
            const videoId = getYouTubeVideoId(film.videoUrl) ?? '';
            const isPlaying = videoId && activePlayerId === videoId;
            const isLiked = videoId ? likedVideos[videoId] : false;
            const youtubeWatchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : film.videoUrl;

            return (
              <article
                key={film.id}
                className={styles.posterCard}
                onMouseEnter={() => setHoveredCardId(Number(film.id))}
                onMouseLeave={() => setHoveredCardId(null)}
              >
                <Link
                  href={youtubeWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.posterImageLink}
                  onClick={(event) => {
                    if (videoId) {
                      trackYouTubeClick({
                        label: `${film.title} watch`,
                        url: youtubeWatchUrl,
                        location: 'featured-films-frame',
                      });
                    }
                  }}
                >
                  <div className={styles.posterImage}>
                  <div className={styles.posterThumbButton}>
                      <img
                        src={film.image || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                        alt={film.title}
                        className={styles.posterImg}
                      />
                      {film.previewEnabled && hoveredCardId === Number(film.id) && getPreviewEmbedUrl(film.videoUrl, film.previewStartSeconds) && (
                        <iframe
                          src={getPreviewEmbedUrl(film.videoUrl, film.previewStartSeconds) as string}
                          title={`${film.title} preview`}
                          className={styles.posterPreview}
                          allow="autoplay; encrypted-media; picture-in-picture"
                          referrerPolicy="strict-origin-when-cross-origin"
                          tabIndex={-1}
                        />
                      )}
                      {isLatestCard && <span className={styles.latestBadge}>NEW</span>}
                      <span className={styles.posterTag}>A film by Serena Aurora</span>
                      {isAdmin && !isLatestCard ? (
                        <button
                          type="button"
                          className={`${styles.adminEditLink} ${isLatestCard ? styles.adminEditLinkShifted : ''}`}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleEdit(film);
                          }}
                        >
                          Edit
                        </button>
                      ) : null}
                      <span className={styles.posterPlay}>
                        <Play size={24} fill="currentColor" />
                      </span>
                      {videoId ? (
                        <button
                          type="button"
                          className={`${styles.posterLikeButton} ${isLiked ? styles.posterLikeButtonActive : ''}`}
                          aria-label={isLiked ? 'Liked' : 'Like this video'}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setLikedVideos((prev) => ({ ...prev, [videoId]: true }));
                            trackYouTubeClick({
                                label: `${film.title} like`,
                                url: youtubeWatchUrl,
                                location: 'featured-films-like',
                            });
                            window.open(youtubeWatchUrl, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          <ThumbsUp size={18} />
                          <span className={styles.posterLikeTooltip}>
                            Click here and then Click Like on Youtube
                          </span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </Link>
                <div className={styles.posterMeta}>
                  <h3 className={styles.posterTitle}>
                    <Link
                      href={youtubeWatchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => {
                        if (videoId) {
                          trackYouTubeClick({
                            label: `${film.title} watch`,
                            url: youtubeWatchUrl,
                            location: 'featured-films-title',
                          });
                        }
                      }}
                    >
                      {film.title}
                    </Link>
                  </h3>
                  <p className={styles.posterSubtitle}>{film.subtitle}</p>
                  <p className={styles.posterWhy}>{film.viewerFit}</p>
                  <div className={styles.posterActions}>
                    <div className={styles.posterYoutubeComment}>
                      {!youtubeCommentSendConfirmed[film.id] ? (
                        <div className={styles.posterYoutubeComposer}>
                          <textarea
                            id={`featured-yt-comment-${film.id}`}
                            className={styles.posterYoutubeCommentField}
                            rows={3}
                            maxLength={5000}
                            placeholder="Write a short note for the filmmakers…"
                            aria-label="Comment for YouTube"
                            value={youtubeCommentDrafts[film.id] ?? ''}
                            onChange={(event) => {
                              event.stopPropagation();
                              setYoutubeCommentDrafts((prev) => ({
                                ...prev,
                                [film.id]: event.target.value,
                              }));
                              setCopyCommentErrorId((id) => (id === film.id ? null : id));
                              setYoutubeCommentSendConfirmed((prev) =>
                                prev[film.id] ? { ...prev, [film.id]: false } : prev,
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            type="button"
                            className={styles.posterYoutubeCommentSendIcon}
                            disabled={!videoId}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCopyCommentErrorId(null);
                              if (!videoId) return;
                              const draft = (youtubeCommentDrafts[film.id] ?? '').trim();
                              if (!draft) {
                                setCopyCommentErrorId(film.id);
                                return;
                              }
                              setYoutubeCommentSendConfirmed((prev) => ({ ...prev, [film.id]: true }));
                            }}
                          >
                            <SendHorizontal size={20} strokeWidth={1.75} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className={styles.posterYoutubePasteLine}>
                            Also{' '}
                            <button
                              type="button"
                               disabled={!videoId}
                               onClick={async (e) => {
                                 e.stopPropagation();
                                setCopyCommentErrorId(null);
                                const draft = (youtubeCommentDrafts[film.id] ?? '').trim();
                                if (!videoId || !draft) {
                                  setCopyCommentErrorId(film.id);
                                  return;
                                }
                                const copied = await copyTextToClipboard(draft);
                                if (!copied) {
                                  setCopyCommentErrorId(film.id);
                                  return;
                                }
                                const commentsUrl = getYouTubeWatchUrlForComments(film.videoUrl);
                                trackYouTubeClick({
                                  label: `${film.title} copy-comment-open-comments`,
                                  url: commentsUrl,
                                  location: 'featured-films-youtube-comment',
                                });
                                window.open(commentsUrl, '_blank', 'noopener,noreferrer');
                                setPasteCommentToastId(film.id);
                                window.setTimeout(() => {
                                  setPasteCommentToastId((current) => (current === film.id ? null : current));
                                }, 6000);
                               }}
                             >
                               click here to paste this comment to YouTube
                             </button>
                            . It really helps us!
                          </p>
                          <p className={styles.posterYoutubeFrictionNote}>
                            YouTube may ask you to sign in with Google to comment—that is required by YouTube, not this
                            site. After the page opens, scroll to the <strong>Comments</strong> block (under the player on
                            phones, below the description on desktop), tap the comment field, then paste.
                          </p>
                        </>
                      )}
                      {copyCommentErrorId === film.id ? (
                        <p className={styles.posterYoutubeCommentError} role="alert">
                          {!videoId
                            ? 'Add a valid YouTube video link for this film (admin edit).'
                            : !(youtubeCommentDrafts[film.id] ?? '').trim()
                              ? 'Write something in the box first, then try again.'
                              : 'Could not copy to the clipboard. Try again or copy manually.'}
                        </p>
                      ) : null}
                      {pasteCommentToastId === film.id ? (
                        <p className={styles.posterYoutubeCommentToast} aria-live="polite">
                          Copied — scroll to <strong>Comments</strong>, click &quot;Add a comment…&quot;, then paste
                           (⌘V / Ctrl+V).
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function channelUrlForLatestFallback() {
  // Keep a safe default in case the API returns no `videoUrl`.
  return "https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw";
}
