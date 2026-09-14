"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";

const STORAGE_KEY = "ritual-age-verified";

export default function AgeGate() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const verified = localStorage.getItem(STORAGE_KEY);
      if (!verified) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    setVisible(false);
  }

  function reject() {
    window.location.href = "https://www.google.com";
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="card max-w-sm w-full p-8 text-center">
        <div className="flex justify-center mb-4">
          <Logo showTagline={false} />
        </div>
        <h2 className="font-display text-2xl mb-2">Contenido para adultos</h2>
        <p className="text-sm text-muted mb-6">
          Este sitio contiene productos exclusivos para mayores de edad.
          Confirma que tienes 18 años o más para continuar. Enviamos todos
          los pedidos en empaque 100% discreto y sin logos visibles.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={accept} className="btn-primary w-full">
            Sí, soy mayor de 18 años
          </button>
          <button onClick={reject} className="btn-secondary w-full">
            No, salir del sitio
          </button>
        </div>
      </div>
    </div>
  );
}
