import type { Metadata, Viewport } from "next";
import { Caveat, Plus_Jakarta_Sans } from "next/font/google";
import { profile } from "@/content/sections";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const script = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
});

const title = "Sadiel Rojas Padilla — Desarrollador de Software";
const description =
  "Portafolio interactivo de Sadiel Rojas Padilla, desarrollador de software enfocado en backend con Python, FastAPI y Next.js.";

// Las tarjetas de LinkedIn, WhatsApp, Slack, etc. necesitan URLs absolutas.
// En Vercel se puede sobrescribir con NEXT_PUBLIC_SITE_URL sin tocar el código.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? profile.site;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  // La imagen de la tarjeta sale de src/app/opengraph-image.jpg (convención de Next).
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Sadiel Rojas Padilla",
    title,
    description:
      "Recorre un lobby isométrico donde cada stand es una sección de mi CV: sobre mí, portafolio, habilidades y experiencia.",
    locale: "es_ES",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#1c2231",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${sans.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
