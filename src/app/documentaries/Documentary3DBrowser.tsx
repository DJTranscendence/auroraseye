'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, Play, X } from 'lucide-react';
import styles from './Documentary3DBrowser.module.css';

type Film = {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  description: string;
  videoUrl: string;
  year: string;
};

type Props = {
  filmsData: Film[];
};

type CategoryBucket = {
  category: string;
  thumbnail: string;
  videos: Film[];
};

const VIDEO_START_SECONDS = 20;

function withQueryParam(urlString: string, key: string, value: string) {
  try {
    const url = new URL(urlString);
    url.searchParams.set(key, value);
    return url.toString();
  } catch {
    return urlString;
  }
}

function getEmbedUrl(videoUrl: string) {
  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.replace('www.', '');

    if (hostname === 'youtu.be') {
      const id = url.pathname.slice(1);
      return id
        ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&start=${VIDEO_START_SECONDS}`
        : videoUrl;
    }

    if (hostname.includes('youtube.com')) {
      if (url.pathname.startsWith('/embed/')) {
        const id = url.pathname.split('/embed/')[1]?.split('/')[0];
        return id
          ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&start=${VIDEO_START_SECONDS}`
          : videoUrl;
      }

      if (url.pathname.startsWith('/shorts/')) {
        const id = url.pathname.split('/shorts/')[1]?.split('/')[0];
        return id
          ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&start=${VIDEO_START_SECONDS}`
          : videoUrl;
      }

      const id = url.searchParams.get('v');
      return id
        ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&start=${VIDEO_START_SECONDS}`
        : videoUrl;
    }

    return videoUrl;
  } catch {
    return videoUrl;
  }
}

function getPreviewUrl(videoUrl: string) {
  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.replace('www.', '');

    const buildPreview = (id: string) =>
      `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&loop=1&playlist=${id}&start=${VIDEO_START_SECONDS}&end=${VIDEO_START_SECONDS + 3}`;

    if (hostname === 'youtu.be') {
      const id = url.pathname.slice(1);
      return id ? buildPreview(id) : videoUrl;
    }

    if (hostname.includes('youtube.com')) {
      if (url.pathname.startsWith('/embed/')) {
        const id = url.pathname.split('/embed/')[1]?.split('/')[0];
        return id ? buildPreview(id) : videoUrl;
      }

      if (url.pathname.startsWith('/shorts/')) {
        const id = url.pathname.split('/shorts/')[1]?.split('/')[0];
        return id ? buildPreview(id) : videoUrl;
      }

      const id = url.searchParams.get('v');
      return id ? buildPreview(id) : videoUrl;
    }

    return videoUrl;
  } catch {
    return videoUrl;
  }
}

function getDirectWatchUrl(videoUrl: string) {
  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.replace('www.', '').toLowerCase();

    if (hostname === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0];
      return id ? `https://youtu.be/${id}?t=${VIDEO_START_SECONDS}` : videoUrl;
    }

    if (hostname.includes('youtube.com')) {
      if (url.pathname.startsWith('/shorts/')) {
        const id = url.pathname.split('/shorts/')[1]?.split('/')[0];
        return id ? `https://youtu.be/${id}?t=${VIDEO_START_SECONDS}` : videoUrl;
      }

      if (url.pathname.startsWith('/embed/')) {
        const id = url.pathname.split('/embed/')[1]?.split('/')[0];
        return id ? `https://youtu.be/${id}?t=${VIDEO_START_SECONDS}` : videoUrl;
      }

      const id = url.searchParams.get('v');
      return id ? `https://youtu.be/${id}?t=${VIDEO_START_SECONDS}` : videoUrl;
    }

    return withQueryParam(videoUrl, 't', `${VIDEO_START_SECONDS}`);
  } catch {
    return videoUrl;
  }
}

