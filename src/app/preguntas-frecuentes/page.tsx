const FAQS = [
  {
    q: "¿El empaque es discreto?",
    a: "Sí. Todos los pedidos se envían en caja o bolsa neutra, sin logos ni referencias al contenido, y la factura tampoco detalla los productos.",
  },
  {
    q: "¿Cuánto cuesta el envío?",
    a: "Depende de tu ciudad. Usa el cotizador en la página de Envíos o en el checkout. Los pedidos superiores al monto de envío gratis no tienen costo de envío.",
  },
  {
    q: "¿A qué ciudades hacen envíos?",
    a: "A los 32 departamentos de Colombia, incluyendo capitales, ciudades intermedias y municipios apartados.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Tarjetas de crédito/débito, PSE, Nequi, Daviplata, Addi y contraentrega según disponibilidad en tu ciudad.",
  },
  {
    q: "¿Puedo cambiar un producto?",
    a: "Por higiene y seguridad, los productos íntimos no tienen cambio una vez abierto el empaque, salvo defecto de fábrica. Contáctanos si tienes algún inconveniente.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="font-display text-3xl sm:text-4xl mb-10 text-center">
        Preguntas frecuentes
      </h1>
      <div className="space-y-4">
        {FAQS.map((f) => (
          <details key={f.q} className="card p-5 group">
            <summary className="cursor-pointer font-medium list-none flex justify-between items-center">
              {f.q}
              <span className="text-rose-300 group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-sm text-muted mt-3">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
