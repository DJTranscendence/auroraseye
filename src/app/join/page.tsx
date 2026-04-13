'use client';

import { useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import donationProjects from '@/data/donationProjects.json';
import karshaNuns from '@/data/karshaNuns.json';

const CONTACT_EMAIL = 'Serena_aurora@auroville.org.in';

type DonationProjectsPayload = typeof donationProjects;

type FormState = {
  name: string;
  email: string;
  role: string;
  message: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  role: '',
  message: '',
};

export default function JoinTeamPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const galleryImages = useMemo(() => {
    const images: string[] = [];
    const payload = donationProjects as DonationProjectsPayload;

    payload.projects.forEach((project) => {
      if (project.heroImage) {
        images.push(project.heroImage);
      }
      project.media?.images?.forEach((image) => {
        if (image) {
          images.push(image);
        }
      });
    });

    if (karshaNuns?.hero?.imageUrl) {
      images.push(karshaNuns.hero.imageUrl);
    }
    if (karshaNuns?.history?.imageUrl) {
      images.push(karshaNuns.history.imageUrl);
    }
    if (karshaNuns?.visit?.imageUrl) {
      images.push(karshaNuns.visit.imageUrl);
    }
    if (karshaNuns?.eco?.imageUrl) {
      images.push(karshaNuns.eco.imageUrl);
    }
    karshaNuns?.nunnery?.cards?.forEach((card) => {
      if (card.imageUrl) {
        images.push(card.imageUrl);
      }
    });

    const unique = Array.from(new Set(images));
    return unique.slice(0, 18);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const subject = `Join the Aurora's Eye Team: ${form.role || 'Inquiry'}`;
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Role: ${form.role}`,
      '',
      form.message,
    ].join('\n');

    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <header className={styles.header}>
            <div className={styles.badge}>Join the Team</div>
            <h1>Join the Aurora's Eye Team</h1>
            <p>We are looking for writers, editors, designers, and collaborators to join our storytelling mission.</p>
          </header>

          <section className={styles.grid}>
            <div className={styles.formCard}>
              <h2>Get in touch</h2>
              <form className={styles.form} onSubmit={handleSubmit}>
                <label>
                  Name
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    required
                  />
                </label>
                <label>
                  Role / Skills
                  <input
                    type="text"
                    value={form.role}
                    onChange={(event) => setForm({ ...form, role: event.target.value })}
                    placeholder="Writer, Editor, Designer"
                    required
                  />
                </label>
                <label>
                  Message
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    placeholder="Tell us about your experience and share links to your work."
                    required
                  />
                </label>
                <button type="submit" className={styles.submitButton}>
                  Send message
                </button>
                <p className={styles.formNote}>
                  This will open your email client to send a message to {CONTACT_EMAIL}.
                </p>
              </form>
            </div>

            <div className={styles.galleryCard}>
              <h2>Selected highlights</h2>
              <div className={styles.galleryGrid}>
                {galleryImages.map((src, index) => (
                  <img
                    key={`join-gallery-${index}`}
                    className={styles.galleryImage}
                    src={src}
                    alt={`Aurora's Eye highlight ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
