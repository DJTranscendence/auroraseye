import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import KarshaFloatingNav from "./KarshaFloatingNav";
import KarshaProjectHeader from "./KarshaProjectHeader";
import KarshaNunsMainContent from "./KarshaNunsMainContent";
import styles from "./page.module.css";
import type { Metadata } from "next";

const YouTubeSubscribePanel = dynamic(() => import("@/components/YouTubeSubscribePanel"), { ssr: false });

import { getKarshaNuns, getConfig } from "@/utils/cms";
import fallbackKarshaData from "@/data/karshaNuns.json";
import PageThemeDock from "@/components/PageThemeDock";

export const metadata: Metadata = {
  title: "Karsha Nuns Documentary",
  description:
    "Watch the Karsha Nuns documentary journey from Zanskar to Auroville and explore related stories and project links.",
  alternates: {
    canonical: "/karsha-nuns",
  },
};

const DEFAULT_PROJECT_LINKS = {
  instagram: "https://www.instagram.com/karsha_nunnery/",
  facebook: "https://www.facebook.com/karsha.nunnery/about",
  website: "https://www.cjnunnery.com/",
};

export default async function KarshaNunsPage() {
  const DESKTOP_FLOATING_NAV_NUDGE_PX = 8;
  let content = fallbackKarshaData as Record<string, unknown>;
  try {
    const fresh = await getKarshaNuns();
    if (fresh && typeof fresh === "object" && Object.keys(fresh).length > 0) {
      content = fresh as Record<string, unknown>;
    }
  } catch {
    /* use fallback */
  }

  let karshaFloatingNavDesktopTopPx = 122;
  try {
    const cfg = await getConfig();
    const n = cfg?.karshaFloatingNav?.desktopTopPx;
    if (typeof n === "number" && Number.isFinite(n)) {
      karshaFloatingNavDesktopTopPx = Math.round(n);
    }
  } catch {
    /* default */
  }
  karshaFloatingNavDesktopTopPx += DESKTOP_FLOATING_NAV_NUDGE_PX;

  const pl = (content.projectLinks ?? {}) as Record<string, string | undefined>;
  const projectLinks = {
    instagram: pl.instagram || DEFAULT_PROJECT_LINKS.instagram,
    facebook: pl.facebook || DEFAULT_PROJECT_LINKS.facebook,
    website: pl.website || DEFAULT_PROJECT_LINKS.website,
  };

  return (
    <PageThemeDock pageType="karshaNuns" initialColors={(content as { pageColors?: unknown }).pageColors} initialPayload={content}>
      <div className={styles.wrapper}>
        <Navbar />

        <main className={styles.main}>
          <KarshaProjectHeader
            instagram={projectLinks.instagram}
            facebook={projectLinks.facebook}
            website={projectLinks.website}
          />

          <KarshaFloatingNav defaultDesktopTopPx={karshaFloatingNavDesktopTopPx} />

          <KarshaNunsMainContent initialData={content} />

          <YouTubeSubscribePanel contextLabel="karsha-nuns" />
        </main>
        <Footer />
      </div>
    </PageThemeDock>
  );
}
