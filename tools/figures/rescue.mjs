// Builds Fig 5, the disaster rescue vehicle: node tools/figures/rescue.mjs [--audit]
import * as k from "../../src/figures/kit/iso-kit.mjs";
import * as G from "../../src/figures/kit/lathe.mjs";
import * as A from "../../src/figures/kit/audit.mjs";
import * as M from "../../src/figures/rovers/rescue.mjs";
import { makeBuilder, finish, writeFigure } from "./rover-lib.mjs";

const out = M.flightOf(1);
const droneTop = M.DOCK[2] + 26;
const span = M.DRONE.arm / Math.SQRT2 + M.DRONE.prop;
const P = k.fitProjection([...k.boxCorners(M.PLATE, -15, 0), ...[-1, 1].flatMap((sx) => [-1, 1].map((sy) => [M.DOCK[0] + out[0] + sx * span, sy * span, droneTop + out[2]])), [M.ARM.x, 0, M.ARM.pivot + M.ARM.l1 + 8]], M.W, M.H, { pad: 24, azimuth: M.AZIMUTH });
const B = makeBuilder(P);
const { slab, cyl, disc, put, at, S, L, D, ink } = B;
const blue = (s) => `<g class="mat-blue">${s}</g>`;
const piece = (layer, p) => {
  const sh = p.shape.kind === "prism" ? A.prism(p.shape.F, p.shape.poly, p.shape.s0, p.shape.s1, {}) : A.disc(p.shape.F, p.shape.s0, p.shape.s1, p.shape.r, {});
  put(layer, p.name, p.centre, M.pieceSvgOf(k, p), [sh]);
};

// ---------------------------------------------------------------- chassis: four pods of two wheels, a motor each
for (const side of [-1, 1]) {
  for (const x of M.WHEEL.xs) {
    const name = `wheel${side > 0 ? "R" : "L"}${x > 0 ? "f" : "b"}${Math.abs(x) > 80 ? "o" : "i"}`;
    B.wheel("base", { cx: x, cy: side * M.WHEEL.y, cz: M.WHEEL.r, side, kind: "tt", name, r: M.WHEEL.r, w: M.WHEEL.w });
    B.n20("base", { sx: x, sy: side * (M.WHEEL.y - M.WHEEL.w / 2), sz: M.WHEEL.r, side, name: `${name}.motor` });
  }
}
slab("base", "chassis", M.CHASSIS, M.CHASSIS_Z, M.CHASSIS_T, {}, { steps: 3, bevel: 0.6, wrap: ink, inner: L(k.sideSeam(M.CHASSIS, M.CHASSIS_Z + 2.5, P, 3), { tone: "faint" }),
  after: D([[-128, -51], [-128, 51], [128, -51], [128, 51], [-66, -51], [66, 51], [-66, 51], [66, -51]].map(([x, y]) => at([x, y, M.DECK])), { size: 0.5 }) });

// the arm's turntable and shoulder servo behind the cabin
cyl("base", "arm.turntable", M.ARM.x, 0, 12, M.DECK, M.ARM.base, {}, { steps: 32, wrap: ink, inner: L(k.sideArc(M.ARM.x, 0, 12, M.DECK + 4, P, 20), { tone: "faint" }) });
const [sw, sd, sh] = M.ARM.servo;
slab("base", "arm.servo", { x: M.ARM.x - sw / 2, y: -sd / 2, w: sw, d: sd, r: 1.5 }, M.DECK + M.ARM.base, sh, {}, { steps: 2, bevel: 0.5, wrap: ink });
for (const p of M.armOf(k, G, P, 0).pieces) piece("arm", p);

