// Fig 4, the obstacle-avoiding car, as a model (mm; x along the bench, y across, z up). From
// docs/PROFILE.md and its photo: an Arduino under a motor shield on a plank, four TT gear motors
// with rubber wheels, and an HC-SR04 ultrasonic sensor on an SG90 servo at the front. It looks ahead;
// when something is close it stops, looks left and right, and turns to the clearer side.
// On the bench the car stands on a block, wheels free, facing a wall that slides on a rail.

export const W = 640;
export const H = 500;
export const AZIMUTH = 58;
export const PLATE = { x: -112, y: -146, w: 322, d: 292, r: 9 };
export const LIFT = 10; // the stand lifts the wheels this far off the bench
export const WHEEL = { r: 32.5, w: 26, x: 54, y: 67 };
export const SHAFT_Z = WHEEL.r + LIFT;
export const STAND = { x: -64, y: -44, w: 128, d: 88, r: 3 };
export const STAND_H = SHAFT_Z - 11; // up to the gearboxes' undersides
export const DECK_Z = SHAFT_Z + 11;
export const DECK_T = 4;
export const TOP = DECK_Z + DECK_T;
export const DECK = { x: -75, y: -46, w: 150, d: 92, r: 3 };
// the servo drops through a notch in the deck's front edge and hangs from its tabs
export const NOTCH = { x: 61, y0: -18, y1: 6.5 };
export const SERVO = { x: 62, y: -16.75, w: 12, d: 22.5, z: TOP - 15.9, h: 22.7 }; // its tabs, 32 long, rest on the deck
export const PIVOT = [68, 0]; // the servo's output shaft
export const HORN_Z = SERVO.z + SERVO.h + 4; // top of the shaft boss
export const HEAD_Z = HORN_Z + 2; // the bracket sits on the horn
export const EYE = { f: 21.6, z: 82, s: 13, r: 8 }; // the transducers' front faces, height, spacing, radius
export const LOOK = 50; // how far the servo turns each way, degrees
export const RAIL = { x: 159, w: 18, y0: -122, y1: 122 };
export const WALL = { x: 158, w: 20, d: 90, z: 14, h: 72 }; // on a carriage, its centre at y = 0 here
export const WALL_RANGE = 91;
export const STOP = 120; // closer than this ahead, the car stops and looks
export const RANGE = 300; // beyond this the reading is "clear"
export const CONE = 12; // the sensor's half-angle, degrees

/** Where the sensor looks from and which way, with the servo turned `deg` toward the car's left (-y). */
export function eyeOf(deg) {
  const a = (deg * Math.PI) / 180;
  const f = [Math.cos(a), -Math.sin(a), 0];
  return { o: [PIVOT[0] + f[0] * EYE.f, PIVOT[1] + f[1] * EYE.f, EYE.z], f };
}

/** The echo the HC-SR04 hears turned `deg`, with the wall's centre at `wy`: the nearest return in its cone. */
export function rangeAt(deg, wy) {
  const { o } = eyeOf(deg);
  const box = [WALL.x, wy - WALL.d / 2, WALL.x + WALL.w, wy + WALL.d / 2];
  let best = Infinity;
  for (let i = -4; i <= 4; i++) {
    const a = ((deg + (CONE * i) / 4) * Math.PI) / 180;
    const d = [Math.cos(a), -Math.sin(a)];
    // a ray against the wall's footprint
    let t0 = 0;
    let t1 = RANGE;
    for (let k = 0; k < 2; k++) {
      const lo = box[k] - o[k];
      const hi = box[k + 2] - o[k];
      if (Math.abs(d[k]) < 1e-9) { if (lo > 0 || hi < 0) { t0 = Infinity; break; } continue; }
      const ta = lo / d[k];
      const tb = hi / d[k];
      t0 = Math.max(t0, Math.min(ta, tb));
      t1 = Math.min(t1, Math.max(ta, tb));
    }
    if (t0 <= t1 && t0 < best) best = t0;
  }
  return best;
}

/**
 * The sensor head on the servo horn, turned `deg`: the horn arm, an L bracket, the HC-SR04 board and
 * its two transducers. Pieces come back in painting order (the board's face always looks at the viewer
 * at these angles); each has `{ name, centre, solid, style, cls, marks, shape }`.
 */
