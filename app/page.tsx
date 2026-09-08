import BottomCapture from "./BottomCapture";
import Header from "./Header";
import HeroShowcase from "./HeroShowcase";
import PricingConfigurator from "./PricingConfigurator";
import SelectedWork from "./SelectedWork";
import SiteFooter from "./SiteFooter";
import SiteMotion from "./SiteMotion";
import ProcessSteps from "./ProcessSteps";

export default function Home() {
  return (
    <>
      <Header />
      <HeroShowcase />

      <main>
        <SelectedWork />
        <PricingConfigurator />
        <ProcessSteps />
        <BottomCapture />
      </main>

      <SiteFooter />
      <SiteMotion />
    </>
  );
}
