'use client';

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Documentary3DBrowser from "./Documentary3DBrowser";
import styles from "./page.module.css";
import PageThemeDock from "@/components/PageThemeDock";
import { InlineCmsText } from "@/components/cms/InlineCmsBlocks";

export default function Documentaries() {
  const [filmsData, setFilmsData] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [filmsRes, configRes] = await Promise.all([
          fetch('/api/cms?type=films', { cache: 'no-store' }),
          fetch('/api/cms?type=config', { cache: 'no-store' })
        ]);
        
        if (filmsRes.ok) setFilmsData(await filmsRes.json());
        if (configRes.ok) setConfig(await configRes.json());
      } catch (err) {
        console.error("Failed to load documentaries data", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <PageThemeDock
      pageType="documentaries"
      initialColors={config?.documentariesPageTheme}
      initialPayload={config}
    >
      <Navbar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className="container">
            <div className="badge">
              <InlineCmsText
                cmsType="config"
                path={['documentariesPageCopy', 'badge']}
                initialValue={config?.documentariesPageCopy?.badge ?? 'Catalog'}
                as="span"
              />
            </div>
            <InlineCmsText
              cmsType="config"
              path={['documentariesPageCopy', 'headerTitle']}
              initialValue={config?.documentariesPageCopy?.headerTitle ?? 'Documentary Archive'}
              as="h1"
            />
            <InlineCmsText
              cmsType="config"
              path={['documentariesPageCopy', 'headerSubtitle']}
              initialValue={
                config?.documentariesPageCopy?.headerSubtitle ??
                'Select your interest, choose a category that interests you and then browse our catalog to select a video to enjoy!'
              }
              as="p"
              className={styles.subtitle}
              multiline
            />
          </div>
        </header>

        <section className={`section ${styles.browserSection}`}>
          <div className="container">
            <Documentary3DBrowser filmsData={filmsData} />
          </div>
        </section>
      </main>
      <Footer />
    </PageThemeDock>
  );
}
