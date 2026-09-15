import { Container, Graphics, Polygon } from "pixi.js";
import gsap from "gsap";
import type { Content } from "@/content/sections";
import { ANIMA_DESK, NOTES_BOARD, PALETTE, STATS_BOARD } from "../config";
import { depth, iso, isoCircle, rectPoly, TILE_W, WALL_SKEW, type Point } from "../engine/iso";
import { piece } from "../assets";
import type { FeatureId } from "../store";
import { Bubble } from "./Bubble";
import { Chibi } from "./Chibi";
import { box, label } from "./draw";

// Upcoming features shown as "under construction" spots between the booths. Like the booths they
// glow on hover and open a panel on click; their art slots in through `piece()` (see ASSETS.md),
// while every piece of text is drawn here in the current language.

type LobbyText = Content["lobby"];

/** Width of a wall face (or screen) of `len` tiles once its skew is undone. */
const flatLength = (len: number) => (len * TILE_W) / 2 / Math.cos(WALL_SKEW);

/** Soft contact shadow on the floor: a grid rectangle drawn twice, slightly grown, at low alpha (no blur filter). */
function contactShadow(gx: number, gy: number, w: number, d: number, alpha = 0.16): Graphics {
  const g = new Graphics();
  for (const [grow, a] of [[0.35, alpha * 0.45], [0.1, alpha]]) {
    g.poly(rectPoly(gx - grow / 2, gy - grow / 2, w + grow, d + grow)).fill({ color: 0x000000, alpha: a });
  }
  g.zIndex = -1;
  return g;
}

/** Shared hover glow and camera framing. Children are local to the spot's anchor on the floor. */
export abstract class FeatureSpot extends Container {
  abstract readonly spotId: FeatureId;
  /** World area the camera fits when the spot is opened. */
  abstract readonly focusSize: { w: number; h: number };
  protected glow = new Container();
  protected hovered = false;
  private t = Math.random() * 10;

  constructor(anchor: Point, z: number) {
    super();
    this.position.set(anchor.x, anchor.y);
    this.zIndex = z;
    this.sortableChildren = true;
    this.eventMode = "static";
    this.cursor = "pointer";
  }

  /** World point the camera centres on. */
  abstract get focusPoint(): Point;

  protected addGlow(g: Graphics) {
    g.blendMode = "add";
    this.glow.addChild(g);
    this.glow.alpha = 0;
    this.glow.zIndex = 5;
    this.addChild(this.glow);
  }

  setHover(on: boolean, reducedMotion: boolean, message?: string) {
    const changed = on !== this.hovered;
    this.hovered = on;
    if (changed) gsap.to(this.glow, { alpha: on ? 1 : 0, duration: reducedMotion ? 0 : 0.35 });
    this.onHover(on, reducedMotion, changed, message);
  }

  /** Extra hover behaviour (a greeting, a wave). `changed` is false when hovered again, e.g. on open. */
  protected onHover(on: boolean, reducedMotion: boolean, changed: boolean, message?: string) {
    void [on, reducedMotion, changed, message];
  }

  update(dt: number) {
    this.t += dt * 0.004;
    if (this.hovered) this.glow.children[0].alpha = 0.75 + Math.sin(this.t * 2) * 0.25;
  }
}

// --- Visitor notes mural -------------------------------------------------------------------------

/** Freestanding mural on a low base; its face looks down-right, towards the plaza. */
const MURAL = { base: 7, h: 103, thick: 0.2 };
/** Title strip and cork board on the mural face (x along the mural from its front end, y up). */
const MURAL_TITLE_Y = -MURAL.base - MURAL.h + 12.5;
const CORK = { x: 2, top: -MURAL.base - MURAL.h + 23, bottom: -MURAL.base - 17 };

export class NotesBoard extends FeatureSpot {
  readonly spotId = "notes";
  readonly focusSize = { w: 300, h: 300 };

