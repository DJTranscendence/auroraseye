'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WatchNextStrip from "@/components/WatchNextStrip";
import YouTubeSubscribePanel from "@/components/YouTubeSubscribePanel";
import KarshaFloatingNav from "./KarshaFloatingNav";
import KarshaProjectHeader from "./KarshaProjectHeader";
import styles from "./page.module.css";
import { Play, ExternalLink } from "lucide-react";

const PROJECT_LINKS = {
  instagram: "https://www.instagram.com/auroras_eye_films/",
  facebook: "https://www.facebook.com/karsha.nunnery/about",
  website: "https://www.cjnunnery.com/",
};

const MAIN_VIDEO = {
  title: "From Zanskar to Auroville",
  embedUrl: "https://www.youtube-nocookie.com/embed/jII25meOkKI?rel=0",
};

const FOLLOW_UP_VIDEOS = [
  {
    title: "Arrival: The Nuns Enter Auroville",
    embedUrl: "https://www.youtube-nocookie.com/embed/I-75uMhWdbQ?rel=0",
    watchUrl: "https://www.youtube.com/watch?v=I-75uMhWdbQ",
    summary: "A first look at the nuns' arrival, their early impressions, and the emotions of stepping into Auroville.",
  },
  {
    title: "Exchange: Cultures Meet in Practice",
    embedUrl: "https://www.youtube-nocookie.com/embed/0j_CmfdGdnA?rel=0",
    watchUrl: "https://www.youtube.com/watch?v=0j_CmfdGdnA",
    summary: "Shared practices and day-to-day interactions reveal how two communities learn from each other in real time.",
  },
  {
    title: "Reflection: Quiet Moments of Meaning",
    embedUrl: "https://www.youtube-nocookie.com/embed/C6gV25HjNUg?rel=0",
    watchUrl: "https://www.youtube.com/watch?v=C6gV25HjNUg",
    summary: "A contemplative close focused on stillness, personal insight, and what the journey leaves behind.",
  },
];

