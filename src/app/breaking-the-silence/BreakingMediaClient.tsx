
'use client';
import { useEffect, useState } from "react";
import { Trash2, Edit3, Plus, ExternalLink, X } from "lucide-react";
import { InlineCmsText } from "@/components/cms/InlineCmsBlocks";
import styles from "./page.module.css";
import fallbackContent from "@/data/breakingTheSilence.json";

type BreakingContent = typeof fallbackContent;
type HeroFrame = BreakingContent["heroFrame"];
type MediaWallImageItem = {
  id: string;
  type: "image";
  title: string;
  caption: string;
  imageUrl: string;
  imageAlt: string;
  linkUrl: string;
};
type MediaWallVideoItem = {
  id: string;
  type: "video";
  title: string;
  caption: string;
  embedUrl: string;
  linkUrl: string;
};
export type MediaWallItem = MediaWallImageItem | MediaWallVideoItem;
export type MediaWall = {
  eyebrow: string;
  title: string;
  items: MediaWallItem[];
};
type MediaWallItemType = MediaWallItem["type"];
type UploadTarget = "hero" | "media";

export function normalizeMediaWallItems(items: any[] | unknown): MediaWallItem[] {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.map((item) => {
    if (item.type === 'image') {
      // Only include image fields
      return {
        id: item.id,
        type: 'image',
        title: item.title,
        caption: item.caption,
        imageUrl: item.imageUrl,
        imageAlt: item.imageAlt ?? '',
        linkUrl: item.linkUrl ?? '',
      };
    } else if (item.type === 'video') {
      // Only include video fields
      return {
        id: item.id,
        type: 'video',
        title: item.title,
        caption: item.caption,
        embedUrl: item.embedUrl,
        linkUrl: item.linkUrl ?? '',
      };
    }
    return item;
  });
}

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
  const items = content.mediaWall.items.map((item) => {
    if (item.id === id) {
      if (item.type === "image") {
        // Only image fields, no embedUrl
        return {
          id: item.id,
          type: "image",
          title: item.title,
          caption: item.caption,
          imageUrl,
          imageAlt: item.imageAlt ?? "",
          linkUrl: item.linkUrl,
        };
      } else if (item.type === "video") {
        // Convert video to image, do NOT include embedUrl
        return {
          id: item.id,
          type: "image",
          title: item.title,
          caption: item.caption,
          imageUrl,
          imageAlt: "",
          linkUrl: item.linkUrl,
        };
      }
    }
    return item;
  });

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
        <p className={styles.heroFrameTitle}>
          <InlineCmsText
            cmsType="breakingTheSilence"
            path={["heroFrame", "cardTitle"]}
            initialValue={heroFrame.cardTitle ?? "Breaking the Silence"}
            as="span"
          />
        </p>
        {[0, 1].map((index) => (
          <InlineCmsText
            key={index}
            cmsType="breakingTheSilence"
            path={["heroFrame", "cardLines", index]}
            initialValue={heroFrame.cardLines?.[index] ?? ""}
            as="p"
            multiline
          />
        ))}
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
  const [mediaWall, setMediaWall] = useState({
    ...initialMediaWall,
    items: normalizeMediaWallItems(initialMediaWall.items),
  });
  const [isEditing, setIsEditing] = useState<MediaWallItem | null>(null);
  const isAdmin = useAdminStatus();
  const { uploadingTarget, beginUpload, endUpload } = useUploadStatus();

  const handleSaveContent = async (nextContent: BreakingContent) => {
    const saveResponse = await fetch("/api/cms?type=breakingTheSilence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextContent),
    });

    if (saveResponse.ok) {
      setMediaWall({
        ...nextContent.mediaWall,
        items: normalizeMediaWallItems(nextContent.mediaWall.items),
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const currentContent = (await fetchBreakingContent()) ?? initialContent;
    const nextContent = {
      ...currentContent,
      mediaWall: {
        ...currentContent.mediaWall,
        items: currentContent.mediaWall.items.filter((item) => item.id !== id),
      },
    };
    await handleSaveContent(nextContent);
  };

  const handleAdd = async (type: "image" | "video") => {
    const currentContent = (await fetchBreakingContent()) ?? initialContent;
    const newItem: MediaWallItem = {
      id: `media-${Date.now()}`,
      title: "New Item",
      caption: "",
      ...(type === "image"
        ? {
            type: "image" as const,
            imageUrl: "/placeholder.jpg",
            imageAlt: "",
            linkUrl: "",
          }
        : {
            type: "video" as const,
            embedUrl: "",
            linkUrl: "",
          }),
    };
    const nextContent = {
      ...currentContent,
      mediaWall: {
        ...currentContent.mediaWall,
        items: [...currentContent.mediaWall.items, newItem],
      },
    };
    await handleSaveContent(nextContent);
    setIsEditing(newItem);
  };

  const handleUpdateItem = async (updatedItem: MediaWallItem) => {
    const currentContent = (await fetchBreakingContent()) ?? initialContent;
    const nextContent = {
      ...currentContent,
      mediaWall: {
        ...currentContent.mediaWall,
        items: currentContent.mediaWall.items.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        ),
      },
    };
    await handleSaveContent(nextContent);
    setIsEditing(null);
  };

  const handleUpload = async (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    beginUpload("media");

    try {
      const imageUrl = await uploadFile(file);
      const currentContent = (await fetchBreakingContent()) ?? initialContent;
      const nextContent = mergeMediaImage(currentContent, id, imageUrl);
      await handleSaveContent(nextContent);
    } catch {
      // ignore
    } finally {
      endUpload();
      resetInput(input);
    }
  };

  const wallItems = Array.isArray(mediaWall.items) ? mediaWall.items : [];
  // Ensure wallItems are normalized for rendering
  const normalizedWallItems = normalizeMediaWallItems(wallItems);

  return (
    <section className={styles.mediaWallSection}>
      <div className="container">
        <div className={styles.mediaWallHeader}>
          <p className={styles.sectionEyebrow}>
            <InlineCmsText
              cmsType="breakingTheSilence"
              path={["mediaWall", "eyebrow"]}
              initialValue={mediaWall.eyebrow}
              as="span"
            />
          </p>
          <div className={styles.titleRow}>
            <h2 className="title">
              <InlineCmsText
                cmsType="breakingTheSilence"
                path={["mediaWall", "title"]}
                initialValue={mediaWall.title}
                as="span"
              />
            </h2>
            {isAdmin && (
              <div className={styles.adminHeaderActions}>
                <button className="btn btn-outline btn-sm" onClick={() => handleAdd("image")}> 
                  <Plus size={16} /> Add Image
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => handleAdd("video")}> 
                  <Plus size={16} /> Add Video
                </button>
              </div>
            )}
          </div>
        </div>
        <div className={styles.mediaWallGrid}>
          {normalizedWallItems.map((item) => (
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
                {isAdmin ? (
                  <div className={styles.adminTileControls}>
                    <button className={styles.adminControlButton} onClick={() => setIsEditing(item)}>
                      <Edit3 size={14} />
                    </button>
                    {item.type === "image" && (
                      <div className={styles.adminUploadControl}>
                        <input
                          id={`breaking-wall-upload-public-${item.id}`}
                          type="file"
                          accept="image/*"
                          onChange={(event) => handleUpload(item.id, event)}
                          className={styles.adminUploadInput}
                        />
                        <label
                          htmlFor={`breaking-wall-upload-public-${item.id}`}
                          className={styles.adminControlButton}
                          title="Upload new image"
                        >
                          {uploadingTarget === "media" ? "..." : <Plus size={14} />}
                        </label>
                      </div>
                    )}
                    <button className={`${styles.adminControlButton} ${styles.delete}`} onClick={() => handleDelete(item.id)}>
                      <Trash2 size={14} />
                    </button>
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
      {isEditing && (
        <MediaEditModal
          item={isEditing}
          onClose={() => setIsEditing(null)}
          onSave={handleUpdateItem}
        />
      )}
    </section>
  );
}

export function BreakingCtaImageClient({
  initialImageUrl,
  initialContent,
}: {
  initialImageUrl: string;
  initialContent: BreakingContent;
}) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const isAdmin = useAdminStatus();
  const { uploadingTarget, beginUpload, endUpload } = useUploadStatus();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    beginUpload("media");

    try {
      const uploadedUrl = await uploadFile(file);
      const currentContent = (await fetchBreakingContent()) ?? initialContent;
      const nextContent = {
        ...currentContent,
        discussionCtaImage: uploadedUrl,
      };

      const saveResponse = await fetch("/api/cms?type=breakingTheSilence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextContent),
      });

      if (saveResponse.ok) {
        setImageUrl(uploadedUrl);
      }
    } catch {
      // ignore
    } finally {
      endUpload();
      resetInput(input);
    }
  };

  return (
    <div className={styles.ctaImageWrapper} style={{ position: 'relative' }}>
      <img src={imageUrl} alt="Join the conversation" className={styles.ctaImage} />
      {isAdmin && (
        <div className={styles.adminCtaUploadOverlay}>
          <input
            id="breaking-cta-upload"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className={styles.adminUploadInput}
            style={{ display: 'none' }}
          />
          <label htmlFor="breaking-cta-upload" className={styles.adminUploadButton}>
            {uploadingTarget === "media" ? "..." : "Edit Image"}
          </label>
        </div>
      )}
    </div>
  );
}

function MediaEditModal({
  item,
  onClose,
  onSave,
}: {
  item: MediaWallItem;
  onClose: () => void;
  onSave: (item: MediaWallItem) => void;
}) {
  const [formData, setFormData] = useState({ ...item });

  return (
    <div className={styles.adminEditOverlay}>
      <div className={styles.adminEditModal}>
        <div className={styles.modalHeader}>
          <h3>Edit {item.type === "video" ? "Video" : "Image"}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.adminEditField}>
          <label>Title</label>
          <input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        <div className={styles.adminEditField}>
          <label>Caption</label>
          <textarea
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            rows={3}
            className={styles.adminTextarea}
          />
        </div>
        {item.type === "video" ? (
          <div className={styles.adminEditField}>
            {formData.type === 'video' && (
              <>
                <label>Embed URL (YouTube/Vimeo)</label>
                <input
                  value={formData.embedUrl}
                  onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
                  placeholder="https://www.youtube.com/embed/..."
                />
              </>
            )}
          </div>
        ) : (
          <div className={styles.adminEditField}>
            <label>Link URL (Optional)</label>
            <input
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
        )}
        <div className={styles.adminEditActions}>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => onSave(formData)}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
