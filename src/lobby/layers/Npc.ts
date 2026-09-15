import { Container, Graphics } from "pixi.js";
import { depth, iso } from "../engine/iso";
import { Bubble } from "./Bubble";
import { Chibi, type ChibiLook } from "./Chibi";
import { box } from "./draw";

const SPEED = 0.0011; // grid units per ms
// Tiles to the right of a link: people walking opposite ways pass side by side instead of through each other.
const LANE = 0.28;
// Someone in front, closer than PERSONAL and within BODY of the line of travel (tiles), makes a visitor react.
const PERSONAL = 0.8;
const BODY = 0.5;
// Corners are cut this close to a waypoint, so turns read as curves.
const CORNER = 0.35;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export interface GridPoint {
  gx: number;
  gy: number;
}

/** Booth footprint (far corner + size) and its draw order. */
export interface Occluder {
  gx: number;
  gy: number;
  w: number;
  d: number;
  z: number;
}

// How far behind a wall (in grid units) a visitor still overlaps it on screen.
const WALL_SHADOW = 4;

/**
 * A visitor walking the plaza. It only knows how to follow a route, keep to its lane, make way for others,
 * look at something and talk; where to go and what to say is decided by the crowd (engine/crowd.ts).
 */
export class Visitor extends Container {
  readonly chibi: Chibi;
  readonly bubble = new Bubble();
  gx: number;
  gy: number;
  /** Unit direction of travel in grid units while walking, (0, 0) when still. */
  readonly heading = { x: 0, y: 0 };
  private route: GridPoint[] = [];
  private from: GridPoint;
  private hold = 0;
  private talk = 0;
  private blocked = 0;
  private moved = false;

  constructor(
    look: ChibiLook,
    start: GridPoint,
    private frozen: boolean,
    bubbleLayer: Container,
    private occluders: Occluder[] = [],
  ) {
    super();
    this.chibi = new Chibi(look);
    this.addChild(this.chibi);
    this.gx = start.gx;
    this.gy = start.gy;
    this.from = start;
    bubbleLayer.addChild(this.bubble);
    this.sync();
  }

  /** Walking right now (not waiting, talking with a hold, or standing at a place). */
  get walking() {
    return this.route.length > 0 && this.hold <= 0;
  }

  /** A bubble is showing. */
  get talking() {
    return this.talk > 0;
  }

  /** Follow the points in order: waypoints on the right-hand lane, the last one exactly (a slot at a place). */
  walk(route: GridPoint[]) {
    if (this.frozen) return;
    this.route = route;
    this.from = { gx: this.gx, gy: this.gy };
  }

  /** Turn towards a grid point. */
  lookAt(p: GridPoint) {
    const dx = p.gx - this.gx;
    const dy = p.gy - this.gy;
    this.chibi.setFacing(dx - dy, dx + dy > 0);
  }

  /** Show a line; `stop` also halts the walk while it is showing (e.g. when you hover the place they are going to). */
  say(line: string, seconds = 2.6, stop = false) {
    this.bubble.show(line, seconds);
    this.talk = seconds * 1000;
    if (stop) this.hold = seconds * 1000;
  }

  private sync() {
    const p = iso(this.gx, this.gy);
    this.position.set(p.x, p.y);
    this.zIndex = this.drawOrder();
    this.bubble.position.set(p.x, p.y + this.chibi.headY - 4);
  }

  /**
   * Booths are drawn as one piece, so plain (gx + gy) sorting would put a visitor walking
   * just behind a wall on top of it. Behind a wall, drop the visitor under that booth.
   */
  private drawOrder(): number {
    let z = depth(this.gx, this.gy);
    for (const o of this.occluders) {
      const behindSideWall = this.gx < o.gx && this.gx > o.gx - WALL_SHADOW && this.gy > o.gy - 1 && this.gy < o.gy + o.d;
      const behindMainWall = this.gy < o.gy && this.gy > o.gy - WALL_SHADOW && this.gx > o.gx - 1 && this.gx < o.gx + o.w;
      if ((behindSideWall || behindMainWall) && z >= o.z) z = o.z - 1;
    }
    return z;
  }

  /** Advance one frame among `others`. Returns true on the frame the route's last point is reached. */
  update(dt: number, others: Visitor[]): boolean {
    this.talk = Math.max(0, this.talk - dt);
    this.hold = Math.max(0, this.hold - dt);
    this.moved = false;
    const arrived = this.route.length > 0 && this.hold <= 0 && this.step(dt, others);
    // legs only move while actually covering ground, not while waiting behind someone
    this.chibi.update(dt, this.moved);
    if (!this.walking) this.heading.x = this.heading.y = 0;
    this.sync();
    return arrived;
  }

