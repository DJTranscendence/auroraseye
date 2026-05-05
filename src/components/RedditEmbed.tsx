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
    if (typeof window === 'undefined') return;

    let checkInterval: NodeJS.Timeout;
    let attempts = 0;

    const checkReddit = () => {
      const redditRuntime = (window as any).reddit;
      if (redditRuntime?.widgets) {
        try {
          redditRuntime.widgets.init();
          setIsLoaded(true);
          clearInterval(checkInterval);
        } catch (e) {
          console.warn('Reddit widget init failed', e);
        }
      }
      
      attempts++;
      if (attempts > 50) { // Stop after 5 seconds
        clearInterval(checkInterval);
      }
    };

    checkReddit();
    checkInterval = setInterval(checkReddit, 100);

    return () => clearInterval(checkInterval);
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
          try {
            const redditRuntime = (window as any).reddit;
            redditRuntime?.widgets?.init?.();
          } catch (e) {
            console.warn('Reddit widget init failed after script load', e);
          }
          setIsLoaded(true);
        }}
      />
    </div>
  );
}
