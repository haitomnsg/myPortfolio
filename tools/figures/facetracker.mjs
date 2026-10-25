// Builds Fig 3, the face tracker: node tools/figures/facetracker.mjs [--audit]
import * as k from "../../src/figures/kit/iso-kit.mjs";
import * as G from "../../src/figures/kit/lathe.mjs";
import * as A from "../../src/figures/kit/audit.mjs";
import * as M from "../../src/figures/rovers/facetracker.mjs";
import { makeBuilder, finish, writeFigure } from "./rover-lib.mjs";

const top = M.SIGN.z + M.SIGN.r + 8;
const P = k.fitProjection([...k.boxCorners(M.PLATE, -15, 0), [M.RAIL.x, -M.SIGN_RANGE - M.SIGN.r, top], [M.RAIL.x, M.SIGN_RANGE + M.SIGN.r, top]], M.W, M.H, { pad: 24, azimuth: M.AZIMUTH });
const B = makeBuilder(P);
const { slab, cyl, disc, put, wire, at, S, L, D, ink } = B;
const T = M.TOP;

// ---------------------------------------------------------------- the rail and the sign it carries
const rail = { x: M.RAIL.x, y: M.RAIL.y0, w: M.RAIL.w, d: M.RAIL.y1 - M.RAIL.y0, r: 2 };
slab("rail", "rail", rail, 0, 8, {}, { steps: 2, bevel: 0.5, inner: L(k.sideSeam(rail, 4, P, 2), { tone: "faint" }), after: L(k.planOutline(k.insetPlan(rail, 5), 8, P, 2), { tone: "lo" }) });
for (const y of [M.RAIL.y0, M.RAIL.y1 - 6]) slab("rail", "rail.stop", { x: M.RAIL.x - 2, y, w: M.RAIL.w + 4, d: 6, r: 1 }, 8, 10, {}, { steps: 2, after: D([at([M.RAIL.x + M.RAIL.w / 2, y + 3, 18])], { size: 0.5 }) });

