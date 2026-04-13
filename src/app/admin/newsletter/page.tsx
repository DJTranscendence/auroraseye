'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { ArrowLeft, Download, Mail, WandSparkles, Save, Globe, Phone, Youtube, Instagram, Linkedin } from 'lucide-react';

type NewsStory = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  image: string;
};

type NewsletterTemplate = {
  subject: string;
  preheader: string;
  heading: string;
  intro: string;
  bannerUrl: string;
  ctaText: string;
  ctaUrl: string;
  footerNote: string;
  logoUrl: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  selectedStoryIds: string[];
  updatedAt: string;
};

type ContactInfo = {
  email: string;
  phone: string;
  youtube: string;
  instagram: string;
  linkedin: string;
};

const EMPTY_TEMPLATE: NewsletterTemplate = {
  subject: "The Lens - News & Events from Aurora's Eye",
  preheader: 'Latest stories from Aurora\'s Eye Films.',
  heading: "The Lens - News & Events from Aurora's Eye",
  intro: 'Thank you for staying connected with our storytelling journey.',
  bannerUrl: '',
  ctaText: 'Watch now',
  ctaUrl: 'https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw',
  footerNote: 'You are receiving this because you subscribed on auroraseyefilms.com.',
  logoUrl: 'https://auroraseyefilms.com/wp-content/uploads/2022/03/cropped-aurora-logo.png',
  backgroundColor: '#0f172a',
  textColor: '#e2e8f0',
  accentColor: '#3b82f6',
  selectedStoryIds: [],
  updatedAt: '',
};

