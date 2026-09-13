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

export const metadata: Metadata = {
  title: "Kyle Stringham — websites",
  description:
    `Custom websites for small businesses, from focused sites to advanced builds with integrations, automation, and AI. ${startingLine} Every one is scoped after we talk.`,
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
