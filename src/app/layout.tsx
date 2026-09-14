import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import StoreChrome from "@/components/StoreChrome";
import { prisma } from "@/lib/prisma";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ritual.com | Tienda premium para adultos",
  description:
    "Ritual.com — tienda online premium de bienestar y placer para adultos en Colombia. Envío discreto, envío gratis desde $198.000 y cotizador de envíos a todo el país.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  let logoUrl: string | null = null;
  try {
    const logo = await prisma.siteSection.findUnique({ where: { key: "logo" } });
    logoUrl = logo?.imageUrl ?? null;
  } catch {
    logoUrl = null;
  }

  return (
    <html
      lang="es"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <StoreChrome logoUrl={logoUrl}>{children}</StoreChrome>
      </body>
    </html>
  );
}
