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
      { source: "/pricing", destination: "/#prices", statusCode: 301 },
      { source: "/quote", destination: "/#free-check", statusCode: 301 },
      { source: "/quote/:path*", destination: "/#free-check", statusCode: 301 },
      { source: "/start", destination: "/#free-check", statusCode: 301 },
      { source: "/resources", destination: "/", statusCode: 301 },
      { source: "/resources/:path*", destination: "/", statusCode: 301 },
      // There is no Work page; the project lives on the homepage.
      { source: "/work", destination: "/", statusCode: 301 },
      { source: "/work/:path*", destination: "/", statusCode: 301 },
      { source: "/portfolio", destination: "/", statusCode: 301 },
      { source: "/portfolio/:path*", destination: "/", statusCode: 301 },
      { source: "/services/:path+", destination: "/#prices", statusCode: 301 },
      { source: "/faq", destination: "/#questions", statusCode: 301 },
      // The conversion-first rebuild (2026-10): one home page does the work.
      { source: "/services", destination: "/#prices", statusCode: 301 },
      { source: "/about", destination: "/#about", statusCode: 301 },
      { source: "/about/:path*", destination: "/#about", statusCode: 301 },
      { source: "/contact", destination: "/#free-check", statusCode: 301 },
      { source: "/contact/:path*", destination: "/#free-check", statusCode: 301 },
      // V3's two niche pages folded into /services and the hub.
      { source: "/coffee-shops", destination: "/", statusCode: 301 },
      { source: "/coffee-shops/:path*", destination: "/", statusCode: 301 },
      { source: "/autism-clinics", destination: "/family-resource-hub", statusCode: 301 },
      { source: "/autism-clinics/:path*", destination: "/family-resource-hub", statusCode: 301 },
    ];
  },
};

export default nextConfig;
