"use client";

import { useEffect, type CSSProperties } from "react";
import styles from "./lobby.module.css";

// Cloud puffs covering the screen on the first load: x and y in % of the screen, size in vmax.
// When the lobby is ready they drift away from the centre and grow, as if the camera flew down through them.
const PUFFS: [number, number, number][] = [
  [50, 48, 70], [22, 30, 55], [78, 28, 58], [18, 72, 60], [80, 74, 56], [50, 12, 50], [50, 88, 52],
  [34, 52, 46], [66, 50, 48], [6, 48, 44], [94, 50, 46], [36, 18, 38], [64, 84, 40], [30, 90, 36], [72, 12, 38],
];

const PARTING_MS = 3400;

export default function Clouds({ ready, label, onDone }: { ready: boolean; label: string; onDone: () => void }) {
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(onDone, PARTING_MS);
    return () => clearTimeout(t);
  }, [ready, onDone]);

  return (
    <div className={styles.clouds} data-state={ready ? "parting" : "cover"} aria-hidden>
      <div className={styles.fog} />
      {PUFFS.map(([x, y, size], i) => {
        // straight out from the centre; the central puff leaves sideways
        const dx = x === 50 ? (i % 2 ? -1 : 1) * 40 : (x - 50) * 1.6;
        const dy = (y - 50) * 1.4;
        const style = {
          left: `${x}%`,
          top: `${y}%`,
          width: `${size}vmax`,
          height: `${size * 0.72}vmax`,
          "--dx": `${dx}vw`,
          "--dy": `${dy}vh`,
          "--delay": `${(Math.abs(x - 50) + Math.abs(y - 50)) * 4}ms`,
        } as CSSProperties;
        return <div key={i} className={styles.puff} style={style} />;
      })}
      <span className={styles.cloudsLabel}>{label}</span>
    </div>
  );
}
