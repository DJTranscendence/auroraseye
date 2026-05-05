import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { getConfig } from "@/utils/cms";
import PageThemeDock from "@/components/PageThemeDock";
import ContactPageHeader from "./ContactPageHeader";
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

  const address = config?.contact?.address ?? "Aurora's Eye Films, Anitya community, Auroville, Tamil Nadu 605101";
  const email = config?.contact?.email ?? "Serena_aurora@auroville.org.in";

  const youtubeUrl = config?.contact?.youtube ?? "https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw";
  const instagramUrl = config?.contact?.instagram ?? "https://www.instagram.com/auroras_eye_films/";
  const facebookUrl = "https://www.facebook.com/AurorasEye/";
  const twitterUrl = "https://twitter.com/auroraseye";
  const linkedinUrl = config?.contact?.linkedin ?? "https://in.linkedin.com/company/auroras-eye-films";

  return (
    <PageThemeDock pageType="contact" initialColors={config?.contactPageTheme} initialPayload={config}>
      <Navbar />
      <main className={styles.main}>
        <ContactPageHeader copy={config?.contactPageCopy} />

        <section className={styles.section}>
          <div className="container">
            <div className={styles.grid}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>VISIT US</h2>

                <div className={styles.row}>
                  <MapPin size={18} className={styles.icon} />
                  <p className={styles.text}>{address}</p>
                </div>

                <div className={styles.miniMap}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3902.6533977981426!2d79.80453159999999!3d11.9984679!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5367cb3deb60d7%3A0x9810cb34d6cb28e8!2sAuroras%20Eye%20Films!5e0!3m2!1sen!2sin!4v1777300883553!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Aurora's Eye Studio Location"
                  />
                  <a 
                    href="https://maps.app.goo.gl/EhKEgMydLmG8JUTc8?g_st=aw" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.mapOverlayLink}
                  >
                    Share Directions
                  </a>
                </div>
              </div>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>ONLINE</h2>

                <div className={styles.socialGrid}>
                  <a className={styles.socialLink} href={`mailto:${email}`}>
                    <Mail size={18} />
                    <span>Email Us</span>
                  </a>

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
    </PageThemeDock>
  );
}
