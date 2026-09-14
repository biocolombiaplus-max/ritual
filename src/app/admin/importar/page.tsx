"use client";

import { useRef, useState } from "react";
import type { ImportRow } from "@/lib/import";

export default function ImportarPage() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setWarning(null);
    setResult(null);
    setParsing(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/import/parse", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo leer el archivo");
      setRows(data.rows ?? []);
      if (data.warning) setWarning(data.warning);
      if ((data.rows ?? []).length === 0) {
        setError("No se encontraron productos en el archivo. Revisa el formato y vuelve a intentar.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al leer el archivo");
    } finally {
      setParsing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function updateRow(i: number, patch: Partial<ImportRow>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function removeRow(i: number) {
    setRows((rs) => rs.filter((_, idx) => idx !== i));
  }

  async function handleCommit() {
    setCommitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al importar");
      setResult(data);
      setRows([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar");
    } finally {
      setCommitting(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl mb-2">Importar productos</h1>
      <p className="text-sm text-muted mb-8 max-w-2xl">
        Sube un archivo con tu catálogo y crea muchos productos a la vez. El
        formato más confiable es <strong>Excel o CSV</strong>, porque cada
        columna corresponde exactamente a una característica del producto
        (nombre, precio, descripción, categoría, stock, etc). También puedes
        subir un <strong>PDF</strong>, pero la lectura es aproximada: siempre
        revisa la vista previa antes de confirmar la importación.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="card p-6">
          <h2 className="font-display text-lg mb-2">1. Descarga la plantilla</h2>
          <p className="text-sm text-muted mb-4">
            Ábrela en Excel o Google Sheets, complétala con tus productos y
            guárdala como <code>.csv</code> o <code>.xlsx</code>. Las
            imágenes van como un enlace (URL) a la foto del producto; si aún
            no tienes las fotos en internet, dejas esa columna vacía y luego
            las subes desde <em>Productos → Editar</em>.
          </p>
          <a href="/plantilla-productos-ritual.csv" download className="btn-secondary">
            Descargar plantilla CSV
          </a>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg mb-2">2. Sube tu archivo</h2>
          <p className="text-sm text-muted mb-4">
            Formatos admitidos: <code>.csv</code>, <code>.xlsx</code> y{" "}
            <code>.pdf</code>. El sistema leerá el archivo y te mostrará una
            vista previa editable antes de crear los productos.
          </p>
          <label className="btn-primary inline-flex cursor-pointer">
            {parsing ? "Leyendo archivo..." : "Elegir archivo"}
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      {warning && (
        <div className="card p-4 mb-6 border-rose-400/40 text-sm text-rose-300">{warning}</div>
      )}
      {error && (
        <div className="card p-4 mb-6 border-red-400/40 text-sm text-red-400">{error}</div>
      )}
      {result && (
        <div className="card p-4 mb-6 text-sm">
          <p className="text-rose-300 font-medium">
            Se importaron {result.created} producto{result.created !== 1 ? "s" : ""} correctamente.
          </p>
          {result.errors.length > 0 && (
            <ul className="text-muted mt-2 list-disc pl-5">
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {rows.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">
              Vista previa — {rows.length} producto{rows.length !== 1 ? "s" : ""}
            </h2>
            <button onClick={handleCommit} disabled={committing} className="btn-primary disabled:opacity-50">
              {committing ? "Importando..." : `Importar ${rows.length} productos`}
            </button>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="text-left text-muted border-b border-surface-border">
                <tr>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Precio antes</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {rows.map((row, i) => (
                  <tr key={i} className={row.needsReview ? "bg-rose-400/5" : ""}>
                    <td className="p-2">
                      <input
                        className="input !py-1.5"
                        value={row.name}
                        onChange={(e) => updateRow(i, { name: e.target.value })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        className="input !py-1.5 w-28"
                        value={row.price ?? ""}
                        onChange={(e) => updateRow(i, { price: Number(e.target.value) || null })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        className="input !py-1.5 w-28"
                        value={row.compareAtPrice ?? ""}
                        onChange={(e) => updateRow(i, { compareAtPrice: Number(e.target.value) || null })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className="input !py-1.5 w-36"
                        value={row.category}
                        onChange={(e) => updateRow(i, { category: e.target.value })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className="input !py-1.5 w-24"
                        value={row.sku}
                        onChange={(e) => updateRow(i, { sku: e.target.value })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        className="input !py-1.5 w-20"
                        value={row.stock}
                        onChange={(e) => updateRow(i, { stock: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <button onClick={() => removeRow(i)} className="text-muted hover:text-red-400 text-xs">
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-3">
            Los productos marcados en rosa necesitan revisión (se detectaron
            con menos certeza). Después de importar, podrás abrir cada
            producto en <em>Productos → Editar</em> para agregar fotos y
            completar la descripción.
          </p>
        </div>
      )}
    </div>
  );
}
