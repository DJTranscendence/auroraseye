import type { Metadata } from "next";
import { Miriam_Libre, Inter } from "next/font/google";
import "./globals.css";

const miriamLibre = Miriam_Libre({
  variable: "--font-miriam",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});


import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "Aurora's Eye Films | Filmmaking & Storytelling Portfolio",
  description: "A filmmaking and storytelling project by Serena Aurora, focusing on documentaries, special projects, and high-impact visual storytelling.",
  keywords: ["filmmaking", "documentary", "storytelling", "Auroville", "Serena Aurora", "films"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${miriamLibre.variable} ${inter.variable}`}>

      <body>
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
