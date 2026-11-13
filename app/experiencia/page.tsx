import type { Metadata } from "next";
import AudiovisualExperience from "@/components/audiovisual/AudiovisualExperience";

export const metadata: Metadata = {
  title: "Vig.IA · Experiencia audiovisual",
  description:
    "Presentación audiovisual de Vig.IA: accesos inteligentes, monitoreo con inteligencia artificial y respuesta humana.",
  robots: { index: false, follow: false },
};

export default function AudiovisualPage() {
  return <AudiovisualExperience />;
}
