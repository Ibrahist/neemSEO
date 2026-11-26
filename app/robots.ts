import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://neemseo.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/projects/*/settings"],
    },
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
