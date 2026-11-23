import type { Metadata, Viewport } from "next";
import { DM_Sans, Outfit } from "next/font/google";

import "./globals.css";
import ClarityAnalytics from "./ClarityAnalytics";
import Footer from "./components/Footer";
import MobileBar from "./components/MobileBar";
import SiteHeader from "./components/SiteHeader";
import Motion from "./motion/Motion";
import Tracking from "./motion/Tracking";
import RefTracker from "./motion/RefTracker";
import { site } from "./data/site";

/* Both faces are self-hosted: next/font downloads them at build and serves
   them from this origin, subset to latin, with no request to Google from a
   visitor's browser. Outfit (variable) is for display: the hero's name and
   every heading. DM Sans (variable, roman) is everything else; the few
   italic words on the site are slanted by the browser, which saves every
   visitor a second font file before the first paint. */
const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  style: ["normal"],
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

/* The browser's own chrome takes the page's colour. */
export const viewport: Viewport = { themeColor: "#0a0908", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <SiteHeader />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer />
        <MobileBar />
        <Motion />
        <Tracking />
        <RefTracker />
        <ClarityAnalytics />
      </body>
    </html>
  );
}
