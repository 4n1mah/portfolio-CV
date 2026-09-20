"use client";

import { useEffect, useState } from "react";
import { profile, type Content } from "@/content/sections";
import { fetchStats, type Stats } from "@/lib/visits";
import { isFeature, lobbyStore, useContent, useLobby, type FeatureId, type SpotId, type StandId } from "@/lobby/store";
import styles from "./sections.module.css";

function About({ c }: { c: Content }) {
  const { about, ui } = c;
  const goToProjects = () => {
    const s = lobbyStore.getState();
    if (s.simpleMode) document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" });
    else s.open("portfolio");
  };
  return (
    <>
      <p className={styles.lead}>{about.intro}</p>
      <h3 className={styles.h3}>{ui.headings.story}</h3>
      {about.story.map((p) => (
        <p key={p} className={styles.p}>
          {p}
        </p>
      ))}
      <p className={styles.p}>
        {about.storyCta.text}
        <button type="button" className={styles.inlineLink} onClick={goToProjects}>
          {about.storyCta.link}
        </button>
        {about.storyCta.after}
      </p>
      <h3 className={styles.h3}>{ui.headings.values}</h3>
      <div className={styles.cards}>
        {about.values.map((v) => (
          <div key={v.title} className={styles.card}>
            <strong>{v.title}</strong>
            <span>{v.text}</span>
          </div>
        ))}
      </div>
      <h3 className={styles.h3}>{ui.headings.drivers}</h3>
      <blockquote className={styles.quote}>{about.drivers}</blockquote>
      <h3 className={styles.h3}>{ui.headings.funFacts}</h3>
      <ul className={styles.chips}>
        {about.funFacts.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </>
  );
}

function Portfolio({ c }: { c: Content }) {
  return (
    <div className={styles.projects}>
      {c.portfolio.projects.map((p) => (
        <article key={p.title} className={styles.project}>
          <div className={styles.thumb} style={{ background: p.color }} aria-hidden>
            <span>{p.title.charAt(0)}</span>
          </div>
          <div>
            <span className={styles.meta}>{p.category}</span>
            <h3 className={styles.projectTitle}>{p.title}</h3>
            <p className={styles.p}>{p.description}</p>
            <ul className={styles.tags}>
              {p.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className={styles.result}>↗ {p.result}</p>
            {p.links.length > 0 && (
              <div className={styles.projectLinks}>
                {p.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                    {l.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function Chips({ items, accent }: { items: string[]; accent?: boolean }) {
  return (
    <ul className={styles.chips}>
      {items.map((item) => (
        <li key={item} className={accent ? styles.chipAccent : undefined}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Skills({ c }: { c: Content }) {
  const { skills, ui } = c;
  return (
    <>
      {skills.groups.map((g) => (
        <section key={g.name}>
          <h3 className={styles.h3}>{g.name}</h3>
          <Chips items={g.items} />
        </section>
      ))}
      <h3 className={styles.h3}>{ui.headings.soft}</h3>
      <Chips items={skills.soft} />
      <h3 className={styles.h3}>{ui.headings.languages}</h3>
      <Chips items={skills.languages} />
      <h3 className={styles.h3}>{ui.headings.learning}</h3>
      <Chips items={skills.learning} accent />
    </>
  );
}

function Experience({ c }: { c: Content }) {
  const { experience, ui } = c;
  return (
    <>
      <ol className={styles.timeline}>
        {experience.timeline.map((e) => (
          <li key={e.role + e.company} className={styles.entry}>
            <span className={styles.period}>{e.period}</span>
            <h3 className={styles.projectTitle}>{e.role}</h3>
            <span className={styles.meta}>{e.company}</span>
            <p className={styles.p}>{e.description}</p>
            <ul className={styles.achievements}>
              {e.achievements.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <h3 className={styles.h3}>{ui.headings.education}</h3>
      <div className={styles.cards}>
        {experience.education.map((ed) => (
          <div key={ed.title} className={styles.card}>
            <strong>{ed.title}</strong>
            <span>
              {ed.place} · {ed.period}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

const plural = (n: number, word: { one: string; many: string }) => `${n} ${n === 1 ? word.one : word.many}`;

/**
 * Visitor stats: how many times each section was opened, live from the API.
 * The board keeps working when the API is down; it just says so.
 */
function StatsBoard({ c }: { c: Content }) {
  const t = c.statsBoard;
  const locale = useLobby((s) => s.locale);
  const [days, setDays] = useState<number | null>(null);
  // What is on screen, and for which period: while they disagree, the numbers are still on their way.
  const [loaded, setLoaded] = useState<{ days: number | null; stats: Stats | null } | null>(null);
  const loading = loaded?.days !== days;
  const stats = loading ? null : loaded!.stats;

  useEffect(() => {
    let current = true;
    // fresh: the panel always shows the real numbers, not the cached ones
    fetchStats({ days: days ?? undefined, fresh: true }).then((data) => {
      if (current) setLoaded({ days, stats: data });
    });
    return () => {
      current = false;
    };
  }, [days]);

  const most = stats?.sections[0]?.visits ?? 0;

  return (
    <>
      <p className={styles.lead}>{c.features.stats.description}</p>

      <div className={styles.statsHead}>
        <div className={styles.windowSwitch} role="group" aria-label={c.features.stats.title}>
          {([null, 7] as const).map((value) => (
            <button key={String(value)} aria-pressed={days === value} onClick={() => setDays(value)}>
              {value === null ? t.windows.all : t.windows.week}
            </button>
          ))}
        </div>
        {stats && <span className={styles.statsTotal}>{plural(stats.total, t.total)}</span>}
      </div>

      {loading && <p className={styles.p}>{t.loading}</p>}
      {!loading && !stats && <p className={styles.p}>{t.offline}</p>}
      {!loading && stats && stats.total === 0 && <p className={styles.p}>{t.empty}</p>}

      {!loading && stats && stats.total > 0 && (
        <>
          <ul className={styles.bars}>
            {stats.sections.map((s) => (
              <li key={s.section}>
                <p className={styles.barLabel}>
                  <span>{c[s.section].title}</span>
                  <span>
                    {plural(s.visits, t.visits)} · {Math.round((s.visits / stats.total) * 100)}%
                  </span>
                </p>
                <div className={styles.bar}>
                  <span style={{ width: `${most > 0 ? (s.visits / most) * 100 : 0}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className={styles.updated}>
            {t.updated.replace(
              "{time}",
              new Date(stats.generated_at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }),
            )}
          </p>
        </>
      )}

      <h3 className={styles.h3}>{t.howItWorks}</h3>
      <ul className={styles.achievements}>
        {c.features.stats.plans.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </>
  );
}

/** Placeholder body for a feature that is not built yet. */
function ComingSoon({ c, id }: { c: Content; id: FeatureId }) {
  const feature = c.features[id];
  return (
    <>
      <p className={styles.construction}>🚧 {c.ui.underConstruction}</p>
      <p className={styles.lead}>{feature.description}</p>
      <h3 className={styles.h3}>{c.ui.whatsComing}</h3>
      <ul className={styles.achievements}>
        {feature.plans.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </>
  );
}

const BODIES: Record<StandId, (props: { c: Content }) => React.ReactNode> = {
  about: About,
  portfolio: Portfolio,
  skills: Skills,
  experience: Experience,
};

export const SECTION_ORDER: StandId[] = ["about", "portfolio", "skills", "experience"];

/** Title, kicker and preview list of a section or feature. */
export function spotInfo(c: Content, id: SpotId) {
  return isFeature(id) ? c.features[id] : c[id];
}

/** Title, kicker, preview list and body of a section (or an upcoming feature) in the current language. */
export function useSection(id: SpotId) {
  const c = useContent();
  if (isFeature(id)) {
    return { ...c.features[id], body: id === "stats" ? <StatsBoard c={c} /> : <ComingSoon c={c} id={id} /> };
  }
  const Body = BODIES[id];
  return { ...c[id], body: <Body c={c} /> };
}

export function ContactFooter() {
  const { ui } = useContent();
  return (
    <footer className={styles.contact}>
      <p>{ui.contactTitle}</p>
      <a href={`mailto:${profile.email}`} className={styles.cta}>
        {ui.writeMe} · {profile.email}
      </a>
      <ul className={styles.links}>
        <li>
          <a href={`https://wa.me/${profile.whatsapp}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </li>
        {profile.links.map((l) => (
          <li key={l.label}>
            <a href={l.href} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
