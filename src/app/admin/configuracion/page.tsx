"use client";

import { useEffect, useState } from "react";

export default function ConfiguracionPage() {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [metaPixelId, setMetaPixelId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setWhatsappNumber(d.whatsappNumber ?? "");
        setMetaPixelId(d.metaPixelId ?? "");
      })
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
        body: JSON.stringify({ whatsappNumber, metaPixelId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar");
      setWhatsappNumber(data.whatsappNumber ?? "");
      setMetaPixelId(data.metaPixelId ?? "");
      setNote("✅ Guardado y activo en toda la tienda.");
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
        <form onSubmit={save} className="card p-6 space-y-6 max-w-lg">
          <div className="space-y-4">
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
          </div>

          <div className="space-y-4 border-t border-surface-border pt-6">
            <h2 className="font-display text-lg">Meta Pixel (Facebook / Instagram Ads)</h2>
            <p className="text-sm text-muted">
              ID del píxel de Meta para medir y optimizar tus campañas de Facebook/Instagram. Se activa en todo el
              sitio y registra automáticamente vista de producto, agregar al carrito, inicio de pago y compra. Lo
              encuentras en Meta Events Manager. Déjalo vacío para desactivarlo.
            </p>
            <div>
              <label className="label">Meta Pixel ID</label>
              <input
                className="input"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
                placeholder="1123707206793994"
                inputMode="numeric"
              />
            </div>
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
