'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DonationProjectDetails, { DonationProject } from '@/components/DonationProjectDetails';
import fallbackProjects from '@/data/donationProjects.json';
import styles from './page.module.css';
import PageThemeDock from '@/components/PageThemeDock';
import { InlineCmsText } from '@/components/cms/InlineCmsBlocks';
import {
  donationSectionColorForInput,
  donationSectionStyleVars,
  normalizeDonationSectionHex,
} from '@/utils/donationSectionTheme';

type DonationProjectsPayload = {
  heading: string;
  intro: string;
  projects: DonationProject[];
};

const initialPayload: DonationProjectsPayload = {
  heading: '',
  intro: '',
  projects: Array.isArray((fallbackProjects as { projects?: DonationProject[] }).projects)
    ? (fallbackProjects as { projects: DonationProject[] }).projects
    : [],
};

export default function DonationsPage() {
  const [payload, setPayload] = useState<DonationProjectsPayload>(initialPayload);
  const [activeId, setActiveId] = useState(payload.projects[0]?.id ?? '');
  const [config, setConfig] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sectionColorDraft, setSectionColorDraft] = useState('');
  const [sectionColorSaving, setSectionColorSaving] = useState(false);
  const [sectionColorMsg, setSectionColorMsg] = useState('');

  useEffect(() => {
    fetch('/api/cms?type=donationProjects', { cache: 'no-store' })
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

  useEffect(() => {
    fetch('/api/cms?type=config', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setConfig(data);
        }
      })
      .catch(() => undefined);
  }, []);

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

  const activeProject = useMemo(
    () => payload.projects.find((project) => project.id === activeId) ?? payload.projects[0],
    [payload.projects, activeId]
  );

  useEffect(() => {
    setSectionColorDraft(activeProject?.sectionColor ?? '');
    setSectionColorMsg('');
  }, [activeProject?.id, activeProject?.sectionColor]);

  const saveSectionColor = async () => {
    if (!activeProject) return;
    const nextHex = normalizeDonationSectionHex(sectionColorDraft);
    setSectionColorSaving(true);
    setSectionColorMsg('');
    try {
      const nextProjects = payload.projects.map((p) =>
        p.id === activeProject.id ? { ...p, sectionColor: nextHex ?? null } : p
      );
      const body = { ...payload, projects: nextProjects };
      const res = await fetch('/api/cms?type=donationProjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error('Save failed');
      }
      setPayload(body);
      setSectionColorDraft(nextHex ?? '');
      setSectionColorMsg('Saved');
    } catch {
      setSectionColorMsg('Could not save');
    } finally {
      setSectionColorSaving(false);
    }
  };

  return (
    <PageThemeDock pageType="donations" initialColors={config?.donationsPageTheme} initialPayload={config}>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <header className={styles.header}>
            <div className={styles.badge}>Donations</div>
            <h1>
              <InlineCmsText
                cmsType="donationProjects"
                path={['heading']}
                initialValue={payload.heading || ''}
                as="span"
                onSaved={(v) => setPayload((p) => ({ ...p, heading: v }))}
              />
            </h1>
            <p>
              <InlineCmsText
                cmsType="donationProjects"
                path={['intro']}
                initialValue={payload.intro || ''}
                as="span"
                multiline
                onSaved={(v) => setPayload((p) => ({ ...p, intro: v }))}
              />
            </p>
          </header>

          <nav className={styles.tabs}>
            {payload.projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setActiveId(project.id)}
                data-project={project.id}
                className={`${styles.tab} ${project.id === activeId ? styles.tabActive : ''}`}
                style={donationSectionStyleVars(project.sectionColor) as CSSProperties}
              >
                {project.tabLabel}
              </button>
            ))}
          </nav>

          {isAdmin && activeProject ? (
            <div className={styles.sectionThemeBar}>
              <span className={styles.sectionThemeLabel}>
                Section colour (tab + panel): <strong>{activeProject.tabLabel}</strong>
              </span>
              <input
                type="color"
                className={styles.sectionThemeSwatch}
                value={donationSectionColorForInput(sectionColorDraft)}
                onChange={(e) => setSectionColorDraft(e.target.value)}
                aria-label="Section background colour"
              />
              <button
                type="button"
                className={styles.sectionThemeReset}
                onClick={() => setSectionColorDraft('')}
              >
                Use page theme
              </button>
              <button
                type="button"
                className={styles.sectionThemeSave}
                disabled={sectionColorSaving}
                onClick={() => void saveSectionColor()}
              >
                {sectionColorSaving ? 'Saving…' : 'Save'}
              </button>
              {sectionColorMsg ? <span className={styles.sectionThemeMsg}>{sectionColorMsg}</span> : null}
            </div>
          ) : null}

          {activeProject ? (
            <div
              className={styles.tabPanel}
              style={donationSectionStyleVars(activeProject.sectionColor) as CSSProperties}
            >
              <DonationProjectDetails
                project={activeProject}
                showFullPageLink={activeProject.id === 'matrimandir-and-i'}
                fullPageHref="https://matrimandirandi.com/"
              />
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </PageThemeDock>
  );
}
