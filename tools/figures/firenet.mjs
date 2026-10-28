// Builds Fig 8, the fire & smoke network: node tools/figures/firenet.mjs [--audit]
import * as k from "../../src/figures/kit/iso-kit.mjs";
import * as G from "../../src/figures/kit/lathe.mjs";
import * as A from "../../src/figures/kit/audit.mjs";
import { tubePieces, tubeSvg } from "../../src/figures/kit/tube.mjs";
import * as M from "../../src/figures/rovers/firenet.mjs";
import { makeBuilder, finish, writeFigure } from "./rover-lib.mjs";

const { BT, ROW, COL, RAIL } = M;
const { add3, sub3, mul3, unit3, cross3, lerp3 } = G;

// ---------------------------------------------------------------- the lighter in the helping hand: where it hangs
// its axis runs from the nozzle end (over the MQ-2's cap) up and back to its foot; its wide faces look along x
const capX = M.NODE_X + ROW(M.MQ.row0 + 1.5);
const capB = COL.c - 1.3 + 19; // the cap sits 19 mm along the module from its pin end
const capTop = BT + M.MQ.lift + M.MQ.pcb + 2.8 + 1.4 + 8.2;
const LA = unit3([0, -0.84, 0.54]); // up the lighter, from its head to its foot
const LX = [1, 0, 0];
const LN = cross3(LA, LX); // out of its front face (the lever's side)
const LIGHTER = { len: 60, wide: 22, thick: 11.5 };
const nozzle = [capX, capB - 5, capTop + 15];
const head = add3(nozzle, mul3(LA, 0.6)); // the nozzle stands just out of the head's end
const foot = add3(head, mul3(LA, LIGHTER.len));
const grip = add3(head, mul3(LA, LIGHTER.len * 0.58)); // where the clip bites
const [hx, hy] = M.HAND.base;
const ball = [hx, hy, M.HAND.post + 4.2 - 0.4];

const P = k.fitProjection([...k.boxCorners(M.PLATE, -15, 0), foot, add3(foot, mul3(LN, 8)), add3(ball, [0, 0, 6]), [M.OLED.x, M.OLED.y, M.OLED.z0 + M.OLED.h + 2]], M.W, M.H, { pad: 22, azimuth: M.AZIMUTH });
const B = makeBuilder(P);
const { slab, cyl, disc, put, at, S, L, D, ink } = B;
const R = B.R;
const lift = 0.8 / B.KS - 0.4; // end dots far enough out of their mounts not to sink in at this scale
const mat = (cls) => (s) => `<g class="${cls}">${s}</g>`;
const box = (x0, x1, y0, y1, r = 0.3) => ({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r });
const rounded = (x0, x1, y0, y1, r, n = 3) => {
  const out = [];
  const cx = [x1 - r, x0 + r, x0 + r, x1 - r];
  const cy = [y1 - r, y1 - r, y0 + r, y0 + r];
  for (let c = 0; c < 4; c++) for (let i = 0; i <= n; i++) {
    const a = (c * Math.PI) / 2 + (i / n) * (Math.PI / 2);
    out.push([cx[c] + Math.cos(a) * r, cy[c] + Math.sin(a) * r]);
  }
  return out;
};
/** A block extruded along `F.a` from s0 to s1, its outline a polygon in (u, v). */
function block(layer, name, F, poly, s0, s1, { wrap = (s) => s, tone = "mid", inner = "", after = "", bias = 0 } = {}) {
  const c = poly.reduce((acc, [x, y]) => [acc[0] + x / poly.length, acc[1] + y / poly.length], [0, 0]);
  const centre = add3(add3(add3(F.o, mul3(F.a, (s0 + s1) / 2)), mul3(F.u, c[0])), mul3(F.v, c[1]));
  return put(layer, name, centre, wrap(S(G.prismOf(F, poly, s0, s1, P), { tone, inner })) + after, [A.prism(F, poly, s0, s1, {})], { bias });
}
/** A tube in chunks, recorded for the audit, with terminal dots at the ends it lands on. */
function tube(layer, name, points, r, { wrap = (s) => s, tone = "mid", touch, bend, dots = [true, true], limp = true, rings = null, maxLength = 14 } = {}) {
  const route = G.fillet(points, bend ?? Math.max(3, r * 2.6), 8, { P, tube: r });
  const id = R.nameFor(name);
  R.route(id, route, r, { owner: id, touch, limp, piece: layer });
  tubePieces(route, r, P, { maxLength, spacing: 1, rings }).forEach((part, index) =>
    put(layer, `${id}:${index}`, part.mid, wrap(tubeSvg(part, { tone })), [A.tube(part.points, part.radii)], { route: id, chunk: index, record: false }),
  );
  const back = (tip, from) => add3(tip, mul3(unit3(sub3(from, tip)), lift));
  if (dots[0]) B.dotAt(layer, `${id}.end`, back(route[0], route[1]), { owner: id });
  if (dots[1]) B.dotAt(layer, `${id}.end`, back(route[route.length - 1], route[route.length - 2]), { owner: id });
  return route;
}
const faceY = (y, pts) => k.pathOf(pts.map(([x, z]) => at([x, y, z])), true);
const faceX = (x, pts) => k.pathOf(pts.map(([y, z]) => at([x, y, z])), true);
const sq = (a0, a1, b0, b1) => [[a0, b0], [a1, b0], [a1, b1], [a0, b1]];

// ---------------------------------------------------------------- a 400-tie breadboard: the ten columns, a pair of rails at each edge
function breadboard(name, x0, { glow = false } = {}) {
  const plan = { x: x0, y: -M.BB.wide / 2, w: M.BB.len, d: M.BB.wide, r: 1.4 };
  const top = (pts) => L(k.pathOf(pts.map(([a, b]) => at([x0 + a, b, BT]))), { tone: "faint" });
  const holes = [];
  for (let r = 1; r <= 30; r++) for (const c of Object.values(COL)) holes.push(at([x0 + ROW(r), c, BT]));
  for (const a of M.railHoles()) for (const b of [-RAIL.out, -RAIL.in, RAIL.in, RAIL.out]) holes.push(at([x0 + a, b, BT]));
  // the channel down the middle, and the stripes beside each pair of rails
  const lines = [-1.3, 1.3, -25.6, -18.7, 18.7, 25.6].map((b) => top([[0, b], [M.BB.len, b]])).join("");
  const ticks = [];
  for (let r = 5; r <= 30; r += 5) ticks.push(k.pathOf([[x0 + ROW(r), -16.3, BT], [x0 + ROW(r), -15.3, BT]].map(at)), k.pathOf([[x0 + ROW(r), 15.3, BT], [x0 + ROW(r), 16.3, BT]].map(at)));
  slab("board", name, plan, 0, BT, {}, { steps: 2, bevel: 0.4, wrap: mat("mat-cell"), inner: L(k.sideSeam(plan, 2.2, P, 2), { tone: "faint" }),
    after: lines + L(ticks.join(""), { tone: "lo" }) + D(holes, { size: 0.3, tone: "lo" }) + (glow ? `<g data-glow></g>` : "") });
  return plan;
}

