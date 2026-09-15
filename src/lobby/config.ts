import type { Content } from "@/content/sections";
import type { PlaceId, StandId } from "./store";

// Everything about the world layout lives here, in grid units.
// Tweak positions/lines without touching engine code.

export const WORLD_SIZE = 31;
export const PLAZA_CENTER = { gx: 15, gy: 15 };

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
// The booths form an emerald around the plaza on screen: About on top, Portfolio left, Skills right
// (Portfolio mirrored across the vertical axis, i.e. its footprint centre with gx and gy swapped)
// and Experience at the bottom, pushed down just enough for its walls to clear the plaza rim.
const STAND_LAYOUT: StandLayout[] = [
  { id: "about", gx: 3.5, gy: 4, w: 6, d: 4.5, accent: 0xc9a27a, sideWall: 0xdcb68c, icon: "person", receptionist: { hair: 0x2d2420, shirt: 0x2f3b5c } },
  { id: "portfolio", gx: 3.875, gy: 18.75, w: 6, d: 4.5, accent: 0x1f2a44, sideWall: 0x2a3657, icon: "folder", receptionist: { hair: 0x3b2a22, shirt: 0x1f2a44 } },
  { id: "skills", gx: 18, gy: 4.625, w: 6, d: 4.5, accent: 0x4f6b62, sideWall: 0x5f7f6f, icon: "gear", receptionist: { hair: 0x4a3226, shirt: 0x4f6b62, glasses: true } },
  { id: "experience", gx: 21.55, gy: 22.55, w: 6, d: 4.5, accent: 0x8a6a52, sideWall: 0x8a6448, icon: "briefcase", receptionist: { hair: 0x5a3b2a, shirt: 0x2f3b5c } },
];

export function standsFor(text: Content["lobby"]): StandConfig[] {
  return STAND_LAYOUT.map((layout) => ({ ...layout, ...text.stands[layout.id] }));
}

/** Where a booth's receptionist stands (the desk is 0.85 tiles in front, towards +gy). */
export function receptionistSpot({ gx, gy, w, d }: Pick<StandLayout, "gx" | "gy" | "w" | "d">) {
  return { gx: gx + w * 0.5, gy: gy + d * 0.42 };
}
const standDesk = (id: StandId) => receptionistSpot(STAND_LAYOUT.find((s) => s.id === id)!);

// Upcoming features in three of the gaps between booths (drawn in layers/Features.ts).
// Visitor notes: a freestanding mural centred in the gap between About and Portfolio. It runs along gy from
// (gx, gy) for `d` tiles and faces down-right, towards the plaza.
export const NOTES_BOARD = { gx: 6.6, gy: 12.6, d: 2, color: 0xd9b25f };
// Most visited sections: a freestanding screen between Portfolio and Experience. It runs along gx from
// (gx, gy) and faces down-left, like the booths' main walls.
export const STATS_BOARD = { gx: 12, gy: 26, w: 4 };
// Anima's round desk, in the middle of the gap between Skills and Experience.
export const ANIMA_DESK = { gx: 23.4, gy: 15.6, receptionist: { hair: 0xe3c68f, shirt: 0x1f2a44 } };

// Walkable graph for visitors (links go both ways). A ring circles the plaza; spurs lead to the viewing spot of
// every place. Each straight link was checked to clear the planter, benches, lamps, booth walls, the stats screen
// and Anima's desk by about a tile, which leaves room for the walking lanes and the side-by-side slots.
export const WAYPOINTS: Record<string, { gx: number; gy: number; links: string[] }> = {
  r0: { gx: 20.6, gy: 15, links: ["r1", "r7"] },
  r1: { gx: 19, gy: 19, links: ["r0", "r2", "lounge", "anima"] },
  r2: { gx: 15, gy: 20.6, links: ["r1", "r3", "lounge"] },
  r3: { gx: 11, gy: 19, links: ["r2", "r4", "portGate"] },
  r4: { gx: 9.4, gy: 15, links: ["r3", "r5", "notes"] },
  r5: { gx: 11, gy: 11, links: ["r4", "r6", "about", "notes"] },
  r6: { gx: 15, gy: 9.4, links: ["r5", "r7", "about", "skills"] },
  r7: { gx: 19, gy: 11, links: ["r6", "r0", "skills"] },
  // booth desks face +gy, so visitors stand in front of them; Portfolio and Experience open away from the plaza
  about: { gx: 6.5, gy: 9.6, links: ["r5", "r6", "notes"] },
  skills: { gx: 19.6, gy: 9.9, links: ["r6", "r7"] },
  portGate: { gx: 10.8, gy: 24.2, links: ["r3", "portfolio", "statsL"] },
  portfolio: { gx: 6.9, gy: 24.2, links: ["portGate"] },
  lounge: { gx: 17, gy: 22.2, links: ["r1", "r2", "anima", "statsR", "expGate"] },
  expGate: { gx: 21, gy: 28.3, links: ["lounge", "statsR", "experience"] },
  experience: { gx: 24.55, gy: 28.1, links: ["expGate"] },
  // upcoming features: in front of the mural, of the screen (walking round its cones) and at the edge of Anima's ring
  notes: { gx: 8.4, gy: 13.6, links: ["r4", "r5", "about"] },
  statsL: { gx: 10.3, gy: 27.3, links: ["portGate", "stats"] },
  stats: { gx: 14, gy: 27.5, links: ["statsL", "statsR"] },
  statsR: { gx: 17.6, gy: 27.2, links: ["stats", "lounge", "expGate"] },
  anima: { gx: 24.6, gy: 17.4, links: ["r1", "lounge"] },
};

