'use client';

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import fallbackContent from "@/data/breakingTheSilence.json";

type BreakingContent = typeof fallbackContent;

type HeroFrame = BreakingContent["heroFrame"];

type MediaWallItem = {
  id: string;
  type: "image" | "video" | string;
  title: string;
  caption?: string;
  imageUrl?: string;
  imageAlt?: string;
  embedUrl?: string;
  linkUrl?: string;
};

type MediaWall = {
  eyebrow: string;
  title: string;
  items: MediaWallItem[];
};

type MediaWallItemType = MediaWallItem["type"];

type UploadTarget = "hero" | "media";

async function fetchBreakingContent() {
  try {
    const response = await fetch("/api/cms?type=breakingTheSilence", { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as BreakingContent;
  } catch {
    return null;
  }
}

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!data?.success) {
    throw new Error(data?.error || "Upload failed");
  }

  return data.url as string;
}

function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        setIsAdmin(user?.role === "admin");
      }
    } catch {
      setIsAdmin(false);
    }
  }, []);

  return isAdmin;
}

function useUploadStatus() {
  const [uploadingTarget, setUploadingTarget] = useState<UploadTarget | null>(null);

  const beginUpload = (target: UploadTarget) => setUploadingTarget(target);
  const endUpload = () => setUploadingTarget(null);

  return { uploadingTarget, beginUpload, endUpload };
}

function resetInput(input?: HTMLInputElement | null) {
  if (input) {
    input.value = "";
  }
}

function mergeHeroImage(content: BreakingContent, imageUrl: string) {
  return {
    ...content,
    heroFrame: {
      ...content.heroFrame,
      imageUrl,
    },
  };
}

function mergeMediaImage(content: BreakingContent, id: string, imageUrl: string) {
  const items = content.mediaWall.items.map((item) =>
    item.id === id
      ? {
          ...item,
          type: "image" as MediaWallItemType,
          imageUrl,
          imageAlt: item.imageAlt ?? "",
        }
      : item
  );

  return {
    ...content,
    mediaWall: {
      ...content.mediaWall,
      items,
    },
  };
}

export function BreakingHeroFrameClient({
  initialHeroFrame,
  initialContent,
}: {
  initialHeroFrame: HeroFrame;
  initialContent: BreakingContent;
}) {
  const [heroFrame, setHeroFrame] = useState(initialHeroFrame);
  const isAdmin = useAdminStatus();
  const { uploadingTarget, beginUpload, endUpload } = useUploadStatus();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    beginUpload("hero");

    try {
      const imageUrl = await uploadFile(file);
      const currentContent = (await fetchBreakingContent()) ?? initialContent;
      const nextContent = mergeHeroImage(currentContent, imageUrl);

      const saveResponse = await fetch("/api/cms?type=breakingTheSilence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextContent),
      });

      if (saveResponse.ok) {
        setHeroFrame((prev) => ({ ...prev, imageUrl }));
      }
    } catch {
      // Silently ignore to avoid interrupting public page UX.
    } finally {
      endUpload();
      resetInput(input);
    }
  };

  return (
    <div className={styles.heroFrame}>
      <div className={styles.heroFrameLink}>
        <img className={styles.heroFrameImage} src={heroFrame.imageUrl} alt={heroFrame.imageAlt} />
        {isAdmin ? (
          <div className={styles.adminUploadOverlay}>
            <input
              id="breaking-hero-upload-public"
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className={styles.adminUploadInput}
            />
            <label htmlFor="breaking-hero-upload-public" className={styles.adminUploadButton}>
              {uploadingTarget === "hero" ? "Uploading..." : "Upload image"}
            </label>
          </div>
        ) : null}
      </div>
      <div className={styles.heroFrameMeta}>
        <p className={styles.heroFrameTitle}>Breaking the Silence</p>
        <p>Not just a film — a space to listen, speak, and heal.</p>
        <p>Because silence protects harm. Conversation creates change.</p>
      </div>
    </div>
  );
}

export function BreakingMediaWallClient({
  initialMediaWall,
  initialContent,
}: {
  initialMediaWall: MediaWall;
  initialContent: BreakingContent;
}) {
  const [mediaWall, setMediaWall] = useState(initialMediaWall);
  const isAdmin = useAdminStatus();
  const { uploadingTarget, beginUpload, endUpload } = useUploadStatus();

  const handleUpload = async (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    beginUpload("media");

    try {
      const imageUrl = await uploadFile(file);
      const currentContent = (await fetchBreakingContent()) ?? initialContent;
      const nextContent = mergeMediaImage(currentContent, id, imageUrl);

      const saveResponse = await fetch("/api/cms?type=breakingTheSilence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextContent),
      });

      if (saveResponse.ok) {
        setMediaWall((prev) => ({
          ...prev,
          items: prev.items.map((item) =>
            item.id === id && item.type === "image"
              ? { ...item, imageUrl, imageAlt: item.imageAlt ?? "" }
              : item
          ),
        }));
      }
    } catch {
      // Silently ignore to avoid interrupting public page UX.
    } finally {
      endUpload();
      resetInput(input);
    }
  };

  const wallItems = Array.isArray(mediaWall.items) ? mediaWall.items : [];

  return (
    <section className={styles.mediaWallSection}>
      <div className="container">
        <div className={styles.mediaWallHeader}>
          <p className={styles.sectionEyebrow}>{mediaWall.eyebrow}</p>
          <h2 className="title">{mediaWall.title}</h2>
        </div>
        <div className={styles.mediaWallGrid}>
          {wallItems.map((item) => (
            <article key={item.id} className={styles.mediaTile}>
              <div className={styles.mediaFrame}>
                {item.type === "video" ? (
                  <iframe
                    className={styles.mediaVideo}
                    src={item.embedUrl}
                    title={item.title}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                ) : item.linkUrl ? (
                  <a href={item.linkUrl} target="_blank" rel="noopener noreferrer">
                    <img className={styles.mediaImage} src={item.imageUrl} alt={item.imageAlt} />
                  </a>
                ) : (
                  <img className={styles.mediaImage} src={item.imageUrl} alt={item.imageAlt} />
                )}
                {isAdmin && item.type === "image" ? (
                  <div className={styles.adminUploadOverlay}>
                    <input
                      id={`breaking-wall-upload-public-${item.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleUpload(item.id, event)}
                      className={styles.adminUploadInput}
                    />
                    <label
                      htmlFor={`breaking-wall-upload-public-${item.id}`}
                      className={styles.adminUploadButton}
                    >
                      {uploadingTarget === "media" ? "Uploading..." : "Upload image"}
                    </label>
                  </div>
                ) : null}
              </div>
              <div className={styles.mediaMeta}>
                <p className={styles.mediaTitle}>{item.title}</p>
                {item.caption ? <p className={styles.mediaCaption}>{item.caption}</p> : null}
                {item.linkUrl ? (
                  <a className={styles.mediaLink} href={item.linkUrl} target="_blank" rel="noopener noreferrer">
                    Open media
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
