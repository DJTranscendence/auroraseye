'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import styles from './DonationCampaignCard.module.css';

type DonationTier = {
  amount: number;
  label: string;
  detail: string;
};

export type DonationCampaign = {
  episodeNumber: number;
  episodeName: string;
  campaignName: string;
  fundedPercent: number;
  shootBeginsInDays: number;
  liveSupporterName: string;
  liveSupporterContribution: string;
  donationUrl: string;
  previewClipUrl: string;
  previewStartSeconds: number;
  previewEndSeconds: number;
  previewThumbnail: string;
  summary: string;
  tiers: DonationTier[];
};

type Props = {
  campaign: DonationCampaign;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export default function DonationCampaignCard({ campaign }: Props) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(campaign.tiers[0]?.amount ?? 100);
  const [selectedTierLabel, setSelectedTierLabel] = useState(campaign.tiers[0]?.label ?? 'General support');
  const [showPrefillForm, setShowPrefillForm] = useState(false);
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedAmount(campaign.tiers[0]?.amount ?? 100);
    setSelectedTierLabel(campaign.tiers[0]?.label ?? 'General support');
  }, [campaign]);

  const openFallbackCheckout = () => {
    window.open(campaign.donationUrl, '_blank', 'noopener,noreferrer');
  };

  const launchCheckout = async (amount: number, tierLabel: string) => {
    setSelectedAmount(amount);
    setSelectedTierLabel(tierLabel);
    setPaymentMessage(null);

    if (!showPrefillForm) {
      setShowPrefillForm(true);
      return;
    }

    if (!checkoutReady || !window.Razorpay) {
      openFallbackCheckout();
      return;
    }

    setIsSubmitting(true);

    try {
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          customerName,
          customerEmail,
          customerPhone,
          campaignName: campaign.campaignName,
          tierLabel,
        }),
      });

      if (!orderResponse.ok) {
        openFallbackCheckout();
        return;
      }

      const { keyId, order } = await orderResponse.json();

      const razorpay = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Auroras Eye Films',
        description: `${campaign.campaignName} • ${tierLabel}`,
        order_id: order.id,
        prefill: {
          name: customerName || undefined,
          email: customerEmail || undefined,
          contact: customerPhone || undefined,
        },
        notes: {
          campaignName: campaign.campaignName,
          tierLabel,
          episodeNumber: `${campaign.episodeNumber}`,
        },
        theme: {
          color: '#d29a16',
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          },
        },
        handler: async (response: Record<string, string>) => {
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const verifyPayload = await verifyResponse.json().catch(() => ({ verified: false }));

          setPaymentMessage(
            verifyPayload.verified
              ? `Payment confirmed for ${tierLabel}.`
              : 'Payment submitted. Verification is pending.',
          );
          setIsSubmitting(false);
        },
      });

      razorpay.open();
    } catch {
      openFallbackCheckout();
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.card}>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setCheckoutReady(true)}
      />
      <div className={styles.headerBlock}>
        <div className={styles.copyColumn}>
          <p className={styles.eyebrow}>Support this Project!</p>
          <h2 className={styles.title}>{campaign.campaignName || `Fund Episode ${campaign.episodeNumber} – ${campaign.episodeName}`}</h2>
          <p className={styles.summary}>{campaign.summary}</p>
        </div>
      </div>

      <div className={styles.featureRow}>
        <div className={styles.metricsPanel}>
          {showPrefillForm && (
            <>
              <div className={styles.prefillGrid}>
                <input
                  type="text"
                  className={styles.prefillInput}
                  placeholder="Your name"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                />
                <input
                  type="email"
                  className={styles.prefillInput}
                  placeholder="Email for receipt"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                />
                <input
                  type="tel"
                  className={styles.prefillInput}
                  placeholder="Phone for payment prefill"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                />
              </div>
            </>
          )}
          <div className={styles.progressMeta}>
            <span>{campaign.fundedPercent}% funded</span>
            <span>Shoot begins in {campaign.shootBeginsInDays} days</span>
          </div>
          <div className={styles.progressBar} aria-hidden="true">
            <span style={{ width: `${Math.max(0, Math.min(100, campaign.fundedPercent))}%` }} />
          </div>
          {showPrefillForm && (
            <p className={styles.selectionHint}>Selected amount: ₹{selectedAmount.toLocaleString('en-IN')} for {selectedTierLabel}</p>
          )}

          <button
            type="button"
            className={styles.liveTicker}
            onClick={() => launchCheckout(selectedAmount, selectedTierLabel)}
          >
            <strong>Live:</strong>
            <span>{campaign.liveSupporterName} just funded {campaign.liveSupporterContribution}</span>
          </button>

          <button
            type="button"
            className={styles.donateButton}
            onClick={() => launchCheckout(selectedAmount, selectedTierLabel)}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Opening Checkout…'
              : showPrefillForm
                ? `Continue to pay ₹${selectedAmount.toLocaleString('en-IN')}`
                : `Donate ₹${selectedAmount.toLocaleString('en-IN')}`}
          </button>
          {paymentMessage && <p className={styles.paymentMessage}>{paymentMessage}</p>}
        </div>
      </div>

      <div className={styles.tiersSection}>
        <p className={styles.tiersIntro}>Each tier unlocks visible progress</p>
          <div className={styles.tiers}>
            {campaign.tiers.map((tier, index) => {
              const unlockThreshold = Math.round(((index + 1) / (campaign.tiers.length + 1)) * 100);
              const unlocked = campaign.fundedPercent >= unlockThreshold;

              return (
                <button
                  key={`${tier.amount}-${tier.label}`}
                  type="button"
                  className={`${styles.tierCard} ${unlocked ? styles.tierUnlocked : ''}`}
                  onClick={() => launchCheckout(tier.amount, tier.label)}
                >
                  <div className={styles.tierAmount}>₹{tier.amount.toLocaleString('en-IN')}</div>
                  <div className={styles.tierLabel}>{tier.label}</div>
                  <div className={styles.tierDetail}>{tier.detail}</div>
                  <div className={styles.tierStatus}>{unlocked ? 'Unlocked progress' : `Unlocks at ${unlockThreshold}%`}</div>
                </button>
              );
            })}
          </div>
      </div>
    </section>
  );
}