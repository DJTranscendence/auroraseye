'use client';

import styles from './page.module.css';
import { InlineCmsText } from '@/components/cms/InlineCmsBlocks';

export type TeamPageCopy = {
  badge: string;
  headerTitle: string;
  headerSubtitle: string;
  missionTitle: string;
  missionBody: string;
  impactIntegrityTitle: string;
  impactIntegrityBody: string;
  impactInnovationTitle: string;
  impactInnovationBody: string;
  impactCommunityTitle: string;
  impactCommunityBody: string;
};

const DEFAULT_TEAM_COPY: TeamPageCopy = {
  badge: 'Our People',
  headerTitle: 'The Visionaries Behind the Lens',
  headerSubtitle: "Meet the documentary filmmakers and storytellers of Aurora's Eye Films.",
  missionTitle: 'Our Mission',
  missionBody:
    'We aim to inspire and inform through the art of documentary filmmaking. Our focus is on projects that promote human unity, ecological sustainability, and the diverse cultural tapestry of our world.',
  impactIntegrityTitle: 'Integrity',
  impactIntegrityBody: 'Honest storytelling that respects the subject and the audience.',
  impactInnovationTitle: 'Innovation',
  impactInnovationBody: 'Pushing the boundaries of visual language and sound design.',
  impactCommunityTitle: 'Community',
  impactCommunityBody: 'Fostering a global network of conscious viewers and creators.',
};

export default function TeamPageCopy({ copy }: { copy?: TeamPageCopy | null }) {
  const c = { ...DEFAULT_TEAM_COPY, ...copy };
  return (
    <>
      <header className={styles.header}>
        <div className="container">
          <div className={`badge ${styles.heroBadge}`}>
            <InlineCmsText cmsType="config" path={['teamPageCopy', 'badge']} initialValue={c.badge} as="span" />
          </div>
          <InlineCmsText cmsType="config" path={['teamPageCopy', 'headerTitle']} initialValue={c.headerTitle} as="h1" />
          <InlineCmsText
            cmsType="config"
            path={['teamPageCopy', 'headerSubtitle']}
            initialValue={c.headerSubtitle}
            as="p"
            className={styles.subtitle}
            multiline
          />
        </div>
      </header>

      <section className={`section ${styles.missionSection}`}>
        <div className="container">
          <div className={styles.missionBox}>
            <div className={styles.missionContent}>
              <InlineCmsText cmsType="config" path={['teamPageCopy', 'missionTitle']} initialValue={c.missionTitle} as="h2" />
              <InlineCmsText
                cmsType="config"
                path={['teamPageCopy', 'missionBody']}
                initialValue={c.missionBody}
                as="p"
                multiline
              />
              <div className={styles.impact}>
                <div className={styles.impactItem}>
                  <InlineCmsText
                    cmsType="config"
                    path={['teamPageCopy', 'impactIntegrityTitle']}
                    initialValue={c.impactIntegrityTitle}
                    as="h3"
                  />
                  <InlineCmsText
                    cmsType="config"
                    path={['teamPageCopy', 'impactIntegrityBody']}
                    initialValue={c.impactIntegrityBody}
                    as="p"
                    multiline
                  />
                </div>
                <div className={styles.impactItem}>
                  <InlineCmsText
                    cmsType="config"
                    path={['teamPageCopy', 'impactInnovationTitle']}
                    initialValue={c.impactInnovationTitle}
                    as="h3"
                  />
                  <InlineCmsText
                    cmsType="config"
                    path={['teamPageCopy', 'impactInnovationBody']}
                    initialValue={c.impactInnovationBody}
                    as="p"
                    multiline
                  />
                </div>
                <div className={styles.impactItem}>
                  <InlineCmsText
                    cmsType="config"
                    path={['teamPageCopy', 'impactCommunityTitle']}
                    initialValue={c.impactCommunityTitle}
                    as="h3"
                  />
                  <InlineCmsText
                    cmsType="config"
                    path={['teamPageCopy', 'impactCommunityBody']}
                    initialValue={c.impactCommunityBody}
                    as="p"
                    multiline
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