  private step(dt: number, others: Visitor[]): boolean {
    const next = this.route[0];
    const last = this.route.length === 1;
    // the lane runs along the current link, to the right of its direction
    const lx = next.gx - this.from.gx;
    const ly = next.gy - this.from.gy;
    const len = Math.hypot(lx, ly) || 1;
    const tx = next.gx - (last ? 0 : (ly / len) * LANE);
    const ty = next.gy + (last ? 0 : (lx / len) * LANE);
    let dx = tx - this.gx;
    let dy = ty - this.gy;
    const dist = Math.hypot(dx, dy);
    if (dist <= (last ? 0.02 : CORNER)) {
      this.from = next;
      this.route.shift();
      if (last) {
        this.gx = next.gx;
        this.gy = next.gy;
      }
      return last;
    }
    dx /= dist;
    dy /= dist;

    // make way for whoever is in the way ("right" is the lane side, as in the lane offset above)
    let speed = SPEED;
    let side = 0;
    for (const o of others) {
      if (o === this) continue;
      const ox = o.gx - this.gx;
      const oy = o.gy - this.gy;
      const ahead = ox * dx + oy * dy;
      const right = -ox * dy + oy * dx;
      if (ahead <= 0 || ahead > PERSONAL || Math.abs(right) > BODY) continue;
      const along = o.heading.x * dx + o.heading.y * dy;
      if (o.walking && along > 0.5) {
        // same way: follow at a distance
        speed = Math.min(speed, SPEED * clamp01((ahead - 0.4) / 0.35));
      } else if (o.walking && along > -0.5 && right > 0) {
        // crossing from the right: give way (the other one sees us on its left and carries on)
        speed = Math.min(speed, SPEED * clamp01((ahead - 0.35) / 0.4));
      } else {
        // standing, or coming the other way: step away from them, to the left when they are dead ahead
        side += right > -0.05 ? -1 : 1;
        speed = Math.min(speed, SPEED * 0.7);
      }
    }
    side = Math.sign(side);
    // never wait forever: after a moment of being blocked, carry on slowly
    this.blocked = speed < SPEED * 0.2 ? this.blocked + dt : 0;
    if (this.blocked > 1500) speed = SPEED * 0.5;

    const move = Math.min(dist, speed * dt);
    const sidestep = side * SPEED * 0.5 * dt;
    this.gx += dx * move - dy * sidestep;
    this.gy += dy * move + dx * sidestep;
    this.heading.x = dx;
    this.heading.y = dy;
    this.moved = move > SPEED * dt * 0.15;
    if (this.moved) this.chibi.setFacing(dx - dy, dx + dy > 0);
    return false;
  }
}

/** A seated visitor on a bench/sofa who occasionally comments. */
export class Sitter extends Container {
  readonly chibi: Chibi;
  readonly bubble = new Bubble();
  private cooldown = rand(2000, 7000);
  private lineIndex = 0;

  constructor(
    readonly spot: {
      sheet?: string;
      gx: number;
      gy: number;
      dir: number;
      hair: number;
      shirt: number;
      bun?: boolean;
      laptop?: boolean;
      seat: { gx: number; gy: number; h: number };
    },
    private lines: string[],
    private animated: boolean,
    bubbleLayer: Container,
  ) {
    super();
    const p = iso(spot.gx, spot.gy);
    this.position.set(p.x, p.y);
    // always drawn right above its own seat, wherever on the seat the visitor sits
    this.zIndex = depth(spot.seat.gx, spot.seat.gy) + 1;

    // hips sink slightly into the seat top; the legs hang over the front edge down to the floor
    const h = spot.seat.h - 2;
    this.chibi = new Chibi({ sheet: spot.sheet, hair: spot.hair, shirt: spot.shirt, bun: spot.bun, seated: true, seatHeight: h });
    this.chibi.setFacing(spot.dir, true);
    this.chibi.y = -h;
    this.addChild(this.chibi);

    if (spot.laptop && !this.chibi.hasArt) {
      const lap = new Graphics();
      const y = -h - 3;
      lap.roundRect(-10 * -spot.dir - 7, y, 14, 3, 1).fill(0xc9ccd3);
      lap.poly([-3 * -spot.dir, y, 7 * -spot.dir, y, 9 * -spot.dir, y - 12, -1 * -spot.dir, y - 12]).fill(0x3b4150);
      this.addChild(lap);
    }
    this.bubble.position.set(p.x, p.y + this.chibi.y + this.chibi.headY - 6);
    bubbleLayer.addChild(this.bubble);
  }

  update(dt: number) {
    this.chibi.update(dt, false);
    if (!this.animated) return;
    this.cooldown -= dt;
    if (this.cooldown <= 0) {
      this.bubble.show(this.lines[this.lineIndex++ % this.lines.length], 2.6);
      this.cooldown = rand(7000, 13000);
    }
  }
}

/** Seat under a sitter. Exported for scene building. */
export function seat(alongX: boolean, sofa = false): Container {
  const c = new Container();
  const g = new Graphics();
  const w = alongX ? 1.6 : 0.7;
  const d = alongX ? 0.7 : 1.6;
  g.ellipse(0, 4, 40, 13).fill({ color: 0x000000, alpha: 0.1 });
  if (sofa) {
    box(g, -w / 2, -d / 2, w, d, 14, 0x9a8f86);
    box(g, -w / 2, -d / 2, alongX ? w : 0.2, alongX ? 0.2 : d, 16, 0xaaa097, 14);
  } else {
    box(g, -w / 2, -d / 2, w, d, 10, 0x8f6643);
    box(g, -w / 2, -d / 2, w, d, 4, 0xb98a5e, 10);
  }
  c.addChild(g);
  return c;
}
