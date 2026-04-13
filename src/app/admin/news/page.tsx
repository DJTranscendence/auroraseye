'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { ArrowLeft, Newspaper, RefreshCw, Plus, Save, Trash2, Pin } from 'lucide-react';

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
  isManual: boolean;
};

const EMPTY_STORY: Omit<NewsStory, 'id'> = {
  title: '',
  summary: '',
  url: '',
  source: 'Manual',
  image: '',
  publishedAt: new Date().toISOString(),
  tags: [],
  isPinned: false,
  isManual: true,
};

function hasAuroraEyeMention(story: Pick<NewsStory, 'title' | 'summary' | 'source' | 'url' | 'tags'>) {
  const brandKeywords = [
    "aurora's eye",
    'auroras eye',
    'aurora eye films',
    'aurora eye',
    '@auroraeyefilms',
    'auroraseyefilms.com',
  ];
  const founderKeywords = ['serena aurora'];
  const aurovilleKeywords = ['auroville'];

  const searchable = [
    story.title,
    story.summary,
    story.source,
    story.url,
    ...(story.tags ?? []),
  ]
    .join(' ')
    .toLowerCase();

  const hasBrandMention = brandKeywords.some((keyword) => searchable.includes(keyword));
  const hasFounderMention = founderKeywords.some((keyword) => searchable.includes(keyword));
  const hasAurovilleMention = aurovilleKeywords.some((keyword) => searchable.includes(keyword));

  return hasBrandMention || (hasFounderMention && hasAurovilleMention);
}

export default function AdminNewsPage() {
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [draft, setDraft] = useState(EMPTY_STORY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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

  const ordered = useMemo(
    () =>
      [...stories].sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }

        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }),
    [stories],
  );

  const persistStories = async (nextStories: NewsStory[]) => {
    setSaving(true);
    try {
      await fetch('/api/cms?type=news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextStories),
      });
      setStories(nextStories);
      setMessage('Saved successfully.');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const addManualStory = async () => {
    if (!draft.title.trim() || !draft.url.trim()) {
      setMessage('Title and URL are required.');
      return;
    }

    if (!hasAuroraEyeMention(draft)) {
      setMessage("Story must mention Aurora's Eye, or mention Serena Aurora together with Auroville.");
      return;
    }

    const now = new Date().toISOString();
    const newStory: NewsStory = {
      ...draft,
      id: `manual-${Date.now()}`,
      tags: draft.tags,
      publishedAt: draft.publishedAt || now,
      isManual: true,
    };

    await persistStories([newStory, ...stories]);
    setDraft(EMPTY_STORY);
  };

  const removeStory = async (id: string) => {
    const next = stories.filter((story) => story.id !== id);
    await persistStories(next);
  };

  const togglePin = async (id: string) => {
    const next = stories.map((story) =>
      story.id === id ? { ...story, isPinned: !story.isPinned } : story,
    );
    await persistStories(next);
  };

  const runGenerator = async () => {
    setSaving(true);
    setMessage('Generating live stories...');

    try {
      const response = await fetch('/api/news/generate', { method: 'POST' });
      const result = await response.json();
      await loadStories();

      if (result?.success) {
        setMessage(`Live generation complete: ${result.createdCount} new, ${result.updatedCount} updated.`);
      } else {
        setMessage('Generator failed.');
      }
    } catch {
      setMessage('Generator failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <div className={styles.titleInfo}>
              <Newspaper size={30} className="text-primary" />
              <div>
                <h1>News Editor</h1>
                <p>Generate live stories and add manual stories for the public news page.</p>
              </div>
            </div>
            <div className={styles.actions}>
              <Link href="/admin" className="btn btn-outline">
                <ArrowLeft size={16} /> Back to Dashboard
              </Link>
              <button type="button" className="btn btn-primary" onClick={runGenerator} disabled={saving}>
                <RefreshCw size={16} /> Generate Live News
              </button>
            </div>
          </div>

          {message ? <p className={styles.notice}>{message}</p> : null}

          <section className={styles.formCard}>
            <h2>Add Manual Story</h2>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Title</label>
                <input
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  placeholder="Story title"
                />
              </div>
              <div className={styles.field}>
                <label>Source</label>
                <input
                  value={draft.source}
                  onChange={(event) => setDraft({ ...draft, source: event.target.value })}
                  placeholder="Source"
                />
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label>Story URL</label>
                <input
                  value={draft.url}
                  onChange={(event) => setDraft({ ...draft, url: event.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label>Summary</label>
                <textarea
                  value={draft.summary}
                  onChange={(event) => setDraft({ ...draft, summary: event.target.value })}
                  rows={3}
                  placeholder="Short summary"
                />
              </div>
              <div className={styles.field}>
                <label>Image URL</label>
                <input
                  value={draft.image}
                  onChange={(event) => setDraft({ ...draft, image: event.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className={styles.field}>
                <label>Published At</label>
                <input
                  type="datetime-local"
                  value={new Date(draft.publishedAt).toISOString().slice(0, 16)}
                  onChange={(event) =>
                    setDraft({ ...draft, publishedAt: new Date(event.target.value).toISOString() })
                  }
                />
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label>Tags (comma separated)</label>
                <input
                  value={draft.tags.join(', ')}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      tags: event.target.value
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="auroville, documentary"
                />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn btn-primary" onClick={addManualStory} disabled={saving}>
                <Plus size={16} /> Add Story
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setDraft(EMPTY_STORY)}>
                Reset
              </button>
            </div>
          </section>

          <section className={styles.list}>
            {loading ? (
              <div className={styles.item}>Loading stories...</div>
            ) : ordered.length === 0 ? (
              <div className={styles.item}>No stories yet.</div>
            ) : (
              ordered.map((story) => (
                <article key={story.id} className={styles.item}>
                  <div className={styles.meta}>
                    <span>{story.source || 'Unknown source'}</span>
                    <span>{new Date(story.publishedAt).toLocaleString()}</span>
                    <span>{story.isManual ? 'Manual' : 'Generated'}</span>
                    {story.isPinned ? <span>Pinned</span> : null}
                  </div>
                  <h3>{story.title}</h3>
                  <p>{story.summary}</p>
                  <div className={styles.itemActions}>
                    <button type="button" className="btn btn-outline" onClick={() => togglePin(story.id)} disabled={saving}>
                      <Pin size={16} /> {story.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => persistStories(stories)} disabled={saving}>
                      <Save size={16} /> Save
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => removeStory(story.id)} disabled={saving}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
