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
      // V3: the site is two worlds (coffee shops, autism clinics). There is no
      // Work or Services page; the projects live on the homepage.
      { source: "/work", destination: "/", statusCode: 301 },
      { source: "/work/:path*", destination: "/", statusCode: 301 },
      { source: "/portfolio", destination: "/", statusCode: 301 },
      { source: "/portfolio/:path*", destination: "/", statusCode: 301 },
      { source: "/services", destination: "/", statusCode: 301 },
      { source: "/services/:path*", destination: "/", statusCode: 301 },
      { source: "/faq", destination: "/", statusCode: 301 },
    ];
  },
};

export default nextConfig;
