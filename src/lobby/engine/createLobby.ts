import { Application, Container, type FederatedPointerEvent } from "pixi.js";
import gsap from "gsap";
import { content, profile, type Locale } from "@/content/sections";
import { PALETTE, SITTERS, VISITORS, WAYPOINTS, standsFor } from "../config";
import { loadAssets } from "../assets";
import { lobbyStore, type StandId } from "../store";
import { fonts } from "../layers/draw";
import { buildDecor, buildFloor } from "../layers/Scene";
import { Stand } from "../layers/Stand";
import { Sitter, Visitor } from "../layers/Npc";
import { NameSign } from "../layers/NameSign";
import { Camera } from "./camera";
import { depth, iso, TILE_H, TILE_W } from "./iso";

export const PANEL = { breakpoint: 768, width: 480, widthVw: 0.44, sheetVh: 0.64 };

/** Width (desktop) or height (mobile) the section panel covers, mirrored in CSS. */
export function panelCover(width: number, height: number) {
  return width < PANEL.breakpoint
    ? { x: 0, y: height * PANEL.sheetVh }
    : { x: Math.min(PANEL.width, width * PANEL.widthVw), y: 0 };
}

let instances = 0;

const BOUNDS = {
  minX: -27 * (TILE_W / 2) - 20,
  maxX: 27 * (TILE_W / 2) + 20,
  minY: -90,
  maxY: 27 * TILE_H + 40,
};

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
    document.fonts.load(`400 12px ${fonts.script}`),
    loadAssets(),
  ]).catch(() => undefined);

  // --- layers ---
  const world = new Container();
  const floor = buildFloor(text);
  const entities = new Container();
  entities.sortableChildren = true;
  const bubbles = new Container();
  world.addChild(floor, entities, bubbles);
  app.stage.addChild(world);

  buildDecor(entities, text);

  const stands = new Map<StandId, Stand>();
  for (const cfg of standsFor(text)) {
    const stand = new Stand(cfg, bubbles);
    stands.set(cfg.id, stand);
    entities.addChild(stand);
  }

  // golden sign with the owner name, right in front of the central planter
  const nameSign = new NameSign(profile.name, content[locale].ui.role);
  const signSpot = iso(14.7, 14.7);
  nameSign.position.set(signSpot.x, signSpot.y);
  nameSign.zIndex = depth(14.7, 14.7);
  entities.addChild(nameSign);

  const starts = Object.keys(WAYPOINTS).filter((k) => k.startsWith("r"));
  const visitors = VISITORS.map((look, i) => {
    const v = new Visitor(look, starts[i % starts.length], reducedMotion, bubbles, text.visitorLines);
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
  const home = () => {
    const fit = camera.fitScale();
    const mobile = app.screen.width < PANEL.breakpoint;
    camera.minScale = mobile ? fit : fit * 0.9;
    return { x: 0, y: (BOUNDS.minY + BOUNDS.maxY) / 2, scale: mobile ? Math.max(fit, 0.55) : fit };
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

  // --- loop ---
  app.ticker.add((ticker) => {
    const dt = Math.min(ticker.deltaMS, 50);
    visitors.forEach((v) => v.update(dt));
    sitters.forEach((s) => s.update(dt));
    stands.forEach((s) => s.update(dt));
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
    if (process.env.NODE_ENV !== "production") Object.assign(globalThis, { __lobby: { app, camera, stands } });
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
