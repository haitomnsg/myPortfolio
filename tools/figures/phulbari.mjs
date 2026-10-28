// Builds Fig 7, Phulbari's pot: node tools/figures/phulbari.mjs [--audit]
import * as k from "../../src/figures/kit/iso-kit.mjs";
import * as G from "../../src/figures/kit/lathe.mjs";
import * as A from "../../src/figures/kit/audit.mjs";
import { tubePieces, tubeSvg } from "../../src/figures/kit/tube.mjs";
import * as M from "../../src/figures/rovers/phulbari.mjs";
import { makeBuilder, finish, writeFigure } from "./rover-lib.mjs";

const leafPoints = M.LEAVES.flatMap((spec) => M.leafOf(spec).rows.flatMap((r) => [r.left, r.right]));
const tubeAt = M.tubeRoute();
const P = k.fitProjection([...k.boxCorners(M.PLATE, -15, 0), ...leafPoints, ...tubeAt.points], M.W, M.H, { pad: 22, azimuth: M.AZIMUTH });
const B = makeBuilder(P);
const { slab, disc, put, at, S, L, D, ink } = B;
const V = B.V;
const { add3, sub3, mul3, unit3, cross3, dot3 } = G;
const lift = 0.8 / B.KS - 0.4; // end dots far enough out of their mounts not to sink in at this scale

const mat = (cls) => (s) => `<g class="${cls}">${s}</g>`;
const rounded = (x0, x1, y0, y1, r, n = 4) => {
  const out = [];
  const cx = [x1 - r, x0 + r, x0 + r, x1 - r];
  const cy = [y1 - r, y1 - r, y0 + r, y0 + r];
  for (let c = 0; c < 4; c++) {
    for (let i = 0; i <= n; i++) {
      const a = (c * Math.PI) / 2 + (i / n) * (Math.PI / 2);
      out.push([cx[c] + Math.cos(a) * r, cy[c] + Math.sin(a) * r]);
    }
  }
  return out;
};
/** A block extruded along `F.a` from s0 to s1, its outline a polygon in (u, v). */
function block(layer, name, F, poly, s0, s1, { wrap = (s) => s, tone = "mid", inner = "", after = "", bias = 0 } = {}) {
  const c = poly.reduce((acc, [x, y]) => [acc[0] + x / poly.length, acc[1] + y / poly.length], [0, 0]);
  const centre = add3(add3(add3(F.o, mul3(F.a, (s0 + s1) / 2)), mul3(F.u, c[0])), mul3(F.v, c[1]));
  return put(layer, name, centre, wrap(S(G.prismOf(F, poly, s0, s1, P), { tone, inner })) + after, [A.prism(F, poly, s0, s1, {})], { bias });
}
/** A tube drawn in chunks and recorded for the audit; `wrap` tints it, `dots` puts terminal dots on its ends. */
function tube(layer, name, points, r, { wrap = (s) => s, tone = "mid", touch, bend, dots = [false, false], limp = true, closed = false, rings = null, gaps = [], maxLength = 14, water = false } = {}) {
  const route = closed ? points : G.fillet(points, bend ?? Math.max(3, r * 2.6), 8, { P, tube: r });
  const id = R.nameFor(name);
  R.route(id, route, r, { owner: id, touch, limp, piece: layer, closed, gaps });
  const pieces = tubePieces(route, r, P, { maxLength, spacing: 1, closed, rings, gaps });
  const total = G.pathLength(route);
  pieces.forEach((part, index) => {
    // the clear tube carries the water: a stroke down its middle that the page reveals as it flows
    // it runs 1.2 past each end of its chunk, past the shine that overlaps the neighbour, so no seam shows
    const w0 = Math.max(0, part.from - 1.2);
    const w1 = Math.min(total, part.to + 1.2);
    const flat = G.cut(route, w0, w1).map(at);
    const run = flat.reduce((sum, p, i) => sum + (i ? Math.hypot(p[0] - flat[i - 1][0], p[1] - flat[i - 1][1]) : 0), 0);
    const flow = water ? `<path class="ph-water" data-water="${w0.toFixed(2)} ${w1.toFixed(2)} ${run.toFixed(2)}" stroke-dasharray="0 ${(run * 2).toFixed(1)}" d="${k.pathOf(flat)}"/>` : "";
    put(layer, `${id}:${index}`, part.mid, wrap(tubeSvg(part, { tone })) + flow, [A.tube(part.points, part.radii)], { route: id, chunk: index, record: false });
  });
  const back = (tip, from) => add3(tip, mul3(unit3(sub3(from, tip)), lift));
  if (dots[0]) B.dotAt(layer, `${id}.end`, back(route[0], route[1]), { owner: id });
  if (dots[1]) B.dotAt(layer, `${id}.end`, back(route[route.length - 1], route[route.length - 2]), { owner: id });
  return { route, id, total: G.pathLength(route), pieces };
}
const R = B.R;

