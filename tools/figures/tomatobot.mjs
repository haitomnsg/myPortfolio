// Builds the TomatoBot v2 bench figure: node tools/figures/tomatobot.mjs [--audit]
// Writes tools/figures/out/tomatobot.html (a standalone preview in the site's palette) and
// src/figures/tomatobot/art.json (the static art and data the site's figure renders).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../src/figures/kit/iso-kit.mjs";
import * as G from "../../src/figures/kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../../src/figures/kit/tube.mjs";
import * as A from "../../src/figures/kit/audit.mjs";
import * as M from "../../src/figures/tomatobot/model.mjs";
import { makeArm } from "../../src/figures/tomatobot/arm.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FIG = join(ROOT, "src", "figures", "tomatobot");

const P = k.fitProjection(
  [...k.boxCorners(M.PLATE, -M.PLATE_H - M.FOOT_H, 0), [M.PLANTS[0], M.STAKE_Y, M.STAKE_TOP + 4], [M.PLANTS[2], M.STAKE_Y, M.STAKE_TOP + 4], [M.TROUGH.x, M.TROUGH.y, M.STAKE_TOP]],
  M.W,
  M.H,
  { pad: 22, azimuth: M.AZIMUTH },
);
const V = G.viewOf(P);
const KS = G.scaleOf(P);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const ink = (svg) => `<g class="mat-dark">${svg}</g>`;
const ARM = makeArm(k, G, M, P);
const DOT = 0.8; // terminal dot size in px

// ---------------------------------------------------------------- recorder
const R = A.recorder(P);
const layerOf = new Map();
function put(layer, name, centre, svg, shapes = [], { bias = 0, route, chunk, extra, record = true } = {}) {
  const id = R.nameFor(name);
  const named = shapes.map((s) => ({ ...s, name: s.name ?? id }));
  R.put({ name: id, at: centre, bias, svg, shapes: record ? named.map((s) => R.solid(s)) : named, route, chunk, ...(extra ?? {}) });
  layerOf.set(R.items[R.items.length - 1], layer);
  return id;
}
const slab = (layer, name, plan, z, h, style = {}, o = {}) =>
  put(layer, name, [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2], (o.wrap ?? ((x) => x))(S(k.slabOf(plan, z, h, P, o.steps ?? 3, o.bevel ?? 0.5), { tone: "mid", ...style, inner: o.inner ?? "" }) + (o.after ?? "")), [A.slab(plan, z, h, { name }, o.steps ?? 3)], o);
const cyl = (layer, name, cx, cy, r, z, h, style = {}, o = {}) =>
  put(layer, name, [cx, cy, z + h / 2], (o.wrap ?? ((x) => x))(S(k.cylinder(cx, cy, r, z, h, P, o.steps ?? 28, o.bevel ?? 0), { tone: "mid", ...style, inner: o.inner ?? "" }) + (o.after ?? "")), [A.cylinder(cx, cy, r, z, h, { name })], o);
const disc = (layer, name, F, s0, s1, r, style = {}, o = {}) =>
  put(layer, name, G.pointOf(F, (s0 + s1) / 2, 0, 0), (o.wrap ?? ((x) => x))(S(G.disc(s0, s1, r, F, P), { tone: "mid", ...style, inner: o.inner ?? "" }) + (o.after ?? "")), [A.disc(F, s0, s1, r, { name })], o);
const ball = (layer, name, c, r, style = {}, o = {}) => put(layer, name, c, (o.wrap ?? ((x) => x))(S(G.sphereOf(c, r, P, { steps: 32 }), { tone: "mid", crease: "none", ...style }) + (o.after ?? "")), [A.ball(c, r, { name })], o);
const dotAt = (layer, name, p, o = {}) => put(layer, name, p, D([at(p)], { size: DOT, tone: o.tone ?? "mid" }), [A.ball(p, DOT / KS, { name, owner: o.owner })], { bias: 0.05, ...o });

/** A tube (stem, wire): chunks depth-sorted on their own, recorded for the audit. */
function tube(layer, name, route, r, { tone = "mid", gaps = [], touch, limp = true, maxLength = 14, bias = 0, wrap, ends = [true, true], free } = {}) {
  const id = R.nameFor(name);
  R.route(id, route, r, { owner: id, touch, limp, gaps, ends, free, piece: layer });
  tubePieces(route, r, P, { maxLength, spacing: 1, gaps }).forEach((part, index) =>
    put(layer, `${id}:${index}`, part.mid, (wrap ?? ((x) => x))(tubeSvg(part, { tone })), [A.tube(part.points, part.radii)], { bias, route: id, chunk: index, record: false }),
  );
  return id;
}
const routeOf = (points, r, bend) => G.fillet(points, bend ?? Math.max(3, r * 2.6), 8, { P, tube: r });

