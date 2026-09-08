import BottomCapture from "./BottomCapture";
import Header from "./Header";
import HeroShowcase from "./HeroShowcase";
import PricingConfigurator from "./PricingConfigurator";
import SelectedWork from "./SelectedWork";
import SiteFooter from "./SiteFooter";
import SiteMotion from "./SiteMotion";
import TimelineShowcase from "./TimelineShowcase";

export default function Home() {
  return (
    <>
      <Header />
      <HeroShowcase />

      <main>
        <SelectedWork />
        <PricingConfigurator />
        <TimelineShowcase />
        <BottomCapture />
      </main>

      <SiteFooter />
      <SiteMotion />
    </>
  );
}
