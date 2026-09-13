import type { Content } from "@/content/sections";
import type { StandId } from "./store";

// Everything about the world layout lives here, in grid units.
// Tweak positions/lines without touching engine code.

export const WORLD_SIZE = 31;
export const PLAZA_CENTER = { gx: 15, gy: 15 };
/** Entrance mat: center and side length in tiles. Matches public/lobby/lobby-floor.png. */
export const ENTRANCE_MAT = { gx: 27.1, gy: 27.1, size: 4 };

export const PALETTE = {
  background: 0x1c2231,
  floor: 0xefe8de,
  floorAlt: 0xe6ddd0,
  floorLine: 0xd9cfc1,
  floorEdge: 0xb7ab9a,
  wall: 0xfaf6f0,
  wallShade: 0xe9e2d7,
  navy: 0x1f2a44,
  wood: 0xb98a5e,
  woodDark: 0x8f6643,
  glow: 0xffd27a,
  leaf: 0x5f8d4e,
  leafLight: 0x7fae63,
  leafDark: 0x3f6a3a,
  pot: 0x3a3f4b,
  skin: 0xf6d7bf,
  hair: 0x2d2420,
  ink: 0x1f2a44,
};

type StandText = Content["lobby"]["stands"][StandId];

export interface StandLayout {
  id: StandId;
  /** Far corner of the footprint, in grid units. */
  gx: number;
  gy: number;
  w: number;
  d: number;
  accent: number;
  /** Left (side) wall color: each booth’s theme, picked from the island palette. */
  sideWall: number;
  icon: "person" | "folder" | "gear" | "briefcase";
  receptionist: { hair: number; shirt: number; glasses?: boolean };
}

/** Layout plus the signage/greetings in the current language (texts live in src/content). */
export type StandConfig = StandLayout & StandText;

// Side walls by theme: About = warm sand (personal), Portfolio = navy (work),
// Skills = sage (growth), Experience = walnut (career path).
// Walls sit on each booth’s far edges (gx and gy), so visitor routes stay on the open (near) sides.
const STAND_LAYOUT: StandLayout[] = [
  { id: "about", gx: 3.5, gy: 4, w: 6, d: 4.5, accent: 0xc9a27a, sideWall: 0xdcb68c, icon: "person", receptionist: { hair: 0x2d2420, shirt: 0x2f3b5c } },
  { id: "portfolio", gx: 4, gy: 18, w: 6, d: 4.5, accent: 0x1f2a44, sideWall: 0x2a3657, icon: "folder", receptionist: { hair: 0x3b2a22, shirt: 0x1f2a44 } },
  { id: "skills", gx: 18, gy: 4, w: 6, d: 4.5, accent: 0x4f6b62, sideWall: 0x5f7f6f, icon: "gear", receptionist: { hair: 0x4a3226, shirt: 0x4f6b62, glasses: true } },
  { id: "experience", gx: 22.5, gy: 16, w: 6, d: 4.5, accent: 0x8a6a52, sideWall: 0x8a6448, icon: "briefcase", receptionist: { hair: 0x5a3b2a, shirt: 0x2f3b5c } },
];

export function standsFor(text: Content["lobby"]): StandConfig[] {
  return STAND_LAYOUT.map((layout) => ({ ...layout, ...text.stands[layout.id] }));
}

// Walkable graph for visitors: a ring around the central planter plus a few spurs.
export const WAYPOINTS: Record<string, { gx: number; gy: number; links: string[]; faces?: StandId }> = {
  r0: { gx: 20.6, gy: 15, links: ["r1", "r7"] },
  r1: { gx: 19, gy: 19, links: ["r0", "r2", "gate"] },
  r2: { gx: 15, gy: 20.6, links: ["r1", "r3", "lounge"] },
  r3: { gx: 11, gy: 19, links: ["r2", "r4", "port"] },
  r4: { gx: 9.4, gy: 15, links: ["r3", "r5", "port"] },
  r5: { gx: 11, gy: 11, links: ["r4", "r6", "about"] },
  r6: { gx: 15, gy: 9.4, links: ["r5", "r7", "about", "skill"] },
  r7: { gx: 19, gy: 11, links: ["r6", "r0", "skill"] },
  about: { gx: 10.4, gy: 10, links: ["r5", "r6"], faces: "about" },
  port: { gx: 11.2, gy: 20.4, links: ["r3", "r4"], faces: "portfolio" },
  skill: { gx: 19.5, gy: 9.8, links: ["r6", "r7"], faces: "skills" },
  exp: { gx: 25, gy: 21.8, links: ["gate"], faces: "experience" },
  gate: { gx: 22.3, gy: 22.3, links: ["r1", "exp"] },
  lounge: { gx: 17, gy: 22.2, links: ["r2"] },
};

export const VISITORS = [
  { hair: 0x2d2420, shirt: 0x3c4a6b, curly: true },
  { hair: 0x6b4a33, shirt: 0xd9d2c5 },
  { hair: 0xe3c68f, shirt: 0x2f3b5c, bun: true },
  { hair: 0x2d2420, shirt: 0x8a6a52, bun: true },
  { hair: 0x3b2a22, shirt: 0x4f6b62, curly: true },
  { hair: 0x1f1a17, shirt: 0xe9e2d7 },
  { hair: 0x5a3b2a, shirt: 0x1f2a44 },
];

// Seated visitors: grid position and facing (+1 right, -1 left). Their lines come from content.lobby.sitterLines.
export const SITTERS = [
  { gx: 12.3, gy: 15.6, dir: 1, hair: 0x2d2420, shirt: 0x2f3b5c, laptop: true },
  { gx: 17.6, gy: 14.4, dir: -1, hair: 0xe3c68f, shirt: 0xd9d2c5, bun: true },
  { gx: 15.2, gy: 24.2, dir: 1, hair: 0x3b2a22, shirt: 0x8a6a52, laptop: true },
];