// ---------------------------------------------------------------- the power bank on the bench, its ports toward the pot
const BK = M.BANK;
const bankTop = BK.h;
const bx0 = BK.x; // its port end
const portAt = (y0) => k.pathOf([[y0, 5], [y0 + 14, 5], [y0 + 14, 11], [y0, 11]].map(([y, z]) => at([bx0 - 0.01, BK.y + y, z])), true);
slab("bench", "bank", BK, 0, BK.h, {}, { steps: 5, bevel: 0.8, wrap: ink, inner: L(k.sideSeam(BK, BK.h / 2, P, 5), { tone: "faint" }),
  after: L(k.planOutline({ x: BK.x + 40, y: BK.y + 12, w: 46, d: BK.d - 24, r: 3 }, bankTop, P, 3), { tone: "lo" }) +
    D([0, 1, 2, 3].map((i) => at([BK.x + 16 + i * 5, BK.y + BK.d - 12, bankTop])), { size: 0.55, tone: "mid" }) +
    L(portAt(14) + portAt(34), { tone: "lo" }) });
// a USB-A plug in its first port
const plug = { x: bx0 - 14, y: BK.y + 15, w: 14, d: 12, r: 1 };
slab("bench", "bank.plug", plug, 4, 8, {}, { steps: 2, bevel: 0.4, wrap: ink, after: L(k.sideSeam(plug, 8, P, 2), { tone: "faint" }) });