export interface PlaceLayout {
  /** Waypoints a visitor can stand at to look at the place. */
  spots: string[];
  /** What they look at (a receptionist, the mural, the tree…). */
  look: { gx: number; gy: number };
  /** Tiles from the spot towards `look`: spots are on the walkways, so visitors step off them to stand and look. */
  step: number;
  /** How often it is chosen, relative to the others. */
  weight: number;
  /** Seconds spent there. */
  dwell: [number, number];
}

// Destinations. Each spot holds two visitors side by side (see engine/crowd.ts).
export const PLACES: Record<PlaceId, PlaceLayout> = {
  about: { spots: ["about"], look: standDesk("about"), step: 0.7, weight: 3, dwell: [3, 6] },
  portfolio: { spots: ["portfolio"], look: standDesk("portfolio"), step: 0.7, weight: 3, dwell: [3, 6] },
  skills: { spots: ["skills"], look: standDesk("skills"), step: 0.7, weight: 3, dwell: [3, 6] },
  experience: { spots: ["experience"], look: standDesk("experience"), step: 0.7, weight: 3, dwell: [3, 6] },
  notes: { spots: ["notes"], look: { gx: NOTES_BOARD.gx, gy: NOTES_BOARD.gy + NOTES_BOARD.d / 2 }, step: 0.7, weight: 1.5, dwell: [2.5, 4.5] },
  stats: { spots: ["stats"], look: { gx: STATS_BOARD.gx + STATS_BOARD.w / 2, gy: STATS_BOARD.gy }, step: 0.7, weight: 1.5, dwell: [2.5, 4.5] },
  anima: { spots: ["anima"], look: { gx: ANIMA_DESK.gx + 0.2, gy: ANIMA_DESK.gy - 0.25 }, step: 0.4, weight: 2, dwell: [3, 5] },
  // r1 and r5 are left out: their step inwards lands next to the plaza lamps; Anima steps less, her desk is close
  plaza: { spots: ["r0", "r2", "r3", "r4", "r6", "r7"], look: PLAZA_CENTER, step: 1.1, weight: 1.5, dwell: [2, 4] },
};

// `sheet` is the character art (CHARACTERS in assets.ts); the colors draw the vector chibi while it is missing.
export const VISITORS = [
  { sheet: "visitor-1", hair: 0x2d2420, shirt: 0x3c4a6b, curly: true },
  { sheet: "visitor-2", hair: 0x6b4a33, shirt: 0xd9d2c5 },
  { sheet: "visitor-3", hair: 0xe3c68f, shirt: 0x2f3b5c, bun: true },
  { sheet: "visitor-4", hair: 0x2d2420, shirt: 0x8a6a52, bun: true },
  { sheet: "visitor-5", hair: 0x3b2a22, shirt: 0x4f6b62, curly: true },
  { sheet: "visitor-6", hair: 0x1f1a17, shirt: 0xe9e2d7 },
  { sheet: "visitor-7", hair: 0x5a3b2a, shirt: 0x1f2a44 },
];

// Seated visitors and the seat under each one. Their lines come from content.lobby.sitterLines.
// The visitor sits a touch in front of the seat centre, facing away from the backrest side:
// benches along gy face down-right (dir +1), the sofa along gx faces down-left (dir -1).
// The sofa is a lounge corner in front of Skills, looking over the plaza.
// seat.h is the seat top height in world px, measured on the seat art.
export const SITTERS = [
  { sheet: "sitter-1", gx: 12.24, gy: 15.7, dir: 1, hair: 0x2d2420, shirt: 0x2f3b5c, laptop: true, seat: { kind: "bench", gx: 12.1, gy: 15.4, h: 11 } },
  { sheet: "sitter-2", gx: 17.94, gy: 14.6, dir: 1, hair: 0xe3c68f, shirt: 0xd9d2c5, bun: true, seat: { kind: "bench", gx: 17.8, gy: 14.6, h: 11 } },
  { sheet: "sitter-3", gx: 22.5, gy: 11.5, dir: -1, hair: 0x3b2a22, shirt: 0x8a6a52, laptop: true, seat: { kind: "sofa", gx: 22.5, gy: 11.3, h: 9 } },
];
