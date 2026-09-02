"use client";

/**
 * Escenas 6 a 9 del guion: lo que el consorcio usa todos los días.
 *
 * El caso de intrusión (escenas 1 a 5) es el gancho, pero el control de
 * accesos, el tótem del lobby y la trazabilidad son el servicio que el vecino
 * toca a diario. Por eso van como escenas propias, con el mismo peso que la
 * madrugada, y no apretadas al final de un scroll.
 *
 * Los textos salen del guion aprobado, casi literal. El chrome (logo, sonido,
 * progreso y el botón de avance) lo pone Presentation: acá va sólo el contenido
 * de cada escena.
 */

export type ProductSceneKey = "accesos" | "totem" | "lpr" | "trazabilidad";

type Extra = { titulo: string; texto: string; icon: keyof typeof ICONS };

const ICONS = {
  rostro: (
    <>
      <path d="M12 13.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
      <path d="M6.4 19.2a6 6 0 0 1 11.2 0" />
      <path d="M3.2 8V4.8H8M16 3.2h4.8V8M20.8 16v4.8H16M8 20.8H3.2V16" />
    </>
  ),
  palma: (
    <>
      <path d="M9 11V5.2a1.6 1.6 0 0 1 3.2 0V11" />
      <path d="M12.2 10.4V6a1.6 1.6 0 0 1 3.2 0v5" />
      <path d="M15.4 11V7.6a1.6 1.6 0 0 1 3.2 0V14a6.4 6.4 0 0 1-6.4 6.4h-.8A5.6 5.6 0 0 1 5.8 14.8L5 12.6a1.6 1.6 0 0 1 2.9-1.3L9 13.4" />
    </>
  ),
  codigo: (
    <>
      <rect x="4" y="3.5" width="16" height="17" rx="2.4" />
      <path d="M8.5 8h.01M12 8h.01M15.5 8h.01M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" />
    </>
  ),
  camaras: (
    <>
      <path d="M3 7.5 15.5 4.6l1.2 5.2L4.2 12.7Z" />
      <path d="m16.7 7.4 4.3-1.6v6.4l-4.3-1.6" />
      <path d="M6.5 12.9V19M6.5 19h6" />
    </>
  ),
  panico: (
    <>
      <path d="M12 3.4v2.2M4.8 6.4 6.4 8M19.2 6.4 17.6 8" />
      <path d="M5.6 19.6a6.4 6.4 0 0 1 12.8 0Z" />
      <path d="M3.6 19.6h16.8" />
    </>
  ),
  informes: (
    <>
      <path d="M14 3.4H7a1.8 1.8 0 0 0-1.8 1.8v13.6A1.8 1.8 0 0 0 7 20.6h10a1.8 1.8 0 0 0 1.8-1.8V8.2Z" />
      <path d="M14 3.4v4.8h4.8M8.6 12.6h6.8M8.6 16.2h4.4" />
    </>
  ),
  contrato: (
    <>
      <path d="M12 3.2 19.4 6v6c0 4.4-3.1 7.7-7.4 8.8C7.7 19.7 4.6 16.4 4.6 12V6Z" />
      <path d="m9 12.2 2.2 2.2L15.4 10" />
    </>
  ),
  reloj: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.4V12l3.2 2" />
    </>
  ),
} as const;

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 text-goldhi"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  );
}

/* ── Escena 9: el resguardo de los registros ─────────────────────────────
   No hay foto que muestre "trazabilidad", así que se muestra el registro en sí:
   los eventos del día, cada uno sellado, y el resguardo que los cierra.

   Va en HTML y no en SVG a propósito: es una lista de datos, y así la
   tipografía escala con el resto de la página y se lee en un celular. */
const REGISTROS = [
  { hora: "03:14:22", tipo: "Intrusión perimetral", origen: "CAM 03" },
  { hora: "07:41:08", tipo: "Ingreso — rostro", origen: "TÓTEM" },
  { hora: "08:02:55", tipo: "Ingreso — patente", origen: "CAM 02" },
  { hora: "19:26:31", tipo: "Ingreso — rostro", origen: "TÓTEM" },
  { hora: "23:58:04", tipo: "Ronda de verificación", origen: "CAM 01" },
];