// ---------------------------------------------------------------- the pot: a turned body with a rolled lip; inside, the soil
const potF = G.frameOf([0, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const T = M.POT.top;
const ridges = L([M.POT.z1, 98.6, 104.2, 110].map((s) => G.arcOf(potF, s, M.POT_SIDE.find((p) => p[0] >= s)?.[1] ?? M.POT.lip, P)).join(""), { tone: "faint" });
// drainage notches at the foot, on the faces turned toward the viewer
const notches = [];
for (let a = 0; a < 360; a += 60) {
  const th = ((a + 20) * Math.PI) / 180;
  const f = M.onPot(th, 10);
  if (dot3(f.n, V) < 0.35) continue;
  notches.push(k.pathOf([[-4, -4], [4, -4], [4, 4], [-4, 4]].map(([u, v]) => at(M.inFrame(f, u, v, 0.05))), true));
}
const mouthRing = G.circleOf(potF, T, M.POT.mouth, P, 96);
const soilRing = G.circleOf(potF, M.SOIL_Z, M.SOIL_R, P, 96);
const crumbs = [];
for (let i = 0; i < 90; i++) {
  const a = i * 2.39996;
  const r = Math.sqrt((i + 0.5) / 90) * (M.SOIL_R - 3);
  crumbs.push(at([Math.cos(a) * r, Math.sin(a) * r, M.SOIL_Z]));
}
const inside = `<clipPath id="ph-mouth"><path d="${mouthRing}"/></clipPath><g clip-path="url(#ph-mouth)">` +
  `<path class="ph-wall" d="${mouthRing}"/><path class="ph-soil" d="${soilRing}"/><g data-wet></g>${D(crumbs, { size: 0.42, tone: "lo" })}<g data-sense></g></g>`;
put("pot", "pot", [0, 0, 56], `<g class="mat-clay">${S(G.lathe(M.POT_SIDE, potF, P, { hole: [T, M.POT.mouth] }), { tone: "mid", inner: ridges })}${L(notches.join(""), { tone: "lo" })}</g>` + inside, [A.lathe(potF, M.POT_SOLID)]);

// ---------------------------------------------------------------- the peace lily: petioles out of the soil, blades that arch and droop
M.LEAVES.forEach((spec, index) => {
  const leaf = M.leafOf(spec);
  const name = `leaf${index}`;
  const shapes = [];
  for (let i = 0; i < leaf.rows.length - 1; i++) {
    const a = leaf.rows[i];
    const b = leaf.rows[i + 1];
    const mid = mul3(add3(add3(a.mid, b.mid), add3(mul3(add3(a.left, a.right), 0.5), mul3(add3(b.left, b.right), 0.5))), 0.25);
    const along = unit3(sub3(b.mid, a.mid));
    const up = unit3(cross3(along, leaf.side));
    const w = Math.max(a.w, b.w);
    shapes.push(A.orientedBox(mid, [along, leaf.side, up], [G.len3(sub3(b.mid, a.mid)) / 2, Math.max(0.5, w * 0.92), Math.max(0.3, w * 0.14)], {}));
  }
  put("plant", `${name}.blade`, leaf.rows[Math.floor(leaf.rows.length / 2)].mid, `<g data-leaf="${index}">${M.leafSvgOf(k, G, P, leaf.rows)}</g>`, shapes);
  put("plant", `${name}.joint`, leaf.joint, mat("mat-leaf")(S(G.sphereOf(leaf.joint, M.JOINT, P), { tone: "mid" })), [A.ball(leaf.joint, M.JOINT)]);
  const stem = G.cut(leaf.petiole, 0, G.pathLength(leaf.petiole) - Math.sqrt(M.JOINT * M.JOINT - 1.6 * 1.6));
  tube("plant", `${name}.petiole`, stem, 1.6, { wrap: mat("mat-leaf"), limp: false, touch: ["pot", `${name}.joint`], maxLength: 20, bend: 0.1 });
});

// ---------------------------------------------------------------- the probe: a capacitive blade in the soil, its head taped, a JST plug on top
const [px, py] = M.PROBE_AT;
const across = [Math.sin((M.AZIMUTH * Math.PI) / 180), -Math.cos((M.AZIMUTH * Math.PI) / 180), 0];
const facing = [across[1] * -1, across[0], 0];
const probeF = G.frameOf([px, py, 0], [0, 0, 1], across, facing);
const [h0, h1] = M.PROBE.head;
block("plant", "probe.blade", probeF, rounded(-M.PROBE.wide / 2, M.PROBE.wide / 2, -M.PROBE.blade / 2, M.PROBE.blade / 2, 0.4, 1), M.SOIL_Z, h0, { wrap: ink });
const tw = M.PROBE.tape;
const tapeLines = [112.5, 119].map((z) => k.pathOf([-11.9, 11.9].map((u) => at(add3(add3([px, py, z], mul3(across, u)), mul3(facing, tw / 2 + 0.01))))));
block("plant", "probe.head", probeF, rounded(-12, 12, -tw / 2, tw / 2, 1.4, 3), h0, h1, { wrap: ink, inner: L(tapeLines.join(""), { tone: "faint" }) });
block("plant", "probe.jst", probeF, rounded(-4.2, 4.2, -2.6, 2.6, 0.4, 1), h1, h1 + 5.5, { wrap: mat("mat-cell"), after: D([-2, 0, 2].map((u) => at(add3([px, py, h1 + 5.5], mul3(across, u)))), { size: 0.4, tone: "mid" }) });

// ---------------------------------------------------------------- the breadboard against the pot, and what is plugged into it
const BF = M.BF;
const bF = G.frameOf(BF.o, BF.n, BF.t, BF.g); // a: out of the pot, u: round it, v: up it
const onB = (a, b, c) => M.inFrame(BF, a, b, c);
const bw = M.BOARD.wide / 2;
const bl = M.BOARD.len / 2;
const bt = M.BOARD.t;
const faceLine = (pts, c = bt + 0.01) => k.pathOf(pts.map(([a, b]) => at(onB(a, b, c))));
// holes: the two power rails each side and the ten columns, where the boards on top leave them showing
const holes = [];
const covered = (a, b) => (b > M.ESP.g0 - 1.2 && Math.abs(a) < M.ESP.wide / 2 + 1.2) || (b < M.RELAY.g1 + 1.2 && b > M.RELAY.g0 - 1.2 && a > M.RELAY.t0 - 1.2 && a < M.RELAY.t1 + 1.2);
for (let row = 0; row < 30; row++) {
  const b = -bl + 4.4 + row * 2.54;
  for (const a of [-13.97, -11.43, -8.89, -6.35, -3.81, 3.81, 6.35, 8.89, 11.43, 13.97]) if (!covered(a, b)) holes.push(at(onB(a, b, bt)));
}
for (let i = 0; i < 25; i++) {
  if (i % 5 === 4) continue;
  const b = -bl + 7 + i * 2.82;
  for (const a of [-23.4, -20.9, 20.9, 23.4]) if (!covered(a, b)) holes.push(at(onB(a, b, bt)));
}
const rails = [-25.6, -18.7, 18.7, 25.6].map((a) => faceLine([[a, -bl], [a, bl]])).join("");
const channel = [-1.3, 1.3].map((a) => faceLine([[a, -bl], [a, bl]])).join("");
put("board", "board", onB(0, 0, bt / 2), mat("mat-cell")(S(G.prismOf(bF, rounded(-bw, bw, -bl, bl, 1.2, 2), 0, bt, P), { tone: "mid", inner: L(channel, { tone: "faint" }) })) + L(rails, { tone: "faint" }) + D(holes, { size: 0.32, tone: "lo" }), [A.prism(bF, rounded(-bw, bw, -bl, bl, 1.2, 2), 0, bt, {})]);
const onBoard = (name, a0, a1, b0, b1, c0, c1, o = {}) => block("board", name, bF, rounded(a0, a1, b0, b1, o.r ?? 0.5, 2), c0, c1, o);

// the ESP32 DevKit: pin headers, the black board, the WROOM module with its antenna, USB, buttons, LEDs
const E = M.ESP;
const pcb0 = bt + E.lift;
const pcb1 = pcb0 + E.pcb;
for (const a of [-E.pins, E.pins]) onBoard("esp.header", a - 1.25, a + 1.25, E.g0 + 4, E.g1 - 6, bt, pcb0, { wrap: ink, r: 0.3 });
const pins = [];
for (let i = 0; i < 15; i++) for (const a of [-E.pins, E.pins]) pins.push(at(onB(a, E.g0 + 5.4 + i * 2.54, pcb1)));
onBoard("esp.pcb", -E.wide / 2, E.wide / 2, E.g0, E.g1, pcb0, pcb1, { wrap: ink, r: 1, after: D(pins, { size: 0.36, tone: "lo" }) });
const mod = { a0: -9, a1: 9, b0: E.g0 + 1.2, b1: E.g0 + 26.7 };
const antenna = [];
for (let i = 0; i < 4; i++) {
  const a = mod.a0 + 2.2 + i * 3.6;
  antenna.push(faceLine([[a, mod.b0 + 1.2], [a, mod.b0 + 5], [a + 1.8, mod.b0 + 5], [a + 1.8, mod.b0 + 1.2]], pcb1 + 0.81));
}
onBoard("esp.module", mod.a0, mod.a1, mod.b0, mod.b0 + 6.6, pcb1, pcb1 + 0.8, { wrap: ink, r: 0.3, after: L(antenna.join(""), { tone: "lo", free: true }) });
onBoard("esp.can", mod.a0 + 0.6, mod.a1 - 0.6, mod.b0 + 6.6, mod.b1, pcb1, pcb1 + 3.1, { wrap: mat("mat-cell"), r: 0.6,
  after: L([0.32, 0.5, 0.68].map((t) => faceLine([[mod.a0 + 3, mod.b0 + 6.6 + (mod.b1 - mod.b0 - 6.6) * t], [mod.a1 - (t === 0.5 ? 5 : 3), mod.b0 + 6.6 + (mod.b1 - mod.b0 - 6.6) * t]], pcb1 + 3.11)).join(""), { tone: "lo", free: true }) });
onBoard("esp.usb", -3.9, 3.9, E.g1 - 5.6, E.g1 + 1.2, pcb1, pcb1 + 2.6, { r: 0.4 });
for (const a of [-9, 9]) {
  onBoard("esp.button", a - 2.2, a + 2.2, E.g1 - 7.5, E.g1 - 2.5, pcb1, pcb1 + 1.6, { r: 0.4 });
  disc("board", "esp.cap", G.frameOf(onB(a, E.g1 - 5, pcb1 + 1.6), BF.n, BF.t, BF.g), 0, 0.8, 1.1, {}, { wrap: ink });
}
onBoard("esp.uart", -3, 3, E.g1 - 18, E.g1 - 12, pcb1, pcb1 + 1, { wrap: ink, r: 0.3 });
onBoard("esp.reg", 5, 10.5, E.g1 - 19, E.g1 - 15.6, pcb1, pcb1 + 1.6, { wrap: ink, r: 0.2 });
// the ESP32's power LED, lit while it runs
onBoard("esp.led", -9.6, -8, E.g0 + 30, E.g0 + 31.2, pcb1, pcb1 + 0.6, { wrap: mat("mat-cell"), r: 0.2, after: D([at(onB(-8.8, E.g0 + 30.6, pcb1 + 0.6))], { size: 0.55, tone: "hi" }) });

// the relay module: its board on a header, the relay, the screw terminal for the pump, two LEDs
const RL = M.RELAY;
const r0 = bt + RL.lift;
const r1 = r0 + RL.pcb;
onBoard("relay.header", RL.t0 + 1, RL.t0 + 3.6, -33.5, -20.5, bt, r0, { wrap: ink, r: 0.3 });
onBoard("relay.post", RL.t1 - 6, RL.t1 - 3, -28.5, -25.5, bt, r0, { wrap: mat("mat-cell"), r: 1.4 });
onBoard("relay.pcb", RL.t0, RL.t1, RL.g0, RL.g1, r0, r1, { wrap: ink, r: 1, after: D([[RL.t0 + 2.2, RL.g0 + 2.2], [RL.t0 + 2.2, RL.g1 - 2.2], [RL.t1 - 2.2, RL.g0 + 2.2], [RL.t1 - 2.2, RL.g1 - 2.2]].map(([a, b]) => at(onB(a, b, r1))), { size: 0.45, tone: "lo" }) });
const relayTop = r1 + 15;
const label = L([0.3, 0.45, 0.6].map((t) => faceLine([[-3, RL.g0 + 5.5 + 15.5 * t], [10 - (t === 0.45 ? 4 : 0), RL.g0 + 5.5 + 15.5 * t]], relayTop + 0.01)).join(""), { tone: "lo", free: true });
onBoard("relay.cube", -6, 13, RL.g0 + 5.5, RL.g0 + 21, r1, relayTop, { wrap: mat("mat-blue"), r: 0.6, after: label });
// the wire entries on the terminal's outer side
const entries = [0, 1, 2].map((i) => k.pathOf([[-1.4, 2.5], [1.4, 2.5], [1.4, 6], [-1.4, 6]].map(([b, c]) => at(onB(RL.t1 - 0.49, RL.g0 + 8 + i * 5 + b, r1 + c))), true));
const entryLines = L(entries.join(""), { tone: "lo" });
const termA = RL.t1 - 8.5;
onBoard("relay.terminal", termA, RL.t1 - 0.5, RL.g0 + 5.5, RL.g0 + 20.5, r1, r1 + 10, { wrap: mat("mat-blue"), r: 0.4,
  after: L([0, 1, 2].map((i) => k.pathOf([0, 1, 2, 3, 4].map((j) => at(onB(termA + 4 + Math.cos((j / 4) * Math.PI * 2) * 1.7, RL.g0 + 8 + i * 5 + Math.sin((j / 4) * Math.PI * 2) * 1.7, r1 + 10.01))), true)).join(""), { tone: "mid" }) +
    D([0, 1, 2].map((i) => at(onB(termA + 4, RL.g0 + 8 + i * 5, r1 + 10.01))), { size: 0.45, tone: "hi" }) + entryLines });
for (const [b, name] of [[RL.g1 - 6, "relay.power"], [RL.g1 - 10.5, "relay.state"]]) onBoard(name, RL.t0 + 6, RL.t0 + 8, b - 0.8, b + 0.8, r1, r1 + 0.9, { wrap: mat("mat-cell"), r: 0.3 });
onBoard("relay.transistor", RL.t0 + 11, RL.t0 + 15, RL.g0 + 4, RL.g0 + 8, r1, r1 + 3.4, { wrap: ink, r: 0.4 });
onBoard("relay.diode", RL.t0 + 11, RL.t0 + 16, RL.g0 + 12, RL.g0 + 14, r1, r1 + 1.6, { wrap: ink, r: 0.8 });

// ---------------------------------------------------------------- the pump: a small DC pump against the pot, its outlet away from it
const PF = M.PF;
const pumpF = G.frameOf(M.PUMP_AXIS, PF.g, PF.n, PF.t);
const pr = M.PUMP.r;
const ph = M.PUMP.h;
const PUMP_SIDE = [[0, 0], [0, pr - 1.6], [0.6, pr - 0.4, 1], [1.8, pr], [ph - 9, pr], [ph - 9, pr - 0.4], [ph - 1.6, pr - 0.4], [ph - 0.6, pr - 1.2, 1], [ph, pr - 2.4], [ph, 0]];
const pumpSeams = L(G.arcOf(pumpF, ph - 9, pr, P) + G.arcOf(pumpF, 6, pr, P), { tone: "faint" });
put("pump", "pump", G.pointOf(pumpF, ph / 2, 0, 0), `<g data-pump>${mat("mat-cell")(S(G.lathe(PUMP_SIDE, pumpF, P), { tone: "mid", inner: pumpSeams }))}</g>`, [A.lathe(pumpF, PUMP_SIDE)]);
// the inlet on top: a boss with slots round it and a hole in the middle
const inletF = G.frameOf(G.pointOf(pumpF, ph, 0, 0), PF.g, PF.n, PF.t);
const INLET = [[0, 0], [0, 6], [2.6, 6], [3.2, 5.4, 1], [3.6, 4.6], [3.6, 0]];
put("pump", "pump.inlet", G.pointOf(inletF, 1.8, 0, 0), mat("mat-cell")(S(G.lathe(INLET, inletF, P), { tone: "mid" })) + L(G.circleOf(inletF, 3.6, 2, P, 24) + G.circleOf(inletF, 3.6, 3.6, P, 32), { tone: "mid" }), [A.lathe(inletF, INLET)]);
// the outlet: a boss out of the pump's side, met along the body's curve; the tube is pushed onto it
const outO = tubeAt.origin;
const outDir = tubeAt.dir;
const bossF = G.frameAlong(outO, outDir);
const bossR = 5.1;
const bossH = M.OUTLET_FACE;
const pumpShape = R.solids.find((s) => s.name === "pump");
const bossStart = (angle) => {
  let lo = 0;
  let hi = bossH;
  for (let step = 0; step < 40; step++) {
    const mid = (lo + hi) / 2;
    if (A.sdf(pumpShape, G.pointOf(bossF, mid, bossR, angle)) < 0) lo = mid;
    else hi = mid;
  }
  return hi;
};
const bossLow = Math.min(...Array.from({ length: 48 }, (_, i) => bossStart((i / 48) * Math.PI * 2)));
put("pump", "pump.boss", add3(outO, mul3(outDir, bossH - M.SLEEVE / 2)), mat("mat-cell")(S(G.saddleOf(bossF, bossR, bossStart, bossH, P), { tone: "mid" })), [A.disc(bossF, bossLow - 0.05, bossH, bossR, { seated: true, cut: pumpShape })]);

// ---------------------------------------------------------------- the clear tube: off the boss, round its loop, over the rim, into the soil
const route = tubeAt.points.slice(1);
const routeLength = G.pathLength(route);
const tapeAt = [routeLength - 10, routeLength - 3.5];
const water = tube("tube", "tube", route, M.TUBE_R, { wrap: mat("mat-tube"), tone: "lo", touch: ["pump.boss", "pot", "tube.tape"], bend: 0.1, limp: false, gaps: [tapeAt], maxLength: 16, water: true });
// black tape round its end, where it goes into the soil
const tapeF = G.frameAlong(G.pointAlong(route, tapeAt[0]), G.tangentAlong(route, (tapeAt[0] + tapeAt[1]) / 2));
disc("tube", "tube.tape", tapeF, 0, tapeAt[1] - tapeAt[0], M.TUBE_R + 0.7, {}, { wrap: ink, inner: L(G.arcOf(tapeF, 3.2, M.TUBE_R + 0.7, P), { tone: "faint" }) });

// ---------------------------------------------------------------- the twisted pair that ties the board and the pump to the pot
const wrapZ = onB(0, M.WRAP_G, bt)[2];
const pumpS = (wrapZ - M.PUMP_AXIS[2]) / PF.g[2];
const pumpC = G.pointOf(pumpF, pumpS, 0, 0);
const rw = 1.05;
const pts = [];
for (let i = 0; i < 120; i++) {
  const a = (i / 120) * Math.PI * 2;
  pts.push([Math.cos(a) * M.potR(wrapZ), Math.sin(a) * M.potR(wrapZ)]);
}
for (let i = 0; i < 36; i++) {
  const a = (i / 36) * Math.PI * 2;
  pts.push([pumpC[0] + Math.cos(a) * pr, pumpC[1] + Math.sin(a) * pr]);
}
for (const a of [-bw, bw]) for (const c of [0, bt]) for (let i = 0; i < 8; i++) {
  const q = (i / 8) * Math.PI * 2;
  pts.push(onB(a - Math.sign(a) * 1.2 + Math.cos(q) * 1.2, M.WRAP_G, c - (c ? 1.2 : -1.2) + Math.sin(q) * 1.2).slice(0, 2));
}
const hull = G.hullOf(pts);
const loop = hull.map((p, i) => {
  const a = hull[(i - 1 + hull.length) % hull.length];
  const b = hull[(i + 1) % hull.length];
  const t = [b[0] - a[0], b[1] - a[1]];
  const l = Math.hypot(t[0], t[1]);
  let n = [t[1] / l, -t[0] / l];
  if (n[0] * p[0] + n[1] * p[1] < 0) n = [-n[0], -n[1]];
  return [p[0] + n[0] * rw, p[1] + n[1] * rw, wrapZ];
});
tube("wrap", "wrap", G.resample([...loop, loop[0]], 2).slice(0, -1), rw, { wrap: mat("mat-wire"), tone: "lo", touch: ["pot", "board", "pump"], closed: true, rings: { pitch: 2.6, twist: 1.2, tone: "lo", steps: 6 }, maxLength: 6 });

// ---------------------------------------------------------------- leads: the probe's to the ESP32, the pump's to the relay, jumpers, USB
const shell = (name, a, b, len = 9) => onBoard(name, a - 1.3, a + 1.3, b - 1.3, b + 1.3, bt, bt + len, { wrap: ink, r: 0.3 });
/** A boot on a shell's end face: a ball the lead leaves from at any angle. Returns where a lead of radius r ends on it. */
const boot = (name, a, b, c, R0, r, from) => {
  const centre = onB(a, b, c + R0 - 0.45);
  put("board", name, centre, ink(S(G.sphereOf(centre, R0, P), { tone: "mid" })), [A.ball(centre, R0)]);
  return add3(centre, mul3(unit3(sub3(from, centre)), Math.sqrt(R0 * R0 - r * r)));
};
// the probe's lead, a twisted pair like the tie, from the JST plug over the rim to the board's left rail
const probeTop = [px, py, h1 + 5.5];
shell("probe.shell", 20.9, 32);
const leadVia = add3(onB(20.9, 32, bt + 9), add3(mul3(BF.n, 2.5), add3(mul3(BF.g, 2), mul3(BF.t, 3.5))));
const leadIn = boot("probe.boot", 20.9, 32, bt + 9, 1.7, 1.05, leadVia);
const rimAt = (deg, z, out = 0) => [Math.cos((deg * Math.PI) / 180) * (M.POT.lip + out), Math.sin((deg * Math.PI) / 180) * (M.POT.lip + out), z];
const rightward = [across[0], across[1], 0];
tube("lead", "lead.probe", [probeTop, add3(probeTop, [0, 0, 6]), add3(add3(probeTop, [0, 0, 14]), mul3(rightward, -7)), rimAt(76, 126, 1), rimAt(73, 112, 8), rimAt(70, 98, 9), onB(31, 36, 11), leadVia, leadIn], 1.05, { wrap: mat("mat-wire"), tone: "lo", touch: ["probe.jst", "probe.boot"], bend: 12, rings: { pitch: 2.6, twist: 1.2, tone: "lo", steps: 6 } });
// three jumpers from beside the ESP32 to the relay's pins (VCC, GND, IN), on female shells with boots:
// nested arches, the top shell to the bottom pin over the others, so no two cross
const pinsG = [-31, -26.5, -22];
[2.2, -0.4, -3].forEach((b, i) => {
  shell("jumper.shell", -16.4, b, 7);
  const g1 = pinsG[i];
  onBoard("relay.pin", RL.t0 + 1.1, RL.t0 + 3.7, g1 - 1.3, g1 + 1.3, r1, r1 + 8, { wrap: ink, r: 0.3 });
  const a0 = bt + 7;
  const a1 = r1 + 8;
  const high = 15 - i * 3.6;
  const arch = (u) => onB(-16.4 + (RL.t0 + 2.4 + 16.4) * u, b + (g1 - b) * u, a0 + 1.2 + (a1 - a0) * u + high * Math.pow(Math.sin(Math.PI * u), 1.4));
  const way = Array.from({ length: 15 }, (_, j) => arch(0.05 + (0.9 * j) / 14));
  const start = boot("jumper.boot", -16.4, b, a0, 1.2, 0.7, way[0]);
  const end = boot("jumper.boot", RL.t0 + 2.4, g1, a1, 1.2, 0.7, way[way.length - 1]);
  tube("lead", "jumper", [start, ...way, end], 0.7, { tone: "mid", touch: ["jumper.boot*"], bend: 0.1 });
});
// the pump's lead: off the pump's foot, round the pot low down, out to the relay's terminal
const pumpFoot = G.pointOf(pumpF, 0, 0, 0);
const termIn = onB(RL.t1 - 0.5, RL.g0 + 13, r1 + 4.3);
const lowZ = 16;
const round = [];
for (let d = 128; d >= 84; d -= 4) round.push(rimAt(d, lowZ, M.potR(lowZ) - M.POT.lip + 1.25));
tube("lead", "lead.pump", [pumpFoot, add3(pumpFoot, mul3(PF.g, -7)), ...round, rimAt(72, lowZ + 4, M.potR(lowZ) - M.POT.lip + 12), add3(termIn, mul3(BF.t, 12)), add3(termIn, mul3(BF.t, 3)), termIn], 1.2, { tone: "mid", touch: ["pump", "pot", "relay.terminal"], bend: 7 });
// the USB lead from the ESP32 up, over and down to the power bank
const bezier = (a, b, c, d, n) => Array.from({ length: n + 1 }, (_, i) => {
  const t = i / n;
  const w = [(1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t * t, t ** 3];
  return [0, 1, 2].map((j) => w[0] * a[j] + w[1] * b[j] + w[2] * c[j] + w[3] * d[j]);
});
const usbF = G.frameOf(onB(0, E.g1 + 1.2, pcb1 + 1.3), BF.g, BF.t, BF.n);
block("board", "esp.plug", usbF, rounded(-5.5, 5.5, -3.2, 3.2, 1.2, 2), 0, 11, { wrap: ink });
const plugTop = add3(usbF.o, mul3(BF.g, 11));
tube("lead", "lead.usb", [plugTop, add3(plugTop, mul3(BF.g, 8)), add3(plugTop, add3(mul3(BF.g, 17), mul3(BF.t, -9))), add3(plugTop, add3(add3(mul3(BF.g, 13), mul3(BF.t, -24)), mul3(BF.n, 12))), ...bezier([90, -10, 70], [100, -40, 52], [plug.x - 50, plug.y + 6, 8], [plug.x - 8, plug.y + 6, 8], 18), [plug.x, plug.y + 6, 8]], 1.6, { tone: "mid", touch: ["esp.plug", "bank.plug"], bend: 18 });

// ---------------------------------------------------------------- assemble
const benchSvg = B.bench(M.PLATE, { label: "PHULBARI", labelAt: [M.PLATE.x + 18, M.PLATE.y + M.PLATE.d - 30], ruler: false });
const { out, audit } = finish(B, P, ["bench", "pot", "plant", "tube", "pump", "wrap", "board", "lead"]);
const ordered = [...R.items].sort((a, b) => a.key - b.key).map((i) => i.svg).join("");
void out;
const LABEL = "Phulbari's pot on a bench: a terracotta pot with a peace lily, a capacitive soil-moisture probe standing in the soil, and against the pot a breadboard carrying an ESP32 board and a relay module, tied on with a twisted pair. Beside it a small white pump whose clear tube loops over the rim into the soil, and on the bench the power bank the ESP32 runs from. When the probe reads the soil as dry, the relay closes, the pump runs and water flows down the tube into the pot.";
const svg = k.figureSvg({
  width: M.W,
  height: M.H,
  label: LABEL,
  className: "rv-figure",
  body: [benchSvg, `<g data-scene>${ordered}</g>`, `<g data-led></g><g data-wifi></g>`],
});
// what the page needs to run it: the tube's length and where it ends, the probe, the relay's LED and the antenna
const flow = { total: water.total, end: route[route.length - 1] };
const live = { flow, probe: [px, py], led: onB(RL.t0 + 7, RL.g1 - 10.5, r1 + 0.9), antenna: { o: onB(0, mod.b0 + 3.3, pcb1 + 0.8), t: BF.t, g: BF.g } };
await writeFigure({ name: "phulbari", svg, data: { P, wheels: [], ...live }, model: "phulbari.mjs", mount: "mountPhulbari", fig: "Fig 7", title: "Phulbari", hint: "click to dry the soil", readout: "soil 46% · moist" });
audit();
