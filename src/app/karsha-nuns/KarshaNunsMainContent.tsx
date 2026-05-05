'use client';

import { Play, ExternalLink } from 'lucide-react';
import styles from './page.module.css';
import { InlineCmsImage, InlineCmsText } from '@/components/cms/InlineCmsBlocks';

type FollowUp = {
  title: string;
  embedUrl: string;
  watchUrl: string;
  summary: string;
};

type KarshaPayload = {
  hero?: {
    title?: string;
    paragraphs?: string[];
    imageUrl?: string;
    imageAlt?: string;
  };
  documentary?: {
    eyebrow?: string;
    title?: string;
    intro?: string;
    mainVideo?: {
      title?: string;
      embedUrl?: string;
      watchUrl?: string;
      description1?: string;
      description2?: string;
    };
    followUps?: FollowUp[];
  };
  history?: {
    eyebrow?: string;
    title?: string;
    paragraphs?: string[];
    imageUrl?: string;
    imageAlt?: string;
  };
  visit?: {
    eyebrow?: string;
    title?: string;
    paragraphs?: string[];
    imageUrl?: string;
    imageAlt?: string;
  };
};

const FALLBACK_HERO_TITLE = 'From Zanskar to Auroville: A Journey of Spirit and Discovery';

export default function KarshaNunsMainContent({ initialData }: { initialData: KarshaPayload }) {
  const hero = initialData.hero ?? {};
  const documentary = initialData.documentary ?? {};
  const mainVideo = documentary.mainVideo ?? {};
  const followUps = Array.isArray(documentary.followUps) ? documentary.followUps : [];
  const history = initialData.history ?? {};
  const visit = initialData.visit ?? {};

  const heroParagraphs =
    Array.isArray(hero.paragraphs) && hero.paragraphs.length > 0
      ? hero.paragraphs
      : [
          'Set in the remote Himalayan region of Zanskar in Ladakh, this documentary follows the lives of the Karsha nuns, women who live and practice in quiet devotion at one of the oldest nunneries in the region.',
          'Through intimate, observational footage, we witness their daily routines, rituals, and the profound stillness that defines their mountain existence. But this is only the beginning of the story.',
          'The film then follows an extraordinary journey as a group of ten nuns leave their secluded village, many for the first time, and travel south to Auroville. What unfolds is not just a physical journey, but a transformative crossing of landscapes, cultures, and inner worlds.',
        ];

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <InlineCmsText
                cmsType="karshaNuns"
                path={['hero', 'title']}
                initialValue={hero.title || FALLBACK_HERO_TITLE}
                as="h1"
              />
              <div className={styles.heroCopy}>
                {heroParagraphs.map((para, index) => (
                  <InlineCmsText
                    key={index}
                    cmsType="karshaNuns"
                    path={['hero', 'paragraphs', index]}
                    initialValue={para}
                    as="p"
                    multiline
                  />
                ))}
              </div>
              <div className={styles.heroActions}>
                <a href="#documentary" className={`btn ${styles.btnKarsha}`}>
                  <Play size={20} fill="currentColor" /> Watch the Journey
                </a>
                <a href="/discussion?project=karsha-nuns" className="btn btn-primary">
                  ❤️ Join the conversation - In our chatroom 💬
                </a>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <InlineCmsImage
                cmsType="karshaNuns"
                path={['hero', 'imageUrl']}
                initialSrc={hero.imageUrl || 'https://auroraseyefilms.com/wp-content/uploads/2025/07/Karsha-Nun-1.jpeg'}
                alt={hero.imageAlt || 'Karsha nun portrait'}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="documentary" className={`section ${styles.documentarySection}`}>
        <div className="container">
          <div className={styles.sectionIntro}>
            <p className={styles.sectionEyebrow}>
              <InlineCmsText
                cmsType="karshaNuns"
                path={['documentary', 'eyebrow']}
                initialValue={documentary.eyebrow || 'The Documentary'}
                as="span"
              />
            </p>
            <h2 className="title">
              <InlineCmsText
                cmsType="karshaNuns"
                path={['documentary', 'title']}
                initialValue={
                  documentary.title ||
                  'A film about the Karsha nuns, their world, and a rare journey south'
                }
                as="span"
              />
            </h2>
            <p>
              <InlineCmsText
                cmsType="karshaNuns"
                path={['documentary', 'intro']}
                initialValue={
                  documentary.intro ||
                  'This project follows the Karsha nuns from their high-altitude Himalayan home in Zanskar to Auroville, tracing a powerful encounter between devotion, ecological awareness, cultural exchange, and inner discovery.'
                }
                as="span"
                multiline
              />
            </p>
          </div>

          <div className={styles.mainVideoLayout}>
            <div className={styles.mainVideoFrame}>
              <iframe
                src={mainVideo.embedUrl || 'https://www.youtube-nocookie.com/embed/jII25meOkKI?rel=0'}
                title={mainVideo.title || 'From Zanskar to Auroville'}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
            <div className={styles.mainVideoText}>
              <h3>
                <InlineCmsText
                  cmsType="karshaNuns"
                  path={['documentary', 'mainVideo', 'title']}
                  initialValue={mainVideo.title || 'From Zanskar to Auroville'}
                  as="span"
                />
              </h3>
              <p>
                <InlineCmsText
                  cmsType="karshaNuns"
                  path={['documentary', 'mainVideo', 'description1']}
                  initialValue={
                    mainVideo.description1 ||
                    'Through the eyes of the nuns, we see Auroville anew: their open-hearted curiosity, humble wonder, and quiet strength offer viewers a rare and touching lens through which to reflect on both traditions and the future.'
                  }
                  as="span"
                  multiline
                />
              </p>
              <p>
                <InlineCmsText
                  cmsType="karshaNuns"
                  path={['documentary', 'mainVideo', 'description2']}
                  initialValue={
                    mainVideo.description2 ||
                    'This documentary is more than a record. It is a bridge between communities, a shared archive of cultural and spiritual exchange, and the beginning of something deeper.'
                  }
                  as="span"
                  multiline
                />
              </p>
              <a
                href={mainVideo.watchUrl || 'https://www.youtube.com/watch?v=jII25meOkKI'}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.watchLink}
              >
                Watch on YouTube <ExternalLink size={16} />
              </a>
            </div>
          </div>

          <div className={styles.followUpGrid}>
            {followUps.map((video) => (
              <article key={video.embedUrl} className={styles.clipCard}>
                <div className={styles.clipFrame}>
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                </div>
                <h3>{video.title}</h3>
                <p>{video.summary}</p>
                <a href={video.watchUrl} target="_blank" rel="noopener noreferrer" className={styles.watchLink}>
                  Watch on YouTube <ExternalLink size={16} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="history" className={`section ${styles.storySection}`}>
        <div className="container">
          <div className={`${styles.storyGrid} ${styles.historyStoryGrid}`}>
            <div className={styles.historyStoryCopy}>
              <p className={styles.sectionEyebrow}>
                <InlineCmsText
                  cmsType="karshaNuns"
                  path={['history', 'eyebrow']}
                  initialValue={history.eyebrow || 'How it All Began'}
                  as="span"
                />
              </p>
              <h2 className="title">
                <InlineCmsText
                  cmsType="karshaNuns"
                  path={['history', 'title']}
                  initialValue={history.title || 'A promise that became a mission'}
                  as="span"
                />
              </h2>
              {(history.paragraphs?.length
                ? history.paragraphs
                : [
                    "When Norbu came to pick Serena up at the end of her stay, she asked him to explain the concept of Auroville to the nuns. Their eyes lit up. They were fascinated by the idea of such a place and asked, with quiet hope, if one day they might visit.",
                    "That request became a mission. It took two years of dedication and coordination, but eventually ten nuns from Karsha Nunnery travelled to Auroville in one of the most meaningful exchanges of Serena's life.",
                  ]
              ).map((para, index) => (
                <InlineCmsText
                  key={index}
                  cmsType="karshaNuns"
                  path={['history', 'paragraphs', index]}
                  initialValue={para}
                  as="p"
                  multiline
                />
              ))}
            </div>
            <div className={styles.storyImagePanel}>
              <InlineCmsImage
                cmsType="karshaNuns"
                path={['history', 'imageUrl']}
                initialSrc={
                  history.imageUrl ||
                  'https://auroraseyefilms.com/wp-content/uploads/2025/08/Serena-on-her-Zanskar-Journey.jpg'
                }
                alt={history.imageAlt || 'Serena on her Zanskar journey'}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="visit" className={`section ${styles.visitSection}`}>
        <div className="container">
          <div className={styles.storyGrid}>
            <div className={styles.storyImagePanel}>
              <InlineCmsImage
                cmsType="karshaNuns"
                path={['visit', 'imageUrl']}
                initialSrc={
                  visit.imageUrl ||
                  'https://auroraseyefilms.com/wp-content/uploads/2025/08/Nuns-at-Matrimandir-gardens.jpeg'
                }
                alt={visit.imageAlt || 'Karsha nuns at Matrimandir gardens'}
              />
            </div>
            <div>
              <p className={styles.sectionEyebrow}>
                <InlineCmsText
                  cmsType="karshaNuns"
                  path={['visit', 'eyebrow']}
                  initialValue={visit.eyebrow || "Nuns' Visit to Auroville"}
                  as="span"
                />
              </p>
              <h2 className="title">
                <InlineCmsText
                  cmsType="karshaNuns"
                  path={['visit', 'title']}
                  initialValue={visit.title || 'A spiritual and cultural exchange like no other'}
                  as="span"
                />
              </h2>
              {(visit.paragraphs?.length
                ? visit.paragraphs
                : [
                    'For generations, the nuns lived quietly in rhythms of prayer, service, and mountain life. Their visit to Auroville opened a new chapter of cultural exchange, ecological learning, and shared practice across communities.',
                    'These encounters became seeds for long-term collaboration, mutual respect, and a living bridge between Zanskar and Auroville.',
                  ]
              ).map((para, index) => (
                <InlineCmsText
                  key={index}
                  cmsType="karshaNuns"
                  path={['visit', 'paragraphs', index]}
                  initialValue={para}
                  as="p"
                  multiline
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
