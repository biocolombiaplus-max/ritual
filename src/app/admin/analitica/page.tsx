"use client";

import { useEffect, useState } from "react";

interface FunnelStats {
  pageViews: number;
  visitors: number;
  addedToCart: number;
  beganCheckout: number;
  purchased: number;
  topPages: { path: string; views: number }[];
  daily: { day: string; visitors: number }[];
}

const RANGES = [
  { value: 7, label: "7 días" },
  { value: 30, label: "30 días" },
  { value: 90, label: "90 días" },
];

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

function FunnelStep({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percent = pct(value, total);
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-muted">{label}</span>
        <span className="font-semibold">
          {value} <span className="text-muted font-normal">({percent}%)</span>
        </span>
      </div>
      <div className="h-3 rounded-full bg-background-soft overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(percent, value > 0 ? 3 : 0)}%` }} />
      </div>
    </div>
  );
}

export default function AnaliticaPage() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<FunnelStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?days=${days}`)
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [days]);

  const maxDaily = stats ? Math.max(1, ...stats.daily.map((d) => d.visitors)) : 1;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl">📊 Analítica</h1>
          <p className="text-sm text-muted mt-1">Quién entra a la tienda, quién llega al carrito y quién compra.</p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setDays(r.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-colors ${
                days === r.value ? "bg-gradient-rose text-[#1a1216] border-transparent" : "border-surface-border text-muted"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !stats ? (
        <p className="text-muted text-sm">Cargando...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Vistas de página", value: stats.pageViews },
              { label: "Visitantes únicos", value: stats.visitors },
              { label: "Agregaron al carrito", value: stats.addedToCart },
              { label: "Compraron", value: stats.purchased },
            ].map((c) => (
              <div key={c.label} className="card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{c.label}</p>
                <p className="mt-2 text-2xl font-display">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg mb-5">Embudo de ventas</h2>
            <div className="space-y-4">
              <FunnelStep label="Visitantes" value={stats.visitors} total={stats.visitors} color="bg-rose-400" />
              <FunnelStep label="Agregaron al carrito" value={stats.addedToCart} total={stats.visitors} color="bg-rose-300" />
              <FunnelStep label="Iniciaron el pago" value={stats.beganCheckout} total={stats.visitors} color="bg-amber-400" />
              <FunnelStep label="Compraron" value={stats.purchased} total={stats.visitors} color="bg-emerald-400" />
            </div>
            {stats.visitors === 0 && (
              <p className="text-xs text-muted mt-4">
                Todavía no hay suficiente tráfico en este rango de fechas para calcular el embudo.
              </p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg mb-5">Visitantes por día</h2>
            {stats.daily.length === 0 ? (
              <p className="text-sm text-muted">Sin datos todavía.</p>
            ) : (
              <div className="flex items-end gap-1.5 h-32">
                {stats.daily.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center justify-end gap-1 group relative">
                    <div
                      className="w-full rounded-t bg-gradient-rose min-h-[2px]"
                      style={{ height: `${(d.visitors / maxDaily) * 100}%` }}
                      title={`${d.day}: ${d.visitors} visitantes`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg mb-5">Páginas más vistas</h2>
            {stats.topPages.length === 0 ? (
              <p className="text-sm text-muted">Sin datos todavía.</p>
            ) : (
              <div className="space-y-3">
                {stats.topPages.map((p) => (
                  <div key={p.path} className="flex items-center justify-between text-sm">
                    <span className="text-muted truncate mr-4">{p.path}</span>
                    <span className="font-semibold shrink-0">{p.views}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
