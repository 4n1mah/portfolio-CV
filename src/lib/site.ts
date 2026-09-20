import { profile } from "@/content/sections";

// La URL absoluta del sitio: la necesitan las tarjetas de LinkedIn/WhatsApp, robots.txt y el sitemap.
// En Vercel se puede sobrescribir con NEXT_PUBLIC_SITE_URL sin tocar el código.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? profile.site;
