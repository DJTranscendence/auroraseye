'use client';

import Navbar from "@/components/Navbar";

import Hero from "@/components/Hero";
import VideoGallery from "@/components/VideoGallery";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import Link from "next/link";
import { ArrowRight, Film, Users, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <VideoGallery />


        {/* Benefits/About Section */}
        <section className={`section ${styles.about}`}>
          <div className="container">
            <div className={`grid ${styles.aboutGrid}`}>
              <div className={styles.aboutContent}>
                <h2 className={styles.title}>Visual Advocacy for a <span className="text-primary">Better Tomorrow</span></h2>
                <p>
                  At Aurora&apos;s Eye Films, we believe in the power of visual storytelling to bridge the gap between human struggles 
                  and universal aspirations. Based in the international township of Auroville, we document unique 
                  experiments in social, ecological, and spiritual living.
                </p>
                <div className={styles.stats}>
                  <div className={styles.statItem}>
                    <Film size={24} className="text-primary" />
                    <div>
                      <strong>50+</strong>
                      <p>Documentaries Produced</p>
                    </div>
                  </div>
                  <div className={styles.statItem}>
                    <Users size={24} className="text-primary" />
                    <div>
                      <strong>1M+</strong>
                      <p>Global Audience</p>
                    </div>
                  </div>
                </div>
                <Link href="/team" className="btn btn-outline">Learn About Our Team</Link>
              </div>
              <div className={styles.aboutGallery}>
                <img src="https://images.unsplash.com/photo-1485846234655-95d946a49374?q=80&w=2669&auto=format&fit=crop" alt="Filmmaking in Auroville" />
                <div className={styles.galleryOverlay}>
                  <div className={styles.badge}>Behind the Scenes</div>
                </div>
              </div>
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
