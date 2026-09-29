import Link from "next/link";
import Logo from "./Logo";
import PaymentLogos from "./PaymentLogos";

export default function Footer({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <footer className="border-t border-surface-border bg-background-soft mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <Logo imageUrl={logoUrl} />
          <p className="text-sm text-muted mt-4 max-w-xs">
            Tienda online premium de bienestar y placer para adultos en
            Colombia. Calidad, discreción y experiencia de compra rápida.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm tracking-wide">Tienda</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/tienda" className="hover:text-rose-300">Todos los productos</Link></li>
            <li><Link href="/tienda?featured=1" className="hover:text-rose-300">Destacados</Link></li>
            <li><Link href="/carrito" className="hover:text-rose-300">Carrito</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm tracking-wide">Ayuda</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/envios" className="hover:text-rose-300">Envíos y cobertura</Link></li>
            <li><Link href="/contacto" className="hover:text-rose-300">Contacto</Link></li>
            <li><Link href="/preguntas-frecuentes" className="hover:text-rose-300">Preguntas frecuentes</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm tracking-wide">Métodos de pago</h4>
          <PaymentLogos compact />
          <p className="text-xs text-muted mt-4">
            Pago 100% seguro. Facturación discreta, sin referencia al
            contenido del pedido.
          </p>
        </div>
      </div>
      <div className="border-t border-surface-border py-6 text-center text-xs text-muted flex flex-col items-center gap-3">
        <p>© {new Date().getFullYear()} Ritual.com — Todos los derechos reservados. Venta exclusiva a mayores de 18 años.</p>
        <Link
          href="/admin/login"
          className="rounded-full border border-surface-border px-4 py-1.5 text-muted/60 transition-colors hover:border-rose-400/50 hover:text-muted"
        >
          Iniciar sesión
        </Link>
      </div>
    </footer>
  );
}
