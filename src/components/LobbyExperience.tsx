"use client";

import { useEffect, useRef } from "react";
import { initialLocale, lobbyStore, useContent, useLobby } from "@/lobby/store";
import Hud from "./Hud";
import SectionPanel from "./SectionPanel";
import SimpleView from "./SimpleView";
import styles from "./lobby.module.css";

export default function LobbyExperience() {
  const hostRef = useRef<HTMLDivElement>(null);
  const simpleMode = useLobby((s) => s.simpleMode);
  const ready = useLobby((s) => s.ready);
  const locale = useLobby((s) => s.locale);
  const { ui } = useContent();

  useEffect(() => {
    const s = lobbyStore.getState();
    if (window.matchMedia("(pointer: coarse)").matches) s.setPointer("touch");
    const initial = initialLocale();
    if (initial !== s.locale) s.setLocale(initial);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (simpleMode || !hostRef.current) return;
    const host = hostRef.current;
    let destroy: (() => void) | null = null;
    let cancelled = false;
    // Pixi only runs in the browser, so the engine is loaded on demand.
    // It is rebuilt when the language changes because the signage is baked into the scene.
    import("@/lobby/engine/createLobby")
      .then(({ createLobby }) => createLobby(host, locale))
      .then((d) => (cancelled ? d() : (destroy = d)))
      .catch((err) => {
        console.error("No se pudo iniciar el lobby", err);
        lobbyStore.getState().setSimpleMode(true);
      });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [simpleMode, locale]);

  if (simpleMode) return <SimpleView />;

  return (
    <main className={styles.stage}>
      <h1 className="sr-only">{ui.tagline.join(" ")}</h1>
      <div ref={hostRef} className={styles.canvasHost} aria-hidden />
      <div className={styles.loader} data-hidden={ready} aria-hidden={ready}>
        <span>{ui.loading}</span>
      </div>
      <Hud />
      <SectionPanel />
    </main>
  );
}
