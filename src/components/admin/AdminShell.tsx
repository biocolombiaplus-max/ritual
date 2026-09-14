"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/secciones", label: "Secciones e imágenes" },
  { href: "/admin/importar", label: "Importar productos" },
  { href: "/admin/pedidos", label: "Pedidos" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-background text-foreground">{children}</div>;
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-64 shrink-0 border-r border-surface-border bg-background-soft hidden md:flex flex-col">
        <div className="p-5 border-b border-surface-border">
          <Logo showTagline={false} />
          <p className="text-[11px] text-muted mt-1">Panel administrativo</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-gradient-rose text-[#1a1216] font-medium"
                    : "text-muted hover:text-foreground hover:bg-surface"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-surface-border space-y-1">
          <Link href="/" className="block px-3 py-2.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface">
            Ver tienda
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="md:hidden border-b border-surface-border">
          <div className="flex items-center justify-between p-4">
            <Logo showTagline={false} />
            <button onClick={handleLogout} className="text-xs text-muted">Salir</button>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 pb-3 text-xs">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 px-3 py-1.5 rounded-full border ${
                  pathname === item.href
                    ? "border-rose-400 text-rose-300"
                    : "border-surface-border text-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
