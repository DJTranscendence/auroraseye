import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import KarshaFloatingNav from "./KarshaFloatingNav";
import KarshaProjectHeader from "./KarshaProjectHeader";
import styles from "./page.module.css";
import { Play, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

const WatchNextStrip = dynamic(() => import("@/components/WatchNextStrip"), { ssr: false });
const YouTubeSubscribePanel = dynamic(() => import("@/components/YouTubeSubscribePanel"), { ssr: false });

export const metadata: Metadata = {
  title: "Karsha Nuns Documentary",
  description:
    "Watch the Karsha Nuns documentary journey from Zanskar to Auroville and explore related stories and project links.",
  alternates: {
    canonical: "/karsha-nuns",
  },
};

const PROJECT_LINKS = {
  instagram: "https://www.instagram.com/karsha_nunnery/",
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

const getYouTubeIdFromWatchUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('v') ?? '';
  } catch {
    return '';
  }
};

const WATCH_NEXT_ITEMS = FOLLOW_UP_VIDEOS.map((video) => {
  const id = getYouTubeIdFromWatchUrl(video.watchUrl);
  return {
    title: video.title,
    description: video.summary,
    url: video.watchUrl,
    thumbnail: id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '',
  };
});

export default function KarshaNunsPage() {
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
                    Set in the remote Himalayan region of Zanskar in Ladakh, this documentary follows the lives
                    of the Karsha nuns, women who live and practice in quiet devotion at one of the oldest nunneries
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
                  Join the Conversation - In our Chatroom!
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
                <a href="https://www.youtube.com/watch?v=jII25meOkKI" target="_blank" rel="noopener noreferrer" className={styles.watchLink}>
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
                  Auroville opened a new chapter of cultural exchange, ecological learning, and shared practice across
                  communities.
                </p>
                <p>
                  These encounters became seeds for long-term collaboration, mutual respect, and a living bridge between
                  Zanskar and Auroville.
                </p>
              </div>
            </div>
          </div>
        </section>

        <WatchNextStrip
          title="Continue the Karsha Nuns journey"
          description="Short films and reflections that expand the story behind the documentary."
          items={WATCH_NEXT_ITEMS}
          contextLabel="karsha-nuns"
        />
        <YouTubeSubscribePanel contextLabel="karsha-nuns" />
      </main>
      <Footer />
    </div>
  );
}
