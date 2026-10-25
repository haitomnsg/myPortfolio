// TomatoBot v2 as a model, in world units (1 unit ≈ 2.5 mm; x along the row, y across it, z up).
// Facts behind it (docs/PROFILE.md): a wheeled base, a 6-DOF arm with inverse kinematics, a webcam
// feeding YOLOv11, ripeness detection at 88% in the field. Everything the figure moves or reads out
// comes from here, in the build and in the page.

export const AZIMUTH = 38;
export const W = 640;
export const H = 500;

// the bench the scene stands on
export const PLATE = { x: -150, y: -122, w: 300, d: 226, r: 9 };
export const PLATE_H = 10;
export const FOOT_H = 5;

// the robot
export const DECK = { x: -78, y: -30, w: 156, d: 102, r: 3 };
export const DECK_Z = 30;
export const DECK_T = 4;
export const TOP = DECK_Z + DECK_T;
export const WHEEL_R = 16;
export const WHEEL_W = 12;
export const WHEEL_X = 54;
export const WHEEL_Y = [DECK.y - WHEEL_W / 2 - 3, DECK.y + DECK.d + WHEEL_W / 2 + 3];

// the arm: base servo on the deck, five turning joints and a gripper (six servos)
export const BASE = [-14, -12];
export const SHOULDER_Z = TOP + 26;
export const L1 = 44; // shoulder to elbow
export const L2 = 40; // elbow to wrist
export const L3 = 31; // wrist to the middle of the fingertips
export const CUP = { x: 12, y: 36, r: 13, h: 34 };
export const CUP_TOP = TOP + CUP.h;
export const CAM = { x: 52, y: DECK.y + 4, z: TOP + 22 }; // webcam lens, looking at the row (-y)

// the row: a planter with three staked plants
export const TROUGH = { x: -118, y: -112, w: 236, d: 40, r: 2 };
export const TROUGH_H = 17;
export const STAKE_Y = -94;
export const PLANTS = [-72, 0, 72];
export const STAKE_TOP = 150;
export const FRUIT_R = 6.2;
// tomatoes on the front of each plant; ripe ones are what the arm picks
export const FRUITS = [
  { id: 0, plant: 0, at: [-84, -80, 66], ripe: true },
  { id: 1, plant: 0, at: [-76, -80, 100], ripe: false },
  { id: 2, plant: 1, at: [-12, -80, 84], ripe: true },
  { id: 3, plant: 1, at: [-2, -80, 60], ripe: false },
  { id: 4, plant: 2, at: [60, -81, 104], ripe: false },
  { id: 5, plant: 2, at: [70, -80, 74], ripe: true },
];

export const ACCURACY = 88; // ripeness detection in the field, percent

export const SHOULDER = [BASE[0], BASE[1], SHOULDER_Z];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * Joint angles that put the middle of the fingertips at `target` with the gripper pointing at
 * `pitch` (radians from horizontal, negative points down). Elbow up, like the real arm.
 */
export function reach(target, pitch) {
  const dx = target[0] - SHOULDER[0];
  const dy = target[1] - SHOULDER[1];
  const yaw = Math.atan2(dy, dx);
  const rho = Math.hypot(dx, dy);
  const h = target[2] - SHOULDER[2];
  const wr = rho - L3 * Math.cos(pitch);
  const wh = h - L3 * Math.sin(pitch);
  const d = clamp(Math.hypot(wr, wh), Math.abs(L1 - L2) + 1, L1 + L2 - 0.5);
  const inner = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const a1 = Math.atan2(wh, wr) + inner;
  const er = L1 * Math.cos(a1);
  const eh = L1 * Math.sin(a1);
  const a2 = Math.atan2(wh - eh, wr - er);
  return { yaw, a1, a2, a3: pitch };
}

/** World points of every joint for a pose: shoulder, elbow, wrist, fingertip middle. */
export function chain(pose) {
  const dir = [Math.cos(pose.yaw), Math.sin(pose.yaw)];
  const at = (rho, h) => [SHOULDER[0] + dir[0] * rho, SHOULDER[1] + dir[1] * rho, SHOULDER[2] + h];
  const e = [L1 * Math.cos(pose.a1), L1 * Math.sin(pose.a1)];
  const w = [e[0] + L2 * Math.cos(pose.a2), e[1] + L2 * Math.sin(pose.a2)];
  const t = [w[0] + L3 * Math.cos(pose.a3), w[1] + L3 * Math.sin(pose.a3)];
  return { dir, shoulder: SHOULDER, elbow: at(...e), wrist: at(...w), tip: at(...t) };
}

// where the arm rests: upper arm up, forearm out over the back edge, gripper looking down at the row
export const REST = { yaw: -Math.PI / 2, a1: 1.75, a2: -0.35, a3: -1.0, roll: 0, grip: 0.2 };

// The robot drives along the row (x) and stops with the arm beside the plant it picks from.
// Everything on the robot is built in its own coordinates and moved by `u` along x.
export const TRAVEL = [-56, 56];
export const stopFor = (fruit) => clamp(fruit.at[0] - 4 - BASE[0], TRAVEL[0], TRAVEL[1]);
export const local = (point, u) => [point[0] - u, point[1], point[2]];

/** The point the gripper approaches a fruit from: back toward the robot along the approach. */
export function approachOf(at, back = 16) {
  const dx = SHOULDER[0] - at[0];
  const dy = SHOULDER[1] - at[1];
  const n = Math.hypot(dx, dy) || 1;
  return [at[0] + (dx / n) * back, at[1] + (dy / n) * back, at[2] + 2];
}

export const OVER_CUP = [CUP.x, CUP.y, CUP_TOP + 30];
export const DROP_PITCH = -1.35;
export const GRAVITY = 3920; // units per second squared (9.8 m/s² at 2.5 mm a unit)
