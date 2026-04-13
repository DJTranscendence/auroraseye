import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BreakingFloatingNav from "./BreakingFloatingNav";
import BreakingProjectHeader from "./BreakingProjectHeader";
import styles from "./page.module.css";
import fallbackContent from "@/data/breakingTheSilence.json";
import { getBreakingTheSilence } from "@/utils/cms";
import { BreakingHeroFrameClient, BreakingMediaWallClient } from "./BreakingMediaClient";
import BreakingPageThemeDock from "./BreakingPageThemeDock";

export const metadata: Metadata = {
  title: "Breaking the Silence",
  description:
    "A feature-length documentary about truth, trauma, and the possibility of healing.",
  alternates: {
    canonical: "/breaking-the-silence",
  },
};

export const dynamic = "force-dynamic";

const PARTNER_GROUPS = [
  {
    title: "NGOs & Organisations",
    items: [
      "Child protection groups",
      "Women's organisations",
      "Trauma and mental health practitioners",
      "Community facilitators",
    ],
    note: "Those who can host screenings and guide conversations safely.",
  },
  {
    title: "Distribution Partners",
    items: [
      "Impact distributors",
      "Film festivals",
      "Educational platforms",
      "Broadcasters",
    ],
    note: "To help bring this film to audiences worldwide.",
  },
  {
    title: "Supporters & Funders",
    items: [
      "Individuals",
      "Foundations",
      "Grants & impact investors",
    ],
    note: "To support the final stages of post-production.",
  },
];

type BreakingContent = typeof fallbackContent;

