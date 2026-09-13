import type { Content } from "@/content/sections";
import type { StandId } from "./store";

// Everything about the world layout lives here, in grid units.
// Tweak positions/lines without touching engine code.

export const WORLD_SIZE = 27;
export const PLAZA_CENTER = { gx: 13, gy: 13 };

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
  icon: "person" | "folder" | "gear" | "briefcase";
  receptionist: { hair: number; shirt: number; glasses?: boolean };
}

/** Layout plus the signage/greetings in the current language (texts live in src/content). */
export type StandConfig = StandLayout & StandText;

const STAND_LAYOUT: StandLayout[] = [
  { id: "about", gx: 2.5, gy: 3, w: 5.5, d: 4, accent: 0xc9a27a, icon: "person", receptionist: { hair: 0x2d2420, shirt: 0x2f3b5c } },
  { id: "portfolio", gx: 3, gy: 15, w: 5.5, d: 4, accent: 0x1f2a44, icon: "folder", receptionist: { hair: 0x3b2a22, shirt: 0x1f2a44 } },
  { id: "skills", gx: 15, gy: 3, w: 5.5, d: 4, accent: 0x4f6b62, icon: "gear", receptionist: { hair: 0x4a3226, shirt: 0x4f6b62, glasses: true } },
  { id: "experience", gx: 19.5, gy: 13.5, w: 5.5, d: 4, accent: 0x8a6a52, icon: "briefcase", receptionist: { hair: 0x5a3b2a, shirt: 0x2f3b5c } },
];

export function standsFor(text: Content["lobby"]): StandConfig[] {
  return STAND_LAYOUT.map((layout) => ({ ...layout, ...text.stands[layout.id] }));
}

// Walkable graph for visitors: a ring around the central planter plus a few spurs.
export const WAYPOINTS: Record<string, { gx: number; gy: number; links: string[]; faces?: StandId }> = {
  r0: { gx: 18.6, gy: 13, links: ["r1", "r7", "exp"] },
  r1: { gx: 17, gy: 17, links: ["r0", "r2", "gate"] },
  r2: { gx: 13, gy: 18.6, links: ["r1", "r3", "lounge"] },
  r3: { gx: 9, gy: 17, links: ["r2", "r4", "port"] },
  r4: { gx: 7.4, gy: 13, links: ["r3", "r5", "port"] },
  r5: { gx: 9, gy: 9, links: ["r4", "r6", "about"] },
  r6: { gx: 13, gy: 7.4, links: ["r5", "r7", "about", "skill"] },
  r7: { gx: 17, gy: 9, links: ["r6", "r0", "skill"] },
  about: { gx: 7, gy: 8.8, links: ["r5", "r6"], faces: "about" },
  port: { gx: 9.6, gy: 15.4, links: ["r3", "r4"], faces: "portfolio" },
  skill: { gx: 16.5, gy: 8.2, links: ["r6", "r7"], faces: "skills" },
  exp: { gx: 19, gy: 18.4, links: ["r0", "gate"], faces: "experience" },
  gate: { gx: 20.5, gy: 20.5, links: ["r1", "exp"] },
  lounge: { gx: 15, gy: 20.2, links: ["r2"] },
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
  { gx: 10.3, gy: 13.6, dir: 1, hair: 0x2d2420, shirt: 0x2f3b5c, laptop: true },
  { gx: 15.6, gy: 12.4, dir: -1, hair: 0xe3c68f, shirt: 0xd9d2c5, bun: true },
  { gx: 13.2, gy: 22.2, dir: 1, hair: 0x3b2a22, shirt: 0x8a6a52, laptop: true },
];
