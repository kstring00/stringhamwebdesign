import { site, studioWhat } from "../data/site";

function Script({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const address = { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.region, addressCountry: "US" };

/** An Article, for a blog post: Kyle as the author, the LLC as the publisher. */
export function ArticleJsonLd({ title, description, slug, date, author }: { title: string; description: string; slug: string; date: string; author: string }) {
  const url = `${site.url}/blog/${slug}`;
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        datePublished: date,
        dateModified: date,
        inLanguage: "en-US",
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        url,
        image: [`${url}/opengraph-image`],
        author: { "@type": "Person", name: author, url: `${site.url}/#about` },
        publisher: { "@type": "Organization", name: site.legalName, url: site.url, logo: { "@type": "ImageObject", url: `${site.url}/brand/logo-square.png` } },
      }}
    />
  );
}

/**
 * ProfessionalService (a LocalBusiness type) for the LLC. Homepage only.
 * It's a web design studio: never a medical or mental-health provider type.
 */
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
        logo: `${site.url}/brand/logo-square.png`,
        address,
        areaServed: ["League City", "Friendswood", "Webster", "Clear Lake", "Kemah", "Dickinson", "Pearland"]
          .map((name) => ({ "@type": "City", name: `${name}, TX` }))
          .concat([{ "@type": "AdministrativeArea", name: "Greater Houston area, TX" }]),
        founder: { "@type": "Person", name: site.person },
        description: `${studioWhat} League City, Texas.`,
        serviceType: "Web design",
        knowsAbout: ["Web design for mental-health practices", "Therapist and counselor websites", "Google Business Profile"],
      }}
    />
  );
}

/** The Free Website Checkup, as a free web application from the LLC. */
export function CheckupJsonLd({ description }: { description: string }) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Free Website Checkup",
        description,
        url: `${site.url}/checkup`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        provider: { "@type": "Organization", name: site.legalName, url: site.url },
      }}
    />
  );
}
