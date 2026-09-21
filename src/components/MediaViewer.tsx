"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectMedia } from "@/content/sections";
import { useContent, useLobby } from "@/lobby/store";
import styles from "./sections.module.css";

/**
 * Fotos y videos de un proyecto, a pantalla completa sobre el lobby.
 * Usa <dialog> nativo: de ahí salen gratis el fondo oscuro, cerrar con Esc y
 * que el teclado no se escape al resto de la página.
 */
export default function MediaViewer({ items, onClose }: { items: ProjectMedia[]; onClose: () => void }) {
  const { gallery } = useContent().ui;
  const ref = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const item = items[index];

  const go = useCallback(
    (step: number) => setIndex((n) => (n + step + items.length) % items.length),
    [items.length],
  );

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  // En captura, para llegar antes que el panel de la sección: él también escucha Esc en window y,
  // si lo dejamos pasar, se cierra por detrás y deja el visor flotando sobre el lobby.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        ref.current?.close();
        return;
      }
      // Con el video enfocado, las flechas son para adelantarlo, no para cambiar de medio.
      if (items.length < 2 || e.target instanceof HTMLVideoElement) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [go, items.length]);

  // Si la sección se cierra o cambia por detrás, el visor se va con ella.
  const active = useLobby((s) => s.active);
  const openedOn = useRef(active);
  useEffect(() => {
    if (active !== openedOn.current) ref.current?.close();
  }, [active]);

  return (
    <dialog
      ref={ref}
      className={styles.viewer}
      onClose={onClose}
      // El fondo oscuro es parte del propio <dialog>, así que un click ahí llega con
      // el diálogo como destino; sobre la imagen el destino es otro y no cierra.
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <button className={styles.viewerClose} onClick={() => ref.current?.close()} aria-label={gallery.close}>
        ✕
      </button>

      <div className={styles.viewerBox}>
        {item.kind === "video" ? (
          // key fuerza un elemento nuevo al cambiar de medio: así el anterior deja de sonar.
          // Empieza en silencio porque el audio de las grabaciones es solo ruido de fondo.
          <video
            key={item.src}
            className={styles.viewerMedia}
            src={item.src}
            poster={item.poster}
            controls
            muted
            playsInline
            preload="none"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- el alto lo manda la ventana, no un tamaño fijo
          <img key={item.src} className={styles.viewerMedia} src={item.src} alt={item.caption} />
        )}

        <p className={styles.viewerCaption}>{item.caption}</p>

        {items.length > 1 && (
          <div className={styles.viewerNav}>
            <button onClick={() => go(-1)} aria-label={gallery.previous}>
              ‹
            </button>
            <span>{gallery.counter.replace("{i}", String(index + 1)).replace("{n}", String(items.length))}</span>
            <button onClick={() => go(1)} aria-label={gallery.next}>
              ›
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