  constructor(text: LobbyText) {
    const { gx, gy, d } = NOTES_BOARD;
    // anchored at the mural's front end on the floor; it runs back along gy
    super(iso(gx, gy + d), depth(gx, gy + d / 2));

    this.addChild(contactShadow(-0.4, -d - 0.1, 0.8, d + 0.2), piece("notes-board", () => this.buildMural()));

    // title and a "coming soon" ribbon across the cork board, laid flat on the mural face
    const flatD = flatLength(d);
    const face = new Container();
    face.skew.y = -WALL_SKEW;
    face.zIndex = 0.5;
    const title = label(text.notesSign, { fontSize: 9, fontWeight: "800", fill: PALETTE.ink });
    title.anchor.set(0.5);
    title.scale.set(Math.min(1, (flatD - 12) / title.width));
    title.position.set(flatD / 2, MURAL_TITLE_Y);
    const soon = label(text.comingSoon, { fontSize: 8, fontWeight: "800", fill: PALETTE.navy, letterSpacing: 1 });
    soon.anchor.set(0.5);
    soon.scale.set(Math.min(1, (flatD - 14) / soon.width));
    const rw = soon.width + 12;
    const ribbon = new Container();
    ribbon.addChild(new Graphics().rect(-rw / 2, -7, rw, 14).fill(PALETTE.glow).stroke({ width: 1, color: 0xc99a3a }), soon);
    ribbon.position.set(flatD / 2, (CORK.top + CORK.bottom) / 2);
    ribbon.rotation = -0.14;
    face.addChild(title, ribbon);
    this.addChild(face);

    const top = -MURAL.base - MURAL.h;
    const back = iso(0, -d);
    const g = new Graphics();
    g.poly([0, top, back.x, back.y + top, back.x, back.y, 0, 0]).fill({ color: PALETTE.glow, alpha: 0.1 }).stroke({ width: 3, color: PALETTE.glow });
    g.poly(rectPoly(0, -d, 1.3, d)).fill({ color: PALETTE.glow, alpha: 0.12 });
    this.addGlow(g);

    const f1 = iso(1.3, -d);
    const f2 = iso(1.3, 0);
    this.hitArea = new Polygon([0, top, back.x, back.y + top, back.x, back.y, f1.x, f1.y, f2.x, f2.y]);
  }

  get focusPoint(): Point {
    const { gx, gy, d } = NOTES_BOARD;
    const p = iso(gx, gy + d / 2);
    return { x: p.x, y: p.y - MURAL.base - MURAL.h / 2 + 10 };
  }

  /** Placeholder mural: mustard panel on a wooden base with a cork board full of sticky notes. */
  private buildMural(): Container {
    const { d } = NOTES_BOARD;
    const c = new Container();
    const g = new Graphics();
    box(g, -0.3, -d, 0.4, d, MURAL.base, PALETTE.woodDark);
    box(g, -MURAL.thick, -d, MURAL.thick, d, MURAL.h, NOTES_BOARD.color, MURAL.base);
    c.addChild(g);

    const flatD = flatLength(d);
    const face = new Container();
    face.skew.y = -WALL_SKEW;
    const bw = flatD - CORK.x * 2;
    const bh = CORK.bottom - CORK.top;
    const board = new Graphics().roundRect(CORK.x, CORK.top, bw, bh, 3).fill(PALETTE.woodDark);
    board.rect(CORK.x + 3, CORK.top + 3, bw - 6, bh - 6).fill(0xd6b48a);
    const colors = [0xffe28a, 0xffb8a8, 0xbfe3c0, 0xa8d4f0, 0xf6c1e0];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const x = CORK.x + 7 + col * ((bw - 14) / 4) + (row % 2) * 3;
        board.rect(x, CORK.top + 6 + row * 19, 11, 11).fill(colors[(row * 4 + col) % colors.length]);
      }
    }
    face.addChild(board);
    c.addChild(face);
    return c;
  }
}

// --- Most visited sections board -----------------------------------------------------------------

const SCREEN_LEGS = 10;
const SCREEN_H = 90;
/** Chart area inside the frame (screen-face coordinates, from the screen top); the title sits on the top frame bar. */
const CHART = { top: 11, bottom: 6 };
/** Cones in front of the screen, in world px from the anchor (where they stand in the art). */
const CONES = [[1, -2], [125, 53]];

export class StatsBoard extends FeatureSpot {
  readonly spotId = "stats";
  readonly focusSize = { w: 360, h: 300 };

