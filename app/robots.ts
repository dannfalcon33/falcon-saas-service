import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://falconit.xyz/sitemap.xml",
    host: "https://falconit.xyz",
  };
}
