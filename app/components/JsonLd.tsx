import { site } from "../data/site";

function Script({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const address = { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.region, addressCountry: "US" };

/** ProfessionalService (a LocalBusiness type) for the LLC. Homepage only. */
export function BusinessJsonLd() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "@id": `${site.url}/#business`,
        name: site.legalName,
        alternateName: site.name,
        url: site.url,
        email: site.email,
        telephone: site.phoneE164,
        image: `${site.url}/opengraph-image.png`,
        address,
        areaServed: [
          { "@type": "City", name: "League City, TX" },
          { "@type": "AdministrativeArea", name: "Greater Houston area, TX" },
          { "@type": "State", name: "Texas" },
        ],
        founder: { "@type": "Person", name: site.person },
        description: "Google listing fixes and simple websites for small local businesses: self storage, RV parks, fishing guides, horse boarding and marinas. League City, Texas.",
        knowsAbout: ["Google Business Profile", "Local business directories", "Small business websites"],
      }}
    />
  );
}
