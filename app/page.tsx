import Header from "./Header";
import HeroShowcase from "./HeroShowcase";
import SelectedWork from "./SelectedWork";
import SiteFooter from "./SiteFooter";
import ProcessSteps from "./ProcessSteps";

export default function Home() {
  return (
    <>
      <Header />
      <HeroShowcase />

      <main>
        <SelectedWork />
        <ProcessSteps variant="home" />
      </main>

      <SiteFooter />
    </>
  );
}
