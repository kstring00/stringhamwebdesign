import type { Metadata } from "next";

import Header from "./Header";
import HeroShowcase from "./HeroShowcase";
import SelectedWork from "./SelectedWork";
import SiteFooter from "./SiteFooter";
import ProcessSteps from "./ProcessSteps";
import Testimonials from "./Testimonials";
import WhoThisIsFor from "./WhoThisIsFor";

export const metadata: Metadata = {
  title: "Kyle Stringham — Custom Web Design & Development, League City TX",
  description:
    "Custom websites for small businesses in League City and the Houston area: storage facilities, ABA and counseling practices, course creators, coaches. Fixed price in writing, and you own everything.",
  alternates: { canonical: "/" },
};
export default function Home() {
  return (
    <>
      <Header />
      <HeroShowcase />

      <main>
        <SelectedWork />
        <WhoThisIsFor />
        <ProcessSteps variant="home" />
        {/* Renders nothing while data/testimonials.ts is empty. */}
        <Testimonials />
      </main>

      <SiteFooter />
    </>
  );
}
