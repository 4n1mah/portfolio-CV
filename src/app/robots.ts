import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Next genera /robots.txt con esto. El sitemap se declara aquí para que los buscadores lo encuentren solos.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
