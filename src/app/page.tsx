'use client';

import Navbar from "@/components/Navbar";

import Hero from "@/components/Hero";
import VideoGallery from "@/components/VideoGallery";
import RedditWall from "@/components/RedditWall";
import Footer from "@/components/Footer";
import Script from "next/script";
import styles from "./page.module.css";
import { Mail } from "lucide-react";

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
            {/* SociableKit Instagram Feed */}
            <div 
              className="sk-instagram-feed" 
              data-embed-id="25674162"
              // Attempting common attributes (though dashboard is preferred)
              data-sort-by="recent"
            ></div>
            <Script 
              src="https://widgets.sociablekit.com/instagram-feed/widget.js" 
              strategy="afterInteractive"
              onLoad={() => {
                // Background script to handle video previews if possible
                const interval = setInterval(() => {
                  const videos = document.querySelectorAll('.sk-instagram-feed video');
                  if (videos.length > 0) {
                    videos.forEach((video: any) => {
                      video.muted = true;
                      video.loop = true;
                      // Play on hover logic
                      video.parentElement.onmouseenter = () => video.play();
                      video.parentElement.onmouseleave = () => video.pause();
                    });
                    clearInterval(interval);
                  }
                }, 2000);
                setTimeout(() => clearInterval(interval), 10000);
              }}
            />
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
