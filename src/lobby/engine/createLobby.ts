import { Application, Container, type FederatedPointerEvent } from "pixi.js";
import gsap from "gsap";
import { content, type Locale } from "@/content/sections";
import { PALETTE, PLAZA_CENTER, SITTERS, VISITORS, WAYPOINTS, WORLD_SIZE, standsFor } from "../config";
import { ASSETS, loadAssets } from "../assets";
import { lobbyStore, type StandId } from "../store";
import { DETAIL, fonts } from "../layers/draw";
import { buildDecor, buildFloor } from "../layers/Scene";
import { Stand } from "../layers/Stand";
import { Sitter, Visitor } from "../layers/Npc";
import { NameSign } from "../layers/NameSign";
import { Camera } from "./camera";
import { depth, iso, isoCircle, TILE_H, TILE_W } from "./iso";

export const PANEL = { breakpoint: 768, width: 480, widthVw: 0.44, sheetVh: 0.64 };

/** Width (desktop) or height (mobile) the section panel covers, mirrored in CSS. */
export function panelCover(width: number, height: number) {
  return width < PANEL.breakpoint
    ? { x: 0, y: height * PANEL.sheetVh }
    : { x: Math.min(PANEL.width, width * PANEL.widthVw), y: 0 };
}

let instances = 0;

const BOUNDS = {
  minX: -WORLD_SIZE * (TILE_W / 2) - 20,
  maxX: WORLD_SIZE * (TILE_W / 2) + 20,
  minY: -90,
  maxY: WORLD_SIZE * TILE_H + 40,
};

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function tweenTint(obj: Container, gray: number, duration: number) {
  const state = { v: (obj.tint & 0xff) / 255 };
  gsap.to(state, {
    v: gray,
    duration,
    onUpdate: () => {
      const c = Math.round(state.v * 255);
      obj.tint = (c << 16) | (c << 8) | c;
    },
  });
}

