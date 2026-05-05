'use client';

import { InlineCmsImage, InlineCmsText } from '@/components/cms/InlineCmsBlocks';
import type { BreakingPayload } from '@/utils/breakingContentMerge';
import {
  BreakingHeroFrameClient,
  BreakingMediaWallClient,
  BreakingCtaImageClient,
  type MediaWall,
} from './BreakingMediaClient';
import BreakingDonateCta from './BreakingDonateCta';
import BreakingFloatingNav from './BreakingFloatingNav';
import styles from './page.module.css';

export default function BreakingMainContent({
  content,
  mediaWall,
}: {
  content: BreakingPayload;
  mediaWall: MediaWall;
}) {
  const c = content.pageCopy;

  return (
    <>
      <header className={styles.projectHeader}>
        <div className="container">
          <div className={styles.headerTop}>
            <div className={styles.projectTitle}>
              <InlineCmsText
                cmsType="breakingTheSilence"
                path={['pageCopy', 'headerProjectLabel']}
                initialValue={c.headerProjectLabel}
                as="span"
              />
            </div>
          </div>
        </div>
      </header>

      <BreakingFloatingNav
        labelSlots={c.floatingNavLabels.map((text, i) => (
          <InlineCmsText
            key={i}
            cmsType="breakingTheSilence"
            path={['pageCopy', 'floatingNavLabels', i]}
            initialValue={text}
            as="span"
          />
        ))}
      />

      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <p className={styles.kicker}>
                <InlineCmsText cmsType="breakingTheSilence" path={['pageCopy', 'heroKicker']} initialValue={c.heroKicker} as="span" />
              </p>
              <h1>
                <InlineCmsText cmsType="breakingTheSilence" path={['pageCopy', 'heroTitle']} initialValue={c.heroTitle} as="span" />
              </h1>
              <div className={styles.heroCopy}>
                {c.heroParagraphs.map((para, index) => (
                  <InlineCmsText
                    key={index}
                    cmsType="breakingTheSilence"
                    path={['pageCopy', 'heroParagraphs', index]}
                    initialValue={para}
                    as="p"
                    multiline
                  />
                ))}
                <InlineCmsImage
                  cmsType="breakingTheSilence"
                  path={['pageCopy', 'heroInlineImageUrl']}
                  initialSrc={c.heroInlineImageUrl}
                  alt={c.heroInlineImageAlt}
                  imgClassName={styles.heroInjectedImage}
                />
                <ul className={styles.heroList}>
                  {c.heroListItems.map((item, index) => (
                    <li key={index}>
                      <InlineCmsText
                        cmsType="breakingTheSilence"
                        path={['pageCopy', 'heroListItems', index]}
                        initialValue={item}
                        as="span"
                      />
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.heroActions}>
                <a className="btn btn-primary" href="#documentary">
                  <InlineCmsText
                    cmsType="breakingTheSilence"
                    path={['pageCopy', 'heroPrimaryCta']}
                    initialValue={c.heroPrimaryCta}
                    as="span"
                  />
                </a>
                <a className="btn btn-outline" href="#donate">
                  <InlineCmsText
                    cmsType="breakingTheSilence"
                    path={['pageCopy', 'heroSecondaryCta']}
                    initialValue={c.heroSecondaryCta}
                    as="span"
                  />
                </a>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <BreakingHeroFrameClient initialHeroFrame={content.heroFrame} initialContent={content} />
            </div>
          </div>
        </div>
      </section>

      <BreakingMediaWallClient initialMediaWall={mediaWall} initialContent={content} />

      <section id="documentary" className={`section ${styles.section}`}>
        <div className="container">
          <div className={styles.sectionIntro}>
            <p className={styles.sectionEyebrow}>
              <InlineCmsText
                cmsType="breakingTheSilence"
                path={['pageCopy', 'documentaryEyebrow']}
                initialValue={c.documentaryEyebrow}
                as="span"
              />
            </p>
            <h2 className="title">
              <InlineCmsText
                cmsType="breakingTheSilence"
                path={['pageCopy', 'documentaryTitle']}
                initialValue={c.documentaryTitle}
                as="span"
              />
            </h2>
            <InlineCmsText
              cmsType="breakingTheSilence"
              path={['pageCopy', 'documentaryLead']}
              initialValue={c.documentaryLead}
              as="p"
              multiline
            />
          </div>

          <div className={styles.callout}>
            <p className={styles.calloutLabel}>
              <InlineCmsText
                cmsType="breakingTheSilence"
                path={['pageCopy', 'calloutLabel']}
                initialValue={c.calloutLabel}
                as="span"
              />
            </p>
            <InlineCmsText
              cmsType="breakingTheSilence"
              path={['pageCopy', 'calloutBody']}
              initialValue={c.calloutBody}
              as="p"
              multiline
            />
          </div>
        </div>
      </section>

      <section id="why" className={`section ${styles.section}`}>
        <div className="container">
          <div className={styles.sectionIntro}>
            <p className={styles.sectionEyebrow}>
              <InlineCmsText cmsType="breakingTheSilence" path={['pageCopy', 'whyEyebrow']} initialValue={c.whyEyebrow} as="span" />
            </p>
            <h2 className="title">
              <InlineCmsText cmsType="breakingTheSilence" path={['pageCopy', 'whyTitle']} initialValue={c.whyTitle} as="span" />
            </h2>
            <InlineCmsText cmsType="breakingTheSilence" path={['pageCopy', 'whyLead']} initialValue={c.whyLead} as="p" multiline />
          </div>
          <div id="conversation" className={`${styles.conversationCta} ${styles.conversationAnchor}`}>
            <a className="btn btn-primary" href="/discussion?project=breaking-the-silence" style={{ marginBottom: '1.5rem' }}>
              <InlineCmsText
                cmsType="breakingTheSilence"
                path={['pageCopy', 'conversationJoinCta']}
                initialValue={c.conversationJoinCta}
                as="span"
              />
            </a>
            <BreakingCtaImageClient
              initialImageUrl={
                content.discussionCtaImage ?? '/uploads/1775379032931-Polish_20250504_183332768.jpg'
              }
              initialContent={content}
            />
          </div>
        </div>
      </section>

      <section id="conversation-starter" className={`section ${styles.section} ${styles.conversationSection}`}>
        <div className="container">
          <div className={styles.sectionIntro}>
            <p className={styles.sectionEyebrow}>
              <InlineCmsText
                cmsType="breakingTheSilence"
                path={['pageCopy', 'conversationStarterEyebrow']}
                initialValue={c.conversationStarterEyebrow}
                as="span"
              />
            </p>
            <h2 className="title">
              <InlineCmsText
                cmsType="breakingTheSilence"
                path={['pageCopy', 'conversationStarterTitle']}
                initialValue={c.conversationStarterTitle}
                as="span"
              />
            </h2>
            <InlineCmsText
              cmsType="breakingTheSilence"
              path={['pageCopy', 'conversationStarterLead']}
              initialValue={c.conversationStarterLead}
              as="p"
              multiline
            />
          </div>

          <div className={styles.partnerGrid}>
            {c.partnerGroups.map((group, gi) => (
              <a key={`partner-${gi}`} href="/contact" className={styles.partnerCard} style={{ textDecoration: 'none' }}>
                <h3>
                  <InlineCmsText
                    cmsType="breakingTheSilence"
                    path={['pageCopy', 'partnerGroups', gi, 'title']}
                    initialValue={group.title}
                    as="span"
                  />
                </h3>
                <ul>
                  {group.items.map((item, ii) => (
                    <li key={ii}>
                      <InlineCmsText
                        cmsType="breakingTheSilence"
                        path={['pageCopy', 'partnerGroups', gi, 'items', ii]}
                        initialValue={item}
                        as="span"
                      />
                    </li>
                  ))}
                </ul>
                <p className={styles.partnerNote}>
                  👉{' '}
                  <InlineCmsText
                    cmsType="breakingTheSilence"
                    path={['pageCopy', 'partnerGroups', gi, 'note']}
                    initialValue={group.note}
                    as="span"
                  />
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="connect" className={`section ${styles.section}`}>
        <div className="container">
          <div className={styles.contactBox}>
            <div>
              <p className={styles.sectionEyebrow}>
                <InlineCmsText
                  cmsType="breakingTheSilence"
                  path={['pageCopy', 'connectEyebrow']}
                  initialValue={c.connectEyebrow}
                  as="span"
                />
              </p>
              <h2 className="title">
                <InlineCmsText
                  cmsType="breakingTheSilence"
                  path={['pageCopy', 'connectTitle']}
                  initialValue={c.connectTitle}
                  as="span"
                />
              </h2>
              <InlineCmsText
                cmsType="breakingTheSilence"
                path={['pageCopy', 'connectLead']}
                initialValue={c.connectLead}
                as="p"
                multiline
              />
              <div className={styles.contactLines}>
                <p>
                  <InlineCmsText
                    cmsType="breakingTheSilence"
                    path={['pageCopy', 'contactEmailLine']}
                    initialValue={c.contactEmailLine}
                    as="span"
                  />
                </p>
                <p>
                  <InlineCmsText
                    cmsType="breakingTheSilence"
                    path={['pageCopy', 'contactWebsiteLine']}
                    initialValue={c.contactWebsiteLine}
                    as="span"
                  />
                </p>
              </div>
            </div>
            <div className={styles.finalLine}>
              <p>
                <InlineCmsText
                  cmsType="breakingTheSilence"
                  path={['pageCopy', 'finalLine1']}
                  initialValue={c.finalLine1}
                  as="span"
                />
              </p>
              <p>
                <InlineCmsText
                  cmsType="breakingTheSilence"
                  path={['pageCopy', 'finalLine2']}
                  initialValue={c.finalLine2}
                  as="span"
                />
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="donate" className={`section ${styles.section}`}>
        <div className="container">
          <div className={styles.donateCard}>
            <div>
              <p className={styles.sectionEyebrow}>
                <InlineCmsText cmsType="breakingTheSilence" path={['pageCopy', 'donateEyebrow']} initialValue={c.donateEyebrow} as="span" />
              </p>
              <h2 className="title">
                <InlineCmsText cmsType="breakingTheSilence" path={['pageCopy', 'donateTitle']} initialValue={c.donateTitle} as="span" />
              </h2>
              <InlineCmsText
                cmsType="breakingTheSilence"
                path={['pageCopy', 'donateBody']}
                initialValue={c.donateBody}
                as="p"
                multiline
              />
            </div>
            <BreakingDonateCta pageCopy={c} />
          </div>
        </div>
      </section>
    </>
  );
}