export function headOf(k, G, P, deg) {
  const { add3, mul3 } = G;
  const V = G.viewOf(P);
  const a = (deg * Math.PI) / 180;
  const f = [Math.cos(a), -Math.sin(a), 0];
  const s = [Math.sin(a), Math.cos(a), 0];
  const z = [0, 0, 1];
  const base = [PIVOT[0], PIVOT[1], 0];
  const at = (F, S, Z) => add3(add3(add3(base, mul3(f, F)), mul3(s, S)), [0, 0, Z]);
  const rect = (w, h, r) => {
    const out = [];
    const rr = Math.min(r, w / 2 - 0.01, h / 2 - 0.01);
    for (const [cx, cy, a0] of [[w / 2 - rr, h / 2 - rr, 0], [-w / 2 + rr, h / 2 - rr, Math.PI / 2], [-w / 2 + rr, -h / 2 + rr, Math.PI], [w / 2 - rr, -h / 2 + rr, (3 * Math.PI) / 2]]) {
      for (let i = 0; i <= 2; i++) out.push([cx + Math.cos(a0 + (i / 2) * (Math.PI / 2)) * rr, cy + Math.sin(a0 + (i / 2) * (Math.PI / 2)) * rr]);
    }
    return out;
  };
  // a box: `len` along axis A from `from`, `wide` along U, `thick` along the third
  const box = (name, from, A, U, len, wide, thick, r, style, cls, marks = "") => {
    const F = G.frameOf(from, A, U, G.cross3(A, U));
    const poly = rect(wide, thick, r);
    return { name, centre: add3(from, mul3(A, len / 2)), solid: G.prismOf(F, poly, 0, len, P), style, cls, marks, shape: { kind: "prism", F, poly, s0: 0, s1: len } };
  };
  const can = (name, F, s0, s1, r, style, cls, marks = "") => ({ name, centre: G.pointOf(F, (s0 + s1) / 2, 0, 0), solid: G.disc(s0, s1, r, F, P), style, cls, marks, shape: { kind: "disc", F, s0, s1, r } });
  const L = (d, style) => k.lineSvg(d, style);
  const D = (points, style) => k.dotsSvg(points, style);
  const iso = (p) => k.iso(p, P);

  const pieces = [];
  // the horn's arm on the shaft, and the bracket's foot screwed to it
  pieces.push(box("head.horn", at(2, 0, HORN_Z), z, f, 2, 16, 4, 1.6, { tone: "mid" }, "mat-cell", D([iso(at(-3, 0, HORN_Z + 2)), iso(at(7, 0, HORN_Z + 2))], { size: 0.45 })));
  pieces.push(box("head.foot", at(1.5, 0, HEAD_Z), z, f, 1.5, 13, 13, 1, { tone: "mid" }, "mat-cell"));
  // the bracket's upright, against the board's back
  pieces.push(box("head.upright", at(7.25, 0, HEAD_Z + 1.5), z, s, EYE.z + 6 - HEAD_Z - 1.5, 16, 1.5, 0.5, { tone: "mid" }, "mat-cell"));
  // the board, 45 × 20, its face toward f, its four mounting holes
  pieces.push(box("head.board", at(8, 0, EYE.z), f, s, 1.6, 45, 20, 1.2, { tone: "mid" }, "mat-pcb",
    D([[-20, 7.5], [20, 7.5], [-20, -7.5], [20, -7.5]].map(([S, Z]) => iso(at(9.6, S, EYE.z + Z))), { size: 0.5, tone: "mid" })));
  // the crystal between the eyes
  pieces.push(box("head.crystal", at(9.6, 0, EYE.z + 6), f, s, 2.4, 9, 3.6, 1.6, { tone: "mid" }, "mat-cell"));
  // the two transducers: silver cans with a dark mesh, nearer one painted last
  const eyes = [-1, 1].map((side) => {
    const F = G.frameOf(at(9.6, side * EYE.s, EYE.z), f, s, z);
    const front = G.frameOf(at(9.6, side * EYE.s, EYE.z), f, s, z);
    return {
      key: G.dot3(at(15, side * EYE.s, EYE.z), V),
      parts: [
        can(`head.eye`, F, 0, EYE.f - 9.6, EYE.r, { tone: "mid", inner: L(G.arcOf(F, 3, EYE.r, P), { tone: "faint" }) }, "mat-cell"),
        can(`head.mesh`, front, EYE.f - 9.6, EYE.f - 9.6 + 0.4, EYE.r - 1.6, { tone: "lo" }, "mat-dark", L(G.circleOf(front, EYE.f - 9.6 + 0.4, EYE.r - 3.6, P, 32), { tone: "faint" })),
      ],
    };
  });
  eyes.sort((p, q) => p.key - q.key).forEach((e) => pieces.push(...e.parts));
  return pieces;
}

/** One head piece as markup. */
export const pieceSvgOf = (k, p) => {
  const svg = k.solidSvg(p.solid, p.style) + (p.marks || "");
  return p.cls ? `<g class="${p.cls}">${svg}</g>` : svg;
};
