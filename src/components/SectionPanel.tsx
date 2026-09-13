"use client";

import { useEffect, useRef, useState } from "react";
import { lobbyStore, useContent, useLobby, type StandId } from "@/lobby/store";
import { ContactFooter, useSection } from "./sections";
import styles from "./lobby.module.css";

function PanelContent({ id, closeRef }: { id: StandId; closeRef: React.RefObject<HTMLButtonElement | null> }) {
  const section = useSection(id);
  const { ui } = useContent();
  return (
    <>
      <div className={styles.panelHeader}>
        <button ref={closeRef} className={styles.back} onClick={() => lobbyStore.getState().close()}>
          {ui.backToLobby}
        </button>
        <span className={styles.kicker}>{section.kicker}</span>
        <h2 id="section-title" className={styles.panelTitle}>
          {section.title}
        </h2>
      </div>
      <div className={styles.panelBody} key={id}>
        {section.body}
        <ContactFooter />
      </div>
    </>
  );
}

export default function SectionPanel() {
  const active = useLobby((s) => s.active);
  // keep the last section rendered while the panel slides out
  const [shown, setShown] = useState<StandId | null>(active);
  const closeRef = useRef<HTMLButtonElement>(null);

  if (active && active !== shown) setShown(active);

  useEffect(() => {
    if (!active) return;
    const focusTimer = setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 350);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && lobbyStore.getState().close();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <aside
      className={styles.panel}
      data-open={!!active}
      aria-hidden={!active}
      inert={!active}
      aria-labelledby="section-title"
      role="dialog"
    >
      {shown && <PanelContent id={shown} closeRef={closeRef} />}
    </aside>
  );
}
