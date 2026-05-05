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

import { useState, useEffect } from "react";
import PageThemeDock from "@/components/PageThemeDock";
import { InlineCmsText } from "@/components/cms/InlineCmsBlocks";

export default function Home() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetch('/api/cms?type=config', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(() => {});
  }, []);

  return (
    <PageThemeDock
      pageType="home"
      initialColors={config?.homePageTheme}
      initialPayload={config}
    >
      <Navbar />
      <main>
        <Hero />
        <section id="latest-work">
          <VideoGallery />
        </section>

        <section className={`section ${styles.mediaWall}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <p className="eyebrow">
                <InlineCmsText
                  cmsType="config"
                  path={['homePageCopy', 'mediaWallEyebrow']}
                  initialValue={config?.homePageCopy?.mediaWallEyebrow ?? 'From the field'}
                  as="span"
                />
              </p>
              <h2>
                <InlineCmsText
                  cmsType="config"
                  path={['homePageCopy', 'mediaWallTitle']}
                  initialValue={config?.homePageCopy?.mediaWallTitle ?? 'Instagram Highlights'}
                  as="span"
                />
              </h2>
              <p>
                <InlineCmsText
                  cmsType="config"
                  path={['homePageCopy', 'mediaWallSubtitle']}
                  initialValue={
                    config?.homePageCopy?.mediaWallSubtitle ??
                    'The latest and greatest from our social media feed.'
                  }
                  as="span"
                />
              </p>
            </div>
            {/* Elfsight Instagram Feed | Aurora's Eye */}
            <Script src="https://elfsightcdn.com/platform.js" async strategy="afterInteractive" />
            <div className="elfsight-app-a794f8fd-d734-4f7e-ad36-d3bf895fc0a6" data-elfsight-app-lazy></div>
          </div>
        </section>

        <RedditWall />

        {/* Call to Action */}
        <section className={`section ${styles.cta}`}>
          <div className="container">
            <div className={styles.ctaBox}>
              <div className={styles.ctaContent}>
                <h2 className={styles.title}>
                  <InlineCmsText
                    cmsType="config"
                    path={['homePageCopy', 'ctaTitle']}
                    initialValue={config?.homePageCopy?.ctaTitle ?? 'Shape the Narrative With Us'}
                    as="span"
                  />
                </h2>
                <p>
                  <InlineCmsText
                    cmsType="config"
                    path={['homePageCopy', 'ctaBody']}
                    initialValue={
                      config?.homePageCopy?.ctaBody ??
                      'Stay connected to the stories that matter. Subscribe for project updates and exclusive documentary insights.'
                    }
                    as="span"
                    multiline
                  />
                </p>
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
    </PageThemeDock>
  );
}
