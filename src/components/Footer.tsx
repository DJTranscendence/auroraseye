'use client';

import Link from "next/link";
import styles from "./Footer.module.css";
import { Github, Youtube, Instagram, Mail, MapPin, Linkedin } from "lucide-react";
import { useState, useEffect } from 'react';
import { getConfig } from "@/utils/cms"; // Wait, I can't use node utils in client component easily, I'll fetch it.

export default function Footer() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetch('/api/cms?type=config').then(res => res.json()).then(setConfig);
  }, []);

  return (

    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            Aurora&apos;s Eye
          </Link>
          <p>
            {config?.contact?.address || 'Anitya community, Auroville, Tamil Nadu 605101, India'}
          </p>
          <div className={styles.social}>
            <Link href={config?.contact?.youtube || "https://youtube.com/@AuroraEyeFilms"}><Youtube size={20} /></Link>
            <Link href={config?.contact?.instagram || "https://instagram.com/auroraseyefilms"}><Instagram size={20} /></Link>
            <Link href={config?.contact?.linkedin || "#"}><Linkedin size={20} /></Link>
          </div>
        </div>

        
        <div className={styles.nav}>
          <h4>Categories</h4>
          <Link href="/documentaries">Documentaries</Link>
          <Link href="/news">News</Link>
          <Link href="/team">Our Team</Link>
          <Link href="/donate">Donate</Link>
        </div>

        <div className={styles.newsletter}>
          <h4>Stay Connected</h4>
          <p>Subscribe to our newsletter for the latest updates on our filmmaking projects.</p>
          <form className={styles.form} onSubmit={async (e) => {
            e.preventDefault();
            const email = (e.target as any).querySelector('input').value;
            const res = await fetch('/api/newsletter', {
              method: 'POST',
              body: JSON.stringify({ email }),
            });
            if (res.ok) alert('Successfully joined!');
          }}>
            <input type="email" placeholder="Enter your email" required />
            <button type="submit" className="btn btn-primary">Join</button>
          </form>

        </div>
      </div>
      <div className={styles.bottom}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Aurora&apos;s Eye Films. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
