// Fig 7, Phulbari's pot, as a model (mm; x along the bench, y across, z up). From the project's defense
// report and sketches (D:\ProjectApple) and Ashish's photos: a terracotta pot with a peace lily, a
// capacitive soil-moisture probe in the soil, an ESP32 DevKit and a one-channel relay module on a
// breadboard against the pot, a small DC pump beside it whose clear tube loops over the rim into the
// soil, all tied on with a twisted pair, and a power bank on the bench. The ESP32 reads the probe on
// GPIO 34; when the soil is dry it pulls GPIO 5 low, the relay closes and the pump waters the plant.
// Each reading and each watering goes to Firebase, where the Phulbari app shows them.

export const W = 640;
export const H = 500;
export const AZIMUTH = 50;
export const PLATE = { x: -98, y: -154, w: 282, d: 218, r: 9 };

// the pot: a tapered body, a rolled lip with two ridges, the soil 12 mm under the rim
export const POT = { r0: 45.2, z0: 2, r1: 57.8, z1: 96, top: 112, lip: 62, mouth: 59.4 };
export const SLOPE = (POT.r1 - POT.r0) / (POT.z1 - POT.z0);
export const potR = (z) => POT.r0 + (z - POT.z0) * SLOPE;
export const SOIL_Z = 100;
export const SOIL_R = POT.mouth - (POT.top - SOIL_Z) * SLOPE;
/** The pot's outside, turned: foot, body, lip and its ridges, the rim. */
export const POT_SIDE = [[0, 0], [0, 43.2], [0.6, 44.6, 1], [POT.z0, POT.r0], [POT.z1, POT.r1], [POT.z1, 61.4], [97.2, 62.6, 1], [100, 63.3, 1], [102.6, 62.8, 1], [104.2, 62.3], [105.8, 62.8, 1], [108.6, 63.4, 1], [111.2, 63, 1], [POT.top, POT.lip]];
/** The pot and its soil as one turned solid: the outside, then the rim, the inner wall and the soil's top. */
export const POT_SOLID = [...POT_SIDE, [POT.top, POT.mouth], [SOIL_Z, SOIL_R], [SOIL_Z, 0]];

const unit = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};
const deg = (d) => (d * Math.PI) / 180;

/** A frame on the pot's body at angle `theta` and height `z`: `n` out of the surface, `g` up it, `t` round it. */
export function onPot(theta, z) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const r = potR(z);
  return { o: [r * c, r * s, z], n: unit([c, s, -SLOPE]), g: unit([SLOPE * c, SLOPE * s, 1]), t: [-s, c, 0] };
}
/** A point in a surface frame: `a` along t, `b` along g, `c` out along n. */
export const inFrame = (f, a, b, c) => [0, 1, 2].map((i) => f.o[i] + f.t[i] * a + f.g[i] * b + f.n[i] * c);

// the breadboard (a 400-tie half board) stands against the body, its long side up the slope
export const BOARD = { theta: deg(35), z: 50, len: 82.5, wide: 54.5, t: 8.5 };
export const BF = onPot(BOARD.theta, BOARD.z);
// on it, the ESP32 DevKit (USB end up, past the board's top edge) and the relay module below it
export const ESP = { g0: -7, g1: 44.5, wide: 28, pins: 11.43, lift: 8.5, pcb: 1.6 };
export const RELAY = { g0: -40, g1: -14, t0: -25, t1: 25, lift: 6, pcb: 1.6 };
export const WRAP_G = -10.5; // the twisted pair crosses the board between the two
// the pump stands against the body on the left; its outlet points a little toward the viewer of straight
// out, so the tube's loop stands square to the view
export const PUMP = { theta: deg(150), z: 30, r: 12, h: 42, out: deg(140) };
export const PF = onPot(PUMP.theta, PUMP.z);
export const PUMP_AXIS = inFrame(PF, 0, 0, PUMP.r); // its axis, at its base
// the probe stands in the soil with its face to the viewer
export const PROBE = { theta: deg(70), rho: 30, wide: 23, blade: 1.6, head: [107, 126], tape: 4.2 };
export const PROBE_AT = [PROBE.rho * Math.cos(PROBE.theta), PROBE.rho * Math.sin(PROBE.theta)];
export const BANK = { x: 72, y: -142, w: 100, d: 60, h: 15, r: 6 }; // the power bank, lying on the bench, its ports toward the pot