export async function createLobby(host: HTMLElement, locale: Locale): Promise<() => void> {
  const instance = ++instances;
  const text = content[locale].lobby;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const app = new Application();
  await app.init({
    resizeTo: host,
    background: PALETTE.background,
    antialias: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
  });
  host.appendChild(app.canvas);
  app.canvas.style.touchAction = "none";

  // Pixi text uses the same families next/font loaded for the page.
  const css = getComputedStyle(document.documentElement);
  fonts.sans = css.getPropertyValue("--font-sans").trim() || fonts.sans;
  fonts.script = css.getPropertyValue("--font-script").trim() || fonts.script;
  await Promise.all([
    document.fonts.load(`700 24px ${fonts.sans}`),
    document.fonts.load(`700 14px ${fonts.script}`),
    loadAssets(),
  ]).catch(() => undefined);

  // --- layers ---
  const world = new Container();
  const floor = buildFloor();
  const entities = new Container();
  entities.sortableChildren = true;
  const bubbles = new Container();
  world.addChild(floor, entities, bubbles);
  app.stage.addChild(world);

  buildDecor(entities);

  const stands = new Map<StandId, Stand>();
  for (const cfg of standsFor(text)) {
    const stand = new Stand(cfg, bubbles);
    stands.set(cfg.id, stand);
    entities.addChild(stand);
  }

  // "Sadiel’s Plaza" plate centred on the front band of the central planter, above its light strip
  const nameSign = new NameSign(text.plazaSign);
  const plaza = iso(PLAZA_CENTER.gx, PLAZA_CENTER.gy);
  nameSign.position.set(plaza.x, plaza.y + (ASSETS["planter-center"].src ? 12 : isoCircle(2.2).ry - 17));
  nameSign.zIndex = depth(PLAZA_CENTER.gx, PLAZA_CENTER.gy) + 1;
  entities.addChild(nameSign);

  const occluders = [...stands.values()].map(({ cfg }) => ({ gx: cfg.gx, gy: cfg.gy, w: cfg.w, d: cfg.d, z: depth(cfg.gx, cfg.gy) }));
  const starts = Object.keys(WAYPOINTS).filter((k) => k.startsWith("r"));
  const visitors = VISITORS.map((look, i) => {
    const v = new Visitor(look, starts[i % starts.length], reducedMotion, bubbles, text.visitorLines, occluders);
    entities.addChild(v);
    return v;
  });
  const sitters = SITTERS.map((spot, i) => {
    const s = new Sitter(spot, text.sitterLines[i % text.sitterLines.length], !reducedMotion, bubbles);
    entities.addChild(s);
    return s;
  });

  // --- camera ---
  const store = lobbyStore;
  const camera = new Camera(world, app.canvas, BOUNDS, (kind) => {
    if (store.getState().pointer !== kind) store.getState().setPointer(kind);
  });
  // What the first view must show: every booth, walls included.
  const booths = (() => {
    const xs: number[] = [];
    const ys: number[] = [];
    for (const { cfg } of stands.values()) {
      const far = iso(cfg.gx, cfg.gy);
      xs.push(iso(cfg.gx, cfg.gy + cfg.d).x, iso(cfg.gx + cfg.w, cfg.gy).x);
      ys.push(far.y - 110, iso(cfg.gx + cfg.w, cfg.gy + cfg.d).y);
    }
    return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  })();
  const home = () => {
    const fit = camera.fitScale();
    const { width, height } = app.screen;
    const mobile = width < PANEL.breakpoint;
    camera.minScale = mobile ? fit : fit * 0.9;
    if (mobile) return { x: 0, y: (BOUNDS.minY + BOUNDS.maxY) / 2, scale: Math.max(fit, 0.55) };
    // ~18% closer than "whole island" so booths read better; the empty floor tips may crop,
    // but never a booth or the entrance
    const margin = 40;
    const hintBar = 36; // bottom hint pill: keep the front booth above it
    const contentFit = Math.min(
      width / (booths.maxX - booths.minX + margin * 2),
      (height - hintBar) / (booths.maxY - booths.minY + margin * 2),
    );
    const scale = Math.min(fit * 1.18, contentFit);
    return {
      x: (booths.minX + booths.maxX) / 2,
      y: (booths.minY + booths.maxY) / 2 + hintBar / 2 / scale,
      scale,
    };
  };
  camera.resize(app.screen.width, app.screen.height);
  const start = home();
  let homeView = start;
  if (reducedMotion) {
    camera.view = start;
    camera.apply();
  } else {
    camera.view = { ...start, scale: start.scale * 1.35, y: start.y + 60 };
    camera.apply();
    camera.flyTo(start, 1.8);
  }

  const onResize = () => {
    camera.resize(app.screen.width, app.screen.height);
    const { active } = store.getState();
    if (active) focus(active, 0);
    else if (camera.userMoved) homeView = home();
    else camera.flyTo((homeView = home()), reducedMotion ? 0 : 0.4);
  };
  app.renderer.on("resize", onResize);

  // --- interaction ---
  const focus = (id: StandId, duration: number) => {
    const stand = stands.get(id)!;
    const { width, height } = app.screen;
    const cover = panelCover(width, height);
    const availW = width - cover.x;
    const availH = height - cover.y;
    const scale = Math.min(availW / 480, availH / 400, 2.4);
    camera.locked = true;
    camera.flyTo({ ...stand.focusPoint, scale, offsetX: -cover.x / 2, offsetY: -cover.y / 2 }, duration);
  };

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  app.stage.on("pointertap", (e: FederatedPointerEvent) => {
    if (e.target !== app.stage || camera.wasDrag) return;
    const s = store.getState();
    if (s.nameLinksOpen) s.setNameLinks(false);
    if (s.active) s.close();
    else if (s.hovered) s.setHovered(null);
  });

  nameSign.on("pointerover", (e: FederatedPointerEvent) => {
    const s = store.getState();
    if (e.pointerType === "mouse" && !s.active) s.setNameLinks(true);
  });
  nameSign.on("pointerout", (e: FederatedPointerEvent) => {
    if (e.pointerType === "mouse") store.getState().closeNameLinksSoon();
  });
  nameSign.on("pointertap", () => {
    const s = store.getState();
    if (camera.wasDrag || s.active) return;
    s.setNameLinks(!s.nameLinksOpen || s.pointer === "mouse");
  });

  for (const [id, stand] of stands) {
    stand.on("pointerover", (e: FederatedPointerEvent) => {
      const s = store.getState();
      if (e.pointerType === "mouse" && !s.active) s.setHovered(id);
    });
    stand.on("pointerout", (e: FederatedPointerEvent) => {
      const s = store.getState();
      if (e.pointerType === "mouse" && s.hovered === id) s.setHovered(null);
    });
    stand.on("pointertap", (e: FederatedPointerEvent) => {
      if (camera.wasDrag) return;
      const s = store.getState();
      if (s.active) {
        if (s.active !== id) s.close();
        return;
      }
      if (e.pointerType === "mouse" || s.hovered === id) s.open(id);
      else s.setHovered(id);
    });
  }

  const dimAll = (keep: StandId | null, gray: number, duration: number) => {
    tweenTint(floor, keep ? gray : 1, duration);
    for (const child of entities.children) {
      const isKept = keep && child === stands.get(keep);
      tweenTint(child, isKept ? 1 : gray, duration);
    }
  };

  const nearestVisitor = (stand: Stand) => {
    const fp = stand.focusPoint;
    return visitors
      .map((v) => ({ v, d: Math.hypot(v.x - fp.x, v.y - fp.y) }))
      .sort((a, b) => a.d - b.d)[0]?.v;
  };

  const unsubscribe = store.subscribe((state, prev) => {
    const dur = reducedMotion ? 0 : 0.35;
    if (state.nameLinksOpen !== prev.nameLinksOpen) {
      nameSign.setOpen(state.nameLinksOpen, reducedMotion);
      if (state.nameLinksOpen) placeNameLinks();
    }
    if (state.hovered !== prev.hovered) {
      if (prev.hovered) stands.get(prev.hovered)!.setHover(false, reducedMotion);
      if (state.hovered) {
        const stand = stands.get(state.hovered)!;
        stand.setHover(true, reducedMotion);
        if (stand.cfg.npcLine && !reducedMotion) nearestVisitor(stand)?.say(stand.cfg.npcLine);
      }
      if (!state.active) dimAll(state.hovered, state.hovered ? 0.86 : 1, dur);
    }
    if (state.active !== prev.active) {
      if (state.active) {
        if (!prev.active) camera.save();
        const stand = stands.get(state.active)!;
        stands.forEach((s) => s !== stand && s.setHover(false, reducedMotion));
        stand.setHover(true, reducedMotion, text.activeGreeting);
        focus(state.active, reducedMotion ? 0 : 0.95);
        dimAll(state.active, 0.55, reducedMotion ? 0 : 0.6);
      } else {
        stands.forEach((s) => s.setHover(false, reducedMotion));
        camera.restore(reducedMotion ? 0 : 0.85);
        dimAll(null, 1, reducedMotion ? 0 : 0.5);
      }
    }
  });

  // Rebuilt while a section is open (e.g. language switch): jump straight back to that stand.
  const openAtStart = store.getState().active;
  if (openAtStart) {
    camera.view = { ...start };
    camera.save();
    stands.get(openAtStart)!.setHover(true, true, text.activeGreeting);
    focus(openAtStart, 0);
    dimAll(openAtStart, 0.55, 0);
  }

  // The link popover is HTML; keep it pinned above the sign while the camera moves.
  const stage = host.parentElement ?? host;
  const placeNameLinks = () => {
    const p = nameSign.toGlobal({ x: 0, y: nameSign.anchorY });
    stage.style.setProperty("--name-links-x", `${p.x}px`);
    stage.style.setProperty("--name-links-y", `${p.y}px`);
  };

  // "Exploring" = zoomed in or panned away from the overview; the HUD header shrinks meanwhile.
  const updateExploring = () => {
    const { x, y, scale } = camera.view;
    const away = Math.hypot(x - homeView.x, y - homeView.y) * scale > 90;
    // only after a manual pan/zoom, so the intro fly-in doesn't flicker the header
    const exploring = camera.userMoved && (scale > homeView.scale * 1.12 || away);
    if (store.getState().exploring !== exploring) store.getState().setExploring(exploring);
  };

  const detailNodes = world.getChildrenByLabel(DETAIL, true);
  let detailLevel = 0;
  for (const node of detailNodes) node.alpha = 0;

  // --- loop ---
  app.ticker.add((ticker) => {
    const dt = Math.min(ticker.deltaMS, 50);
    visitors.forEach((v) => v.update(dt));
    sitters.forEach((s) => s.update(dt));
    // small print fades in once the zoom makes it legible (~1x), independent of screen size
    const zoomDetail = smoothstep(0.95, 1.3, world.scale.x);
    stands.forEach((s) => s.update(dt, zoomDetail));
    if (Math.abs(zoomDetail - detailLevel) > 0.001) {
      detailLevel += (zoomDetail - detailLevel) * Math.min(1, dt / 140);
      for (const node of detailNodes) node.alpha = detailLevel;
    }
    camera.update(dt);
    // keep speech bubbles legible when zoomed out
    const bubbleScale = Math.min(2.4, Math.max(1, 0.8 / world.scale.x));
    for (const b of bubbles.children) b.scale.set(bubbleScale);
    if (store.getState().nameLinksOpen) placeNameLinks();
    if (!camera.locked) updateExploring();
  });

  const onVisibility = () => (document.hidden ? app.ticker.stop() : app.ticker.start());
  document.addEventListener("visibilitychange", onVisibility);

  // an older instance that finishes loading late must not clobber the live one
  if (instance === instances) {
    if (process.env.NODE_ENV !== "production") Object.assign(globalThis, { __lobby: { app, camera, stands, visitors } });
    store.getState().setReady(true);
  }

  return () => {
    unsubscribe();
    document.removeEventListener("visibilitychange", onVisibility);
    camera.destroy();
    const killAll = (obj: Container) => {
      gsap.killTweensOf([obj, obj.scale]);
      obj.children.forEach((child) => killAll(child as Container));
    };
    killAll(app.stage);
    // a newer instance (e.g. React strict mode remount) may already be live
    if (instance === instances) store.getState().setReady(false);
    app.destroy({ removeView: true }, { children: true });
  };
}
