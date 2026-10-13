"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AgeGate from "./AgeGate";
import CartDrawer from "./CartDrawer";
import WhatsAppFloat from "./WhatsAppFloat";
import AnalyticsTracker from "./AnalyticsTracker";
import MetaPixel from "./MetaPixel";

export default function StoreChrome({
  children,
  logoUrl,
  whatsappNumber,
  metaPixelId,
}: {
  children: React.ReactNode;
  logoUrl?: string | null;
  whatsappNumber?: string | null;
  metaPixelId?: string | null;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <MetaPixel pixelId={metaPixelId ?? null} />
      <AnalyticsTracker />
      <AgeGate />
      <Navbar logoUrl={logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer logoUrl={logoUrl} />
      <CartDrawer />
      <WhatsAppFloat number={whatsappNumber ?? null} />
    </>
  );
}