  constructor(text: LobbyText) {
    const { gx, gy, w } = STATS_BOARD;
    super(iso(gx, gy), depth(gx + w / 2, gy));

    const shadow = contactShadow(-0.15, -0.5, w + 0.3, 1);
    for (const [x, y] of CONES) shadow.ellipse(x + 2, y + 1, 7, 3).fill({ color: 0x000000, alpha: 0.14 });
    this.addChild(shadow, piece("stats-board", () => this.buildBoard()));

    // screen title and the "under construction" plate, laid flat on the screen face
    const flatW = flatLength(w);
    const top = -SCREEN_LEGS - SCREEN_H;
    const face = new Container();
    face.skew.y = WALL_SKEW;
    face.zIndex = 0.5;
    const title = label(text.statsTitle, { fontSize: 6, fontWeight: "800", fill: 0xffffff, letterSpacing: 1 });
    title.anchor.set(0.5);
    title.scale.set(Math.min(1, (flatW - 30) / title.width));
    title.position.set(flatW / 2, top + 5);
    const warn = label(text.underConstruction, { fontSize: 8, fontWeight: "800", fill: 0x1f1a17, letterSpacing: 1 });
    warn.anchor.set(0.5);
    const pw = warn.width + 18;
    const plate = new Container();
    const pg = new Graphics().roundRect(-pw / 2, -9, pw, 18, 3).fill(0xf2c230).stroke({ width: 1.5, color: 0x1f1a17 });
    plate.addChild(pg, warn);
    plate.position.set(flatW / 2, top + SCREEN_H / 2);
    plate.rotation = -0.05;
    face.addChild(title, plate);
    this.addChild(face);

    const e = iso(w, 0);
    const g = new Graphics();
    g.poly([0, top, e.x, e.y + top, e.x, e.y - SCREEN_LEGS, 0, -SCREEN_LEGS]).fill({ color: PALETTE.glow, alpha: 0.1 }).stroke({ width: 3, color: PALETTE.glow });
    g.poly(rectPoly(0, 0, w, 1.3)).fill({ color: PALETTE.glow, alpha: 0.12 });
    this.addGlow(g);

    const f1 = iso(w, 1.3);
    const f2 = iso(0, 1.3);
    this.hitArea = new Polygon([0, top, e.x, e.y + top, e.x, e.y, f1.x, f1.y, f2.x, f2.y]);
  }

  get focusPoint(): Point {
    const { gx, gy, w } = STATS_BOARD;
    const p = iso(gx + w / 2, gy);
    return { x: p.x, y: p.y - SCREEN_LEGS - SCREEN_H / 2 + 12 };
  }

  /** Placeholder screen on two legs with a bar chart behind caution tape, plus cones in front. */
  private buildBoard(): Container {
    const { w } = STATS_BOARD;
    const c = new Container();
    const g = new Graphics();
    box(g, 0.1, -0.4, 0.3, 0.8, SCREEN_LEGS, PALETTE.navy);
    box(g, w - 0.4, -0.4, 0.3, 0.8, SCREEN_LEGS, PALETTE.navy);
    box(g, 0, -0.14, w, 0.14, SCREEN_H, PALETTE.navy, SCREEN_LEGS);
    c.addChild(g);

    const flatW = flatLength(w);
    const top = -SCREEN_LEGS - SCREEN_H;
    const face = new Container();
    face.skew.y = WALL_SKEW;
    const s = new Graphics();
    s.rect(5, top + CHART.top, flatW - 10, SCREEN_H - CHART.top - CHART.bottom).fill(0x16203a);
    const chartTop = top + CHART.top + 8;
    const base = -SCREEN_LEGS - CHART.bottom - 5;
    const bars: [number, number][] = [[0.95, PALETTE.glow], [0.7, 0x7f9ccf], [0.8, 0x8fb9a8], [0.5, 0xc9a27a], [0.35, 0xe9e2d7]];
    const bw = (flatW - 40) / bars.length - 6;
    bars.forEach(([h, color], i) => {
      const bh = (base - chartTop) * h;
      s.rect(20 + i * (bw + 6), base - bh, bw, bh).fill(color);
    });
    s.rect(14, base, flatW - 28, 1.5).fill(0x5b6680);
    face.addChild(s);
    // two crossed caution tapes
    for (const angle of [0.22, -0.22]) {
      const tape = new Graphics();
      const len = flatW + 10;
      tape.rect(-len / 2, -4, len, 8).fill(0xf2c230);
      for (let x = -len / 2; x < len / 2; x += 10) tape.poly([x, -4, x + 5, -4, x + 1, 4, x - 4, 4]).fill(0x1f1a17);
      tape.position.set(flatW / 2, top + SCREEN_H / 2);
      tape.rotation = angle;
      face.addChild(tape);
    }
    c.addChild(face);

    // traffic cones in front of the screen
    const cones = new Graphics();
    for (const [x, y] of CONES) {
      const p = { x, y };
      cones.ellipse(p.x, p.y, 6, 3).fill(0xe8742c);
      cones.poly([p.x - 4, p.y - 1, p.x + 4, p.y - 1, p.x + 1, p.y - 14, p.x - 1, p.y - 14]).fill(0xf28c3a);
      cones.rect(p.x - 3, p.y - 8, 6, 2).fill(0xffffff);
    }
    c.addChild(cones);
    return c;
  }
}

