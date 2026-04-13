'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clapperboard, HandCoins, Save } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

const emptyCampaign = {
  episodeNumber: 1,
  episodeName: '',
  campaignName: '',
  fundedPercent: 0,
  shootBeginsInDays: 0,
  liveSupporterName: '',
  liveSupporterContribution: '',
  donationUrl: '',
  previewClipUrl: '',
  previewStartSeconds: 0,
  previewEndSeconds: 8,
  previewThumbnail: '',
  summary: '',
  tiers: [
    { amount: 500, label: 'Feed the crew', detail: '1 day' },
    { amount: 2000, label: 'Sound design', detail: '1 scene' },
    { amount: 10000, label: 'Actor / location', detail: 'Key production day' },
  ],
};

export default function AdminDonationsPage() {
  const [campaign, setCampaign] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/cms?type=donationCampaign')
      .then((res) => res.json())
      .then((data) => setCampaign(data))
      .catch(() => setCampaign(emptyCampaign));
  }, []);

  const handleSave = async () => {
    await fetch('/api/cms?type=donationCampaign', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!campaign) return <p>Loading campaign...</p>;

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <div className={styles.titleInfo}>
              <HandCoins size={32} className="text-primary" />
              <div>
                <h1>Donation Campaign</h1>
                <p>Edit the fundraising story, progress bar, live ticker, and preview clip.</p>
              </div>
            </div>
            <Link href="/admin" className="btn btn-outline">
              <ArrowLeft size={18} /> Back to Dashboard
            </Link>
          </div>

          <div className={styles.settingsGrid}>
            <section className={styles.settingCard}>
              <div className={styles.cardHeader}>
                <Clapperboard size={24} />
                <h2>Campaign Story</h2>
              </div>

              <div className={styles.formGroup}>
                <label>Episode Number</label>
                <input type="number" value={campaign.episodeNumber} onChange={(e) => setCampaign({ ...campaign, episodeNumber: Number(e.target.value) })} />
              </div>
              <div className={styles.formGroup}>
                <label>Episode Name</label>
                <input value={campaign.episodeName} onChange={(e) => setCampaign({ ...campaign, episodeName: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Campaign Title</label>
                <input value={campaign.campaignName} onChange={(e) => setCampaign({ ...campaign, campaignName: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Summary</label>
                <textarea rows={4} value={campaign.summary} onChange={(e) => setCampaign({ ...campaign, summary: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Donation URL</label>
                <input value={campaign.donationUrl} onChange={(e) => setCampaign({ ...campaign, donationUrl: e.target.value })} />
              </div>
            </section>

            <section className={styles.settingCard}>
              <div className={styles.cardHeader}>
                <HandCoins size={24} />
                <h2>Progress & Preview</h2>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Percent Funded</label>
                  <input type="number" min="0" max="100" value={campaign.fundedPercent} onChange={(e) => setCampaign({ ...campaign, fundedPercent: Number(e.target.value) })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Shoot Begins In (days)</label>
                  <input type="number" min="0" value={campaign.shootBeginsInDays} onChange={(e) => setCampaign({ ...campaign, shootBeginsInDays: Number(e.target.value) })} />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Live Supporter Name</label>
                  <input value={campaign.liveSupporterName} onChange={(e) => setCampaign({ ...campaign, liveSupporterName: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Live Contribution</label>
                  <input value={campaign.liveSupporterContribution} onChange={(e) => setCampaign({ ...campaign, liveSupporterContribution: e.target.value })} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Preview Clip URL (YouTube)</label>
                <input value={campaign.previewClipUrl} onChange={(e) => setCampaign({ ...campaign, previewClipUrl: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Preview Thumbnail URL</label>
                <input value={campaign.previewThumbnail} onChange={(e) => setCampaign({ ...campaign, previewThumbnail: e.target.value })} />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Preview Start (sec)</label>
                  <input type="number" min="0" value={campaign.previewStartSeconds} onChange={(e) => setCampaign({ ...campaign, previewStartSeconds: Number(e.target.value) })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Preview End (sec)</label>
                  <input type="number" min="1" value={campaign.previewEndSeconds} onChange={(e) => setCampaign({ ...campaign, previewEndSeconds: Number(e.target.value) })} />
                </div>
              </div>
            </section>
          </div>

          <section className={styles.tiersCard}>
            <div className={styles.cardHeader}>
              <HandCoins size={24} />
              <h2>Impact Tiers</h2>
            </div>

            <div className={styles.tierGrid}>
              {campaign.tiers.map((tier: any, index: number) => (
                <div key={`${tier.label}-${index}`} className={styles.tierEditor}>
                  <div className={styles.formGroup}>
                    <label>Amount</label>
                    <input type="number" value={tier.amount} onChange={(e) => {
                      const tiers = [...campaign.tiers];
                      tiers[index] = { ...tier, amount: Number(e.target.value) };
                      setCampaign({ ...campaign, tiers });
                    }} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Label</label>
                    <input value={tier.label} onChange={(e) => {
                      const tiers = [...campaign.tiers];
                      tiers[index] = { ...tier, label: e.target.value };
                      setCampaign({ ...campaign, tiers });
                    }} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Detail</label>
                    <input value={tier.detail} onChange={(e) => {
                      const tiers = [...campaign.tiers];
                      tiers[index] = { ...tier, detail: e.target.value };
                      setCampaign({ ...campaign, tiers });
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className={styles.footerActions}>
            <button onClick={handleSave} className={`btn btn-lg ${saved ? styles.savedBtn : 'btn-primary'}`}>
              <Save size={20} /> {saved ? 'Campaign Saved!' : 'Save Donation Campaign'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}