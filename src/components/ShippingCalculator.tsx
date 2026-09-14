"use client";

import { useMemo, useState } from "react";
import { COLOMBIA_DEPARTMENTS, quoteShipping } from "@/lib/colombia";
import { formatCOP, FREE_SHIPPING_THRESHOLD } from "@/lib/format";

export default function ShippingCalculator({
  subtotal = 0,
  onChange,
}: {
  subtotal?: number;
  onChange?: (v: { department: string; city: string; cost: number; eta: string }) => void;
}) {
  const [department, setDepartment] = useState("");
  const [city, setCity] = useState("");

  const cities = useMemo(
    () => COLOMBIA_DEPARTMENTS.find((d) => d.name === department)?.cities ?? [],
    [department]
  );

  const quote = useMemo(() => {
    if (!department || !city) return null;
    const q = quoteShipping(department, city, subtotal, FREE_SHIPPING_THRESHOLD);
    onChange?.({ department, city, cost: q.cost, eta: q.eta });
    return q;
  }, [department, city, subtotal]); // eslint-disable-line react-hooks/exhaustive-deps

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

      {quote && (
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm">
              Envío a <span className="font-medium">{city}, {department}</span>
            </p>
            <p className="text-xs text-muted mt-1">Tiempo estimado: {quote.eta}</p>
          </div>
          <p className="font-display text-xl text-rose-300">
            {quote.free ? "Gratis" : formatCOP(quote.cost)}
          </p>
        </div>
      )}
    </div>
  );
}
