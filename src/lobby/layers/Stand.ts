import { Container, Graphics, Polygon } from "pixi.js";
import gsap from "gsap";
import { PALETTE, type StandConfig } from "../config";
import { depth, iso, rectPoly, TILE_W, WALL_SKEW, type Point } from "../engine/iso";
import { piece } from "../assets";
import { Bubble } from "./Bubble";
import { Chibi } from "./Chibi";
import { box, fonts, label, plant, wallX, wallY } from "./draw";

const WALL_H = 100;

/** Relative luminance (0..1) to pick light or dark lettering on a colored wall. */
function luminance(color: number) {
  const [r, g, b] = [(color >> 16) & 255, (color >> 8) & 255, color & 255].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Placeholder reception desk, relative to the centre of its footprint. The laptop is drawn separately. */
function deskPlaceholder(): Container {
  const c = new Container();
  const g = new Graphics();
  box(g, -1.3, -0.4, 2.6, 0.8, 22, PALETTE.wood);
  box(g, -1.4, -0.45, 2.8, 0.9, 3, PALETTE.wall, 22);
  // front light strip
  const s1 = iso(-1.3, 0.4);
  const s2 = iso(1.3, 0.4);
  g.moveTo(s1.x, s1.y - 4).lineTo(s2.x, s2.y - 4).stroke({ width: 2, color: PALETTE.glow, alpha: 0.8 });
  c.addChild(g);
  return c;
}

/** One interactive booth: walls, signage, receptionist, desk and glow. */
export class Stand extends Container {
  readonly receptionist: Chibi;
  readonly bubble = new Bubble(true);
  private glow = new Container();
  private halo = new Graphics();
  private sign = new Container();
  private signScale = 1;
  private highlights: Container[] = [];
  /** Small print (subtitle, side wall, wall graphics) shown only on hover or when zoomed in. */
  private details: Container[] = [];
  private detail = 0;
  private greetIndex = 0;
  private hovered = false;
  private t = Math.random() * 10;

  constructor(readonly cfg: StandConfig, bubbleLayer: Container) {
    super();
    const { gx, gy, w, d } = cfg;
    this.sortableChildren = true;
    this.zIndex = depth(gx, gy);

    // halo under everything
    const c = iso(gx + w / 2, gy + d / 2);
    this.halo.ellipse(c.x, c.y, w * 30, d * 20).fill({ color: PALETTE.glow, alpha: 0.22 });
    this.halo.alpha = 0;
    this.addChild(this.halo);

    // walls + floor (art or placeholder), anchored at the booth's far corner on the floor
    const shell = piece(`stand-${cfg.id}` as const, () => this.buildShell());
    const corner = iso(gx, gy);
    shell.position.set(corner.x, corner.y);
    this.addChild(shell);
    // signage, wall graphics and side-wall lettering are always drawn by code, in the current language
    const signage = this.buildSignage();
    signage.zIndex = 0.5;
    this.addChild(signage);

    // receptionist + desk
    const rx = gx + w * 0.5;
    const ry = gy + d * 0.42;
    this.receptionist = new Chibi({ ...cfg.receptionist, backpack: false, sheet: `staff-${cfg.id}` });
    const rp = iso(rx, ry);
    this.receptionist.position.set(rp.x, rp.y);
    this.addChild(this.receptionist);

    // desk art is anchored at the centre of its footprint, just in front of the receptionist
    const desk = new Container();
    const dp = iso(rx, ry + 0.85);
    desk.position.set(dp.x, dp.y);
    desk.addChild(piece("desk", () => deskPlaceholder()));
    const laptop = new Graphics();
    const lp = iso(0.4, -0.05);
    laptop.poly([lp.x - 8, lp.y - 26, lp.x + 6, lp.y - 33, lp.x + 6, lp.y - 45, lp.x - 8, lp.y - 38]).fill(0x3b4150);
    desk.addChild(laptop);
    this.addChild(desk);

    // glow outline (animated on hover)
    const g = new Graphics();
    g.poly(rectPoly(gx, gy, w, d, 6)).fill({ color: PALETTE.glow, alpha: 0.12 }).stroke({ width: 3, color: PALETTE.glow });
    const a = iso(gx, gy + d);
    const b = iso(gx, gy);
    const e = iso(gx + w, gy);
    g.moveTo(a.x, a.y - WALL_H).lineTo(b.x, b.y - WALL_H).lineTo(e.x, e.y - WALL_H).stroke({ width: 4, color: PALETTE.glow });
    g.blendMode = "add";
    this.glow.addChild(g);
    this.glow.alpha = 0;
    this.glow.zIndex = 5;
    this.addChild(this.glow);

    // plants at the open corners
    const p1 = piece("plant-a", () => plant(0.9, 0), 0.9);
    const pp1 = iso(gx + w - 0.4, gy + 0.5);
    p1.position.set(pp1.x, pp1.y);
    const p2 = piece("plant-b", () => plant(0.8, 1), 0.8);
    const pp2 = iso(gx + 0.5, gy + d - 0.4);
    p2.position.set(pp2.x, pp2.y);
    this.addChild(p1, p2);
    this.receptionist.zIndex = 1;
    desk.zIndex = 2;
    p1.zIndex = 3;
    p2.zIndex = 3;

    // hit area covers floor + walls
    const top = WALL_H;
    const q = (x: number, y: number, z: number) => {
      const p = iso(x, y);
      return [p.x, p.y - z];
    };
    this.hitArea = new Polygon([
      ...q(gx, gy, top),
      ...q(gx + w, gy, top),
      ...q(gx + w, gy, 0),
      ...q(gx + w, gy + d, 0),
      ...q(gx, gy + d, 0),
      ...q(gx, gy + d, top),
    ]);
    this.eventMode = "static";
    this.cursor = "pointer";

    this.bubble.position.set(rp.x, rp.y + this.receptionist.headY - 6);
    bubbleLayer.addChild(this.bubble);
  }

  /** Placeholder walls + floor, drawn relative to the far corner (0, 0). */
  private buildShell(): Container {
    const { w, d, accent } = this.cfg;
    const shell = new Container();
    const g = new Graphics();
    box(g, 0, 0, w, d, 6, 0xf7f2ea);
    wallY(g, 0, 0, d, WALL_H, this.cfg.sideWall);
    wallX(g, 0, 0, w, WALL_H, PALETTE.wall);
    // accent band on the main wall
    wallX(g, 0, -0.02, w, 10, accent, 0.2);
    shell.addChild(g);
    return shell;
  }

  /** Skewed signage on both walls, in world coordinates. */
  private buildSignage(): Container {
    const { gx, gy, w, d } = this.cfg;
    const booth = new Container();

    // --- main wall face (runs along gx) ---
    const face = new Container();
    const origin = iso(gx, gy);
    face.position.set(origin.x, origin.y);
    face.skew.y = WALL_SKEW;
    const flatW = (w * TILE_W) / 2 / Math.cos(WALL_SKEW);
    booth.addChild(face);

    const icon = this.drawIcon();
    const title = label(this.cfg.title, { fontSize: 24, fontWeight: "800", fill: PALETTE.ink });
    title.position.set(30, -4);
    const subtitle = label(this.cfg.subtitle, { fontSize: 6.5, fontWeight: "600", fill: 0x6f6a64, letterSpacing: 1.2 });
    subtitle.position.set(2, 26);
    this.sign.addChild(icon, title, subtitle);
    // size the sign by its title (the overview only shows the title); long titles shrink to stay on the wall
    const signW = title.x + title.width;
    this.signScale = Math.min(1.15, (flatW - 40) / signW);
    // the subtitle is a detail: squeeze it under the title if it is wider
    subtitle.scale.set(Math.min(1, (signW - subtitle.x) / subtitle.width));
    this.sign.pivot.set(signW / 2, 12);
    this.sign.scale.set(this.signScale);
    this.sign.position.set(16 + (signW * this.signScale) / 2, -WALL_H + 14 + 12 * this.signScale);
    face.addChild(this.sign);

    const decor = new Container();
    decor.position.set(flatW * 0.42, -WALL_H + 60);
    face.addChild(decor);
    this.drawWallDecor(decor, flatW);

    // --- side wall face (runs along gy) ---
    const side = new Container();
    // start past the corner plant so it never covers the lettering
    const plantGap = 1.1;
    const so = iso(gx, gy + d - plantGap);
    side.position.set(so.x + 4, so.y);
    side.skew.y = -WALL_SKEW;
    const dark = luminance(this.cfg.sideWall) < 0.3;
    const script = this.cfg.id === "about";
    const lineGap = script ? 17 : 13;
    this.cfg.sideText.forEach((line, i) => {
      const t = label(line, {
        // the handwritten About line needs size and weight to read on the sand wall
        fontSize: script ? 14 : 8,
        fontFamily: script ? fonts.script : fonts.sans,
        fontWeight: "700",
        fill: dark ? 0xffffff : PALETTE.ink,
        letterSpacing: script ? 0.2 : 1,
      });
      t.position.set(8, -WALL_H + 16 + i * lineGap);
      side.addChild(t);
    });
    const sideW = Math.max(...side.children.map((t) => t.x + t.width));
    const flatD = ((d - plantGap) * TILE_W) / 2 / Math.cos(WALL_SKEW) - 12;
    if (sideW > flatD) {
      // scale around the text block top-left so it stays anchored to the wall edge
      const k = flatD / sideW;
      side.children.forEach((t) => {
        t.scale.set(k);
        t.position.set(8, -WALL_H + 16 + (t.y + WALL_H - 16) * k);
      });
    }
    booth.addChild(side);

    this.details = [subtitle, decor, side];
    this.details.forEach((dt) => (dt.alpha = 0));
    return booth;
  }

  private drawIcon(): Graphics {
    const g = new Graphics();
    const c = PALETTE.ink;
    switch (this.cfg.icon) {
      case "person":
        g.circle(10, 4, 6).fill(c).roundRect(2, 11, 16, 10, 5).fill(c);
        break;
      case "folder":
        g.roundRect(0, 2, 9, 5, 1).fill(c).roundRect(0, 5, 20, 15, 2).fill(c);
        break;
      case "gear":
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          g.circle(10 + Math.cos(a) * 9, 11 + Math.sin(a) * 9, 3).fill(c);
        }
        g.circle(10, 11, 8).fill(c).circle(10, 11, 3.5).fill(PALETTE.wall);
        break;
      case "briefcase":
        g.roundRect(6, 1, 8, 6, 2).stroke({ width: 2, color: c }).roundRect(0, 6, 20, 14, 2).fill(c);
        break;
    }
    return g;
  }

  private drawWallDecor(decor: Container, flatW: number) {
    const id = this.cfg.id;
    const mk = (draw: (g: Graphics) => void, x: number) => {
      const holder = new Container();
      const g = new Graphics();
      draw(g);
      holder.addChild(g);
      holder.x = x;
      decor.addChild(holder);
      this.highlights.push(holder);
    };
    if (id === "skills") {
      const tiles: [number, string, number][] = [
        [0x306998, "Py", 0xffd43b],
        [0x05998b, "API", 0xffffff],
        [0x000000, "N", 0xffffff],
        [0x336791, "SQL", 0xffffff],
        [0x1f2a44, "</>", 0xffd27a],
      ];
      tiles.forEach(([bg, txt, fill], i) => {
        mk((g) => g.roundRect(0, 0, 22, 22, 4).fill(bg), -flatW * 0.36 + i * 28);
        const t = label(txt, { fontSize: txt.length > 2 ? 7 : 9, fontWeight: "800", fill });
        t.anchor.set(0.5);
        t.position.set(11, 11);
        this.highlights[i].addChild(t);
      });
    } else if (id === "portfolio") {
      for (let i = 0; i < 3; i++) {
        mk((g) => {
          g.roundRect(0, 0, 36, 26, 2).fill(0x222a3a);
          g.poly([3, 23, 14, 9, 22, 18, 27, 12, 33, 23]).fill(0x7f9ccf);
          g.circle(27, 6, 3).fill(0xffe1a8);
        }, -flatW * 0.36 + i * 42);
      }
    } else if (id === "experience") {
      mk((g) => g.roundRect(0, 8, flatW * 0.5, 2, 1).fill(0xb7ab9a), -flatW * 0.3);
      for (let i = 0; i < 5; i++) {
        mk((g) => {
          g.circle(0, 9, 4).fill(PALETTE.navy);
          g.roundRect(-8, 16, 16, 12, 2).fill(0xe9e2d7);
        }, -flatW * 0.28 + i * (flatW * 0.12));
      }
    } else {
      mk((g) => {
        g.roundRect(0, 0, 34, 26, 2).fill(PALETTE.woodDark);
        g.rect(3, 3, 28, 20).fill(0xcfe0d8);
        g.poly([3, 23, 12, 12, 20, 19, 31, 9, 31, 23]).fill(0x8fb9a8);
      }, -flatW * 0.4);
    }
  }

  /** World point the camera centers on when zooming into this stand. */
  get focusPoint(): Point {
    const { gx, gy, w, d } = this.cfg;
    const p = iso(gx + w / 2, gy + d / 2);
    return { x: p.x, y: p.y - 40 };
  }

  setHover(on: boolean, reducedMotion: boolean, message?: string) {
    if (on === this.hovered) {
      if (on && message) this.bubble.show(message, 0);
      return;
    }
    this.hovered = on;
    const dur = reducedMotion ? 0 : 0.35;
    gsap.to(this.glow, { alpha: on ? 1 : 0, duration: dur });
    gsap.to(this.halo, { alpha: on ? 1 : 0, duration: dur });
    const pop = this.signScale * (on ? 1.08 : 1);
    gsap.to(this.sign.scale, { x: pop, y: pop, duration: dur, ease: "back.out(2)" });
    if (on) {
      this.receptionist.setFacing(1, true);
      if (!reducedMotion) this.receptionist.wave(true);
      this.bubble.show(message ?? this.cfg.greeting[this.greetIndex++ % this.cfg.greeting.length], 0);
      if (!reducedMotion) {
        this.highlights.forEach((h, i) =>
          gsap.fromTo(h, { y: 0 }, { y: -6, duration: 0.18, delay: i * 0.05, yoyo: true, repeat: 1, ease: "power2.out" }),
        );
      }
    } else {
      this.receptionist.wave(false);
      this.bubble.hide();
    }
  }

  /** zoomDetail: 0..1 from the camera zoom; hover always reveals this booth’s details. */
  update(dt: number, zoomDetail = 0) {
    const target = this.hovered ? 1 : zoomDetail;
    if (Math.abs(target - this.detail) > 0.001) {
      this.detail += (target - this.detail) * Math.min(1, dt / 140);
      this.details.forEach((d) => (d.alpha = this.detail));
    }
    this.t += dt * 0.004;
    this.receptionist.update(dt, false);
    if (this.hovered) this.glow.children[0].alpha = 0.75 + Math.sin(this.t * 2) * 0.25;
  }
}
