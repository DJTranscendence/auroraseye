import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { getConfig, getTeam } from "@/utils/cms";
import TeamClient from "./TeamClient";
import PageThemeDock from "@/components/PageThemeDock";
import TeamPageCopy from "./TeamPageCopy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the filmmakers, producers, and storytellers behind Aurora's Eye Films.",
  alternates: {
    canonical: "/team",
  },
};

export const dynamic = 'force-dynamic';

export default async function Team() {
  const config = (await getConfig()) as any;
  const teamData = await getTeam() as any[];
  return (
    <PageThemeDock pageType="team" initialColors={config?.teamPageTheme} initialPayload={config}>
      <Navbar />
      <main className={styles.main}>
        <TeamPageCopy copy={config?.teamPageCopy} />

        <TeamClient initialTeam={teamData} />
      </main>
      <Footer />
    </PageThemeDock>
  );
}
