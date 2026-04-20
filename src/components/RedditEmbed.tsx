'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import styles from './RedditEmbed.module.css';

interface RedditEmbedProps {
  url: string;
  height?: string | number;
}

export default function RedditEmbed({ url }: RedditEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // If the user navigates, we might need to re-initialize the reddit widgets
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).reddit) {
      // Re-scan for cards if window.reddit.widgets exist
      try {
        (window as any).reddit.widgets.init();
      } catch (e) {
        console.warn('Reddit widget init failed', e);
      }
    }
  }, [url]);

  return (
    <div className={`${styles.container} ${isLoaded ? styles.ready : styles.loading}`}>
      <div className={styles.embedWrapper}>
        <blockquote 
          className="reddit-card" 
          data-card-preview="0"
          data-card-theme="dark" // Aurora's eye site seems to be dark theme
        >
          <a href={url}>Loading Reddit conversation...</a>
        </blockquote>
      </div>

      <Script
        src="https://embed.reddit.com/widgets.js"
        strategy="lazyOnload"
        onLoad={() => {
          setIsLoaded(true);
          // Optional: handle extra initialization if needed
        }}
      />
    </div>
  );
}
