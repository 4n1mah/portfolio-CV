import { Assets, Container, Graphics, Rectangle, Sprite, Texture } from "pixi.js";
import { PALETTE } from "./config";
import { iso } from "./engine/iso";

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
  /** Vertical factor applied after sizing: flattens art rendered from a higher camera than the lobby's 2:1 view. */
  squashY?: number;
  /** Soft shadow shaped like the piece's footprint (w × d tiles along gx; mirrored with flipX), for long diagonal pieces. */
  footprint?: { w: number; d: number; alpha?: number };
}

export const ASSETS = {
  // Island: 31 x 31 tiles = 1984 px wide. Made from art/reference/lobby-floor.png (0.76 px per world px);
  // the anchor is the diamond's top corner, width includes the thin floor edge.
  "lobby-floor": { src: "/lobby/lobby-floor.webp", anchor: { x: 0.4997, y: 0.009 }, width: 1990.8 },
  // Round planter with the plaza tree. Radius 2.2 tiles → 200 px wide; crop so the planter rim touches both sides.
  "planter-center": { src: "/lobby/planter-center.webp", anchor: { x: 0.5, y: 1 }, width: 200, groundOffset: 45, shadow: { rx: 108, ry: 50, alpha: 0.12 } },
  // Booth walls + floor only (no text, desk, people or plants: those are drawn on top).
  // Anchor = the far corner where both walls meet the floor. Made from art/reference/stand-*.png.
  // Anchor and width come from the template mapping (3.5 px per world px, far corner at 681.8, 398).
  "stand-about": { src: "/lobby/stand-about.webp", anchor: { x: 0.4297, y: 0.3733 }, width: 350.29 },
  "stand-portfolio": { src: "/lobby/stand-portfolio.webp", anchor: { x: 0.429, y: 0.3719 }, width: 350.86 },
  "stand-skills": { src: "/lobby/stand-skills.webp", anchor: { x: 0.4293, y: 0.3723 }, width: 350.57 },
  "stand-experience": { src: "/lobby/stand-experience.webp", anchor: { x: 0.4292, y: 0.3741 }, width: 350 },
  // Reception desk shared by the four booths, anchored at the centre of its footprint. Made from art/reference/desk.png
  // (9 px per world px, footprint centre at 768, 635.3).
  "desk": { src: "/lobby/desk.webp", anchor: { x: 0.4995, y: 0.6515 }, width: 119.22 },
  // Potted plants (two varieties). Crop tight; width is the widest leaf span at size 1.
  "plant-a": { src: "/lobby/plant-a.webp", anchor: { x: 0.508, y: 1 }, width: 42, groundOffset: 6.2, shadow: { rx: 14, ry: 6 } },
  "plant-b": { src: "/lobby/plant-b.webp", anchor: { x: 0.5, y: 1 }, width: 48, groundOffset: 3.4, shadow: { rx: 12, ry: 5 } },
  // Backless wooden bench whose long side runs down-right (along gx); mirrored for benches along gy.
  // The art was rendered from a ~42° camera (the lobby is 30°), so it is squashed to sit flat on the tiles.
  "bench": { src: "/lobby/bench.webp", anchor: { x: 0.5, y: 1 }, width: 73, groundOffset: 18.75, squashY: 0.75, footprint: { w: 1.8, d: 0.5 } },
  // Lounge sofa, backrest on the back-right side (along gx).
  "sofa": { src: "/lobby/sofa.webp", anchor: { x: 0.502, y: 1 }, width: 78, groundOffset: 17, footprint: { w: 1.6, d: 0.7 } },
  // Street lamp; the halo around the bulb is drawn by code.
  "lamp": { src: "/lobby/lamp.webp", anchor: { x: 0.498, y: 1 }, width: 10.5, groundOffset: 1.8, shadow: { rx: 7, ry: 3, alpha: 0.15 }, glow: { y: 54, r: 13 } },
} satisfies Record<string, AssetEntry>;

export type AssetKey = keyof typeof ASSETS;

export type CharacterPose = "front" | "back" | "wave" | "seated";

/** A character sheet: equal cells side by side, one per pose, all sharing the same ground point. */
export interface CharacterEntry {
  src: string | null;
  /** Poses in the strip, left to right. */
  poses: CharacterPose[];
  /** Ground point inside a cell (0..1): between the feet, or the hips for a seated pose. */
  anchor: { x: number; y: number };
  /** Cell width in world pixels. */
  width: number;
  /** Top of the head above the ground point, in world pixels (negative, like Chibi.headY). */
  headY: number;
}