// ---------------------------------------------------------------- bench (ground)
R.solid(A.slab(M.PLATE, -M.PLATE_H, M.PLATE_H, { name: "stand.plate", ground: true }, 8));
function bench() {
  const out = [];
  const z0 = -M.PLATE_H - M.FOOT_H;
  out.push(`<path class="iso-halo" d="${k.haloOf(M.PLATE, z0, M.PLATE_H, P)}"/>`);
  const feet = [...k.corners(M.PLATE, 24)].sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P));
  for (const [x, y] of feet) {
    out.push(S(k.cylinder(x, y, 8, z0, 1.6, P, 32), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 6.2, z0 + 1.6, M.FOOT_H - 1.6, P, 32), { tone: "mid" }));
  }
  out.push(S(k.slabOf(M.PLATE, -M.PLATE_H, M.PLATE_H, P, 8, 1.4), { tone: "mid", inner: L(k.sideSeam(M.PLATE, -M.PLATE_H + 3.2, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(M.PLATE, 6), 0, P), { tone: "lo" }));
  const screws = k.corners(M.PLATE, 12);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.4, 0, P, 18)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.55 }));
  // the ruler the robot's travel is read against
  const strip = { x: M.PLATE.x + 30, y: M.PLATE.y + M.PLATE.d - 16, w: M.PLATE.w - 92, d: 8, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2.2, 4], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 4, 0.6]), at([strip.x + strip.w - 2, strip.y + 4, 0.6])], { size: 0.45 }));
  // the figure's one engraved label
  const label = { x: M.PLATE.x + M.PLATE.w - 54, y: M.PLATE.y + M.PLATE.d - 30, w: 40, d: 18, r: 1.5 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 4), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.6), 0.8, P, 4), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 4.5, label.y + 7.4], 0.8, P, "x"), "TOMATOBOT V2", { size: 3.3, tone: "mid" }));
  out.push(L(k.lineOnTop([label.x + 4.5, label.y + 11.2], [label.x + 28, label.y + 11.2], 0.8, P), { tone: "faint", free: true }));
  out.push(L(k.lineOnTop([label.x + 4.5, label.y + 13.6], [label.x + 20, label.y + 13.6], 0.8, P), { tone: "faint", free: true }));
  out.push(D([at([label.x + 2.4, label.y + 2.4, 0.8]), at([label.x + label.w - 2.4, label.y + label.d - 2.4, 0.8])], { size: 0.4 }));
  return out.join("");
}

// ---------------------------------------------------------------- the row
const SOIL = M.TROUGH_H - 2.4;
function trough() {
  const T = M.TROUGH;
  const wall = 3;
  const H = M.TROUGH_H;
  // four planks: back and left are behind the soil, front and right in front of it
  const planks = [
    ["trough.back", { x: T.x, y: T.y, w: T.w, d: wall, r: 0.6 }],
    ["trough.left", { x: T.x, y: T.y + wall, w: wall, d: T.d - wall * 2, r: 0.4 }],
    ["trough.front", { x: T.x, y: T.y + T.d - wall, w: T.w, d: wall, r: 0.6 }],
    ["trough.right", { x: T.x + T.w - wall, y: T.y + wall, w: wall, d: T.d - wall * 2, r: 0.4 }],
  ];
  for (const [name, plan] of planks) {
    const seams = L([5.8, 11.4].map((z) => k.sideSeam(plan, z, P, 2)).join(""), { tone: "faint" });
    const screws = [];
    if (name === "trough.front") for (const x of [T.x + 1.6, T.x + T.w - 1.6]) for (const z of [3, 8.6, 14.2]) screws.push(at([x, T.y + T.d, z]));
    if (name === "trough.right") for (const y of [T.y + wall + 1.6, T.y + T.d - wall - 1.6]) for (const z of [3, 8.6, 14.2]) screws.push(at([T.x + T.w, y, z]));
    slab("plants", name, plan, 0, H, {}, { steps: 2, bevel: 0.4, inner: seams, after: screws.length ? D(screws, { size: 0.42, tone: "mid" }) : "" });
  }
  const inner = k.insetPlan(T, wall);
  const soil = k.slabOf(inner, 0, SOIL, P, 1);
  const crumbs = [];
  for (let i = 0; i < 150; i++) crumbs.push(at([inner.x + 2 + ((i * 0.6180339) % 1) * (inner.w - 4), inner.y + 2 + ((i * 0.4142135 + 0.17) % 1) * (inner.d - 4), SOIL]));
  put("plants", "trough.soil", [T.x + T.w / 2, T.y + T.d / 2, SOIL / 2], `<g class="iso-solid mat-soil"><path class="iso-fill" d="${soil.fill}"/><path class="iso-top" d="${soil.top}"/></g>${D(crumbs, { size: 0.42, tone: "lo" })}`, [A.slab(inner, 0, SOIL, {}, 1)]);
}

