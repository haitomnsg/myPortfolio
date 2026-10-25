// Fig 5, the multi-utility disaster rescue vehicle, as a model (mm; x along the bench, y across, z
// up). From docs/PROFILE.md and its photo: an Arduino rover with a robotic arm, a drone, fire
// suppression and a camera. Here: a cabin with a sloped front and a window on a chassis with four
// wheel pods (two wheels each, small gear motors), a fire nozzle on the roof, a drone docked on a pad
// on the roof, and a folding arm behind the cabin. Hover and the drone lifts off to look around with
// its camera while the arm unfolds; leave and it lands.

export const W = 640;
export const H = 500;
export const AZIMUTH = 62;
export const PLATE = { x: -206, y: -100, w: 368, d: 200, r: 9 };
export const WHEEL = { r: 24, w: 14, xs: [-114, -60, 60, 114], y: 67 };
export const CHASSIS = { x: -135, y: -58, w: 270, d: 116, r: 4 };
export const CHASSIS_Z = WHEEL.r + 6; // the motors hang under it
export const CHASSIS_T = 5;
export const DECK = CHASSIS_Z + CHASSIS_T;
export const CABIN = { x0: -100, x1: 100, y: 46, top: DECK + 90, slope: 26 }; // the front leans back by `slope`
export const ROOF_T = 3;
export const ROOF = CABIN.top + ROOF_T;
export const PAD = { x: -92, y: -42, w: 84, d: 84, r: 3 };
export const PAD_T = 1.2;
export const DOCK = [-50, 0, ROOF + PAD_T]; // where the drone stands
export const FLY = { up: 84, out: 44 }; // its flight: up, drifting forward (+x) over the roof
// the arm: a turntable and shoulder servo behind the cabin, two links and a gripper
export const ARM = { x: -118, base: 8, servo: [20, 20, 24], pivot: DECK + 25, l1: 70, l2: 55 };
export const FOLDED = [90, -90]; // each link's angle from +x, in the x-z plane, degrees
export const UNFOLDED = [118, 205];

const rad = (d) => (d * Math.PI) / 180;

/** Small solids shared by the arm and the drone's props. */
function partsOf(k, G, P) {
  const { add3, mul3 } = G;
  const rect = (w, h, r) => {
    const out = [];
    const rr = Math.min(r, w / 2 - 0.01, h / 2 - 0.01);
    for (const [cx, cy, a0] of [[w / 2 - rr, h / 2 - rr, 0], [-w / 2 + rr, h / 2 - rr, Math.PI / 2], [-w / 2 + rr, -h / 2 + rr, Math.PI], [w / 2 - rr, -h / 2 + rr, (3 * Math.PI) / 2]]) {
      for (let i = 0; i <= 2; i++) out.push([cx + Math.cos(a0 + (i / 2) * (Math.PI / 2)) * rr, cy + Math.sin(a0 + (i / 2) * (Math.PI / 2)) * rr]);
    }
    return out;
  };
  // `len` along A from `from`, `wide` along U, `thick` along A × U
  const box = (name, from, A, U, len, wide, thick, r, style, cls, marks = "") => {
    const F = G.frameOf(from, A, U, G.cross3(A, U));
    const poly = rect(wide, thick, r);
    return { name, centre: add3(from, mul3(A, len / 2)), solid: G.prismOf(F, poly, 0, len, P), style, cls, marks, shape: { kind: "prism", F, poly, s0: 0, s1: len } };
  };
  const can = (name, F, s0, s1, r, style, cls, marks = "") => ({ name, centre: G.pointOf(F, (s0 + s1) / 2, 0, 0), solid: G.disc(s0, s1, r, F, P), style, cls, marks, shape: { kind: "disc", F, s0, s1, r } });
  return { box, can };
}

/** One piece as markup. */
export const pieceSvgOf = (k, p) => {
  const svg = k.solidSvg(p.solid, p.style) + (p.marks || "");
  return p.cls ? `<g class="${p.cls}">${svg}</g>` : svg;
};

