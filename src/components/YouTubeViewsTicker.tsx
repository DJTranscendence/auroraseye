'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './YouTubeViewsTicker.module.css';
import { trackYouTubeClick } from '@/utils/youtubeAnalytics';

const DEFAULT_YOUTUBE_CHANNEL_URL =
  'https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw';

const FALLBACK_VIEWS_COUNT = 1700000;
const STATS_POLL_INTERVAL_MS = 5 * 60 * 1000;

const parseCountLabel = (value: string) => {
  const numericValue = Number(value.replace(/[^\d]/g, ''));
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : FALLBACK_VIEWS_COUNT;
};

const formatExactCount = (value: number) => new Intl.NumberFormat('en-US').format(value);

function OdometerNumber({ value }: { value: string }) {
  return (
    <span className={styles.odometer} aria-label={value}>
      {value.split('').map((character, index) => {
        if (character === ',') {
          return (
            <span key={`comma-${index}`} className={styles.odometerComma}>
              ,
            </span>
          );
        }

        return (
          <span
            key={`digit-${index}-${character}`}
            className={styles.odometerDigit}
            style={{ ['--digit' as string]: Number(character).toString() }}
          >
            <span className={styles.odometerDigitInner}>
              {Array.from({ length: 10 }, (_, digit) => (
                <span key={digit}>{digit}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

type YouTubeViewsTickerProps = {
  /** Aurora's Eye YouTube channel (from CMS `contact.youtube` when set). */
  channelUrl?: string;
};

export default function YouTubeViewsTicker({ channelUrl }: YouTubeViewsTickerProps) {
  const resolvedChannelUrl =
    typeof channelUrl === 'string' && channelUrl.startsWith('http') ? channelUrl : DEFAULT_YOUTUBE_CHANNEL_URL;
  const [totalViews, setTotalViews] = useState<number | null>(null);
  const [totalViewsText, setTotalViewsText] = useState('1,700,000');
  const [displayViewsNumber, setDisplayViewsNumber] = useState(FALLBACK_VIEWS_COUNT);
  const animatedViewsRef = useRef(0);

  useEffect(() => {
    let isCancelled = false;

    const loadStats = () => {
      fetch('/api/youtube/channel-stats')
        .then((res) => res.json())
        .then((data) => {
          if (isCancelled) {
            return;
          }

          setTotalViews(typeof data?.totalViews === 'number' ? data.totalViews : null);
          setTotalViewsText(data?.totalViewsText ?? '1,700,000');
        })
        .catch(() => {
          if (isCancelled) {
            return;
          }

          setTotalViews(null);
          setTotalViewsText('1,700,000');
        });
    };

    loadStats();
    const interval = window.setInterval(loadStats, STATS_POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const targetViews = totalViews ?? parseCountLabel(totalViewsText);

    const duration = 1200;
    const startTime = performance.now();
    const startValue = animatedViewsRef.current || Math.max(targetViews - 1800, 0);

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(startValue + (targetViews - startValue) * eased);

      animatedViewsRef.current = value;
      setDisplayViewsNumber(value);

      if (progress < 1) {
        window.requestAnimationFrame(animate);
      }
    };

    const animationId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationId);
  }, [totalViews, totalViewsText]);

  return (
    <a
      href={resolvedChannelUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.tickerLink}
      aria-label="Open Aurora's Eye Films on YouTube"
      onClick={() =>
        trackYouTubeClick({
          label: 'YouTube views ticker',
          url: resolvedChannelUrl,
          location: 'navbar-ticker',
        })
      }
    >
      <div className={styles.ticker} aria-live="polite">
        <span className={styles.liveDot} />
        <div className={styles.copy}>
          <span className={styles.label}>YouTube Views</span>
          <strong className={styles.value}>
            <OdometerNumber value={formatExactCount(displayViewsNumber)} />
          </strong>
        </div>
      </div>
    </a>
  );
}