function leaf(name, base, along, side, len, wide) {
  const a = G.unit3(along);
  const s = G.unit3(side);
  const normal = G.unit3(G.cross3(a, s));
  const facing = G.dot3(normal, V) >= 0 ? normal : G.mul3(normal, -1);
  const width = (t) => wide * Math.pow(Math.sin(Math.PI * t), 0.85) * (1 - 0.25 * t);
  const edge = [];
  const n = 16;
  for (let i = 0; i <= n; i++) edge.push(G.add3(G.add3(base, G.mul3(a, (i / n) * len)), G.mul3(s, width(i / n))));
  for (let i = n - 1; i > 0; i--) edge.push(G.add3(G.add3(base, G.mul3(a, (i / n) * len)), G.mul3(s, -width(i / n))));
  const d = k.pathOf(edge.map(at), true);
  const tip = G.add3(base, G.mul3(a, len));
  const rib = L(k.pathOf([at(base), at(tip)]), { tone: "lo" });
  const veins = [];
  for (const t of [0.28, 0.48, 0.68]) for (const sign of [-1, 1]) veins.push(k.pathOf([at(G.add3(base, G.mul3(a, len * t))), at(G.add3(G.add3(base, G.mul3(a, len * (t + 0.1))), G.mul3(s, sign * width(t + 0.1))))]));
  const svg = `<g class="iso-solid mat-leaf"><path class="iso-fill" d="${d}"/><path class="iso-shade" data-shade="${Math.min(3, G.toneOf(facing, P))}" d="${d}"/>${L(veins.join(""), { tone: "faint" })}${rib}<path class="iso-line iso-edge" data-tone="mid" d="${d}"/></g>`;
  const mid = G.add3(base, G.mul3(a, len / 2));
  put("plants", name, mid, svg, [A.orientedBox(mid, [a, s, normal], [len / 2, wide * 0.75, 0.15], {})]);
}

const NODE_R = 2;
const STEM_R = 1.25;
// the stem stands in front of and beside its stake, so the two read apart on screen
const stemAt = (index, z) => [M.PLANTS[index] - 4.3 + 2 * Math.sin(z / 17 + index * 1.7), M.STAKE_Y + 5.5, z];

