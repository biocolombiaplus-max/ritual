"use client";

import { useEffect, useMemo, useState } from "react";
import { COLOMBIA_DEPARTMENTS, SHIPPING_RATES, SHIPPING_ETA } from "@/lib/colombia";
import { formatCOP } from "@/lib/format";

interface Rate {
  id: string;
  department: string;
  city: string;
  cost: number;
  etaLabel: string | null;
  active: boolean;
}

const TIER_LABELS: Record<number, string> = {
  1: "Nivel 1 · Local / capital principal",
  2: "Nivel 2 · Ciudad principal",
  3: "Nivel 3 · Ciudad intermedia",
  4: "Nivel 4 · Municipio apartado",
  5: "Nivel 5 · Zona especial",
};

export default function EnviosPage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ department: "", city: "", cost: "", etaLabel: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cities = useMemo(
    () => COLOMBIA_DEPARTMENTS.find((d) => d.name === form.department)?.cities ?? [],
    [form.department]
  );

  async function load() {
    const res = await fetch("/api/admin/shipping-rates");
    const data = await res.json();
    setRates(data.rates ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addRate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.department || !form.cost) {
      setError("Elige el departamento y define un costo.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/shipping-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: form.department,
          city: form.city,
          cost: Number(form.cost),
          etaLabel: form.etaLabel,
        }),
      });
      if (!res.ok) throw new Error();
      setForm({ department: "", city: "", cost: "", etaLabel: "" });
      await load();
    } catch {
      setError("No se pudo guardar la tarifa. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(rate: Rate) {
    await fetch(`/api/admin/shipping-rates/${rate.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !rate.active }),
    });
    load();
  }

  async function removeRate(id: string) {
    if (!confirm("¿Eliminar esta tarifa personalizada? Esa zona volverá a usar la tarifa de referencia.")) return;
    await fetch(`/api/admin/shipping-rates/${id}`, { method: "DELETE" });
    load();
  }

  const grouped = rates.reduce<Record<string, Rate[]>>((acc, r) => {
    (acc[r.department] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-2xl">Envíos por departamento y municipio</h1>
        <p className="text-sm text-muted mt-1">
          Ritual.com opera desde Medellín, con envíos 100% discretos a todo Colombia. Aquí puedes fijar tarifas
          personalizadas para departamentos o municipios específicos (por ejemplo, zonas más costosas de cubrir) —
          todo lo que no configures usa las tarifas de referencia estilo Interrapidísimo/TCC/Servientrega.
        </p>
      </div>

      <div className="card p-6 border-rose-400/40 bg-gradient-to-r from-rose-400/10 to-transparent">
        <h2 className="font-display text-lg mb-2">🏠 Regla automática: mismo día en Medellín</h2>
        <p className="text-sm text-muted">
          Los pedidos con dirección de entrega en <strong className="text-foreground">Medellín</strong> pagados
          antes de las <strong className="text-foreground">3:00 p.m.</strong> muestran automáticamente
          &ldquo;Hoy mismo&rdquo; como tiempo de entrega (después de esa hora, se muestra &ldquo;Mañana antes del
          mediodía&rdquo;). Esta regla de horario no se edita aquí, pero el costo del envío local sí — agrégalo
          abajo eligiendo Antioquia → Medellín.
        </p>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-display text-lg">Agregar / actualizar tarifa</h2>
        <form onSubmit={addRate} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Departamento</label>
            <select
              className="input bg-background"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value, city: "" })}
            >
              <option value="">Selecciona un departamento</option>
              {COLOMBIA_DEPARTMENTS.map((d) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Municipio</label>
            <select
              className="input bg-background"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              disabled={!form.department}
            >
              <option value="">🏢 Todo el departamento (tarifa por defecto)</option>
              {cities.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Costo del envío (COP)</label>
            <input
              inputMode="numeric"
              className="input"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value.replace(/\D/g, "") })}
              placeholder="Ej: 25000"
            />
          </div>
          <div>
            <label className="label">Tiempo estimado (opcional)</label>
            <input
              className="input"
              value={form.etaLabel}
              onChange={(e) => setForm({ ...form, etaLabel: e.target.value })}
              placeholder="Ej: 3 a 5 días hábiles"
            />
          </div>
          {error && <p className="sm:col-span-2 text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary sm:col-span-2 disabled:opacity-50">
            {saving ? "Guardando..." : "+ Guardar tarifa"}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg mb-4">Tarifas personalizadas activas</h2>
        {loading ? (
          <p className="text-sm text-muted">Cargando...</p>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-sm text-muted">
            Todavía no has personalizado ninguna zona — toda Colombia usa las tarifas de referencia (ver tabla abajo).
          </p>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([department, deptRates]) => (
              <div key={department}>
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-300 mb-2">{department}</p>
                <div className="space-y-2">
                  {deptRates.map((r) => (
                    <div
                      key={r.id}
                      className={`flex flex-wrap items-center gap-3 rounded-lg border p-3 ${
                        r.active ? "border-surface-border" : "border-surface-border opacity-50"
                      }`}
                    >
                      <div className="flex-1 min-w-[10rem]">
                        <p className="text-sm font-medium">{r.city || "🏢 Todo el departamento"}</p>
                        {r.etaLabel && <p className="text-xs text-muted">{r.etaLabel}</p>}
                      </div>
                      <p className="font-display text-rose-300">{formatCOP(r.cost)}</p>
                      <label className="flex items-center gap-1.5 text-xs text-muted">
                        <input type="checkbox" checked={r.active} onChange={() => toggleActive(r)} />
                        Activa
                      </label>
                      <button type="button" onClick={() => removeRate(r.id)} className="text-xs font-semibold text-red-400">
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg mb-2">Tarifas de referencia (sin personalizar)</h2>
        <p className="text-sm text-muted mb-4">
          Se aplican automáticamente en cualquier zona sin tarifa personalizada, según su nivel de cobertura.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {([1, 2, 3, 4, 5] as const).map((tier) => (
            <div key={tier} className="flex items-center justify-between rounded-lg border border-surface-border p-3">
              <div>
                <p className="text-sm font-medium">{TIER_LABELS[tier]}</p>
                <p className="text-xs text-muted">{SHIPPING_ETA[tier]}</p>
              </div>
              <p className="font-display text-rose-300">{formatCOP(SHIPPING_RATES[tier])}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
