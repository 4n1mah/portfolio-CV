import { Container, Graphics, Sprite, type Texture } from "pixi.js";
import gsap from "gsap";
import { PALETTE } from "../config";
import { CHARACTERS, characterFrames, type CharacterPose } from "../assets";

export interface ChibiLook {
  /** Character sheet key in CHARACTERS; the vector parts below are drawn while it has no art. */
  sheet?: string;
  hair: number;
  shirt: number;
  curly?: boolean;
  bun?: boolean;
  glasses?: boolean;
  backpack?: boolean;
  seated?: boolean;
  /** Height of the hips above the floor when seated: the rig origin is the hips and the feet reach just above the floor. */
  seatHeight?: number;
}

/**
 * A lobby character: the poses of its generated sheet when there is one, otherwise a chibi built
 * from vector parts. The rest of the engine only uses `setFacing`, `wave`, `update` and `headY`.
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
  private sprite: Sprite | null = null;
  private frames: Partial<Record<CharacterPose, Texture>> | null;
  private waving = false;

  constructor(private look: ChibiLook) {
    super();
    this.frames = look.sheet ? characterFrames(look.sheet) : null;
    if (look.sheet && this.frames) {
      const entry = CHARACTERS[look.sheet];
      this.headY = entry.headY;
      const tex = this.poseTexture();
      this.sprite = new Sprite(tex);
      this.sprite.anchor.set(entry.anchor.x, entry.anchor.y);
      this.sprite.scale.set(entry.width / tex.width);
      this.rig.addChild(this.sprite);
      // seated art is anchored at the seat, so a floor shadow would land on the seat
      if (!look.seated) this.addChild(new Graphics().ellipse(0, 0, 11, 4).fill({ color: 0x000000, alpha: 0.18 }));
      this.addChild(this.rig);
      return;
    }

    const seated = !!look.seated;
    // seated: origin at the hips (seat top), so the body ends at 0
    const bodyTop = seated ? -18 : -32;
    this.headY = bodyTop - 30;

    if (seated) {
      // no floor shadow: it would be drawn on the seat and make the visitor look like it floats
      this.addChild(this.rig);
      // lap coming towards the viewer, lower legs hanging over the seat edge, feet dangling or on the floor
      const hang = Math.max(3, (look.seatHeight ?? 12) - 1);
      this.legs.roundRect(-7, -4, 16, 7, 3.5).fill(PALETTE.navy);
      this.legs.roundRect(-4, 0, 4, hang, 2).fill(PALETTE.navy).roundRect(2, 0, 4, hang, 2).fill(PALETTE.navy);
      this.legs.ellipse(-2, hang, 3, 1.8).fill(0x2a2522).ellipse(4, hang, 3, 1.8).fill(0x2a2522);
    } else {
      const shadow = new Graphics().ellipse(0, 0, 11, 4).fill({ color: 0x000000, alpha: 0.18 });
      this.addChild(shadow, this.rig);
      this.legs.roundRect(-5, -12, 4, 12, 2).fill(PALETTE.navy).roundRect(1, -12, 4, 12, 2).fill(PALETTE.navy);
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

    // seated legs hang in front of the body; standing legs sit behind it
    if (seated) this.rig.addChild(this.backpack, body, this.legs, this.armR, head, this.face, this.backHair);
    else this.rig.addChild(this.legs, this.backpack, body, this.armR, head, this.face, this.backHair);
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

  /** Standing pose for the current direction (sheets without a back view keep the front one). */
  private poseTexture(): Texture {
    const f = this.frames!;
    if (this.look.seated && f.seated) return f.seated;
    return (!this.towardViewer && f.back) || f.front || f.seated!;
  }

  /** dirX: +1 right / -1 left. towardViewer: face visible (moving down-screen). */
  setFacing(dirX: number, towardViewer: boolean) {
    this.rig.scale.x = dirX >= 0 ? 1 : -1;
    this.towardViewer = towardViewer;
    if (this.sprite) {
      if (!this.waving) this.sprite.texture = this.poseTexture();
      return;
    }
    this.face.visible = towardViewer;
    this.backHair.visible = !towardViewer;
    this.backpack.visible = !towardViewer;
    // when facing away, the back of the head must cover the face region
    this.rig.setChildIndex(this.backpack, towardViewer ? 1 : this.rig.children.length - 2);
  }

  wave(on: boolean) {
    if (this.sprite) {
      const sprite = this.sprite;
      gsap.killTweensOf(sprite);
      this.waving = on && !!this.frames!.wave;
      sprite.texture = this.waving ? this.frames!.wave! : this.poseTexture();
      if (on) {
        // the pose switch plus a gentle sway around the feet reads as a hello
        gsap.fromTo(sprite, { rotation: 0 }, { rotation: 0.05, duration: 0.28, repeat: 5, yoyo: true, ease: "sine.inOut" });
      } else {
        gsap.to(sprite, { rotation: 0, duration: 0.2 });
      }
      return;
    }
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
    if (this.sprite) {
      // a sheet has no walk frames: a light waddle around the feet stands in for the steps
      this.rig.rotation = moving ? Math.sin(this.phase) * 0.06 : 0;
    } else if (!this.look.seated) {
      this.legs.scale.y = moving ? 1 - Math.abs(Math.cos(this.phase)) * 0.2 : 1;
    }
  }

  /** True when drawn from a character sheet (its props, like a laptop, are part of the art). */
  get hasArt() {
    return this.sprite !== null;
  }

  get facingViewer() {
    return this.towardViewer;
  }
}
