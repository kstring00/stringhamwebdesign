import type { Metadata } from "next";
import { Fraunces, Inter_Tight } from "next/font/google";

import "./globals.css";
import ClarityAnalytics from "./ClarityAnalytics";
import Footer from "./components/Footer";
import Header from "./components/Header";
import MobileBar from "./components/MobileBar";
import Magnetic from "./motion/Magnetic";
import Reveal from "./motion/Reveal";
import Tracking from "./motion/Tracking";
import { site } from "./data/site";

/* Both faces are self-hosted: next/font downloads them at build and serves
   them from this origin, subset to latin, with no request to Google from a
   visitor's browser. */
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  weight: "variable",
  style: ["normal"],
  display: "swap",
  variable: "--font-fraunces",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter-tight",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `Web Design in League City, TX | ${site.name}`, template: `%s | ${site.name}` },
  description: "Custom websites for owner-run businesses in League City, Texas, from $2,000 with a fixed written quote and a free demo of your homepage. No ad spend, no contract.",
  applicationName: site.name,
  authors: [{ name: site.person, url: site.url }],
  creator: site.person,
  openGraph: { type: "website", siteName: site.name, locale: "en_US" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${interTight.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Header />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer />
        <MobileBar />
        <Reveal />
        <Magnetic />
        <Tracking />
        <ClarityAnalytics />
      </body>
    </html>
  );
}
