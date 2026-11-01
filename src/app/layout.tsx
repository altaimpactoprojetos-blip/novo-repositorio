import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getContent } from "@/lib/queries";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getContent("settings");
  const title = s.site_title || "Mulheres com Visão";
  const og = s.og_image || "/brand/banner-original.jpeg";
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${title} — Fé, acolhimento e propósito`, template: `%s · ${title}` },
    description: s.site_description,
    applicationName: title,
    keywords: [
      "Mulheres com Visão",
      "Pastora Elaine Aguiar",
      "Elaine Aguiar",
      "movimento de mulheres",
      "conferência de mulheres",
      "fé",
      "mulheres cristãs",
      "eventos",
    ],
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: title,
      title,
      description: s.site_description,
      images: [{ url: og, width: 900, height: 600, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description: s.site_description, images: [og] },
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#4c0f28",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body className="min-h-dvh">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
