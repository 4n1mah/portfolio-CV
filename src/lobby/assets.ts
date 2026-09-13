import { Assets, Container, Sprite, Texture } from "pixi.js";

// Asset manifest. Every visual piece has a key. While `src` is null the engine
// draws a vector placeholder; drop a PNG into /public/lobby and set `src`
// to swap it in without touching any engine code. See ASSETS.md.

export interface AssetEntry {
  src: string | null;
  /** Anchor in the image that sits on the piece's ground point (0..1). */
  anchor: { x: number; y: number };
  /** Optional scale applied to the sprite. */
  scale?: number;
}

export const ASSETS = {
  "lobby-floor": { src: null, anchor: { x: 0.5, y: 0 } },
  "planter-center": { src: null, anchor: { x: 0.5, y: 0.8 } },
  "stand-about": { src: null, anchor: { x: 0.5, y: 0.75 } },
  "stand-portfolio": { src: null, anchor: { x: 0.5, y: 0.75 } },
  "stand-skills": { src: null, anchor: { x: 0.5, y: 0.75 } },
  "stand-experience": { src: null, anchor: { x: 0.5, y: 0.75 } },
  "plant-a": { src: null, anchor: { x: 0.5, y: 0.95 } },
  "bench": { src: null, anchor: { x: 0.5, y: 0.7 } },
  "lamp": { src: null, anchor: { x: 0.5, y: 0.97 } },
} satisfies Record<string, AssetEntry>;

export type AssetKey = keyof typeof ASSETS;

export async function loadAssets(): Promise<void> {
  const entries = Object.entries(ASSETS as Record<string, AssetEntry>).filter(([, a]) => a.src);
  await Promise.all(entries.map(([key, a]) => Assets.load({ alias: key, src: a.src! })));
}

/**
 * Returns the real sprite for `key` if its image is configured and loaded,
 * otherwise the placeholder built by `fallback`.
 */
export function piece(key: AssetKey, fallback: () => Container): Container {
  const entry: AssetEntry = ASSETS[key];
  if (entry.src && Assets.cache.has(key)) {
    const sprite = new Sprite(Assets.get<Texture>(key));
    sprite.anchor.set(entry.anchor.x, entry.anchor.y);
    if (entry.scale) sprite.scale.set(entry.scale);
    return sprite;
  }
  return fallback();
}
