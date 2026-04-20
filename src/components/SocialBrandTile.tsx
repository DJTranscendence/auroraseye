'use client';

import { useId } from 'react';

export type SocialBrand = 'facebook' | 'youtube' | 'linkedin' | 'instagram';

type Props = {
  brand: SocialBrand;
  size?: number;
};

/** Compact rounded-square brand marks for navbar / footer (no external icon pack). */
export function SocialBrandTile({ brand, size = 22 }: Props) {
  const uid = useId().replace(/:/g, '');
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    'aria-hidden': true as const,
  };

  switch (brand) {
    case 'facebook':
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`${uid}-fb`} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#63abf4" />
              <stop offset="1" stopColor="#0866ff" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="5.5" fill={`url(#${uid}-fb)`} />
          <path
            fill="#fff"
            d="M13.5 22v-7.245h2.428l.364-2.846H13.5v-1.818c0-.824.206-1.385 1.386-1.385h1.482V6.12c-.256-.034-1.139-.112-2.164-.112-2.168 0-3.653 1.378-3.653 3.903v2.188H8.82v2.846h2.331V22h2.349z"
          />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...common}>
          <rect width="24" height="24" rx="5.5" fill="#ff0000" />
          <path fill="#fff" d="M9.5 7.75v8.5L16.75 12 9.5 7.75z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...common}>
          <rect width="24" height="24" rx="5.5" fill="#0a66c2" />
          <path
            fill="#fff"
            d="M8.65 9.9H5.9V20h2.75V9.9zm.05-2.55a1.55 1.55 0 1 0-1.55 1.55 1.55 1.55 0 0 0 1.55-1.55zM20 20h-2.75v-5.35c0-1.28-.02-2.92-1.78-2.92-1.78 0-2.05 1.39-2.05 2.82V20h-2.75V9.9h2.64v1.22h.04c.37-.7 1.27-1.44 2.62-1.44 2.8 0 3.32 1.84 3.32 4.23V20z"
          />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`${uid}-ig`} x1="4" y1="20" x2="20" y2="4" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f9ce34" />
              <stop offset="0.45" stopColor="#ee2a7b" />
              <stop offset="1" stopColor="#6228d7" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="5.5" fill={`url(#${uid}-ig)`} />
          <rect
            x="6.25"
            y="6.25"
            width="11.5"
            height="11.5"
            rx="3"
            fill="none"
            stroke="#fff"
            strokeWidth="1.35"
          />
          <circle cx="12" cy="12" r="2.65" fill="none" stroke="#fff" strokeWidth="1.35" />
          <circle cx="15.35" cy="8.65" r="0.75" fill="#fff" />
        </svg>
      );
    default:
      return null;
  }
}
