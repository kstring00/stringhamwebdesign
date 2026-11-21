import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";

import "./globals.css";
import ClarityAnalytics from "./ClarityAnalytics";
import Footer from "./components/Footer";
import Header from "./components/Header";
import MobileBar from "./components/MobileBar";
import Magnetic from "./motion/Magnetic";
import Reveal from "./motion/Reveal";
import Tracking from "./motion/Tracking";
import RefTracker from "./motion/RefTracker";
import TileJoin from "./tiles/TileJoin";
import { site } from "./data/site";

/* Both faces are self-hosted: next/font downloads them at build and serves
   them from this origin, subset to latin, with no request to Google from a
   visitor's browser. Instrument Serif (one weight, roman and italic) is
   for headings; DM Sans (variable, roman and italic) is everything else. */
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `Web Design for Therapists & Mental Health Practices | ${site.name}`, template: `%s | ${site.name}` },
  description: "Custom websites from $300 for therapists, counselors and mental-health practices. Thoughtfully designed, clear upfront pricing and a free homepage demo. Based in League City, Texas.",
  applicationName: site.name,
  authors: [{ name: site.person, url: site.url }],
  creator: site.person,
  openGraph: { type: "website", siteName: site.name, locale: "en_US" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Header />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer />
        <MobileBar />
        <Reveal />
        <Magnetic />
        <Tracking />
        <RefTracker />
        <TileJoin />
        <ClarityAnalytics />
      </body>
    </html>
  );
}