function plants() {
  M.PLANTS.forEach((sx, index) => {
    const sy = M.STAKE_Y;
    cyl("plants", `plant${index}.stake`, sx, sy, 1.5, SOIL, M.STAKE_TOP - SOIL, {}, { steps: 16, inner: L([60, 100].map((z) => k.sideArc(sx, sy, 1.5, z, P, 10)).join(""), { tone: "faint" }) });
    cyl("plants", `plant${index}.cap`, sx, sy, 2.2, M.STAKE_TOP, 2.2, {}, { steps: 18 });

    const full = [];
    for (let z = SOIL; z <= 141; z += 1) full.push(stemAt(index, z));
    const budR = NODE_R + 0.3;
    const total = G.pathLength(full);
    const route = G.cut(full, 0, total - Math.sqrt(budR * budR - STEM_R * STEM_R));
    const sAt = (z) => G.pathLength(full.filter((p) => p[2] <= z));
    // trusses first, then leaves wherever they keep 8 units from a truss
    const trusses = M.FRUITS.filter((f) => f.plant === index).map((f) => ({ f, s: sAt(f.at[2] + 13) }));
    const leafZ = [];
    for (const z of [28, 42, 56, 70, 84, 98, 112, 126]) if (trusses.every((t) => Math.abs(G.pointAlong(full, t.s)[2] - z) > 7)) leafZ.push(z);
    const half = Math.sqrt(NODE_R * NODE_R - STEM_R * STEM_R);
    const nodeS = [...trusses.map((t) => t.s), ...leafZ.map(sAt)];
    tube("plants", `plant${index}.stem`, route, STEM_R, { gaps: nodeS.map((s) => [s - half, s + half]), limp: false, maxLength: 10, touch: [`plant${index}.node*`] });
    for (const s of nodeS) ball("plants", `plant${index}.node`, G.pointAlong(full, s), NODE_R);
    ball("plants", `plant${index}.bud`, full[full.length - 1], budR);

    leafZ.forEach((z, j) => {
      // a compound leaf: a petiole with two pairs of leaflets and one at the tip
      const side = j % 2 ? 1 : -1;
      const node = G.pointAlong(full, sAt(z));
      const dir = G.unit3(side > 0 ? [1, -0.2, 0.3] : [-1, -0.16 - 0.06 * (j % 3), 0.3]);
      const r = 0.6;
      const len = 21;
      const start = G.add3(node, G.mul3(dir, Math.sqrt(NODE_R * NODE_R - r * r)));
      const end = G.add3(node, G.mul3(dir, len));
      const pid = tube("plants", `plant${index}.petiole${j}`, [start, G.add3(node, G.mul3(dir, len / 2)), end], r, { limp: false, maxLength: 24, touch: [`plant${index}.leaf${j}*`, `plant${index}.node*`] });
      dotAt("plants", `${pid}.end`, G.add3(end, G.mul3(dir, 0.2)));
      const across = G.unit3(G.cross3([0, 0, 1], dir)); // horizontal, at right angles to the petiole
      const back = G.dot3(across, [0, -1, 0]) > 0 ? across : G.mul3(across, -1);
      leaf(`plant${index}.leaf${j}.a`, G.add3(end, G.mul3(dir, 0.2 + DOT / KS)), G.add3(dir, [0, 0, -0.18]), G.unit3(G.cross3(dir, [0, 0, 1])), 16, 6);
      (side > 0 ? [[10.5, 11.5, 4.4], [14, 10, 3.8]] : [[9, 11.5, 4.4], [15, 10, 3.8]]).forEach(([s, l, w], pair) => {
        const on = G.add3(node, G.mul3(dir, s));
        const up = G.unit3(G.add3(G.mul3(back, 0.75), [0, 0, 0.55]));
        const down = G.unit3(G.add3(G.mul3(back, -0.45), [0, 0, -0.8]));
        leaf(`plant${index}.leaf${j}.u${pair}`, G.add3(on, G.mul3(up, r)), G.add3(up, G.mul3(dir, 0.35)), dir, l, w);
        leaf(`plant${index}.leaf${j}.d${pair}`, G.add3(on, G.mul3(down, r)), G.add3(down, G.mul3(dir, 0.35)), dir, l * 0.8, w * 0.85);
      });
    });

    for (const { f, s } of trusses) {
      const node = G.pointAlong(full, s);
      const r = 0.7;
      const top = [f.at[0], f.at[1], f.at[2] + Math.sqrt(M.FRUIT_R ** 2 - r * r)];
      const out = G.unit3([top[0] - node[0], top[1] - node[1], 0]);
      const start = G.add3(node, G.mul3(out, Math.sqrt(NODE_R * NODE_R - r * r)));
      const lead = G.add3(start, G.mul3(out, 4));
      const route = routeOf([start, lead, [top[0], top[1], lead[2]], top], r, 3.2);
      tube("plants", `fruit${f.id}.truss`, route, r, { limp: false, maxLength: 20, touch: [`fruit${f.id}`, `plant${index}.node*`] });
      const scar = `<g data-scar="${f.id}" style="display:none">${D([at(top)], { size: 0.9, tone: "mid" })}</g>`;
      put("plants", `fruit${f.id}`, f.at, `<g data-fruit="${f.id}">${fruitSvg(f.at, f.ripe)}</g>${scar}`, [A.ball(f.at, M.FRUIT_R, {})]);
    }
  });
}

/** A tomato: a ball with a five-sepal calyx; ripe ones carry the signal colour. */
function fruitSvg(centre, ripe) {
  const r = M.FRUIT_R;
  const top = [centre[0], centre[1], centre[2] + r * 0.98];
  const sepals = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    const tip = [centre[0] + Math.cos(a) * r * 0.55, centre[1] + Math.sin(a) * r * 0.55, centre[2] + r * Math.sqrt(1 - 0.55 * 0.55)];
    sepals.push(k.pathOf([at(top), at(tip)]));
  }
  return `<g class="fruit" data-ripe="${ripe ? "1" : "0"}">${S(G.sphereOf(centre, r, P, { steps: 48 }), { tone: "mid", crease: "none" })}${L(sepals.join(""), { tone: "mid" })}${D([at(top)], { size: 0.75, tone: "mid" })}</g>`;
}

