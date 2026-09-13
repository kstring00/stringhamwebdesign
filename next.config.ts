import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The pricing page was retired on 2026-09-13 in favour of the "How
      // pricing works" section on the homepage. Permanent, so old links and
      // search results land on the section rather than a 404.
      { source: "/pricing", destination: "/#pricing", permanent: true },
    ];
  },
};

export default nextConfig;
