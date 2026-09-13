import { Container, Graphics } from "pixi.js";
import gsap from "gsap";
import { PALETTE } from "../config";
import { label } from "./draw";

/**
 * Speech bubble that floats above a character. The outer container's scale is
 * driven by the camera (so text stays readable); pop animations use `inner`.
 */
export class Bubble extends Container {
  private inner = new Container();
  private bg = new Graphics();
  private text = label("", { fontSize: 11, fill: PALETTE.ink, fontWeight: "500", wordWrap: true, wordWrapWidth: 150 });
  private hideCall: gsap.core.Tween | null = null;

  constructor(private accent = false) {
    super();
    this.text.anchor.set(0.5, 1);
    this.inner.addChild(this.bg, this.text);
    this.addChild(this.inner);
    this.alpha = 0;
    this.visible = false;
    this.eventMode = "none";
  }

  show(message: string, seconds = 2.8) {
    this.text.text = message;
    const w = Math.max(40, this.text.width + 20);
    const h = this.text.height + 12;
    const tail = 7;
    this.text.position.set(0, -tail - 6);
    this.bg
      .clear()
      .roundRect(-w / 2, -h - tail, w, h, 10)
      .fill(0xffffff)
      .poly([-6, -tail - 1, 6, -tail - 1, 0, 0])
      .fill(0xffffff);
    if (this.accent) this.bg.roundRect(-w / 2, -h - tail, w, h, 10).stroke({ width: 1.5, color: PALETTE.glow });

    this.visible = true;
    gsap.killTweensOf([this, this.inner.scale]);
    this.hideCall?.kill();
    this.inner.scale.set(0.7);
    gsap.to(this, { alpha: 1, duration: 0.2 });
    gsap.to(this.inner.scale, { x: 1, y: 1, duration: 0.35, ease: "back.out(2)" });
    if (seconds > 0) this.hideCall = gsap.delayedCall(seconds, () => this.hide());
  }

  hide() {
    this.hideCall?.kill();
    gsap.to(this, { alpha: 0, duration: 0.2, onComplete: () => void (this.visible = false) });
  }
}