// --- Anima's desk --------------------------------------------------------------------------------

const DESK_H = 26;
/** Desk radii (tiles), matching the art: about 90 px wide, like the booth desks. */
const DESK_R = { outer: 1, inner: 0.68 };
/** Where Anima stands inside the desk (tiles from its centre): just behind the front counter. */
const ANIMA_SPOT = { gx: 0.2, gy: -0.25 };
const pick = <T,>(list: T[], avoid?: T) => {
  const options = list.length > 1 ? list.filter((item) => item !== avoid) : list;
  return options[Math.floor(Math.random() * options.length)];
};

/** Anima, the future CV assistant: for now she waves and says random welcome lines. */
export class AnimaDesk extends FeatureSpot {
  readonly spotId = "anima";
  readonly focusSize = { w: 300, h: 260 };
  readonly receptionist: Chibi;
  readonly bubble = new Bubble(true);
  private lastLine = "";
  private cooldown = 4000 + Math.random() * 5000;

  constructor(
    private text: LobbyText,
    bubbleLayer: Container,
    private animated: boolean,
  ) {
    const { gx, gy } = ANIMA_DESK;
    const anchor = iso(gx, gy);
    super(anchor, depth(gx, gy));

    // the stand is a round patch of floor with a thin gold ring, like a small plaza
    const floor = new Graphics();
    const outer = isoCircle(1.9);
    const inner = isoCircle(1.6);
    floor.ellipse(0, 0, outer.rx, outer.ry).fill({ color: PALETTE.navy, alpha: 0.1 });
    floor.ellipse(0, 0, outer.rx, outer.ry).stroke({ width: 2, color: PALETTE.glow, alpha: 0.7 });
    floor.ellipse(0, 0, inner.rx, inner.ry).stroke({ width: 1, color: 0xd8cdbd });
    floor.zIndex = -2;
    this.addChild(floor);

    const deskShadow = new Graphics();
    const foot = isoCircle(DESK_R.outer);
    for (const [grow, a] of [[10, 0.07], [3, 0.14]]) deskShadow.ellipse(0, 2, foot.rx + grow, foot.ry + grow / 2).fill({ color: 0x000000, alpha: a });
    deskShadow.zIndex = -1;
    this.addChild(deskShadow);

    // Anima stands inside the desk, just behind its front so the counter reaches her waist
    this.receptionist = new Chibi({ ...ANIMA_DESK.receptionist, backpack: false, sheet: "staff-anima" });
    const rp = iso(ANIMA_SPOT.gx, ANIMA_SPOT.gy);
    this.receptionist.position.set(rp.x, rp.y);
    this.receptionist.zIndex = 1;
    this.addChild(this.receptionist);

    const desk = piece("desk-anima", () => this.buildDesk());
    desk.zIndex = 2;
    this.addChild(desk);

    // name plate on the front of the desk, facing the viewer
    const plate = new Container();
    const name = label("ANIMA", { fontSize: 7, fontWeight: "800", fill: PALETTE.glow, letterSpacing: 1.5 });
    name.anchor.set(0.5);
    const role = label(text.animaRole, { fontSize: 3.2, fontWeight: "700", fill: 0xffffff, letterSpacing: 0.4 });
    role.anchor.set(0.5);
    role.y = 6.5;
    const pw = Math.max(name.width, role.width) + 8;
    plate.addChild(new Graphics().roundRect(-pw / 2, -6, pw, 17, 2).fill(0x16203a).stroke({ width: 0.8, color: PALETTE.glow }), name, role);
    plate.position.set(2, -6);
    plate.zIndex = 3;
    this.addChild(plate);

    const g = new Graphics();
    g.ellipse(0, 0, outer.rx, outer.ry).fill({ color: PALETTE.glow, alpha: 0.12 }).stroke({ width: 3, color: PALETTE.glow });
    this.addGlow(g);

    const ring: number[] = [];
    for (let i = 0; i <= 12; i++) {
      const a = (i / 12) * Math.PI;
      ring.push(Math.cos(a) * outer.rx, Math.sin(a) * outer.ry);
    }
    this.hitArea = new Polygon([...ring, -outer.rx, -80, outer.rx, -80]);

    this.bubble.position.set(anchor.x + rp.x, anchor.y + rp.y + this.receptionist.headY - 6);
    bubbleLayer.addChild(this.bubble);
  }

