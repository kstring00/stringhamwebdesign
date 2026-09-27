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
      // Retired public routes.
      { source: "/pricing", destination: "/#faq", statusCode: 301 },
      { source: "/quote", destination: "/contact", statusCode: 301 },
      { source: "/quote/:path*", destination: "/contact", statusCode: 301 },
      { source: "/start", destination: "/contact", statusCode: 301 },
      { source: "/resources", destination: "/", statusCode: 301 },
      { source: "/resources/:path*", destination: "/", statusCode: 301 },
      // There is no Work page: Common Ground is the one project, and it lives
      // on the homepage and the Family Resource Hub page.
      { source: "/work", destination: "/family-resource-hub", statusCode: 301 },
      { source: "/work/:path*", destination: "/family-resource-hub", statusCode: 301 },
      { source: "/portfolio", destination: "/family-resource-hub", statusCode: 301 },
      { source: "/portfolio/:path*", destination: "/family-resource-hub", statusCode: 301 },
      { source: "/faq", destination: "/", statusCode: 301 },
    ];
  },
};

export default nextConfig;
