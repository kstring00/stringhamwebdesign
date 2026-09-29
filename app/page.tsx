import type { Metadata } from "next";

import { BusinessJsonLd } from "./components/JsonLd";
import { pageMeta } from "./data/meta";
import { audiences } from "./data/services";
import CasaMatchaSlot from "./home/CasaMatchaSlot";
import CaseStudy from "./home/CaseStudy";
import ClosingCta from "./home/ClosingCta";
import Everything from "./home/Everything";
import Faq from "./home/Faq";
import Hero from "./home/Hero";
import IdeaToReality from "./home/IdeaToReality";
import ProcessStory from "./home/ProcessStory";
import Statement from "./home/Statement";
import Marquee from "./motion/Marquee";

export const metadata: Metadata = pageMeta({
  absolute: "Turn Your Idea Into a Real Business | Stringham Web Design, League City TX",
  description: "Websites, online ordering, booking, payments, and everything else you need to launch and grow, built in League City, Texas by Kyle Stringham. Fixed price in writing, and you own all of it.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee items={audiences} label="Who I work with" />
      <IdeaToReality />
      <Everything />
      <Statement />
      <CaseStudy />
      <CasaMatchaSlot />
      <ProcessStory />
      <Faq />
      <ClosingCta />
      <BusinessJsonLd />
    </>
  );
}
