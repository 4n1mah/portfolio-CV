import { Container, Graphics, Text, type TextStyleOptions } from "pixi.js";
import { PALETTE } from "../config";
import { iso, isoCircle, rectPoly } from "../engine/iso";

// Vector placeholder primitives. Coordinates are local to the piece's ground
// point unless a function says otherwise.

export const fonts = { sans: "system-ui, sans-serif", script: "cursive" };

export function label(text: string, style: TextStyleOptions): Text {
  const t = new Text({ text, style: { fontFamily: fonts.sans, ...style }, resolution: 3 });
  return t;
}

function shade(color: number, factor: number): number {
  const r = Math.min(255, Math.round(((color >> 16) & 255) * factor));
  const g = Math.min(255, Math.round(((color >> 8) & 255) * factor));
  const b = Math.min(255, Math.round((color & 255) * factor));
  return (r << 16) | (g << 8) | b;
}

/** Isometric box in absolute world coordinates. */
export function box(g: Graphics, gx: number, gy: number, w: number, d: number, h: number, color: number, z = 0) {
  const top = rectPoly(gx, gy, w, d, z + h);
  const p1 = iso(gx + w, gy);
  const p2 = iso(gx + w, gy + d);
  const p3 = iso(gx, gy + d);
  // right face (gx + w edge)
  g.poly([p1.x, p1.y - z, p2.x, p2.y - z, p2.x, p2.y - z - h, p1.x, p1.y - z - h]).fill(shade(color, 0.82));
  // left face (gy + d edge)
  g.poly([p3.x, p3.y - z, p2.x, p2.y - z, p2.x, p2.y - z - h, p3.x, p3.y - z - h]).fill(shade(color, 0.92));
  g.poly(top).fill(color);
}

/** Vertical wall along the gx axis at `gy` (visible face points down-left). */
export function wallX(g: Graphics, gx: number, gy: number, len: number, h: number, color: number, thick = 0.18) {
  box(g, gx, gy - thick, len, thick, h, color);
}

/** Vertical wall along the gy axis at `gx` (visible face points down-right). */
export function wallY(g: Graphics, gx: number, gy: number, len: number, h: number, color: number, thick = 0.18) {
  box(g, gx - thick, gy, thick, len, h, color);
}

export function plant(size = 1, variant = 0): Container {
  const c = new Container();
  const g = new Graphics();
  const s = size;
  g.ellipse(0, 0, 14 * s, 6 * s).fill({ color: 0x000000, alpha: 0.12 });
  // pot
  g.roundRect(-9 * s, -20 * s, 18 * s, 20 * s, 3 * s).fill(PALETTE.pot);
  g.ellipse(0, -20 * s, 9 * s, 3.5 * s).fill(shade(PALETTE.pot, 1.3));
  // foliage
  const leaves = [PALETTE.leafDark, PALETTE.leaf, PALETTE.leafLight];
  const blobs =
    variant === 0
      ? [[-8, -34, 11], [8, -36, 11], [0, -48, 12], [-4, -58, 8], [6, -54, 8]]
      : [[-10, -30, 9], [10, -30, 9], [0, -40, 12], [-6, -52, 9], [7, -50, 9], [0, -62, 7]];
  blobs.forEach(([x, y, r], i) => {
    g.circle(x * s, y * s, r * s).fill(leaves[i % 3]);
  });
  c.addChild(g);
  return c;
}

export function bench(alongX: boolean): Container {
  const c = new Container();
  const g = new Graphics();
  const w = alongX ? 1.8 : 0.6;
  const d = alongX ? 0.6 : 1.8;
  g.ellipse(0, 4, 44, 14).fill({ color: 0x000000, alpha: 0.1 });
  box(g, -w / 2, -d / 2, w, d, 10, PALETTE.woodDark);
  box(g, -w / 2, -d / 2, w, d, 4, PALETTE.wood, 10);
  c.addChild(g);
  return c;
}

export function lamp(): Container {
  const c = new Container();
  const g = new Graphics();
  g.ellipse(0, 0, 7, 3).fill({ color: 0x000000, alpha: 0.15 });
  g.rect(-1.5, -46, 3, 46).fill(PALETTE.navy);
  g.circle(0, -50, 12).fill({ color: PALETTE.glow, alpha: 0.25 });
  g.circle(0, -50, 6).fill(0xfff1cf);
  c.addChild(g);
  return c;
}

export function planter(radius: number): Container {
  const c = new Container();
  const g = new Graphics();
  const { rx, ry } = isoCircle(radius);
  const h = 34;
  g.ellipse(0, 8, rx + 14, ry + 8).fill({ color: PALETTE.glow, alpha: 0.18 });
  // side band
  g.rect(-rx, -h, rx * 2, h).fill(0xd9d2c7);
  g.ellipse(0, 0, rx, ry).fill(0xd9d2c7);
  g.ellipse(0, -h, rx, ry).fill(0xf4efe7);
  g.ellipse(0, -h, rx - 8, ry - 4).fill(0x6b5443);
  // warm light strip
  g.ellipse(0, -2, rx, ry).stroke({ width: 2, color: PALETTE.glow, alpha: 0.7 });
  // bushes + tree
  const bushes = 10;
  for (let i = 0; i < bushes; i++) {
    const a = (i / bushes) * Math.PI * 2;
    g.circle(Math.cos(a) * (rx - 22), -h - 6 + Math.sin(a) * (ry - 12), 14).fill(i % 2 ? PALETTE.leaf : PALETTE.leafLight);
  }
  g.rect(-4, -h - 70, 8, 60).fill(PALETTE.woodDark);
  const crown = [[-26, -110, 26], [24, -112, 26], [0, -132, 30], [-14, -150, 20], [16, -146, 20], [0, -96, 22]];
  crown.forEach(([x, y, r], i) => g.circle(x, y - h + 34, r).fill(i % 2 ? PALETTE.leafDark : PALETTE.leaf));
  c.addChild(g);
  return c;
}

/** Standing sign board that grows to fit its lines. */
export function sign(lines: string[], opts: { dark?: boolean } = {}): Container {
  const c = new Container();
  const g = new Graphics();
  const texts = lines.map((line) =>
    label(line, { fontSize: 6.5, fill: opts.dark ? 0xffffff : PALETTE.ink, fontWeight: "600", letterSpacing: 0.5 }),
  );
  const pad = 6;
  const lineH = 9;
  const w = Math.max(46, ...texts.map((t) => t.width + pad * 2));
  const h = Math.max(40, texts.length * lineH + pad * 2);
  const top = -h - 10;
  g.ellipse(0, 0, w * 0.4, 6).fill({ color: 0x000000, alpha: 0.15 });
  g.rect(-3, -10, 6, 10).fill(PALETTE.navy);
  g.roundRect(-w / 2 - 3, top - 3, w + 6, h + 6, 3).fill(PALETTE.navy);
  g.roundRect(-w / 2, top, w, h, 2).fill(opts.dark ? PALETTE.navy : PALETTE.wall);
  c.addChild(g);
  texts.forEach((t, i) => {
    t.x = -w / 2 + pad;
    t.y = top + pad + i * lineH;
    c.addChild(t);
  });
  return c;
}
