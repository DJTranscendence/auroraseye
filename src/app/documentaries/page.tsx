import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Documentary3DBrowser from "./Documentary3DBrowser";
import styles from "./page.module.css";
import { getFilms } from "@/utils/cms";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentary Archive",
  description: "Browse the Aurora's Eye Films documentary archive by category and discover our latest visual storytelling work.",
  alternates: {
    canonical: "/documentaries",
  },
};

export const dynamic = 'force-dynamic';

export default async function Documentaries() {
  const filmsData = await getFilms() as any[];

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className="container">
            <div className="badge">Catalog</div>
            <h1>Documentary Archive</h1>
            <p className={styles.subtitle}>Select your interest, choose a category that interests you and then browse our catalog to select a video to enjoy!</p>
          </div>
        </header>

        <section className={`section ${styles.browserSection}`}>
          <div className="container">
            <Documentary3DBrowser filmsData={filmsData} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
