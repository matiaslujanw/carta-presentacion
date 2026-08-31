/**
 * Escenas placeholder de cámara, dibujadas en SVG.
 *
 * Son 100% autocontenidas (no piden red) y están calibradas para leerse
 * como un feed nocturno de CCTV. Se reemplazan por fotos o video reales
 * seteando `image` / `video` en lib/config.ts — ver comentario ahí.
 */

type SceneProps = { uid: string };

const VB = "0 0 640 360";

/* ── CAM 01 — Hall / Entrada principal ─────────────────────────── */
export function HallScene({ uid }: SceneProps) {
  const g = (n: string) => `${uid}-${n}`;
  return (
    <svg viewBox={VB} className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={g("floor")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1915" />
          <stop offset="100%" stopColor="#0b0a08" />
        </linearGradient>
        <linearGradient id={g("wall")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#141210" />
          <stop offset="55%" stopColor="#211e18" />
          <stop offset="100%" stopColor="#121009" />
        </linearGradient>
        <radialGradient id={g("pool")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#d8b877" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#d8b877" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={g("street")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d2830" />
          <stop offset="100%" stopColor="#080c0e" />
        </linearGradient>
      </defs>

      <rect width="640" height="360" fill={`url(#${g("wall")})`} />
      {/* Cielorraso */}
      <rect width="640" height="52" fill="#0c0b09" />
      <rect y="50" width="640" height="2" fill="#2a251c" />
      {[120, 320, 520].map((x) => (
        <g key={x}>
          <rect x={x - 34} y="26" width="68" height="7" rx="3" fill="#e8d3a2" opacity="0.72" />
          <ellipse cx={x} cy="30" rx="80" ry="26" fill={`url(#${g("pool")})`} />
        </g>
      ))}

      {/* Piso en perspectiva */}
      <polygon points="0,196 640,196 640,360 0,360" fill={`url(#${g("floor")})`} />
      {[0, 90, 180, 270, 360, 450, 540, 640].map((x, i) => (
        <line
          key={i}
          x1={x}
          y1="360"
          x2={200 + (x - 200) * 0.34}
          y2="196"
          stroke="#3a3225"
          strokeWidth="1"
          opacity="0.42"
        />
      ))}
      {[210, 240, 280, 330, 396, 360].slice(0, 5).map((y, i) => (
        <line key={i} x1="0" y1={y} x2="640" y2={y} stroke="#3a3225" strokeWidth="1" opacity="0.3" />
      ))}
      {/* Reflejos de las luces en el piso pulido */}
      {[120, 320, 520].map((x) => (
        <ellipse key={x} cx={200 + (x - 200) * 0.55} cy="250" rx="46" ry="34" fill={`url(#${g("pool")})`} opacity="0.5" />
      ))}

      {/* Puertas de vidrio al frente, con la calle atrás */}
      <rect x="222" y="82" width="196" height="118" fill="#0a0c0e" />
      <rect x="228" y="88" width="86" height="106" fill={`url(#${g("street")})`} opacity="0.55" />
      <rect x="326" y="88" width="86" height="106" fill={`url(#${g("street")})`} opacity="0.55" />
      <rect x="318" y="82" width="4" height="118" fill="#171512" />
      <rect x="222" y="82" width="196" height="118" fill="none" stroke="#2f2a20" strokeWidth="3" />
      {/* Faroles de la calle vistos por el vidrio */}
      <circle cx="252" cy="118" r="8" fill="#f0dca8" opacity="0.34" />
      <circle cx="252" cy="118" r="20" fill="#f0dca8" opacity="0.12" />
      <circle cx="390" cy="130" r="5" fill="#8fb6c9" opacity="0.4" />
      <rect x="236" y="168" width="60" height="26" fill="#1b2a33" opacity="0.7" />

      {/* Mostrador de recepción */}
      <rect x="20" y="176" width="150" height="70" rx="3" fill="#1a1712" stroke="#302a20" />
      <rect x="20" y="176" width="150" height="9" fill="#3a3223" />
      <rect x="36" y="196" width="42" height="26" rx="2" fill="#0d1114" stroke="#2a3138" />
      <rect x="40" y="200" width="34" height="18" fill="#213039" opacity="0.9" />

      {/* Ascensores */}
      <rect x="468" y="96" width="140" height="104" fill="#100e0b" stroke="#2b261d" strokeWidth="2" />
      <rect x="476" y="104" width="60" height="96" fill="#1c1913" />
      <rect x="542" y="104" width="60" height="96" fill="#1c1913" />
      <rect x="536" y="104" width="4" height="96" fill="#0a0908" />
      <circle cx="614" cy="112" r="4" fill="#d4a13a" opacity="0.8" />

      {/* Planta */}
      <rect x="432" y="176" width="24" height="26" rx="2" fill="#211d16" />
      <path d="M444 176 C 430 158 428 142 440 132 C 448 146 448 162 444 176 Z" fill="#1e2a1c" />
      <path d="M444 176 C 458 160 464 146 456 134 C 446 148 442 162 444 176 Z" fill="#243021" />

      {/* Vignette */}
      <rect width="640" height="360" fill="url(#vig-common)" opacity="0" />
    </svg>
  );
}

/* ── CAM 02 — Cochera / Acceso vehicular ───────────────────────── */
export function CocheraScene({ uid }: SceneProps) {
  const g = (n: string) => `${uid}-${n}`;
  return (
    <svg viewBox={VB} className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={g("slab")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#191c1e" />
          <stop offset="100%" stopColor="#0b0c0d" />
        </linearGradient>
        <radialGradient id={g("tube")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#bcd3dd" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#bcd3dd" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="640" height="360" fill="#0e1011" />
      {/* Losa y columnas */}
      <rect width="640" height="46" fill="#141618" />
      <rect y="44" width="640" height="2" fill="#232729" />
      {[110, 330, 552].map((x) => (
        <g key={x}>
          <rect x={x - 40} y="20" width="80" height="6" rx="2" fill="#d3e5ee" opacity="0.62" />
          <ellipse cx={x} cy="26" rx="96" ry="40" fill={`url(#${g("tube")})`} />
        </g>
      ))}

      <polygon points="0,182 640,182 640,360 0,360" fill={`url(#${g("slab")})`} />
      <rect x="0" y="178" width="640" height="5" fill="#202426" />

      {/* Columnas estructurales */}
      {[
        [58, 96],
        [470, 88],
      ].map(([x, w], i) => (
        <g key={i}>
          <rect x={x} y="46" width={w} height="140" fill="#171a1c" stroke="#24282b" />
          <rect x={x} y="150" width={w} height="14" fill="#c9a227" opacity="0.18" />
          <rect x={x} y="168" width={w} height="8" fill="#1f2325" />
        </g>
      ))}

      {/* Autos estacionados */}
      <g opacity="0.95">
        <path d="M182 178 l14 -30 h74 l20 30 z" fill="#1b2023" stroke="#2b3236" />
        <rect x="176" y="176" width="126" height="26" rx="7" fill="#20262a" stroke="#2e3538" />
        <circle cx="200" cy="203" r="10" fill="#0c0e10" />
        <circle cx="282" cy="203" r="10" fill="#0c0e10" />
        <rect x="196" y="154" width="60" height="20" rx="3" fill="#0f1518" opacity="0.9" />
        <rect x="178" y="184" width="10" height="7" rx="2" fill="#e7d5a8" opacity="0.55" />
      </g>
      <g opacity="0.8">
        <path d="M356 172 l12 -26 h64 l17 26 z" fill="#191d20" stroke="#262c30" />
        <rect x="350" y="170" width="110" height="23" rx="6" fill="#1d2226" stroke="#2a3034" />
        <circle cx="372" cy="194" r="9" fill="#0b0d0f" />
        <circle cx="440" cy="194" r="9" fill="#0b0d0f" />
      </g>

      {/* Marcas de piso y rampa */}
      {[
        [60, 250],
        [200, 262],
        [352, 276],
        [516, 292],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="92" height="4" rx="2" fill="#c9a227" opacity="0.2" />
      ))}
      <polygon points="470,360 640,360 640,208 556,208" fill="#0d0f10" opacity="0.8" />
      <path d="M576 316 l30 -22 l30 22 h-16 v20 h-28 v-20 z" fill="#c9a227" opacity="0.18" />
      {/* Charco con reflejo */}
      <ellipse cx="150" cy="322" rx="70" ry="14" fill="#1b2226" opacity="0.7" />
      <ellipse cx="150" cy="322" rx="40" ry="6" fill="#9fc0cf" opacity="0.09" />
    </svg>
  );
}

/* ── CAM 03 — Perímetro lateral / Rejas (visión IR) ────────────── */
export function PerimetroScene({ uid }: SceneProps) {
  const g = (n: string) => `${uid}-${n}`;
  return (
    <svg viewBox={VB} className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={g("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2422" />
          <stop offset="100%" stopColor="#0c1211" />
        </linearGradient>
        <linearGradient id={g("ground")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#161c19" />
          <stop offset="100%" stopColor="#080b0a" />
        </linearGradient>
        <radialGradient id={g("lamp")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#cfe3d4" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#cfe3d4" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="640" height="360" fill={`url(#${g("sky")})`} />
      {/* Edificio del fondo, del otro lado de la reja */}
      <rect x="0" y="34" width="150" height="182" fill="#101614" />
      {[
        [16, 58],
        [56, 58],
        [96, 58],
        [16, 104],
        [96, 104],
        [56, 150],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="26" height="30" fill="#2c3a33" opacity={i === 3 ? 0.75 : 0.28} />
      ))}
      {/* Farola */}
      <rect x="560" y="42" width="5" height="150" fill="#141a18" />
      <path d="M540 44 h44 l-6 12 h-32 z" fill="#1b241f" />
      <ellipse cx="562" cy="56" rx="70" ry="52" fill={`url(#${g("lamp")})`} />

      {/* Vereda / suelo */}
      <polygon points="0,214 640,196 640,360 0,360" fill={`url(#${g("ground")})`} />
      <path d="M0 214 L640 196" stroke="#2b3630" strokeWidth="2" />
      {[
        [0, 262, 640, 250],
        [0, 306, 640, 296],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#242e29" strokeWidth="1.5" opacity="0.7" />
      ))}
      {[80, 210, 340, 470, 600].map((x, i) => (
        <line key={i} x1={x} y1="360" x2={x - 26} y2="200" stroke="#242e29" strokeWidth="1.2" opacity="0.5" />
      ))}

      {/* Muro bajo + reja vertical: el punto de intrusión */}
      <rect x="150" y="186" width="490" height="30" fill="#151b18" stroke="#28322c" />
      <rect x="150" y="182" width="490" height="6" fill="#1e2724" />
      {/* Barrotes */}
      {Array.from({ length: 27 }, (_, i) => 156 + i * 18).map((x) => (
        <g key={x}>
          <rect x={x} y="44" width="4" height="144" fill="#46534b" />
          <path d={`M${x - 3} 46 l5 -9 l5 9 z`} fill="#4a5850" />
        </g>
      ))}
      <rect x="150" y="70" width="490" height="5" fill="#39443d" />
      <rect x="150" y="150" width="490" height="5" fill="#39443d" />
      {/* Postes de la reja */}
      {[152, 332, 512, 632].map((x) => (
        <rect key={x} x={x} y="30" width="9" height="158" fill="#46534b" />
      ))}

      {/* Arbustos al pie de la reja */}
      {[
        [200, 208, 54],
        [300, 210, 42],
        [430, 212, 60],
        [560, 214, 46],
      ].map(([cx, cy, r], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.42} fill="#151d18" />
          <ellipse cx={cx - r * 0.3} cy={cy - 4} rx={r * 0.55} ry={r * 0.3} fill="#1b2620" opacity="0.9" />
        </g>
      ))}
    </svg>
  );
}

/* ── CAM 04 — Vista del propio Tótem de Seguridad ──────────────── */
export function TotemScene({ uid }: SceneProps) {
  const g = (n: string) => `${uid}-${n}`;
  return (
    <svg viewBox={VB} className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={g("night")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b242e" />
          <stop offset="100%" stopColor="#0e1216" />
        </linearGradient>
        <linearGradient id={g("walk")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#282c30" />
          <stop offset="100%" stopColor="#131518" />
        </linearGradient>
        <radialGradient id={g("glow")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#f1cf6b" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f1cf6b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={g("door")} cx="0.5" cy="0.2" r="0.8">
          <stop offset="0%" stopColor="#e8d3a2" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#e8d3a2" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="640" height="360" fill={`url(#${g("night")})`} />

      {/* Fachada del edificio */}
      <rect x="0" y="0" width="424" height="238" fill="#161d23" />
      <rect x="0" y="0" width="424" height="238" fill="none" stroke="#1a2024" />
      {Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 5 }, (_, c) => {
          const lit = (r * 5 + c) % 7 === 2;
          return (
            <rect
              key={`${r}-${c}`}
              x={28 + c * 78}
              y={22 + r * 46}
              width="44"
              height="28"
              fill={lit ? "#d9c48f" : "#1a2226"}
              opacity={lit ? 0.5 : 0.62}
            />
          );
        }),
      )}
      {/* Entrada iluminada */}
      <rect x="140" y="150" width="110" height="88" fill="#141a1e" stroke="#232b31" strokeWidth="2" />
      <rect x="148" y="158" width="94" height="80" fill="#22271f" opacity="0.45" />
      <ellipse cx="195" cy="176" rx="86" ry="60" fill={`url(#${g("door")})`} />
      <rect x="150" y="140" width="90" height="7" rx="2" fill="#e8d3a2" opacity="0.6" />

      {/* Árbol */}
      <rect x="386" y="176" width="8" height="62" fill="#12171a" />
      <ellipse cx="390" cy="158" rx="44" ry="34" fill="#101714" />
      <ellipse cx="372" cy="150" rx="26" ry="20" fill="#141c18" />

      {/* Vereda */}
      <polygon points="0,236 640,224 640,360 0,360" fill={`url(#${g("walk")})`} />
      <path d="M0 236 L640 224" stroke="#242a2d" strokeWidth="2" />
      {[268, 308, 352].map((y, i) => (
        <line key={i} x1="0" y1={y} x2="640" y2={y - 10} stroke="#20262a" strokeWidth="1.2" opacity="0.6" />
      ))}

      {/* ── EL TÓTEM ── */}
      <g>
        {/* Halo en el piso */}
        <ellipse cx="500" cy="332" rx="96" ry="26" fill={`url(#${g("glow")})`} opacity="0.55" />
        {/* Base */}
        <rect x="464" y="318" width="74" height="16" rx="4" fill="#15181b" stroke="#262c31" />
        {/* Cuerpo */}
        <rect x="476" y="122" width="50" height="200" rx="7" fill="#12151a" stroke="#2b323a" strokeWidth="2" />
        <rect x="482" y="128" width="10" height="188" rx="4" fill="#1b2028" opacity="0.9" />
        {/* Cabezal con cámara */}
        <rect x="466" y="82" width="70" height="46" rx="9" fill="#171b21" stroke="#39424c" strokeWidth="2" />
        <circle cx="501" cy="104" r="15" fill="#05070a" stroke="#4b5561" strokeWidth="2" />
        <circle cx="501" cy="104" r="7" fill="#0b1a24" />
        <circle cx="497" cy="100" r="2.6" fill="#9fc0cf" opacity="0.8" />
        {/* Anillo de LEDs IR */}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <circle
              key={i}
              cx={501 + Math.cos(a) * 20}
              cy={104 + Math.sin(a) * 12}
              r="1.9"
              fill="#ff5c5c"
              opacity="0.5"
            />
          );
        })}
        {/* Pantalla con la marca */}
        <rect x="481" y="146" width="40" height="52" rx="4" fill="#0a0d12" stroke="#39424c" />
        <text
          x="501"
          y="168"
          textAnchor="middle"
          fill="#f1cf6b"
          fontSize="13"
          fontFamily="Inter, sans-serif"
          fontWeight="700"
          opacity="0.92"
        >
          Vig
        </text>
        <text
          x="501"
          y="184"
          textAnchor="middle"
          fill="#f1cf6b"
          fontSize="13"
          fontFamily="Inter, sans-serif"
          fontWeight="700"
          opacity="0.92"
        >
          .IA
        </text>
        {/* Parlante / altoparlante */}
        {[214, 222, 230, 238].map((y) => (
          <rect key={y} x="484" y={y} width="34" height="3" rx="1.5" fill="#2f3740" />
        ))}
        {/* Botón de pánico */}
        <circle cx="501" cy="264" r="11" fill="#2a1112" stroke="#7d2a2a" strokeWidth="2" />
        <circle cx="501" cy="264" r="5" fill="#ff3535" opacity="0.7" />
        {/* Franja dorada de estado */}
        <rect x="476" y="292" width="50" height="4" fill="#d4a13a" opacity="0.75" />
      </g>
    </svg>
  );
}

/* ── Silueta del sospechoso trepando la reja ───────────────────── */
export function IntruderSilhouette() {
  return (
    <svg viewBox="0 0 120 200" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      <g fill="#050706" stroke="#0b0f0d" strokeWidth="1">
        {/* Cabeza con capucha */}
        <path d="M54 22 C 44 22 38 30 38 40 C 38 48 42 54 48 57 L 66 55 C 72 50 74 42 72 34 C 70 26 63 22 54 22 Z" />
        {/* Torso inclinado hacia la reja */}
        <path d="M48 55 C 40 62 34 78 34 96 L 38 132 L 74 130 L 78 96 C 78 76 72 60 66 54 Z" />
        {/* Brazo agarrando arriba */}
        <path d="M64 60 C 74 54 86 40 92 26 L 100 30 C 94 48 82 64 70 72 Z" />
        {/* Brazo bajo, sosteniendo */}
        <path d="M40 66 C 30 74 22 88 20 102 L 28 106 C 32 92 40 82 48 76 Z" />
        {/* Pierna flexionada, apoyada en el barrote */}
        <path d="M40 128 C 32 142 26 156 26 172 L 38 174 C 40 158 46 146 52 136 Z" />
        {/* Pierna estirada */}
        <path d="M66 128 C 72 144 78 158 86 168 L 96 162 C 88 150 82 138 78 126 Z" />
        {/* Mochila */}
        <path d="M32 74 C 24 80 22 96 26 110 L 36 106 C 34 94 34 82 38 78 Z" />
      </g>
    </svg>
  );
}

export const SCENES = {
  hall: HallScene,
  cochera: CocheraScene,
  perimetro: PerimetroScene,
  totem: TotemScene,
} as const;