function Candado() {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 shrink-0 text-gold/70" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <rect x="2.4" y="6" width="9.2" height="6.4" rx="1.4" />
      <path d="M4.6 6V4.4a2.4 2.4 0 0 1 4.8 0V6" />
    </svg>
  );
}

function ArchiveGraphic() {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          Registro del día
        </p>
        <p className="font-mono text-[11px] text-faint">5 eventos</p>
      </div>

      <ul className="mt-3.5 space-y-2">
        {REGISTROS.map((r) => (
          <li
            key={r.hora}
            className="flex items-center gap-3 rounded-lg border border-line bg-elev px-3 py-2.5"
          >
            <span className="font-mono text-[12.5px] text-muted tabular-nums">{r.hora}</span>
            <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink2">{r.tipo}</span>
            <span className="font-mono text-[11px] text-faint">{r.origen}</span>
            <Candado />
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-gold/30 bg-golddim/25 px-4 py-3.5">
        <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-goldhi" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3.2 19.4 6v6c0 4.4-3.1 7.7-7.4 8.8C7.7 19.7 4.6 16.4 4.6 12V6Z" />
          <path d="m9 12.2 2.2 2.2L15.4 10" />
        </svg>
        <div>
          <p className="text-[11.5px] font-bold tracking-[0.16em] text-goldhi uppercase">
            Resguardado
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink2">
            Períodos establecidos por contrato · Normas legales vigentes
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Contenido de cada escena ─────────────────────────────────────────── */

type SceneData = {
  /** Número de escena del guion, para el rótulo */
  eyebrow: string;
  titulo: string;
  texto: string;
  /**
   * "wide"  — foto 16:10 arriba, texto abajo
   * "tall"  — foto vertical al costado del texto
   * "panel" — el bloque de arriba no es una foto sino un panel de datos, así
   *           que va sin recuadro de aspecto fijo
   */
  layout: "wide" | "tall" | "panel";
  extras?: Extra[];
  /** Línea suelta debajo de los extras */
  pie?: string;
};

const DATA: Record<ProductSceneKey, SceneData> = {
  accesos: {
    eyebrow: "Vigilancia 24/7",
    titulo: "Control de acceso biométrico",
    texto:
      "El propietario y/o usuarios autorizados previamente ingresan al edificio mediante sistema de reconocimiento facial, que permite distintas alternativas según elección.",
    layout: "wide",
    extras: [
      { titulo: "Identificación de rostro", texto: "Se para frente al equipo y la puerta se abre.", icon: "rostro" },
      { titulo: "Identificación palmar", texto: "La palma de la mano, sin contacto.", icon: "palma" },
      { titulo: "Código numérico", texto: "Para quien prefiera no usar biometría.", icon: "codigo" },
    ],
    pie: "Sin llave que se pierda y sin tarjeta que se preste. Cada ingreso queda registrado con hora y persona.",
  },
  totem: {
    eyebrow: "Escena 7",
    titulo: "Tótem IA",
    texto:
      "Traspasada la puerta principal de ingreso, el propietario y/o visitante se encontrará con el Tótem IA, con la imagen del operador de turno.",
    layout: "tall",
    extras: [
      {
        titulo: "Todas las cámaras del consorcio",
        texto: "El tótem integra la totalidad de las cámaras que posea el edificio.",
        icon: "camaras",
      },
      {
        titulo: "Botones de pánico",
        texto: "Pedidos de auxilio directos: 911, bomberos, ambulancia.",
        icon: "panico",
      },
      {
        titulo: "Informes y notificaciones",
        texto: "Los avisos que emite el administrador del consorcio, a la vista de todos.",
        icon: "informes",
      },
    ],
  },
  lpr: {
    eyebrow: "Escena 8",
    titulo: "Acceso a cocheras mediante cámara LPR",
    texto:
      "Cuando el propietario gira hacia el ingreso de la cochera, la cámara LPR toma de forma inmediata el registro de la matrícula y acciona automáticamente el portón de acceso, permitiendo el ingreso en forma automática.",
    layout: "wide",
  },
  trazabilidad: {
    eyebrow: "Escena 9",
    titulo: "Trazabilidad de registros",
    texto:
      "Toda la información registrada es archivada y resguardada en nuestro sistema por períodos establecidos por las partes según contrato y en cumplimiento a las normas legales vigentes.",
    layout: "panel",
    extras: [
      {
        titulo: "Períodos según contrato",
        texto: "El plazo de guarda lo acuerdan las partes, no lo decide el proveedor.",
        icon: "contrato",
      },
      {
        titulo: "Todo con hora exacta",
        texto: "Eventos de seguridad e ingresos, en el mismo registro consultable.",
        icon: "reloj",
      },
    ],
  },
};

/** Rótulos de escena para el guion, por si hay que auditarlos contra el documento */
export const PRODUCT_SCENE_ORDER: ProductSceneKey[] = ["accesos", "totem", "lpr", "trazabilidad"];

function Media({ scene }: { scene: ProductSceneKey }) {
  if (scene === "accesos") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/accesos/ingreso-peatonal.jpg"
        alt="Una vecina frente al lector del ingreso, que la reconoce y le abre la puerta"
        className="h-full w-full object-cover"
        style={{ objectPosition: "45% 52%" }}
      />
    );
  }
  if (scene === "lpr") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/accesos/ingreso-vehicular.jpg"
        alt="Un auto en la entrada de la cochera: la cámara lee la patente y el portón se abre"
        className="h-full w-full object-cover"
        style={{ objectPosition: "48% 58%" }}
      />
    );
  }
  if (scene === "totem") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/cams/cam4.jpg"
        alt="El Tótem IA en el lobby del edificio, con el operador de turno en pantalla"
        className="h-full w-full object-cover"
        style={{ objectPosition: "50% 30%" }}
      />
    );
  }
  return <ArchiveGraphic />;
}

