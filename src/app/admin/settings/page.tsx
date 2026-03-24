'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { Save, ArrowLeft, Settings, Video, Image as ImageIcon, Contact, Youtube, Linkedin } from "lucide-react";
import Link from "next/link";

export default function ManageSettings() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/cms?type=config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    await fetch('/api/cms?type=config', {
      method: 'POST',
      body: JSON.stringify(config),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };



  if (loading) return <p>Loading settings...</p>;

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <div className={styles.titleInfo}>
              <Settings size={32} className="text-primary" />
              <div>
                <h1>Global Site Settings</h1>
                <p>Update hero content, contact information, and social links.</p>
              </div>
            </div>
            <Link href="/admin" className="btn btn-outline">Back to Dashboard</Link>
          </div>

          <div className={styles.settingsGrid}>
            <section className={styles.settingCard}>
              <div className={styles.cardHeader}>
                <Video size={24} />
                <h2>Hero Section</h2>
              </div>
              <div className={styles.formGroup}>
                <label>Main Headline</label>
                <input 
                  value={config.hero.title} 
                  onChange={e => setConfig({...config, hero: {...config.hero, title: e.target.value}})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Hero Description</label>
                <textarea 
                  value={config.hero.description} 
                  onChange={e => setConfig({...config, hero: {...config.hero, description: e.target.value}})}
                  rows={4}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Hero Video URL (YouTube)</label>
                <input 
                  value={config.hero.videoUrl} 
                  onChange={e => setConfig({...config, hero: {...config.hero, videoUrl: e.target.value}})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Fallback Background Image URL</label>
                <input 
                  value={config.hero.bgImage} 
                  onChange={e => setConfig({...config, hero: {...config.hero, bgImage: e.target.value}})}
                />
              </div>
            </section>

            <section className={styles.settingCard}>
              <div className={styles.cardHeader}>
                <Contact size={24} />
                <h2>Contact & Social</h2>
              </div>
              <div className={styles.formGroup}>
                <label>Contact Email</label>
                <input 
                  value={config.contact.email} 
                  onChange={e => setConfig({...config, contact: {...config.contact, email: e.target.value}})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Physical Address</label>
                <textarea 
                  value={config.contact.address} 
                  onChange={e => setConfig({...config, contact: {...config.contact, address: e.target.value}})}
                  rows={2}
                />
              </div>

              <div className={styles.formGroup}>
                <label>YouTube Channel URL</label>
                <input 
                  value={config.contact.youtube} 
                  onChange={e => setConfig({...config, contact: {...config.contact, youtube: e.target.value}})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Instagram URL</label>
                <input 
                  value={config.contact.instagram} 
                  onChange={e => setConfig({...config, contact: {...config.contact, instagram: e.target.value}})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>LinkedIn URL</label>
                <input 
                  value={config.contact.linkedin} 
                  onChange={e => setConfig({...config, contact: {...config.contact, linkedin: e.target.value}})}
                />
              </div>

            </section>
          </div>

          <div className={styles.footerActions}>
            <button 
              onClick={handleSave} 
              className={`btn btn-lg ${saved ? styles.savedBtn : 'btn-primary'}`}
            >
              <Save size={20} /> {saved ? 'Settings Saved!' : 'Save All Settings'}
            </button>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