export default async function BreakingTheSilencePage() {
  let content: BreakingContent = fallbackContent as BreakingContent;

  try {
    const nextContent = await getBreakingTheSilence();
    if (nextContent && typeof nextContent === "object") {
      content = nextContent as BreakingContent;
    }
  } catch {
    content = fallbackContent as BreakingContent;
  }

  const heroFrame = content.heroFrame ?? (fallbackContent as BreakingContent).heroFrame;
  const mediaWall = content.mediaWall ?? (fallbackContent as BreakingContent).mediaWall;

  return (
    <BreakingPageThemeDock
      initialPageColors={content.pageColors}
      initialPayload={{ ...(content as Record<string, unknown>) }}
    >
      <Navbar />

      <main className={styles.main}>
        <BreakingProjectHeader />
        <BreakingFloatingNav />

        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroGrid}>
              <div className={styles.heroContent}>
                <p className={styles.kicker}>🎬 Breaking the Silence</p>
                <h1>A film about truth, trauma, and the possibility of healing.</h1>
                <div className={styles.heroCopy}>
                  <p>Breaking the Silence is a feature-length documentary currently in post-production.</p>
                  <p>It began with one question: What happens when the truth is never spoken?</p>
                  <p>
                    This film explores the hidden reality of child sexual abuse — not through statistics alone, but
                    through human stories, lived experiences, and the long journey toward healing.
                  </p>
                  <p>
                    Blending survivor testimonies, global expert insights, and deeply personal narration, the film moves
                    beyond awareness and into something more powerful:
                  </p>
                  <ul className={styles.heroList}>
                    <li>👉 a space for truth</li>
                    <li>👉 a space for listening</li>
                    <li>👉 a space for healing</li>
                  </ul>
                </div>
                <div className={styles.heroActions}>
                  <a className="btn btn-primary" href="#documentary">
                    The Documentary
                  </a>
                  <a className="btn btn-outline" href="#donate">
                    Donate
                  </a>
                </div>
              </div>
              <div className={styles.heroVisual}>
                <BreakingHeroFrameClient initialHeroFrame={heroFrame} initialContent={content} />
              </div>
            </div>
          </div>
        </section>
        <BreakingMediaWallClient initialMediaWall={mediaWall} initialContent={content} />

        <section id="documentary" className={`section ${styles.section}`}>
          <div className="container">
            <div className={styles.sectionIntro}>
              <p className={styles.sectionEyebrow}>🌍 The Film</p>
              <h2 className="title">A documentary in post-production, built from lived truth</h2>
              <p>
                Breaking the Silence is a feature-length documentary now in the final stages of post-production.
                We are shaping the edit by bringing together survivor voices from around the world, expert insights on
                trauma and healing, and visual storytelling through art, movement, and sound. This is the most crucial
                stage of the process — and the moment where your support can make a real difference.
              </p>
            </div>

            <div className={styles.callout}>
              <p className={styles.calloutLabel}>🎬 Current Stage</p>
              <p>
                The film is now in post-production. We are shaping the final edit — bringing together survivor voices,
                expert insights, and visual storytelling. This is the moment where your support can help the film
                reach the world.
              </p>
            </div>
          </div>
        </section>

        <section id="why" className={`section ${styles.section}`}> 
          <div className="container">
            <div className={styles.sectionIntro}>
              <p className={styles.sectionEyebrow}>🔥 Why This Film Matters</p>
              <h2 className="title">The conversation cannot end at awareness</h2>
              <p>
                Child sexual abuse is one of the most widespread — and most silenced — issues in the world.
                Yet the conversation often ends too soon. This film is not just about exposing the problem. It is about
                continuing the conversation. Because real change does not happen in a cinema. It happens afterwards —
                in communities, in groups, in safe spaces where people can finally speak.
              </p>
            </div>
          </div>
        </section>

        <section id="conversation" className={`section ${styles.section}`}>
          <div className="container">
            <div className={styles.sectionIntro}>
              <p className={styles.sectionEyebrow}>🌱 More Than a Film — a Conversation Starter</p>
              <h2 className="title">Stories that open doors, truth that creates connection</h2>
              <p>
                Breaking the Silence is designed to be used as a tool for dialogue and transformation. We are creating
                this film as a starting point — not an ending. We believe that stories can open doors, truth can create
                connection, and safe spaces can lead to healing. But for this to happen, we need people who are ready to
                hold that space.
              </p>
            </div>

            <div className={styles.conversationCta}>
              <a className="btn btn-primary" href="/discussion?project=breaking-the-silence">
                ❤️ Join the conversation - In our chatroom 💬
              </a>
            </div>

            <div className={styles.partnerGrid}>
              {PARTNER_GROUPS.map((group) => (
                <a key={group.title} href="/contact" className={styles.partnerCard} style={{ textDecoration: 'none' }}>
                  <h3>{group.title}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className={styles.partnerNote}>👉 {group.note}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="connect" className={`section ${styles.section}`}>
          <div className="container">
            <div className={styles.contactBox}>
              <div>
                <p className={styles.sectionEyebrow}>✨ Get Involved</p>
                <h2 className="title">Join the conversation and help carry it forward</h2>
                <p>
                  If this film speaks to you — if you believe in the importance of this conversation — we would love to
                  connect.
                </p>
                <div className={styles.contactLines}>
                  <p>📩 Contact us: Serena_aurora@auroville.org.in</p>
                  <p>🌐 Website: auroraseyefilms.com</p>
                </div>
              </div>
              <div className={styles.finalLine}>
                <p>🕊️ The opposite of silence is not only speaking.</p>
                <p>The opposite of silence is healing.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="donate" className={`section ${styles.section}`}>
          <div className="container">
            <div className={styles.donateCard}>
              <div>
                <p className={styles.sectionEyebrow}>🚨 Call to Action</p>
                <h2 className="title">Support the film and help it reach the world</h2>
                <p>
                  We are inviting you to be part of this journey. Help us complete post-production and bring this story
                  to life. Partner with us to host screenings, hold conversations, and create safe spaces. Support
                  distribution and impact outreach.
                </p>
              </div>
              <div className={styles.ctaRow}>
                <a className="btn btn-primary" href="https://pay.auroville.org/aef" target="_blank" rel="noopener noreferrer">
                  Donate
                </a>
                <a className="btn btn-outline" href="#connect">
                  Partner With Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </BreakingPageThemeDock>
  );
}
