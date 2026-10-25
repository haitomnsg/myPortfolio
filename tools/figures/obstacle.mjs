// Builds Fig 4, the obstacle-avoiding car: node tools/figures/obstacle.mjs [--audit]
import * as k from "../../src/figures/kit/iso-kit.mjs";
import * as G from "../../src/figures/kit/lathe.mjs";
import * as A from "../../src/figures/kit/audit.mjs";
import * as M from "../../src/figures/rovers/obstacle.mjs";
import { makeBuilder, finish, writeFigure } from "./rover-lib.mjs";

const wallTop = M.WALL.z + M.WALL.h;
const ends = [-1, 1].map((side) => [M.WALL.x + M.WALL.w, side * (M.WALL_RANGE + M.WALL.d / 2), wallTop]);
const P = k.fitProjection([...k.boxCorners(M.PLATE, -15, 0), ...ends, [0, 0, M.EYE.z + 14]], M.W, M.H, { pad: 24, azimuth: M.AZIMUTH });
const B = makeBuilder(P);
const { slab, cyl, put, wire, at, L, D, ink } = B;
const T = M.TOP;
const wood = (s) => `<g class="mat-wood">${s}</g>`;

// ---------------------------------------------------------------- the rail, and the wall that rides it
const rail = { x: M.RAIL.x, y: M.RAIL.y0, w: M.RAIL.w, d: M.RAIL.y1 - M.RAIL.y0, r: 2 };
slab("car", "rail", rail, 0, 8, {}, { steps: 2, bevel: 0.5, inner: L(k.sideSeam(rail, 4, P, 2), { tone: "faint" }), after: L(k.planOutline(k.insetPlan(rail, 5), 8, P, 2), { tone: "lo" }) });
for (const y of [M.RAIL.y0, M.RAIL.y1 - 6]) slab("car", "rail.stop", { x: M.RAIL.x - 2, y, w: M.RAIL.w + 4, d: 6, r: 1 }, 8, 10, {}, { steps: 2, after: D([at([M.RAIL.x + M.RAIL.w / 2, y + 3, 18])], { size: 0.5 }) });
const carriage = { x: M.RAIL.x - 4, y: -25, w: M.RAIL.w + 8, d: 50, r: 3 };
slab("wall", "wall.carriage", carriage, 8, M.WALL.z - 8, {}, { steps: 3, bevel: 0.5 });
const wall = { x: M.WALL.x, y: -M.WALL.d / 2, w: M.WALL.w, d: M.WALL.d, r: 1.5 };
slab("wall", "wall", wall, M.WALL.z, M.WALL.h, {}, { steps: 3, bevel: 0.8, wrap: wood,
  inner: L([0.3, 0.62].map((t) => k.sideSeam(wall, M.WALL.z + M.WALL.h * t, P, 3)).join(""), { tone: "faint" }),
  after: L([-28, -4, 19].map((y) => k.lineOnTop([wall.x + 2.5, y], [wall.x + wall.w - 2.5, y + 2], wallTop, P)).join(""), { tone: "faint", free: true }) });

// ---------------------------------------------------------------- the stand, the motors and the wheels
slab("car", "stand", M.STAND, 0, M.STAND_H, {}, { steps: 3, bevel: 0.8, wrap: wood, inner: L(k.sideSeam(M.STAND, M.STAND_H * 0.5, P, 3), { tone: "faint" }) });
for (const side of [-1, 1]) {
  for (const sx of [-M.WHEEL.x, M.WHEEL.x]) {
    const name = `wheel${side > 0 ? "R" : "L"}${sx > 0 ? "f" : "b"}`;
    B.wheel("car", { cx: sx, cy: side * M.WHEEL.y, cz: M.SHAFT_Z, side, kind: "tt", name, r: M.WHEEL.r, w: M.WHEEL.w });
    B.ttMotor("car", { sx, sy: side * (M.WHEEL.y - M.WHEEL.w / 2), sz: M.SHAFT_Z, side, dir: sx < 0 ? 1 : -1, name: `${name}.motor` });
  }
}

