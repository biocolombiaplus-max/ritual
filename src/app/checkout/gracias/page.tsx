import Link from "next/link";
import { formatCOP } from "@/lib/format";

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; total?: string }>;
}) {
  const { code, total } = await searchParams;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const message = encodeURIComponent(
    `Hola Ritual.com, acabo de confirmar mi pedido ${code ?? ""}. Quedo atento para coordinar el pago y el envío.`
  );

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-24 text-center">
      <div className="text-5xl mb-6">🌹</div>
      <h1 className="font-display text-3xl mb-3">¡Gracias por tu pedido!</h1>
      <p className="text-muted mb-6">
        Hemos recibido tu pedido{" "}
        <span className="text-rose-300 font-medium">{code}</span>. En breve
        te contactaremos para confirmar el pago y coordinar tu envío 100%
        discreto.
      </p>
      {total && (
        <p className="font-display text-2xl mb-8">
          Total: <span className="text-rose-300">{formatCOP(Number(total))}</span>
        </p>
      )}
      <div className="flex flex-col gap-3">
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full"
          >
            Confirmar por WhatsApp
          </a>
        )}
        <Link href="/tienda" className="btn-secondary w-full">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
