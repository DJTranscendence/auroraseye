'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DonationProjectDetails, { DonationProject } from '@/components/DonationProjectDetails';
import fallbackProjects from '@/data/donationProjects.json';
import styles from './page.module.css';

type DonationProjectsPayload = {
  heading: string;
  intro: string;
  projects: DonationProject[];
};

export default function DonationsPage() {
  const [payload, setPayload] = useState<DonationProjectsPayload>(fallbackProjects as DonationProjectsPayload);
  const [activeId, setActiveId] = useState(payload.projects[0]?.id ?? '');

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

  const activeProject = useMemo(
    () => payload.projects.find((project) => project.id === activeId) ?? payload.projects[0],
    [payload.projects, activeId]
  );

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <header className={styles.header}>
            <div className={styles.badge}>Donations</div>
            <h1>{payload.heading}</h1>
            <p>{payload.intro}</p>
          </header>

          <nav className={styles.tabs}>
            {payload.projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setActiveId(project.id)}
                data-project={project.id}
                className={`${styles.tab} ${project.id === activeId ? styles.tabActive : ''}`}
              >
                {project.tabLabel}
              </button>
            ))}
          </nav>

          {activeProject ? (
            <div className={styles.tabPanel}>
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
    </>
  );
}
