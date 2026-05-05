'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InlineCmsText, useIsAdmin } from '@/components/cms/InlineCmsBlocks';
import styles from './page.module.css';
import type { BreakingPayload } from '@/utils/breakingContentMerge';

const DONATE_INDIA = 'https://pay.auroville.org/aef';
const DONATE_OUTSIDE = 'https://give.aviusa.org/page/Auroville';

/** `<option>` elements cannot host React inline editors; expose parallel fields for admins. */
function DonateRegionOptionEditors({ pageCopy }: { pageCopy: BreakingPayload['pageCopy'] }) {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const refresh = () => router.refresh();

  if (!isAdmin) {
    return null;
  }
  return (
    <div className={styles.donateRegionAdminHints} aria-label="Edit donate region dropdown labels">
      <span className={styles.donateRegionAdminHint}>
        Placeholder:{' '}
        <InlineCmsText
          cmsType="breakingTheSilence"
          path={['pageCopy', 'donateRegionPlaceholder']}
          initialValue={pageCopy.donateRegionPlaceholder}
          as="span"
          onSaved={refresh}
        />
      </span>
      <span className={styles.donateRegionAdminHint}>
        India option:{' '}
        <InlineCmsText
          cmsType="breakingTheSilence"
          path={['pageCopy', 'donateRegionIndia']}
          initialValue={pageCopy.donateRegionIndia}
          as="span"
          onSaved={refresh}
        />
      </span>
      <span className={styles.donateRegionAdminHint}>
        Outside option:{' '}
        <InlineCmsText
          cmsType="breakingTheSilence"
          path={['pageCopy', 'donateRegionOutside']}
          initialValue={pageCopy.donateRegionOutside}
          as="span"
          onSaved={refresh}
        />
      </span>
    </div>
  );
}

function DonatePrimaryFace({
  region,
  pageCopy,
}: {
  region: 'india' | 'international' | '';
  pageCopy: BreakingPayload['pageCopy'];
}) {
  const label = (
    <InlineCmsText
      cmsType="breakingTheSilence"
      path={['pageCopy', 'donatePrimaryCta']}
      initialValue={pageCopy.donatePrimaryCta}
      as="span"
    />
  );
  if (!region) {
    return (
      <span className={`btn btn-primary ${styles.donateBtnMuted}`} aria-disabled="true">
        {label}
      </span>
    );
  }
  return (
    <a
      className="btn btn-primary"
      href={region === 'india' ? DONATE_INDIA : DONATE_OUTSIDE}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  );
}

export default function BreakingDonateCta({ pageCopy }: { pageCopy: BreakingPayload['pageCopy'] }) {
  const [region, setRegion] = useState<'india' | 'international' | ''>('');
  const router = useRouter();
  const refresh = () => router.refresh();

  return (
    <div className={styles.donateCtaRow}>
      <div className={styles.donateRegionStack}>
        <label className={styles.donateRegionLabel} htmlFor="bts-donate-region">
          <InlineCmsText
            cmsType="breakingTheSilence"
            path={['pageCopy', 'donateRegionPrompt']}
            initialValue={pageCopy.donateRegionPrompt}
            as="span"
            onSaved={refresh}
          />
        </label>
        <select
          id="bts-donate-region"
          className={styles.donateRegionSelect}
          value={region}
          onChange={(event) => {
            const v = event.target.value;
            setRegion(v === 'india' || v === 'international' ? v : '');
          }}
        >
          <option value="">{pageCopy.donateRegionPlaceholder}</option>
          <option value="india">{pageCopy.donateRegionIndia}</option>
          <option value="international">{pageCopy.donateRegionOutside}</option>
        </select>
        <DonateRegionOptionEditors pageCopy={pageCopy} />
        <DonatePrimaryFace region={region} pageCopy={pageCopy} />
      </div>
      <a className="btn btn-outline" href="#connect">
        <InlineCmsText
          cmsType="breakingTheSilence"
          path={['pageCopy', 'donatePartnerCta']}
          initialValue={pageCopy.donatePartnerCta}
          as="span"
        />
      </a>
    </div>
  );
}