/** The arm at `t` (0 folded, 1 unfolded): links, joint hubs and gripper, in painting order. */
export function armOf(k, G, P, t) {
  const { box, can } = partsOf(k, G, P);
  const { add3, mul3 } = G;
  const e = t * t * (3 - 2 * t);
  const a1 = rad(FOLDED[0] + (UNFOLDED[0] - FOLDED[0]) * e);
  const a2 = rad(FOLDED[1] + (UNFOLDED[1] - FOLDED[1]) * e);
  const d1 = [Math.cos(a1), 0, Math.sin(a1)];
  const d2 = [Math.cos(a2), 0, Math.sin(a2)];
  const y = [0, 1, 0];
  const half = ARM.servo[1] / 2;
  const shoulder = [ARM.x, half, ARM.pivot];
  const elbow = add3(shoulder, mul3(d1, ARM.l1));
  const wrist = add3(elbow, mul3(d2, ARM.l2));
  const D = (points, style) => k.dotsSvg(points, style);
  const iso = (p) => k.iso(p, P);
  const hub = (name, at, s0, r) => can(name, G.frameOf(at, y, [1, 0, 0], [0, 0, 1]), s0, s0 + 2, r, { tone: "mid" }, "mat-cell", D([iso(add3(at, [0, s0 + 2, 0]))], { size: 0.6, tone: "hi" }));
  const pieces = [];
  // link 1 on the servo's side, link 2 on link 1's side, each a flat bar with rounded edges
  pieces.push(box("arm.link1", add3(add3(shoulder, mul3(d1, -7)), [0, 3, 0]), d1, y, ARM.l1 + 14, 6, 12, 2.4, { tone: "mid" }, "mat-dark"));
  pieces.push(hub("arm.shoulder", shoulder, 6, 5));
  pieces.push(box("arm.link2", add3(add3(elbow, mul3(d2, -6)), [0, 8.5, 0]), d2, y, ARM.l2 + 6, 5, 10, 2, { tone: "mid" }, "mat-dark"));
  pieces.push(hub("arm.elbow", elbow, 11, 4.2));
  // the gripper: a palm across the end of link 2 and two fingers
  const across = G.cross3(d2, y);
  pieces.push(box("arm.palm", add3(wrist, [0, 9.5, 0]), d2, y, 5, 7, 18, 1, { tone: "mid" }, "mat-dark"));
  for (const side of [-1, 1]) pieces.push(box("arm.finger", add3(add3(wrist, mul3(d2, 5)), add3([0, 9.5, 0], mul3(across, side * 7))), d2, y, 12, 6, 3.2, 1, { tone: "mid" }, "mat-dark"));
  return { pieces, wrist };
}

/** Where the drone is, as an offset from its dock, at flight share `f` (0 docked, 1 out): up, then forward. */
export function flightOf(f) {
  const rise = Math.min(1, f / 0.45);
  const glide = Math.max(0, (f - 0.3) / 0.7);
  const ease = (s) => s * s * (3 - 2 * s);
  return [FLY.out * ease(glide), 0, FLY.up * ease(rise)];
}

// the drone, in its own frame (built at the dock): four motor pods on the diagonals
export const DRONE = { body: 40, bodyH: 12, arm: 50, leg: 10, pod: 6, podH: 9, prop: 22 };
export const PODS = [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([sx, sy]) => [DOCK[0] + (sx * DRONE.arm) / Math.SQRT2, DOCK[1] + (sy * DRONE.arm) / Math.SQRT2]);
export const PROP_Z = DOCK[2] + DRONE.leg + DRONE.podH + 1.6;

/** The four propellers turned `spin` radians; a faint disc stands for the blur once they are fast. */
export function propsOf(k, G, P, spin, blur) {
  const iso = (p) => k.iso(p, P);
  let lines = "";
  let discs = "";
  PODS.forEach(([px, py], i) => {
    const a = spin * (i % 3 === 0 ? 1 : -1) + i * 0.7;
    const tip = (s, w) => [px + Math.cos(a + w) * DRONE.prop * s, py + Math.sin(a + w) * DRONE.prop * s, PROP_Z];
    for (const flip of [0, Math.PI]) {
      // a blade: a long thin leaf from the hub to the tip
      lines += k.pathOf([iso(tip(0.14, flip - 0.5)), iso(tip(0.6, flip - 0.1)), iso(tip(1, flip)), iso(tip(0.6, flip + 0.13)), iso(tip(0.14, flip + 0.5))]);
    }
    if (blur > 0) discs += k.pathOf(Array.from({ length: 40 }, (_, j) => iso([px + Math.cos((j / 40) * Math.PI * 2) * DRONE.prop, py + Math.sin((j / 40) * Math.PI * 2) * DRONE.prop, PROP_Z])), true);
  });
  return (blur > 0 ? `<path class="rv-blur" style="opacity:${blur.toFixed(2)}" d="${discs}"/>` : "") + k.lineSvg(lines, { tone: "mid", free: true });
}
