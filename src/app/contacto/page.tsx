export default function ContactoPage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center">
      <h1 className="font-display text-3xl sm:text-4xl mb-4">Contáctanos</h1>
      <p className="text-muted mb-8">
        Nuestro equipo te atiende de forma confidencial. Escríbenos y con
        gusto te asesoramos para encontrar el producto ideal.
      </p>
      <div className="flex flex-col items-center gap-3">
        {whatsapp && (
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Escríbenos por WhatsApp
          </a>
        )}
        <a href="mailto:biomarketing.salud@gmail.com" className="btn-secondary">
          Escríbenos por correo
        </a>
      </div>
    </div>
  );
}
