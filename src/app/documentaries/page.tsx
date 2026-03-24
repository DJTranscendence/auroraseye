import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { getFilms } from "@/utils/cms";
import { Search, Filter, Play } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function Documentaries() {
  const filmsData = await getFilms() as any[];
  const categories = ["All", ...Array.from(new Set(filmsData.map(f => f.category)))];

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className="container">
            <div className="badge">Catalog</div>
            <h1>Documentary Archive</h1>
            <p className={styles.subtitle}>Explore our complete collection of stories from around the globe.</p>
            
            <div className={styles.searchBar}>
              <div className={styles.searchWrapper}>
                <Search size={20} className={styles.searchIcon} />
                <input type="text" placeholder="Search films by title, year or category..." />
              </div>
              <div className={styles.filters}>
                {categories.map((cat, i) => (
                  <button key={i} className={i === 0 ? styles.activeFilter : styles.filterBtn}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="section">
          <div className="container">
            <div className={styles.grid}>
              {filmsData.map((film) => (
                <div key={film.id} className={styles.filmCard}>
                  <div className={styles.thumbnail}>
                    <img src={film.thumbnail} alt={film.title} />
                    <div className={styles.playButton}>
                      <Play fill="white" size={32} />
                    </div>
                  </div>
                  <div className={styles.info}>
                    <div className={styles.meta}>
                      <span className={styles.category}>{film.category}</span>
                      <span className={styles.year}>{film.year}</span>
                    </div>
                    <h3>{film.title}</h3>
                    <p>{film.description}</p>
                    <Link href={film.videoUrl} className={styles.watchBtn}>
                      Watch Film
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