// Characters from generated sheets (see ASSETS.md). Cells are cut, aligned on the ground point and sized
// by a script so every character stands 62 px tall like the vector chibis (65 with a top bun).
// Seated characters are anchored at the seat contact and measure 48 px from there to the top of the head.
export const CHARACTERS: Record<string, CharacterEntry> = {
  "staff-about": { src: "/lobby/staff-about.webp", poses: ["front", "wave"], anchor: { x: 0.5329, y: 0.9548 }, width: 41.43, headY: -62 },
  "staff-portfolio": { src: "/lobby/staff-portfolio.webp", poses: ["front", "wave"], anchor: { x: 0.5404, y: 0.9739 }, width: 41.03, headY: -62 },
  "staff-skills": { src: "/lobby/staff-skills.webp", poses: ["front", "wave"], anchor: { x: 0.5348, y: 0.9606 }, width: 41.49, headY: -62 },
  "staff-experience": { src: "/lobby/staff-experience.webp", poses: ["front", "wave"], anchor: { x: 0.5171, y: 0.9547 }, width: 42.88, headY: -62 },
  "visitor-1": { src: "/lobby/visitor-1.webp", poses: ["front", "back"], anchor: { x: 0.5835, y: 0.9709 }, width: 36.58, headY: -62 },
  "visitor-2": { src: "/lobby/visitor-2.webp", poses: ["front", "back"], anchor: { x: 0.5629, y: 0.9597 }, width: 41.24, headY: -62 },
  "visitor-3": { src: "/lobby/visitor-3.webp", poses: ["front", "back"], anchor: { x: 0.5284, y: 0.9706 }, width: 33.25, headY: -65 },
  "visitor-4": { src: "/lobby/visitor-4.webp", poses: ["front", "back"], anchor: { x: 0.5664, y: 0.9629 }, width: 36.92, headY: -62 },
  "visitor-5": { src: "/lobby/visitor-5.webp", poses: ["front", "back"], anchor: { x: 0.5683, y: 0.9669 }, width: 37.51, headY: -62 },
  "visitor-6": { src: "/lobby/visitor-6.webp", poses: ["front", "back"], anchor: { x: 0.5158, y: 0.9546 }, width: 43.65, headY: -62 },
  "visitor-7": { src: "/lobby/visitor-7.webp", poses: ["front", "back"], anchor: { x: 0.5802, y: 0.955 }, width: 39.39, headY: -62 },
  "sitter-1": { src: "/lobby/sitter-1.webp", poses: ["seated"], anchor: { x: 0.375, y: 0.7434 }, width: 40.32, headY: -48 },
  "sitter-2": { src: "/lobby/sitter-2.webp", poses: ["seated"], anchor: { x: 0.4111, y: 0.7439 }, width: 38.45, headY: -52 },
  "sitter-3": { src: "/lobby/sitter-3.webp", poses: ["seated"], anchor: { x: 0.3889, y: 0.7398 }, width: 39.59, headY: -48 },
};

const frameCache = new Map<string, Partial<Record<CharacterPose, Texture>>>();

/** The textures of each pose of a character sheet, or null while it has no art. */
export function characterFrames(key: string): Partial<Record<CharacterPose, Texture>> | null {
  const entry = CHARACTERS[key];
  if (!entry?.src || !Assets.cache.has(key)) return null;
  let frames = frameCache.get(key);
  if (!frames) {
    const base = Assets.get<Texture>(key);
    const cellW = base.width / entry.poses.length;
    const made: Partial<Record<CharacterPose, Texture>> = {};
    entry.poses.forEach((pose, i) => {
      made[pose] = new Texture({ source: base.source, frame: new Rectangle(i * cellW, 0, cellW, base.height) });
    });
    frames = made;
    frameCache.set(key, frames);
  }
  return frames;
}

export async function loadAssets(): Promise<void> {
  const entries = [...Object.entries(ASSETS as Record<string, AssetEntry>), ...Object.entries(CHARACTERS)].filter(([, a]) => a.src);
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
  const scaleY = scale * (entry.squashY ?? 1);
  sprite.scale.set(flipX ? -scale : scale, scaleY);
  const anchorY = entry.groundOffset !== undefined ? 1 - (entry.groundOffset * size) / scaleY / tex.height : entry.anchor.y;
  sprite.anchor.set(entry.anchor.x, anchorY);
  if (!entry.shadow && !entry.glow && !entry.footprint) return sprite;

  const holder = new Container();
  if (entry.shadow) {
    const { rx, ry, alpha = 0.16 } = entry.shadow;
    holder.addChild(new Graphics().ellipse(0, 0, rx * size, ry * size).fill({ color: 0x000000, alpha }));
  }
  if (entry.footprint) {
    // two stacked parallelograms fake a soft edge without a blur filter
    const { w, d, alpha = 0.12 } = entry.footprint;
    const g = new Graphics();
    [[0.35, alpha * 0.5], [0.1, alpha]].forEach(([grow, a]) => {
      const hw = ((w + grow) * size) / 2;
      const hd = ((d + grow) * size) / 2;
      const pts = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].flatMap(([x, y]) => {
        const p = iso(x, y);
        return [flipX ? -p.x : p.x, p.y];
      });
      g.poly(pts).fill({ color: 0x000000, alpha: a });
    });
    holder.addChild(g);
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
