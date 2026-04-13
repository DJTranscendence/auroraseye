import { useEffect, useState } from 'react';
import styles from './DonationProjectDetails.module.css';

export type DonationProjectMediaVideo = {
  title: string;
  thumbnail: string;
  url: string;
};

export type DonationProject = {
  id: string;
  tabLabel: string;
  title: string;
  description: string;
  nowFundingEpisode?: string;
  shootingBeginsOn?: string;
  previousEpisodes?: { title: string; thumbnail: string; url: string }[];
  donationUrl: string;
  heroImage: string;
  heroVideoUrl?: string;
  heroVideoThumbnail?: string;
  media: {
    images: string[];
    videos: DonationProjectMediaVideo[];
  };
  fundAreas: { title: string; detail: string }[];
  progress: { raised: number; goal: number; label: string };
  timeline: { title: string; date: string; description: string }[];
};

type DonationProjectDetailsProps = {
  project: DonationProject;
  showFullPageLink?: boolean;
  fullPageHref?: string;
};

type HeroMediaItem = {
  type: 'image' | 'video';
  title: string;
  src: string;
  url?: string;
  origin: 'heroImage' | 'mediaImage' | 'mediaVideo' | 'heroVideo';
  index?: number;
};

const formatCurrency = (value: number) =>
  value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function DonationProjectDetails({
  project,
  showFullPageLink,
  fullPageHref,
}: DonationProjectDetailsProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!storedUser) {
      setIsAdmin(false);
      return;
    }
    try {
      const parsed = JSON.parse(storedUser) as { role?: string };
      setIsAdmin(parsed.role === 'admin');
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const persistDonationProjects = async (
    updateProject: (draft: DonationProject) => void
  ) => {
    const response = await fetch('/api/cms?type=donationProjects', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Failed to load donation projects');
    }
    const payload = await response.json();
    if (!payload?.projects?.length) {
      throw new Error('Donation projects payload missing');
    }
    const nextProjects = [...payload.projects];
    const projectIndex = nextProjects.findIndex((item) => item.id === project.id);
    if (projectIndex < 0) {
      throw new Error('Donation project not found');
    }
    const projectDraft = { ...nextProjects[projectIndex] } as DonationProject;
    updateProject(projectDraft);
    nextProjects[projectIndex] = projectDraft;
    await fetch('/api/cms?type=donationProjects', {
      method: 'POST',
      body: JSON.stringify({ ...payload, projects: nextProjects }),
    });
  };

  const handleImageUpload = async (
    file: File | null,
    overrideKey: string,
    origin: HeroMediaItem['origin'],
    index?: number
  ) => {
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const uploadData = await uploadResponse.json();
    if (!uploadResponse.ok || !uploadData?.url) {
      throw new Error(uploadData?.error || 'Upload failed');
    }
    const uploadedUrl = uploadData.url as string;
    setImageOverrides((current) => ({ ...current, [overrideKey]: uploadedUrl }));
    await persistDonationProjects((draft) => {
      if (origin === 'heroImage') {
        draft.heroImage = uploadedUrl;
        return;
      }
      if (origin === 'heroVideo') {
        draft.heroVideoThumbnail = uploadedUrl;
        return;
      }
      if (origin === 'mediaImage' && typeof index === 'number') {
        const images = [...draft.media.images];
        images[index] = uploadedUrl;
        draft.media = { ...draft.media, images };
        return;
      }
      if (origin === 'mediaVideo' && typeof index === 'number') {
        const videos = [...draft.media.videos];
        const target = videos[index];
        if (target) {
          videos[index] = { ...target, thumbnail: uploadedUrl };
          draft.media = { ...draft.media, videos };
        }
      }
    });
  };

  const addMediaImageSlot = async () => {
    await persistDonationProjects((draft) => {
      const images = [...draft.media.images, ''];
      draft.media = { ...draft.media, images };
    });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const extractYouTubeId = (value: string) => {
    try {
      const url = new URL(value);
      const hostname = url.hostname.replace('www.', '');
      if (hostname === 'youtu.be') {
        return url.pathname.slice(1);
      }
      if (hostname.includes('youtube.com')) {
        if (url.pathname.startsWith('/shorts/')) {
          return url.pathname.split('/shorts/')[1]?.split('/')[0] ?? '';
        }
        return url.searchParams.get('v') ?? '';
      }
    } catch {
      return '';
    }
    return '';
  };

  const addMediaVideoSlot = async () => {
    if (typeof window === 'undefined') {
      return;
    }
    const url = window.prompt('Paste the video URL');
    if (!url) {
      return;
    }
    const title = window.prompt('Video title', 'Behind the scenes') ?? 'Behind the scenes';
    const manualThumb = window.prompt('Thumbnail URL (optional)') ?? '';
    const youtubeId = extractYouTubeId(url);
    const thumbnail = manualThumb || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : '');

    await persistDonationProjects((draft) => {
      const videos = [
        ...draft.media.videos,
        {
          title,
          url,
          thumbnail,
        },
      ];
      draft.media = { ...draft.media, videos };
    });

    window.location.reload();
  };

  const progressPercent = project.progress.goal > 0
    ? Math.min(100, Math.round((project.progress.raised / project.progress.goal) * 100))
    : 0;

  const imageItems: HeroMediaItem[] = project.media.images.map((image, index) => ({
    type: 'image' as const,
    title: `${project.title} still ${index + 1}`,
    src: image,
    origin: 'mediaImage',
    index,
  }));
  const videoItems: HeroMediaItem[] = project.media.videos.map((video, index) => ({
    type: 'video' as const,
    title: video.title,
    src: video.thumbnail,
    url: video.url,
    origin: 'mediaVideo',
    index,
  }));
  const mediaItems = [...imageItems, ...videoItems];

  const heroItem: HeroMediaItem | null = project.heroImage
    ? { type: 'image' as const, title: project.title, src: project.heroImage, origin: 'heroImage' }
    : null;
  const heroVideoItem: HeroMediaItem | null = project.heroVideoUrl
    ? {
        type: 'video' as const,
        title: `${project.title} video`,
        src: project.heroVideoThumbnail || project.heroImage || '',
        url: project.heroVideoUrl,
        origin: 'heroVideo',
      }
    : null;

  const heroMediaItems: HeroMediaItem[] = [
    ...(heroItem ? [heroItem] : []),
    ...(heroVideoItem ? [heroVideoItem] : []),
  ];

  const mediaWallItems = mediaItems.filter((item) => item.src !== heroItem?.src);
  const btsItems = mediaItems.filter((item) => Boolean(item.src)).slice(0, 4);

  return (
    <section className={styles.section}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <div>
            <h2>{project.title}</h2>
            <p>{project.description}</p>
            {project.nowFundingEpisode || project.shootingBeginsOn ? (
              <div className={styles.heroHighlights}>
                {project.nowFundingEpisode ? (
                  <span>Now funding episode {project.nowFundingEpisode}</span>
                ) : null}
                {project.shootingBeginsOn ? (
                  <span>Shooting begins on {project.shootingBeginsOn}</span>
                ) : null}
              </div>
            ) : null}
            <div className={styles.mediaWall}>
              <div className={styles.mediaHeader}>
                <div aria-hidden="true" />
                {isAdmin ? (
                  <div className={styles.mediaHeaderActions}>
                    <button
                      type="button"
                      className={styles.mediaAddButton}
                      onClick={() => addMediaImageSlot().catch(() => undefined)}
                    >
                      Add image
                    </button>
                    <button
                      type="button"
                      className={styles.mediaAddButton}
                      onClick={() => addMediaVideoSlot().catch(() => undefined)}
                    >
                      Add video link
                    </button>
                  </div>
                ) : null}
              </div>
              <div className={styles.mediaWallGrid}>
                {mediaWallItems.map((item, index) => {
                  const overrideKey = `${project.id}-wall-${index}`;
                  const mediaSrc = imageOverrides[overrideKey] ?? item.src;
                  const hasMedia = Boolean(mediaSrc);

                  if (!hasMedia && !isAdmin) {
                    return null;
                  }

                  return item.type === 'video' ? (
                    <a
                      key={`${project.id}-media-video-${index}`}
                      className={`${styles.mediaTile} ${styles.mediaTileVideo}`}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {mediaSrc ? (
                        <img src={mediaSrc} alt={item.title} />
                      ) : (
                        <div className={styles.imagePlaceholder}>
                          <span>Video thumb</span>
                          <span>Upload to fill</span>
                        </div>
                      )}
                      {isAdmin ? <span className={styles.mediaBadge}>Video</span> : null}
                      <span className={styles.mediaTitle}>{item.title}</span>
                      {isAdmin ? (
                        <div className={styles.mediaUpload}>
                          <label
                            className={styles.mediaUploadLabel}
                            onClick={(event) => event.stopPropagation()}
                          >
                            Upload image
                            <input
                              className={styles.mediaUploadInput}
                              type="file"
                              accept="image/*"
                              onChange={(event) => {
                                handleImageUpload(
                                  event.target.files?.[0] ?? null,
                                  overrideKey,
                                  item.origin,
                                  item.index
                                ).catch(() => undefined);
                              }}
                            />
                          </label>
                        </div>
                      ) : null}
                    </a>
                  ) : (
                    <div key={`${project.id}-media-image-${index}`} className={styles.mediaTile}>
                      {mediaSrc ? (
                        <img src={mediaSrc} alt={item.title} />
                      ) : (
                        <div className={styles.imagePlaceholder}>
                          <span>Image slot</span>
                          <span>Upload to fill</span>
                        </div>
                      )}
                      {isAdmin ? <span className={styles.mediaBadge}>Photo</span> : null}
                      <span className={styles.mediaTitle}>{item.title}</span>
                      {isAdmin ? (
                        <div className={styles.mediaUpload}>
                          <label className={styles.mediaUploadLabel}>
                            Upload image
                            <input
                              className={styles.mediaUploadInput}
                              type="file"
                              accept="image/*"
                              onChange={(event) => {
                                handleImageUpload(
                                  event.target.files?.[0] ?? null,
                                  overrideKey,
                                  item.origin,
                                  item.index
                                ).catch(() => undefined);
                              }}
                            />
                          </label>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.heroMetrics}>
              <div>
                <span>Raised</span>
                <strong>{formatCurrency(project.progress.raised)}</strong>
              </div>
              <div>
                <span>Goal</span>
                <strong>{formatCurrency(project.progress.goal)}</strong>
              </div>
              <div>
                <span>Funded</span>
                <strong>{progressPercent}%</strong>
              </div>
            </div>
          </div>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="https://pay.auroville.org/aef" target="_blank" rel="noopener noreferrer">
              Fund this project
            </a>
            {showFullPageLink && fullPageHref ? (
              <a className={styles.ghostButton} href={fullPageHref}>
                View full page
              </a>
            ) : null}
          </div>
        </div>
        <div className={styles.heroImageWrap}>
          <div className={styles.heroMediaGrid}>
            {heroMediaItems.map((item, index) => {
              const overrideKey = `${project.id}-hero-${index}`;
              const mediaSrc = imageOverrides[overrideKey] ?? item.src;
              const hasMedia = Boolean(mediaSrc);

              if (item.type === 'video' && item.url && !mediaSrc && !isAdmin) {
                return null;
              }

              if (!hasMedia && !isAdmin) {
                return null;
              }

              return item.type === 'video' && item.url ? (
                <a
                  key={`${project.id}-hero-media-video-${index}`}
                  className={`${styles.heroMediaTile} ${styles.heroMediaVideo}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {mediaSrc ? (
                    <img src={mediaSrc} alt={item.title} />
                  ) : (
                    <div className={styles.videoPlaceholder}>
                      <span>Video frame</span>
                      <span>Add a thumbnail URL</span>
                    </div>
                  )}
                  {isAdmin ? <span className={styles.heroMediaBadge}>Video</span> : null}
                  {isAdmin ? (
                    <div className={styles.mediaUpload}>
                      <label
                        className={styles.mediaUploadLabel}
                        onClick={(event) => event.stopPropagation()}
                      >
                        Upload image
                        <input
                          className={styles.mediaUploadInput}
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            handleImageUpload(
                              event.target.files?.[0] ?? null,
                              overrideKey,
                              item.origin,
                              item.index
                            ).catch(() => undefined);
                          }}
                        />
                      </label>
                    </div>
                  ) : null}
                </a>
              ) : (
                <div key={`${project.id}-hero-media-image-${index}`} className={styles.heroMediaTile}>
                  {mediaSrc ? (
                    <img src={mediaSrc} alt={item.title} />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span>Image slot</span>
                      <span>Upload to fill</span>
                    </div>
                  )}
                  {isAdmin ? <span className={styles.heroMediaBadge}>Photo</span> : null}
                  {isAdmin ? (
                    <div className={styles.mediaUpload}>
                      <label className={styles.mediaUploadLabel}>
                        Upload image
                        <input
                          className={styles.mediaUploadInput}
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            handleImageUpload(
                              event.target.files?.[0] ?? null,
                              overrideKey,
                              item.origin,
                              item.index
                            ).catch(() => undefined);
                          }}
                        />
                      </label>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.fundGrid}>
        <div className={styles.fundAreas}>
          <h3>Fund these areas</h3>
          <div className={styles.areaList}>
            {project.fundAreas.map((area) => (
              <div key={`${project.id}-${area.title}`} className={styles.areaCard}>
                <h4>{area.title}</h4>
                <p>{area.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.btsPanel}>
          <h3>Behind the Scenes Gallery</h3>
          <div className={styles.btsGrid}>
            {btsItems.map((item, index) => {
              const overrideKey = `${project.id}-bts-${index}`;
              const mediaSrc = imageOverrides[overrideKey] ?? item.src;
              const isVideo = item.type === 'video' && Boolean(item.url);

              const content = (
                <>
                  <img
                    className={styles.btsThumb}
                    src={mediaSrc}
                    alt={`${project.title} behind the scenes ${index + 1}`}
                  />
                  {isAdmin ? (
                    <span className={styles.btsBadge}>{isVideo ? 'Video' : 'Photo'}</span>
                  ) : null}
                  {isAdmin ? (
                    <div className={styles.btsUpload}>
                      <label className={styles.mediaUploadLabel}>
                        Upload image
                        <input
                          className={styles.mediaUploadInput}
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            handleImageUpload(
                              event.target.files?.[0] ?? null,
                              overrideKey,
                              item.origin,
                              item.index
                            ).catch(() => undefined);
                          }}
                        />
                      </label>
                    </div>
                  ) : null}
                </>
              );

              return isVideo ? (
                <a
                  key={`${project.id}-bts-${index}`}
                  className={styles.btsItem}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {content}
                </a>
              ) : (
                <div key={`${project.id}-bts-${index}`} className={styles.btsItem}>
                  {content}
                </div>
              );
            })}
          </div>
          <a className={styles.btsLink} href={`/donations/${project.id}/gallery`}>
            See the full Gallery
          </a>
        </div>
      </div>

      <div className={styles.timeline}>
        <h3>Timeline</h3>
        <div className={styles.timelineGrid}>
          {project.timeline.map((item, index) => (
            <div key={`${project.id}-timeline-${index}`} className={styles.timelineCard}>
              <div className={styles.timelineDate}>{item.date}</div>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
