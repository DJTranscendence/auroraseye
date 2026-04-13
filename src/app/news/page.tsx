'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

type NewsStory = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  image: string;
  publishedAt: string;
  tags: string[];
  isPinned: boolean;
};

type NewsEditDraft = {
  title: string;
  summary: string;
  url: string;
  source: string;
  image: string;
  publishedAt: string;
  tagsText: string;
};

type NewsTabKey = 'youtube' | 'articles';

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function isYouTubeStory(story: NewsStory) {
  const url = story.url?.toLowerCase() ?? '';
  const source = story.source?.toLowerCase() ?? '';
  const tags = story.tags?.map((tag) => tag.toLowerCase()) ?? [];

  return url.includes('youtu') || source.includes('youtube') || tags.includes('youtube');
}

function getYouTubeId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '');
    }

    if (parsed.searchParams.has('v')) {
      return parsed.searchParams.get('v') ?? '';
    }

    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts.pop() ?? '';
  } catch {
    return '';
  }
}

export default function NewsPage() {
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<NewsEditDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<NewsTabKey>('youtube');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewTimeoutRef = useRef<number | null>(null);

  const loadStories = async () => {
    const response = await fetch('/api/cms?type=news');
    const data = await response.json();
    setStories(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadStories()
      .catch(() => setStories([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw);
        setIsAdmin(user?.role === 'admin');
      }
    } catch (error) {
      console.error('Failed to read user role', error);
    }
  }, []);

  const handleLiveRefresh = async () => {
    setRefreshing(true);
    setMessage('');

    try {
      const response = await fetch('/api/news/generate', { method: 'POST' });
      const result = await response.json();
      await loadStories();

      if (!result?.success) {
        setMessage('Live refresh failed.');
      }
    } catch {
      setMessage('Live refresh failed.');
    } finally {
      setRefreshing(false);
    }
  };

  const beginEdit = (story: NewsStory) => {
    setEditingId(story.id);
    setEditDraft({
      title: story.title || '',
      summary: story.summary || '',
      url: story.url || '',
      source: story.source || '',
      image: story.image || '',
      publishedAt: story.publishedAt || new Date().toISOString(),
      tagsText: story.tags?.join(', ') || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const persistStories = async (nextStories: NewsStory[]) => {
    const response = await fetch('/api/cms?type=news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextStories),
    });

    if (!response.ok) {
      throw new Error('Failed to save news');
    }
  };

  const handleSave = async () => {
    if (!editingId || !editDraft) {
      return;
    }

    setSaving(true);
    setMessage('');

    const updatedStories = stories.map((story) => {
      if (story.id !== editingId) return story;

      const tags = editDraft.tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      return {
        ...story,
        title: editDraft.title.trim() || story.title,
        summary: editDraft.summary.trim() || story.summary,
        url: editDraft.url.trim(),
        source: editDraft.source.trim() || story.source,
        image: editDraft.image.trim(),
        publishedAt: editDraft.publishedAt || story.publishedAt,
        tags,
        updatedAt: new Date().toISOString(),
      };
    });

    try {
      await persistStories(updatedStories);
      setStories(updatedStories);
      cancelEdit();
    } catch {
      setMessage('Save failed. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, storyId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok || !data?.url) {
        throw new Error('Upload failed');
      }

      const updatedStories = stories.map((story) =>
        story.id === storyId ? { ...story, image: data.url, updatedAt: new Date().toISOString() } : story,
      );

      await persistStories(updatedStories);
      setStories(updatedStories);

      if (editingId === storyId && editDraft) {
        setEditDraft({ ...editDraft, image: data.url });
      }
    } catch {
      setMessage('Image upload failed.');
    } finally {
      event.target.value = '';
    }
  };

  const orderedStories = useMemo(
    () =>
      [...stories].sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }

        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }),
    [stories],
  );

  const filteredStories = useMemo(() => {
    const base = orderedStories.filter((story) => story.url || story.title || story.summary);
    if (activeTab === 'youtube') {
      return base.filter(isYouTubeStory);
    }

    return base.filter((story) => !isYouTubeStory(story));
  }, [activeTab, orderedStories]);

  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        window.clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  const handlePreviewStart = (story: NewsStory) => {
    if (!isYouTubeStory(story) || !story.url) {
      return;
    }

    const videoId = getYouTubeId(story.url);
    if (!videoId) {
      return;
    }

    setPreviewId(story.id);
    if (previewTimeoutRef.current) {
      window.clearTimeout(previewTimeoutRef.current);
    }
    previewTimeoutRef.current = window.setTimeout(() => {
      setPreviewId(null);
    }, 3000);
  };

  const handlePreviewEnd = () => {
    if (previewTimeoutRef.current) {
      window.clearTimeout(previewTimeoutRef.current);
    }
    setPreviewId(null);
  };

  const handleCardClick = (story: NewsStory) => {
    if (!story.url) {
      return;
    }

    window.open(story.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <header className={styles.header}>
            <div className={styles.badge}>Newsroom</div>
            <h1 className={styles.title}>Aurora's Eye News</h1>
            <p className={styles.subtitle}>
              A live stream of documentary and impact-story updates, plus manually curated stories from our team.
            </p>
          </header>

          <div className={styles.tabs} role="tablist" aria-label="News categories">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'youtube'}
              className={`${styles.tabButton} ${activeTab === 'youtube' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('youtube')}
            >
              Latest releases
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'articles'}
              className={`${styles.tabButton} ${activeTab === 'articles' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('articles')}
            >
              Articles + awards
            </button>
          </div>

          <div className={styles.actions}>
            <button type="button" className="btn btn-primary" onClick={handleLiveRefresh} disabled={refreshing}>
              {refreshing ? 'Refreshing...' : 'Refresh Live News'}
            </button>
          </div>
          {message ? <p className={styles.notice}>{message}</p> : null}

          {loading ? (
            <div className={styles.empty}>Loading stories...</div>
          ) : filteredStories.length === 0 ? (
            <div className={styles.empty}>No stories yet. Trigger live refresh or add stories from the admin panel.</div>
          ) : (
            <div className={styles.newsGrid}>
              {filteredStories.map((story) => {
                const isPreviewing = previewId === story.id;
                const videoId = story.url ? getYouTubeId(story.url) : '';

                return (
                  <article
                    key={story.id}
                    className={`${styles.card} ${story.url ? styles.cardInteractive : ''}`}
                    role={story.url ? 'link' : undefined}
                    tabIndex={story.url ? 0 : -1}
                    aria-disabled={!story.url}
                    onClick={() => handleCardClick(story)}
                    onKeyDown={(event) => {
                      if (!story.url) return;
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleCardClick(story);
                      }
                    }}
                    onMouseEnter={() => handlePreviewStart(story)}
                    onMouseLeave={handlePreviewEnd}
                  >
                    <div className={styles.mediaWrap}>
                      {isPreviewing && videoId ? (
                        <iframe
                          className={styles.previewFrame}
                          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0`}
                          title={story.title}
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                        />
                      ) : story.image ? (
                        <img src={story.image} alt={story.title} className={styles.thumbnail} />
                      ) : (
                        <div className={styles.thumbnail} />
                      )}
                      <div className={styles.overlay}>
                        <span className={styles.overlayText}>{story.summary || 'Open story'}</span>
                      </div>
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.metaRow}>
                        <span className={styles.source}>{story.source || 'News source'}</span>
                        <span className={styles.time}>{formatDate(story.publishedAt)}</span>
                      </div>
                      {isAdmin ? (
                        <div className={styles.adminRow}>
                          <button
                            type="button"
                            className={styles.adminButton}
                            onClick={(event) => {
                              event.stopPropagation();
                              beginEdit(story);
                            }}
                          >
                            Edit story
                          </button>
                          <label
                            className={styles.uploadButton}
                            onClick={(event) => event.stopPropagation()}
                            onKeyDown={(event) => event.stopPropagation()}
                          >
                            Upload image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) => handleImageUpload(event, story.id)}
                              className={styles.uploadInput}
                            />
                          </label>
                        </div>
                      ) : null}
                      {isAdmin && editingId === story.id && editDraft ? (
                        <div className={styles.editPanel} onClick={(event) => event.stopPropagation()}>
                          <label className={styles.editField}>
                            Title
                            <input
                              type="text"
                              value={editDraft.title}
                              onChange={(event) => setEditDraft({ ...editDraft, title: event.target.value })}
                            />
                          </label>
                          <label className={styles.editField}>
                            Summary
                            <textarea
                              rows={4}
                              value={editDraft.summary}
                              onChange={(event) => setEditDraft({ ...editDraft, summary: event.target.value })}
                            />
                          </label>
                          <label className={styles.editField}>
                            Source
                            <input
                              type="text"
                              value={editDraft.source}
                              onChange={(event) => setEditDraft({ ...editDraft, source: event.target.value })}
                            />
                          </label>
                          <label className={styles.editField}>
                            URL
                            <input
                              type="text"
                              value={editDraft.url}
                              onChange={(event) => setEditDraft({ ...editDraft, url: event.target.value })}
                            />
                          </label>
                          <label className={styles.editField}>
                            Published date
                            <input
                              type="datetime-local"
                              value={editDraft.publishedAt.slice(0, 16)}
                              onChange={(event) =>
                                setEditDraft({
                                  ...editDraft,
                                  publishedAt: event.target.value
                                    ? new Date(event.target.value).toISOString()
                                    : editDraft.publishedAt,
                                })
                              }
                            />
                          </label>
                          <label className={styles.editField}>
                            Tags (comma separated)
                            <input
                              type="text"
                              value={editDraft.tagsText}
                              onChange={(event) => setEditDraft({ ...editDraft, tagsText: event.target.value })}
                            />
                          </label>
                          <div className={styles.editActions}>
                            <button type="button" className={styles.adminButton} onClick={handleSave} disabled={saving}>
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button type="button" className={styles.adminGhost} onClick={cancelEdit} disabled={saving}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : null}
                      <h2 className={styles.cardTitle}>{story.title}</h2>
                      <p className={styles.summary}>{story.summary || 'No summary available.'}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
