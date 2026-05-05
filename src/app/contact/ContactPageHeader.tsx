'use client';

import styles from './page.module.css';
import { InlineCmsText } from '@/components/cms/InlineCmsBlocks';

type Copy = {
  headerTitle: string;
  headerSubtitle: string;
};

export default function ContactPageHeader({ copy }: { copy?: Copy | null }) {
  const c = copy ?? {
    headerTitle: 'Get in touch with us',
    headerSubtitle:
      'Get in touch with us for collaborations, consultations, screenings or documentary inquiries via the links on the right. Visit us in person using the map links on the left.',
  };
  return (
    <header className={styles.header}>
      <div className="container">
        <div className="badge">Contact</div>
        <InlineCmsText cmsType="config" path={['contactPageCopy', 'headerTitle']} initialValue={c.headerTitle} as="h1" />
        <InlineCmsText
          cmsType="config"
          path={['contactPageCopy', 'headerSubtitle']}
          initialValue={c.headerSubtitle}
          as="p"
          className={styles.subtitle}
          multiline
        />
      </div>
    </header>
  );
}
