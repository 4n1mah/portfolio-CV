import { Container, Graphics, Rectangle } from "pixi.js";
import gsap from "gsap";
import { PALETTE } from "../config";
import { label } from "./draw";

const GOLD = 0xd9ad52;
const GOLD_LIGHT = 0xf6dd98;
const GOLD_DARK = 0x9a7330;

/** Small golden plate mounted on the central planter; opens the social links popover. */
export class NameSign extends Container {
  private glow = new Graphics();
  private plate = new Container();
  private open = false;
  /** Local y (just above the plate) the link popover anchors to. */
  readonly anchorY: number;

  constructor(text: string) {
    super();
    const title = label(text.toUpperCase(), { fontSize: 9, fontWeight: "800", fill: PALETTE.navy, letterSpacing: 1.6 });
    title.anchor.set(0.5);

    const w = title.width + 22;
    const h = 20;
    this.anchorY = -h / 2 - 8;

    const g = new Graphics();
    g.roundRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4, 5).fill(GOLD_DARK);
    g.roundRect(-w / 2, -h / 2, w, h, 4).fill(GOLD);
    g.roundRect(-w / 2 + 2, -h / 2 + 2, w - 4, h * 0.4, 3).fill({ color: GOLD_LIGHT, alpha: 0.55 });
    // screws
    g.circle(-w / 2 + 5, 0, 1.3).fill(GOLD_DARK).circle(w / 2 - 5, 0, 1.3).fill(GOLD_DARK);

    this.glow.roundRect(-w / 2 - 9, -h / 2 - 9, w + 18, h + 18, 10).fill({ color: PALETTE.glow, alpha: 0.4 });
    this.glow.blendMode = "add";
    this.glow.alpha = 0;

    title.position.set(0, 0.5);
    this.plate.addChild(g, title);
    this.addChild(this.glow, this.plate);

    this.hitArea = new Rectangle(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12);
    this.eventMode = "static";
    this.cursor = "pointer";
  }

  setOpen(on: boolean, reducedMotion: boolean) {
    if (on === this.open) return;
    this.open = on;
    const d = reducedMotion ? 0 : 0.3;
    gsap.to(this.glow, { alpha: on ? 1 : 0, duration: d });
    gsap.to(this.plate.scale, { x: on ? 1.08 : 1, y: on ? 1.08 : 1, duration: d, ease: "back.out(2)" });
  }
}