export default function AdminNewsletterPage() {
  const [template, setTemplate] = useState<NewsletterTemplate>(EMPTY_TEMPLATE);
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'Serena_aurora@auroville.org.in',
    phone: '+91 00000 00000',
    youtube: 'https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw',
    instagram: 'https://www.instagram.com/auroras_eye_films/',
    linkedin: 'https://linkedin.com/company/auroras-eye-films',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const previewRef = useRef<HTMLDivElement | null>(null);

  const loadAll = async () => {
    const [templateResponse, newsResponse, subsResponse, configResponse] = await Promise.all([
      fetch('/api/admin/newsletter/template'),
      fetch('/api/cms?type=news'),
      fetch('/api/admin/newsletter'),
      fetch('/api/cms?type=config'),
    ]);

    const templateData = await templateResponse.json();
    const newsData = await newsResponse.json();
    const subsData = await subsResponse.json();
    const configData = await configResponse.json();

    setTemplate({ ...EMPTY_TEMPLATE, ...templateData });
    setStories(Array.isArray(newsData) ? newsData : []);
    setSubscriberCount(Array.isArray(subsData) ? subsData.length : 0);
    setContactInfo({
      email: configData?.contact?.email || 'Serena_aurora@auroville.org.in',
      phone: configData?.contact?.phone || '+91 00000 00000',
      youtube: configData?.contact?.youtube || 'https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw',
      instagram: configData?.contact?.instagram || 'https://www.instagram.com/auroras_eye_films/',
      linkedin: configData?.contact?.linkedin || 'https://linkedin.com/company/auroras-eye-films',
    });
  };

  useEffect(() => {
    loadAll().catch(() => setMessage('Failed to load newsletter data.'));
  }, []);

  const selectedStories = useMemo(
    () => stories.filter((story) => template.selectedStoryIds.includes(story.id)),
    [stories, template.selectedStoryIds],
  );

  const spellcheckText = (value: string) =>
    value
      .replace(/\bstorys\b/gi, 'stories')
      .replace(/\bAuroras\b/g, "Aurora's")
      .replace(/\s{2,}/g, ' ')
      .trim();

  const formatHeadline = (value: string) => {
    const cleaned = spellcheckText(value);
    const lettersOnly = cleaned.replace(/[^A-Za-z]/g, '');

    if (!lettersOnly) {
      return cleaned;
    }

    const upperRatio = cleaned.replace(/[^A-Z]/g, '').length / lettersOnly.length;
    if (upperRatio > 0.75) {
      const lowered = cleaned.toLowerCase();
      return lowered.charAt(0).toUpperCase() + lowered.slice(1);
    }

    return cleaned;
  };

  const getTitleParts = (value: string) => {
    const cleaned = spellcheckText(value);
    const separator = ' - ';
    const separatorIndex = cleaned.indexOf(separator);

    if (separatorIndex === -1) {
      return { main: cleaned, sub: '' };
    }

    return {
      main: cleaned.slice(0, separatorIndex),
      sub: cleaned.slice(separatorIndex + separator.length),
    };
  };

  const titleParts = getTitleParts(template.heading);

  const toggleStorySelection = (storyId: string) => {
    const isSelected = template.selectedStoryIds.includes(storyId);
    const selectedStoryIds = isSelected
      ? template.selectedStoryIds.filter((id) => id !== storyId)
      : [...template.selectedStoryIds, storyId];

    setTemplate({ ...template, selectedStoryIds });
  };

  const saveTemplate = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/newsletter/template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });

      const payload = await response.json();
      if (payload?.success) {
        setTemplate(payload.template);
        setMessage('Layout saved.');
      } else {
        setMessage('Save failed.');
      }
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const generateFromStories = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/newsletter/generate', { method: 'POST' });
      const payload = await response.json();

      if (payload?.success) {
        await loadAll();
        setMessage(`Template generated with ${payload.storyCount} highlighted stories.`);
      } else {
        setMessage('Generator failed.');
      }
    } catch {
      setMessage('Generator failed.');
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = async () => {
    if (!previewRef.current) {
      return;
    }

    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const renderWidth = pageWidth - margin * 2;
    const renderHeight = (canvas.height * renderWidth) / canvas.width;

    let heightLeft = renderHeight;
    let position = margin;

    pdf.addImage(imgData, 'PNG', margin, position, renderWidth, renderHeight);
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      pdf.addPage();
      position = margin - (renderHeight - heightLeft);
      pdf.addImage(imgData, 'PNG', margin, position, renderWidth, renderHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    pdf.save(`auroras-eye-newsletter-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <header className={styles.header}>
            <div className={styles.titleInfo}>
              <Mail size={30} className="text-primary" />
              <div>
                <h1>Newsletter Generator</h1>
                <p>Generate, edit layout, and export newsletter PDFs before delivery integration.</p>
              </div>
            </div>
            <div className={styles.actions}>
              <Link href="/admin" className="btn btn-outline">
                <ArrowLeft size={16} /> Back to Dashboard
              </Link>
              <Link href="/admin/mailing-list" className="btn btn-outline">
                View Mailing List ({subscriberCount})
              </Link>
              <button type="button" className="btn btn-primary" onClick={generateFromStories} disabled={saving}>
                <WandSparkles size={16} /> Generate
              </button>
              <button type="button" className="btn btn-outline" onClick={saveTemplate} disabled={saving}>
                <Save size={16} /> Save
              </button>
              <button type="button" className="btn btn-outline" onClick={downloadPdf}>
                <Download size={16} /> Download PDF
              </button>
            </div>
          </header>

          {message ? <p className={styles.notice}>{message}</p> : null}

          <div className={styles.layout}>
            <section className={styles.card}>
              <h2>Content & Layout Editor</h2>
              <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label>Subject</label>
                  <input
                    value={template.subject}
                    onChange={(event) => setTemplate({ ...template, subject: event.target.value })}
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label>Preheader</label>
                  <input
                    value={template.preheader}
                    onChange={(event) => setTemplate({ ...template, preheader: event.target.value })}
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label>Heading</label>
                  <input
                    value={template.heading}
                    onChange={(event) => setTemplate({ ...template, heading: event.target.value })}
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label>Intro</label>
                  <textarea
                    rows={3}
                    value={template.intro}
                    onChange={(event) => setTemplate({ ...template, intro: event.target.value })}
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label>Top Banner Image URL</label>
                  <input
                    value={template.bannerUrl}
                    onChange={(event) => setTemplate({ ...template, bannerUrl: event.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className={styles.field}>
                  <label>CTA Text</label>
                  <input
                    value={template.ctaText}
                    onChange={(event) => setTemplate({ ...template, ctaText: event.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label>CTA URL</label>
                  <input
                    value={template.ctaUrl}
                    onChange={(event) => setTemplate({ ...template, ctaUrl: event.target.value })}
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label>Footer Note</label>
                  <textarea
                    rows={2}
                    value={template.footerNote}
                    onChange={(event) => setTemplate({ ...template, footerNote: event.target.value })}
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label>Background Color</label>
                  <input
                    type="color"
                    value={template.backgroundColor}
                    onChange={(event) => setTemplate({ ...template, backgroundColor: event.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label>Text Color</label>
                  <input
                    type="color"
                    value={template.textColor}
                    onChange={(event) => setTemplate({ ...template, textColor: event.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label>Accent Color</label>
                  <input
                    type="color"
                    value={template.accentColor}
                    onChange={(event) => setTemplate({ ...template, accentColor: event.target.value })}
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label>Stories to Include</label>
                  <div className={styles.storyList}>
                    {stories.map((story) => (
                      <label key={story.id} className={styles.storyItem}>
                        <input
                          type="checkbox"
                          checked={template.selectedStoryIds.includes(story.id)}
                          onChange={() => toggleStorySelection(story.id)}
                        />
                        <span>
                          <strong>{story.title}</strong>
                          <p>{story.source}</p>
                        </span>
                      </label>
                    ))}
                    {stories.length === 0 ? <p>No stories available.</p> : null}
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <h2>Preview</h2>
              <div className={styles.previewWrap}>
                <div
                  id="newsletter-preview"
                  ref={previewRef}
                  className={styles.preview}
                  style={{ backgroundColor: template.backgroundColor, color: template.textColor }}
                >
                  {template.bannerUrl ? (
                    <div className={styles.previewBannerWrap}>
                      <img src={template.bannerUrl} alt="Newsletter banner" className={styles.previewBanner} />
                    </div>
                  ) : null}

                  <div className={styles.previewHeader}>
                    <div className={styles.previewContactRow}>
                      <a
                        href="https://auroraseyefilms.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.previewContactLink}
                        aria-label="Website"
                      >
                        <Globe size={14} />
                      </a>
                      <a href={`mailto:${contactInfo.email}`} className={styles.previewContactLink} aria-label="Email">
                        <Mail size={14} />
                      </a>
                      <a
                        href={contactInfo.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.previewContactLink}
                        aria-label="YouTube"
                      >
                        <Youtube size={14} />
                      </a>
                      <a
                        href={contactInfo.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.previewContactLink}
                        aria-label="Instagram"
                      >
                        <Instagram size={14} />
                      </a>
                      <a
                        href={contactInfo.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.previewContactLink}
                        aria-label="LinkedIn"
                      >
                        <Linkedin size={14} />
                      </a>
                    </div>
                    <div className={styles.previewPhoneRow}>
                      <a href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`} className={styles.previewPhoneLink}>
                        <Phone size={13} />
                        <span>{contactInfo.phone}</span>
                      </a>
                    </div>
                    <h2 className={styles.previewTitle}>
                      <span className={styles.previewTitleMain}>{titleParts.main}</span>
                      {titleParts.sub ? <span className={styles.previewTitleSub}>{titleParts.sub}</span> : null}
                    </h2>
                    <p className={styles.previewIntro}>{spellcheckText(template.intro)}</p>
                  </div>

                  <a
                    href={template.ctaUrl || '#'}
                    style={{
                      display: 'block',
                      width: 'fit-content',
                      margin: '8px auto 6px',
                      textDecoration: 'none',
                      background: template.accentColor,
                      color: '#ffffff',
                      padding: '10px 14px',
                      borderRadius: 8,
                      fontWeight: 700,
                    }}
                  >
                    {template.ctaText}
                  </a>

                  <div className={styles.previewStories}>
                    {selectedStories.map((story) => (
                      <article key={story.id} className={styles.previewStory}>
                        <h3>{formatHeadline(story.title)}</h3>
                        {story.image ? (
                          <img src={story.image} alt={story.title} className={styles.previewStoryImage} />
                        ) : null}
                        <p>{spellcheckText(story.summary)}</p>
                        <p style={{ marginTop: 8 }}>
                          <a href={story.url} style={{ color: template.accentColor, fontWeight: 700 }}>
                            Read more
                          </a>
                        </p>
                      </article>
                    ))}
                    {selectedStories.length === 0 ? (
                      <article className={styles.previewStory}>
                        <h3>No stories selected</h3>
                        <p>Select stories from the editor to include them in this newsletter.</p>
                      </article>
                    ) : null}
                  </div>

                  <p className={styles.previewFooter}>{template.footerNote}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
