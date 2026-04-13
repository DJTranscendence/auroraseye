'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Youtube } from 'lucide-react';
import styles from './YouTubeSubscribePanel.module.css';
import { trackYouTubeClick } from '@/utils/youtubeAnalytics';

type Props = {
  className?: string;
  contextLabel: string;
};

type ChannelStats = {
  title?: string;
  description?: string;
  subscriberCountText?: string;
  viewCountText?: string;
  videoCountText?: string;
  channelUrl?: string;
};

const FALLBACK_STATS: ChannelStats = {
  title: "Aurora's Eye Films on YouTube",
  description: 'Subscribe for documentaries, field notes, premieres, and story-led films from Auroville and beyond.',
  subscriberCountText: '1M+ audience reached',
  viewCountText: '50+ documentaries produced',
  videoCountText: 'New stories and project updates',
  channelUrl: 'https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw',
};

export default function YouTubeSubscribePanel({ className, contextLabel }: Props) {
  const [stats, setStats] = useState<ChannelStats>(FALLBACK_STATS);

  useEffect(() => {
    fetch('/api/youtube/channel-stats')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load channel stats');
        }

        return response.json();
      })
      .then((data) => {
        setStats((current) => ({ ...current, ...data }));
      })
      .catch(() => setStats(FALLBACK_STATS));
  }, []);

  const channelUrl = stats.channelUrl ?? FALLBACK_STATS.channelUrl!;

  return (
    <section className={`${styles.panel} ${className ?? ''}`}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>YouTube</p>
        <h2>{stats.title}</h2>
        <p className={styles.description}>{stats.description}</p>
      </div>

      <div className={styles.metrics}>
        <div>
          <strong>{stats.subscriberCountText}</strong>
          <span>Subscribers</span>
        </div>
        <div>
          <strong>{stats.viewCountText}</strong>
          <span>Total views</span>
        </div>
        <div>
          <strong>{stats.videoCountText}</strong>
          <span>Published videos</span>
        </div>
      </div>

      <div className={styles.actions}>
        <Link
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.primaryAction}
          onClick={() =>
            trackYouTubeClick({
              label: 'Subscribe on YouTube',
              url: channelUrl,
              location: contextLabel,
            })
          }
        >
          <Youtube size={18} />
          Subscribe on YouTube
        </Link>
        <Link
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.secondaryAction}
          onClick={() =>
            trackYouTubeClick({
              label: 'Visit YouTube channel',
              url: channelUrl,
              location: `${contextLabel}-secondary`,
            })
          }
        >
          Visit Channel <ExternalLink size={16} />
        </Link>
      </div>
    </section>
  );
}