'use client';

import Link from 'next/link';
import { ExternalLink, Play } from 'lucide-react';
import styles from './WatchNextStrip.module.css';
import { trackYouTubeClick } from '@/utils/youtubeAnalytics';

export type WatchNextItem = {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
};

type Props = {
  title: string;
  description: string;
  items: WatchNextItem[];
  contextLabel: string;
  className?: string;
};

export default function WatchNextStrip({
  title,
  description,
  items,
  contextLabel,
  className,
}: Props) {
  return (
    <section className={`${styles.section} ${className ?? ''}`}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Watch Next on YouTube</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className={styles.grid}>
        {items.map((item) => (
          <article key={item.url} className={styles.card}>
            <div className={styles.thumbWrap}>
              <img src={item.thumbnail} alt={item.title} loading="lazy" />
              <span className={styles.thumbBadge}>
                <Play size={14} fill="currentColor" />
              </span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <Link
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.action}
              onClick={() =>
                trackYouTubeClick({
                  label: item.title,
                  url: item.url,
                  location: contextLabel,
                })
              }
            >
              Watch on YouTube <ExternalLink size={15} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}