import { Container, Graphics } from "pixi.js";
import type { Content } from "@/content/sections";
import { ENTRANCE_MAT, PALETTE, PLAZA_CENTER, SITTERS, WORLD_SIZE } from "../config";
import { depth, iso, isoCircle, rectPoly, TILE_W } from "../engine/iso";
import { piece } from "../assets";
import { bench, box, DETAIL, label, lamp, planter, plant, sign } from "./draw";
import { seat } from "./Npc";

/** Static floor: marble tiles, plaza rings, entrance mat. Drawn below everything. */
export function buildFloor(text: Content["lobby"]): Container {
  const floor = new Container();
  floor.addChild(floorArt(), matLettering(text));
  return floor;
}

/** Floor art (image from assets or vector placeholder). Contains no text, so it works in any language. */
function floorArt(): Container {
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
    // same radii as the floor art: the plaza ends inside the visitors' ring and clear of every booth
    const plaza = isoCircle(5.4);
    g.ellipse(center.x, center.y, plaza.rx, plaza.ry).fill({ color: 0xf6f1e9, alpha: 0.9 });
    [4.3, 4.8, 5.4].forEach((r, i) => {
      const { rx, ry } = isoCircle(r);
      g.ellipse(center.x, center.y, rx, ry).stroke({ width: i === 1 ? 3 : 1.5, color: i === 1 ? PALETTE.glow : 0xd8cdbd, alpha: i === 1 ? 0.55 : 1 });
    });

    // entrance mat
    const { gx: mx, gy: my, size } = ENTRANCE_MAT;
    box(g, mx - size / 2, my - size / 2, size, size, 2, 0x2b2f38);
    g.poly(rectPoly(mx - size / 2 + 0.3, my - size / 2 + 0.3, size - 0.6, size - 0.6, 2)).stroke({ width: 1, color: 0x555a66 });
    c.addChild(g);
    return c;
  });
}

/** Mat lettering drawn over the floor art, in the current language. */
function matLettering(text: Content["lobby"]): Container {
  const mat = iso(ENTRANCE_MAT.gx, ENTRANCE_MAT.gy);
  const welcome = new Container();
  const t1 = label(text.mat[0], { fontSize: 13, fill: 0xf2ede4, fontWeight: "500" });
  const t2 = label(text.mat[1], { fontSize: 6, fill: 0xb9b3a8, letterSpacing: 1.5 });
  t1.anchor.set(0.5);
  t2.anchor.set(0.5);
  t2.y = 16;
  t2.label = DETAIL;
  welcome.addChild(t1, t2);
  welcome.position.set(mat.x, mat.y - 6);
  // keep both lines inside the mat whatever the language
  const fit = Math.min(1, (ENTRANCE_MAT.size * TILE_W * 0.7) / Math.max(t1.width, t2.width));
  welcome.scale.set(fit, fit * 0.62);
  return welcome;
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
    [21, 28.2, 1, 0], [30, 21.4, 1, 1], [17.2, 27.6, 0.9, 1],
  ];
  plants.forEach(([gx, gy, s, v]) => place(entities, piece(v === 0 ? "plant-a" : "plant-b", () => plant(s, v), s), gx, gy));

  const lamps: [number, number][] = [
    // the two front lamps stand clear of the bench ends
    [11.2, 13.6], [18.8, 17.4], [13.6, 11.2], [17.4, 18.8], [21.8, 21.8], [24.2, 29.8], [29.8, 24.2],
  ];
  lamps.forEach(([gx, gy]) => place(entities, piece("lamp", () => lamp()), gx, gy));

  place(entities, piece("bench", () => bench(true)), 15, 12.1);
  place(entities, piece("bench", () => bench(true)), 15, 18);

  // seats under seated visitors: shorter benches along gy (the bench image mirrored) and the lounge sofa
  SITTERS.forEach(({ seat: s }) => {
    const obj = s.kind === "sofa" ? piece("sofa", () => seat(true, true)) : piece("bench", () => seat(false), 0.9, true);
    place(entities, obj, s.gx, s.gy);
  });

  place(entities, sign(text.signLeft), 19.8, 25.6);
  place(entities, sign(text.signRight, { dark: true }), 27.4, 23.6);
}