// the moisture the figure runs on, in percent: below DRY the ESP32 turns the pump on
export const MOIST = { start: 46, dry: 30, rate: 3.2, fast: 14, gain: 8 };
export const READ = 1.5; // seconds between readings, on the figure's clock
export const WATER = 5; // seconds the pump runs: the sketch's delay(5000)
export const FLOW = 160; // mm of tube the water fills each second
/** How far the leaves droop at a moisture: none above 42%, fully by 27%. */
export const droopAt = (m) => Math.min(1, Math.max(0, (42 - m) / 15));

/**
 * A peace-lily leaf: a petiole up out of the soil, then a blade that arches out and droops at its tip.
 * `phi` points it, `h` and `out` place the blade's base, `len` and `wide` size the blade, `a0` and `a1`
 * are its pitch at the base and the tip (degrees above level).
 */
export const JOINT = 2.2; // the swollen joint where a petiole meets its blade
export const LEAVES = [
  { phi: 354, base: 8, h: 64, out: 20, len: 84, wide: 15, a0: 30, a1: -38, fold: 16 },
  { phi: 78, base: 8, h: 92, out: 12, len: 78, wide: 14, a0: 52, a1: -12, fold: 14 },
  { phi: 200, base: 8, h: 76, out: 18, len: 86, wide: 15, a0: 34, a1: -40, fold: 16 },
  { phi: 262, base: 8, h: 98, out: 10, len: 76, wide: 13, a0: 58, a1: 4, fold: 14 },
  { phi: 318, base: 8, h: 70, out: 20, len: 88, wide: 15, a0: 26, a1: -44, fold: 16 },
  { phi: 128, base: 8, h: 108, out: 8, len: 66, wide: 11, a0: 70, a1: 32, fold: 12 },
  { phi: 168, base: 8, h: 84, out: 16, len: 72, wide: 13, a0: 40, a1: -24, fold: 15 },
  { phi: 232, base: 8, h: 58, out: 20, len: 70, wide: 13, a0: 28, a1: -30, fold: 15 },
];

/**
 * A leaf's shape: the petiole's route and, along the midrib, `rows` cross-sections (mid point, the two
 * edge points, the frame there). `droop` (0..1) bends the blade down, as a thirsty peace lily does.
 */
export function leafOf(spec, droop = 0, rows = 10) {
  const phi = deg(spec.phi);
  const out = [Math.cos(phi), Math.sin(phi), 0];
  const side = [-Math.sin(phi), Math.cos(phi), 0];
  const base = [out[0] * spec.base, out[1] * spec.base, SOIL_Z];
  const top = [base[0] + out[0] * spec.out, base[1] + out[1] * spec.out, SOIL_Z + spec.h];
  const bend = [base[0], base[1], SOIL_Z + spec.h * 0.55];
  const petiole = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const q = (a, b, c) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
    petiole.push([q(base[0], bend[0], top[0]), q(base[1], bend[1], top[1]), q(base[2], bend[2], top[2])]);
  }
  const a1 = spec.a1 - droop * 34;
  const a0 = spec.a0 - droop * 14;
  const rowsOut = [];
  const p0 = deg(a0);
  let p = [top[0] + out[0] * Math.cos(p0) * JOINT, top[1] + out[1] * Math.cos(p0) * JOINT, top[2] + Math.sin(p0) * JOINT];
  const step = spec.len / rows;
  for (let i = 0; i <= rows; i++) {
    const s = i / rows;
    const pitch = deg(a0 + (a1 - a0) * Math.pow(s, 1.25));
    const along = unit([out[0] * Math.cos(pitch), out[1] * Math.cos(pitch), Math.sin(pitch)]);
    const up = unit([
      along[1] * side[2] - along[2] * side[1],
      along[2] * side[0] - along[0] * side[2],
      along[0] * side[1] - along[1] * side[0],
    ]);
    const w = spec.wide * Math.pow(Math.sin(Math.PI * Math.min(1, s * 0.97 + 0.02)), 0.78) * (1 - 0.28 * s);
    const f = deg(spec.fold);
    const edge = (sign) => [0, 1, 2].map((k) => p[k] + side[k] * sign * w * Math.cos(f) + up[k] * w * Math.sin(f));
    rowsOut.push({ mid: p, left: edge(1), right: edge(-1), along, up, w });
    p = [p[0] + along[0] * step, p[1] + along[1] * step, p[2] + along[2] * step];
  }
  return { petiole, joint: top, rows: rowsOut, side, out };
}

export const OUTLET = 30; // the outlet's height up the pump's axis
export const TUBE_R = 3.9;
export const SLEEVE = 8.5; // how far the outlet's sleeve stands out of the pump
export const NEAR = 4; // the outlet stands this far in front of the pump's axis, so it leaves the body on the side you see
export const OUTLET_FACE = Math.sqrt(PUMP.r * PUMP.r - NEAR * NEAR) + SLEEVE; // its end face, out from that axis

