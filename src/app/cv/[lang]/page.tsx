import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cv, cvContact } from "@/content/cv";
import { profile, type Locale } from "@/content/sections";
import styles from "./cv.module.css";

// One-page CV in the Harvard format. The same page is printed to the PDFs in public/downloads (npm run cv:pdf).

const garamond = EB_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"] });

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

      <main className={`${styles.page} ${garamond.className}`} lang={lang}>
        <header className={styles.header}>
          <h1>{profile.name}</h1>
          <p>
            {c.location}
            {cvContact.map((link) => (
              <span key={link.href}>
                {" • "}
                <a href={link.href}>{link.label}</a>
              </span>
            ))}
          </p>
        </header>

        <section>
          <h2>{c.headings.education}</h2>
          {c.education.map((e) => (
            <div key={e.org} className={styles.entry}>
              <div className={styles.line}>
                <strong>{e.org}</strong>
                <span>{e.dates}</span>
              </div>
              <div className={styles.line}>
                <em>{e.degree}</em>
              </div>
            </div>
          ))}
        </section>

        <section>
          <h2>{c.headings.experience}</h2>
          {c.experience.map((job) => (
            <div key={job.org} className={styles.entry}>
              <div className={styles.line}>
                <strong>{job.org}</strong>
                <span>{job.dates}</span>
              </div>
              {job.roles.map((role) => (
                <div key={role.title} className={styles.role}>
                  <div className={styles.line}>
                    <em>{role.title}</em>
                    {role.dates && <span>{role.dates}</span>}
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
          <h2>{c.headings.projects}</h2>
          {c.projects.map((p) => (
            <div key={p.name} className={styles.entry}>
              <div className={styles.line}>
                <span>
                  <strong>{p.name}</strong> <em>| {p.stack}</em>
                </span>
                {p.link && <a href={p.link.href}>{p.link.label}</a>}
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
          <h2>{c.headings.skills}</h2>
          <ul className={styles.skills}>
            {c.skills.map((s) => (
              <li key={s.label}>
                <strong>{s.label}:</strong> {s.items}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
