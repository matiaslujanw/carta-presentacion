"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { AUDIOVISUAL_SCENES } from "@/lib/audiovisualContent";
import { unlockAudio } from "@/lib/sound";
import { useAudiovisualPlayer } from "@/lib/useAudiovisualPlayer";
import PlaybackControls from "./PlaybackControls";
import SceneRenderer from "./SceneRenderer";
import styles from "./AudiovisualExperience.module.css";

export default function AudiovisualExperience() {
  const player = useAudiovisualPlayer();
  const audioAvailable = AUDIOVISUAL_SCENES.some((scene) => Boolean(scene.audioSrc));

  useEffect(() => {
    document.body.classList.add("audiovisual-lock");
    return () => document.body.classList.remove("audiovisual-lock");
  }, []);

  const start = () => {
    unlockAudio();
    player.start();
  };

  if (!player.started) {
    return (
      <main className={`${styles.experience} ${styles.gate}`}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video src="/cams/cam1.mp4" autoPlay muted loop playsInline preload="metadata" className={styles.gateVideo} />
        <div className={styles.gateShade} />
        <div className={styles.gateGrid} />
        <div className={styles.gateContent}>
          <Logo size="xl" />
          <p className={styles.eyebrow}>Seguridad con inteligencia</p>
          <h1>Una nueva forma de <span>cuidar lo que importa</span></h1>
          <p className={styles.gateCopy}>
            Una experiencia audiovisual de 1 minuto 40 segundos sobre accesos inteligentes,
            monitoreo con IA y respuesta humana.
          </p>
          <button type="button" onClick={start} className={styles.startButton}>
            <span>Conocé Vig.IA</span>
            <svg viewBox="0 0 24 24" aria-hidden><path d="M8 5v14l11-7-11-7Z" /></svg>
          </button>
          {!audioAvailable && (
            <p className={styles.evaluationNote}>
              Versión de evaluación · recorrido visual con subtítulos · locución profesional pendiente
            </p>
          )}
        </div>
        <div className={styles.gateFooter}>
          <Link href="/">Ver presentación original</Link>
          <Link href="/panel">Abrir panel técnico</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.experience}>
      <header className={styles.topbar}>
        <button type="button" onClick={player.restart} aria-label="Reiniciar presentación">
          <Logo size="sm" />
        </button>
        <div className={styles.topbarLabel}>
          <i /> Presentación audiovisual
          {!audioAvailable && <span>Locución pendiente</span>}
        </div>
        <nav>
          <Link href="/">Versión interactiva</Link>
          <Link href="/panel">Información técnica</Link>
        </nav>
      </header>

      <div className={styles.stage}>
        <SceneRenderer key={player.scene.id} id={player.scene.id} progress={player.sceneProgress} />
      </div>

      {player.subtitles && player.activeCaption && (
        <div className={styles.captions} aria-live="polite">
          <span>{player.activeCaption}</span>
        </div>
      )}

      {player.scene.audioSrc && (
        <audio
          key={player.scene.id}
          ref={player.audioRef}
          src={player.scene.audioSrc}
          preload="auto"
          onLoadedMetadata={(event) => player.setAudioDuration(event.currentTarget.duration)}
          onTimeUpdate={(event) => player.setElapsed(event.currentTarget.currentTime)}
          onEnded={player.next}
        />
      )}

      <PlaybackControls
        playing={player.playing}
        muted={player.muted}
        subtitles={player.subtitles}
        volume={player.volume}
        current={player.overallElapsed}
        total={player.totalDuration}
        sceneIndex={player.sceneIndex}
        audioAvailable={audioAvailable}
        onPlayingChange={player.setPlaying}
        onMutedChange={player.setMuted}
        onSubtitlesChange={player.setSubtitles}
        onVolumeChange={player.setVolume}
        onPrevious={player.previous}
        onNext={player.next}
        onSeek={player.seekOverall}
        onSceneChange={(index) => player.goToScene(index)}
      />
    </main>
  );
}
