"use client";

import { profile } from "@/content/sections";
import { lobbyStore, useContent, useLobby, type StandId } from "@/lobby/store";
import { SECTION_ORDER } from "./sections";
import styles from "./lobby.module.css";

export default function Hud() {
  const hovered = useLobby((s) => s.hovered);
  const active = useLobby((s) => s.active);
  const pointer = useLobby((s) => s.pointer);
  const locale = useLobby((s) => s.locale);
  const exploring = useLobby((s) => s.exploring);
  const nameLinksOpen = useLobby((s) => s.nameLinksOpen);
  const c = useContent();
  const { open, setSimpleMode, setLocale, setNameLinks, closeNameLinksSoon } = lobbyStore.getState();
  const preview = hovered ? c[hovered] : null;
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
          {profile.name} · {c.ui.role}
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
          <button className={styles.enter} onClick={() => open(hovered as StandId)}>
            {c.ui.enter} {preview.title} →
          </button>
        ) : (
          <p className={styles.hint}>{touch ? c.ui.hintTouch : c.ui.hintMouse}</p>
        )}
      </div>

      <div className={styles.corner}>
        <button className={styles.pill} onClick={() => setLocale(locale === "es" ? "en" : "es")} lang={locale === "es" ? "en" : "es"}>
          {c.ui.switchLanguage}
        </button>
        <button className={styles.pill} onClick={() => setSimpleMode(true)}>
          {c.ui.simpleMode}
        </button>
      </div>

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
