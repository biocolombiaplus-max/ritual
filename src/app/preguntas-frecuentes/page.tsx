import { FAQS } from "@/lib/faq";

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
