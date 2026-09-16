import { Fragment } from "react";
import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cv, cvContact } from "@/content/cv";
import { profile, type Locale } from "@/content/sections";
import styles from "./cv.module.css";

// One-page CV: a single column so any ATS reads it, with the portfolio's navy and gold for hierarchy.
// The same page is printed to the PDFs in public/downloads (npm run cv:pdf).

const sans = Source_Sans_3({ subsets: ["latin"], display: "swap" });
const serif = Source_Serif_4({ subsets: ["latin"], display: "swap" });

const isLocale = (lang: string): lang is Locale => lang === "es" || lang === "en";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export async function generateMetadata({ params }: PageProps<"/cv/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  return { title: isLocale(lang) ? cv[lang].pageTitle : profile.name };
}

export default async function CvPage({ params }: PageProps<"/cv/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const c = cv[lang];

  return (
    <div className={styles.screen}>
      <nav className={styles.actions}>
        <Link href="/">{c.back}</Link>
        <a className={styles.download} href={c.file} download>
          {c.download}
        </a>
      </nav>

      <main className={`${styles.page} ${sans.className}`} lang={lang}>
        <header className={styles.header}>
          <h1 className={serif.className}>{profile.name}</h1>
          <p className={styles.role}>{c.role}</p>
          <p className={styles.contact}>
            <span>{c.location}</span>
            {cvContact.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </p>
        </header>

        <section>
          <h2 className={serif.className}>{c.headings.summary}</h2>
          <p className={styles.summary}>{c.summary}</p>
        </section>

        <section>
          <h2 className={serif.className}>{c.headings.experience}</h2>
          {c.experience.map((job) => (
            <div key={job.org} className={styles.entry}>
              <div className={styles.line}>
                <strong className={styles.org}>{job.org}</strong>
                <span className={styles.dates}>{job.dates}</span>
              </div>
              {job.roles.map((role) => (
                <div key={role.title} className={styles.role2}>
                  <div className={styles.line}>
                    <span className={styles.title}>{role.title}</span>
                    {role.dates && <span className={styles.dates}>{role.dates}</span>}
                  </div>
                  <ul>
                    {role.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </section>

        <section>
          <h2 className={serif.className}>{c.headings.projects}</h2>
          {c.projects.map((p) => (
            <div key={p.name} className={styles.entry}>
              <div className={styles.line}>
                <span>
                  <strong className={styles.org}>{p.name}</strong>
                  <span className={styles.stack}>{p.stack}</span>
                </span>
                {p.link && (
                  <a className={styles.dates} href={p.link.href}>
                    {p.link.label}
                  </a>
                )}
              </div>
              <ul>
                {p.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section>
          <h2 className={serif.className}>{c.headings.skills}</h2>
          <dl className={styles.skills}>
            {c.skills.map((s) => (
              <Fragment key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.items}</dd>
              </Fragment>
            ))}
          </dl>
        </section>

        <section>
          <h2 className={serif.className}>{c.headings.education}</h2>
          {c.education.map((e) => (
            <div key={e.org} className={`${styles.line} ${styles.study}`}>
              <span>
                <strong className={styles.org}>{e.org}</strong>
                <span className={styles.stack}>{e.degree}</span>
              </span>
              <span className={styles.dates}>{e.dates}</span>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
