import type { Metadata, Viewport } from "next";
import { Caveat, Plus_Jakarta_Sans } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Sadiel Rojas Padilla — Desarrollador de Software",
  description:
    "Portafolio interactivo de Sadiel Rojas Padilla, desarrollador de software enfocado en backend con Python, FastAPI y Next.js.",
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