// the carriage, its post and a round traffic sign facing the rover (built at y = 0, moved live)
const cx = M.RAIL.x + M.RAIL.w / 2;
slab("sign", "sign.carriage", { x: cx - 17, y: -18, w: 34, d: 36, r: 3 }, 8, 12, {}, { steps: 3, bevel: 0.6, after: D([[-11, -12], [11, -12], [-11, 12], [11, 12]].map(([dx, dy]) => at([cx + dx, dy, 20])), { size: 0.45 }) });
cyl("sign", "sign.post", cx, 0, M.SIGN.post, 20, M.SIGN.z - M.SIGN.r - 20, {}, { steps: 16, inner: L(k.sideArc(cx, 0, M.SIGN.post, 50, P, 10), { tone: "faint" }) });
const face = G.frameOf([cx, 0, M.SIGN.z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
const pic = () => {
  // the sign: a ring, and a "keep right" arrow printed on it
  const p = (y, z) => at([cx + 3.01, y, M.SIGN.z + z]);
  return L(k.pathOf([p(8, -9), p(8, 4), p(-6, 4)]) + k.pathOf([p(-1, 9), p(-6, 4), p(-1, -1)]), { tone: "hi", free: true }) + L(G.circleOf(face, 3, M.SIGN.r - 3, P, 48), { tone: "mid" });
};
put("sign", "sign.face", [cx + 1.5, 0, M.SIGN.z], S(G.disc(0, 3, M.SIGN.r, face, P), { tone: "hi" }) + pic(), [A.disc(face, 0, 3, M.SIGN.r, {})]);

// ---------------------------------------------------------------- the rover (its own frame, moved live along y)
for (const side of [-1, 1]) {
  for (const sx of [-M.WHEEL.x, M.WHEEL.x]) {
    const name = `wheel${side > 0 ? "R" : "L"}${sx < 0 ? "f" : "b"}`;
    B.wheel("rover", { cx: sx, cy: side * M.WHEEL.y, cz: M.WHEEL.r, side, kind: "mecanum", name, r: M.WHEEL.r, w: M.WHEEL.w, hand: sx < 0 ? 1 : -1 });
    const shaftY = side * (M.WHEEL.y - M.WHEEL.w / 2);
    B.ttMotor("rover", { sx, sy: shaftY, sz: M.WHEEL.r, side, dir: sx < 0 ? 1 : -1, name: `${name}.motor` });
  }
}
slab("rover", "deck", M.DECK, M.DECK_Z, M.DECK_T, {}, { steps: 3, bevel: 0.6, wrap: (s) => `<g class="mat-wood">${s}</g>`,
  inner: L(k.sideSeam(M.DECK, M.DECK_Z + 2, P, 3), { tone: "faint" }),
  after: L([-46, -18, 12, 44].map((y) => k.lineOnTop([M.DECK.x, y + 0.5], [M.DECK.x + M.DECK.w, y + 0.5], T, P)).join(""), { tone: "faint" }) + D(k.corners(M.DECK, 5).map(([x, y]) => at([x, y, T])), { size: 0.5 }) });
const board = B.arduino("rover", { x: -34, y: -27, z: T + 8, dir: -1, name: "uno" });
const holder = B.cells("rover", { x: 35, y: -38.5, z: T, along: "y", name: "cells" });

// the MU vision sensor on a bracket at the front, facing the sign; you see its back
const sx = M.SENSOR.x;
slab("rover", "bracket.foot", { x: sx + 1.6, y: -12, w: 20, d: 24, r: 1 }, T, 2, {}, { steps: 2, wrap: ink, after: D([at([sx + 14, -6, T + 2]), at([sx + 14, 6, T + 2])], { size: 0.5 }) });
slab("rover", "bracket.post", { x: sx + 1.6, y: -9, w: 5, d: 18, r: 1 }, T + 2, M.SENSOR.z0 + 28 - T - 2, {}, { steps: 2, wrap: ink });
const mu = { x: sx, y: -M.SENSOR.size / 2, w: 1.6, d: M.SENSOR.size, r: 3 };
slab("rover", "sensor.board", mu, M.SENSOR.z0, M.SENSOR.size, {}, { steps: 3, bevel: 0.2, wrap: ink, after: D([[-15, 6], [15, 6], [-15, 34], [15, 34]].map(([y, z]) => at([sx + 1.6, y, M.SENSOR.z0 + z])), { size: 0.55, tone: "mid" }) + L([[-15, 6], [15, 6], [-15, 34], [15, 34]].map(([y, z]) => k.pathOf(Array.from({ length: 12 }, (_, i) => at([sx + 1.6, y + Math.cos((i / 12) * Math.PI * 2) * 2.4, M.SENSOR.z0 + z + Math.sin((i / 12) * Math.PI * 2) * 2.4])), true)).join(""), { tone: "lo" }) });
slab("rover", "sensor.plug", { x: sx + 1.6, y: 6, w: 4.4, d: 10, r: 0.6 }, M.SENSOR.z0 + 30, 5, {}, { steps: 1 });
// its cable to the shield, the cells' leads to a screw terminal
wire("rover", "cable.sensor", [[sx + 6, 11, M.SENSOR.z0 + 32.5], [sx + 20, 11, M.SENSOR.z0 + 32.5], [-14, 18, board.top + 13], [-10, 18, board.top + 9], [-10, 18, board.top]], 1.1, { touch: ["uno.shield", "sensor.plug"], bend: 6 });
const term = board.terminals[4];
// the cells' leads leave the top of a clip and run into the side of a screw terminal
wire("rover", "cable.cells", [[holder.x + 1.8, holder.y + 1, holder.top], [holder.x + 1.8, holder.y + 1, holder.top + 7], [term[0] + 12, term[1], term[2] - 4], [term[0] + 4, term[1], term[2] - 4]], 0.8, { touch: ["cells.clip", "uno.terminal"], bend: 5 });

// ---------------------------------------------------------------- assemble
// no ruler: the rover's wheels roll right to the bench's near edge
const benchSvg = B.bench(M.PLATE, { label: "FACE TRACKER", ruler: false });
const { out, audit } = finish(B, P, ["rail", "sign", "rover"]);
const LABEL = "The face and human tracking robot on a bench: a plywood deck on four mecanum wheels with yellow gear motors, an Arduino with a motor shield, two cells, and an MU vision sensor on a bracket at the front. In front of it a round traffic sign stands on a carriage that runs along a rail; the rover strafes sideways on its mecanum wheels to keep the sign centred.";
const svg = k.figureSvg({
  width: M.W,
  height: M.H,
  label: LABEL,
  className: "rv-figure",
  body: [benchSvg, out.rail, `<g data-sign>${out.sign}</g>`, `<g data-sight></g>`, `<g data-rover>${out.rover}</g>`],
});
await writeFigure({ name: "facetracker", svg, data: { P, wheels: B.wheels }, model: "facetracker.mjs", mount: "mountFaceTracker", fig: "Fig 3", title: "Face tracker", hint: "move the sign", readout: "sign · centred" });
audit();
