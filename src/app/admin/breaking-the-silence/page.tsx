'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Film, Plus, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import fallbackContent from '@/data/breakingTheSilence.json';
import styles from './page.module.css';

type BreakingContent = typeof fallbackContent;

type MediaWallItem = BreakingContent['mediaWall']['items'][number];

const emptyItem = (): MediaWallItem => ({
  id: `wall-${Date.now()}`,
  type: 'image',
  title: 'New media item',
  caption: '',
  imageUrl: '',
  imageAlt: '',
  linkUrl: '',
});

export default function AdminBreakingTheSilencePage() {
  const [content, setContent] = useState<BreakingContent>(fallbackContent as BreakingContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/cms?type=breakingTheSilence')
      .then((res) => (res.ok ? res.json() : null))
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
      const response = await fetch('/api/cms?type=breakingTheSilence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });

      if (response.ok) {
        setMessage('Breaking the Silence layout saved.');
      } else {
        setMessage('Save failed.');
      }
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (updates: Partial<BreakingContent['heroFrame']>) => {
    setContent({ ...content, heroFrame: { ...content.heroFrame, ...updates } });
  };

  const updateMediaWall = (updates: Partial<BreakingContent['mediaWall']>) => {
    setContent({ ...content, mediaWall: { ...content.mediaWall, ...updates } });
  };

  const updateWallItem = (index: number, updates: Partial<MediaWallItem>) => {
    const nextItems = [...content.mediaWall.items];
    const currentItem = nextItems[index];
    nextItems[index] = {
      ...currentItem,
      ...updates,
      caption: updates.caption ?? currentItem.caption ?? '',
    } as BreakingContent['mediaWall']['items'][number];
    updateMediaWall({ items: nextItems });
  };

  const addWallItem = () => {
    updateMediaWall({ items: [...content.mediaWall.items, emptyItem()] });
  };

  const removeWallItem = (index: number) => {
    const nextItems = content.mediaWall.items.filter((_, itemIndex) => itemIndex !== index);
    updateMediaWall({ items: nextItems });
  };

  const uploadFile = async (file?: File | null) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!data.success) {
      alert(`Upload failed: ${data.error}`);
      return null;
    }

    return data.url as string;
  };

  const handleHeroUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = await uploadFile(event.target.files?.[0]);
    if (url) {
      updateHero({ imageUrl: url });
    }
  };

  const handleItemUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const url = await uploadFile(event.target.files?.[0]);
    if (url) {
      updateWallItem(index, { imageUrl: url });
    }
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
                <h1>Breaking the Silence Layout Editor</h1>
                <p>Upload the hero frame and manage the media wall assets.</p>
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
                <h2>Hero Frame</h2>
                <div className={styles.grid}>
                  <label className={styles.field}>
                    <span>Hero Image URL</span>
                    <input
                      value={content.heroFrame.imageUrl}
                      onChange={(event) => updateHero({ imageUrl: event.target.value })}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Hero Image Alt</span>
                    <input
                      value={content.heroFrame.imageAlt}
                      onChange={(event) => updateHero({ imageAlt: event.target.value })}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Hero Link URL</span>
                    <input
                      value={content.heroFrame.linkUrl}
                      onChange={(event) => updateHero({ linkUrl: event.target.value })}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Hero Link Label</span>
                    <input
                      value={content.heroFrame.linkLabel}
                      onChange={(event) => updateHero({ linkLabel: event.target.value })}
                    />
                  </label>
                  <label className={`${styles.field} ${styles.full}`}>
                    <span>Upload Hero Image</span>
                    <div className={styles.uploadRow}>
                      <input
                        id="breaking-hero-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleHeroUpload}
                        className={styles.uploadInput}
                      />
                      <label htmlFor="breaking-hero-upload" className={styles.uploadButton}>
                        Upload image
                      </label>
                    </div>
                  </label>
                </div>
              </section>

              <section className={styles.card}>
                <h2>Media Wall</h2>
                <div className={styles.grid}>
                  <label className={styles.field}>
                    <span>Eyebrow</span>
                    <input
                      value={content.mediaWall.eyebrow}
                      onChange={(event) => updateMediaWall({ eyebrow: event.target.value })}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Title</span>
                    <input
                      value={content.mediaWall.title}
                      onChange={(event) => updateMediaWall({ title: event.target.value })}
                    />
                  </label>
                </div>
                <div className={styles.stack}>
                  {content.mediaWall.items.map((item, index) => (
                    <div key={item.id} className={styles.subCard}>
                      <div className={styles.itemHeader}>
                        <h3>{item.title || `Media Item ${index + 1}`}</h3>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => removeWallItem(index)}
                          aria-label="Remove media item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className={styles.grid}>
                        <label className={styles.field}>
                          <span>Type</span>
                          <select
                            value={item.type}
                            onChange={(event) =>
                              updateWallItem(index, {
                                type: event.target.value as MediaWallItem['type'],
                              })
                            }
                          >
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                          </select>
                        </label>
                        <label className={styles.field}>
                          <span>Title</span>
                          <input
                            value={item.title}
                            onChange={(event) => updateWallItem(index, { title: event.target.value })}
                          />
                        </label>
                        <label className={`${styles.field} ${styles.full}`}>
                          <span>Caption</span>
                          <textarea
                            rows={2}
                            value={item.caption ?? ''}
                            onChange={(event) => updateWallItem(index, { caption: event.target.value })}
                          />
                        </label>
                        {item.type === 'video' ? (
                          <>
                            <label className={styles.field}>
                              <span>Embed URL</span>
                              <input
                                value={item.embedUrl ?? ''}
                                onChange={(event) => updateWallItem(index, { embedUrl: event.target.value })}
                              />
                            </label>
                            <label className={styles.field}>
                              <span>Watch URL</span>
                              <input
                                value={item.linkUrl ?? ''}
                                onChange={(event) => updateWallItem(index, { linkUrl: event.target.value })}
                              />
                            </label>
                          </>
                        ) : (
                          <>
                            <label className={styles.field}>
                              <span>Image URL</span>
                              <input
                                value={item.imageUrl ?? ''}
                                onChange={(event) => updateWallItem(index, { imageUrl: event.target.value })}
                              />
                            </label>
                            <label className={styles.field}>
                              <span>Image Alt</span>
                              <input
                                value={item.imageAlt ?? ''}
                                onChange={(event) => updateWallItem(index, { imageAlt: event.target.value })}
                              />
                            </label>
                            <label className={styles.field}>
                              <span>Link URL (optional)</span>
                              <input
                                value={item.linkUrl ?? ''}
                                onChange={(event) => updateWallItem(index, { linkUrl: event.target.value })}
                              />
                            </label>
                            <label className={`${styles.field} ${styles.full}`}>
                              <span>Upload Image</span>
                              <div className={styles.uploadRow}>
                                <input
                                  id={`breaking-wall-upload-${item.id}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(event) => handleItemUpload(index, event)}
                                  className={styles.uploadInput}
                                />
                                <label htmlFor={`breaking-wall-upload-${item.id}`} className={styles.uploadButton}>
                                  Upload image
                                </label>
                              </div>
                            </label>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn btn-outline" onClick={addWallItem}>
                  <Plus size={16} /> Add Media Item
                </button>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
