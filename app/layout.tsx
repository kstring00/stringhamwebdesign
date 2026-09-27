import type { Metadata } from "next";
import { Fraunces, Inter_Tight } from "next/font/google";

import "./globals.css";
import ClarityAnalytics from "./ClarityAnalytics";
import Footer from "./components/Footer";
import Header from "./components/Header";
import JsonLd from "./components/JsonLd";
import Cursor from "./motion/Cursor";
import PageTransition from "./motion/PageTransition";
import Reveal from "./motion/Reveal";
import SmoothScroll from "./motion/SmoothScroll";
import { site } from "./data/site";

/* Both faces are self-hosted: next/font downloads them at build and serves
   them from this origin, subset to latin, preloaded, with no request to
   Google from a visitor's browser. */
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  weight: "variable",
  style: ["normal", "italic"],
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
  title: { default: `Custom Web Design in League City, TX | ${site.name}`, template: `%s | ${site.name}` },
  description: "Custom, beautifully crafted websites for clinics, cafés, and the businesses people love. Built in League City, Texas by Kyle Stringham. Owned outright by you.",
  applicationName: site.name,
  authors: [{ name: site.person, url: site.url }],
  creator: site.person,
  openGraph: { type: "website", siteName: site.name, locale: "en_US", url: "/" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${interTight.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Header />
        {/* ScrollSmoother needs a wrapper and a content element; the markup
            is the same whether or not smoothing runs. The header sits
            outside so it stays fixed. */}
        <div id="smooth-wrapper">
          <div id="smooth-content">
            <main id="main" tabIndex={-1}>{children}</main>
            <Footer />
          </div>
        </div>
        <SmoothScroll />
        <Reveal />
        <Cursor />
        <PageTransition />
        <JsonLd />
        <ClarityAnalytics />
      </body>
    </html>
  );
}
