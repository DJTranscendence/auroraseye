'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { ArrowLeft, Save, Film } from 'lucide-react';
import fallbackContent from '@/data/karshaNuns.json';

type KarshaContent = typeof fallbackContent;

export default function AdminKarshaNunsPage() {
  const [content, setContent] = useState<KarshaContent>(fallbackContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/cms?type=karshaNuns')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setContent(data);
        }
      })
      .catch(() => {
        setMessage('Using local fallback content.');
      })
      .finally(() => setLoading(false));
  }, []);

  const saveContent = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/cms?type=karshaNuns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });

      if (response.ok) {
        setMessage('Karsha page layout saved.');
      } else {
        setMessage('Save failed.');
      }
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const updateFollowUp = (index: number, key: 'title' | 'embedUrl' | 'watchUrl' | 'summary', value: string) => {
    const next = { ...content };
    next.documentary.followUps = [...next.documentary.followUps];
    next.documentary.followUps[index] = {
      ...next.documentary.followUps[index],
      [key]: value,
    };
    setContent(next);
  };

  const updateNunneryCard = (index: number, key: 'title' | 'body' | 'imageUrl' | 'imageAlt', value: string) => {
    const next = { ...content };
    next.nunnery.cards = [...next.nunnery.cards];
    next.nunnery.cards[index] = {
      ...next.nunnery.cards[index],
      [key]: value,
    };
    setContent(next);
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <div className={styles.titleInfo}>
              <Film size={30} className="text-primary" />
              <div>
                <h1>Karsha Nuns Layout Editor</h1>
                <p>Edit text and image content for the Karsha Nuns page.</p>
              </div>
            </div>
            <div className={styles.actions}>
              <Link href="/admin" className="btn btn-outline">
                <ArrowLeft size={16} /> Back to Dashboard
              </Link>
              <button type="button" className="btn btn-primary" onClick={saveContent} disabled={saving || loading}>
                <Save size={16} /> Save Layout
              </button>
            </div>
          </div>

          {message ? <p className={styles.notice}>{message}</p> : null}

          {loading ? (
            <section className={styles.card}>Loading layout...</section>
          ) : (
            <>
              <section className={styles.card}>
                <h2>Project Links</h2>
                <div className={styles.grid}>
                  <label className={styles.field}>
                    <span>Instagram</span>
                    <input
                      value={content.projectLinks.instagram}
                      onChange={(event) =>
                        setContent({
                          ...content,
                          projectLinks: { ...content.projectLinks, instagram: event.target.value },
                        })
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Facebook</span>
                    <input
                      value={content.projectLinks.facebook}
                      onChange={(event) =>
                        setContent({
                          ...content,
                          projectLinks: { ...content.projectLinks, facebook: event.target.value },
                        })
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Website</span>
                    <input
                      value={content.projectLinks.website}
                      onChange={(event) =>
                        setContent({
                          ...content,
                          projectLinks: { ...content.projectLinks, website: event.target.value },
                        })
                      }
                    />
                  </label>
                </div>
              </section>

              <section className={styles.card}>
                <h2>Hero</h2>
                <div className={styles.grid}>
                  <label className={`${styles.field} ${styles.full}`}>
                    <span>Hero Title</span>
                    <input
                      value={content.hero.title}
                      onChange={(event) => setContent({ ...content, hero: { ...content.hero, title: event.target.value } })}
                    />
                  </label>
                  {content.hero.paragraphs.map((paragraph, index) => (
                    <label key={`hero-p-${index}`} className={`${styles.field} ${styles.full}`}>
                      <span>Hero Paragraph {index + 1}</span>
                      <textarea
                        rows={3}
                        value={paragraph}
                        onChange={(event) => {
                          const paragraphs = [...content.hero.paragraphs];
                          paragraphs[index] = event.target.value;
                          setContent({ ...content, hero: { ...content.hero, paragraphs } });
                        }}
                      />
                    </label>
                  ))}
                  <label className={styles.field}>
                    <span>Hero CTA Text</span>
                    <input
                      value={content.hero.ctaText}
                      onChange={(event) => setContent({ ...content, hero: { ...content.hero, ctaText: event.target.value } })}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Hero Image URL</span>
                    <input
                      value={content.hero.imageUrl}
                      onChange={(event) => setContent({ ...content, hero: { ...content.hero, imageUrl: event.target.value } })}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Hero Image Alt</span>
                    <input
                      value={content.hero.imageAlt}
                      onChange={(event) => setContent({ ...content, hero: { ...content.hero, imageAlt: event.target.value } })}
                    />
                  </label>
                </div>
              </section>

              <section className={styles.card}>
                <h2>Main Documentary Block</h2>
                <div className={styles.grid}>
                  <label className={styles.field}>
                    <span>Eyebrow</span>
                    <input
                      value={content.documentary.eyebrow}
                      onChange={(event) =>
                        setContent({ ...content, documentary: { ...content.documentary, eyebrow: event.target.value } })
                      }
                    />
                  </label>
                  <label className={`${styles.field} ${styles.full}`}>
                    <span>Section Title</span>
                    <input
                      value={content.documentary.title}
                      onChange={(event) =>
                        setContent({ ...content, documentary: { ...content.documentary, title: event.target.value } })
                      }
                    />
                  </label>
                  <label className={`${styles.field} ${styles.full}`}>
                    <span>Section Intro</span>
                    <textarea
                      rows={3}
                      value={content.documentary.intro}
                      onChange={(event) =>
                        setContent({ ...content, documentary: { ...content.documentary, intro: event.target.value } })
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Main Video Title</span>
                    <input
                      value={content.documentary.mainVideo.title}
                      onChange={(event) =>
                        setContent({
                          ...content,
                          documentary: {
                            ...content.documentary,
                            mainVideo: { ...content.documentary.mainVideo, title: event.target.value },
                          },
                        })
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Main Video Embed URL</span>
                    <input
                      value={content.documentary.mainVideo.embedUrl}
                      onChange={(event) =>
                        setContent({
                          ...content,
                          documentary: {
                            ...content.documentary,
                            mainVideo: { ...content.documentary.mainVideo, embedUrl: event.target.value },
                          },
                        })
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Main Video Watch URL</span>
                    <input
                      value={content.documentary.mainVideo.watchUrl}
                      onChange={(event) =>
                        setContent({
                          ...content,
                          documentary: {
                            ...content.documentary,
                            mainVideo: { ...content.documentary.mainVideo, watchUrl: event.target.value },
                          },
                        })
                      }
                    />
                  </label>
                  <label className={`${styles.field} ${styles.full}`}>
                    <span>Main Video Description 1</span>
                    <textarea
                      rows={3}
                      value={content.documentary.mainVideo.description1}
                      onChange={(event) =>
                        setContent({
                          ...content,
                          documentary: {
                            ...content.documentary,
                            mainVideo: { ...content.documentary.mainVideo, description1: event.target.value },
                          },
                        })
                      }
                    />
                  </label>
                  <label className={`${styles.field} ${styles.full}`}>
                    <span>Main Video Description 2</span>
                    <textarea
                      rows={3}
                      value={content.documentary.mainVideo.description2}
                      onChange={(event) =>
                        setContent({
                          ...content,
                          documentary: {
                            ...content.documentary,
                            mainVideo: { ...content.documentary.mainVideo, description2: event.target.value },
                          },
                        })
                      }
                    />
                  </label>
                </div>
              </section>

              <section className={styles.card}>
                <h2>Follow-up Videos</h2>
                <div className={styles.stack}>
                  {content.documentary.followUps.map((item, index) => (
                    <div key={`followup-${index}`} className={styles.subCard}>
                      <h3>Follow-up {index + 1}</h3>
                      <div className={styles.grid}>
                        <label className={styles.field}>
                          <span>Title</span>
                          <input value={item.title} onChange={(event) => updateFollowUp(index, 'title', event.target.value)} />
                        </label>
                        <label className={styles.field}>
                          <span>Embed URL</span>
                          <input
                            value={item.embedUrl}
                            onChange={(event) => updateFollowUp(index, 'embedUrl', event.target.value)}
                          />
                        </label>
                        <label className={styles.field}>
                          <span>Watch URL</span>
                          <input
                            value={item.watchUrl}
                            onChange={(event) => updateFollowUp(index, 'watchUrl', event.target.value)}
                          />
                        </label>
                        <label className={`${styles.field} ${styles.full}`}>
                          <span>Summary</span>
                          <textarea
                            rows={2}
                            value={item.summary}
                            onChange={(event) => updateFollowUp(index, 'summary', event.target.value)}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {(['history', 'visit', 'eco'] as const).map((sectionKey) => {
                const section = content[sectionKey];
                return (
                  <section key={sectionKey} className={styles.card}>
                    <h2>{sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)} Section</h2>
                    <div className={styles.grid}>
                      <label className={styles.field}>
                        <span>Eyebrow</span>
                        <input
                          value={section.eyebrow}
                          onChange={(event) =>
                            setContent({ ...content, [sectionKey]: { ...section, eyebrow: event.target.value } })
                          }
                        />
                      </label>
                      <label className={`${styles.field} ${styles.full}`}>
                        <span>Title</span>
                        <input
                          value={section.title}
                          onChange={(event) =>
                            setContent({ ...content, [sectionKey]: { ...section, title: event.target.value } })
                          }
                        />
                      </label>
                      {section.paragraphs.map((paragraph, index) => (
                        <label key={`${sectionKey}-p-${index}`} className={`${styles.field} ${styles.full}`}>
                          <span>Paragraph {index + 1}</span>
                          <textarea
                            rows={3}
                            value={paragraph}
                            onChange={(event) => {
                              const paragraphs = [...section.paragraphs];
                              paragraphs[index] = event.target.value;
                              setContent({ ...content, [sectionKey]: { ...section, paragraphs } });
                            }}
                          />
                        </label>
                      ))}
                      <label className={styles.field}>
                        <span>Image URL</span>
                        <input
                          value={section.imageUrl}
                          onChange={(event) =>
                            setContent({ ...content, [sectionKey]: { ...section, imageUrl: event.target.value } })
                          }
                        />
                      </label>
                      <label className={styles.field}>
                        <span>Image Alt</span>
                        <input
                          value={section.imageAlt}
                          onChange={(event) =>
                            setContent({ ...content, [sectionKey]: { ...section, imageAlt: event.target.value } })
                          }
                        />
                      </label>
                    </div>
                  </section>
                );
              })}

              <section className={styles.card}>
                <h2>Nunnery Cards</h2>
                <div className={styles.grid}>
                  <label className={styles.field}>
                    <span>Eyebrow</span>
                    <input
                      value={content.nunnery.eyebrow}
                      onChange={(event) => setContent({ ...content, nunnery: { ...content.nunnery, eyebrow: event.target.value } })}
                    />
                  </label>
                  <label className={`${styles.field} ${styles.full}`}>
                    <span>Title</span>
                    <input
                      value={content.nunnery.title}
                      onChange={(event) => setContent({ ...content, nunnery: { ...content.nunnery, title: event.target.value } })}
                    />
                  </label>
                </div>
                <div className={styles.stack}>
                  {content.nunnery.cards.map((card, index) => (
                    <div key={`nunnery-${index}`} className={styles.subCard}>
                      <h3>Card {index + 1}</h3>
                      <div className={styles.grid}>
                        <label className={styles.field}>
                          <span>Title</span>
                          <input value={card.title} onChange={(event) => updateNunneryCard(index, 'title', event.target.value)} />
                        </label>
                        <label className={styles.field}>
                          <span>Image URL</span>
                          <input
                            value={card.imageUrl}
                            onChange={(event) => updateNunneryCard(index, 'imageUrl', event.target.value)}
                          />
                        </label>
                        <label className={styles.field}>
                          <span>Image Alt</span>
                          <input
                            value={card.imageAlt}
                            onChange={(event) => updateNunneryCard(index, 'imageAlt', event.target.value)}
                          />
                        </label>
                        <label className={`${styles.field} ${styles.full}`}>
                          <span>Body</span>
                          <textarea rows={3} value={card.body} onChange={(event) => updateNunneryCard(index, 'body', event.target.value)} />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
