// Builds Fig 6, DementiaBot: node tools/figures/dementiabot.mjs [--audit]
import * as k from "../../src/figures/kit/iso-kit.mjs";
import * as G from "../../src/figures/kit/lathe.mjs";
import * as A from "../../src/figures/kit/audit.mjs";
import * as M from "../../src/figures/rovers/dementiabot.mjs";
import { makeBuilder, finish, writeFigure } from "./rover-lib.mjs";

const T = M.TOP;
const PX = M.FOLLOW; // the person is built where the robot, at rest, holds it
// the frame: the bench, the open lid with the robot at the back of its travel, the person at the far end
const lidReach = (dx, dz) => {
  const a = (M.OPEN * Math.PI) / 180;
  return [M.HINGE.x - M.TRAVEL + dx * Math.cos(a) - dz * Math.sin(a), M.HINGE.z + dx * Math.sin(a) + dz * Math.cos(a)];
};
const [lx, lz] = lidReach(M.LID.x1 - M.HINGE.x, 12.5);
const P = k.fitProjection([...k.boxCorners(M.PLATE, -15, 0), [lx, M.LID.y0, lz], [lx, M.LID.y1, lz], [M.PERSON.max, 0, M.HEAD.z + M.HEAD.r]], M.W, M.H, { pad: 24, azimuth: M.AZIMUTH });
const B = makeBuilder(P);
const { slab, cyl, disc, put, at, S, L, D, ink } = B;
// a lead whose end dots sit far enough out of their mounts not to sink in at this figure's scale
const lift = 0.8 / B.KS - 0.4;
function wire(layer, name, points, r, opts) {
  const route = B.wire(layer, name, points, r, { ...opts, dots: [false, false] });
  for (const [tip, from] of [[route[0], route[1]], [route[route.length - 1], route[route.length - 2]]]) B.dotAt(layer, `${name}.end`, G.add3(tip, G.mul3(G.unit3(G.sub3(from, tip)), lift)), { owner: name });
  return route;
}
const blue = (s) => `<g class="mat-blue">${s}</g>`;
const rounded = (w, h, r, n = 4) => {
  // a rounded rectangle centred on the origin, for prisms along any axis
  const out = [];
  for (const [cx, cy, a0] of [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI], [w / 2 - r, -h / 2 + r, (3 * Math.PI) / 2]]) {
    for (let i = 0; i <= n; i++) out.push([cx + Math.cos(a0 + (i / n) * (Math.PI / 2)) * r, cy + Math.sin(a0 + (i / n) * (Math.PI / 2)) * r]);
  }
  return out;
};
/** A block extruded along y from y0 to y1, its (x, z) outline a rounded rectangle. */
function across(layer, name, cx, cz, w, h, y0, y1, r, wrap = (s) => s, after = "") {
  const F = G.frameOf([cx, 0, cz], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const poly = rounded(w, h, r);
  return put(layer, name, [cx, (y0 + y1) / 2, cz], wrap(S(G.prismOf(F, poly, y0, y1, P), { tone: "mid" })) + after, [A.prism(F, poly, y0, y1, {})]);
}
/** A closed outline drawn in the plane x = const (a face toward +x), from (y, z) points. */
const onFaceX = (x, pts) => k.pathOf(pts.map(([y, z]) => at([x, y, z])), true);
const onFaceY = (y, pts) => k.pathOf(pts.map(([x, z]) => at([x, y, z])), true);
const box2 = (a0, a1, b0, b1) => [[a0, b0], [a1, b0], [a1, b1], [a0, b1]];

// ---------------------------------------------------------------- the rail the person's carriage runs on
const rail = { x: M.RAIL.x0, y: -M.RAIL.w / 2, w: M.RAIL.x1 - M.RAIL.x0, d: M.RAIL.w, r: 2 };
slab("rail", "rail", rail, 0, 8, {}, { steps: 2, bevel: 0.5, inner: L(k.sideSeam(rail, 4, P, 2), { tone: "faint" }), after: L(k.planOutline(k.insetPlan(rail, 5), 8, P, 2), { tone: "lo" }) });
for (const x of [M.RAIL.x0, M.RAIL.x1 - 6]) slab("rail", "rail.stop", { x, y: -11, w: 6, d: 22, r: 1 }, 8, 10, {}, { steps: 2, after: D([at([x + 3, 0, 18])], { size: 0.5 }) });
// a ruler beside it, so the gap can be read
const strip = { x: 128, y: 12, w: 200, d: 7, r: 1 };
slab("rail", "rail.ruler", strip, 0, 0.6, { crease: "none" }, { steps: 3, bevel: 0 });
const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
const rulerSvg = L(ticks.minor, { tone: "lo" }) + L(ticks.major, { tone: "mid" }) + D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 });