/** A solid-core staple: out of one hole, along just over the board, into another. */
function staple(name, from, to, { r = 0.38, h = 1.9, tone = "mid", wrap, board, by = 1.4 } = {}) {
  const d = unit3([to[0] - from[0], to[1] - from[1], 0]);
  // its top leans a little toward -x, out of the plane that faces the camera edge-on
  const side = d[1] > 0 ? 1 : -1;
  const lean = [-d[1] * by * side, d[0] * by * side, 0];
  return tube("lead", name, [from, add3(from, [0, 0, 1.4]), add3(add3(from, [d[0] * 1.5, d[1] * 1.5, h]), lean), add3(add3(to, [-d[0] * 1.5, -d[1] * 1.5, h]), lean), add3(to, [0, 0, 1.4]), to], r, { tone, wrap, touch: [board], bend: 2.2, maxLength: 10 });
}

/** A Dupont jumper: a black shell standing in each hole, a boot on each, and the lead arched between them. */
function jumper(name, from, to, { high, shell = 7, r = 0.6, tone = "mid", wrap, side = [0, 0, 0], power = 0.8 }) {
  // power under 1 makes the arch rise steeply off its shells and fall steeply onto them
  const ends = [from, to].map((p, i) => {
    slab("lead", `${name}.shell`, box(p[0] - 1.15, p[0] + 1.15, p[1] - 1.15, p[1] + 1.15), BT, shell, {}, { steps: 1, wrap: ink });
    const c = [p[0], p[1], BT + shell + 1.1 - 0.45];
    put("lead", `${name}.boot`, c, ink(S(G.sphereOf(c, 1.1, P), { tone: "mid" })), [A.ball(c, 1.1)]);
    return { c, i };
  });
  const a = ends[0].c;
  const b = ends[1].c;
  const way = Array.from({ length: 17 }, (_, j) => {
    const u = 0.04 + (0.92 * j) / 16;
    const bump = Math.pow(Math.sin(Math.PI * u), power);
    return add3(add3(lerp3(a, b, u), [0, 0, 1.5 + high * bump]), mul3(side, bump));
  });
  const out = (c, toward) => add3(c, mul3(unit3(sub3(toward, c)), Math.sqrt(1.1 * 1.1 - r * r)));
  tube("lead", name, [out(a, way[0]), ...way, out(b, way[way.length - 1])], r, { tone, wrap, touch: [`${name}.boot*`], bend: 0.1, dots: [false, false] });
}

// ================================================================ the bench
const benchSvg = B.bench(M.PLATE, { label: "FIREDETECTOR", labelAt: [M.NODE_X + 4, 34], ruler: false });

// ================================================================ the node
const NX = M.NODE_X;
const nodeBoard = breadboard("board.node", NX);
const nh = (row, b) => M.holeOf(NX, row, b);

// ---------------------------------------------------------------- the ESP32-C3 Super Mini, straddling the channel at the +x end
{
  const C = M.C3;
  const x0 = NX + ROW(C.row0) - 2.9;
  const x1 = x0 + C.len;
  const yc = (C.back + C.front) / 2;
  const y0 = yc - C.wide / 2;
  const y1 = yc + C.wide / 2;
  const z0 = BT + C.lift;
  const z1 = z0 + C.pcb;
  for (const b of [C.back, C.front]) slab("node", "c3.header", box(NX + ROW(C.row0) - 1.27, NX + ROW(C.row0 + 7) + 1.27, b - 1.25, b + 1.25), BT, C.lift, {}, { steps: 1, wrap: ink });
  // castellated pads on both edges, each a half-hole with a ring of gold round it
  const pads = [];
  const rings = [];
  for (let i = 0; i < 8; i++) for (const b of [C.back, C.front]) {
    const x = NX + ROW(C.row0 + i);
    pads.push(at([x, b, z1]));
    rings.push(k.ring(x, b, 0.8, z1, P, 14));
  }
  slab("node", "c3.pcb", box(x0, x1, y0, y1, 0.8), z0, C.pcb, {}, { steps: 2, bevel: 0.2, wrap: ink, after: L(rings.join(""), { tone: "lo" }) + D(pads, { size: 0.32, tone: "lo" }) });
  // the USB-C socket at the -x end, its mouth toward the board's middle
  const usb = box(x0 - 1, x0 + 7.4, yc - 4.5, yc + 4.5, 1.2);
  slab("node", "c3.usb", usb, z1, 3.2, {}, { steps: 3, bevel: 0.3, wrap: mat("mat-cell"), after: L(faceX(usb.x - 0.01, [[yc - 3.3, z1 + 0.9], [yc + 3.3, z1 + 0.9], [yc + 3.3, z1 + 2.3], [yc - 3.3, z1 + 2.3]]), { tone: "lo" }) });
  // BOOT and RST, the chip, its crystal, the regulator, the power LED, and the chip antenna at the far end
  for (const b of [yc - 4.6, yc + 4.6]) {
    slab("node", "c3.button", box(x0 + 9.2, x0 + 12.6, b - 1.9, b + 1.9), z1, 1.4, {}, { steps: 1, wrap: mat("mat-cell") });
    cyl("node", "c3.button.cap", x0 + 10.9, b, 0.9, z1 + 1.4, 0.5, {}, { steps: 14, wrap: ink });
  }
  slab("node", "c3.chip", box(x0 + 13.4, x0 + 18.4, yc - 2.5, yc + 2.5), z1, 0.9, {}, { steps: 1, wrap: ink, after: D([at([x0 + 14.1, yc - 1.8, z1 + 0.9])], { size: 0.3, tone: "lo" }) });
  slab("node", "c3.crystal", box(x0 + 13.8, x0 + 16.4, yc + 4.4, yc + 7.6), z1, 0.8, {}, { steps: 1, wrap: mat("mat-cell") });
  slab("node", "c3.reg", box(x0 + 9.6, x0 + 11.2, yc - 0.9, yc + 0.9), z1, 0.9, {}, { steps: 1, wrap: ink });
  slab("node", "c3.led", box(x0 + 7.9, x0 + 8.7, yc + 6.4, yc + 7.4), z1, 0.5, {}, { steps: 1, wrap: mat("mat-cell") });
  slab("node", "c3.antenna", box(x1 - 3, x1 - 0.6, yc - 5.6, yc + 1.4, 0.2), z1, 1.1, {}, { steps: 1, wrap: mat("mat-clay") });
}

