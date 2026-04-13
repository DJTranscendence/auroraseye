'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import fallbackTabs from '@/data/discussionTabs.json';
import { Paperclip, Send, Smile } from 'lucide-react';

const DEFAULT_TAB = 'breaking-the-silence';

type DiscussionTab = {
  id: string;
  label: string;
  slug: string;
  description?: string;
  backgroundImageUrl?: string;
};

type DiscussionPayload = {
  tabs: DiscussionTab[];
};

type Message = {
  id: string;
  name: string;
  body: string;
  createdAt: string;
  imageUrl?: string;
};

const PROMPT_CHIPS = [
  'A moment that stayed with me...',
  'A question I have...',
  'Something I disagree with...',
  "I'd just like to share...",
] as const;

const QUICK_EMOJIS = [
  '😀',
  '😂',
  '🥰',
  '😍',
  '🤔',
  '👍',
  '👏',
  '❤️',
  '🔥',
  '✨',
  '🙏',
  '💬',
  '🎬',
  '🌿',
  '☀️',
  '🌙',
] as const;

const BACKGROUND_OFFSET_STORAGE_PREFIX = 'discussion-bg-offset:';
const LEGACY_BACKGROUND_OFFSET_KEY = 'discussion-bg-offset';
const BACKGROUND_DRAG_TOGGLE_KEY = 'discussion-bg-drag-enabled';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}


