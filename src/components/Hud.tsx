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
  const c = useContent();
  const { open, setSimpleMode, setLocale } = lobbyStore.getState();
  const preview = hovered ? c[hovered] : null;
  const touch = pointer === "touch";

  return (
    <div className={styles.hud} data-dimmed={!!active}>
      <header className={styles.brand}>
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
