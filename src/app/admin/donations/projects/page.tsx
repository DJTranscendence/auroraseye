'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, HandCoins, Save } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import fallbackProjects from '@/data/donationProjects.json';
import styles from './page.module.css';

type MediaVideo = { title: string; thumbnail: string; url: string };

type DonationProject = {
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
  media: { images: string[]; videos: MediaVideo[] };
  fundAreas: { title: string; detail: string }[];
  progress: { raised: number; goal: number; label: string };
  timeline: { title: string; date: string; description: string }[];
};

type DonationProjectsPayload = {
  heading: string;
  intro: string;
  projects: DonationProject[];
};

const emptyProject = (): DonationProject => ({
  id: `project-${Date.now()}`,
  tabLabel: 'New Project',
  title: 'New Project',
  description: '',
  nowFundingEpisode: '',
  shootingBeginsOn: '',
  previousEpisodes: [{ title: '', thumbnail: '', url: '' }],
  donationUrl: '',
  heroImage: '',
  heroVideoUrl: '',
  heroVideoThumbnail: '',
  media: { images: [''], videos: [{ title: '', thumbnail: '', url: '' }] },
  fundAreas: [{ title: '', detail: '' }],
  progress: { raised: 0, goal: 0, label: '' },
  timeline: [{ title: '', date: '', description: '' }],
});

