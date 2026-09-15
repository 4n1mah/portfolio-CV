import { Container, Graphics } from "pixi.js";
import { NOTES_BOARD, PALETTE, PLAZA_CENTER, SITTERS, WORLD_SIZE } from "../config";
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

  // Plants sit on the centres of the outer ring of floor tiles, mirrored across the vertical axis
  // (gx <-> gy), in the gaps between booths: one accent at the back gap About–Skills, and from each side
  // corner a row alternating round and tall plants along the front edge, stopping short of Experience's lamps.
  const T = WORLD_SIZE / 8;
  const tile = (i: number) => (i + 0.5) * T;
  const half: [number, number, number, number][] = [
    [tile(0), tile(3), 1.2, 1],
    [tile(0), tile(6), 1.1, 1], [tile(0), tile(7), 1.2, 0], [tile(1), tile(7), 1.1, 1],
    [tile(2), tile(7), 1, 0], [tile(3), tile(7), 1.1, 1], [tile(4), tile(7), 1, 0],
  ];
  // the visitor notes mural takes the back gap between About and Portfolio (nothing behind it either)
  const clear = (gx: number, gy: number) => {
    const b = NOTES_BOARD;
    return !(gx < b.gx + 1 && gy > b.gy - 1 && gy < b.gy + b.d + 1);
  };
  const plants = half.flatMap(([gx, gy, s, v]) => [[gx, gy, s, v], [gy, gx, s, v]]).filter(([gx, gy]) => clear(gx, gy));
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
