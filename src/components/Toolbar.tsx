"use client";

import { useEffect, useSyncExternalStore } from "react";
import * as music from "@/audio/music";
import { lobbyStore, useContent, useLobby } from "@/lobby/store";
import styles from "./lobby.module.css";

const icon = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg {...icon}>
      <path d="M11 5 6 9H3v6h3l5 4z" />
      {on ? <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /> : <path d="m16 9 6 6M22 9l-6 6" />}
    </svg>
  );
}

const ListIcon = () => (
  <svg {...icon}>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
);

const DownloadIcon = () => (
  <svg {...icon}>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </svg>
);

/**
 * The actions a recruiter looks for first, always in the top-right corner: language, music,
 * the plain version of the site and the CV download.
 */
export default function Toolbar({ variant }: { variant: "lobby" | "simple" }) {
  const c = useContent();
  const locale = useLobby((s) => s.locale);
  const playing = useSyncExternalStore(music.subscribe, music.isPlaying, () => false);
  const { setLocale, setSimpleMode } = lobbyStore.getState();

  useEffect(() => music.startOnFirstInteraction(), []);

  return (
    <div className={styles.toolbar} data-variant={variant}>
      <div className={styles.langSwitch} role="group" aria-label={c.ui.language}>
        {(["es", "en"] as const).map((l) => (
          <button key={l} lang={l} aria-pressed={locale === l} onClick={() => setLocale(l)}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <button
        className={styles.toolButton}
        data-music-toggle
        aria-pressed={playing}
        aria-label={playing ? c.ui.musicOn : c.ui.musicOff}
        title={playing ? c.ui.musicOn : c.ui.musicOff}
        onClick={music.toggle}
      >
        <SpeakerIcon on={playing} />
      </button>
      {variant === "lobby" ? (
        <button className={styles.toolButton} onClick={() => setSimpleMode(true)} aria-label={c.ui.simpleMode} title={c.ui.simpleMode}>
          <ListIcon />
          <span className={styles.toolLabel}>{c.ui.simpleMode}</span>
        </button>
      ) : (
        <button className={styles.toolButton} onClick={() => setSimpleMode(false)}>
          <span>{c.ui.backToInteractive}</span>
        </button>
      )}
      <a className={styles.cvButton} href={c.ui.cvFile} download>
        <DownloadIcon />
        <span>{c.ui.downloadCv}</span>
      </a>
    </div>
  );
}
