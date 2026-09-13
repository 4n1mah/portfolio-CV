import { Assets, Container, Graphics, Sprite, Texture } from "pixi.js";
import { PALETTE } from "./config";

// Asset manifest. Every visual piece has a key. While `src` is null the engine
// draws a vector placeholder; drop a PNG into /public/lobby and set `src`
// to swap it in without touching any engine code. See ASSETS.md.

export interface AssetEntry {
  src: string | null;
  /** Anchor in the image that sits on the piece's ground point (0..1). */
  anchor: { x: number; y: number };
  /** Optional scale applied to the sprite. */
  scale?: number;
  /** Optional on-screen width in world pixels; the height follows the image ratio (overrides scale). */
  width?: number;
  /**
   * World pixels between the image's bottom edge and its ground point (overrides anchor.y).
   * E.g. a round planter cropped tight sits on its base ellipse center, `ry` px above the bottom edge.
   */
  groundOffset?: number;
  /** Soft contact shadow drawn by code under the sprite (generated shadows tend to look like smudges). */
  shadow?: { rx: number; ry: number; alpha?: number };
  /** Warm light halo drawn by code `y` px above the ground point (generated glows bake a muddy haze into the image). */
  glow?: { y: number; r: number; alpha?: number };
}

export const ASSETS = {
  // Island: 31 x 31 tiles = 1984 px wide. Crop the image to the diamond so its top corner is at y = 0.
  "lobby-floor": { src: "/lobby/lobby-floor.png", anchor: { x: 0.5, y: 0 }, width: 1984 },
  // Round planter with the plaza tree. Radius 2.2 tiles → 200 px wide; crop so the planter rim touches both sides.
  "planter-center": { src: "/lobby/planter-center.webp", anchor: { x: 0.5, y: 1 }, width: 200, groundOffset: 45, shadow: { rx: 108, ry: 50, alpha: 0.12 } },
  "stand-about": { src: null, anchor: { x: 0.5, y: 0.75 } },
  "stand-portfolio": { src: null, anchor: { x: 0.5, y: 0.75 } },
  "stand-skills": { src: null, anchor: { x: 0.5, y: 0.75 } },
  "stand-experience": { src: null, anchor: { x: 0.5, y: 0.75 } },
  // Potted plants (two varieties). Crop tight; width is the widest leaf span at size 1.
  "plant-a": { src: "/lobby/plant-a.webp", anchor: { x: 0.508, y: 1 }, width: 42, groundOffset: 6.2, shadow: { rx: 14, ry: 6 } },
  "plant-b": { src: "/lobby/plant-b.webp", anchor: { x: 0.5, y: 1 }, width: 48, groundOffset: 3.4, shadow: { rx: 12, ry: 5 } },
  // Backless wooden bench whose long side runs down-right (along gx); mirrored for benches along gy.
  "bench": { src: "/lobby/bench.webp", anchor: { x: 0.5, y: 1 }, width: 73, groundOffset: 25, shadow: { rx: 40, ry: 13, alpha: 0.1 } },
  // Lounge sofa, backrest on the back-right side (along gx).
  "sofa": { src: "/lobby/sofa.webp", anchor: { x: 0.502, y: 1 }, width: 78, groundOffset: 17, shadow: { rx: 42, ry: 14, alpha: 0.1 } },
  // Street lamp; the halo around the bulb is drawn by code.
  "lamp": { src: "/lobby/lamp.webp", anchor: { x: 0.498, y: 1 }, width: 10.5, groundOffset: 1.8, shadow: { rx: 7, ry: 3, alpha: 0.15 }, glow: { y: 54, r: 13 } },
} satisfies Record<string, AssetEntry>;

export type AssetKey = keyof typeof ASSETS;

export async function loadAssets(): Promise<void> {
  const entries = Object.entries(ASSETS as Record<string, AssetEntry>).filter(([, a]) => a.src);
  // mipmaps keep big images crisp instead of grainy when the camera zooms out
  await Promise.all(entries.map(([key, a]) => Assets.load({ alias: key, src: a.src!, data: { autoGenerateMipmaps: true } })));
}

/**
 * Returns the real sprite for `key` if its image is configured and loaded,
 * otherwise the placeholder built by `fallback`. `size` scales the image version
 * the same way the placeholder is scaled. `flipX` mirrors the image, so one
 * isometric piece serves both diagonal directions.
 */
export function piece(key: AssetKey, fallback: () => Container, size = 1, flipX = false): Container {
  const entry: AssetEntry = ASSETS[key];
  if (!entry.src || !Assets.cache.has(key)) return fallback();

  const sprite = new Sprite(Assets.get<Texture>(key));
  const tex = sprite.texture;
  let scale = entry.width ? entry.width / tex.width : (entry.scale ?? 1);
  scale *= size;
  sprite.scale.set(flipX ? -scale : scale, scale);
  const anchorY = entry.groundOffset !== undefined ? 1 - (entry.groundOffset * size) / scale / tex.height : entry.anchor.y;
  sprite.anchor.set(entry.anchor.x, anchorY);
  if (!entry.shadow && !entry.glow) return sprite;

  const holder = new Container();
  if (entry.shadow) {
    const { rx, ry, alpha = 0.16 } = entry.shadow;
    holder.addChild(new Graphics().ellipse(0, 0, rx * size, ry * size).fill({ color: 0x000000, alpha }));
  }
  holder.addChild(sprite);
  if (entry.glow) {
    const { y, r, alpha = 0.25 } = entry.glow;
    const halo = new Graphics().circle(0, -y * size, r * size).fill({ color: PALETTE.glow, alpha });
    halo.blendMode = "add";
    holder.addChild(halo);
  }
  return holder;
}