// ---------------------------------------------------------------- the person: a peg figure on a carriage (built at x = FOLLOW, moved live)
slab("person", "person.carriage", { x: PX - 18, y: -17, w: 36, d: 34, r: 3 }, M.CARRIAGE.z, M.CARRIAGE.h, {}, { steps: 3, bevel: 0.6, after: D([[-12, -11], [12, -11], [-12, 11], [12, 11]].map(([dx, dy]) => at([PX + dx, dy, M.PERSON_Z])), { size: 0.45 }) });
cyl("person", "person.base", PX, 0, M.BASE.r, M.PERSON_Z, M.BASE.h, {}, { steps: 40, wrap: (s) => `<g class="mat-wood">${s}</g>`, inner: L(k.sideArc(PX, 0, M.BASE.r, M.PERSON_Z + 1.5, P, 24), { tone: "faint" }) });
const bodyF = G.frameOf([PX, 0, M.PERSON_Z + M.BASE.h], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
// a belt and a collar, round the body
const seams = L(G.arcOf(bodyF, 48, 11.6, P) + G.arcOf(bodyF, 74, 9, P), { tone: "faint" });
put("person", "person.body", [PX, 0, M.PERSON_Z + 40], S(G.lathe(M.BODY, bodyF, P), { tone: "hi", inner: seams }), [A.lathe(bodyF, M.BODY)]);
// arms at its sides, tangent to the body
const sTop = M.PERSON_Z + M.BASE.h;
for (const side of [-1, 1]) {
  const sh = [PX + 1, side * (13.2 + 3.4 + 0.05), sTop + 63];
  const hd = [PX + 3, side * (11.4 + 3.4 + 0.05), sTop + 37];
  const len = G.len3(G.sub3(hd, sh));
  const F = G.frameAlong(sh, G.sub3(hd, sh));
  const arm = [[0, 0], [0, 2.4], [0.6, 3.1, 1], [1.6, 3.4, 1], [len - 1.6, 3.4, 1], [len - 0.6, 3.1, 1], [len, 2.4], [len, 0]];
  put("person", "person.arm", G.lerp3(sh, hd, 0.5), S(G.lathe(arm, F, P), { tone: "hi" }), [A.lathe(F, arm)]);
}
put("person", "person.head", [PX, 0, M.HEAD.z], S(G.sphereOf([PX, 0, M.HEAD.z], M.HEAD.r, P), { tone: "hi" }), [A.ball([PX, 0, M.HEAD.z], M.HEAD.r)]);

// ---------------------------------------------------------------- the robot: four TT gear motors and wheels under a white board
for (const side of [-1, 1]) {
  for (const sx of [-M.WHEEL.x, M.WHEEL.x]) {
    const name = `wheel${side > 0 ? "L" : "R"}${sx > 0 ? "f" : "b"}`;
    B.wheel("bot", { cx: sx, cy: side * M.WHEEL.y, cz: M.SHAFT_Z, side, kind: "tt", name, r: M.WHEEL.r, w: M.WHEEL.w });
    B.ttMotor("bot", { sx, sy: side * (M.WHEEL.y - M.WHEEL.w / 2), sz: M.SHAFT_Z, side, dir: sx < 0 ? 1 : -1, name: `${name}.motor` });
  }
}
slab("bot", "deck", M.DECK, M.DECK_Z, M.DECK_T, {}, { steps: 3, bevel: 0.5, inner: L(k.sideSeam(M.DECK, M.DECK_Z + 2.6, P, 3), { tone: "faint" }) });

// ---------------------------------------------------------------- the power bank, and the round speaker lying on it
const bank = M.BANK;
const bx = bank.x + bank.w; // its end face, toward the front
slab("bot", "bank", bank, T, bank.h, {}, { steps: 5, bevel: 0.8, wrap: ink, inner: L(k.sideSeam(bank, T + bank.h / 2, P, 5), { tone: "faint" }),
  after: L(onFaceX(bx + 0.01, box2(13, 25, T + 4.5, T + 9.5)) + onFaceX(bx + 0.01, box2(14.5, 23.5, T + 6.2, T + 7.8)), { tone: "lo" }) + D([0, 1, 2, 3].map((i) => at([bx + 0.01, 48 + i * 3.6, T + 11])), { size: 0.55, tone: "mid" }) });
// the USB plug in its first port, the cable to the Pi leaves its end
slab("bot", "bank.plug", { x: bx, y: -6, w: 9, d: 12, r: 1 }, T + 3.6, 6.8, {}, { steps: 2, bevel: 0.4, wrap: ink });
const SP = M.SPEAKER;
const spF = G.frameOf([SP.x, SP.y, T + bank.h], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const spProfile = [[0, 0], [0, 32.4], [1.4, 34.8, 1], [4.4, 36, 1], [23, 36, 1], [28.6, 34, 1], [31.4, 30, 1], [32, 26.5], [32, 0]];
// the fabric: a stitched ring on top and a fine weave inside it; a rubber band round its foot
const sz = M.SPEAKER_TOP;
const weave = [];
for (let y = -24; y <= 24; y += 3.2) {
  const half = Math.sqrt(25 * 25 - y * y);
  weave.push(k.lineOnTop([SP.x - half, SP.y + y], [SP.x + half, SP.y + y], sz, P));
}
put("bot", "speaker", [SP.x, SP.y, T + bank.h + SP.h / 2], `<g class="mat-dark">${S(G.lathe(spProfile, spF, P), { tone: "mid", inner: L(G.arcOf(spF, 5, 36, P), { tone: "faint" }) })}${L(k.ring(SP.x, SP.y, 25, sz, P, 72), { tone: "lo" })}${L(weave.join(""), { tone: "faint" })}${L(k.ring(SP.x, SP.y, 4.6, sz, P, 28), { tone: "lo" })}</g>`, [A.lathe(spF, spProfile)]);

// ---------------------------------------------------------------- the medicine box: white card, a label, open-topped under its lid
const BX = M.BOX;
const boxTop = T + BX.h;
const fx = BX.x + BX.w; // its front face
const inner = k.insetPlan({ x: BX.x, y: BX.y, w: BX.w, d: BX.d, r: BX.r }, BX.wall);
const mouth = k.planOutline(inner, boxTop, P, 2);
// seen only with the lid up: the far inner walls, a shelf part way down and two capsules on it
const deep = boxTop - 60;
const shelfZ = boxTop - 20;
const capsule = (x, y, a) => {
  const F = G.frameOf([x, y, shelfZ + 2.6], [Math.cos(a), Math.sin(a), 0], [0, 0, 1], [-Math.sin(a), Math.cos(a), 0]);
  const pill = [[0, 0], [0, 1.4], [0.6, 2.2, 1], [1.6, 2.6, 1], [10.4, 2.6, 1], [11.4, 2.2, 1], [12, 1.4], [12, 0]];
  return `<g class="mat-yellow">${S(G.lathe(pill, F, P), { tone: "mid", inner: L(G.arcOf(F, 6, 2.6, P), { tone: "lo" }) })}</g>`;
};
const inside = `<clipPath id="db-mouth"><path d="${mouth}"/></clipPath><g clip-path="url(#db-mouth)">` +
  `<path class="db-void" d="${mouth}"/>` +
  `<path class="db-wall" data-face="back" d="${k.pathOf([[inner.x, inner.y, boxTop], [inner.x, inner.y + inner.d, boxTop], [inner.x, inner.y + inner.d, deep], [inner.x, inner.y, deep]].map(at), true)}"/>` +
  `<path class="db-wall" data-face="side" d="${k.pathOf([[inner.x, inner.y, boxTop], [inner.x + inner.w, inner.y, boxTop], [inner.x + inner.w, inner.y, deep], [inner.x, inner.y, deep]].map(at), true)}"/>` +
  `<path class="db-shelf" d="${k.planOutline(inner, shelfZ, P, 2)}"/>` +
  capsule(inner.x + 10, inner.y + 30, -0.5) + capsule(inner.x + 24, inner.y + 14, 0.35) +
  `</g>` + L(mouth, { tone: "lo" });
// the pharmacy label on its front: a cross and three printed lines
const lab = { y0: BX.y + 8, y1: BX.y + 40, z0: T + 46, z1: T + 70 };
const labelSvg = L(onFaceX(fx + 0.01, box2(lab.y0, lab.y1, lab.z0, lab.z1)), { tone: "lo" }) +
  L(k.pathOf([at([fx + 0.01, lab.y0 + 8, lab.z1 - 4]), at([fx + 0.01, lab.y0 + 8, lab.z1 - 12])]) + k.pathOf([at([fx + 0.01, lab.y0 + 4, lab.z1 - 8]), at([fx + 0.01, lab.y0 + 12, lab.z1 - 8])]), { tone: "mid", free: true }) +
  L([[16, 28, lab.z1 - 6], [16, 26, lab.z1 - 10], [4, 26, lab.z0 + 6]].map(([a, b, z]) => k.pathOf([at([fx + 0.01, lab.y0 + a, z]), at([fx + 0.01, lab.y0 + b, z])])).join(""), { tone: "faint", free: true });
// the card's glued corner seam runs up the front, edge to edge
const seam = L(k.pathOf([at([fx + 0.01, BX.y + 3, T]), at([fx + 0.01, BX.y + 3, boxTop])]), { tone: "faint" });
slab("bot", "box", { x: BX.x, y: BX.y, w: BX.w, d: BX.d, r: BX.r }, T, BX.h, {}, { steps: 2, bevel: 0.4, after: seam + labelSvg + inside });

// ---------------------------------------------------------------- the SG90 in the box's near wall, its shaft the lid's hinge
const hz = M.HINGE.z;
const hx = M.HINGE.x;
const wy = M.WALL_Y;
across("bot", "servo.tabs", hx, hz - 5.35, 12, 32, wy, wy + 2.5, 0.8, blue, D([at([hx, wy + 2.5, hz + 8.4]), at([hx, wy + 2.5, hz - 19.1])], { size: 0.5, tone: "hi" }));
across("bot", "servo.body", hx, hz - 5.35, 12, 22.5, wy + 2.5, wy + 6.8, 1, blue);
const bossF = G.frameOf([hx, wy + 6.8, hz], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
disc("bot", "servo.boss", bossF, 0, 2.8, 5.4, {}, { wrap: blue });
disc("bot", "servo.bump", G.frameOf([hx, wy + 6.8, hz - 8], [0, 1, 0], [1, 0, 0], [0, 0, 1]), 0, 1.4, 2.6, {}, { wrap: blue });

// ---------------------------------------------------------------- the Raspberry Pi in its case
const PI = M.PI;
const piTop = T + PI.h;
const py1 = PI.y + PI.d; // its port end, toward the viewer
const vents = Array.from({ length: 9 }, (_, i) => k.planOutline({ x: PI.x + 47, y: PI.y + 8 + i * 8.4, w: 8, d: 3, r: 1.5 }, piTop, P, 2)).join("");
const gpio = { x: PI.x + 2.5, y: PI.y + 8, w: 5, d: 56, r: 1 };
// the port end: Ethernet, then two stacks of two USB ports
const usbStack = (x0, both) => onFaceY(py1 + 0.01, box2(x0, x0 + 13, T + 3, T + 19)) + k.pathOf([at([x0, py1 + 0.01, T + 11]), at([x0 + 13, py1 + 0.01, T + 11])]) + onFaceY(py1 + 0.01, box2(x0 + 2, x0 + 11, T + 13.4, T + 16.4)) + (both ? onFaceY(py1 + 0.01, box2(x0 + 2, x0 + 11, T + 5.4, T + 8.4)) : "");
const ports = onFaceY(py1 + 0.01, box2(PI.x + 4, PI.x + 20, T + 3, T + 17)) + onFaceY(py1 + 0.01, box2(PI.x + 9, PI.x + 15, T + 14, T + 17)) + usbStack(PI.x + 24, true) + usbStack(PI.x + 41, false);
slab("bot", "pi.case", PI, T, PI.h, {}, { steps: 4, bevel: 0.6, wrap: ink, inner: L(k.sideSeam(PI, T + 22, P, 4), { tone: "faint" }),
  after: L(vents + k.planOutline(gpio, piTop, P, 2) + ports, { tone: "lo" }) });
// the servo's lead plugs into the GPIO header through a connector shell
slab("bot", "pi.plug", { x: gpio.x - 0.5, y: M.WALL_Y + 1, w: 6, d: 8, r: 0.6 }, piTop, 3.4, {}, { steps: 1, wrap: ink });
// the webcam's USB plug in the lower port of the second stack
const usbPlug = { x: PI.x + 41.5, y: py1, w: 12, d: 13, r: 1 };
slab("bot", "pi.usbplug", usbPlug, T + 4.2, 6.6, {}, { steps: 2, bevel: 0.4, wrap: ink });

// ---------------------------------------------------------------- the webcam on its folding clip
const C = M.CAM;
const clipZ = piTop;
slab("bot", "cam.clip", { x: C.x - 9, y: C.y - 9, w: 18, d: 18, r: 2 }, clipZ, 2, {}, { steps: 2, bevel: 0.3, wrap: ink, after: D([at([C.x + 5.5, C.y, clipZ + 2])], { size: 0.45 }) });
slab("bot", "cam.neck", { x: C.x - 5, y: C.y - 5, w: 10, d: 10, r: 1.5 }, clipZ + 2, 2, {}, { steps: 2, wrap: ink });
const camF = G.frameOf([C.x, 0, C.z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
const camPoly = rounded(C.w, C.h, 5);
const front = C.x + C.w / 2;
const camMarks = D([-34, 34].map((dy) => at([front + 0.01, C.y + dy, C.z])), { size: 0.5, tone: "mid" }) + D([at([front + 0.01, C.y + 13, C.z + 4.5])], { size: 0.6, tone: "hi" });
put("bot", "cam.body", [C.x, C.y, C.z], ink(S(G.prismOf(camF, camPoly, C.y - C.len / 2, C.y + C.len / 2, P), { tone: "mid" })) + camMarks, [A.prism(camF, camPoly, C.y - C.len / 2, C.y + C.len / 2, {})]);
const lensF = G.frameOf([front, C.y, C.z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
disc("bot", "cam.bezel", lensF, 0, 0.8, 7, {}, { wrap: (s) => `<g class="mat-cell">${s}</g>` });
disc("bot", "cam.glass", lensF, 0.8, 1.2, 4.8, {}, { wrap: ink, after: L(G.circleOf(lensF, 1.2, 2.6, P, 28), { tone: "lo" }) });
// a strain relief at its port end, then the cable down to the Pi
const reliefF = G.frameOf([C.x, C.y + C.len / 2, C.z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
disc("bot", "cam.relief", reliefF, 0, 4, 2.6, {}, { wrap: ink });
wire("bot", "cable.cam", [[C.x, C.y + C.len / 2 + 4, C.z], [C.x, C.y + C.len / 2 + 9, C.z], [usbPlug.x + 6, py1 + 24, T + 22], [usbPlug.x + 6, py1 + 22, T + 7.5], [usbPlug.x + 6, usbPlug.y + usbPlug.d - 0.1, T + 7.5]], 1.4, { touch: ["cam.relief", "pi.usbplug"], bend: 7 });

// ---------------------------------------------------------------- the four-cell battery box, its switch and its lead into the deck
const CL = M.CELLS;
const cellTop = T + CL.h;
const sw = { x: CL.x + 8, y: CL.y + 16, w: 14, d: 6, r: 1.5 };
slab("bot", "cells", CL, T, CL.h, {}, { steps: 3, bevel: 0.6, wrap: ink, inner: L(k.sideSeam(CL, cellTop - 5, P, 3), { tone: "faint" }),
  after: L(k.planOutline(sw, cellTop, P, 2), { tone: "lo" }) + D([at([CL.x + 40, CL.y + 25, cellTop])], { size: 0.55, tone: "mid" }) });
slab("bot", "cells.switch", { x: sw.x + 2, y: sw.y + 1, w: 5, d: 4, r: 0.8 }, cellTop, 2.2, {}, { steps: 1 });
cyl("bot", "deck.grommet", 14, 54, 4, T, 1.6, {}, { steps: 24, wrap: ink });
wire("bot", "cable.cells", [[CL.x, CL.y + 12, T + 6], [CL.x - 8, CL.y + 12, T + 6], [18, 54, T + 8], [14, 54, T + 8], [14, 54, T + 1.6]], 1.1, { touch: ["cells", "deck.grommet"], bend: 5 });

// ---------------------------------------------------------------- leads: the servo's to the GPIO, the power bank's to the Pi
wire("bot", "cable.servo", [[hx, wy + 4.65, hz - 16.6], [hx, wy + 4.65, hz - 26], [26, wy + 6, T + 40], [gpio.x + 2.5, wy + 5, piTop + 12], [gpio.x + 2.5, wy + 5, piTop + 3.4]], 1.2, { touch: ["servo.body", "pi.plug"], bend: 7 });
wire("bot", "cable.power", [[bx + 9, 0, T + 7], [bx + 13, 0, T + 7], [bx + 19, 0, T + 1.1], [PI.x - 14, -14, T + 1.1], [PI.x - 4, -14, T + 9], [PI.x, -14, T + 9]], 1.1, { touch: ["bank.plug", "deck", "pi.case"], bend: 5 });

// ---------------------------------------------------------------- the lid, at rest (the page rebuilds it as the servo turns)
for (const p of M.lidOf(k, G, P, 0)) put("lid", p.name, p.centre, M.pieceSvgOf(k, p), [A.prism(p.shape.F, p.shape.poly, p.shape.s0, p.shape.s1, {})]);

// ---------------------------------------------------------------- assemble
const benchSvg = B.bench(M.PLATE, { label: "DEMENTIABOT", ruler: false });
const { out, audit } = finish(B, P, ["rail", "person", "bot", "lid"]);
const LABEL = "DementiaBot on a bench: a white board on four yellow gear motors with rubber wheels, carrying a power bank with a round speaker on it, a white medicine box whose lid an SG90 servo lifts, a Raspberry Pi in a black case with a USB webcam on top, and a battery box. In front of it a peg figure standing in for the patient rides a carriage along a rail; the robot follows it at a steady distance, and at reminder time the speaker sounds and the medicine box opens.";
const svg = k.figureSvg({
  width: M.W,
  height: M.H,
  label: LABEL,
  className: "rv-figure",
  body: [benchSvg, out.rail, rulerSvg, `<g data-bot>${out.bot}<g data-lid>${out.lid}</g><g data-voice></g></g>`, `<g data-sight></g>`, `<g data-person>${out.person}</g>`, `<g data-focus></g>`],
});
await writeFigure({ name: "dementiabot", svg, data: { P, wheels: B.wheels }, model: "dementiabot.mjs", mount: "mountDementiaBot", fig: "Fig 6", title: "DementiaBot", hint: "move the person", readout: "person · holding" });
audit();
