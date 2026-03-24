import styles from "./LatestVideo.module.css";
import { Youtube, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function LatestVideo() {
  // In a real app, this would be fetched from the YouTube Data API or CMS
  const videoId = "dQw4w9WgXcQ"; // Placeholder
  const title = "Documentary Series: The Spirit of Auroville";
  
  return (
    <section id="latest-work" className="section">
      <div className="container">
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Latest from our Channel</h2>
            <p className="text-muted">Fresh stories, updated weekly.</p>
          </div>
          <Link href="https://youtube.com/@AuroraEyeFilms" className="btn btn-outline">
            Visit YouTube <Youtube size={18} />
          </Link>
        </div>
        
        <div className={styles.videoCard}>
          <div className={styles.iframeWrapper}>
            <iframe 
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1`}
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>
          <div className={styles.videoInfo}>
            <div className={styles.badge}>New Release</div>
            <h3>{title}</h3>
            <p>
              Explore the unique socio-spiritual experiment of Auroville through the eyes of its residents. 
              This documentary explores the challenges and triumphs of a community striving for human unity.
            </p>
            <Link href={`https://youtube.com/watch?v=${videoId}`} className={styles.link}>
              Watch on YouTube <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
