import Header from "./Header";
import HeroShowcase from "./HeroShowcase";
import SelectedWork from "./SelectedWork";
import SiteFooter from "./SiteFooter";
import ProcessSteps from "./ProcessSteps";
import Testimonials from "./Testimonials";
import WhoThisIsFor from "./WhoThisIsFor";

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
