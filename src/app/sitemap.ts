import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Next genera /sitemap.xml con esto: el lobby y las dos versiones del CV.
// lastModified queda con la fecha del despliegue, que es cuando el contenido cambia de verdad.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: siteUrl, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/cv/en`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/cv/es`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}
