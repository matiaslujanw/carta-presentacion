"use client";

import { AUDIOVISUAL_SCENES, formatPlaybackTime } from "@/lib/audiovisualContent";
import styles from "./AudiovisualExperience.module.css";

function Icon({ name }: { name: "play" | "pause" | "previous" | "next" | "volume" | "muted" | "captions" }) {
  const paths = {
    play: <path d="M8 5v14l11-7-11-7Z" />,
    pause: <><path d="M7 5h4v14H7z" /><path d="M14 5h4v14h-4z" /></>,
    previous: <><path d="M6 5v14" /><path d="m18 6-8 6 8 6V6Z" /></>,
    next: <><path d="M18 5v14" /><path d="m6 6 8 6-8 6V6Z" /></>,
    volume: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a7.5 7.5 0 0 1 0 11" /></>,
    muted: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="m17 10 4 4m0-4-4 4" /></>,
    captions: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 10h4M7 14h3M14 10h3M13 14h4" /></>,
  } as const;
  return <svg viewBox="0 0 24 24" aria-hidden>{paths[name]}</svg>;
}

export default function PlaybackControls({
  playing,
  muted,
  subtitles,
  volume,
  current,
  total,
  sceneIndex,
  audioAvailable,
  onPlayingChange,
  onMutedChange,
  onSubtitlesChange,
  onVolumeChange,
  onPrevious,
  onNext,
  onSeek,
  onSceneChange,
}: {
  playing: boolean;
  muted: boolean;
  subtitles: boolean;
  volume: number;
  current: number;
  total: number;
  sceneIndex: number;
  audioAvailable: boolean;
  onPlayingChange: (value: boolean) => void;
  onMutedChange: (value: boolean) => void;
  onSubtitlesChange: (value: boolean) => void;
  onVolumeChange: (value: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (value: number) => void;
  onSceneChange: (index: number) => void;
}) {
  const progress = Math.max(0, Math.min(100, (current / total) * 100));
  return (
    <div className={styles.controls}>
      <div className={styles.timelineWrap}>
        <div className={styles.sceneMarkers} aria-label="Escenas">
          {AUDIOVISUAL_SCENES.map((scene, index) => (
            <button
              key={scene.id}
              type="button"
              className={index === sceneIndex ? styles.markerActive : index < sceneIndex ? styles.markerDone : ""}
              onClick={() => onSceneChange(index)}
              aria-label={`Ir a ${scene.navLabel}`}
            >
              <span>{scene.navLabel}</span>
            </button>
          ))}
        </div>
        <input
          className={styles.timeline}
          type="range"
          min={0}
          max={total}
          step={0.1}
          value={current}
          onChange={(event) => onSeek(Number(event.target.value))}
          aria-label="Progreso de la presentación"
          style={{ "--progress": `${progress}%` } as React.CSSProperties}
        />
      </div>

      <div className={styles.controlRow}>
        <div className={styles.transport}>
          <button type="button" onClick={onPrevious} aria-label="Escena anterior"><Icon name="previous" /></button>
          <button
            type="button"
            className={styles.playButton}
            onClick={() => onPlayingChange(!playing)}
            aria-label={playing ? "Pausar" : "Reproducir"}
          >
            <Icon name={playing ? "pause" : "play"} />
          </button>
          <button type="button" onClick={onNext} aria-label="Escena siguiente"><Icon name="next" /></button>
          <span className={styles.time}>{formatPlaybackTime(current)} / {formatPlaybackTime(total)}</span>
        </div>

        <div className={styles.controlOptions}>
          <button
            type="button"
            onClick={() => onSubtitlesChange(!subtitles)}
            className={subtitles ? styles.optionActive : ""}
            aria-label={subtitles ? "Ocultar subtítulos" : "Mostrar subtítulos"}
          >
            <Icon name="captions" /><span>CC</span>
          </button>
          <button
            type="button"
            onClick={() => onMutedChange(!muted)}
            className={muted ? styles.optionMuted : ""}
            aria-label={muted ? "Activar sonido" : "Silenciar"}
            title={audioAvailable ? undefined : "La locución se integrará después de aprobar el guion"}
          >
            <Icon name={muted ? "muted" : "volume"} />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
            aria-label="Volumen"
          />
        </div>
      </div>
    </div>
  );
}