// ---------------------------------------------------------------- the plank, with a notch at the front for the servo
const plank = { x: M.DECK.x, y: M.DECK.y, w: M.NOTCH.x - M.DECK.x, d: M.DECK.d, r: 3 };
slab("car", "deck", plank, M.DECK_Z, M.DECK_T, {}, { steps: 3, bevel: 0.5, wrap: ink, inner: L(k.sideSeam(plank, M.DECK_Z + 2, P, 3), { tone: "faint" }),
  after: L(k.lineOnTop([plank.x + 40, plank.y + 0.5], [plank.x + 40, plank.y + plank.d - 0.5], T, P), { tone: "faint" }) });
const front = M.DECK.x + M.DECK.w - M.NOTCH.x;
for (const [y0, y1] of [[M.DECK.y, M.NOTCH.y0], [M.NOTCH.y1, M.DECK.y + M.DECK.d]]) {
  slab("car", "deck.ear", { x: M.NOTCH.x, y: y0, w: front, d: y1 - y0, r: 1.5 }, M.DECK_Z, M.DECK_T, {}, { steps: 2, bevel: 0.5, wrap: ink });
}

// the SG90 hanging in the notch: body, the two tabs on the deck, the shaft boss
const sv = { ...M.SERVO, r: 1 };
slab("car", "servo.body", sv, sv.z, sv.h, {}, { steps: 2, bevel: 0.6, wrap: (s) => `<g class="mat-blue">${s}</g>`,
  after: L(k.planOutline(k.insetPlan(sv, 1.6), sv.z + sv.h, P, 2), { tone: "faint" }) });
for (const [y0, y1] of [[sv.y - 4.75, sv.y], [sv.y + sv.d, sv.y + sv.d + 4.75]]) {
  slab("car", "servo.tab", { x: sv.x, y: y0, w: sv.w, d: y1 - y0, r: 0.6 }, T, 2.5, {}, { steps: 1, wrap: (s) => `<g class="mat-blue">${s}</g>`, after: D([at([sv.x + sv.w / 2, (y0 + y1) / 2, T + 2.5])], { size: 0.5, tone: "hi" }) });
}
cyl("car", "servo.boss", M.PIVOT[0], M.PIVOT[1], 5.4, sv.z + sv.h, M.HORN_Z - sv.z - sv.h, {}, { steps: 24, wrap: (s) => `<g class="mat-blue">${s}</g>` });

// ---------------------------------------------------------------- the Uno and its shield, the servo's lead
const board = B.arduino("car", { x: -70, y: -27, z: T + 8, dir: -1, name: "uno" });
wire("car", "cable.servo", [[68, sv.y, sv.z + sv.h - 2], [68, sv.y - 9, sv.z + sv.h - 2], [30, -34, board.top + 12], [-12, -24, board.top + 12], [-24, -20, board.top + 7], [-24, -20, board.top]], 1, { touch: ["servo.body", "uno.shield"], bend: 6 });

// ---------------------------------------------------------------- the head on the servo, looking ahead
for (const p of M.headOf(k, G, P, 0)) {
  const sh = p.shape.kind === "prism" ? A.prism(p.shape.F, p.shape.poly, p.shape.s0, p.shape.s1, {}) : A.disc(p.shape.F, p.shape.s0, p.shape.s1, p.shape.r, {});
  put("head", p.name, p.centre, M.pieceSvgOf(k, p), [sh]);
}

// ---------------------------------------------------------------- assemble
const benchSvg = B.bench(M.PLATE, { label: "OBSTACLE CAR", ruler: false, labelAt: [96, 112] });
const { out, audit } = finish(B, P, ["car", "head", "wall"]);
const LABEL = "The obstacle-avoiding car on a bench, standing on a block with its wheels free: a black plank on four yellow gear motors with rubber wheels, an Arduino with a motor shield, and at the front an SG90 servo carrying an HC-SR04 ultrasonic sensor. In front of it a wall slides on a rail. When the wall is close ahead the car stops, turns the sensor left and right, and turns its wheels toward the clearer side.";
const svg = k.figureSvg({
  width: M.W,
  height: M.H,
  label: LABEL,
  className: "rv-figure",
  body: [benchSvg, out.car, `<g data-head>${out.head}</g>`, `<g data-sonar></g>`, `<g data-wall>${out.wall}</g>`],
});
await writeFigure({ name: "obstacle", svg, data: { P, wheels: B.wheels }, model: "obstacle.mjs", mount: "mountObstacleCar", fig: "Fig 4", title: "Obstacle car", hint: "move the wall", readout: "ahead clear · driving" });
audit();
