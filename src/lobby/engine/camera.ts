import type { Container } from "pixi.js";
import gsap from "gsap";

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface View {
  x: number;
  y: number;
  scale: number;
}

/**
 * Pans/zooms the `world` container. (x, y) is the world point shown at the
 * viewport focus; the focus shifts sideways/up when a panel covers part of the screen.
 */
export class Camera {
  view: View = { x: 0, y: 0, scale: 1 };
  /** Screen-space offset of the focus point from the viewport center. */
  offset = { x: 0, y: 0 };
  minScale = 0.3;
  maxScale = 2.6;
  locked = false;
  /** Set once the user pans or zooms by hand. */
  userMoved = false;

  private width = 1;
  private height = 1;
  private pointers = new Map<number, { x: number; y: number }>();
  private lastPinch = 0;
  private velocity = { x: 0, y: 0 };
  private dragDistance = 0;
  private lastMove = 0;
  private saved: View | null = null;
  private tween: gsap.core.Tween | null = null;

  constructor(
    private world: Container,
    private canvas: HTMLCanvasElement,
    private bounds: Bounds,
    private onTouch: (kind: "mouse" | "touch") => void,
  ) {
    canvas.addEventListener("pointerdown", this.down);
    window.addEventListener("pointermove", this.move);
    window.addEventListener("pointerup", this.up);
    window.addEventListener("pointercancel", this.up);
    canvas.addEventListener("wheel", this.wheel, { passive: false });
  }

  destroy() {
    this.canvas.removeEventListener("pointerdown", this.down);
    window.removeEventListener("pointermove", this.move);
    window.removeEventListener("pointerup", this.up);
    window.removeEventListener("pointercancel", this.up);
    this.canvas.removeEventListener("wheel", this.wheel);
    this.tween?.kill();
  }

  /** True if the current/last gesture was a drag rather than a tap. */
  get wasDrag() {
    return this.dragDistance > 8;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.apply();
  }

  /** Scale that fits the whole world in the viewport. */
  fitScale(padding = 0.94) {
    const w = this.bounds.maxX - this.bounds.minX;
    const h = this.bounds.maxY - this.bounds.minY;
    return Math.min(this.width / w, this.height / h) * padding;
  }

  apply() {
    this.clamp();
    const { x, y, scale } = this.view;
    this.world.scale.set(scale);
    this.world.position.set(this.width / 2 + this.offset.x - x * scale, this.height / 2 + this.offset.y - y * scale);
  }

  private clamp() {
    this.view.scale = Math.min(this.maxScale, Math.max(this.minScale, this.view.scale));
    if (this.locked) return;
    const b = this.bounds;
    // allow panning only as far as the world still covers the viewport
    const halfW = this.width / 2 / this.view.scale;
    const halfH = this.height / 2 / this.view.scale;
    const clampAxis = (v: number, min: number, max: number, half: number) =>
      max - min <= half * 2 ? (min + max) / 2 : Math.min(max - half, Math.max(min + half, v));
    this.view.x = clampAxis(this.view.x, b.minX, b.maxX, halfW);
    this.view.y = clampAxis(this.view.y, b.minY, b.maxY, halfH);
  }

  flyTo(target: View & { offsetX?: number; offsetY?: number }, duration: number, onDone?: () => void) {
    this.tween?.kill();
    this.velocity = { x: 0, y: 0 };
    const state = { ...this.view, ox: this.offset.x, oy: this.offset.y };
    this.tween = gsap.to(state, {
      x: target.x,
      y: target.y,
      scale: target.scale,
      ox: target.offsetX ?? 0,
      oy: target.offsetY ?? 0,
      duration,
      ease: "power3.inOut",
      onUpdate: () => {
        this.view = { x: state.x, y: state.y, scale: state.scale };
        this.offset = { x: state.ox, y: state.oy };
        this.apply();
      },
      onComplete: onDone,
    });
  }

  /** Remember where the user was so closing a section returns there. */
  save() {
    this.saved = { ...this.view };
  }

  restore(duration: number) {
    const v = this.saved ?? this.view;
    this.locked = false;
    this.flyTo(v, duration);
    this.saved = null;
  }

  update(dt: number) {
    if (this.pointers.size || this.locked) return;
    if (Math.abs(this.velocity.x) < 0.01 && Math.abs(this.velocity.y) < 0.01) return;
    this.view.x -= (this.velocity.x * dt) / this.view.scale;
    this.view.y -= (this.velocity.y * dt) / this.view.scale;
    const decay = Math.pow(0.92, dt / 16);
    this.velocity.x *= decay;
    this.velocity.y *= decay;
    this.apply();
  }

  private down = (e: PointerEvent) => {
    this.onTouch(e.pointerType === "mouse" ? "mouse" : "touch");
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 1) this.dragDistance = 0;
    this.velocity = { x: 0, y: 0 };
    if (this.pointers.size === 2) this.lastPinch = this.pinchDistance();
  };

  private move = (e: PointerEvent) => {
    const prev = this.pointers.get(e.pointerId);
    if (!prev || this.locked) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.pointers.size === 2) {
      const dist = this.pinchDistance();
      if (this.lastPinch) this.zoomBy(dist / this.lastPinch);
      this.lastPinch = dist;
      this.dragDistance = 99;
      return;
    }
    this.dragDistance += Math.hypot(dx, dy);
    if (!this.wasDrag) return;
    this.tween?.kill();
    this.userMoved = true;
    this.view.x -= dx / this.view.scale;
    this.view.y -= dy / this.view.scale;
    this.velocity = { x: dx / 16, y: dy / 16 };
    this.lastMove = performance.now();
    this.canvas.style.cursor = "grabbing";
    this.apply();
  };

  private up = (e: PointerEvent) => {
    if (!this.pointers.delete(e.pointerId)) return;
    if (this.pointers.size < 2) this.lastPinch = 0;
    if (performance.now() - this.lastMove > 60) this.velocity = { x: 0, y: 0 };
    this.canvas.style.cursor = "";
  };

  private wheel = (e: WheelEvent) => {
    e.preventDefault();
    if (this.locked) return;
    this.tween?.kill();
    this.zoomBy(Math.exp(-e.deltaY * 0.0015));
  };

  private zoomBy(factor: number) {
    this.userMoved = true;
    this.view.scale *= factor;
    this.apply();
  }

  private pinchDistance() {
    const [a, b] = [...this.pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
}
