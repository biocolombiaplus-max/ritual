"use client";

import { useEffect, useMemo, useState } from "react";
import { COLOMBIA_DEPARTMENTS } from "@/lib/colombia";
import { formatCOP } from "@/lib/format";

interface Quote {
  cost: number;
  etaLabel: string;
  free: boolean;
}

export default function ShippingCalculator({
  subtotal = 0,
  onChange,
}: {
  subtotal?: number;
  onChange?: (v: { department: string; city: string; cost: number; eta: string }) => void;
}) {
  const [department, setDepartment] = useState("");
  const [city, setCity] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);

  const cities = useMemo(
    () => COLOMBIA_DEPARTMENTS.find((d) => d.name === department)?.cities ?? [],
    [department]
  );

  useEffect(() => {
    if (!department || !city) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ department, city, subtotal: String(subtotal) });
    fetch(`/api/shipping/quote?${params}`)
      .then((r) => r.json())
      .then((data: Quote) => {
        if (cancelled) return;
        setQuote(data);
        onChange?.({ department, city, cost: data.cost, eta: data.etaLabel });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, city, subtotal]);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Departamento</label>
          <select
            className="input"
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setCity("");
            }}
          >
            <option value="">Selecciona tu departamento</option>
            {COLOMBIA_DEPARTMENTS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Ciudad / Municipio</label>
          <select
            className="input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={!department}
          >
            <option value="">
              {department ? "Selecciona tu ciudad" : "Elige un departamento primero"}
            </option>
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="card p-4 text-sm text-muted animate-fade-in">Calculando tu envío...</div>
      )}

      {!loading && quote && (
        <div className="card p-4 animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm">
                Envío a <span className="font-medium">{city}, {department}</span>
              </p>
              <p className="text-xs text-muted mt-1">
                Tiempo estimado: <span className="text-rose-300">{quote.etaLabel}</span>
              </p>
            </div>
            <p className="font-display text-xl text-rose-300 shrink-0">
              {quote.free ? "Gratis" : formatCOP(quote.cost)}
            </p>
          </div>
          <p className="text-[11px] text-muted mt-3 pt-3 border-t border-surface-border flex items-center gap-1.5">
            🔒 Empaque 100% discreto — sin logos ni referencia al contenido, en toda Colombia.
          </p>
        </div>
      )}
    </div>
  );
}
