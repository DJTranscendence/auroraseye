'use client';

import Navbar from "@/components/Navbar";

import Hero from "@/components/Hero";
import VideoGallery from "@/components/VideoGallery";
import RedditWall from "@/components/RedditWall";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { Mail, Play } from "lucide-react";

const mediaWallItems = [
  {
    type: "video",
    title: "Auroville: Seeds of Change",
    src: "https://img.youtube.com/vi/ScMzIvxBSi4/hqdefault.jpg",
    size: "mega",
  },
  {
    type: "image",
    title: "Community Harvest",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
  },
  {
    type: "video",
    title: "Living Laboratory",
    src: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    size: "wide",
  },
  {
    type: "image",
    title: "Earth Architecture",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
  },
  {
    type: "video",
    title: "Waterkeepers",
    src: "https://img.youtube.com/vi/tgbNymZ7vqY/hqdefault.jpg",
    size: "tall",
  },
  {
    type: "image",
    title: "Quiet Horizons",
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop",
  },
  {
    type: "image",
    title: "Craft & Care",
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop",
    size: "wide",
  },
  {
    type: "video",
    title: "Forest Schools",
    src: "https://img.youtube.com/vi/ysz5S6PUM-U/hqdefault.jpg",
  },
  {
    type: "image",
    title: "Open Skies",
    src: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200&auto=format&fit=crop",
    size: "tall",
  },
  {
    type: "video",
    title: "Shared Futures",
    src: "https://img.youtube.com/vi/aqz-KE-bpKQ/hqdefault.jpg",
  },
  {
    type: "image",
    title: "Studio Notes",
    src: "https://images.unsplash.com/photo-1485846234655-95d946a49374?q=80&w=1200&auto=format&fit=crop",
  },
  {
    type: "image",
    title: "Auroville Morning",
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop",
    size: "wide",
  },
];

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <section id="latest-work">
          <VideoGallery />
        </section>

        <RedditWall />


        <section className={`section ${styles.mediaWall}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <p className="eyebrow">From the field</p>
              <h2>Instagram Highlights</h2>
              <p>The latest and greatest from our social media feed.</p>
            </div>
            <div className={styles.mediaGrid}>
              {mediaWallItems.map((item) => (
                <figure
                  key={item.title}
                  className={`${styles.mediaTile} ${
                    item.size === "mega"
                      ? styles.tileMega
                      : item.size === "wide"
                        ? styles.tileWide
                        : item.size === "tall"
                          ? styles.tileTall
                          : ""
                  }`}
                >
                  <img src={item.src} alt={item.title} loading="lazy" />
                  <div className={styles.mediaOverlay}>
                    <span className={styles.mediaBadge}>
                      {item.type === "video" ? "Video" : "Photo"}
                    </span>
                    {item.type === "video" && (
                      <span className={styles.playIcon} aria-hidden="true">
                        <Play size={20} />
                      </span>
                    )}
                  </div>
                  <figcaption>{item.title}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className={`section ${styles.cta}`}>
          <div className="container">
            <div className={styles.ctaBox}>
              <div className={styles.ctaContent}>
                <h2 className={styles.title}>Shape the Narrative With Us</h2>
                <p>Stay connected to the stories that matter. Subscribe for project updates and exclusive documentary insights.</p>
          <form className={styles.ctaForm} onSubmit={async (e) => {
            e.preventDefault();
            const email = (e.target as any).querySelector('input').value;
            const res = await fetch('/api/newsletter', {
              method: 'POST',
              body: JSON.stringify({ email }),
            });
            if (res.ok) alert('Successfully joined!');
          }}>
            <input type="email" placeholder="Your email address" required />
            <button type="submit" className="btn btn-primary">
               Join the Movement <Mail size={18} />
             </button>
          </form>

              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