// ---------------------------------------------------------------- the robot (its own coordinates)
const wheels = [];
function robot() {
  const T = M.TOP;
  for (const [wi, wy] of M.WHEEL_Y.entries()) {
    for (const wx of [-M.WHEEL_X, M.WHEEL_X]) {
      const outward = wi === 0 ? -1 : 1;
      const F = G.frameOf([wx, wy, M.WHEEL_R], [0, outward, 0], [1, 0, 0], [0, 0, 1]);
      const w2 = M.WHEEL_W / 2;
      const name = `wheel${wi}${wx > 0 ? "r" : "l"}`;
      const R0 = M.WHEEL_R;
      const profile = [[-w2, R0 - 2], [-w2 + 1.6, R0], [w2 - 1.6, R0], [w2, R0 - 2]];
      const tyre = G.solidOf(profile, F, P);
      const face = G.dot3(F.a, V) > 0.05;
      let svg = ink(S(tyre, { tone: "mid", inner: `<g data-tread="${name}">${ARM.tread(F, 0)}</g>` }));
      if (face) {
        svg += S(G.disc(w2 - 2.6, w2, R0 - 4.6, F, P), { tone: "mid" }) + L(G.circleOf(F, w2, 3.4, P) + G.circleOf(F, w2, R0 - 7.4, P), { tone: "lo" }) + `<g data-hub="${name}">${ARM.hub(F, 0)}</g>`;
      }
      put("robot", name, [wx, wy, R0], svg, [A.solid(F, profile, {})]);
      wheels.push({ name, F: { o: F.o, a: F.a, u: F.u, v: F.v } });
      // gear motor under the deck: shaft, gearbox, can, bracket up to the deck
      const inY = wy - outward * w2;
      const MF = G.frameOf([wx, inY, R0], [0, -outward, 0], [1, 0, 0], [0, 0, 1]);
      disc("robot", `${name}.shaft`, MF, 0, 3.4, 1.6, {}, { wrap: ink });
      const gy = outward < 0 ? inY + 3.4 : inY - 3.4 - 14;
      slab("robot", `${name}.gearbox`, { x: wx - 7, y: gy, w: 14, d: 14, r: 1 }, R0 - 6, 12, {}, { steps: 2, wrap: ink });
      const CF = G.frameOf([wx, outward < 0 ? gy + 14 : gy, R0], [0, -outward, 0], [1, 0, 0], [0, 0, 1]);
      disc("robot", `${name}.can`, CF, 0, 15, 5.4, {}, { wrap: ink, inner: L(G.arcOf(CF, 10, 5.4, P), { tone: "faint" }) });
      slab("robot", `${name}.bracket`, { x: wx - 8, y: gy + 2, w: 16, d: 10, r: 0.6 }, R0 + 6, M.DECK_Z - R0 - 6, {}, { steps: 2, wrap: ink });
    }
  }
  slab("robot", "deck", M.DECK, M.DECK_Z, M.DECK_T, {}, { steps: 3, bevel: 0.6, wrap: ink, inner: L(k.sideSeam(M.DECK, M.DECK_Z + 1.6, P, 3), { tone: "faint" }),
    after: ink(D(k.corners(M.DECK, 5).map(([x, y]) => at([x, y, T])), { size: 0.5, tone: "mid" }) + L(k.corners(M.DECK, 5).map(([x, y]) => k.ring(x, y, 1.6, T, P, 14)).join(""), { tone: "lo" })) });

  // base servo housing and the turntable bearing the arm turns on
  const [bx, by] = M.BASE;
  slab("robot", "base.housing", { x: bx - 11, y: by - 9, w: 22, d: 18, r: 1.4 }, T, 10, {}, { wrap: ink, after: D([[-8.5, -6.5], [8.5, -6.5], [-8.5, 6.5], [8.5, 6.5]].map(([dx, dy]) => at([bx + dx, by + dy, T + 10])), { size: 0.45 }) });
  cyl("robot", "base.bearing", bx, by, 9.5, T + 10, 3, {}, { steps: 40, wrap: ink, inner: L(k.sideArc(bx, by, 9.5, T + 11.5, P, 24), { tone: "faint" }) });

  // Raspberry Pi in a vented case, two USB ports on its +x end
  const pi = { x: 6, y: -26, w: 32, d: 22, r: 2 };
  slab("robot", "pi.case", pi, T, 9, {}, { inner: L(k.sideSeam(pi, T + 4.5, P, 3), { tone: "faint" }), after: L(Array.from({ length: 6 }, (_, i) => k.planOutline({ x: pi.x + 6 + i * 3.4, y: pi.y + 5, w: 1.4, d: 12, r: 0.7 }, T + 9, P, 2)).join(""), { tone: "lo" }) });
  for (const y of [pi.y + 4, pi.y + 12]) slab("robot", "pi.usb", { x: pi.x + pi.w, y, w: 2.2, d: 6, r: 0.4 }, T + 2, 4.4, { tone: "lo" }, { steps: 2, after: L(k.pathOf([at([pi.x + pi.w + 2.2, y + 1.2, T + 3.6]), at([pi.x + pi.w + 2.2, y + 4.8, T + 3.6]), at([pi.x + pi.w + 2.2, y + 4.8, T + 4.8]), at([pi.x + pi.w + 2.2, y + 1.2, T + 4.8])], true), { tone: "lo" }) });

  // motor driver on four standoffs: finned heatsink, two screw terminals
  const md = { x: 44, y: -2, w: 26, d: 24, r: 1 };
  for (const [x, y] of k.corners(md, 2.4)) cyl("robot", "driver.standoff", x, y, 1.1, T, 3, {}, { steps: 12 });
  slab("robot", "driver.board", md, T + 3, 1.4, { tone: "lo" }, { steps: 2, bevel: 0.3, after: D(k.corners(md, 2.4).map(([x, y]) => at([x, y, T + 4.4])), { size: 0.5, tone: "mid" }) });
  slab("robot", "driver.sink", { x: md.x + 5, y: md.y + 6, w: 13.6, d: 8.4, r: 0.4 }, T + 4.4, 1.6, {}, { steps: 1, wrap: ink });
  for (let i = 0; i < 6; i++) slab("robot", "driver.fin", { x: md.x + 5.6 + i * 2.5, y: md.y + 6, w: 1.1, d: 8.4, r: 0.2 }, T + 6, 7.4, {}, { steps: 1, bevel: 0, wrap: ink });
  const terminals = [md.y + 2, md.y + md.d - 7];
  for (const y of terminals) slab("robot", "driver.terminal", { x: md.x + md.w - 6, y, w: 5, d: 5, r: 0.4 }, T + 4.4, 4.6, {}, { steps: 1, after: D([at([md.x + md.w - 3.5, y + 1.6, T + 9]), at([md.x + md.w - 3.5, y + 3.4, T + 9])], { size: 0.5, tone: "hi" }) });

  // two 18650 cells resting in a holder tray between its end clips
  const bh = { x: 24, y: 44, w: 36, d: 17, r: 1.2 };
  slab("robot", "cells.tray", bh, T, 1.4, {}, { steps: 2, bevel: 0.3, wrap: ink });
  for (const x of [bh.x, bh.x + bh.w - 1.8]) slab("robot", "cells.clip", { x, y: bh.y, w: 1.8, d: bh.d, r: 0.4 }, T + 1.4, 7, {}, { steps: 1, wrap: ink });
  for (const cy of [bh.y + 4.4, bh.y + 12.6]) {
    const F = G.frameOf([bh.x + 1.8, cy, T + 1.4 + 3.7], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    disc("robot", "cells.cell", F, 0, bh.w - 3.6, 3.7, {}, { inner: L(G.arcOf(F, bh.w - 8, 3.7, P), { tone: "faint" }) });
  }

  // power bank, four charge lamps on its edge
  const pb = { x: -72, y: 30, w: 44, d: 24, r: 3.4 };
  slab("robot", "powerbank", pb, T, 10, {}, { steps: 5, bevel: 0.8, inner: L(k.sideSeam(pb, T + 5, P, 5), { tone: "faint" }), after: D([0, 1, 2, 3].map((i) => at([pb.x + pb.w, pb.y + 7 + i * 3, T + 7.6])), { size: 0.55, tone: "mid" }) });

  // the cup the arm drops fruit into: a painted can with a paper label, a coil of cable round its foot
  const { x: cx, y: cy, r: cr, h: ch } = M.CUP;
  const CF = G.frameOf([cx, cy, T], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const cupPaths = G.lathe([[0, 0], [0, cr - 0.6], [0.6, cr], [ch, cr], [ch, cr - 1.2], [1.4, cr - 1.2], [1.4, 0]], CF, P, { fill: "hull" });
  const rim = Array.from({ length: 96 }, (_, i) => at(G.pointOf(CF, ch, cr - 1.2, (i / 96) * Math.PI * 2)));
  const opening = k.pathOf(rim, true);
  // fruit dropped in the cup is seen through its mouth: clip it to the near half of the rim and everything above
  const left = rim.reduce((best, p, i) => (p[0] < rim[best][0] ? i : best), 0);
  const right = rim.reduce((best, p, i) => (p[0] > rim[best][0] ? i : best), 0);
  const walk = (from, to, dir) => { const out = []; for (let i = from; ; i = (i + dir + 96) % 96) { out.push(rim[i]); if (i === to) break; } return out; };
  const halves = [walk(left, right, 1), walk(left, right, -1)];
  const nearHalf = halves.reduce((a, b) => (Math.max(...a.map((p) => p[1])) > Math.max(...b.map((p) => p[1])) ? a : b));
  const mouth = k.pathOf([...nearHalf, [rim[right][0], -2000], [rim[left][0], -2000]], true);
  const coils = [2.2, 4.6].map((s) => G.arcOf(CF, s, cr, P)).join("");
  // the label is a sleeve round the can's front, between two seams
  const label = G.ringBand(12, 27, cr - 0.01, cr + 0.12, CF, P, { steps: 96 });
  const front = G.angleToward(CF, G.viewOf(P));
  const labelSides = (s0, s1) => {
    const pts = [];
    for (const [a0, a1] of [[front - 1.15, front + 1.15]]) {
      for (let i = 0; i <= 24; i++) pts.push(at(G.pointOf(CF, s0, cr + 0.12, a0 + ((a1 - a0) * i) / 24)));
      for (let i = 24; i >= 0; i--) pts.push(at(G.pointOf(CF, s1, cr + 0.12, a0 + ((a1 - a0) * i) / 24)));
    }
    return k.pathOf(pts, true);
  };
  void label;
  put("robot", "cup", [cx, cy, T + ch / 2],
    `<g class="mat-cup">${S(cupPaths, { tone: "mid", inner: L(coils, { tone: "lo" }) })}</g><path class="cup-label" d="${labelSides(12, 27)}"/><path class="iso-line" data-tone="lo" d="${labelSides(12, 27)}"/><path class="cup-void" d="${opening}"/><clipPath id="tb-cup-mouth"><path d="${mouth}"/></clipPath><g data-cup-fruit clip-path="url(#tb-cup-mouth)"></g>${L(G.arcOf(CF, ch, cr - 1.2, P, { inward: true, least: -1 }), { tone: "lo" })}`,
    [A.lathe(CF, [[0, 0], [0, cr], [ch, cr], [ch, 0]], {})]);

  // webcam on a clip at the back edge, looking at the row
  const cam = M.CAM;
  slab("robot", "cam.clip", { x: cam.x - 4, y: M.DECK.y + 1, w: 8, d: 8, r: 1 }, T, 6, {}, { steps: 2, wrap: ink });
  slab("robot", "cam.neck", { x: cam.x - 2, y: cam.y + 2, w: 4, d: 4, r: 1 }, T + 6, cam.z - T - 6 - 5.4, {}, { steps: 2, wrap: ink });
  const camF = G.frameOf([cam.x, cam.y + 4.5, cam.z], [0, -1, 0], [1, 0, 0], [0, 0, 1]);
  const lens = G.stadium(5.4, 5.4, 15).map(([x, y]) => [x - 7.5, y]);
  put("robot", "cam.body", [cam.x, cam.y + 0.5, cam.z], ink(S(G.prismOf(camF, lens, 0, 8, P), { tone: "mid" })), [A.prism(camF, lens, 0, 8, {})]);

  // cables: USB from the webcam's back to the Pi, the cells to the driver, the Pi to the arm's servos
  const back = cam.y + 4.5;
  const usbFrom = [cam.x - 6, back, cam.z - 1];
  const port = [pi.x + pi.w + 2.2, pi.y + 15, T + 4.2];
  const usb = tube("robot", "cable.usb", routeOf([usbFrom, [cam.x - 6, back + 6, cam.z - 1], [port[0] + 10, port[1], port[2] + 8], [port[0] + 4, port[1], port[2]], port], 0.75, 6), 0.75, { touch: ["pi.usb*", "cam.body"] });
  dotAt("robot", `${usb}.end`, [usbFrom[0], usbFrom[1] + 0.12, usbFrom[2]], { owner: usb });
  const clipFace = bh.x + bh.w;
  const term = [md.x + md.w - 1, md.y + md.d - 4.5, T + 6.6];
  const wire = tube("robot", "cable.cells", routeOf([[clipFace, bh.y + 3, T + 0.62], [clipFace + 6, bh.y + 3, T + 0.62], [clipFace + 9, bh.y - 3, T + 0.62], [term[0] + 6, term[1] + 9, T + 0.62], [term[0] + 6, term[1], term[2]], term], 0.6, 4), 0.6, { touch: ["deck", "cells.clip*", "driver.terminal*"] });
  dotAt("robot", `${wire}.end`, [clipFace + 0.12, bh.y + 3, T + 0.62], { owner: wire });
  tube("robot", "cable.harness", routeOf([[pi.x, pi.y + 15, T + 4.5], [pi.x - 2.5, pi.y + 15, T + 4.5], [pi.x - 3.5, pi.y + 15.2, T + 3.4], [bx + 15, by + 4, T + 3.4], [bx + 14, by + 4, T + 4.5], [bx + 11, by + 4, T + 4.5]], 0.9, 2.4), 0.9, { touch: ["pi.case", "base.housing"] });
}

// ---------------------------------------------------------------- assemble
const benchSvg = bench();
trough();
plants();
robot();

A.settle(R, P);
const ordered = [...R.items].sort((a, b) => a.key - b.key);
const layer = (name) => ordered.filter((item) => layerOf.get(item) === name).map((item) => item.svg).join("");
// The row is drawn before the robot: every robot part stands nearer than the planter's front plank
// wherever the robot drives, so keys that interleave the two never meet on screen the wrong way.

const LABEL = "TomatoBot v2 on a bench beside a planter of three staked tomato plants. The robot is a black plywood deck on four wheels with gear motors, carrying a Raspberry Pi, a motor driver, two cells, a power bank, a webcam that looks at the row and a cup. A six-servo arm stands at the back of the deck. It drives along the row, picks the ripe tomatoes and drops them in the cup; unripe ones stay on the vine.";

const svg = k.figureSvg({
  width: M.W,
  height: M.H,
  label: LABEL,
  className: "tb-figure",
  body: [
    benchSvg,
    `<g data-layer="plants">${layer("plants")}</g>`,
    // the camera's sight runs from the lens (behind the webcam body) to the fruit, so it sits between the two layers
    `<g data-sight></g>`,
    `<g data-robot><path class="iso-halo" d="${k.haloOf(k.insetPlan(M.DECK, -4), 0, 1, P)}"/>${layer("robot")}<g data-arm>${ARM.svg(M.REST)}</g></g>`,
  ],
});

const DATA = { P, wheels, fruitSvg: [fruitSvg([0, 0, 0], false), fruitSvg([0, 0, 0], true)] };
// The site fetches the drawing when its section comes near (it is about 110 KB gzipped, too much to
// inline twice in the HTML and the RSC payload); the live code only needs this small data file.
const css = readFileSync(join(FIG, "figure.css"), "utf8");
const standalone = svg.replace('class="iso-svg tb-figure"', 'class="iso-svg iso tb-figure" data-theme="light"').replace(/^<svg([^>]*)>/, `<svg$1><style>${k.ISO_CSS}${css}</style>`);
mkdirSync(join(ROOT, "public", "figures"), { recursive: true });
writeFileSync(join(ROOT, "public", "figures", "tomatobot.svg"), standalone);
writeFileSync(join(FIG, "data.json"), JSON.stringify(DATA));

// ---------------------------------------------------------------- the preview page
const source = (file) => readFileSync(join(ROOT, "src", "figures", file), "utf8");
const namesOf = (text) => [...text.matchAll(/^export (?:const|function) (\w+)/gm)].map((m) => m[1]);
const wrap = (name, text, names) => `const ${name} = (() => {${text.replace(/^import .*$/gm, "").replace(/^export /gm, "")}\nreturn { ${names.join(", ")} };})();\n`;
const lathe = source("kit/lathe.mjs");
const model = source("tomatobot/model.mjs");
const script = [
  source("kit/iso-kit.mjs").replace(/^export /gm, ""),
  wrap("G", lathe, namesOf(lathe)),
  wrap("M", model, namesOf(model)),
  source("tomatobot/arm.mjs").replace(/^export /gm, ""),
  source("tomatobot/live.mjs").replace(/^export /gm, ""),
  `const DATA = ${JSON.stringify(DATA)};
const k = { iso, solidSvg, lineSvg, dotsSvg, fadedSvg, pathOf, translateAlong };
const stage = document.querySelector(".iso-stage");
const readoutEl = document.querySelector("[data-readout]");
const arm = makeArm(k, G, M, DATA.P);
window.__tb = { arm, DATA };
mountTomatobot(stage, { k, G, M, arm, data: DATA, say: (text) => { if (readoutEl.textContent !== text) readoutEl.textContent = text; } });`,
].join("\n");
const stageHtml = `<div class="iso-stage" tabindex="0" role="group" aria-label="TomatoBot: point at a tomato, or use the arrow keys to choose one and Enter to pick it">${svg}</div>`;
const page = k.pageHtml({
  title: "TomatoBot v2",
  theme: "light",
  width: 720,
  body: `<style>${css}</style>` + k.plateHtml({ fig: "Fig 1", title: "TomatoBot bench", hint: "point at a tomato", readout: "scanning · 3 ripe", body: stageHtml }),
  script,
});
mkdirSync(join(HERE, "out"), { recursive: true });
writeFileSync(join(HERE, "out", "tomatobot.html"), page);
console.log("wrote out/tomatobot.html", `${(page.length / 1024).toFixed(0)} KB`, `items ${R.items.length}`);

A.auditOrExit(R, P, { crowd: [["cable.usb", "trough.front"], ["cable.cells", "cells.cell*"]] });
