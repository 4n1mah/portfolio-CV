import { Container, Graphics } from "pixi.js";
import type { Content } from "@/content/sections";
import { PALETTE, PLAZA_CENTER, WORLD_SIZE } from "../config";
import { depth, iso, isoCircle, rectPoly } from "../engine/iso";
import { piece } from "../assets";
import { bench, box, label, lamp, planter, plant, sign } from "./draw";
import { seat } from "./Npc";

/** Static floor: marble tiles, plaza rings, entrance mat. Drawn below everything. */
export function buildFloor(text: Content["lobby"]): Container {
  return piece("lobby-floor", () => {
    const c = new Container();
    const g = new Graphics();
    const N = WORLD_SIZE;
    box(g, 0, 0, N, N, 22, PALETTE.floorEdge, -22);
    g.poly(rectPoly(0, 0, N, N)).fill(PALETTE.floor);
    // large marble tiles
    for (let x = 0; x < N; x += 3) {
      for (let y = 0; y < N; y += 3) {
        if ((x + y) % 2 === 0) g.poly(rectPoly(x, y, Math.min(3, N - x), Math.min(3, N - y))).fill(PALETTE.floorAlt);
      }
    }
    for (let i = 0; i <= N; i += 3) {
      const a = iso(i, 0);
      const b = iso(i, N);
      const e = iso(0, i);
      const f = iso(N, i);
      g.moveTo(a.x, a.y).lineTo(b.x, b.y).moveTo(e.x, e.y).lineTo(f.x, f.y);
    }
    g.stroke({ width: 1, color: PALETTE.floorLine, alpha: 0.7 });

    // plaza rings
    const center = iso(PLAZA_CENTER.gx, PLAZA_CENTER.gy);
    const plaza = isoCircle(7.2);
    g.ellipse(center.x, center.y, plaza.rx, plaza.ry).fill({ color: 0xf6f1e9, alpha: 0.9 });
    [4.4, 6.4, 7.2].forEach((r, i) => {
      const { rx, ry } = isoCircle(r);
      g.ellipse(center.x, center.y, rx, ry).stroke({ width: i === 1 ? 3 : 1.5, color: i === 1 ? PALETTE.glow : 0xd8cdbd, alpha: i === 1 ? 0.55 : 1 });
    });

    // entrance mat
    box(g, 22.6, 22.6, 3.4, 3.4, 2, 0x2b2f38);
    g.poly(rectPoly(22.9, 22.9, 2.8, 2.8, 2)).stroke({ width: 1, color: 0x555a66 });
    c.addChild(g);

    const mat = iso(24.3, 24.3);
    const welcome = new Container();
    const t1 = label(text.mat[0], { fontSize: 13, fill: 0xf2ede4, fontWeight: "500" });
    const t2 = label(text.mat[1], { fontSize: 6, fill: 0xb9b3a8, letterSpacing: 1.5 });
    t1.anchor.set(0.5);
    t2.anchor.set(0.5);
    t2.y = 16;
    welcome.addChild(t1, t2);
    welcome.position.set(mat.x, mat.y - 6);
    // keep both lines inside the mat whatever the language
    const fit = Math.min(1, 150 / Math.max(t1.width, t2.width));
    welcome.scale.set(fit, fit * 0.62);
    c.addChild(welcome);
    return c;
  });
}

function place(target: Container, obj: Container, gx: number, gy: number) {
  const p = iso(gx, gy);
  obj.position.set(p.x, p.y);
  obj.zIndex = depth(gx, gy);
  target.addChild(obj);
}

/** Depth-sorted props: planter, plants, lamps, benches, signs. */
export function buildDecor(entities: Container, text: Content["lobby"]) {
  place(entities, piece("planter-center", () => planter(2.2)), PLAZA_CENTER.gx, PLAZA_CENTER.gy);

  const plants: [number, number, number, number][] = [
    [3, 11.5, 1.1, 0], [3, 14, 1.2, 1], [11.5, 3, 1.1, 1], [14.5, 3, 1.2, 0],
    [3, 24, 1.2, 0], [24, 3, 1.2, 1], [3.2, 27.5, 1, 1], [27.5, 3.2, 1, 0],
    [12.4, 22.3, 1, 0], [21.8, 12.8, 1, 1], [11.6, 25.8, 1.1, 1], [25.8, 11.8, 1.1, 0],
    [22.2, 27.6, 1, 0], [29.6, 22.6, 1, 1], [17.2, 27.6, 0.9, 1],
  ];
  plants.forEach(([gx, gy, s, v]) => place(entities, piece("plant-a", () => plant(s, v)), gx, gy));

  const lamps: [number, number][] = [
    [11.2, 13.6], [18.8, 16.4], [13.6, 11.2], [16.4, 18.8], [21.8, 21.8], [27.4, 27.4],
  ];
  lamps.forEach(([gx, gy]) => place(entities, piece("lamp", () => lamp()), gx, gy));

  place(entities, piece("bench", () => bench(true)), 15, 12.1);
  place(entities, piece("bench", () => bench(true)), 15, 18);

  // seats under seated visitors
  place(entities, seat(false), 12.1, 15.4);
  place(entities, seat(false), 17.8, 14.6);
  place(entities, seat(true, true), 15.2, 24);

  place(entities, sign(text.signLeft), 19.8, 25.6);
  place(entities, sign(text.signRight, { dark: true }), 27.4, 23.6);
}
