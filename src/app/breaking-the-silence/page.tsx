import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { getBreakingTheSilence } from "@/utils/cms";
import { mergeBreakingPayload } from "@/utils/breakingContentMerge";
import BreakingPageThemeDock from "./BreakingPageThemeDock";
import BreakingMainContent from "./BreakingMainContent";
import { normalizeMediaWallItems, type MediaWall } from "./BreakingMediaClient";

export const metadata: Metadata = {
  title: "Breaking the Silence",
  description:
    "A feature-length documentary about truth, trauma, and the possibility of healing.",
  alternates: {
    canonical: "/breaking-the-silence",
  },
};

export const dynamic = "force-dynamic";

export default async function BreakingTheSilencePage() {
  let raw: unknown = {};
  try {
    raw = await getBreakingTheSilence();
  } catch {
    raw = {};
  }

  const content = mergeBreakingPayload(raw);
  const mediaWall: MediaWall = {
    eyebrow: content.mediaWall.eyebrow,
    title: content.mediaWall.title,
    items: normalizeMediaWallItems(content.mediaWall.items),
  };

  return (
    <BreakingPageThemeDock
      initialPageColors={content.pageColors}
      initialPayload={{ ...(content as Record<string, unknown>) }}
    >
      <Navbar />

      <main className={styles.main}>
        <BreakingMainContent content={content} mediaWall={mediaWall} />
      </main>

      <Footer />
    </BreakingPageThemeDock>
  );
}