  get focusPoint(): Point {
    return { x: this.x, y: this.y - 30 };
  }

  private say(seconds: number) {
    this.lastLine = pick(this.text.animaLines, this.lastLine);
    this.bubble.show(this.lastLine, seconds);
  }

  protected onHover(on: boolean, reducedMotion: boolean, changed: boolean, message?: string) {
    if (!on) {
      if (changed) {
        this.receptionist.wave(false);
        this.bubble.hide();
      }
      return;
    }
    if (changed && !reducedMotion) this.receptionist.wave(true);
    if (message) this.bubble.show(message, 0);
    else this.say(0);
  }

  update(dt: number) {
    super.update(dt);
    this.receptionist.update(dt, false);
    if (!this.animated || this.hovered) return;
    this.cooldown -= dt;
    if (this.cooldown <= 0) {
      this.say(3.2);
      this.cooldown = 9000 + Math.random() * 6000;
    }
  }

  /** Placeholder navy desk, open at the back, around the ring's centre. */
  private buildDesk(): Container {
    const c = new Container();
    const g = new Graphics();
    const ro = DESK_R.outer;
    const ri = DESK_R.inner;
    const from = -0.47 * Math.PI;
    const to = 0.97 * Math.PI;
    const n = 26;
    const at = (r: number, a: number, z = 0) => {
      const p = iso(Math.cos(a) * r, Math.sin(a) * r);
      return [p.x, p.y - z];
    };
    // painter's order: segments further back first
    const segments = Array.from({ length: n }, (_, i) => [from + ((to - from) * i) / n, from + ((to - from) * (i + 1)) / n]);
    segments.sort((s1, s2) => Math.cos(s1[0]) + Math.sin(s1[0]) - (Math.cos(s2[0]) + Math.sin(s2[0])));
    for (const [a, b] of segments) {
      const facing = Math.cos((a + b) / 2) + Math.sin((a + b) / 2);
      if (facing < 0) g.poly([...at(ri, a), ...at(ri, b), ...at(ri, b, DESK_H), ...at(ri, a, DESK_H)]).fill(0x18203a);
      else {
        g.poly([...at(ro, a), ...at(ro, b), ...at(ro, b, DESK_H), ...at(ro, a, DESK_H)]).fill(PALETTE.navy);
        g.poly([...at(ro, a, 6), ...at(ro, b, 6), ...at(ro, b, 8), ...at(ro, a, 8)]).fill({ color: PALETTE.glow, alpha: 0.8 });
      }
      g.poly([...at(ro, a, DESK_H), ...at(ro, b, DESK_H), ...at(ri, b, DESK_H), ...at(ri, a, DESK_H)]).fill(0x33406a);
    }
    c.addChild(g);
    return c;
  }
}
