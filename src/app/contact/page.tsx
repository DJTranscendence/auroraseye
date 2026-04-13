import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { getConfig } from "@/utils/cms";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Twitter, Youtube } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Aurora's Eye Films for collaborations, screenings, and documentary production inquiries.",
  alternates: {
    canonical: "/contact",
  },
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const config = (await getConfig()) as any;

  const address =
    config?.contact?.address ??
    "Aurora's Eye Films, Anitya community, Auroville, Tamil Nadu 605101";
  const email = config?.contact?.email ?? "Serena_aurora@auroville.org.in";

  // Source: https://auroraseyefilms.com/contact/
  const youtubeUrl = config?.contact?.youtube ?? "https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw";
  const instagramUrl = config?.contact?.instagram ?? "https://www.instagram.com/auroras_eye_films/";
  const facebookUrl = "https://www.facebook.com/AurorasEye/";
  const twitterUrl = "https://twitter.com/auroraseye";
  const linkedinUrl =
    config?.contact?.linkedin ?? "https://in.linkedin.com/company/auroras-eye-films";

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className="container">
            <div className="badge">Contact</div>
            <h1>Get in touch with us</h1>
            <p className={styles.subtitle}>Reach our studio for collaborations, screenings, or documentary inquiries.</p>
          </div>
        </header>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.grid}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>REACH OUR STUDIO</h2>

                <div className={styles.row}>
                  <MapPin size={18} className={styles.icon} />
                  <p className={styles.text}>{address}</p>
                </div>

                <div className={styles.row}>
                  <Mail size={18} className={styles.icon} />
                  <a className={styles.link} href={`mailto:${email}`}>
                    {email}
                  </a>
                </div>

                <p className={styles.note}>We'll get back to you as soon as possible! Normally within 24 hours.</p>
              </div>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>ONLINE</h2>

                <div className={styles.socialGrid}>
                  <a className={styles.socialLink} href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                    <Youtube size={18} />
                    <span>Youtube</span>
                  </a>

                  <a className={styles.socialLink} href={instagramUrl} target="_blank" rel="noopener noreferrer">
                    <Instagram size={18} />
                    <span>Instagram</span>
                  </a>

                  <a className={styles.socialLink} href={facebookUrl} target="_blank" rel="noopener noreferrer">
                    <Facebook size={18} />
                    <span>Facebook</span>
                  </a>

                  <a className={styles.socialLink} href={twitterUrl} target="_blank" rel="noopener noreferrer">
                    <Twitter size={18} />
                    <span>Twitter</span>
                  </a>

                  <a className={styles.socialLink} href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <Linkedin size={18} />
                    <span>LinkedIn</span>
                  </a>
                </div>

                <p className={styles.note}>Follow us for updates and releases.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

