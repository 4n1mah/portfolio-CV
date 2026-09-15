"use client";

import { profile } from "@/content/sections";
import { useContent, type StandId } from "@/lobby/store";
import { ContactFooter, SECTION_ORDER, useSection } from "./sections";
import Toolbar from "./Toolbar";
import styles from "./lobby.module.css";

function Section({ id }: { id: StandId }) {
  const { title, kicker, body } = useSection(id);
  return (
    <section id={id} className={styles.simpleSection}>
      <span className={styles.kicker}>{kicker}</span>
      <h2 className={styles.panelTitle}>{title}</h2>
      {body}
    </section>
  );
}

/** Linear, accessible version of the whole portfolio. */
export default function SimpleView() {
  const c = useContent();
  return (
    <main className={styles.simple}>
      <div className={styles.simpleInner}>
        <header className={styles.simpleHeader}>
          <div>
            <h1>{profile.name}</h1>
            <p>{c.ui.role}</p>
          </div>
          <Toolbar variant="simple" />
        </header>
        <nav className={styles.simpleNav} aria-label={c.ui.sections}>
          {SECTION_ORDER.map((id) => (
            <a key={id} href={`#${id}`}>
              {c[id].title}
            </a>
          ))}
        </nav>
        {SECTION_ORDER.map((id) => (
          <Section key={id} id={id} />
        ))}
        <ContactFooter />
      </div>
    </main>
  );
}
