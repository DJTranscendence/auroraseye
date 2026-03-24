import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { Instagram, Facebook, Globe, Play, ChevronRight, Heart } from "lucide-react";
import Link from 'next/link';

const NAV_LINKS = [
  { name: "The Documentary", href: "#documentary" },
  { name: "How it All Began", href: "#history" },
  { name: "Nuns' Visit to Auroville", href: "#visit" },
  { name: "Eco Nuns", icon: <Heart size={14} fill="currentColor" />, href: "#eco" },
  { name: "About the Nunnery", href: "#nunnery" },
  { name: "Connect", href: "#connect" },
];

export default function KarshaNunsPage() {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      
      <main className={styles.main}>
        {/* Project Header (from screenshot) */}
        <header className={styles.projectHeader}>
          <div className="container">
            <div className={styles.headerTop}>
              <div className={styles.projectTitle}>The Karsha Nuns Project</div>
              <div className={styles.socialIcons}>
                <a href="#"><Instagram size={18} /></a>
                <a href="#"><Facebook size={18} /></a>
                <a href="#"><Globe size={18} /></a>
              </div>
            </div>
            
            <nav className={styles.projectNav}>
              {NAV_LINKS.map((link, i) => (
                <Link key={i} href={link.href} className={i === 0 ? styles.activeNavLink : ''}>
                  {link.icon}{link.name}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBg}>
            <video 
              src="https://assets.mixkit.co/videos/preview/mixkit-young-woman-looking-at-the-ocean-during-golden-hour-4852-large.mp4"
              autoPlay muted loop playsInline
            />
            <div className={styles.heroOverlay}></div>
          </div>
          
          <div className={`container ${styles.heroContent}`}>
            <div className="badge">Project Highlight</div>
            <h1>Karsha <span className="text-primary">Nuns</span></h1>
            <p className={styles.subtitle}>A journey of empowerment, spirituality, and ecological mindfulness in the heart of Zanskar.</p>
            <button className="btn btn-primary">
              <Play size={20} fill="white" /> See Their Story
            </button>

          </div>
        </section>

        {/* Content Placeholder for Section Logic */}
        <section id="documentary" className="section">
          <div className="container">
            <div className="grid">
              <div className={styles.sectionText}>
                <h2 className="title">The Documentary</h2>
                <p>
                  Exploring the lives of the nuns of Karsha, Zanskar, through the lens of Serena Aurora. 
                  This film captures the essence of their daily struggles and spiritual resilience.
                </p>
              </div>
              <div className={styles.videoEmbed}>
                <div className={styles.videoPlaceholder}>
                   <Play size={48} className="text-primary" />
                   <span>Click to play project preview</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="history" className={`section ${styles.altBg}`}>
          <div className="container">
            <h2 className="title">How it All Began</h2>
            <p>
              The collaboration started in 2018 when a group of filmmakers visited the Zanskar valley...
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
