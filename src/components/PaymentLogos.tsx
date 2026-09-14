const METHODS = [
  "Visa",
  "Mastercard",
  "PSE",
  "Nequi",
  "Bancolombia",
  "Daviplata",
  "Addi",
  "Contraentrega",
];

export default function PaymentLogos({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {METHODS.map((m) => (
        <span
          key={m}
          className={`inline-flex items-center justify-center rounded-md border border-surface-border bg-background-soft text-[11px] font-medium tracking-wide text-muted ${
            compact ? "px-2 py-1" : "px-3 py-1.5"
          }`}
        >
          {m}
        </span>
      ))}
    </div>
  );
}