function DiscussionPageInner() {
  const searchParams = useSearchParams();
  const projectParam = searchParams.get('project');
  const [tabs, setTabs] = useState<DiscussionTab[]>(fallbackTabs.tabs ?? []);
  const [activeTabId, setActiveTabId] = useState(DEFAULT_TAB);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newTabLabel, setNewTabLabel] = useState('');
  const [newTabDescription, setNewTabDescription] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageName, setMessageName] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isBackgroundDragEnabled, setIsBackgroundDragEnabled] = useState(false);
  const [backgroundOffset, setBackgroundOffset] = useState({ x: 0, y: 0 });
  const [showNameInput, setShowNameInput] = useState(false);
  const [likedMessages, setLikedMessages] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const appliedProjectParamRef = useRef<string | null>(null);
  const emojiComposerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

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
    if (!isAdmin) {
      setIsBackgroundDragEnabled(false);
      return;
    }

    const savedToggle = localStorage.getItem(BACKGROUND_DRAG_TOGGLE_KEY);
    if (savedToggle) {
      setIsBackgroundDragEnabled(savedToggle === 'true');
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    if (!activeTabId) {
      return;
    }

    localStorage.setItem(`${BACKGROUND_OFFSET_STORAGE_PREFIX}${activeTabId}`, JSON.stringify(backgroundOffset));
  }, [backgroundOffset, isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    localStorage.setItem(BACKGROUND_DRAG_TOGGLE_KEY, String(isBackgroundDragEnabled));
  }, [isBackgroundDragEnabled, isAdmin]);

  useEffect(() => {
    fetch('/api/cms?type=discussionTabs', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: DiscussionPayload | null) => {
        if (data?.tabs?.length) {
          setTabs(data.tabs);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (projectParam && projectParam !== appliedProjectParamRef.current) {
      const nextTab = tabs.find((tab) => tab.slug === projectParam || tab.id === projectParam);
      if (nextTab) {
        appliedProjectParamRef.current = projectParam;
        setActiveTabId(nextTab.id);
        return;
      }
    }

    if (tabs.length && !tabs.find((tab) => tab.id === activeTabId)) {
      setActiveTabId(tabs[0].id);
    }
  }, [projectParam, tabs, activeTabId]);

  useEffect(() => {
    if (!activeTabId) {
      setBackgroundOffset({ x: 0, y: 0 });
      return;
    }

    const perTabKey = `${BACKGROUND_OFFSET_STORAGE_PREFIX}${activeTabId}`;
    const savedOffset = localStorage.getItem(perTabKey) || localStorage.getItem(LEGACY_BACKGROUND_OFFSET_KEY);
    if (!savedOffset) {
      setBackgroundOffset({ x: 0, y: 0 });
      return;
    }

    try {
      const parsed = JSON.parse(savedOffset) as { x: number; y: number };
      if (Number.isFinite(parsed?.x) && Number.isFinite(parsed?.y)) {
        setBackgroundOffset(parsed);
        return;
      }
    } catch {
      // ignore
    }

    setBackgroundOffset({ x: 0, y: 0 });
  }, [activeTabId]);

  useEffect(() => {
    if (!showEmojiPicker) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (emojiComposerRef.current?.contains(event.target as Node)) {
        return;
      }
      setShowEmojiPicker(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [showEmojiPicker]);

  useEffect(() => {
    if (!activeTabId) {
      setMessages([]);
      return;
    }

    fetch(`/api/cms?type=discussionMessages&tabId=${encodeURIComponent(activeTabId)}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { messages?: Message[] } | null) => {
        if (Array.isArray(data?.messages)) {
          setMessages(data.messages);
          return;
        }
        setMessages([]);
      })
      .catch(() => setMessages([]));
  }, [activeTabId]);

  const activeTab = useMemo(() => tabs.find((tab) => tab.id === activeTabId) ?? null, [tabs, activeTabId]);

  const persistTabs = async (nextTabs: DiscussionTab[]) => {
    setTabs(nextTabs);
    await fetch('/api/cms?type=discussionTabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tabs: nextTabs }),
    });
  };

  const handleAddTab = async () => {
    const label = newTabLabel.trim();
    if (!label) {
      return;
    }

    const slug = slugify(label);
    const nextTab: DiscussionTab = {
      id: slug || `tab-${Date.now()}`,
      label,
      slug: slug || label,
      description: newTabDescription.trim() || undefined,
    };

    const nextTabs = [...tabs, nextTab];
    await persistTabs(nextTabs);
    setNewTabLabel('');
    setNewTabDescription('');
    setActiveTabId(nextTab.id);
  };

  const handleDeleteTab = async (tabId: string) => {
    const nextTabs = tabs.filter((tab) => tab.id !== tabId);
    await persistTabs(nextTabs);
    if (activeTabId === tabId && nextTabs.length) {
      setActiveTabId(nextTabs[0].id);
    }
  };

  const insertEmoji = useCallback((emoji: string) => {
    setMessageBody((prev) => `${prev}${emoji}`);
  }, []);

  const handleComposerImage = async (file: File | null) => {
    if (!file) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as { url?: string };
      if (payload?.url) {
        setPendingImageUrl(payload.url);
      }
    } catch (error) {
      console.error('Failed to upload chat image:', error);
    }
  };

  const handlePostMessage = async () => {
    const name = messageName.trim();
    const body = messageBody.trim();
    if (!body && !pendingImageUrl) {
      return;
    }

    const nextMessage: Message = {
      id: `${Date.now()}`,
      name: name || 'Anonymous',
      body: body || '',
      createdAt: new Date().toISOString(),
      ...(pendingImageUrl ? { imageUrl: pendingImageUrl } : {}),
    };

    const nextMessages = [nextMessage, ...messages];
    setMessages(nextMessages);
    setMessageBody('');
    setPendingImageUrl(null);
    setShowEmojiPicker(false);
    try {
      await fetch(`/api/cms?type=discussionMessages&tabId=${encodeURIComponent(activeTabId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tabId: activeTabId, messages: nextMessages }),
      });
    } catch (error) {
      console.error('Failed to save discussion message:', error);
    }
  };

  const handleBackgroundUpload = async (file: File | null) => {
    if (!file || !activeTabId) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { url?: string };
      if (!payload?.url) {
        return;
      }

      const nextTabs = tabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, backgroundImageUrl: payload.url } : tab
      );
      await persistTabs(nextTabs);
    } catch (error) {
      console.error('Failed to upload background image:', error);
    }
  };

  const handleClearBackground = async () => {
    if (!activeTabId) {
      return;
    }

    const nextTabs = tabs.map((tab) =>
      tab.id === activeTabId ? { ...tab, backgroundImageUrl: undefined } : tab
    );
    await persistTabs(nextTabs);
  };

  const activeBackgroundImage = activeTab?.backgroundImageUrl;

  const handleBackgroundPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isAdmin || !isBackgroundDragEnabled) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, button, a, select, label')) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: backgroundOffset.x,
      originY: backgroundOffset.y,
    };
  };

  const handleBackgroundPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const nextX = dragState.originX + (event.clientX - dragState.startX);
    const nextY = dragState.originY + (event.clientY - dragState.startY);
    setBackgroundOffset({ x: nextX, y: nextY });
  };

  const handleBackgroundPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div
      className={`${styles.wrapper} ${isBackgroundDragEnabled ? styles.backgroundDragEnabled : ''}`}
      style={{
        ['--discussion-bg-x' as string]: `${backgroundOffset.x}px`,
        ['--discussion-bg-y' as string]: `${backgroundOffset.y}px`,
        ['--discussion-bg-image' as string]: activeBackgroundImage ? `url("${activeBackgroundImage}")` : 'none',
      }}
      onPointerDown={handleBackgroundPointerDown}
      onPointerMove={handleBackgroundPointerMove}
      onPointerUp={handleBackgroundPointerUp}
      onPointerCancel={handleBackgroundPointerUp}
    >
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Discussion</p>
              <h1>Join the Conversation</h1>
              <p className={styles.subhead}>Share reflections, ask questions, and connect with the project team.</p>
            </div>
            {isAdmin ? (
              <div className={styles.adminCard}>
                <h2>Manage Tabs</h2>
                <div className={styles.adminField}>
                  <label>Project label</label>
                  <input
                    value={newTabLabel}
                    onChange={(event) => setNewTabLabel(event.target.value)}
                    placeholder="New project name"
                  />
                </div>
                <div className={styles.adminField}>
                  <label>Description</label>
                  <input
                    value={newTabDescription}
                    onChange={(event) => setNewTabDescription(event.target.value)}
                    placeholder="Optional description"
                  />
                </div>
                <button type="button" className={styles.adminButton} onClick={handleAddTab}>
                  Add tab
                </button>
                <div className={styles.adminUploadRow}>
                  <div className={styles.adminUploadInfo}>
                    <span>Background image</span>
                    <p>{activeTab?.label ? `For ${activeTab.label}` : 'Select a tab to update.'}</p>
                  </div>
                  <label className={styles.adminUploadButton}>
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleBackgroundUpload(event.target.files?.[0] ?? null)}
                    />
                  </label>
                  <button type="button" className={styles.adminGhostButton} onClick={handleClearBackground}>
                    Clear
                  </button>
                </div>
                {activeBackgroundImage ? (
                  <div className={styles.adminUploadPreview}>
                    <img src={activeBackgroundImage} alt="Background preview" />
                  </div>
                ) : null}
                <div className={styles.adminToggleRow}>
                  <label className={styles.adminToggleLabel}>
                    <input
                      type="checkbox"
                      checked={isBackgroundDragEnabled}
                      onChange={(event) => setIsBackgroundDragEnabled(event.target.checked)}
                    />
                    Background drag
                  </label>
                  <button
                    type="button"
                    className={styles.adminGhostButton}
                    onClick={() => setBackgroundOffset({ x: 0, y: 0 })}
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : null}
          </header>

          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${styles.tabButton} ${tab.id === activeTabId ? styles.tabButtonActive : ''}`}
                onClick={() => setActiveTabId(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {!activeTab ? <div className={styles.empty}>No discussion tabs available yet.</div> : null}
        </div>

        {activeTab ? (
          <div className={styles.chatFullBleed}>
            <section className={`${styles.panel} ${styles.panelFullWidth}`}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>{activeTab.label}</h2>
                  <p>{activeTab.description ?? 'Share thoughts, questions, and updates.'}</p>
                </div>
                {isAdmin ? (
                  <button
                    type="button"
                    className={styles.deleteButton}
                    title="Delete tab"
                    onClick={() => handleDeleteTab(activeTab.id)}
                  >
                    Delete Tab
                  </button>
                ) : null}
              </div>

              <p className={styles.promptLabel}>What did this film make you feel?</p>

              <div className={styles.promptActionRow}>
                <div className={styles.promptChipsRow}>
                  {PROMPT_CHIPS.map((chip, index) => (
                    <button
                      key={chip}
                      type="button"
                      className={styles.promptChip}
                      data-pastel={String(index)}
                      onClick={() => setMessageBody((prev) => (prev ? `${prev}\n${chip}` : chip) + ' ')}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <div className={styles.promptActionsRight}>
                  <button type="button" className={styles.postButton} onClick={handlePostMessage}>
                    Share your voice
                  </button>
                  {!showNameInput ? (
                    <button type="button" className={styles.addNameToggle} onClick={() => setShowNameInput(true)}>
                      + Add name (optional)
                    </button>
                  ) : (
                    <input
                      className={styles.nameInputSmall}
                      value={messageName}
                      onChange={(event) => setMessageName(event.target.value)}
                      placeholder="Your name"
                      autoFocus
                    />
                  )}
                </div>
              </div>

              <div className={styles.chatColumn}>
                <div className={styles.chatListWrap}>
                  <div className={styles.chatList}>
                    {messages.length ? (
                      messages.map((message, index) => {
                        const elapsedSeconds = (Date.now() - new Date(message.createdAt).getTime()) / 1000;
                        const timeString =
                          elapsedSeconds < 60
                            ? 'Just now'
                            : new Date(message.createdAt).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              });
                        const seed = (message.body?.length ?? 0) + (message.imageUrl ? 7 : 0);
                        const randomLikesCount = (seed % 5) + 1;
                        const isLiked = likedMessages.includes(message.id);

                        return (
                          <article
                            key={message.id}
                            className={styles.chatBubble}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className={styles.chatBubbleHeader}>
                              <strong>{message.name}</strong>
                              <span>{timeString}</span>
                            </div>
                            {message.body ? <p>{message.body}</p> : null}
                            {message.imageUrl ? (
                              <img src={message.imageUrl} alt="" className={styles.chatBubbleImage} />
                            ) : null}
                            <div className={styles.chatReactions}>
                              <button
                                type="button"
                                className={`${styles.reactionButton} ${isLiked ? styles.reactionButtonActive : ''}`}
                                onClick={() => {
                                  if (isLiked) {
                                    setLikedMessages((prev) => prev.filter((id) => id !== message.id));
                                  } else {
                                    setLikedMessages((prev) => [...prev, message.id]);
                                  }
                                }}
                              >
                                {isLiked ? '❤️' : '👍'} {isLiked ? randomLikesCount + 1 : randomLikesCount}
                                {isLiked ? ' · You and others felt this' : ' people felt this too'}
                              </button>
                            </div>
                          </article>
                        );
                      })
                    ) : (
                      <div className={styles.chatEmpty}>No messages yet. Start the conversation.</div>
                    )}
                  </div>
                </div>

                <div className={styles.waComposer} ref={emojiComposerRef}>
                  {showEmojiPicker ? (
                    <div className={styles.emojiPopover} role="listbox" aria-label="Emoji picker">
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className={styles.emojiButton}
                          onClick={() => {
                            insertEmoji(emoji);
                            setShowEmojiPicker(false);
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {pendingImageUrl ? (
                    <div className={styles.pendingImageRow}>
                      <img src={pendingImageUrl} alt="Attachment preview" className={styles.pendingImageThumb} />
                      <button type="button" className={styles.pendingImageRemove} onClick={() => setPendingImageUrl(null)}>
                        Remove
                      </button>
                    </div>
                  ) : null}

                  <div className={styles.waBar}>
                    <button
                      type="button"
                      className={styles.waIconButton}
                      aria-label="Insert emoji"
                      onClick={() => setShowEmojiPicker((open) => !open)}
                    >
                      <Smile size={22} strokeWidth={1.75} />
                    </button>
                    <textarea
                      className={styles.waTextarea}
                      value={messageBody}
                      onChange={(event) => setMessageBody(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          void handlePostMessage();
                        }
                      }}
                      rows={1}
                      placeholder="Message"
                      aria-label="Message"
                    />
                    <label className={styles.waIconButton} aria-label="Attach image">
                      <Paperclip size={22} strokeWidth={1.75} />
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.waHiddenFile}
                        onChange={(event) => handleComposerImage(event.target.files?.[0] ?? null)}
                      />
                    </label>
                    <button type="button" className={styles.waSendButton} aria-label="Send" onClick={handlePostMessage}>
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

export default function DiscussionPage() {
  return (
    <Suspense fallback={<div />}> 
      <DiscussionPageInner />
    </Suspense>
  );
}
