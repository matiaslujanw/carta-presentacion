"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AUDIOVISUAL_SCENES,
  AUDIOVISUAL_TOTAL_DURATION,
} from "./audiovisualContent";

function sceneOffset(index: number) {
  return AUDIOVISUAL_SCENES.slice(0, index).reduce((sum, scene) => sum + scene.duration, 0);
}

export function useAudiovisualPlayer() {
  const [started, setStarted] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [elapsed, setElapsedState] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [subtitles, setSubtitles] = useState(true);
  const [volume, setVolume] = useState(0.82);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const elapsedRef = useRef(0);
  const lastFrameRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const scene = AUDIOVISUAL_SCENES[sceneIndex];
  const duration = audioDuration ?? scene.duration;

  const setElapsed = useCallback((value: number) => {
    const next = Math.max(0, value);
    elapsedRef.current = next;
    setElapsedState(next);
  }, []);

  const goToScene = useCallback(
    (index: number, nextElapsed = 0) => {
      const safeIndex = Math.max(0, Math.min(AUDIOVISUAL_SCENES.length - 1, index));
      setSceneIndex(safeIndex);
      setAudioDuration(null);
      setElapsed(nextElapsed);
      lastFrameRef.current = null;
    },
    [setElapsed],
  );

  const next = useCallback(() => {
    if (sceneIndex >= AUDIOVISUAL_SCENES.length - 1) {
      setPlaying(false);
      setElapsed(scene.duration);
      return;
    }
    goToScene(sceneIndex + 1);
  }, [goToScene, scene.duration, sceneIndex, setElapsed]);

  const previous = useCallback(() => {
    if (elapsedRef.current > 2.5) {
      setElapsed(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
      return;
    }
    goToScene(sceneIndex - 1);
  }, [goToScene, sceneIndex, setElapsed]);

  const start = useCallback(() => {
    setStarted(true);
    setPlaying(true);
    goToScene(0);
  }, [goToScene]);

  const restart = useCallback(() => {
    setStarted(true);
    setPlaying(true);
    goToScene(0);
  }, [goToScene]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !scene.audioSrc) return;
    audio.volume = volume;
    audio.muted = muted;
    if (playing) {
      void audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [muted, playing, scene.audioSrc, sceneIndex, volume]);

  useEffect(() => {
    if (!started || !playing || scene.audioSrc) return;

    let frame = 0;
    const tick = (now: number) => {
      if (lastFrameRef.current === null) lastFrameRef.current = now;
      const delta = Math.min((now - lastFrameRef.current) / 1000, 0.25);
      lastFrameRef.current = now;
      const nextElapsed = elapsedRef.current + delta;

      if (nextElapsed >= scene.duration) {
        next();
        return;
      }

      setElapsed(nextElapsed);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      lastFrameRef.current = null;
    };
  }, [next, playing, scene.audioSrc, scene.duration, setElapsed, started]);

  const seekOverall = useCallback(
    (target: number) => {
      const clamped = Math.max(0, Math.min(AUDIOVISUAL_TOTAL_DURATION - 0.01, target));
      let cursor = 0;
      let targetIndex = 0;
      for (let index = 0; index < AUDIOVISUAL_SCENES.length; index++) {
        const end = cursor + AUDIOVISUAL_SCENES[index].duration;
        if (clamped < end) {
          targetIndex = index;
          break;
        }
        cursor = end;
      }
      const localElapsed = clamped - cursor;
      goToScene(targetIndex, localElapsed);
      requestAnimationFrame(() => {
        if (audioRef.current && AUDIOVISUAL_SCENES[targetIndex].audioSrc) {
          audioRef.current.currentTime = localElapsed;
        }
      });
    },
    [goToScene],
  );

  const overallElapsed = sceneOffset(sceneIndex) + Math.min(elapsed, scene.duration);
  const sceneProgress = Math.min(1, elapsed / Math.max(duration, 0.01));
  const activeCaption = useMemo(
    () => scene.captions.find((cue) => elapsed >= cue.start && elapsed < cue.end)?.text ?? "",
    [elapsed, scene.captions],
  );

  return {
    audioRef,
    started,
    scene,
    sceneIndex,
    elapsed,
    duration,
    overallElapsed,
    totalDuration: AUDIOVISUAL_TOTAL_DURATION,
    sceneProgress,
    activeCaption,
    playing,
    muted,
    subtitles,
    volume,
    setPlaying,
    setMuted,
    setSubtitles,
    setVolume,
    setAudioDuration,
    setElapsed,
    start,
    next,
    previous,
    restart,
    goToScene,
    seekOverall,
  };
}