export default function ProductScene({ scene }: { scene: ProductSceneKey }) {
  const d = DATA[scene];
  const tall = d.layout === "tall";

  const encabezado = (
    <>
      <p className="text-[12px] font-semibold tracking-[0.2em] text-goldhi uppercase">{d.eyebrow}</p>
      <h2 className="mt-3 text-[clamp(24px,4.6vw,40px)] leading-[1.08] font-bold tracking-tight text-balance uppercase">
        {d.titulo}
      </h2>
      <p className="mt-4 max-w-[60ch] text-[clamp(15px,2.1vw,19px)] leading-relaxed text-ink2">
        {d.texto}
      </p>
    </>
  );

  // Los extras van en una sola columna: la escena ya está partida en dos.
  const listaExtras = d.extras && (
    <ul className="mt-6 grid gap-3">
      {d.extras.map((e) => (
        <li
          key={e.titulo}
          className="flex gap-3 rounded-xl border border-line bg-panel px-4 py-3.5"
        >
          <Icon name={e.icon} />
          <div>
            <p className="text-[14.5px] leading-tight font-bold tracking-tight">{e.titulo}</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{e.texto}</p>
          </div>
        </li>
      ))}
    </ul>
  );

  const pie = d.pie && (
    <p className="mt-5 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">{d.pie}</p>
  );

  /* En celular se apila: imagen arriba, texto abajo. Desde tablet en adelante
     va a dos columnas, porque una imagen a todo el ancho empuja el texto y el
     botón fuera de la pantalla y el vendedor tiene que scrollear en la reunión.

     Al tótem le toca una columna más angosta: es la única foto vertical. */
  const cols = tall
    ? "md:grid-cols-[minmax(0,0.62fr)_minmax(0,1fr)]"
    : "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]";

  return (
    <div className={`grid gap-7 ${cols} md:items-center md:gap-9`}>
      {d.layout === "panel" ? (
        <Media scene={scene} />
      ) : (
        <div
          className={`overflow-hidden rounded-2xl border border-line bg-black ${
            // La foto vertical se limita en celular, o los 3:4 se comen la pantalla
            tall ? "mx-auto w-full max-w-[240px] md:max-w-none" : ""
          }`}
        >
          <div className={`w-full overflow-hidden ${tall ? "aspect-[3/4]" : "aspect-[16/10]"}`}>
            <Media scene={scene} />
          </div>
        </div>
      )}
      <div>
        {encabezado}
        {listaExtras}
        {pie}
      </div>
    </div>
  );
}
