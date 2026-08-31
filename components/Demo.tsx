"use client";

import { useEffect, useState } from "react";
import DesktopDemo from "./DesktopDemo";
import MobileDemo from "./MobileDemo";
import ReportPrintable from "./ReportPrintable";
import { useDemoMachine } from "@/lib/useDemoMachine";

/**
 * Pantalla chica: la demo cambia de forma, no se achica.
 *
 * Escalar el panel de 1920x1080 a un celular deja la letra en 5 px. En vez de
 * eso, abajo de 820 px de ancho —o con menos de 500 px de alto, que es un
 * celular acostado— se arma un recorrido vertical pensado para el pulgar.
 * Es donde más se va a ver la demo: el QR lo escanean los vecinos.
 */
function useSmallScreen() {
  const [small, setSmall] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 820px), (max-height: 500px)");
    const sync = () => setSmall(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return small;
}

export default function Demo() {
  const m = useDemoMachine();
  const small = useSmallScreen();

  // El panel ocupa la pantalla completa: mientras esté montado, sin scroll.
  useEffect(() => {
    document.body.classList.add("panel-lock");
    return () => document.body.classList.remove("panel-lock");
  }, []);

  // Hasta saber el tamaño no se pinta nada: evita que se vea un layout
  // acomodándose al otro en el primer cuadro.
  if (small === null) return <div className="fixed inset-0 bg-void" />;

  return (
    <>
      {small ? <MobileDemo m={m} /> : <DesktopDemo m={m} />}

      {/* Documento para "Descargar reporte (PDF)". Se monta sólo con el
          reporte abierto, así no precarga los clips de video de fondo. */}
      {m.step === "report" && (
        <ReportPrintable consorcio={m.consorcio} dateLabel={m.dateLabel} />
      )}
    </>
  );
}