// ---------------------------------------------------------------- the MQ-2 module: a blue board on its header, the sensor's steel cap at its far end
{
  const Q = M.MQ;
  const x0 = capX - Q.wide / 2;
  const x1 = capX + Q.wide / 2;
  const y0 = COL.c - 1.3;
  const y1 = y0 + Q.len;
  const z0 = BT + Q.lift;
  const z1 = z0 + Q.pcb;
  slab("node", "mq.header", box(NX + ROW(Q.row0) - 1.27, NX + ROW(Q.row0 + 3) + 1.27, COL.c - 1.25, COL.c + 1.25), BT, Q.lift, {}, { steps: 1, wrap: ink });
  // a nylon standoff under the far end, on the strip between the columns and the rails
  cyl("node", "mq.post", capX, y1 - 3, 1.6, BT, Q.lift, {}, { steps: 16, wrap: mat("mat-cell") });
  const holes = [[x0 + 3, y0 + 3], [x1 - 3, y0 + 3], [x0 + 3, y1 - 3], [x1 - 3, y1 - 3]];
  const pins = [0, 1, 2, 3].map((i) => at([NX + ROW(Q.row0 + i), COL.c, z1]));
  // the silkscreen: a frame round the sensor and printed text beside the pins
  const print = [0, 1].map((i) => k.pathOf([[x0 + 5 + i * 3, y0 + 7], [x0 + 5 + i * 3, y0 + 17]].map(([x, y]) => at([x, y, z1])))).join("");
  slab("node", "mq.pcb", box(x0, x1, y0, y1, 1), z0, Q.pcb, {}, { steps: 2, bevel: 0.3, wrap: mat("mat-blue"),
    after: L(holes.map(([x, y]) => k.ring(x, y, 1.6, z1, P, 20)).join(""), { tone: "lo" }) + D(pins, { size: 0.42, tone: "mid" }) + L(print, { tone: "lo", free: true }) + L(k.ring(capX, capB, 11.2, z1, P, 48), { tone: "faint" }) });
  // two status LEDs and their resistors by the header
  for (const [x, name] of [[x1 - 4.4, "mq.led.power"], [x1 - 7.6, "mq.led.do"]]) slab("node", name, box(x - 0.6, x + 0.6, y0 + 5.2, y0 + 6.8), z1, 0.6, {}, { steps: 1, wrap: mat("mat-cell") });
  for (const x of [x1 - 4.4, x1 - 7.6]) slab("node", "mq.res", box(x - 0.5, x + 0.5, y0 + 8.4, y0 + 10.4), z1, 0.5, {}, { steps: 1, wrap: ink });
  // the sensor: a bakelite base, a steel collar and the mesh cap, the sense ring drawn on its top
  cyl("node", "mq.base", capX, capB, 10, z1, 2.8, {}, { steps: 48, wrap: ink, inner: L(k.sideArc(capX, capB, 10, z1 + 1.4, P, 32), { tone: "faint" }) });
  cyl("node", "mq.collar", capX, capB, 9.6, z1 + 2.8, 1.4, {}, { steps: 48, wrap: mat("mat-cell") });
  const capF = G.frameOf([capX, capB, z1 + 4.2], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const CAP = [[0, 0], [0, 9], [6.6, 9, 1], [7.6, 8.7, 1], [8.1, 8.1, 1], [8.2, 7.4], [8.2, 0]];
  const mesh = [];
  for (let d = -6.4; d <= 6.4; d += 1.6) {
    const h = Math.sqrt(Math.max(0, 7.2 * 7.2 - d * d));
    mesh.push(k.lineOnTop([capX - h, capB + d], [capX + h, capB + d], capTop, P), k.lineOnTop([capX + d, capB - h], [capX + d, capB + h], capTop, P));
  }
  const ribs = G.ribsOf(capF, 0.6, 6.4, 9, 40, P, { seams: true });
  put("node", "mq.cap", [capX, capB, z1 + 8], mat("mat-cell")(S(G.lathe(CAP, capF, P), { tone: "mid", inner: L(ribs, { tone: "faint" }) })) +
    L(mesh.join("") + k.ring(capX, capB, 7.2, capTop, P, 48), { tone: "lo" }) + `<g data-sense></g>`, [A.lathe(capF, CAP)]);
}

// ---------------------------------------------------------------- the buzzer module: a black active buzzer on a small blue board
const bzNode = { x: M.NODE_X + ROW(M.BZ_NODE.row0 + 1), y: COL.c - 1.3 + 9.6 };
{
  const Z = M.BZ_NODE;
  const x0 = bzNode.x - Z.wide / 2;
  const x1 = bzNode.x + Z.wide / 2;
  const y0 = COL.c - 1.3;
  const y1 = y0 + Z.len;
  const z0 = BT + Z.lift;
  const z1 = z0 + Z.pcb;
  slab("node", "bz.header", box(NX + ROW(Z.row0) - 1.27, NX + ROW(Z.row0 + 2) + 1.27, COL.c - 1.25, COL.c + 1.25), BT, Z.lift, {}, { steps: 1, wrap: ink });
  cyl("node", "bz.post", bzNode.x, y1 - 2.4, 1.4, BT, Z.lift, {}, { steps: 16, wrap: mat("mat-cell") });
  const pins = [0, 1, 2].map((i) => at([NX + ROW(Z.row0 + i), COL.c, z1]));
  slab("node", "bz.pcb", box(x0, x1, y0, y1, 0.8), z0, Z.pcb, {}, { steps: 2, bevel: 0.3, wrap: mat("mat-blue"), after: D(pins, { size: 0.42, tone: "mid" }) + L(k.ring(x0 + 2.4, y1 - 2.4, 1.2, z1, P, 16), { tone: "lo" }) });
  const top = z1 + Z.h;
  cyl("node", "bz.can", bzNode.x, bzNode.y, Z.r, z1, Z.h, {}, { steps: 40, wrap: ink, inner: L(k.sideArc(bzNode.x, bzNode.y, Z.r, z1 + 1.8, P, 28), { tone: "faint" }),
    after: L(k.ring(bzNode.x, bzNode.y, 1.3, top, P, 20) + k.ring(bzNode.x, bzNode.y, 4.4, top, P, 36), { tone: "lo" }) + D([at([bzNode.x, bzNode.y, top])], { size: 0.5, tone: "mid" }) });
  bzNode.top = top;
}

// ---------------------------------------------------------------- the DHT11 module, upright, its blue grille toward you
{
  const T = M.DHT;
  const xc = NX + ROW(T.row0 + 1);
  const x0 = xc - T.wide / 2;
  const x1 = xc + T.wide / 2;
  const yb = COL.c - T.pcb / 2;
  const yf = COL.c + T.pcb / 2;
  const z0 = BT + 2.5;
  slab("node", "dht.header", box(NX + ROW(T.row0) - 1.27, NX + ROW(T.row0 + 2) + 1.27, COL.c - 1.25, COL.c + 1.25), BT, 2.5, {}, { steps: 1, wrap: ink });
  slab("node", "dht.pcb", box(x0, x1, yb, yf, 0.2), z0, T.tall, {}, { steps: 1, wrap: mat("mat-blue"), after: D([[x0 + 2, z0 + T.tall - 2.2], [x1 - 2, z0 + T.tall - 2.2]].map(([x, z]) => at([x, yf, z])), { size: 0.45, tone: "lo" }) });
  // the sensor's housing: a blue box with its grille of slots, three legs into the board behind it
  const bw = T.body.w / 2;
  const by1 = yf + T.body.d;
  const bz0 = z0 + 3.5;
  const bz1 = bz0 + T.body.h;
  const slots = [];
  for (let c = 0; c < 4; c++) for (let r = 0; r < 5; r++) {
    const sx = xc - bw + 1.6 + c * 2.35;
    const sz = bz1 - 2 - r * 2.6;
    slots.push(faceY(by1 + 0.01, [[sx, sz], [sx + 1.4, sz], [sx + 1.4, sz - 1.7], [sx, sz - 1.7]]));
  }
  slab("node", "dht.body", box(xc - bw, xc + bw, yf, by1, 0.6), bz0, T.body.h, {}, { steps: 2, bevel: 0.3, wrap: mat("mat-blue"), after: L(slots.join(""), { tone: "lo" }) });
  slab("node", "dht.res", box(xc - 2, xc + 2, yf, yf + 0.6), z0 + 0.9, 1.4, {}, { steps: 1, wrap: ink });
}

// ---------------------------------------------------------------- the 18650 in its holder, left of the board, both leads out of its back end
const cellEnd = {};
{
  const C = M.CELL;
  const plan = { x: C.x, y: C.y, w: C.w, d: C.d, r: 1.6 };
  slab("node", "cell.tray", plan, 0, 1.8, {}, { steps: 2, bevel: 0.3, wrap: ink });
  for (const [y0, y1] of [[C.y, C.y + 2.2], [C.y + C.d - 2.2, C.y + C.d]]) slab("node", "cell.clip", box(C.x, C.x + C.w, y0, y1, 0.5), 1.8, C.h - 1.8, {}, { steps: 1, wrap: ink });
  for (const x of [C.x, C.x + C.w - 1.6]) slab("node", "cell.wall", box(x, x + 1.6, C.y + 2.2, C.y + C.d - 2.2, 0.3), 1.8, 7.4, {}, { steps: 1, wrap: ink });
  const cx = C.x + C.w / 2;
  const F = G.frameOf([cx, C.y + 4.2, 1.8 + 9.3], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const CELL = [[0, 0], [0, 8.6], [0.6, 9.2, 1], [64.4, 9.2, 1], [65, 8.6], [65, 0]];
  put("node", "cell", G.pointOf(F, 32.5, 0, 0), mat("mat-blue")(S(G.lathe(CELL, F, P), { tone: "mid", inner: L(G.arcOf(F, 58, 9.2, P) + G.arcOf(F, 5, 9.2, P), { tone: "faint" }) })), [A.lathe(F, CELL)]);
  // the + nub against the front clip, a spring at the back one
  const nubF = G.frameOf(G.pointOf(F, 65, 0, 0), [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  disc("node", "cell.nub", nubF, 0, 1.2, 3.4, {}, { wrap: mat("mat-cell") });
  cellEnd.plus = [cx + 4, C.y, 7];
  cellEnd.minus = [cx - 4, C.y, 7];
  for (const [name, p] of [["cell.lug", cellEnd.plus], ["cell.lug", cellEnd.minus]]) slab("node", name, box(p[0] - 1.2, p[0] + 1.2, C.y - 1.2, C.y), 4.6, 4.8, {}, { steps: 1, wrap: mat("mat-cell") });
}

// ---------------------------------------------------------------- the helping hand behind the board, and the lighter it holds over the MQ-2
const lever = {};
{
  const H = M.HAND;
  cyl("rig", "hand.base", hx, hy, H.baseR, 0, 6, {}, { steps: 64, bevel: 0.8, wrap: ink, inner: L(k.sideArc(hx, hy, H.baseR, 3, P, 48), { tone: "faint" }), after: L(k.ring(hx, hy, H.baseR - 3, 6, P, 56), { tone: "lo" }) + D([at([hx, hy, 6])], { size: 0.5 }) });
  cyl("rig", "hand.boss", hx, hy, 4.4, 6, 4, {}, { steps: 32, wrap: ink });
  cyl("rig", "hand.post", hx, hy, 2.2, 10, H.post - 10, {}, { steps: 24, wrap: mat("mat-cell") });
  put("rig", "hand.ball", ball, mat("mat-cell")(S(G.sphereOf(ball, 4.2, P), { tone: "mid" })), [A.ball(ball, 4.2)]);
  // the arm out of the ball to the clip's barrel, beside the lighter's back face
  const barrel = add3(grip, mul3(LN, -(LIGHTER.thick / 2 + 3.6 + 2.6 - 0.3)));
  const armDir = unit3(sub3(barrel, ball));
  const armF = G.frameAlong(ball, armDir);
  const armLen = G.len3(sub3(barrel, ball));
  disc("rig", "hand.arm", armF, 3.9, armLen - 3.1, 1.6, {}, { wrap: mat("mat-cell") });
  const barF = G.frameOf(barrel, LX, LA, LN);
  disc("rig", "hand.barrel", barF, -4, 4, 2.6, {}, { wrap: mat("mat-cell"), inner: L(G.arcOf(barF, -2, 2.6, P) + G.arcOf(barF, 2, 2.6, P), { tone: "faint" }) });
  // the clip's two jaws, closed on the lighter's faces
  const jawF = G.frameOf(grip, LN, LX, LA);
  const t2 = LIGHTER.thick / 2;
  block("rig", "hand.jaw", jawF, rounded(-7, 7, -3, 3, 0.8), -t2 - 3.6, -t2, { wrap: mat("mat-cell") });
  block("rig", "hand.jaw", jawF, rounded(-7, 7, -3, 3, 0.8), t2, t2 + 1.6, { wrap: mat("mat-cell") });
  // the lighter: body, steel hood at its head, the wheel and the gas lever
  const bodyF = G.frameOf(head, LA, LX, LN);
  const w2 = LIGHTER.wide / 2;
  block("rig", "lighter.body", bodyF, rounded(-w2, w2, -t2, t2, 3.2, 4), 7, LIGHTER.len, { wrap: mat("mat-yellow") });
  block("rig", "lighter.hood", bodyF, rounded(-w2 + 0.4, w2 - 0.4, -t2 + 0.4, t2 - 0.4, 2.6, 3), 0, 7, { wrap: mat("mat-cell"),
    after: D([-6, -2, 2, 6].map((u) => at(add3(add3(head, mul3(LA, 3.5)), add3(mul3(LX, u), mul3(LN, t2 - 0.39))))), { size: 0.55, tone: "lo" }) });
  const wheelF = G.frameOf(add3(head, add3(mul3(LA, -2.9), mul3(LN, -2))), LX, LA, LN);
  disc("rig", "lighter.wheel", wheelF, -3.4, 3.4, 3.2, {}, { wrap: mat("mat-dark"), inner: L(G.ribsOf(wheelF, -3.4, 3.4, 3.2, 24, P), { tone: "lo" }) });
  disc("rig", "lighter.nozzle", G.frameOf(add3(head, mul3(LN, 2.6)), mul3(LA, -1), LX, LN), 0, 1.4, 1.1, {}, { wrap: mat("mat-cell") });
  // the lever presses toward the body; the page moves it
  lever.dir = mul3(LN, -1);
  block("rig", "lighter.lever", bodyF, rounded(-6, 6, t2 - 0.2, t2 + 1.8, 0.6, 2), 7.4, 15, { wrap: (s) => `<g data-lever>${ink(s)}</g>` });
}

// ---------------------------------------------------------------- the node's wiring: power along the back rails, signals arched along column a
const nodeTouch = "board.node";
const back = (row, col = COL.a) => nh(row, col);
const plus = (row) => [NX + ROW(row), -RAIL.out, BT]; // the cell's +, the MQ-2 heater's 5 V
const minus = (row) => [NX + ROW(row), -RAIL.in, BT];
const warm = mat("mat-wire");
staple("lead.node", back(5), plus(5), { board: nodeTouch, wrap: warm }); // MQ-2 VCC
staple("lead.node", back(6), minus(7), { board: nodeTouch, wrap: ink }); // MQ-2 GND
staple("lead.node", back(13), minus(13), { board: nodeTouch, wrap: ink }); // buzzer −
staple("lead.node", back(14), plus(14), { board: nodeTouch, wrap: warm }); // buzzer +
staple("lead.node", back(18), minus(17), { board: nodeTouch, wrap: ink }); // DHT11 −
staple("lead.node", back(23), plus(23), { board: nodeTouch, wrap: warm }); // C3 5V
staple("lead.node", back(24), minus(25), { board: nodeTouch, wrap: ink }); // C3 GND
// nested, so no two cross: 3V3 → DHT +, GPIO4 → DATA, GPIO3 → buzzer S, GPIO1 → MQ-2 AO
jumper("jumper.node", back(25, COL.b), back(20), { high: 5, wrap: mat("mat-blue") });
jumper("jumper.node", back(26), back(19), { high: 10 });
jumper("jumper.node", back(27), back(15), { high: 15.5 });
jumper("jumper.node", back(29), back(8), { high: 21, wrap: mat("mat-blue") });
// the cell's leads, out of its back end, behind it and into the rails' first holes: + outer, − inner
{
  const [px, py, pz] = cellEnd.plus;
  const [mx, my, mz] = cellEnd.minus;
  const p1 = plus(1);
  const m1 = minus(2);
  const quarter = (cx, cy, r, z0, z1) => Array.from({ length: 7 }, (_, i) => {
    const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2);
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z0 + (z1 - z0) * (i / 6)];
  });
  tube("lead", "lead.cell", [[px, py - 1.2, pz], [px, py - 4.5, pz], ...quarter(p1[0] - 9, py + 4.5, 9, pz, 9.5), [p1[0], p1[1] - 5, 12.5], [p1[0], p1[1], 12.5], p1], 0.7, { wrap: warm, touch: ["cell.lug", nodeTouch], bend: 2 });
  tube("lead", "lead.cell", [[mx, my - 1.2, mz], [mx, my - 8, mz], ...quarter(m1[0] - 12, my + 4, 12, mz, 10), [m1[0], m1[1] - 5, 12], [m1[0], m1[1], 12], m1], 0.7, { wrap: ink, touch: ["cell.lug", nodeTouch], bend: 2 });
}

// ================================================================ the master
const MX = M.MASTER_X;
breadboard("board.master", MX, { glow: true });
const mh = (row, b) => M.holeOf(MX, row, b);
const ant = {};

// ---------------------------------------------------------------- the NodeMCU, its ESP-12E toward the node, its micro-USB out of the +x end
{
  const C = M.MCU;
  const xc = MX + ROW(C.row0 + 7);
  const x0 = xc - C.len / 2;
  const x1 = xc + C.len / 2;
  const yc = (C.back + C.front) / 2;
  const y0 = yc - C.wide / 2;
  const y1 = yc + C.wide / 2;
  const z0 = BT + C.lift;
  const z1 = z0 + C.pcb;
  for (const b of [C.back, C.front]) slab("master", "mcu.header", box(MX + ROW(C.row0) - 1.27, MX + ROW(C.row0 + 14) + 1.27, b - 1.25, b + 1.25), BT, C.lift, {}, { steps: 1, wrap: ink });
  const pads = [];
  const rings = [];
  for (let i = 0; i < 15; i++) for (const b of [C.back, C.front]) {
    const x = MX + ROW(C.row0 + i);
    pads.push(at([x, b, z1]));
    rings.push(k.ring(x, b, 0.85, z1, P, 14));
  }
  const holes = [[x0 + 2.6, y0 + 2.6], [x0 + 2.6, y1 - 2.6], [x1 - 2.6, y0 + 2.6], [x1 - 2.6, y1 - 2.6]];
  slab("master", "mcu.pcb", box(x0, x1, y0, y1, 1.2), z0, C.pcb, {}, { steps: 2, bevel: 0.3, wrap: ink,
    after: L(rings.join("") + holes.map(([x, y]) => k.ring(x, y, 1.5, z1, P, 20)).join(""), { tone: "lo" }) + D(pads, { size: 0.34, tone: "lo" }) });
  // the ESP-12E: its own board with the antenna's zigzag, and the shield can
  const e0 = x0 + 0.4;
  const e1 = e0 + 24;
  const ez = z1 + 0.8;
  const zig = [];
  for (let i = 0; i < 5; i++) {
    const y = yc - 6 + i * 2.6;
    zig.push([e0 + 1.4, y], [e0 + 5.6, y], [e0 + 5.6, y + 1.3], [e0 + 1.4, y + 1.3]);
  }
  slab("master", "esp12.pcb", box(e0, e1, yc - 8, yc + 8, 0.4), z1, 0.8, {}, { steps: 1, wrap: ink, after: L(k.pathOf(zig.map(([x, y]) => at([x, y, ez]))), { tone: "lo", free: true }) });
  const can = box(e0 + 8, e1 - 0.6, yc - 6, yc + 6, 0.4);
  slab("master", "esp12.can", can, ez, 2.4, {}, { steps: 1, wrap: mat("mat-cell"), after: L([0.3, 0.45, 0.6].map((t) => k.lineOnTop([can.x + 2.5, can.y + can.d * t], [can.x + can.w - (t === 0.45 ? 7 : 3), can.y + can.d * t], ez + 2.4, P)).join(""), { tone: "lo", free: true }) });
  slab("master", "esp12.led", box(e0 + 6.6, e0 + 7.6, yc + 5.6, yc + 6.4), ez, 0.4, {}, { steps: 1, wrap: mat("mat-cell") });
  ant.master = [e0 + 3.5, yc, ez + 0.4];
  // the USB end: CP2102, the regulator, RST and FLASH, the micro-USB socket
  slab("master", "mcu.cp2102", box(x1 - 15, x1 - 10, yc - 2.5, yc + 2.5), z1, 0.9, {}, { steps: 1, wrap: ink, after: D([at([x1 - 14.4, yc - 1.9, z1 + 0.9])], { size: 0.3, tone: "lo" }) });
  slab("master", "mcu.reg", box(x1 - 21, x1 - 17.4, yc - 3.2, yc + 3.2, 0.2), z1, 1.6, {}, { steps: 1, wrap: ink });
  slab("master", "mcu.reg.tab", box(x1 - 22.4, x1 - 21, yc - 1.6, yc + 1.6, 0.2), z1, 0.4, {}, { steps: 1, wrap: mat("mat-cell") });
  for (const b of [yc - 8.6, yc + 8.6]) {
    slab("master", "mcu.button", box(x1 - 7.6, x1 - 3.6, b - 1.6, b + 1.6), z1, 1.6, {}, { steps: 1, wrap: mat("mat-cell") });
    cyl("master", "mcu.button.cap", x1 - 5.6, b, 0.9, z1 + 1.6, 0.6, {}, { steps: 14, wrap: ink });
  }
  slab("master", "mcu.usb", box(x1 - 5.4, x1 + 0.6, yc - 3.8, yc + 3.8, 0.8), z1, 2.8, {}, { steps: 2, bevel: 0.2, wrap: mat("mat-cell") });
  ant.usb = [x1 + 0.6, yc, z1 + 1.4];
}

// ---------------------------------------------------------------- the RGB LED on four splayed legs, and the master's buzzer
const ledAt = [MX + ROW(M.LED.row0 + 1.5), M.LED.col, BT + 4.6];
{
  const [lx, ly, lz] = ledAt;
  for (let i = 0; i < 4; i++) {
    const hole = mh(M.LED.row0 + i, M.LED.col);
    const top = [lx - 1.9 + i * 1.27, ly, lz];
    tube("master", "led.leg", [hole, add3(hole, [0, 0, 1.4]), top], 0.24, { tone: "mid", wrap: mat("mat-cell"), touch: ["board.master", "led"], bend: 1.2, dots: [false, false], limp: false });
  }
  const F = G.frameOf([lx, ly, lz], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const DOME = [[0, 0], [0, 2.9], [1, 2.9], [1, 2.5], [5.8, 2.5, 1], [6.7, 2.4, 1], [7.5, 2.1, 1], [8.1, 1.6, 1], [8.5, 0.9, 1], [8.6, 0]];
  put("master", "led", [lx, ly, lz + 4], `<g data-rgb="0">${S(G.lathe(DOME, F, P), { tone: "mid" })}</g>`, [A.lathe(F, DOME)]);
}
const bzMaster = { x: MX + ROW((M.BZ_MASTER.rows[0] + M.BZ_MASTER.rows[1]) / 2), y: M.BZ_MASTER.col };
{
  const z0 = BT + 2.2;
  for (const row of M.BZ_MASTER.rows) {
    const hole = mh(row, M.BZ_MASTER.col);
    tube("master", "bz.leg", [hole, [hole[0], hole[1], z0]], 0.3, { tone: "mid", wrap: mat("mat-cell"), touch: ["board.master", "bz.master"], dots: [false, false], limp: false });
  }
  const top = z0 + M.BZ_MASTER.h;
  const { x, y } = bzMaster;
  cyl("master", "bz.master", x, y, M.BZ_MASTER.r, z0, M.BZ_MASTER.h, {}, { steps: 40, wrap: ink, inner: L(k.sideArc(x, y, M.BZ_MASTER.r, z0 + 1.6, P, 28), { tone: "faint" }),
    after: L(k.ring(x, y, 1.3, top, P, 20), { tone: "lo" }) + D([at([x, y, top])], { size: 0.5, tone: "mid" }) + L(k.lineOnTop([x + 2.6, y - 3.6], [x + 4.2, y - 3.6], top, P) + k.lineOnTop([x + 3.4, y - 4.4], [x + 3.4, y - 2.8], top, P), { tone: "lo", free: true }) });
  bzMaster.top = top;
}

// ---------------------------------------------------------------- the OLED on its stand in front, upright so its screen faces you
const oledFace = {};
{
  const O = M.OLED;
  const yb = O.y - O.t / 2;
  const yf = O.y + O.t / 2;
  const x0 = O.x;
  const x1 = O.x + O.w;
  const z0 = O.z0;
  const z1 = z0 + O.h;
  // the stand: a block with a slot, the board's foot in it
  slab("oled", "oled.stand", box(x0 - 3, x1 + 3, O.y - 6, O.y + 6, 1.6), 0, z0, {}, { steps: 3, bevel: 0.6, wrap: mat("mat-wood"), inner: L(k.sideSeam(box(x0 - 3, x1 + 3, O.y - 6, O.y + 6, 1.6), 2, P, 3), { tone: "faint" }),
    after: L(k.planOutline(box(x0 - 0.4, x1 + 0.4, yb - 0.3, yf + 0.3, 0.1), z0, P, 1), { tone: "lo" }) });
  const holes = [[x0 + 2, z1 - 2], [x1 - 2, z1 - 2], [x0 + 2, z0 + 4], [x1 - 2, z0 + 4]];
  slab("oled", "oled.pcb", box(x0, x1, yb, yf, 0.2), z0, O.h, {}, { steps: 1, wrap: mat("mat-blue"),
    after: L(holes.map(([x, z]) => k.pathOf(Array.from({ length: 17 }, (_, i) => [x + Math.cos((i / 16) * Math.PI * 2) * 1.2, yf + 0.01, z + Math.sin((i / 16) * Math.PI * 2) * 1.2]).map(at), true)).join(""), { tone: "lo" }) });
  // the glass: dark, with the panel's 128 × 64 pixels in its upper part; the page writes them
  const gx0 = (x0 + x1) / 2 - O.glass.w / 2;
  const gz0 = z0 + 2.6;
  const gz1 = gz0 + O.glass.h;
  const ax0 = (x0 + x1) / 2 - O.active.w / 2;
  const az1 = gz1 - 2.2;
  const u = k.axisVector(P, [O.active.w / 128, 0, 0]);
  const v = k.axisVector(P, [0, 0, -O.active.h / 64]);
  const o = at([ax0, yf + 1.3 + 0.02, az1]);
  oledFace.matrix = [u[0], u[1], v[0], v[1], o[0], o[1]].map((n) => Math.round(n * 1000) / 1000);
  slab("oled", "oled.glass", box(gx0, gx0 + O.glass.w, yf, yf + 1.3, 0.3), gz0, O.glass.h, {}, { steps: 2, bevel: 0.2, wrap: mat("mat-glass"),
    after: `<g data-oled transform="matrix(${oledFace.matrix.join(" ")})"></g>` });
  // the flex from the glass's foot round the board's lower edge
  slab("oled", "oled.flex", box((x0 + x1) / 2 - 5, (x0 + x1) / 2 + 5, yf, yf + 0.5, 0.1), z0, 2.2, {}, { steps: 1, wrap: mat("mat-yellow") });
  // the four-pin header along the top edge, pins out of the back, a female shell on each
  const hx0 = (x0 + x1) / 2 - 5.08;
  const hz = z1 - 1.6;
  slab("oled", "oled.header", box(hx0, hx0 + 10.16, yb - 2.5, yb, 0.2), hz - 1.25, 2.5, {}, { steps: 1, wrap: ink });
  oledFace.pins = [0, 1, 2, 3].map((i) => {
    const x = hx0 + 1.27 + i * 2.54;
    slab("oled", "oled.shell", box(x - 1.2, x + 1.2, yb - 2.5 - 11, yb - 2.5, 0.3), hz - 1.2, 2.4, {}, { steps: 1, wrap: ink });
    return [x, yb - 2.5 - 11, hz];
  });
}

// ---------------------------------------------------------------- the master's wiring
const mTouch = "board.master";
const front = (row, col) => mh(row, col);
const v33 = (row) => [MX + ROW(row), RAIL.in, BT]; // the front rails: 3V3 inner, GND outer
const gnd = (row) => [MX + ROW(row), RAIL.out, BT];
staple("lead.master", front(21, COL.j), v33(20), { board: mTouch, wrap: warm });
staple("lead.master", front(22, COL.j), gnd(22), { board: mTouch, wrap: ink });
// the LED's cathode and the buzzer's − across to the GND rail
staple("lead.master", front(4, COL.e), gnd(4), { board: mTouch, wrap: ink, by: 0.6 });
staple("lead.master", front(9, COL.e), gnd(9), { board: mTouch, wrap: ink });
// the signals over the channel to the NodeMCU's pins: G → D0, buzzer + → D5, B → D6, R → D7
jumper("jumper.master", front(5, COL.e), front(16, COL.j), { high: 5, power: 0.6 });
jumper("jumper.master", front(12, COL.e), front(23, COL.i), { high: 10, power: 0.55 });
jumper("jumper.master", front(6, COL.a), front(24, COL.i), { high: 15, power: 0.55, wrap: mat("mat-blue") });
jumper("jumper.master", front(3, COL.e), front(25, COL.i), { high: 20, power: 0.55, wrap: warm });
// the OLED's four leads, from the shells on its pins to shells in the board: GND, VCC, SCL → D1, SDA → D2
{
  const land = [gnd(2), v33(3), front(17, COL.i), front(18, COL.i)];
  oledFace.pins.forEach((p, i) => {
    const to = land[i];
    slab("lead", "oled.lead.shell", box(to[0] - 1.15, to[0] + 1.15, to[1] - 1.15, to[1] + 1.15), BT, 7, {}, { steps: 1, wrap: ink });
    const c = [to[0], to[1], BT + 7 + 1.1 - 0.45];
    put("lead", "oled.lead.boot", c, ink(S(G.sphereOf(c, 1.1, P), { tone: "mid" })), [A.ball(c, 1.1)]);
    const far = i >= 2;
    const way = [
      [add3(p, [0, -3, 0]), [p[0] + 3, 22.9, 29.5], [c[0] - 1.6, 23.1, 22.5], add3(c, [0, 0, 4])],
      [add3(p, [0, -4.8, 0]), [p[0] + 3.2, 21.1, 29.5], [c[0] - 1.6, 21, 22], add3(c, [0, 0, 4])],
      [add3(p, [0, -2.4, 0]), [p[0] + 1, 28, 26], [p[0] + 4, 31, 19], [c[0] + 12, 30.5, 19.5], [c[0] + 9, 19, 26], [c[0] + 4.6, c[1] + 0.5, 28], [c[0] + 1.1, c[1] + 0.2, 26.5], add3(c, [0, 0, 3.4])],
      [add3(p, [0, -2.4, 0]), [p[0] + 0.8, 25.4, 27.5], [p[0] + 4, 27.5, 17], [c[0] + 5.5, 27.2, 17], [c[0] + 5.5, 20, 21.5], [c[0] + 5, c[1], 24], [c[0] + 1.2, c[1], 23], add3(c, [0, 0, 3.2])],
    ][i];
    const last = way[way.length - 1];
    const out = add3(c, mul3(unit3(sub3(last, c)), Math.sqrt(1.1 * 1.1 - 0.6 * 0.6)));
    tube("lead", "oled.lead", [p, ...way, out], 0.6, { wrap: i === 0 ? ink : i === 1 ? warm : mat("mat-blue"), touch: ["oled.shell*", "oled.lead.boot*"], bend: far ? 5 : 3, dots: [false, false] });
  });
}

// ---------------------------------------------------------------- the charger, and the USB lead to the NodeMCU
{
  const C = M.CHARGER;
  const plan = { x: C.x, y: C.y, w: C.w, d: C.d, r: C.r };
  slab("power", "charger", plan, 0, C.h, {}, { steps: 6, bevel: 1, inner: L(k.sideSeam(plan, C.h - 3, P, 6), { tone: "faint" }),
    after: L(k.planOutline(k.insetPlan(plan, 6), C.h, P, 4), { tone: "faint" }) + L([C.y + 11, C.y + C.d - 13].map((y) => k.planOutline(box(C.x + 10, C.x + 22, y, y + 2, 0.8), C.h, P, 2)).join(""), { tone: "lo" }) });
  // the USB-A plug in its port on the +x face, and the micro-USB plug in the NodeMCU
  const a = { x: C.x + C.w, y: C.y + C.d / 2 - 6, w: 13, d: 12, r: 1 };
  slab("power", "charger.plug", a, 5, 8, {}, { steps: 2, bevel: 0.3, wrap: ink, inner: L(k.sideSeam(a, 9, P, 2), { tone: "faint" }) });
  const [ux, uy, uz] = ant.usb;
  const m = { x: ux, y: uy - 4.4, w: 9, d: 8.8, r: 1.2 };
  slab("power", "usb.plug", m, uz - 3.2, 6.4, {}, { steps: 3, bevel: 0.3, wrap: ink });
  const ay = a.y + a.d / 2;
  tube("power", "lead.usb", [[ux + 9, uy, uz], [ux + 14, uy, uz], [ux + 20, uy - 7, 7], [ux + 22, uy - 28, 3.5], [ux + 22, ay + 12, 4], [a.x + a.w + 5, ay, 9], [a.x + a.w, ay, 9]], 1.5, { wrap: ink, touch: ["usb.plug", "charger.plug"], bend: 9, dots: [false, false] });
}

// ================================================================ assemble
finish(B, P, ["bench", "board", "node", "rig", "lead", "master", "oled", "power"]);
const ordered = [...R.items].sort((a, b) => a.key - b.key).map((i) => i.svg).join("");
const LABEL = "The fire and smoke network on a bench: two units, each on its own breadboard. On the left, the battery sensor node: an ESP32-C3 Super Mini, an MQ-2 smoke sensor, a DHT11 and a buzzer module, run from an 18650 cell in a holder, with a lighter held over the MQ-2 in a helping hand. On the right, the master: a NodeMCU on USB power from a charger, an RGB LED, a buzzer, and an OLED standing in front that shows the network. The node sleeps 10 seconds between readings; it reads the sensor, sounds its own buzzer if it smells gas, and sends the reading to the master over WiFi; the master lights the LED, sounds its buzzer and shows the alarm.";
const svg = k.figureSvg({ width: M.W, height: M.H, label: LABEL, className: "rv-figure", body: [benchSvg, `<g data-scene>${ordered}</g>`, `<g data-gas></g><g data-chirp></g><g data-wifi></g>`] });
const cX = (M.C3.back + M.C3.front) / 2;
const live = {
  cap: { x: capX, y: capB, z: capTop, r: 7.2 },
  nozzle,
  jet: unit3(sub3([capX, capB, capTop], nozzle)),
  buzzers: [{ x: bzNode.x, y: bzNode.y, z: bzNode.top }, { x: bzMaster.x, y: bzMaster.y, z: bzMaster.top }],
  antennas: [[NX + ROW(M.C3.row0) - 2.9 + M.C3.len - 1.8, cX - 2.1, BT + M.C3.lift + M.C3.pcb + 1.1], ant.master],
  led: ledAt,
  lever: k.axisVector(P, mul3(lever.dir, 1.4)),
};
await writeFigure({ name: "firenet", svg, data: { P, wheels: [], ...live }, model: "firenet.mjs", mount: "mountFireNet", fig: "Fig 8", title: "Fire network", hint: "click to press the lighter", readout: "node asleep · wakes in 3 s" });
A.auditOrExit(R, P);