export default function KarshaNunsClientPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <KarshaProjectHeader
          instagram={PROJECT_LINKS.instagram}
          facebook={PROJECT_LINKS.facebook}
          website={PROJECT_LINKS.website}
        />

        <KarshaFloatingNav />

        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroGrid}>
              <div className={styles.heroContent}>
                <h1>From Zanskar to Auroville: A Journey of Spirit and Discovery</h1>
                <div className={styles.heroCopy}>
                  <p>
                    Set in the remote Himalayan region of Zanskar in Ladakh, this documentary follows the lives of
                    the Karsha nuns, women who live and practice in quiet devotion at one of the oldest nunneries
                    in the region.
                  </p>
                  <p>
                    Through intimate, observational footage, we witness their daily routines, rituals, and the profound
                    stillness that defines their mountain existence. But this is only the beginning of the story.
                  </p>
                  <p>
                    The film then follows an extraordinary journey as a group of ten nuns leave their secluded village,
                    many for the first time, and travel south to Auroville. What unfolds is not just a physical journey,
                    but a transformative crossing of landscapes, cultures, and inner worlds.
                  </p>
                </div>
                <a href="#documentary" className="btn btn-primary">
                  <Play size={20} fill="white" /> Watch The Documentary Path
                </a>
                <a href="/discussion?project=karsha-nuns" className="btn btn-primary">
                  ❤️ Join the conversation - In our chatroom 💬
                </a>
              </div>

              <div className={styles.heroVisual}>
                <img
                  src="https://auroraseyefilms.com/wp-content/uploads/2025/07/Karsha-Nun-1.jpeg"
                  alt="Karsha nun portrait"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="documentary" className={`section ${styles.documentarySection}`}>
          <div className="container">
            <div className={styles.sectionIntro}>
              <p className={styles.sectionEyebrow}>The Documentary</p>
              <h2 className="title">A film about the Karsha nuns, their world, and a rare journey south</h2>
              <p>
                This project follows the Karsha nuns from their high-altitude Himalayan home in Zanskar to Auroville,
                tracing a powerful encounter between devotion, ecological awareness, cultural exchange, and inner discovery.
              </p>
            </div>

            <div className={styles.mainVideoLayout}>
              <div className={styles.mainVideoFrame}>
                <iframe
                  src={MAIN_VIDEO.embedUrl}
                  title={MAIN_VIDEO.title}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
              <div className={styles.mainVideoText}>
                <h3>{MAIN_VIDEO.title}</h3>
                <p>
                  Through the eyes of the nuns, we see Auroville anew: their open-hearted curiosity, humble wonder,
                  and quiet strength offer viewers a rare and touching lens through which to reflect on both traditions
                  and the future.
                </p>
                <p>
                  This documentary is more than a record. It is a bridge between communities, a shared archive of cultural
                  and spiritual exchange, and the beginning of something deeper.
                </p>
                <a
                  href="https://www.youtube.com/watch?v=jII25meOkKI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.watchLink}
                >
                  Watch on YouTube <ExternalLink size={16} />
                </a>
              </div>
            </div>

            <div className={styles.followUpGrid}>
              {FOLLOW_UP_VIDEOS.map((video) => (
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
                  <a
                    href={video.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.watchLink}
                  >
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
                <p className={styles.sectionEyebrow}>How it All Began</p>
                <h2 className="title">A promise that became a mission</h2>
                <p>
                  When Norbu came to pick Serena up at the end of her stay, she asked him to explain the concept of
                  Auroville to the nuns. Their eyes lit up. They were fascinated by the idea of such a place and asked,
                  with quiet hope, if one day they might visit.
                </p>
                <p>
                  That request became a mission. It took two years of dedication and coordination, but eventually ten nuns
                  from Karsha Nunnery travelled to Auroville in one of the most meaningful exchanges of Serena&apos;s life.
                </p>
              </div>
              <div className={styles.storyImagePanel}>
                <img
                  src="https://auroraseyefilms.com/wp-content/uploads/2025/08/Serena-on-her-Zanskar-Journey.jpg"
                  alt="Serena on her Zanskar journey"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="visit" className={`section ${styles.visitSection}`}>
          <div className="container">
            <div className={styles.storyGrid}>
              <div className={styles.storyImagePanel}>
                <img
                  src="https://auroraseyefilms.com/wp-content/uploads/2025/08/Nuns-at-Matrimandir-gardens.jpeg"
                  alt="Karsha nuns at Matrimandir gardens"
                />
              </div>
              <div>
                <p className={styles.sectionEyebrow}>Nuns&apos; Visit to Auroville</p>
                <h2 className="title">A spiritual and cultural exchange like no other</h2>
                <p>
                  For generations, the nuns lived quietly in rhythms of prayer, service, and mountain life. Their visit to
                  Auroville opened a space of encounter with sustainability, experimentation, and a different expression of
                  spiritual community.
                </p>
                <p>
                  The contrast was not superficial. It created a rare space of recognition, humility, and mutual learning,
                  allowing both communities to see themselves more clearly through the presence of the other.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="eco" className={`section ${styles.storySection}`}>
          <div className="container">
            <div className={styles.storyGrid}>
              <div>
                <p className={styles.sectionEyebrow}>Eco Nuns</p>
                <h2 className="title">From Zanskar to Auroville: learning, empowerment and sisterhood</h2>
                <p>
                  In December 2024, a group of ten nuns from the remote Himalayan region of Karsha, Zanskar, embarked on
                  an extraordinary journey to Auroville. The exchange was built on open-hearted coordination and a belief
                  that cross-cultural learning can create long-term transformation.
                </p>
                <p>
                  The visit connected ecological practice, feminine resilience, and spiritual discipline, turning a single
                  trip into the beginning of a deeper relationship.
                </p>
              </div>
              <div className={styles.storyImagePanel}>
                <img
                  src="https://auroraseyefilms.com/wp-content/uploads/2025/08/Eco-nun-pad-2.jpeg"
                  alt="Eco Nuns in Auroville"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="nunnery" className={`section ${styles.nunnerySection}`}>
          <div className="container">
            <div className={styles.sectionIntro}>
              <p className={styles.sectionEyebrow}>About the Nunnery</p>
              <h2 className="title">Keepers of a sacred tradition</h2>
            </div>
            <div className={styles.nunneryGrid}>
              <article className={styles.infoCard}>
                <img
                  src="https://auroraseyefilms.com/wp-content/uploads/2025/08/Nuns-Praying-1.jpg"
                  alt="Nuns praying"
                />
                <div>
                  <h3>The Karsha Nunnery</h3>
                  <p>
                    Chuchik Jal Kha Choe Drupling Nunnery, in the Zanskar region of Ladakh, is a community of Tibetan Buddhist
                    nuns carrying forward sacred rituals, chants, and meditative practices within a spiritual space women fought
                    to preserve.
                  </p>
                </div>
              </article>
              <article className={styles.infoCard}>
                <img
                  src="https://auroraseyefilms.com/wp-content/uploads/2025/08/Nun-reading-scripture.jpg"
                  alt="Nun reading scripture"
                />
                <div>
                  <h3>Education and continuity</h3>
                  <p>
                    In 2004 the nuns established a small school for local children, helping the nunnery grow into both a spiritual
                    and educational hub.
                  </p>
                </div>
              </article>
              <article className={styles.infoCard}>
                <img
                  src="https://auroraseyefilms.com/wp-content/uploads/2025/08/Nuns-working-in-Green-house-1.jpg"
                  alt="Nuns working in greenhouse"
                />
                <div>
                  <h3>Daily life in the Himalayas</h3>
                  <p>
                    Life is rooted in simplicity and work: tending fields, collecting fuel, carrying water uphill, and facing the
                    physical realities of mountain seasons.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="connect" className={`section ${styles.connectSection}`}>
          <div className="container">
            <div className={styles.connectBox}>
              <div>
                <p className={styles.sectionEyebrow}>Connect</p>
                <h2 className="title">Stay connected to the Karsha Nuns story</h2>
                <p>
                  Follow the project, learn more about the nunnery, and continue supporting this bridge between Karsha and
                  Auroville.
                </p>
              </div>
              <div className={styles.connectLinks}>
                <a href={PROJECT_LINKS.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
                <a href={PROJECT_LINKS.facebook} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
                <a href={PROJECT_LINKS.website} target="_blank" rel="noopener noreferrer">
                  Karsha Nunnery Website
                </a>
              </div>
            </div>

            <div className={styles.youtubePanelWrap}>
              <WatchNextStrip
                title="Continue the Karsha story on YouTube"
                description="Use the main documentary as the entry point, then move into the surrounding moments that deepen the exchange and the emotional arc."
                contextLabel="karsha-watch-next"
                items={[
                  {
                    title: "From Zanskar to Auroville",
                    description: "Start with the central documentary and the full emotional spine of the journey.",
                    url: "https://www.youtube.com/watch?v=jII25meOkKI",
                    thumbnail: "https://img.youtube.com/vi/jII25meOkKI/hqdefault.jpg",
                  },
                  {
                    title: "Arrival in Auroville",
                    description: "Watch the first encounters and how the journey begins to shift perspective.",
                    url: "https://www.youtube.com/watch?v=I-75uMhWdbQ",
                    thumbnail: "https://img.youtube.com/vi/I-75uMhWdbQ/hqdefault.jpg",
                  },
                  {
                    title: "A moment of reflection",
                    description: "End with a quieter clip that extends the feeling beyond the main film.",
                    url: "https://www.youtube.com/watch?v=C6gV25HjNUg",
                    thumbnail: "https://img.youtube.com/vi/C6gV25HjNUg/hqdefault.jpg",
                  },
                ]}
              />
            </div>
            <div className={styles.youtubePanelWrap}>
              <YouTubeSubscribePanel contextLabel="karsha-subscribe-panel" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
