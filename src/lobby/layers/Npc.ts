import { Container, Graphics } from "pixi.js";
import { WAYPOINTS } from "../config";
import { depth, iso } from "../engine/iso";
import { Bubble } from "./Bubble";
import { Chibi, type ChibiLook } from "./Chibi";
import { box } from "./draw";

const SPEED = 0.0011; // grid units per ms
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

type State = "walk" | "idle";

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

/** A visitor that wanders the waypoint graph, pauses at stands and chats. */
export class Visitor extends Container {
  readonly chibi: Chibi;
  readonly bubble = new Bubble();
  gx: number;
  gy: number;
  private target: string;
  private previous: string;
  private state: State = "walk";
  private timer = 0;

  constructor(
    look: ChibiLook,
    start: string,
    private frozen: boolean,
    bubbleLayer: Container,
    private lines: string[],
    private occluders: Occluder[] = [],
  ) {
    super();
    this.chibi = new Chibi(look);
    this.addChild(this.chibi);
    const wp = WAYPOINTS[start];
    this.gx = wp.gx + rand(-0.3, 0.3);
    this.gy = wp.gy + rand(-0.3, 0.3);
    this.previous = start;
    this.target = pick(wp.links);
    if (frozen) this.state = "idle";
    this.timer = rand(0, 1500);
    bubbleLayer.addChild(this.bubble);
    this.sync();
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

  /** Stop and say something (used when a stand asks a nearby visitor to react). */
  say(line: string, seconds = 2.6) {
    this.state = "idle";
    this.timer = seconds * 1000 + 400;
    this.chibi.setFacing(this.chibi.scale.x, true);
    this.bubble.show(line, seconds);
  }

  update(dt: number) {
    if (this.state === "idle") {
      this.timer -= dt;
      this.chibi.update(dt, false);
      if (this.timer <= 0 && !this.frozen) this.state = "walk";
      this.sync();
      return;
    }

    const wp = WAYPOINTS[this.target];
    const dx = wp.gx - this.gx;
    const dy = wp.gy - this.gy;
    const dist = Math.hypot(dx, dy);
    const step = SPEED * dt;
    if (dist <= step) {
      this.gx = wp.gx;
      this.gy = wp.gy;
      this.arrive();
    } else {
      this.gx += (dx / dist) * step;
      this.gy += (dy / dist) * step;
      this.chibi.setFacing(dx - dy, dx + dy > 0);
    }
    this.chibi.update(dt, this.state === "walk");
    this.sync();
  }

  private arrive() {
    const here = this.target;
    const wp = WAYPOINTS[here];
    const options = wp.links.filter((l) => l !== this.previous);
    this.previous = here;
    this.target = pick(options.length ? options : wp.links);

    if (wp.faces) {
      // look at the stand for a moment
      this.state = "idle";
      this.timer = rand(1800, 4200);
      this.chibi.setFacing(this.chibi.scale.x, false);
      if (Math.random() < 0.35) this.bubble.show(pick(this.lines), 2.4);
    } else if (Math.random() < 0.3) {
      this.state = "idle";
      this.timer = rand(600, 1800);
      if (Math.random() < 0.3) this.bubble.show(pick(this.lines), 2.2);
    }
  }
}

/** A seated visitor on a bench/sofa who occasionally comments. */
export class Sitter extends Container {
  readonly chibi: Chibi;
  readonly bubble = new Bubble();
  private cooldown = rand(2000, 7000);
  private lineIndex = 0;

  constructor(
    readonly spot: { gx: number; gy: number; dir: number; hair: number; shirt: number; bun?: boolean; laptop?: boolean },
    private lines: string[],
    private animated: boolean,
    bubbleLayer: Container,
  ) {
    super();
    const p = iso(spot.gx, spot.gy);
    this.position.set(p.x, p.y);
    this.zIndex = depth(spot.gx, spot.gy) + 1;

    this.chibi = new Chibi({ hair: spot.hair, shirt: spot.shirt, bun: spot.bun, seated: true });
    this.chibi.setFacing(spot.dir, true);
    this.chibi.y = -8;
    this.addChild(this.chibi);

    if (spot.laptop) {
      const lap = new Graphics();
      lap.roundRect(-10 * -spot.dir - 7, -20, 14, 3, 1).fill(0xc9ccd3);
      lap.poly([-3 * -spot.dir, -20, 7 * -spot.dir + 0, -20, 9 * -spot.dir, -32, -1 * -spot.dir, -32]).fill(0x3b4150);
      this.addChild(lap);
    }
    this.bubble.position.set(p.x, p.y + this.chibi.headY - 12);
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
