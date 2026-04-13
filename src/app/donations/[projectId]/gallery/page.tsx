'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import type { DonationProject } from '@/components/DonationProjectDetails';

export default function DonationProjectGalleryPage() {
  const params = useParams();
  const projectId = typeof params?.projectId === 'string' ? params.projectId : '';
  const [project, setProject] = useState<DonationProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    fetch('/api/cms?type=donationProjects', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const found = data?.projects?.find((item: DonationProject) => item.id === projectId) ?? null;
        setProject(found);
      })
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [projectId]);

  const btsImages = project?.media?.images?.filter((image) => Boolean(image)) ?? [];

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <header className={styles.header}>
            <div className={styles.badge}>Behind the Scenes</div>
            <h1>{project ? `${project.title} Gallery` : 'Gallery'}</h1>
            <p>Browse the behind the scenes stills from this project.</p>
          </header>

          {loading ? (
            <div className={styles.placeholder}>Loading gallery...</div>
          ) : btsImages.length === 0 ? (
            <div className={styles.placeholder}>No images yet.</div>
          ) : (
            <div className={styles.grid}>
              {btsImages.map((src, index) => (
                <img
                  key={`${projectId}-gallery-${index}`}
                  className={styles.image}
                  src={src}
                  alt={`${project?.title ?? 'Project'} gallery ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
