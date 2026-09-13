import { Container, Graphics } from "pixi.js";
import { PALETTE, PLAZA_CENTER, SITTERS, WORLD_SIZE } from "../config";
import { depth, iso, isoCircle, rectPoly } from "../engine/iso";
import { piece } from "../assets";
import { bench, box, lamp, planter, plant } from "./draw";
import { seat } from "./Npc";

/** Static floor: marble tiles and plaza rings (image from assets or vector placeholder). Drawn below everything. */
export function buildFloor(): Container {
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
    c.addChild(g);
    return c;
  });
}

function place(target: Container, obj: Container, gx: number, gy: number) {
  const p = iso(gx, gy);
  obj.position.set(p.x, p.y);
  obj.zIndex = depth(gx, gy);
  target.addChild(obj);
}

/** Depth-sorted props: planter, plants, lamps, benches. */
export function buildDecor(entities: Container) {
  place(entities, piece("planter-center", () => planter(2.2)), PLAZA_CENTER.gx, PLAZA_CENTER.gy);

  const plants: [number, number, number, number][] = [
    [3, 11.5, 1.1, 0], [3, 14, 1.2, 1], [11.5, 3, 1.1, 1], [14.5, 3, 1.2, 0],
    [3, 24, 1.2, 0], [24, 3, 1.2, 1], [3.2, 27.5, 1, 1], [27.5, 3.2, 1, 0],
    [12.4, 22.3, 1, 0], [21.8, 12.8, 1, 1], [11.6, 25.8, 1.1, 1], [25.8, 11.8, 1.1, 0],
    [21, 28.2, 1, 0], [30, 21.4, 1, 1], [17.2, 27.6, 0.9, 1],
  ];
  plants.forEach(([gx, gy, s, v]) => place(entities, piece(v === 0 ? "plant-a" : "plant-b", () => plant(s, v), s), gx, gy));

  const lamps: [number, number][] = [
    // the two front plaza lamps stand clear of the bench ends; the last two flank the front of Experience
    [11.2, 13.6], [18.8, 17.4], [13.6, 11.2], [17.4, 18.8], [24.2, 29.8], [29.8, 24.2],
  ];
  lamps.forEach(([gx, gy]) => place(entities, piece("lamp", () => lamp()), gx, gy));

  place(entities, piece("bench", () => bench(true)), 15, 12.1);
  place(entities, piece("bench", () => bench(true)), 15, 18);

  // seats under seated visitors: shorter benches along gy (the bench image mirrored) and the lounge sofa
  SITTERS.forEach(({ seat: s }) => {
    const obj = s.kind === "sofa" ? piece("sofa", () => seat(true, true)) : piece("bench", () => seat(false), 0.9, true);
    place(entities, obj, s.gx, s.gy);
  });
}
