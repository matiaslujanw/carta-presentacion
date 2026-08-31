import { LOGO_SRC } from "@/lib/config";

/**
 * Marca Vig.IA. Usa el PNG real si LOGO_SRC está seteado en lib/config.ts;
 * si no, dibuja un wordmark con el mismo criterio del sitio
 * (blanco + acento dorado en ".IA").
 */
export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = {
    sm: { mark: 22, text: "text-[15px]", sub: "text-[7px]" },
    md: { mark: 30, text: "text-[21px]", sub: "text-[8px]" },
    lg: { mark: 42, text: "text-[30px]", sub: "text-[10px]" },
  }[size];

  if (LOGO_SRC) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={LOGO_SRC} alt="Vig.IA" style={{ height: dims.mark * 1.5 }} className="w-auto" />;
  }

  return (
    <div className="flex items-center gap-2.5">
      <svg width={dims.mark} height={dims.mark} viewBox="0 0 40 40" aria-hidden>
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f1cf6b" />
            <stop offset="100%" stopColor="#c08f27" />
          </linearGradient>
        </defs>
        {/* Escudo */}
        <path
          d="M20 2 L36 8 V20 C36 29.5 29.2 35.8 20 38 C10.8 35.8 4 29.5 4 20 V8 Z"
          fill="none"
          stroke="url(#logo-g)"
          strokeWidth="2"
        />
        {/* Ojo / lente */}
        <path
          d="M9.5 20 C 13 14.5 17 12 20 12 C 23 12 27 14.5 30.5 20 C 27 25.5 23 28 20 28 C 17 28 13 25.5 9.5 20 Z"
          fill="none"
          stroke="url(#logo-g)"
          strokeWidth="1.6"
          opacity="0.85"
        />
        <circle cx="20" cy="20" r="4.2" fill="url(#logo-g)" />
        <circle cx="18.5" cy="18.5" r="1.3" fill="#0a0a0b" opacity="0.6" />
      </svg>
      <div className="leading-none">
        <div className={`${dims.text} font-bold tracking-tight text-ink`}>
          Vig<span className="text-goldhi">.IA</span>
        </div>
        <div className={`${dims.sub} mt-1 tracking-[0.22em] text-muted uppercase`}>
          Seguridad con Inteligencia
        </div>
      </div>
    </div>
  );
}