export default function AdminDonationProjectsPage() {
  const [payload, setPayload] = useState<DonationProjectsPayload>(fallbackProjects as DonationProjectsPayload);
  const [activeId, setActiveId] = useState(payload.projects[0]?.id ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/cms?type=donationProjects')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.projects?.length) {
          return;
        }
        setPayload(data);
        setActiveId((current) => current || data.projects[0].id);
      })
      .catch(() => undefined);
  }, []);

  const activeProjectIndex = useMemo(
    () => payload.projects.findIndex((project) => project.id === activeId),
    [payload.projects, activeId]
  );

  const activeProject = payload.projects[activeProjectIndex];

  const updateProject = (updates: Partial<DonationProject>) => {
    const nextProjects = [...payload.projects];
    nextProjects[activeProjectIndex] = { ...nextProjects[activeProjectIndex], ...updates };
    setPayload({ ...payload, projects: nextProjects });
  };

  const updateProjectMedia = (updates: Partial<DonationProject['media']>) => {
    updateProject({ media: { ...activeProject.media, ...updates } });
  };

  const handleSave = async () => {
    await fetch('/api/cms?type=donationProjects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addProject = () => {
    const nextProject = emptyProject();
    setPayload({ ...payload, projects: [...payload.projects, nextProject] });
    setActiveId(nextProject.id);
  };

  const deleteProject = (projectId: string) => {
    if (payload.projects.length <= 1) {
      return;
    }
    const target = payload.projects.find((project) => project.id === projectId);
    const label = target?.tabLabel || target?.title || projectId;
    const confirmed = window.confirm(`Delete "${label}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }
    const nextProjects = payload.projects.filter((project) => project.id !== projectId);
    setPayload({ ...payload, projects: nextProjects });
    if (activeId === projectId) {
      setActiveId(nextProjects[0]?.id ?? '');
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <div className={styles.titleInfo}>
              <HandCoins size={32} className="text-primary" />
              <div>
                <h1>Donation Projects</h1>
                <p>Manage the tabs, media, funding details, and timelines for each project.</p>
              </div>
            </div>
            <Link href="/admin" className="btn btn-outline">
              <ArrowLeft size={18} /> Back to Dashboard
            </Link>
          </div>

          <section className={styles.settingsGrid}>
            <div className={styles.settingCard}>
              <div className={styles.cardHeader}>
                <h2>Page Copy</h2>
              </div>
              <div className={styles.formGroup}>
                <label>Heading</label>
                <input
                  value={payload.heading}
                  onChange={(e) => setPayload({ ...payload, heading: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Intro</label>
                <textarea
                  rows={4}
                  value={payload.intro}
                  onChange={(e) => setPayload({ ...payload, intro: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.settingCard}>
              <div className={styles.cardHeader}>
                <h2>Projects</h2>
              </div>
              <div className={styles.tabRow}>
                {payload.projects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    className={project.id === activeId ? styles.tabActive : styles.tab}
                    onClick={() => setActiveId(project.id)}
                  >
                    {project.tabLabel}
                  </button>
                ))}
              </div>
              <div className={styles.projectActions}>
                <button type="button" className={styles.addTab} onClick={addProject}>
                  + Add project
                </button>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => deleteProject(activeProject.id)}
                  disabled={payload.projects.length <= 1}
                >
                  Delete project
                </button>
              </div>
              {activeProject ? (
                <div className={styles.projectEditor}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Project ID (slug)</label>
                      <input
                        value={activeProject.id}
                        onChange={(e) => updateProject({ id: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Tab Label</label>
                      <input
                        value={activeProject.tabLabel}
                        onChange={(e) => updateProject({ tabLabel: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Title</label>
                    <input
                      value={activeProject.title}
                      onChange={(e) => updateProject({ title: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea
                      rows={4}
                      value={activeProject.description}
                      onChange={(e) => updateProject({ description: e.target.value })}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Now Funding Episode</label>
                      <input
                        placeholder="e.g. 12"
                        value={activeProject.nowFundingEpisode ?? ''}
                        onChange={(e) => updateProject({ nowFundingEpisode: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Shooting Begins On</label>
                      <input
                        placeholder="e.g. 18 May 2026"
                        value={activeProject.shootingBeginsOn ?? ''}
                        onChange={(e) => updateProject({ shootingBeginsOn: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Donation URL</label>
                    <input
                      value={activeProject.donationUrl}
                      onChange={(e) => updateProject({ donationUrl: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Hero Image URL</label>
                    <input
                      value={activeProject.heroImage}
                      onChange={(e) => updateProject({ heroImage: e.target.value })}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Hero Video URL</label>
                      <input
                        value={activeProject.heroVideoUrl ?? ''}
                        onChange={(e) => updateProject({ heroVideoUrl: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Hero Video Thumbnail URL</label>
                      <input
                        value={activeProject.heroVideoThumbnail ?? ''}
                        onChange={(e) => updateProject({ heroVideoThumbnail: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.sectionDivider} />

                  <h3>Funding Progress</h3>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Raised</label>
                      <input
                        type="number"
                        value={activeProject.progress.raised}
                        onChange={(e) =>
                          updateProject({
                            progress: {
                              ...activeProject.progress,
                              raised: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Goal</label>
                      <input
                        type="number"
                        value={activeProject.progress.goal}
                        onChange={(e) =>
                          updateProject({
                            progress: {
                              ...activeProject.progress,
                              goal: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Progress Label</label>
                    <input
                      value={activeProject.progress.label}
                      onChange={(e) =>
                        updateProject({
                          progress: {
                            ...activeProject.progress,
                            label: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className={styles.sectionDivider} />

                  <h3>Fund These Areas</h3>
                  {activeProject.fundAreas.map((area, index) => (
                    <div key={`${activeProject.id}-area-${index}`} className={styles.listRow}>
                      <input
                        placeholder="Title"
                        value={area.title}
                        onChange={(e) => {
                          const next = [...activeProject.fundAreas];
                          next[index] = { ...area, title: e.target.value };
                          updateProject({ fundAreas: next });
                        }}
                      />
                      <input
                        placeholder="Detail"
                        value={area.detail}
                        onChange={(e) => {
                          const next = [...activeProject.fundAreas];
                          next[index] = { ...area, detail: e.target.value };
                          updateProject({ fundAreas: next });
                        }}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addRow}
                    onClick={() => updateProject({ fundAreas: [...activeProject.fundAreas, { title: '', detail: '' }] })}
                  >
                    + Add area
                  </button>

                  <div className={styles.sectionDivider} />

                  <h3>Previous Episodes</h3>
                  {(activeProject.previousEpisodes ?? []).map((episode, index) => (
                    <div key={`${activeProject.id}-episode-${index}`} className={styles.videoRow}>
                      <input
                        placeholder="Title"
                        value={episode.title}
                        onChange={(e) => {
                          const next = [...(activeProject.previousEpisodes ?? [])];
                          next[index] = { ...episode, title: e.target.value };
                          updateProject({ previousEpisodes: next });
                        }}
                      />
                      <input
                        placeholder="Thumbnail URL"
                        value={episode.thumbnail}
                        onChange={(e) => {
                          const next = [...(activeProject.previousEpisodes ?? [])];
                          next[index] = { ...episode, thumbnail: e.target.value };
                          updateProject({ previousEpisodes: next });
                        }}
                      />
                      <input
                        placeholder="Episode URL"
                        value={episode.url}
                        onChange={(e) => {
                          const next = [...(activeProject.previousEpisodes ?? [])];
                          next[index] = { ...episode, url: e.target.value };
                          updateProject({ previousEpisodes: next });
                        }}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addRow}
                    onClick={() => updateProject({
                      previousEpisodes: [...(activeProject.previousEpisodes ?? []), { title: '', thumbnail: '', url: '' }],
                    })}
                  >
                    + Add episode
                  </button>

                  <div className={styles.sectionDivider} />

                  <h3>Photos</h3>
                  <p className={styles.helperText}>Select a hero image and manage the photo gallery.</p>
                  <div className={styles.previewGrid}>
                    {activeProject.media.images.map((image, index) => {
                      const isHero = image && image === activeProject.heroImage;
                      return (
                        <button
                          key={`${activeProject.id}-image-preview-${index}`}
                          type="button"
                          className={`${styles.previewCard} ${isHero ? styles.previewActive : ''}`}
                          onClick={() => updateProject({ heroImage: image })}
                          aria-label={`Set hero image ${index + 1}`}
                        >
                          {image ? (
                            <img src={image} alt={`Preview ${index + 1}`} />
                          ) : (
                            <div className={styles.previewEmpty}>No image</div>
                          )}
                          <span className={styles.previewBadge}>{isHero ? 'Hero' : 'Set as hero'}</span>
                        </button>
                      );
                    })}
                  </div>
                  {activeProject.media.images.map((image, index) => (
                    <input
                      key={`${activeProject.id}-image-${index}`}
                      className={styles.singleInput}
                      placeholder="Image URL"
                      value={image}
                      onChange={(e) => {
                        const next = [...activeProject.media.images];
                        next[index] = e.target.value;
                        updateProjectMedia({ images: next });
                      }}
                    />
                  ))}
                  <button
                    type="button"
                    className={styles.addRow}
                    onClick={() => updateProjectMedia({ images: [...activeProject.media.images, ''] })}
                  >
                    + Add image
                  </button>

                  <div className={styles.sectionDivider} />

                  <h3>Video Thumbnails</h3>
                  {activeProject.media.videos.map((video, index) => (
                    <div key={`${activeProject.id}-video-${index}`} className={styles.videoRow}>
                      <input
                        placeholder="Title"
                        value={video.title}
                        onChange={(e) => {
                          const next = [...activeProject.media.videos];
                          next[index] = { ...video, title: e.target.value };
                          updateProjectMedia({ videos: next });
                        }}
                      />
                      <input
                        placeholder="Thumbnail URL"
                        value={video.thumbnail}
                        onChange={(e) => {
                          const next = [...activeProject.media.videos];
                          next[index] = { ...video, thumbnail: e.target.value };
                          updateProjectMedia({ videos: next });
                        }}
                      />
                      <input
                        placeholder="Video URL"
                        value={video.url}
                        onChange={(e) => {
                          const next = [...activeProject.media.videos];
                          next[index] = { ...video, url: e.target.value };
                          updateProjectMedia({ videos: next });
                        }}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addRow}
                    onClick={() => updateProjectMedia({ videos: [...activeProject.media.videos, { title: '', thumbnail: '', url: '' }] })}
                  >
                    + Add video
                  </button>

                  <div className={styles.sectionDivider} />

                  <h3>Timeline</h3>
                  {activeProject.timeline.map((item, index) => (
                    <div key={`${activeProject.id}-timeline-${index}`} className={styles.videoRow}>
                      <input
                        placeholder="Title"
                        value={item.title}
                        onChange={(e) => {
                          const next = [...activeProject.timeline];
                          next[index] = { ...item, title: e.target.value };
                          updateProject({ timeline: next });
                        }}
                      />
                      <input
                        placeholder="Date"
                        value={item.date}
                        onChange={(e) => {
                          const next = [...activeProject.timeline];
                          next[index] = { ...item, date: e.target.value };
                          updateProject({ timeline: next });
                        }}
                      />
                      <input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const next = [...activeProject.timeline];
                          next[index] = { ...item, description: e.target.value };
                          updateProject({ timeline: next });
                        }}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addRow}
                    onClick={() => updateProject({ timeline: [...activeProject.timeline, { title: '', date: '', description: '' }] })}
                  >
                    + Add timeline entry
                  </button>
                </div>
              ) : null}
            </div>
          </section>

          <div className={styles.footerActions}>
            <button onClick={handleSave} className={`btn btn-lg ${saved ? styles.savedBtn : 'btn-primary'}`}>
              <Save size={20} /> {saved ? 'Saved!' : 'Save Donation Projects'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
