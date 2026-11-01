import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Painel administrativo", template: "%s · Painel Mulheres com Visão" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
