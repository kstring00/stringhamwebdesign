import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next/image serves AVIF where the browser takes it, WebP otherwise.
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    return [
      // The client portal was removed in the 2026-09 rebuild. Every old
      // entry point lands on the homepage, permanently.
      { source: "/portal", destination: "/", statusCode: 301 },
      { source: "/portal/:path*", destination: "/", statusCode: 301 },
      { source: "/admin", destination: "/", statusCode: 301 },
      { source: "/admin/:path*", destination: "/", statusCode: 301 },
      { source: "/login", destination: "/", statusCode: 301 },
      // Retired public routes, each to the part of the home page that took over.
      { source: "/pricing", destination: "/#pricing", statusCode: 301 },
      { source: "/quote", destination: "/#quote", statusCode: 301 },
      { source: "/quote/:path*", destination: "/#quote", statusCode: 301 },
      { source: "/start", destination: "/#quote", statusCode: 301 },
      { source: "/contact", destination: "/#quote", statusCode: 301 },
      { source: "/contact/:path*", destination: "/#quote", statusCode: 301 },
      { source: "/resources", destination: "/", statusCode: 301 },
      { source: "/resources/:path*", destination: "/", statusCode: 301 },
      { source: "/portfolio", destination: "/work", statusCode: 301 },
      { source: "/portfolio/:path*", destination: "/work", statusCode: 301 },
      { source: "/services", destination: "/#pricing", statusCode: 301 },
      { source: "/services/:path+", destination: "/#pricing", statusCode: 301 },
      { source: "/faq", destination: "/#faq", statusCode: 301 },
      { source: "/about", destination: "/#about", statusCode: 301 },
      { source: "/about/:path*", destination: "/#about", statusCode: 301 },
      // The 2026-10 rebuild: the portfolio moved from /websites to /work, and
      // the free Google check to its own page.
      { source: "/websites", destination: "/work", statusCode: 301 },
      { source: "/websites/:path*", destination: "/work", statusCode: 301 },
      // The old per-project pages under /work: the portfolio is one page now.
      { source: "/work/:path+", destination: "/work", statusCode: 301 },
      { source: "/free-check", destination: "/google-check", statusCode: 301 },
      // V3's two niche pages folded into /services and the hub.
      { source: "/coffee-shops", destination: "/", statusCode: 301 },
      { source: "/coffee-shops/:path*", destination: "/", statusCode: 301 },
      { source: "/autism-clinics", destination: "/family-resource-hub", statusCode: 301 },
      { source: "/autism-clinics/:path*", destination: "/family-resource-hub", statusCode: 301 },
    ];
  },
};

export default nextConfig;
