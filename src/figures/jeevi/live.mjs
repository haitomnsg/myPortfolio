// JeevI, live: a diagonal trot on the treadmill. The belt runs at the commanded speed (0.2–0.4 m/s,
// the range the policy was trained on); stance feet ride the belt, swing feet step onto whatever is
// ahead; the console's buttons run the belt on to a terrain. Every value shown comes from model.mjs.

/**
 * @param {HTMLElement} stage the element holding the figure's <svg>
 * @param {{ k: any, G: any, M: any, parts: any, data: any, say?: (text: string) => void, describe?: (text: string) => void }} opts
 * @returns {() => void} stops the figure
 */
export function mountJeevi(stage, { k, G, M, parts, data, say = (text) => void text, describe = (text) => void text }) {
  const svg = stage.querySelector("svg");
  const P = data.P;
  const V = G.viewOf(P);
  const depth = (p) => G.dot3(p, V);
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const bodyG = svg.querySelector("[data-body]");
  const behind = svg.querySelector("[data-behind]");
  const front = svg.querySelector("[data-front]");
  const beltPath = svg.querySelector("[data-belt]");
  const needle = svg.querySelector("[data-needle]");
  const buttons = [...svg.querySelectorAll("[data-button]")];
  const lift = (zb, inner) => `<g transform="${k.translateAlong(P, [0, 0, zb])}">${inner}</g>`;

  // ------------------------------------------------------------ state
  let b = data.B0; // belt travel, mm
  const speed = { x: M.CRUISE, v: 0 };
  let want = M.CRUISE;
  let gait = 0; // gait clock, in cycles
  const body = { x: M.STAND, v: 0 };
  let seek = null; // the section the belt is running on to
  let visible = false;
  let frame = 0;
  let last = 0;
  let idle = 0;
  let steering = false;

  const settle = (s, target, dt, seconds, calm) => {
    if (calm) { s.x = target; s.v = 0; return false; }
    const w = 1 / seconds;
    for (let i = 0; i < 4; i++) {
      s.v += (w * w * (target - s.x) - 2 * w * s.v) * (dt / 4);
      s.x += s.v * (dt / 4);
    }
    if (Math.abs(target - s.x) < 1e-3 && Math.abs(s.v) < 1e-3) { s.x = target; s.v = 0; return false; }
    return true;
  };

  // each leg remembers where its stance foot touched down (belt travel and position) or where its swing began
  const legs = M.LEGS.map((leg) => {
    const home = M.homeOf(leg);
    return { leg, home, stance: null, swing: null, phase: 0 };
  });
  const groundAt = (x, y, travel) => M.heightAt(x, y, travel);
  function stepFeet(dt) {
    const v = speed.x;
    for (const L of legs) {
      const phase = M.phaseOf(L.leg, gait);
      const wasStance = L.phase < 0.5;
      L.phase = phase;
      const [hx, hy] = L.home;
      if (phase < 0.5) {
        if (!L.stance || !wasStance) {
          // touch down a half-stride ahead of home, on whatever is under it
          const x = hx + M.STRIDE / 2;
          L.stance = { x, y: hy, z: groundAt(x, hy, b), b };
          L.swing = null;
        }
      } else if (!L.swing || wasStance) {
        const from = L.stance ? [L.stance.x - (b - L.stance.b), L.stance.y, L.stance.z] : [hx - M.STRIDE / 2, hy, 0];
        // where it lands: half a stride ahead, on the belt as it will be at touchdown
        const time = 0.5 / Math.max(0.1, M.hzAt(v));
        const toX = hx + M.STRIDE / 2;
        const ahead = b + v * time;
        const toZ = groundAt(toX, hy, ahead);
        let top = Math.max(from[2], toZ);
        for (let s = 0; s <= 1; s += 0.1) top = Math.max(top, groundAt(from[0] + (toX - from[0]) * s, hy, b + v * time * s));
        L.swing = { from, to: [toX, hy, toZ], top };
        L.stance = null;
      }
    }
    void dt;
  }
  function footOf(L) {
    // without motion the robot simply stands, every foot at home on whatever is under it
    if (still.matches) return [L.home[0], L.home[1], groundAt(L.home[0], L.home[1], b)];
    if (L.phase < 0.5 && L.stance) return [L.stance.x - (b - L.stance.b), L.stance.y, L.stance.z];
    const s = (L.phase - 0.5) / 0.5;
    const e = s * s * (3 - 2 * s);
    const { from, to, top } = L.swing;
    const z = from[2] + (to[2] - from[2]) * e + (top - Math.min(from[2], to[2]) + 26) * Math.sin(Math.PI * s);
    return [from[0] + (to[0] - from[0]) * e, from[1], Math.max(z, from[2] + (to[2] - from[2]) * e)];
  }

  // ------------------------------------------------------------ drawing
  // Terrain blocks only slide with the belt, so the whole ones are drawn once and moved; the few the
  // hood openings cut are rebuilt each frame. The robot is drawn after the terrain, and any block that
  // stands nearer than a foot and over it on screen is painted again after that foot.
  const whole = svg.querySelector("[data-terrain]");
  const cut = svg.querySelector("[data-terrain-cut]");
  let drawnAt = null;
  let drawnSet = "";
  let wholeItems = [];
  const screenBox = (plan, h) => {
    const pts = [];
    for (const x of [plan.x, plan.x + plan.w]) for (const y of [plan.y, plan.y + plan.d]) for (const z of [0, h]) pts.push(k.iso([x, y, z], P));
    return [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
  };
  function drawTerrain() {
    const items = parts.terrain(b, "whole");
    const set = items.map((it) => it.feature.u0 + ":" + it.feature.y0).join(",");
    if (set !== drawnSet) {
      whole.innerHTML = items.map((it) => it.svg).join("");
      drawnSet = set;
      drawnAt = b;
    }
    whole.setAttribute("transform", k.translateAlong(P, [-(b - drawnAt), 0, 0]));
    wholeItems = items;
    const cutItems = parts.terrain(b, "cut");
    cut.innerHTML = cutItems.map((it) => it.svg).join("");
    return [...wholeItems, ...cutItems];
  }
  // Each leg half is a group with one slot per piece: fill, four shades, top, crease, edge and a marks
  // group, in solidSvg's order. Frames only rewrite their `d`s; a group moves between the containers
  // behind and in front of the body when its depth passes the body's.
  const NS = "http://www.w3.org/2000/svg";
  const make = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const [a, v] of Object.entries(attrs)) el.setAttribute(a, v);
    parent?.appendChild(el);
    return el;
  };
  function slotOf(parent, before) {
    const wrap = make("g", {});
    parent.insertBefore(wrap, before);
    const g = make("g", { class: "iso-solid" }, wrap);
    const fill = make("path", { class: "iso-fill" }, g);
    const shades = [0, 1, 2, 3].map((i) => make("path", { class: "iso-shade", "data-shade": String(i) }, g));
    const top = make("path", { class: "iso-top" }, g);
    const crease = make("path", { class: "iso-line iso-crease", "data-tone": "faint" }, g);
    const edge = make("path", { class: "iso-line iso-edge" }, g);
    const marks = make("g", {}, wrap);
    const last = {};
    const set = (el, d) => { d = d || ""; if (el.getAttribute("d") !== d) el.setAttribute("d", d); };
    return (p) => {
      const sp = p.solid;
      set(fill, sp.fill);
      sp.shades.forEach((d, i) => set(shades[i], d));
      set(top, sp.top);
      set(crease, p.style.crease === "none" ? "" : sp.crease);
      set(edge, sp.outline);
      if (last.cls !== p.cls) { wrap.setAttribute("class", p.cls); last.cls = p.cls; }
      if (last.tone !== p.style.tone) { edge.setAttribute("data-tone", p.style.tone); last.tone = p.style.tone; }
      if (last.lit !== !!p.style.lit) { g.toggleAttribute("data-lit", !!p.style.lit); last.lit = !!p.style.lit; }
      if (last.seamless !== !!sp.seamless) { g.toggleAttribute("data-seamless", !!sp.seamless); last.seamless = !!sp.seamless; }
      if (last.marks !== p.marks) { marks.innerHTML = p.marks; last.marks = p.marks; }
    };
  }
  behind.innerHTML = "";
  front.innerHTML = "";
  const groupsOf = legs.map(() => [0, 1, 2, 3, 4].map(() => {
    const g = make("g", {});
    const over = make("g", {}, g);
    return { g, over, slots: [], key: 0, overSvg: "" };
  }));
  const allGroups = groupsOf.flat();
  function mountGroup(grp, pieces, zb, overSvg) {
    while (grp.slots.length < pieces.length) grp.slots.push(slotOf(grp.g, grp.over));
    pieces.forEach((p, i) => grp.slots[i](p));
    for (let i = pieces.length; i < grp.slots.length; i++) grp.slots[i](EMPTY);
    grp.g.setAttribute("transform", k.translateAlong(P, [0, 0, zb]));
    if (grp.overSvg !== overSvg) { grp.over.innerHTML = overSvg; grp.overSvg = overSvg; }
  }
  const EMPTY = { solid: { fill: "", shades: ["", "", "", ""], top: "", crease: "", outline: "" }, style: { tone: "hi" }, cls: "", marks: "" };
  let drawnOrder = "";
  function draw() {
    beltPath.setAttribute("d", parts.beltLines(b));
    const blocks = drawTerrain().filter((it) => it.h > 0);
    const zb = body.x;
    bodyG.setAttribute("transform", k.translateAlong(P, [0, 0, zb]));
    const bodyKey = depth([0, 0, zb]);
    const order = [];
    legs.forEach((L, i) => {
      const f = footOf(L);
      const ik = M.legIK(L.leg, [f[0], f[1], f[2] - zb]);
      const g = parts.leg(L.leg, ik);
      const [under, up, top, joined, low] = groupsOf[i];
      // blocks in front of this foot that rise over it are painted again after it
      const footKey = depth(f);
      const fs = k.iso(f, P);
      const reach = 26;
      const over = blocks.filter((it) => {
        if (it.h <= f[2] + 1 || depth([it.centre[0], it.centre[1], 0]) <= footKey + 8) return false;
        const [x0, y0, x1, y1] = screenBox(it.plan, it.h);
        return fs[0] > x0 - reach && fs[0] < x1 + reach && fs[1] > y0 - reach * 3 && fs[1] < y1 + reach;
      });
      // the group is lifted with the body, so the repainted blocks drop back to the belt
      const overSvg = over.length ? `<g transform="${k.translateAlong(P, [0, 0, -zb])}">${over.map((it) => it.svg).join("")}</g>` : "";
      under.key = depth(G.add3(g.anchor.under, [0, 0, zb]));
      up.key = depth(G.add3(g.anchor.upper, [0, 0, zb]));
      top.key = depth(G.add3(g.anchor.over, [0, 0, zb]));
      joined.key = up.key;
      low.key = depth(G.add3(g.anchor.lower, [0, 0, zb]));
      const behindBody = up.key < bodyKey;
      mountGroup(under, g.under, zb, "");
      mountGroup(up, behindBody ? g.upper : [], zb, "");
      mountGroup(top, behindBody ? g.over : [], zb, "");
      mountGroup(joined, behindBody ? [] : g.joined, zb, "");
      mountGroup(low, g.lower, zb, overSvg);
      order.push({ under, upper: up, over: top, joined, lower: low });
    });
    const { behind: back, front: fore } = parts.order(order, bodyKey);
    const sig = back.map((g) => allGroups.indexOf(g)).join(",") + "|" + fore.map((g) => allGroups.indexOf(g)).join(",");
    if (sig !== drawnOrder) {
      for (const g of back) behind.appendChild(g.g);
      for (const g of fore) front.appendChild(g.g);
      drawnOrder = sig;
    }
    needle.setAttribute("d", needleD(speed.x / 1000));
    const here = M.sectionAt(0, b);
    buttons.forEach((el, i) => el.toggleAttribute("data-on", M.SECTIONS[i] === (seek ?? here)));
    say(readout(here));
  }
  const needleD = (share) => {
    const [dx, dz, dr] = data.needle.dial;
    const a = Math.PI * 1.25 - share * Math.PI * 1.5;
    const y = data.face + 4.8;
    return k.pathOf([k.iso([dx, y, dz], P), k.iso([dx + Math.cos(a) * (dr - 6), y, dz + Math.sin(a) * (dr - 6)], P)]);
  };
  function readout(here) {
    if (seek) return `${seek.label} in ${(distanceTo(seek) / 1000).toFixed(1)} m`;
    return `${here.label} · reward ${here.reward.toFixed(2)}`;
  }
  // belt still to run before a section's leading edge reaches the robot's front feet
  const distanceTo = (section) => (((section.from + 40 - M.beltU(M.homeOf(M.LEGS[0])[0], b)) % M.LOOP) + M.LOOP) % M.LOOP;

  // ------------------------------------------------------------ loop
  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    const calm = still.matches;
    if (seek && distanceTo(seek) < 30 + speed.x * dt * 2) seek = null;
    const target = seek ? M.SPEED[1] : steering ? want : M.CRUISE;
    settle(speed, target, dt, 0.45, false);
    if (!calm) {
      b += speed.x * dt;
      gait += M.hzAt(speed.x) * dt;
    }
    stepFeet(dt);
    // the body rides the mean height under the stance feet
    const feet = legs.map(footOf);
    const stance = legs.filter((L) => L.phase < 0.5);
    const ground = stance.length ? stance.reduce((s, L) => s + footOf(L)[2], 0) / stance.length : 0;
    void feet;
    settle(body, M.STAND + ground, dt, 0.18, calm);
    draw();
    if (steering) { idle += dt; if (idle > 3.6) steering = false; }
    frame = visible && !calm ? requestAnimationFrame(tick) : 0;
  }
  const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };

  // ------------------------------------------------------------ input
  function go(i) {
    const s = M.SECTIONS[i];
    if (!s) return;
    describe(`${s.label} terrain: converged reward ${s.reward.toFixed(2)} in Isaac Lab.`);
    if (still.matches) {
      // no motion: put the chosen terrain straight under the robot
      b = (((s.from + 300) - M.homeOf(M.LEGS[0])[0]) % M.LOOP + M.LOOP) % M.LOOP;
      body.x = M.STAND + legs.reduce((sum, L) => sum + footOf(L)[2], 0) / 4;
      draw();
      return;
    }
    // already under the robot: nothing to run on to
    seek = M.sectionAt(0, b) === s ? null : s;
    run();
  }
  stage.addEventListener("click", (event) => {
    const el = event.target.closest?.("[data-button]");
    if (el) go(Number(el.dataset.button));
  });
  stage.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const box = svg.getBoundingClientRect();
    const share = Math.min(1, Math.max(0, ((event.clientX - box.left) / box.width - 0.15) / 0.7));
    want = M.SPEED[0] + share * (M.SPEED[1] - M.SPEED[0]);
    steering = true;
    idle = 0;
    stage.style.cursor = event.target.closest?.("[data-button]") ? "pointer" : "";
  });
  stage.addEventListener("pointerleave", () => { idle = 2.4; });
  stage.addEventListener("keydown", (event) => {
    const n = { 1: 0, 2: 1, 3: 2 }[event.key];
    if (n !== undefined) { event.preventDefault(); go(n); return; }
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      want = Math.min(M.SPEED[1], Math.max(M.SPEED[0], (steering ? want : M.CRUISE) + (event.key === "ArrowRight" ? 50 : -50)));
      steering = true;
      idle = 0;
      run();
    }
  });
  const io = new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" });
  io.observe(stage);
  still.addEventListener?.("change", run);
  stepFeet(0);
  draw();
  return () => { io.disconnect(); cancelAnimationFrame(frame); };
}
