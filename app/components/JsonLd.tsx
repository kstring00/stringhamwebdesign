import { site } from "../data/site";

/** LocalBusiness structured data for the LLC. */
export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    email: site.email,
    telephone: "+1-413-454-3509",
    founder: { "@type": "Person", name: site.person, jobTitle: "Web designer and developer" },
    address: { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.region, addressCountry: "US" },
    areaServed: "United States",
    description: "Custom web design and development for clinics, cafés, and local businesses, based in League City, Texas.",
    priceRange: "$$",
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
