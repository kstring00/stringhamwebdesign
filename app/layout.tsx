import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { startingLine } from "./data/pricing";
import ClarityAnalytics from "./ClarityAnalytics";
import SiteMotion from "./SiteMotion";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * Site-wide defaults. Every page sets its own title and description; what
 * lives here is what they share — the origin every relative URL resolves
 * against, the social card, and the title suffix. app/icon.png,
 * app/apple-icon.png and app/opengraph-image.png are picked up by file
 * convention and need no entry.
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.stringhamwebdesign.com").replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kyle Stringham — Custom Web Design & Development, League City TX",
    template: "%s",
  },
  description:
    `Custom websites for small businesses in League City and the Houston area, from focused sites to advanced builds with integrations, automation, and AI. ${startingLine} Every one is scoped after we talk.`,
  applicationName: "Stringham Web Design",
  authors: [{ name: "Kyle Stringham", url: SITE_URL }],
  creator: "Kyle Stringham",
  openGraph: {
    type: "website",
    siteName: "Stringham Web Design",
    locale: "en_US",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // globals.css sets scroll-behavior: smooth. Next 16 no longer overrides that
    // during route transitions unless told to; without data-scroll-behavior, its
    // scroll-to-top after a client navigation starts a smooth scroll that is
    // cancelled before it lands, and /work opens wherever the previous page was
    // scrolled to.
    <html lang="en" data-scroll-behavior="smooth" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        {children}
        <SiteMotion />
        {/* Usage analytics. Production only, only with NEXT_PUBLIC_CLARITY_ID
            set, never on the portal, and never before the window has loaded. */}
        <ClarityAnalytics />
      </body>
    </html>
  );
}
