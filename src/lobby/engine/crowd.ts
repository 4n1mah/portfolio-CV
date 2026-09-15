import type { Content } from "@/content/sections";
import { PLACES, WAYPOINTS } from "../config";
import type { GridPoint, Visitor } from "../layers/Npc";
import type { PlaceId } from "../store";

// The crowd decides where each visitor goes and what they say, so every line matches what they do:
// "Voy a Experiencias" only when they are on their way there, a place's own comments only once they arrive,
// and "¿Ya viste…?" answered by a neighbour who then really goes.

type CrowdText = Content["lobby"]["crowd"];

const PLACE_IDS = Object.keys(PLACES) as PlaceId[];
// Two visitors fit side by side at a spot, this far from its centre.
const SLOT_SIDE = 0.45;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const gap = (a: GridPoint, b: GridPoint) => Math.hypot(a.gx - b.gx, a.gy - b.gy);

/** Shortest route between two waypoints (Dijkstra; the graph has about twenty nodes). */
function shortestRoute(from: string, to: string): string[] {
  const cost = new Map<string, number>([[from, 0]]);
  const prev = new Map<string, string>();
  const open = new Set([from]);
  while (open.size) {
    let node = "";
    for (const n of open) if (!node || cost.get(n)! < cost.get(node)!) node = n;
    open.delete(node);
    if (node === to) break;
    for (const next of WAYPOINTS[node].links) {
      const c = cost.get(node)! + gap(WAYPOINTS[node], WAYPOINTS[next]);
      if (c < (cost.get(next) ?? Infinity)) {
        cost.set(next, c);
        prev.set(next, node);
        open.add(next);
      }
    }
  }
  const path = [to];
  while (path[0] !== from) {
    const p = prev.get(path[0]);
    if (!p) return [from];
    path.unshift(p);
  }
  return path;
}

function routeLength(path: string[]) {
  let len = 0;
  for (let i = 1; i < path.length; i++) len += gap(WAYPOINTS[path[i - 1]], WAYPOINTS[path[i]]);
  return len;
}

interface Slot {
  key: string;
  spot: string;
  point: GridPoint;
}

/** The two standing points of each spot: side by side facing the place, stepped off the path when asked. */
function slotsOf(place: PlaceId): Slot[] {
  const { spots, look, step } = PLACES[place];
  return spots.flatMap((spot) => {
    const s = WAYPOINTS[spot];
    const len = gap(s, look) || 1;
    const tx = (look.gx - s.gx) / len;
    const ty = (look.gy - s.gy) / len;
    return [-1, 1].map((side) => ({
      key: `${spot}:${side}`,
      spot,
      point: { gx: s.gx + tx * step - ty * SLOT_SIDE * side, gy: s.gy + ty * step + tx * SLOT_SIDE * side },
    }));
  });
}

interface Member {
  v: Visitor;
  /** Waypoint they are at, or heading for. */
  node: string;
  place: PlaceId | null;
  slot: Slot | null;
  going: boolean;
  /** ms left at the current place. */
  timer: number;
  recent: PlaceId[];
  seen: Set<PlaceId>;
  /** A place a neighbour recommended and they agreed to visit next. */
  next: PlaceId | null;
  /** Times they waited for that place to free up. */
  waited: number;
}

export interface CrowdOptions {
  animated: boolean;
  /** Called when a visitor says hello to Anima. */
  onGreetAnima?: () => void;
}

export class Crowd {
  private members: Member[];
  private taken = new Set<string>();
  private jobs: { wait: number; run: () => void }[] = [];
  private slots = new Map(PLACE_IDS.map((id) => [id, slotsOf(id)]));

  constructor(
    private visitors: Visitor[],
    starts: string[],
    private text: CrowdText,
    private options: CrowdOptions,
  ) {
    const booths: PlaceId[] = ["about", "portfolio", "skills", "experience"];
    this.members = visitors.map((v, i) => ({
      v,
      node: starts[i],
      place: null,
      slot: null,
      going: false,
      timer: rand(300, 3000),
      recent: [],
      // as if they had come in through one booth already, so they have something to recommend early on
      seen: new Set([pick(booths)]),
      next: null,
      waited: 0,
    }));
  }

