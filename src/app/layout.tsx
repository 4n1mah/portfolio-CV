import type { Metadata, Viewport } from "next";
import { Caveat, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { siteUrl } from "@/lib/site";
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

// Estos textos son los únicos que no siguen el idioma del visitante: se generan en el servidor,
// antes de saber quién abre la página. Van en inglés porque es lo que ve Google y lo que muestra
// la tarjeta de LinkedIn, donde el público es internacional.
const title = "Sadiel Rojas Padilla — Backend Developer";
const description =
  "Backend developer (Python, FastAPI, PostgreSQL) from the Dominican Republic. An isometric lobby where every stand is a section of my CV.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  // La imagen de la tarjeta sale de src/app/opengraph-image.jpg (convención de Next).
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Sadiel Rojas Padilla",
    title,
    description:
      "Walk through an isometric lobby where every stand is a section of my CV: about me, portfolio, skills and experience.",
    locale: "en_US",
    alternateLocale: "es_ES",
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
      <body>
        {children}
        {/* Métricas de tráfico de Vercel: solo cuenta páginas vistas, sin cookies. */}
        <Analytics />
      </body>
    </html>
  );
}