export default function Documentary3DBrowser({ filmsData }: Props) {
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [selectedInterest, setSelectedInterest] = useState('All');
  const [hoveredFilmId, setHoveredFilmId] = useState<string | null>(null);

  const handleGridClick = (event: React.MouseEvent | React.PointerEvent) => {
    const { clientX, clientY } = event;
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
      return;
    }

    const elements = document.elementsFromPoint(clientX, clientY);
    const tile = elements.find((element) =>
      element instanceof HTMLElement && element.dataset.videoUrl
    ) as HTMLElement | undefined;

    if (tile?.dataset.videoUrl) {
      window.open(tile.dataset.videoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const chipPalette = useMemo(
    () => [
      { bg: '#f3e8ff', border: '#c4b5fd', text: '#4338ca', borderHover: '#a78bfa', borderActive: '#8b5cf6' },
      { bg: '#ffe4e6', border: '#fecdd3', text: '#9f1239', borderHover: '#fda4af', borderActive: '#fb7185' },
      { bg: '#e0f2fe', border: '#bae6fd', text: '#075985', borderHover: '#7dd3fc', borderActive: '#38bdf8' },
      { bg: '#dcfce7', border: '#bbf7d0', text: '#166534', borderHover: '#86efac', borderActive: '#4ade80' },
      { bg: '#fef9c3', border: '#fde68a', text: '#92400e', borderHover: '#facc15', borderActive: '#f59e0b' },
      { bg: '#ffe8d6', border: '#fed7aa', text: '#9a3412', borderHover: '#fdba74', borderActive: '#fb923c' },
      { bg: '#f1f5f9', border: '#cbd5f5', text: '#334155', borderHover: '#a5b4fc', borderActive: '#818cf8' },
      { bg: '#e0e7ff', border: '#c7d2fe', text: '#3730a3', borderHover: '#a5b4fc', borderActive: '#6366f1' },
      { bg: '#fce7f3', border: '#fbcfe8', text: '#9d174d', borderHover: '#f9a8d4', borderActive: '#f472b6' },
      { bg: '#cffafe', border: '#a5f3fc', text: '#155e75', borderHover: '#67e8f9', borderActive: '#22d3ee' },
    ],
    []
  );

  const categories = useMemo(() => {
    const set = new Set(filmsData.map(f => f.category));
    return Array.from(set).sort();
  }, [filmsData]);

  const categoryPaletteMap = useMemo(() => {
    const map = new Map<string, (typeof chipPalette)[number]>();
    categories.forEach((cat, index) => {
      map.set(cat, chipPalette[index % chipPalette.length]);
    });
    return map;
  }, [categories, chipPalette]);

  const interestOptions = useMemo(() => ['All', ...categories], [categories]);

  const filteredVideos = useMemo(() => {
    if (selectedInterest === 'All') return filmsData;
    const query = selectedInterest.toLowerCase();
    return filmsData.filter((video) =>
      [video.title, video.description, video.year, video.category]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [selectedInterest, filmsData]);

  return (
    <div className={styles.browser}>
      <div className={styles.chrome}>
        <div>
          <p className={styles.eyebrow}>Documentary Catalog</p>
          <h2 className={styles.heading}>
            {selectedInterest === 'All' ? 'Browse all documentary work' : selectedInterest}
          </h2>
          <div className={styles.filterRow}>
            <div className={styles.filterLabel}>
              Interests Filter
            </div>
            <div className={styles.filterScroller} role="tablist" aria-label="Interest filters">
              {interestOptions.map((interest, index) => {
                const isActive = selectedInterest === interest;
                const palette =
                  interest === 'All'
                    ? chipPalette[0]
                    : categoryPaletteMap.get(interest) ?? chipPalette[index % chipPalette.length];

                return (
                  <button
                    key={interest}
                    type="button"
                    className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ''}`}
                    style={
                      {
                        '--chip-bg': palette.bg,
                        '--chip-border': palette.border,
                        '--chip-text': palette.text,
                        '--chip-border-hover': palette.borderHover,
                        '--chip-border-active': palette.borderActive,
                      } as React.CSSProperties
                    }
                    onClick={() => setSelectedInterest(interest)}
                    aria-pressed={isActive}
                  >
                    {interest}
                  </button>
                );
              })}
              {selectedInterest !== 'All' && (
                <button
                  type="button"
                  className={styles.filterClear}
                  onClick={() => setSelectedInterest('All')}
                  aria-label="Clear interests filter"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.viewport}>
        <div className={styles.scene}>
            <div
              className={styles.videoGrid}
              onClickCapture={handleGridClick}
            >
              {filteredVideos.map((film, index) => {
                const palette = categoryPaletteMap.get(film.category) ?? chipPalette[index % chipPalette.length];

                return (
                 <div
                   key={film.id}
                   className={styles.videoTile}
                   data-video-url={getDirectWatchUrl(film.videoUrl)}
                   onMouseEnter={() => setHoveredFilmId(film.id)}
                   onMouseLeave={() => setHoveredFilmId(null)}
                   style={{
                     animationDelay: `${index * 60}ms`,
                     '--tile-badge-bg': palette.bg,
                     '--tile-badge-border': palette.border,
                     '--tile-badge-text': palette.text,
                     '--tile-kicker-text': palette.text,
                   } as React.CSSProperties}
                 >
                   <div
                     className={styles.tileImage}
                     style={{ backgroundImage: `linear-gradient(180deg, rgba(7, 10, 20, 0.08), rgba(7, 10, 20, 0.9)), url('${film.thumbnail}')` }}
                   >
                     {film.id === hoveredFilmId && (
                       <iframe
                         className={styles.tilePreview}
                         src={getPreviewUrl(film.videoUrl)}
                         title={`${film.title} preview`}
                         allow="autoplay; encrypted-media; picture-in-picture"
                         aria-hidden="true"
                         tabIndex={-1}
                       />
                     )}
                    <div className={styles.playOrb}>
                      <Play size={24} fill="currentColor" />
                    </div>
                  </div>
                  <div className={styles.tileMeta}>
                    <div className={styles.tileBadge}>{film.category}</div>
                    <span className={styles.tileKicker}>{film.year}</span>
                    <h3>{film.title}</h3>
                    <p>{film.description}</p>
                    <span className={styles.tileHint}>Click to play</span>
                  </div>
                </div>
                );
              })}
            </div>
        </div>

        {selectedFilm && (
          <div className={styles.playerOverlay}>
            <div className={styles.playerShell}>
              <button className={styles.closeButton} onClick={() => setSelectedFilm(null)}>
                <X size={18} />
                <span>Close</span>
              </button>

              <div className={styles.playerFrame}>
                <iframe
                  src={getEmbedUrl(selectedFilm.videoUrl)}
                  title={selectedFilm.title}
                  className={styles.player}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              <div className={styles.playerMeta}>
                <p className={styles.eyebrow}>{selectedFilm.category} • {selectedFilm.year}</p>
                <h3>{selectedFilm.title}</h3>
                <p>{selectedFilm.description}</p>
                <p>
                  <a href={getDirectWatchUrl(selectedFilm.videoUrl)} target="_blank" rel="noopener noreferrer" className={styles.playerLink}>
                    Open on YouTube
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
