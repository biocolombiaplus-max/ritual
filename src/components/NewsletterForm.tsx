"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="text-rose-300 font-medium text-center">
        ✓ Listo, revisa tu correo — tu código de bienvenida ya viene en camino.
      </p>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="input flex-1"
        />
        <button type="submit" disabled={status === "loading"} className="btn-primary shrink-0 disabled:opacity-60">
          {status === "loading" ? "Enviando..." : "Quiero mi descuento"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-xs text-red-400 mt-2 text-center">No se pudo registrar tu correo, intenta de nuevo.</p>
      )}
    </div>
  );
}