  update(dt: number) {
    for (const m of this.members) {
      const arrived = m.v.update(dt, this.visitors);
      if (!this.options.animated) continue;
      if (m.going) {
        if (arrived) this.arrive(m);
      } else if ((m.timer -= dt) <= 0 && !m.v.talking) {
        this.leave(m);
      }
    }
    for (const job of [...this.jobs]) {
      if ((job.wait -= dt) > 0) continue;
      this.jobs.splice(this.jobs.indexOf(job), 1);
      job.run();
    }
  }

  /** You hovered a place: someone standing there comments on it, or someone on the way says where they are going. */
  react(place: PlaceId) {
    const there = this.members.find((m) => m.place === place && !m.going && !m.v.talking);
    if (there) return there.v.say(pick(this.text.places[place].lines), 2.6);
    const coming = this.members.find((m) => m.place === place && m.going && !m.v.talking);
    if (coming) coming.v.say(this.fill(pick(this.text.going), place), 2.2);
  }

  private fill(template: string, place: PlaceId) {
    const t = this.text.places[place];
    return template.replace("{to}", t.to).replace("{name}", t.name);
  }

  private freeSlots(place: PlaceId) {
    return this.slots.get(place)!.filter((s) => !this.taken.has(s.key));
  }

  /** Weighted pick among free places: not where they just were, less likely if already seen or far away. */
  private choose(m: Member): PlaceId | null {
    const options = PLACE_IDS.filter((id) => id !== m.place && !m.recent.includes(id) && this.freeSlots(id).length);
    if (!options.length) return null;
    const weights = options.map((id) => {
      const far = routeLength(shortestRoute(m.node, PLACES[id].spots[0]));
      return PLACES[id].weight * (m.seen.has(id) ? 0.6 : 1) / (1 + far / 20);
    });
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (const [i, w] of weights.entries()) if ((r -= w) <= 0) return options[i];
    return options[options.length - 1];
  }

  private leave(m: Member) {
    const promised = m.next && this.freeSlots(m.next).length ? m.next : null;
    // they said they would go: wait a little for a free slot before giving up on it
    if (m.next && !promised && m.waited < 4) {
      m.waited++;
      m.timer = rand(900, 1500);
      return;
    }
    const place = promised ?? this.choose(m);
    m.next = null;
    m.waited = 0;
    if (!place) {
      m.timer = rand(800, 1600);
      return;
    }
    // the nearest free slot of the place
    const slot = this.freeSlots(place).sort((a, b) => gap(a.point, m.v) - gap(b.point, m.v))[0];
    if (m.slot) this.taken.delete(m.slot.key);
    this.taken.add(slot.key);
    const path = shortestRoute(m.node, slot.spot).map((n) => WAYPOINTS[n]);
    m.v.walk([...path, slot.point]);
    Object.assign(m, { place, slot, node: slot.spot, going: true });
    // whoever just agreed to go already said so
    if (!promised && Math.random() < 0.3) m.v.say(this.fill(pick(this.text.going), place), 2.4);
  }

  private arrive(m: Member) {
    const place = m.place!;
    m.going = false;
    m.timer = rand(...PLACES[place].dwell) * 1000;
    m.recent = [place, ...m.recent].slice(0, 3);
    m.seen.add(place);
    m.v.lookAt(PLACES[place].look);

    if (place === "anima" && Math.random() < 0.7) {
      m.v.say(pick(this.text.places.anima.lines), 2.4);
      this.later(1100, () => this.options.onGreetAnima?.());
    } else if (Math.random() < 0.4) {
      m.v.say(pick(this.text.places[place].lines), 2.6);
    } else if (Math.random() < 0.5) {
      this.recommend(m);
    }
  }

  /** Ask a nearby visitor about a place they have not seen; they agree and go there next. */
  private recommend(m: Member) {
    const other = this.members.find((o) => o !== m && !o.going && !o.next && !o.v.talking && gap(o.v, m.v) < 3);
    if (!other) return;
    const ideas = [...m.seen].filter((id) => id !== "plaza" && id !== other.place && !other.seen.has(id) && this.freeSlots(id).length);
    if (!ideas.length) return;
    const place = pick(ideas);
    m.v.say(this.fill(this.text.ask, place), 2.4);
    this.later(1300, () => {
      if (other.going || other.next) return;
      other.v.lookAt(m.v);
      other.v.say(pick(this.text.agree), 2.2);
      other.next = place;
      other.timer = Math.min(other.timer, 2400);
    });
  }

  private later(wait: number, run: () => void) {
    this.jobs.push({ wait, run });
  }
}
