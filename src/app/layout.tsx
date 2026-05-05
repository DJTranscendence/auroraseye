import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Miriam_Libre, Inter, Patrick_Hand } from "next/font/google";
import "./globals.css";
import { getConfig } from "@/utils/cms";

const miriamLibre = Miriam_Libre({
  variable: "--font-miriam",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const patrickHand = Patrick_Hand({
  variable: "--font-patrick-hand",
  subsets: ["latin"],
  weight: ["400"],
});


import ThemeRuntime from "@/components/ThemeRuntime";
import { getSiteUrl } from "@/config/site";

const siteUrl = getSiteUrl();
const defaultTitle = "Aurora's Eye Films";
const defaultDescription =
  "Documentary filmmaking and visual storytelling from Auroville by Serena Aurora and Aurora's Eye Films.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${defaultTitle} | Filmmaking & Storytelling Portfolio`,
    template: `%s | ${defaultTitle}`,
  },
  description: defaultDescription,
  keywords: ["filmmaking", "documentary", "storytelling", "Auroville", "Serena Aurora", "films"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: defaultTitle,
    title: `${defaultTitle} | Filmmaking & Storytelling Portfolio`,
    description: defaultDescription,
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Aurora's Eye Films logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${defaultTitle} | Filmmaking & Storytelling Portfolio`,
    description: defaultDescription,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const HEADER_OPACITY_THEME_KEYS = new Set(["headerTextureOverlayOpacity", "headerDarkOverlayOpacity"]);

function buildThemeStyle(theme?: Record<string, unknown>) {
  if (!theme || typeof theme !== "object") {
    return undefined;
  }

  const style: CSSProperties = {};
  const styleRecord = style as Record<string, string>;
  const entries = Object.entries(theme);
  for (const [key, value] of entries) {
    if (HEADER_OPACITY_THEME_KEYS.has(key)) {
      continue;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) {
        continue;
      }
      styleRecord[`--${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`] = trimmed;
      continue;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      styleRecord[`--${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`] = String(value);
    }
  }

  const tex = theme.headerTextureOverlayOpacity;
  if (typeof tex === "number" && Number.isFinite(tex)) {
    styleRecord["--header-texture-opacity"] = String(tex);
  }

  const dark = theme.headerDarkOverlayOpacity;
  if (typeof dark === "number" && Number.isFinite(dark)) {
    styleRecord["--header-dark-overlay-opacity"] = String(dark);
  }

  return style;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getConfig();
  const themeStyle = buildThemeStyle(config?.theme as Record<string, unknown> | undefined);

  return (
    <html
      lang="en"
      className={`${miriamLibre.variable} ${inter.variable} ${patrickHand.variable}`}
      style={themeStyle}
    >
      <head>
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
      </head>
      <body>
        <ThemeRuntime />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Aurora's Eye Films",
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              sameAs: [
                "https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw",
                "https://www.instagram.com/auroras_eye_films/",
                "https://www.facebook.com/AurorasEye/",
                "https://in.linkedin.com/company/auroras-eye-films",
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
