"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { initialLocale, lobbyStore, useContent, useLobby } from "@/lobby/store";
import Clouds from "./Clouds";
import Hud from "./Hud";
import SectionPanel from "./SectionPanel";
import SimpleView from "./SimpleView";
import styles from "./lobby.module.css";

// The cloud intro plays once per page load, not when the lobby is rebuilt for a language change.
let introPending = true;

export default function LobbyExperience() {
  const hostRef = useRef<HTMLDivElement>(null);
  const simpleMode = useLobby((s) => s.simpleMode);
  const ready = useLobby((s) => s.ready);
  const locale = useLobby((s) => s.locale);
  const { ui } = useContent();
  const [clouds, setClouds] = useState(introPending);
  const hideClouds = useCallback(() => setClouds(false), []);

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
    // On the first paint the store still holds the default language; the effect above resolves the
    // visitor's one and a render with it is already on the way. Building now would throw away a
    // whole scene (and a WebGL context) a moment later, so this run waits for that render.
    if (lobbyStore.getState().locale !== locale) return;
    const host = hostRef.current;
    let destroy: (() => void) | null = null;
    let cancelled = false;
    // Pixi only runs in the browser, so the engine is loaded on demand.
    // It is rebuilt when the language changes because the signage is baked into the scene.
    import("@/lobby/engine/createLobby")
      .then(({ createLobby }) => createLobby(host, locale, { intro: introPending }))
      .then((d) => {
        if (cancelled) return d();
        destroy = d;
        introPending = false;
      })
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
      {clouds && <Clouds ready={ready} label={ui.loading} onDone={hideClouds} />}
    </main>
  );
}
