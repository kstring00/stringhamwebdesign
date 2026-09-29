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
        ],
        founder: { "@id": `${site.url}/about#kyle` },
        description: "Websites, online ordering, booking, and payments for new and growing businesses, built in League City, Texas.",
        knowsAbout: ["Web design", "Online ordering", "Booking and payments", "Google Business Profile", "Family Resource Hub for clinics"],
      }}
    />
  );
}

/** Person schema for Kyle. /about only. */
export function PersonJsonLd() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": `${site.url}/about#kyle`,
        name: site.person,
        url: `${site.url}/about`,
        email: site.email,
        telephone: site.phoneE164,
        jobTitle: "Web designer and developer",
        hasCredential: { "@type": "EducationalOccupationalCredential", name: site.credential },
        worksFor: { "@type": "ProfessionalService", "@id": `${site.url}/#business`, name: site.legalName },
        address,
      }}
    />
  );
}
