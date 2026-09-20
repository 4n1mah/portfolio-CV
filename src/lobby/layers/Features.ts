import { Container, Graphics, Polygon, type Text } from "pixi.js";
import gsap from "gsap";
import type { Content } from "@/content/sections";
import type { Stats } from "@/lib/visits";
import { ANIMA_DESK, NOTES_BOARD, PALETTE, STATS_BOARD } from "../config";
import { depth, iso, isoCircle, rectPoly, TILE_W, WALL_SKEW, type Point } from "../engine/iso";
import { piece } from "../assets";
import type { FeatureId, StandId } from "../store";
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
  /** Marks painted on the floor (rings, glows): the lobby puts it in its ground layer, under every character and prop. */
  readonly ground = new Container();
  protected glow = new Container();
  protected hovered = false;
  private t = Math.random() * 10;

  constructor(anchor: Point, z: number) {
    super();
    this.position.set(anchor.x, anchor.y);
    this.ground.position.set(anchor.x, anchor.y);
    this.zIndex = z;
    this.sortableChildren = true;
    this.eventMode = "static";
    this.cursor = "pointer";
  }

  /** World point the camera centres on. */
  abstract get focusPoint(): Point;

  /** `onFloor` glows lie flat under the spot; the others outline its upright art and draw on top of it. */
  protected addGlow(g: Graphics, onFloor = false) {
    g.blendMode = "add";
    this.glow.addChild(g);
    this.glow.alpha = 0;
    this.glow.zIndex = 5;
    (onFloor ? this.ground : this).addChild(this.glow);
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
/** Always the same order, so a bar never jumps to another row when the numbers change. */
const BAR_ORDER: StandId[] = ["about", "portfolio", "skills", "experience"];
/** Each bar echoes its booth, in a tone that still reads on the dark screen. */
const BAR_COLORS: Record<StandId, number> = {
  about: 0xdcb68c,
  portfolio: 0x7f9ccf,
  skills: 0x8fb9a8,
  experience: 0xd2a06e,
};
/**
 * The chart columns on the screen face. They stand upright: a row laid across this wall would fall
 * away to the right with the wall's slope, and its label would end up next to the bar below it.
 */
const COL = { side: 9, barW: 16, top: 12, bottom: 18 };

export class StatsBoard extends FeatureSpot {
  readonly spotId = "stats";
  readonly focusSize = { w: 360, h: 300 };
  private readonly flatW: number;
  private readonly chart = new Graphics();
  private readonly counts: Text[] = [];
  /** Bar lengths actually drawn (0 to 1 of the track); they travel towards the real numbers. */
  private readonly shown: number[] = BAR_ORDER.map(() => 0);

  constructor(text: LobbyText) {
    const { gx, gy, w } = STATS_BOARD;
    super(iso(gx, gy), depth(gx + w / 2, gy));

    this.addChild(contactShadow(-0.15, -0.5, w + 0.3, 1), piece("stats-board", () => this.buildBoard()));

    // everything on the screen is drawn here, laid flat on its face
    const flatW = flatLength(w);
    this.flatW = flatW;
    const top = -SCREEN_LEGS - SCREEN_H;
    const face = new Container();
    face.skew.y = WALL_SKEW;
    face.zIndex = 0.5;
    const title = label(text.statsTitle, { fontSize: 6, fontWeight: "800", fill: 0xffffff, letterSpacing: 1 });
    title.anchor.set(0.5);
    title.scale.set(Math.min(1, (flatW - 30) / title.width));
    title.position.set(flatW / 2, top + 5);
    face.addChild(title, this.chart);

    // one column per section: the count above the bar, the section's name under it
    BAR_ORDER.forEach((id, i) => {
      const x = this.colX(i);
      const name = label(text.stands[id].title, { fontSize: 5.5, fontWeight: "600", fill: 0xd7ddea });
      name.anchor.set(0.5, 0);
      name.scale.set(Math.min(1, (flatW - 2 * COL.side) / BAR_ORDER.length / (name.width + 7)));
      name.position.set(x, this.chartBase() + 3);
      const count = label("—", { fontSize: 6, fontWeight: "700", fill: 0xffffff });
      count.anchor.set(0.5, 1);
      count.position.set(x, this.chartBase() - 2);
      this.counts.push(count);
      face.addChild(name, count);
    });
    this.drawBars();
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

  /** Centre of column `i`, in screen-face coordinates. */
  private colX(i: number): number {
    const inner = this.flatW - COL.side * 2;
    return COL.side + (inner / BAR_ORDER.length) * (i + 0.5);
  }

  /** Where the bars stand (the line under them) and how tall a full bar is. */
  private chartBase(): number {
    return -SCREEN_LEGS - CHART.bottom - COL.bottom;
  }

  private chartHeight(): number {
    return SCREEN_H - CHART.top - CHART.bottom - COL.top - COL.bottom;
  }

  /**
   * New numbers from the API. The bars travel to their new length instead of jumping,
   * and a board with no data at all keeps its empty tracks and a dash for every count.
   */
  setStats(stats: Stats | null, reducedMotion: boolean) {
    const byId = new Map(stats?.sections.map((s) => [s.section, s.visits]));
    const counts = BAR_ORDER.map((id) => byId.get(id) ?? 0);
    const most = Math.max(...counts, 1);

    gsap.killTweensOf(this.shown);
    counts.forEach((visits, i) => {
      this.counts[i].text = stats ? String(visits) : "—";
      const target = stats ? visits / most : 0;
      if (reducedMotion) this.shown[i] = target;
      else gsap.to(this.shown, { [i]: target, duration: 0.7, delay: i * 0.08, ease: "power2.out", onUpdate: () => this.drawBars() });
    });
    this.drawBars();
  }

  private drawBars() {
    const base = this.chartBase();
    const full = this.chartHeight();
    this.chart.clear();
    // the line the bars stand on, so an empty board still reads as a chart
    this.chart.rect(COL.side, base, this.flatW - COL.side * 2, 0.8).fill({ color: 0x5b6680, alpha: 0.9 });
    BAR_ORDER.forEach((id, i) => {
      const x = this.colX(i) - COL.barW / 2;
      this.chart.roundRect(x, base - full, COL.barW, full, 2).fill({ color: 0x2b3a5c, alpha: 0.85 });
      const h = full * this.shown[i];
      if (h > 1) this.chart.roundRect(x, base - h, COL.barW, h, 2).fill(BAR_COLORS[id]);
      this.counts[i].y = base - Math.max(h, 2) - 2;
    });
  }

  /** Placeholder screen on two legs, empty: the chart above is drawn on top of it either way. */
  private buildBoard(): Container {
    const { w } = STATS_BOARD;
    const c = new Container();
    const g = new Graphics();
    box(g, 0.1, -0.4, 0.3, 0.8, SCREEN_LEGS, PALETTE.navy);
    box(g, w - 0.4, -0.4, 0.3, 0.8, SCREEN_LEGS, PALETTE.navy);
    box(g, 0, -0.14, w, 0.14, SCREEN_H, PALETTE.navy, SCREEN_LEGS);
    c.addChild(g);

    const flatW = flatLength(w);
    const face = new Container();
    face.skew.y = WALL_SKEW;
    face.addChild(
      new Graphics()
        .rect(5, -SCREEN_LEGS - SCREEN_H + CHART.top, flatW - 10, SCREEN_H - CHART.top - CHART.bottom)
        .fill(0x16203a),
    );
    c.addChild(face);
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
  private waveLeft = 0;

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

    // the hover glow lights the same patch of floor, between the ring and the desk's shadow
    const g = new Graphics();
    g.ellipse(0, 0, outer.rx, outer.ry).fill({ color: PALETTE.glow, alpha: 0.12 }).stroke({ width: 3, color: PALETTE.glow });

    const deskShadow = new Graphics();
    const foot = isoCircle(DESK_R.outer);
    for (const [grow, a] of [[10, 0.07], [3, 0.14]]) deskShadow.ellipse(0, 2, foot.rx + grow, foot.ry + grow / 2).fill({ color: 0x000000, alpha: a });
    this.ground.addChild(floor);
    this.addGlow(g, true);
    this.ground.addChild(deskShadow);

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

  /** A visitor said hello: Anima waves and answers, unless you are the one talking to her. */
  greetBack() {
    if (!this.animated || this.hovered) return;
    this.lastLine = pick(this.text.animaReplies, this.lastLine);
    this.bubble.show(this.lastLine, 2.6);
    this.receptionist.wave(true);
    this.waveLeft = 1700;
    this.cooldown = Math.max(this.cooldown, 7000);
  }

  update(dt: number) {
    super.update(dt);
    this.receptionist.update(dt, false);
    if (this.waveLeft > 0 && (this.waveLeft -= dt) <= 0 && !this.hovered) this.receptionist.wave(false);
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
