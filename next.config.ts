import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/",
        destination: "/words",
        permanent: true, // Uses a 308 permanent redirect for SEO
      },
    ];
  },
};

export default nextConfig;
