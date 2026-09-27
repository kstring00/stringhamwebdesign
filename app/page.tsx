import type { Metadata } from "next";

import ClosingCta from "./home/ClosingCta";
import Faq from "./home/Faq";
import FeaturedWork from "./home/FeaturedWork";
import Hero from "./home/Hero";
import ProcessStory from "./home/ProcessStory";
import ServicesPreview from "./home/ServicesPreview";
import Statement from "./home/Statement";
import Marquee from "./motion/Marquee";

export const metadata: Metadata = {
  title: { absolute: "Custom Web Design in League City, TX | Stringham Web Design" },
  description: "Custom, beautifully crafted websites for clinics, cafés, and the businesses people love. Built in League City, Texas by Kyle Stringham, and owned outright by you.",
  alternates: { canonical: "/" },
};

const INDUSTRIES = ["Behavioral health clinics", "Coffee shops", "Coaches", "Storage facilities", "Course creators", "Local shops", "Nonprofits"] as const;

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee items={INDUSTRIES} label="Who I build for" />
      <FeaturedWork />
      <Statement />
      <ServicesPreview />
      <ProcessStory />
      <Faq />
      <ClosingCta />
    </>
  );
}