// ---------------------------------------------------------------- the cabin: sloped front, window, camera, roof
const C = M.CABIN;
const side = G.frameOf([0, -C.y, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
const profile = [[C.x0, M.DECK], [C.x1, M.DECK], [C.x1 - C.slope, C.top], [C.x0, C.top]];
const onSlope = (t, y) => [C.x1 - C.slope * t, y, M.DECK + (C.top - M.DECK) * t];
const pane = [onSlope(0.36, -31), onSlope(0.36, 31), onSlope(0.84, 31), onSlope(0.84, -31)];
const inset = [onSlope(0.4, -27), onSlope(0.4, 27), onSlope(0.8, 27), onSlope(0.8, -27)];
const glints = [[0.5, -18, 0.68, -8], [0.5, -10, 0.6, -5]].map(([t0, y0, t1, y1]) => k.pathOf([at(onSlope(t0, y0)), at(onSlope(t1, y1))])).join("");
// two panel seams on the near side
const panel = [-40, 30].map((x) => k.pathOf([at([x, C.y, M.DECK]), at([x, C.y, C.top])])).join("");
put("cabin", "cabin", [0, 0, (M.DECK + C.top) / 2], S(G.prismOf(side, profile, 0, C.y * 2, P), { tone: "mid", inner: L(k.pathOf(pane.map(at), true), { tone: "mid" }) + L(k.pathOf(inset.map(at), true), { tone: "faint" }) + L(glints, { tone: "faint", free: true }) + L(panel, { tone: "faint" }) }), [A.prism(side, profile, 0, C.y * 2, {})]);
// the camera, on the slope over the window
const normal = G.unit3([C.top - M.DECK, 0, C.slope]);
const lens = G.frameOf(onSlope(0.9, 0), normal, [0, 1, 0], G.cross3(normal, [0, 1, 0]));
disc("cabin", "camera", lens, 0, 3, 6, {}, { wrap: ink, after: L(G.circleOf(lens, 3, 3.6, P, 24), { tone: "lo" }) + D([at(G.pointOf(lens, 3, 0, 0))], { size: 0.7, tone: "hi" }) });
const roof = { x: C.x0 - 2, y: -C.y - 2, w: C.x1 - C.slope - C.x0 + 4, d: C.y * 2 + 4, r: 2 };
slab("cabin", "roof", roof, C.top, M.ROOF_T, {}, { steps: 2, bevel: 0.5 });
slab("cabin", "pad", M.PAD, M.ROOF, M.PAD_T, {}, { steps: 2, bevel: 0.2, wrap: ink, after: L(k.ring(M.DOCK[0], M.DOCK[1], 18, M.ROOF + M.PAD_T, P, 48), { tone: "lo" }) });
// the fire nozzle on the roof's far front corner
cyl("cabin", "nozzle.base", 50, -32, 4.5, M.ROOF, 9, {}, { steps: 20, wrap: blue });
disc("cabin", "nozzle.tip", G.frameOf([54.5, -32, M.ROOF + 6], [1, 0, 0], [0, 1, 0], [0, 0, 1]), 0, 9, 2.4, {}, { wrap: blue, after: L(G.circleOf(G.frameOf([54.5, -32, M.ROOF + 6], [1, 0, 0], [0, 1, 0], [0, 0, 1]), 9, 1.2, P, 16), { tone: "mid" }) });

// ---------------------------------------------------------------- the drone, docked on the pad
const [dx, dy, dz] = M.DOCK;
const Dn = M.DRONE;
const white = (s) => `<g class="mat-cell">${s}</g>`;
for (const [px, py] of M.PODS) {
  cyl("drone", "drone.leg", px, py, 1.6, dz, Dn.leg, {}, { steps: 12, wrap: white });
  cyl("drone", "drone.motor", px, py, Dn.pod, dz + Dn.leg, Dn.podH, {}, { steps: 24, wrap: ink, inner: L(k.sideArc(px, py, Dn.pod, dz + Dn.leg + 3, P, 16), { tone: "faint" }) });
  cyl("drone", "drone.hub", px, py, 2, dz + Dn.leg + Dn.podH, 1.6, {}, { steps: 12 });
  // an arm from the body's corner to the pod
  const dir = G.unit3([px - dx, py - dy, 0]);
  const from = [dx + dir[0] * 24.6, dy + dir[1] * 24.6, dz + 12];
  const F = G.frameOf(from, dir, [0, 0, 1], G.cross3(dir, [0, 0, 1]));
  const poly = [[-2, -3], [2, -3], [2, 3], [-2, 3]];
  put("drone", "drone.arm", G.add3(from, G.mul3(dir, 10)), white(S(G.prismOf(F, poly, 0, 44.4 - 24.6, P), { tone: "mid" })), [A.prism(F, poly, 0, 44.4 - 24.6, {})]);
}
const body = { x: dx - Dn.body / 2, y: dy - Dn.body / 2, w: Dn.body, d: Dn.body, r: 8 };
slab("drone", "drone.body", body, dz + 8, Dn.bodyH, {}, { steps: 3, bevel: 0.8, wrap: white, inner: L(k.sideSeam(body, dz + 13, P, 3), { tone: "faint" }) });
slab("drone", "drone.canopy", k.insetPlan(body, 7), dz + 8 + Dn.bodyH, 4, {}, { steps: 3, bevel: 1, wrap: white });

// ---------------------------------------------------------------- assemble
const benchSvg = B.bench(M.PLATE, { label: "RESCUE VEHICLE", ruler: false, labelAt: [-23, 79] });
const { out: o, audit } = finish(B, P, ["base", "arm", "cabin", "drone"]);
const LABEL = "The multi-utility disaster rescue vehicle on a bench: a cabin with a sloped front, a window and a camera, on a chassis with eight small wheels on gear motors. A fire nozzle stands on the roof beside a pad where a drone is docked; a folding robotic arm stands behind the cabin. The drone lifts off the pad while the arm unfolds, then both come back.";
const svg = k.figureSvg({
  width: M.W,
  height: M.H,
  label: LABEL,
  className: "rv-figure",
  body: [benchSvg, o.base, `<g data-arm>${o.arm}</g>`, o.cabin, `<g data-trail></g>`, `<g data-drone>${o.drone}<g data-props>${M.propsOf(k, G, P, 0, 0)}</g></g>`],
});
await writeFigure({ name: "rescue", svg, data: { P, wheels: B.wheels }, model: "rescue.mjs", mount: "mountRescue", fig: "Fig 5", title: "Rescue vehicle", hint: "hover to launch the drone", readout: "drone docked · arm folded" });
audit();
