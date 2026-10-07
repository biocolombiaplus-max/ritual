"use client";

import { useEffect, useState } from "react";

export default function ConfiguracionPage() {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setWhatsappNumber(d.whatsappNumber ?? ""))
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNote(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar");
      setWhatsappNumber(data.whatsappNumber ?? "");
      setNote("✅ Guardado. Ya quedó activo en toda la tienda (botón flotante, ficha de producto, carrito y contacto).");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Configuración</h1>

      {loading ? (
        <p className="text-muted text-sm">Cargando...</p>
      ) : (
        <form onSubmit={save} className="card p-6 space-y-4 max-w-lg">
          <h2 className="font-display text-lg">WhatsApp de la tienda</h2>
          <p className="text-sm text-muted">
            Número que reciben todos los mensajes de los botones de WhatsApp del sitio (flotante, ficha de
            producto, carrito, contacto). Formato: indicativo de país + número, sin espacios ni símbolos. Ej:
            Colombia 573228652793.
          </p>
          <div>
            <label className="label">Número de WhatsApp</label>
            <input
              className="input"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="573228652793"
              inputMode="numeric"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar"}
          </button>
          {note && <p className="text-sm text-rose-300">{note}</p>}
        </form>
      )}
    </div>
  );
}
