import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The client portal was removed in the 2026-09 rebuild. Every old
      // entry point lands on the homepage, permanently.
      { source: "/portal", destination: "/", permanent: true },
      { source: "/portal/:path*", destination: "/", permanent: true },
      { source: "/admin", destination: "/", permanent: true },
      { source: "/admin/:path*", destination: "/", permanent: true },
      { source: "/login", destination: "/", permanent: true },
      // Retired public routes.
      { source: "/pricing", destination: "/#faq", permanent: true },
      { source: "/quote", destination: "/contact", permanent: true },
      { source: "/quote/:path*", destination: "/contact", permanent: true },
      { source: "/start", destination: "/contact", permanent: true },
      { source: "/resources", destination: "/", permanent: true },
      { source: "/resources/:path*", destination: "/", permanent: true },
      { source: "/work/:slug", destination: "/work", permanent: true },
    ];
  },
};

export default nextConfig;
