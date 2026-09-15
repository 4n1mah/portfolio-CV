// Prints the CV pages (/cv/es and /cv/en) to public/downloads with a local Chrome or Edge in headless mode.
// Run the site first (npm run dev), then: npm run cv:pdf [-- http://localhost:3000]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const base = process.argv[2] ?? "http://localhost:3000";
const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];
const browser = candidates.find((path) => path && existsSync(path));
if (!browser) {
  console.error("No Chrome or Edge found. Set CHROME_PATH to a Chromium-based browser.");
  process.exit(1);
}

const outDir = resolve("public/downloads");
mkdirSync(outDir, { recursive: true });
// a throwaway profile, so an open browser window does not swallow the headless run
const profile = mkdtempSync(join(tmpdir(), "cv-pdf-"));

try {
  for (const lang of ["es", "en"]) {
    const out = join(outDir, `CV-Sadiel-Rojas-Padilla-${lang.toUpperCase()}.pdf`);
    execFileSync(browser, [
      "--headless=new",
      "--disable-gpu",
      `--user-data-dir=${profile}`,
      "--no-pdf-header-footer",
      "--virtual-time-budget=8000",
      `--print-to-pdf=${out}`,
      `${base}/cv/${lang}`,
    ]);
    console.log(`${out} (${Math.round(statSync(out).size / 1024)} KB)`);
  }
} finally {
  rmSync(profile, { recursive: true, force: true });
}
