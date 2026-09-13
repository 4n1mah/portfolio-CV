import { Container, Graphics, Rectangle } from "pixi.js";
import gsap from "gsap";
import { PALETTE } from "../config";
import { label } from "./draw";

const GOLD = 0xd9ad52;
const GOLD_LIGHT = 0xf6dd98;
const GOLD_DARK = 0x9a7330;

/** Golden standing sign with the owner's name, in front of the central planter. */
export class NameSign extends Container {
  private glow = new Graphics();
  private board = new Container();
  private open = false;
  /** Local point (top center of the board) the link popover anchors to. */
  readonly anchorY: number;

  constructor(name: string, role: string) {
    super();
    const title = label(name.toUpperCase(), { fontSize: 17, fontWeight: "800", fill: PALETTE.navy, letterSpacing: 2 });
    const subtitle = label(role.toUpperCase(), { fontSize: 7, fontWeight: "700", fill: 0x5e4a22, letterSpacing: 2.5 });
    title.anchor.set(0.5, 0);
    subtitle.anchor.set(0.5, 0);

    const padX = 18;
    const w = Math.max(title.width, subtitle.width) + padX * 2;
    const h = 52;
    const postH = 22;
    const top = -postH - h;
    this.anchorY = top - 16;

    const g = new Graphics();
    // shadow + posts
    g.ellipse(0, 0, w * 0.45, 9).fill({ color: 0x000000, alpha: 0.16 });
    g.roundRect(-w * 0.32 - 3, -postH - 4, 6, postH + 4, 2).fill(GOLD_DARK);
    g.roundRect(w * 0.32 - 3, -postH - 4, 6, postH + 4, 2).fill(GOLD_DARK);
    // frame, face and a light band for a metallic feel
    g.roundRect(-w / 2 - 4, top - 4, w + 8, h + 8, 8).fill(GOLD_DARK);
    g.roundRect(-w / 2, top, w, h, 6).fill(GOLD);
    g.roundRect(-w / 2 + 3, top + 3, w - 6, h * 0.42, 4).fill({ color: GOLD_LIGHT, alpha: 0.55 });
    g.roundRect(-w / 2 + 5, top + 5, w - 10, h - 10, 4).stroke({ width: 1, color: 0xfff2c4, alpha: 0.7 });

    this.glow.roundRect(-w / 2 - 14, top - 14, w + 28, h + 28, 16).fill({ color: PALETTE.glow, alpha: 0.35 });
    this.glow.blendMode = "add";
    this.glow.alpha = 0;

    title.position.set(0, top + 9);
    subtitle.position.set(0, top + 33);
    this.board.addChild(g, title, subtitle);
    this.addChild(this.glow, this.board);

    this.hitArea = new Rectangle(-w / 2 - 6, top - 6, w + 12, h + postH + 12);
    this.eventMode = "static";
    this.cursor = "pointer";
  }

  setOpen(on: boolean, reducedMotion: boolean) {
    if (on === this.open) return;
    this.open = on;
    const d = reducedMotion ? 0 : 0.3;
    gsap.to(this.glow, { alpha: on ? 1 : 0, duration: d });
    gsap.to(this.board, { y: on ? -4 : 0, duration: d, ease: "back.out(2)" });
  }
}
