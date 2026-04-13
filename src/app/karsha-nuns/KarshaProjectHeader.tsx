'use client';

import { useEffect, useState } from 'react';
import { Facebook, Globe, Instagram } from 'lucide-react';
import styles from './page.module.css';

type Props = {
  instagram: string;
  facebook: string;
  website: string;
};

export default function KarshaProjectHeader({ instagram, facebook, website }: Props) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const updateCompactState = () => {
      setIsCompact(window.scrollY > 40);
    };

    updateCompactState();
    window.addEventListener('scroll', updateCompactState, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateCompactState);
    };
  }, []);

  return (
    <header className={`${styles.projectHeader} ${isCompact ? styles.projectHeaderCompact : ''}`}>
      <div className="container">
        <div className={styles.headerTop}>
          <div className={styles.projectMeta}>
            <div className={styles.projectTitle}>The Karsha Nuns Project</div>
          </div>
        </div>
      </div>
    </header>
  );
}