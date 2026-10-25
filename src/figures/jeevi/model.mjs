// JeevI-II ("SPDR Bot") as a model, in millimetres (x along the treadmill, y across it, z up).
// Geometry from the robot's own repo (github.com/haitomnsg/jeevi-ii): joint origins and axes in
// SpdrBot.xacro, part sizes in printFiles/*.stl, the default stance in spdrbot.py, the diagonal trot
// in config.txt. Terrains and rewards from reports/JeevI_II_Report.md. The treadmill is the figure's
// way of showing three terrains; the training itself ran in NVIDIA Isaac Lab.

export const AZIMUTH = 76;
export const W = 640;
export const H = 440;

// ---------------------------------------------------------------- the robot (body frame, mm)
// hips (yaw servos, shafts up) at the corners; each leg's plane sits 10 mm to one side of its hip
export const LEGS = [
  { id: 0, hip: [80.2, -64.9], dir: -Math.PI / 4, pair: 0 },
  { id: 1, hip: [80.2, 64.9], dir: Math.PI / 4, pair: 1 },
  { id: 2, hip: [-80.2, 64.9], dir: (3 * Math.PI) / 4, pair: 0 },
  { id: 3, hip: [-80.2, -64.9], dir: (-3 * Math.PI) / 4, pair: 1 },
];
export const HIP_Z = 27.8;
export const MID_ALONG = 50.4; // hip axis to mid joint, along the leg
export const MID_SIDE = 10; // and across it: the plane the femur, tibia and foot move in
export const MID_DROP = 14.1;
export const FEMUR = 80; // mid joint to knee
export const TIBIA = 148; // knee to the bottom of the TPU sock
export const SOCK_R = 17.5;
export const PLATE = { x: -65, y: -65, w: 130, d: 130, r: 4 }; // plate.stl, 5 mm thick
// default stance: mids +40°, tips +10° put each foot here, 106.9 mm below the body origin
export const REACH = 138.2; // hip to foot, along the leg
export const STAND = 106.9;

// ---------------------------------------------------------------- the treadmill (world, mm)
export const BELT_W = 360;
export const SPAN = [-285, 285]; // the open belt between the hoods
export const FRAME_X = [-400, 400];
export const DECK_Z = 0; // belt surface
export const SPEED = [200, 400]; // mm/s: the policy was commanded 0.2–0.4 m/s forward
export const CRUISE = 250;
export const STRIDE = 83; // the stance half of each step carries the foot this far, so the trot speeds up with the belt
export const hzAt = (v) => v / (2 * STRIDE);

// three terrain sections on one belt loop
export const SECTIONS = [
  { key: "flat", label: "flat", from: 0, to: 900, reward: 256.27, iterations: 500 },
  { key: "rough", label: "rough", from: 900, to: 1800, reward: 191.83, iterations: 100 },
  { key: "boxes", label: "boxes", from: 1800, to: 3150, reward: 184.05, iterations: 100 },
];
export const LOOP = 3150;

// deterministic noise, so the build and the page grow the same terrain
const hash = (i, j) => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** The raised parts of the belt, in belt coordinates: `{ u0, u1, y0, y1, h, section }`. */
export function features() {
  const out = [];
  // rough: a heightfield at the report's 0.1 m resolution, bumps 10–40 mm in 5 mm steps
  const rough = SECTIONS[1];
  const cell = 100;
  for (let u = rough.from + 50; u + cell <= rough.to - 50 + 0.1; u += cell) {
    for (let j = 0; j < 4; j++) {
      const h = 10 + 5 * Math.floor(hash(u / cell, j) * 7);
      const w = BELT_W / 4;
      out.push({ u0: u, u1: u + cell, y0: -BELT_W / 2 + j * w, y1: -BELT_W / 2 + (j + 1) * w, h, section: "rough" });
    }
  }
  // boxes: 450 mm grid blocks, 5–20 mm high, the full width of the belt
  const boxes = SECTIONS[2];
  for (let k = 0, u = boxes.from; u + 450 <= boxes.to; u += 450, k++) {
    out.push({ u0: u + 4, u1: u + 446, y0: -BELT_W / 2 + 4, y1: BELT_W / 2 - 4, h: [10, 20, 5][k % 3], section: "boxes" });
  }
  return out;
}
export const FEATURES = features();

/** World x of a belt coordinate after the belt has run `b` mm (features move toward -x). */
export const worldX = (u, b) => {
  let x = (((u - b) % LOOP) + LOOP) % LOOP;
  if (x > LOOP / 2) x -= LOOP;
  return x;
};
/** Belt coordinate under world x. */
export const beltU = (x, b) => (((x + b) % LOOP) + LOOP) % LOOP;
export const sectionAt = (x, b) => {
  const u = beltU(x, b);
  return SECTIONS.find((s) => u >= s.from && u < s.to) ?? SECTIONS[0];
};
/** Height of the belt's surface at a world point. */
export function heightAt(x, y, b) {
  if (x < SPAN[0] || x > SPAN[1]) return 0;
  const u = beltU(x, b);
  let h = 0;
  for (const f of FEATURES) if (u >= f.u0 && u <= f.u1 && y >= f.y0 && y <= f.y1) h = Math.max(h, f.h);
  return h;
}

// ---------------------------------------------------------------- legs
const dirOf = (a) => [Math.cos(a), Math.sin(a)];
/** Where each foot rests in the default stance, in the body frame. */
export function homeOf(leg) {
  const d = dirOf(leg.dir);
  const n = [-d[1], d[0]];
  return [leg.hip[0] + REACH * d[0] + MID_SIDE * n[0], leg.hip[1] + REACH * d[1] + MID_SIDE * n[1]];
}

/**
 * Joint positions for one leg reaching a foot point (body frame): the hip yaw that puts the foot
 * in the leg's plane, then the femur and tibia as two links, knee up like a spider's.
 */
export function legIK(leg, foot) {
  const [hx, hy] = leg.hip;
  const px = foot[0] - hx;
  const py = foot[1] - hy;
  const rho = Math.hypot(px, py);
  const yaw = Math.atan2(py, px) - leg.dir - Math.asin(Math.min(1, MID_SIDE / rho));
  const a = leg.dir + yaw;
  const d = [Math.cos(a), Math.sin(a), 0];
  const n = [-d[1], d[0], 0];
  const mid = [hx + MID_ALONG * d[0] + MID_SIDE * n[0], hy + MID_ALONG * d[1] + MID_SIDE * n[1], HIP_Z - MID_DROP];
  const along = Math.sqrt(Math.max(0, rho * rho - MID_SIDE * MID_SIDE)) - MID_ALONG;
  const dz = foot[2] - mid[2];
  const dist = Math.min(FEMUR + TIBIA - 0.5, Math.hypot(along, dz));
  const base = Math.atan2(dz, along);
  const inner = Math.acos(Math.max(-1, Math.min(1, (FEMUR * FEMUR + dist * dist - TIBIA * TIBIA) / (2 * FEMUR * dist))));
  const femur = base + inner; // femur angle above the leg's horizontal
  const kAlong = FEMUR * Math.cos(femur);
  const kz = FEMUR * Math.sin(femur);
  const knee = [mid[0] + kAlong * d[0], mid[1] + kAlong * d[1], mid[2] + kz];
  const tibia = Math.atan2(dz - kz, along - kAlong);
  return { yaw, d, n, mid, knee, foot, femur, tibia };
}

/** Phase of one leg's step (0–1) for a gait clock `c` in cycles: the two diagonal pairs are half a cycle apart. */
export const phaseOf = (leg, c) => (((c + leg.pair * 0.5) % 1) + 1) % 1;
