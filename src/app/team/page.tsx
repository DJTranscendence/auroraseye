import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { getTeam } from "@/utils/cms";
import { Mail, Instagram, Linkedin, Quote } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function Team() {
  const teamData = await getTeam() as any[];
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className="container">
            <div className="badge">Our People</div>
            <h1>The Visionaries Behind the Lens</h1>
            <p className={styles.subtitle}>Meet the documentary filmmakers and storytellers of Aurora&apos;s Eye Films.</p>
          </div>
        </header>

        <section className="section">
          <div className="container">
            <div className={styles.grid}>
              {teamData.map((member) => (
                <div key={member.id} className={styles.memberCard}>
                  <div className={styles.photoContainer}>
                    <img src={member.photo} alt={member.name} />
                  </div>
                  <div className={styles.content}>
                    <div className={styles.role}>{member.role}</div>
                    <h2>{member.name}</h2>
                    <div className={styles.quoteIcon}>
                      <Quote size={32} strokeWidth={1} />
                    </div>
                    <p className={styles.bio}>{member.bio}</p>
                    <div className={styles.social}>
                      <Link href="#"><Mail size={18} /></Link>
                      <Link href="#"><Instagram size={18} /></Link>
                      <Link href="#"><Linkedin size={18} /></Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`section ${styles.missionSection}`}>
          <div className="container">
            <div className={styles.missionBox}>
              <div className={styles.missionContent}>
                <h2>Our Mission</h2>
                <p>
                  We aim to inspire and inform through the art of documentary filmmaking. 
                  Our focus is on projects that promote human unity, ecological sustainability, 
                  and the diverse cultural tapestry of our world.
                </p>
                <div className={styles.impact}>
                  <div className={styles.impactItem}>
                    <h3>Integrity</h3>
                    <p>Honest storytelling that respects the subject and the audience.</p>
                  </div>
                  <div className={styles.impactItem}>
                    <h3>Innovation</h3>
                    <p>Pushing the boundaries of visual language and sound design.</p>
                  </div>
                  <div className={styles.impactItem}>
                    <h3>Community</h3>
                    <p>Fostering a global network of conscious viewers and creators.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
