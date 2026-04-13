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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://auroras-eye-films.vercel.app";
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

function buildThemeStyle(theme?: Record<string, string>) {
  if (!theme) {
    return undefined;
  }

  const style: CSSProperties = {};
  const styleRecord = style as Record<string, string>;

  const entries = Object.entries(theme).filter(([, value]) => typeof value === "string" && value.trim().length > 0);
  for (const [key, value] of entries) {
    styleRecord[`--${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`] = value.trim();
  }

  return style;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getConfig();
  const themeStyle = buildThemeStyle(config?.theme as Record<string, string> | undefined);

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
