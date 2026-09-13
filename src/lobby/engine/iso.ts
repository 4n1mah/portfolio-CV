// Isometric 2:1 projection. The world is authored in grid units (gx, gy);
// everything on screen is derived from these helpers.

export const TILE_W = 64;
export const TILE_H = 32;

export interface Point {
  x: number;
  y: number;
}

export function iso(gx: number, gy: number): Point {
  return { x: (gx - gy) * (TILE_W / 2), y: (gx + gy) * (TILE_H / 2) };
}

/** Flat [x0,y0,x1,y1,...] polygon of a grid rectangle lifted by `z` pixels. */
export function rectPoly(gx: number, gy: number, w: number, d: number, z = 0): number[] {
  const a = iso(gx, gy);
  const b = iso(gx + w, gy);
  const c = iso(gx + w, gy + d);
  const e = iso(gx, gy + d);
  return [a.x, a.y - z, b.x, b.y - z, c.x, c.y - z, e.x, e.y - z];
}

/** Draw order: things further down-screen are drawn later. */
export function depth(gx: number, gy: number): number {
  return (gx + gy) * 100;
}

/** Radii of an isometric circle with a radius of `r` grid units. */
export function isoCircle(r: number): { rx: number; ry: number } {
  return { rx: r * (TILE_W / 2) * Math.SQRT2, ry: r * (TILE_H / 2) * Math.SQRT2 };
}

/** Skew that lays text flat on a wall running along the gx (+1) or gy (-1) axis. */
export const WALL_SKEW = Math.atan2(TILE_H, TILE_W);
