"use client";

import { profile } from "@/content/sections";
import { lobbyStore, useContent, useLobby, type SpotId } from "@/lobby/store";
import { SECTION_ORDER, spotInfo } from "./sections";
import Toolbar from "./Toolbar";
import styles from "./lobby.module.css";

export default function Hud() {
  const hovered = useLobby((s) => s.hovered);
  const active = useLobby((s) => s.active);
  const pointer = useLobby((s) => s.pointer);
  const exploring = useLobby((s) => s.exploring);
  const nameLinksOpen = useLobby((s) => s.nameLinksOpen);
  const c = useContent();
  const { open, setNameLinks, closeNameLinksSoon } = lobbyStore.getState();
  const preview = hovered ? spotInfo(c, hovered) : null;
  const touch = pointer === "touch";

  return (
    <div className={styles.hud} data-dimmed={!!active}>
      <header className={styles.brand} data-compact={exploring}>
        <p className={styles.brandTitle}>
          {c.ui.tagline[0]}
          <br />
          {c.ui.tagline[1]}
        </p>
        <p className={styles.brandMeta}>
          <span className={styles.brandName}>{profile.name}</span>
          <span className={styles.brandRole}>{c.ui.role}</span>
        </p>
        <p className={styles.brandScript}>{c.ui.welcome}</p>
      </header>

      {nameLinksOpen && !active && (
        <div
          className={styles.nameLinks}
          role="menu"
          aria-label={c.ui.findMe}
          onPointerEnter={() => setNameLinks(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && closeNameLinksSoon()}
        >
          <span className={styles.nameLinksLabel}>{c.ui.findMe}</span>
          <div className={styles.nameLinksRow}>
            {profile.links.map((l) => (
              <a key={l.label} role="menuitem" href={l.href} target="_blank" rel="noreferrer">
                {l.label} ↗
              </a>
            ))}
          </div>
        </div>
      )}

      {preview && !touch && (
        <aside className={styles.preview} key={hovered}>
          <span className={styles.previewLabel}>{c.ui.preview}</span>
          <strong className={styles.previewTitle}>{preview.title}</strong>
          <ul>
            {preview.preview.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <span className={styles.previewCta}>{c.ui.clickToEnter}</span>
        </aside>
      )}

      <div className={styles.bottomBar}>
        {preview && touch ? (
          <button className={styles.enter} onClick={() => open(hovered as SpotId)}>
            {c.ui.enter} {preview.title} →
          </button>
        ) : (
          <p className={styles.hint}>{touch ? c.ui.hintTouch : c.ui.hintMouse}</p>
        )}
      </div>

      <Toolbar variant="lobby" />

      <nav className={styles.keyboardNav} aria-label={c.ui.sections}>
        {SECTION_ORDER.map((id) => (
          <button key={id} onClick={() => open(id)}>
            {c[id].title}
          </button>
        ))}
      </nav>
    </div>
  );
}
