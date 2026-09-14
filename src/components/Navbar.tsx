"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { useCartStore } from "@/store/cart";
import { FREE_SHIPPING_THRESHOLD, formatCOP } from "@/lib/format";

export default function Navbar({ logoUrl }: { logoUrl?: string | null }) {
  const totalItems = useCartStore((s) => s.totalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-background/90 border-b border-surface-border">
      <div className="bg-gradient-rose text-[#1a1216] text-center text-xs sm:text-sm py-2 px-4 font-medium">
        Envío gratis en compras superiores a {formatCOP(FREE_SHIPPING_THRESHOLD)} · Empaque 100% discreto en todo Colombia
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" aria-label="Ritual.com">
          <Logo imageUrl={logoUrl} />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-rose-300 transition-colors">
            Inicio
          </Link>
          <Link href="/tienda" className="hover:text-rose-300 transition-colors">
            Tienda
          </Link>
          <Link href="/tienda?featured=1" className="hover:text-rose-300 transition-colors">
            Destacados
          </Link>
          <Link href="/contacto" className="hover:text-rose-300 transition-colors">
            Contacto
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleCart}
            className="relative inline-flex items-center justify-center h-10 w-10 rounded-full border border-surface-border hover:border-rose-400 transition-colors"
            aria-label="Abrir carrito"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="9" cy="21" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="18" cy="21" r="1.2" fill="currentColor" stroke="none" />
              <path d="M2.5 3h2.2l1.9 11.2a2 2 0 0 0 2 1.7h8a2 2 0 0 0 1.97-1.64L20.5 7.5H6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-rose-400 text-[#1a1216] text-[11px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          <button
            className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-full border border-surface-border"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menú"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-surface-border px-4 py-3 flex flex-col gap-3 text-sm font-medium bg-background">
          <Link href="/" onClick={() => setMobileOpen(false)}>Inicio</Link>
          <Link href="/tienda" onClick={() => setMobileOpen(false)}>Tienda</Link>
          <Link href="/tienda?featured=1" onClick={() => setMobileOpen(false)}>Destacados</Link>
          <Link href="/contacto" onClick={() => setMobileOpen(false)}>Contacto</Link>
        </nav>
      )}
    </header>
  );
}
