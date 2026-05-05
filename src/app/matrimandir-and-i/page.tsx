'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { DonationProject } from '@/components/DonationProjectDetails';
import WatchNextStrip from '@/components/WatchNextStrip';
import YouTubeSubscribePanel from '@/components/YouTubeSubscribePanel';
import RedditWall, {
  AURORAS_EYE_REDDIT,
  MATRIMANDIR_AND_I_REDDIT_POSTS,
} from '@/components/RedditWall';
import styles from './page.module.css';

type DonationProjectsPayload = {
  projects: DonationProject[];
};

type TabId = 'shorts' | 'interviews' | 'episodes' | 'feature';

const DONATION_LINK_INDIA = 'https://pay.auroville.org/aef';

function FundingLink({
  href,
  className,
  children,
}: {
  href: string | null;
  className: string;
  children: React.ReactNode;
}) {
  if (href) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <span className={`${className} ${styles.fundingLinkDisabled}`} aria-disabled="true">
      {children}
    </span>
  );
}

export default function MatrimandirAndIPage() {
  const [activeTab, setActiveTab] = useState<TabId>('shorts');
  const [episodes, setEpisodes] = useState<DonationProject['previousEpisodes']>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fundingHref = DONATION_LINK_INDIA;

  // Background Drag State
  const [isBackgroundDragEnabled, setIsBackgroundDragEnabled] = useState(false);
  const [backgroundOffset, setBackgroundOffset] = useState({ x: 0, y: 0 });
  const dragStateRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number; } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw);
        setIsAdmin(user?.role === 'admin');
      }
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const savedToggle = localStorage.getItem('matrimandir-bg-drag-enabled');
    if (savedToggle) setIsBackgroundDragEnabled(savedToggle === 'true');
  }, [isAdmin]);

  useEffect(() => {
    const savedOffset = localStorage.getItem('matrimandir-bg-offset');
    if (savedOffset) {
      try {
        const parsed = JSON.parse(savedOffset);
        if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
          setBackgroundOffset(parsed);
          return;
        }
      } catch {}
    }
    setBackgroundOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (isAdmin) {
      localStorage.setItem('matrimandir-bg-drag-enabled', String(isBackgroundDragEnabled));
      localStorage.setItem('matrimandir-bg-offset', JSON.stringify(backgroundOffset));
    }
  }, [isBackgroundDragEnabled, backgroundOffset, isAdmin]);

  const tabs = useMemo(
    () => [
      {
        id: 'shorts' as const,
        label: 'Shorts (1 min)',
        title: 'Shorts (1 min)',
        description: 'Quick glimpses from Matrimandir & I, designed for a one-minute impact.',
        sourceUrl: 'https://matrimandirandi.com/shorts/',
      },
      {
        id: 'interviews' as const,
        label: 'Interviews (Personal)',
        title: 'Interviews (Personal)',
        description: 'Personal stories, reflections, and intimate moments from the series.',
        sourceUrl: 'https://matrimandirandi.com/interviews/',
      },
      {
        id: 'episodes' as const,
        label: 'Episodes (4 Voices)',
        title: 'Episodes (4 Voices)',
        description: 'The main episodes featuring four voices in the Matrimandir journey.',
        sourceUrl: 'https://matrimandirandi.com/episodes/',
      },
      {
        id: 'feature' as const,
        label: 'Feature Film',
        title: 'Feature Film',
        description: 'Support the feature film in post-production, starting with sound.',
        sourceUrl: null,
      },
    ],
    []
  );

  useEffect(() => {
    fetch('/api/cms?type=donationProjects')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: DonationProjectsPayload | null) => {
        const project = data?.projects?.find((item) => item.id === 'matrimandir-and-i');
        setEpisodes(project?.previousEpisodes ?? []);
        // @ts-ignore
        if (project?.backgroundImageUrl) {
          // @ts-ignore
          setBgImage(project.backgroundImageUrl);
        }
      })
      .catch(() => setEpisodes([]));
  }, []);

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url;
      if (!imageUrl) throw new Error('No URL returned');

      setBgImage(imageUrl);

      const currentRes = await fetch('/api/cms?type=donationProjects');
      if (currentRes.ok) {
        const currentData = await currentRes.json();
        const projects = currentData?.projects ?? [];
        const index = projects.findIndex((p: any) => p.id === 'matrimandir-and-i');
        if (index >= 0) {
          projects[index].backgroundImageUrl = imageUrl;
          await fetch('/api/cms?type=donationProjects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projects }),
          });
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload background image');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isAdmin || !isBackgroundDragEnabled) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('input, textarea, button, a, select, label')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: backgroundOffset.x,
      originY: backgroundOffset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state || state.pointerId !== e.pointerId) return;
    setBackgroundOffset({
      x: state.originX + (e.clientX - state.startX),
      y: state.originY + (e.clientY - state.startY),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state || state.pointerId !== e.pointerId) return;
    dragStateRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <>
      <Navbar />
      <main 
        className={styles.main} 
        style={{ 
          position: 'relative', 
          cursor: isBackgroundDragEnabled ? (dragStateRef.current ? 'grabbing' : 'grab') : 'auto',
          background: bgImage
            ? 'linear-gradient(180deg, rgba(18, 24, 38, 0.58) 0%, rgba(10, 16, 28, 0.52) 45%, rgba(9, 14, 24, 0.62) 100%)'
            : undefined,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {bgImage && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url("${bgImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: `calc(50% + ${backgroundOffset.x}px) calc(50% + ${backgroundOffset.y}px)`,
            backgroundAttachment: 'fixed',
            opacity: 0.44,
            zIndex: 0,
            pointerEvents: 'none'
          }} />
        )}
        <div className={styles.container} style={{ position: 'relative', zIndex: 1 }}>
          <header className={styles.pageHeader}>
            {isAdmin && (
              <div style={{ background: 'rgba(8, 14, 26, 0.7)', border: '1px solid rgba(148, 163, 184, 0.2)', padding: '1.25rem', borderRadius: '1rem', marginBottom: '3rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>Admin: Page Background</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#fff', fontSize: '0.9rem' }}>
                  <input 
                    type="checkbox" 
                    checked={isBackgroundDragEnabled} 
                    onChange={(e) => setIsBackgroundDragEnabled(e.target.checked)} 
                  />
                  Enable Drag to Reposition
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {isBackgroundDragEnabled && (
                    <button type="button" className="btn btn-outline" onClick={() => setBackgroundOffset({ x: 0, y: 0 })}>Reset Position</button>
                  )}
                  <label className="btn btn-outline" style={{ cursor: 'pointer', margin: 0 }}>
                    {isUploading ? 'Uploading...' : (bgImage ? 'Change Background' : 'Upload Background')}
                    <input type="file" accept="image/*" style={{ display: 'none' }} disabled={isUploading} onChange={handleBackgroundUpload} />
                  </label>
                </div>
              </div>
            )}
            <span className={styles.pageEyebrow}>Matrimandir & I: A Web Series</span>
            <h1>Your support makes a difference</h1>
            <div className={styles.tabRow}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </header>
          <div className={styles.tabPanel}>
            {tabs.map((tab) => (
              <section
                key={tab.id}
                className={`${styles.panel} ${activeTab === tab.id ? styles.panelActive : ''}`}
              >
                <div className={styles.panelHeader}>
                  <div>
                    <h2>{tab.title}</h2>
                    <p>{tab.description}</p>
                  </div>
                  <FundingLink href={fundingHref} className={styles.panelFundingLink}>
                    Fund this section
                  </FundingLink>
                </div>

                {tab.sourceUrl ? (
                  <div className={styles.embedFrame}>
                    <iframe
                      src={tab.sourceUrl}
                      title={`Matrimandir and I ${tab.title}`}
                      sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                    />
                    <div className={styles.embedCover} aria-hidden="true" />
                  </div>
                ) : (
                  <div className={styles.featureGrid}>
                    <article className={styles.featureCard}>
                      <h3>Fund Sound Production</h3>
                      <p>Help us build the soundscape with a dedicated audio production fund.</p>
                      <FundingLink href={fundingHref} className={styles.featureCardLink}>
                        Fund Sound Production
                      </FundingLink>
                    </article>
                    <article className={styles.featureCard}>
                      <h3>Esteemed Local Composer</h3>
                      <p>Support an original score crafted by a respected local composer.</p>
                      <FundingLink href={fundingHref} className={styles.featureCardLink}>
                        Fund the Composer
                      </FundingLink>
                    </article>
                    <article className={styles.featureCard}>
                      <h3>Audio Editor</h3>
                      <p>Fund a dedicated audio editor to refine the final feature mix.</p>
                      <FundingLink href={fundingHref} className={styles.featureCardLink}>
                        Fund Audio Editing
                      </FundingLink>
                    </article>
                  </div>
                )}

                {tab.id === 'episodes' ? (
                  <aside className={styles.episodeColumn}>
                    <div className={styles.episodeHeader}>Previous episodes</div>
                    <div className={styles.episodeList}>
                      {episodes?.length ? (
                        episodes.map((episode, index) => (
                          <a
                            key={`${episode.title}-${index}`}
                            className={styles.episodeCard}
                            href={episode.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img src={episode.thumbnail} alt={episode.title} />
                            <div>
                              <span>Episode {index + 1}</span>
                              <strong>{episode.title}</strong>
                            </div>
                          </a>
                        ))
                      ) : (
                        <div className={styles.episodeEmpty}>No episodes yet.</div>
                      )}
                    </div>
                  </aside>
                ) : null}
              </section>
            ))}
          </div>

          <div className={styles.youtubeSection}>
            <WatchNextStrip
              title="Follow the Story on YouTube"
              description="Follow the Matrimandir & I journey from first encounters to the newest releases, then stay connected for every new episode."
              contextLabel="matrimandir-watch-next"
              items={[
                {
                  title: 'Start the Matrimandir & I series',
                  description: 'Begin with the episode that introduces the soul of Auroville and the people it inspires.',
                  url: 'https://www.youtube.com/watch?v=6j1aV1grEJ0&list=PLPtXaCO-P3fxyE1W5t3gfLTG-YRYHUiCH',
                  thumbnail: 'https://i3.ytimg.com/vi/6j1aV1grEJ0/hqdefault.jpg',
                },
                {
                  title: 'Watch the newest releases',
                  description: 'Catch the latest Matrimandir & I interviews and behind-the-scenes updates.',
                  url: 'https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw/videos',
                  thumbnail: 'https://i1.ytimg.com/vi/LoWZT8xtzv4/hqdefault.jpg',
                },
                {
                  title: 'Subscribe for new episodes',
                  description: 'Join the community and get notified as new voices join the Matrimandir story.',
                  url: 'https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw?sub_confirmation=1',
                  thumbnail: '/logo.png',
                },
              ]}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '4rem 0 2rem' }}>
            <a 
              className="btn btn-primary" 
              href="/discussion?project=matrimandir-and-i"
              style={{ 
                padding: '1.25rem 2.5rem', 
                fontSize: '1.15rem', 
                borderRadius: '999px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.08em',
                fontWeight: 800
              }}
            >
              ❤️ Join the conversation - In our chatroom 💬
            </a>
          </div>

          <RedditWall
            sectionClassName={styles.redditWallBelowChat}
            posts={MATRIMANDIR_AND_I_REDDIT_POSTS}
            eyebrow="Community Pulse"
            heading="Matrimandir & I on Reddit"
            description="Discuss episodes, trailers, and voices from the series on Aurora's Eye Films' community subreddit."
            ctaHref={AURORAS_EYE_REDDIT}
            ctaLabel="Visit r/AurorasEyeFilms"
          />

          <div className={styles.youtubeSection}>
            <YouTubeSubscribePanel contextLabel="matrimandir-subscribe-panel" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
