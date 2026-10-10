import { site } from "../data/site";

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
        logo: `${site.url}/brand/logo-square.png`,
        address,
        areaServed: ["League City", "Friendswood", "Webster", "Clear Lake", "Kemah", "Dickinson", "Pearland"]
          .map((name) => ({ "@type": "City", name: `${name}, TX` }))
          .concat([{ "@type": "AdministrativeArea", name: "Greater Houston area, TX" }]),
        founder: { "@type": "Person", name: site.person },
        description: "Custom websites and Google listing fixes for independent businesses. League City, Texas.",
        knowsAbout: ["Google Business Profile", "Local business directories", "Small business websites"],
      }}
    />
  );
}
