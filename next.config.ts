import type { NextConfig } from "next";

// Locale prefixes that have their own pages under /[lang]. English lives at the root.
const PREFIXED = "zh|zh-tw|ja|ko|es|fr|de|pt|ru";

const nextConfig: NextConfig = {
  experimental: {
    // Two root layouts (app/(en) and app/[lang]) => unmatched URLs use app/global-not-found.tsx.
    globalNotFound: true,
  },
  async redirects() {
    return [
      // English is served at the root; /en and old /en/* URLs move there.
      { source: "/en", destination: "/", statusCode: 301 },
      { source: "/en/:path*", destination: "/:path*", statusCode: 301 },
      // Pricing is a section of the home page, not a separate page.
      { source: "/pricing", destination: "/#pricing", statusCode: 301 },
      { source: `/:lang(${PREFIXED})/pricing`, destination: "/:lang#pricing", statusCode: 301 },
    ];
  },
};

export default nextConfig;
