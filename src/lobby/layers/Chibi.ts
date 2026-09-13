import { Container, Graphics } from "pixi.js";
import gsap from "gsap";
import { PALETTE } from "../config";

export interface ChibiLook {
  hair: number;
  shirt: number;
  curly?: boolean;
  bun?: boolean;
  glasses?: boolean;
  backpack?: boolean;
  seated?: boolean;
}

/**
 * Placeholder chibi built from vector parts. Swap for an AnimatedSprite later:
 * the rest of the engine only uses `setFacing`, `wave`, `update` and `headY`.
 */
export class Chibi extends Container {
  readonly headY: number;
  private rig = new Container();
  private face = new Graphics();
  private backHair = new Graphics();
  private armR = new Graphics();
  private legs = new Graphics();
  private backpack = new Graphics();
  private phase = Math.random() * Math.PI * 2;
  private towardViewer = true;

  constructor(private look: ChibiLook) {
    super();
    const seated = !!look.seated;
    const bodyTop = seated ? -26 : -32;
    this.headY = bodyTop - 30;

    const shadow = new Graphics().ellipse(0, 0, 11, 4).fill({ color: 0x000000, alpha: 0.18 });
    this.addChild(shadow, this.rig);

    if (!seated) {
      this.legs.roundRect(-5, -12, 4, 12, 2).fill(PALETTE.navy).roundRect(1, -12, 4, 12, 2).fill(PALETTE.navy);
    } else {
      this.legs.roundRect(-6, -10, 12, 6, 3).fill(PALETTE.navy);
    }

    const body = new Graphics().roundRect(-8, bodyTop, 16, seated ? 18 : 22, 6).fill(look.shirt);
    body.roundRect(-3, bodyTop, 6, 5, 2).fill(0xffffff);

    if (look.backpack !== false && !seated) {
      this.backpack.roundRect(-7, bodyTop + 2, 14, 15, 4).fill(0x4a4036);
    }

    this.armR.roundRect(-2, 0, 4, 12, 2).fill(look.shirt);
    this.armR.circle(0, 12, 2.5).fill(PALETTE.skin);
    this.armR.position.set(8, bodyTop + 3);

    const head = new Graphics().circle(0, this.headY + 14, 14).fill(PALETTE.skin);

    // hair behind the head (visible when walking away)
    // leaves the nape visible so the back view reads as a head, not a ball
    this.backHair.ellipse(0, this.headY + 9, 14.8, 13).fill(look.hair);
    this.backHair.ellipse(-13, this.headY + 15, 2.5, 4).fill(PALETTE.skin).ellipse(13, this.headY + 15, 2.5, 4).fill(PALETTE.skin);
    if (look.curly) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        this.backHair.circle(Math.cos(a) * 12, this.headY + 10 + Math.sin(a) * 11, 6).fill(look.hair);
      }
    }
    if (look.bun) this.backHair.circle(0, this.headY - 3, 7).fill(look.hair);

    this.drawFace();

    this.rig.addChild(this.legs, this.backpack, body, this.armR, head, this.face, this.backHair);
    this.setFacing(1, true);
  }

  private drawFace() {
    const { hair, glasses } = this.look;
    const y = this.headY;
    const f = this.face.clear();
    // fringe
    f.ellipse(0, y + 4, 15, 9).fill(hair);
    f.circle(-12, y + 12, 5).fill(hair).circle(12, y + 12, 5).fill(hair);
    if (this.look.curly) {
      for (let i = -2; i <= 2; i++) f.circle(i * 6, y + 1, 5.5).fill(hair);
    }
    if (this.look.bun) f.circle(0, y - 3, 7).fill(hair);
    // eyes + blush
    f.ellipse(-5, y + 16, 2, 2.6).fill(0x1d1a18).ellipse(5, y + 16, 2, 2.6).fill(0x1d1a18);
    f.circle(-9, y + 21, 2).fill({ color: 0xf29b8a, alpha: 0.5 }).circle(9, y + 21, 2).fill({ color: 0xf29b8a, alpha: 0.5 });
    if (glasses) f.circle(-5, y + 16, 4).stroke({ width: 1.2, color: 0x1d1a18 }).circle(5, y + 16, 4).stroke({ width: 1.2, color: 0x1d1a18 });
  }

  /** dirX: +1 right / -1 left. towardViewer: face visible (moving down-screen). */
  setFacing(dirX: number, towardViewer: boolean) {
    this.rig.scale.x = dirX >= 0 ? 1 : -1;
    this.towardViewer = towardViewer;
    this.face.visible = towardViewer;
    this.backHair.visible = !towardViewer;
    this.backpack.visible = !towardViewer;
    // when facing away, the back of the head must cover the face region
    this.rig.setChildIndex(this.backpack, towardViewer ? 1 : this.rig.children.length - 2);
  }

  wave(on: boolean) {
    gsap.killTweensOf(this.armR);
    if (on) {
      gsap.to(this.armR, { rotation: -2.6, duration: 0.25, ease: "power2.out" });
      gsap.to(this.armR, { rotation: -2.1, duration: 0.3, repeat: 5, yoyo: true, delay: 0.25, ease: "sine.inOut" });
    } else {
      gsap.to(this.armR, { rotation: 0, duration: 0.3, ease: "power2.out" });
    }
  }

  /** Called every frame. `moving` adds a walking bob. */
  update(dt: number, moving: boolean) {
    this.phase += dt * (moving ? 0.012 : 0.003);
    this.rig.y = moving ? -Math.abs(Math.sin(this.phase)) * 2.5 : Math.sin(this.phase) * 0.6;
    if (!this.look.seated) {
      this.legs.scale.y = moving ? 1 - Math.abs(Math.cos(this.phase)) * 0.2 : 1;
    }
  }

  get facingViewer() {
    return this.towardViewer;
  }
}
