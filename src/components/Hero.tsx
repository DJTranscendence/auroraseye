'use client';

import { useState, useEffect, useRef } from 'react';
import styles from "./Hero.module.css";
import { Play, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const [config, setConfig] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    fetch('/api/cms?type=config')
      .then(res => res.json())
      .then(setConfig);
  }, []);

  useEffect(() => {
    if (!videoRef.current || hasStarted) return;

    // Restore time from localStorage
    const savedTime = localStorage.getItem('hero_video_time');
    if (savedTime && videoRef.current) {
      videoRef.current.currentTime = parseFloat(savedTime);
    }
    setHasStarted(true);

    // Save time on unmount or before hide
    return () => {
      if (videoRef.current) {
        localStorage.setItem('hero_video_time', videoRef.current.currentTime.toString());
      }
    };
  }, [config, hasStarted]);

  // Periodic save to handle unexpected exits/refreshes
  useEffect(() => {
    const handleUnload = () => {
      if (videoRef.current) {
        localStorage.setItem('hero_video_time', videoRef.current.currentTime.toString());
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        localStorage.setItem('hero_video_time', videoRef.current.currentTime.toString());
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      clearInterval(interval);
    };
  }, []);

  if (!config) return <section className={styles.hero}></section>;

  // Use a high-quality direct video file for seamless looping and state control
  // We fall back to Unsplash background if video file isn't direct
  const isDirectVideo = config.hero.videoUrl && (config.hero.videoUrl.endsWith('.mp4') || config.hero.videoUrl.includes('assets.mixkit.co'));
  const finalVideoUrl = isDirectVideo ? config.hero.videoUrl : "https://assets.mixkit.co/videos/preview/mixkit-young-woman-looking-at-the-ocean-during-golden-hour-4852-large.mp4";

  return (
    <section className={styles.hero} style={{ backgroundImage: `linear-gradient(rgba(10, 11, 18, 0.4), rgba(10, 11, 18, 0.8)), url(${config.hero.bgImage})` }}>
      <div className={styles.videoBackground}>
        <video 
          ref={videoRef}
          src={finalVideoUrl}
          autoPlay
          muted
          loop
          playsInline
          className={styles.heroVideo}
        />
      </div>
      <div className={styles.overlay}></div>
      <div className={`container ${styles.content} animate-fade-in`}>
        <div className={styles.badge}>
          <div className={styles.pulse}></div>
          <span>Documenting the Extraordinary</span>
        </div>
        <h1 className={styles.title}>
          {config.hero.title.split('through').map((part: string, i: number) => (
            <span key={i}>
              {i > 0 && 'through '}<span className={i > 0 ? "text-primary" : ""}>{part}</span>
            </span>
          ))}
        </h1>
        <p className={styles.description}>
          {config.hero.description}
        </p>
        <div className={styles.actions}>
          <Link href="/documentaries" className="btn btn-primary">
            Explore Films <ArrowRight size={20} />
          </Link>
          <Link href="#latest-work" className="btn btn-outline">
            Latest Work
          </Link>
        </div>
      </div>
      <div className={styles.scrollIndicator}>
        <div className={styles.mouse}>
          <div className={styles.wheel}></div>
        </div>
      </div>
    </section>
  );
}


