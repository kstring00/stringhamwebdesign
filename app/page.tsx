import type { Metadata } from "next";

import { BusinessJsonLd } from "./components/JsonLd";
import { pageMeta } from "./data/meta";
import CaseStudy from "./home/CaseStudy";
import ClosingCta from "./home/ClosingCta";
import CoffeeSlot from "./home/CoffeeSlot";
import DoorsHero from "./home/DoorsHero";
import Faq from "./home/Faq";
import ProcessStory from "./home/ProcessStory";
import WhyBand from "./home/WhyBand";

export const metadata: Metadata = pageMeta({
  absolute: "Websites for Coffee Shops & Autism Clinics | Stringham Web Design, League City TX",
  description: "Custom websites for independent coffee shops and autism therapy clinics, built in League City, Texas by Kyle Stringham. Fixed-price quotes, and you own everything.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <DoorsHero />
      <WhyBand />
      <CaseStudy />
      <CoffeeSlot />
      <ProcessStory />
      <Faq />
      <ClosingCta />
      <BusinessJsonLd />
    </>
  );
}