/**
 * The tube's route, from the outlet's sleeve out and up round its loop, back over the rim and down into
 * the soil, in the vertical plane through the pot's axis at the pump's angle. Dense enough to draw as is.
 */
export function tubeRoute() {
  const d = [Math.cos(PUMP.out), Math.sin(PUMP.out), 0];
  const g = onPot(PUMP.theta, PUMP.z).g;
  const near = [Math.cos(deg(AZIMUTH)) * NEAR, Math.sin(deg(AZIMUTH)) * NEAR, 0];
  const o = PUMP_AXIS.map((v, i) => v + g[i] * OUTLET + near[i]);
  // (u, z) in the vertical plane along d through the outlet's axis; u counts out from the point nearest the pot's axis
  const wf = -(o[0] * d[0] + o[1] * d[1]);
  const foot = [o[0] + d[0] * wf, o[1] + d[1] * wf];
  const off = Math.hypot(foot[0], foot[1]);
  const at = (u, z) => [foot[0] + d[0] * u, foot[1] + d[1] * u, z];
  const uOf = (rho) => Math.sqrt(rho * rho - off * off);
  const rho0 = -wf + OUTLET_FACE - SLEEVE;
  const z0 = o[2];
  const pts = [];
  const line = (a, b, n) => { for (let i = 1; i <= n; i++) pts.push(at(a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n)); };
  const arc = (cx, cz, r, from, to, n) => { for (let i = 1; i <= n; i++) { const t = deg(from + ((to - from) * i) / n); pts.push(at(cx + r * Math.cos(t), cz + r * Math.sin(t))); } };
  // out of the outlet, then a loop that turns up and back toward the pot
  const R = 31;
  const cx = rho0 + SLEEVE + 22;
  pts.push(at(rho0 + 0.2, z0), at(rho0 + SLEEVE, z0));
  line([rho0 + SLEEVE, z0], [cx, z0], 6);
  arc(cx, z0 + R, R, -90, 98, 34);
  // back over the rim, clear of it, then down into the soil
  const top = [cx + R * Math.cos(deg(98)), z0 + R + R * Math.sin(deg(98))];
  const over = [uOf(POT.mouth) + 0.6, POT.top + TUBE_R + 2.4];
  line(top, over, 10);
  arc(over[0], over[1] - 10, 10, 90, 180, 12);
  const down = [over[0] - 10, over[1] - 10];
  line(down, [down[0], SOIL_Z + 0.02], 6);
  return { points: pts, origin: o, dir: d };
}

/** A leaf's blade as markup: its outline, a tone for each half of each row, the midrib and the veins. */
export function leafSvgOf(k, G, P, rows) {
  const V = G.viewOf(P);
  const at = (p) => k.iso(p, P);
  const { add3, sub3, mul3, unit3, cross3, dot3 } = G;
  const edge = [...rows.map((r) => r.left), ...rows.slice().reverse().map((r) => r.right)];
  const d = k.pathOf(edge.map(at), true);
  const quads = [];
  for (let i = 0; i < rows.length - 1; i++) {
    for (const side of ["left", "right"]) {
      const q = [rows[i].mid, rows[i][side], rows[i + 1][side], rows[i + 1].mid];
      let n = unit3(cross3(sub3(q[1], q[0]), sub3(q[3], q[0])));
      if (dot3(n, V) < 0) n = mul3(n, -1);
      quads.push({ depth: k.depthOf(q.reduce((a, p) => add3(a, mul3(p, 0.25)), [0, 0, 0]), P), d: k.pathOf(q.map(at), true), tone: G.toneOf(n, P) });
    }
  }
  quads.sort((a, b) => a.depth - b.depth);
  const shades = quads.map((q) => `<path class="iso-shade" data-shade="${Math.min(3, q.tone)}" d="${q.d}"/>`).join("");
  // the midrib runs from the joint to the tip, where the outline closes on it
  const rib = k.lineSvg(k.pathOf(rows.map((r) => at(r.mid))), { tone: "lo" });
  const veins = [];
  for (let i = 2; i < rows.length - 2; i++) for (const side of ["left", "right"]) veins.push(k.pathOf([at(rows[i].mid), at(G.lerp3(rows[i + 1][side], rows[i + 2][side], 0.4))]));
  return `<g class="iso-solid mat-leaf"><path class="iso-fill" d="${d}"/>${shades}${k.lineSvg(veins.join(""), { tone: "faint" })}${rib}<path class="iso-line iso-edge" data-tone="mid" d="${d}"/></g>`;
}
