import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import { content, type Content, type Locale } from "@/content/sections";

export type StandId = "about" | "portfolio" | "skills" | "experience";
export type PointerKind = "mouse" | "touch";

export interface LobbyState {
  ready: boolean;
  hovered: StandId | null;
  active: StandId | null;
  pointer: PointerKind;
  simpleMode: boolean;
  locale: Locale;
  setReady: (ready: boolean) => void;
  setHovered: (id: StandId | null) => void;
  open: (id: StandId) => void;
  close: () => void;
  setPointer: (pointer: PointerKind) => void;
  setSimpleMode: (simple: boolean) => void;
  setLocale: (locale: Locale) => void;
}

/** Shared between the Pixi engine (vanilla subscribe) and React (hook). */
export const lobbyStore = createStore<LobbyState>((set) => ({
  ready: false,
  hovered: null,
  active: null,
  pointer: "mouse",
  simpleMode: false,
  locale: "es",
  setReady: (ready) => set({ ready }),
  setHovered: (hovered) => set({ hovered }),
  open: (active) => set({ active, hovered: null }),
  close: () => set({ active: null }),
  setPointer: (pointer) => set({ pointer }),
  setSimpleMode: (simpleMode) => set({ simpleMode, active: null, hovered: null }),
  setLocale: (locale) => {
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch {}
    set({ locale });
  },
}));

export const LOCALE_KEY = "portfolio-locale";

/** Saved language, or the browser's language on a first visit. */
export function initialLocale(): Locale {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(LOCALE_KEY);
  } catch {}
  if (saved === "en" || saved === "es") return saved;
  return navigator.language.startsWith("en") ? "en" : "es";
}

export function useLobby<T>(selector: (state: LobbyState) => T): T {
  return useStore(lobbyStore, selector);
}

/** Content for the current language. */
export function useContent(): Content {
  return content[useLobby((s) => s.locale)];
}
