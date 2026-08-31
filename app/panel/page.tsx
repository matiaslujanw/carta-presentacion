import type { Metadata } from "next";
import Demo from "@/components/Demo";

export const metadata: Metadata = {
  title: "Vig.IA · Panel de la central de monitoreo",
  robots: { index: false, follow: false },
};

/**
 * El panel completo de la central, con las cuatro cámaras y el recorrido de
 * cuatro hojas. Queda acá para el cliente técnico que quiera ver el software;
 * la venta arranca por la presentación de la página principal.
 */
export default function PanelPage() {
  return <Demo />;
}
