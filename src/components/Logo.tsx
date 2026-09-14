import Image from "next/image";

export default function Logo({
  className = "",
  showTagline = true,
  imageUrl,
}: {
  className?: string;
  showTagline?: boolean;
  imageUrl?: string | null;
}) {
  if (imageUrl) {
    return (
      <span className={`inline-flex items-center select-none ${className}`}>
        <Image src={imageUrl} alt="Ritual.com" width={140} height={40} className="h-9 w-auto object-contain" priority />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ritualGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--rose-200)" />
            <stop offset="100%" stopColor="var(--rose-600)" />
          </linearGradient>
        </defs>
        <path
          d="M24 10c-1.2-3-3.8-5-6.4-4.6-1 .1-1.9.7-2.3 1.6-.5 1 0 2.1 1.1 2.3 1.6.3 3.6-1 4.6-2.4"
          stroke="url(#ritualGrad)"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M24 10c1.2-3 3.8-5 6.4-4.6 1 .1 1.9.7 2.3 1.6.5 1 0 2.1-1.1 2.3-1.6.3-3.6-1-4.6-2.4"
          stroke="url(#ritualGrad)"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M24 13c6.5 0 11 4.6 11 10.2 0 5-3.4 8.9-7.8 10.7.4.9.6 1.6.4 2.3-.2.9-1 1.4-1.7.9-.5-.3-.7-1-.9-1.8-.2 1.4-.5 2.9-1 2.9s-.8-1.5-1-2.9c-.2.8-.4 1.5-.9 1.8-.7.5-1.5 0-1.7-.9-.2-.7 0-1.4.4-2.3-4.4-1.8-7.8-5.7-7.8-10.7C13 17.6 17.5 13 24 13Z"
          fill="url(#ritualGrad)"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl tracking-[0.18em] text-gradient-rose font-semibold">
          RITUAL
        </span>
        {showTagline && (
          <span className="text-[9px] tracking-[0.4em] text-muted -mt-0.5">
            .COM
          </span>
        )}
      </span>
    </span>
  );
}
