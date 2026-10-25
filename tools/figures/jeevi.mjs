// Builds the JeevI figure: node tools/figures/jeevi.mjs [--audit]
// Writes public/figures/jeevi.svg (the static art the site fetches), src/figures/jeevi/data.json and
// the standalone preview tools/figures/out/jeevi.html.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../src/figures/kit/iso-kit.mjs";
import * as G from "../../src/figures/kit/lathe.mjs";
import * as A from "../../src/figures/kit/audit.mjs";
import * as M from "../../src/figures/jeevi/model.mjs";
import { makeJeevi } from "../../src/figures/jeevi/parts.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FIG = join(ROOT, "src", "figures", "jeevi");

const RAIL = 26;
const FRAME = { x: M.FRAME_X[0], y: -(M.BELT_W / 2 + 8 + RAIL), w: M.FRAME_X[1] - M.FRAME_X[0], d: (M.BELT_W / 2 + 8 + RAIL) * 2, r: 6 };
const FLOOR = -92;
const P = k.fitProjection([...k.boxCorners(FRAME, FLOOR, 104), [0, 0, M.STAND + 60], [0, 0, M.STAND + 60]], M.W, M.H, { pad: 22, azimuth: M.AZIMUTH });
const V = G.viewOf(P);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const ink = (svg) => `<g class="mat-dark">${svg}</g>`;
const J = makeJeevi(k, G, M, P);

// ---------------------------------------------------------------- recorder
const R = A.recorder(P);
const layerOf = new Map();
const shapeOf = (s, offset) => {
  const meta = { name: s.name, ground: s.ground, owner: s.owner, seated: s.seated };
  if (s.cut) meta.cut = Array.isArray(s.cut) ? s.cut.map((c) => shapeOf(c, offset)) : shapeOf(s.cut, offset);
  let shape;
  if (s.kind === "prism") shape = A.prism(s.F, s.poly, s.s0, s.s1, meta);
  else if (s.kind === "disc") shape = A.disc(s.F, s.s0, s.s1, s.r, meta);
  else if (s.kind === "slab") shape = A.slab(s.plan, s.z, s.h, meta, 2);
  else if (s.kind === "cylinder") shape = A.cylinder(s.cx, s.cy, s.r, s.z, s.h, meta);
  else if (s.kind === "ball") shape = A.ball(s.c, s.r, meta);
  return offset ? A.moved(shape, offset) : shape;
};
function put(layer, name, centre, svg, shapes = [], { bias = 0, offset } = {}) {
  R.put({ name: R.nameFor(name), at: centre, bias, svg, shapes: shapes.map((s) => R.solid(shapeOf({ name, ...s }, offset))) });
  const item = R.items[R.items.length - 1];
  layerOf.set(item, layer);
  return item;
}
const slab = (layer, name, plan, z, h, style = {}, o = {}) =>
  put(layer, name, [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2], (o.wrap ?? ((x) => x))(S(k.slabOf(plan, z, h, P, o.steps ?? 3, o.bevel ?? 0.6), { tone: "mid", ...style, inner: o.inner ?? "" }) + (o.after ?? "")), [{ kind: "slab", plan, z, h, ground: o.ground }], o);
const cyl = (layer, name, cx, cy, r, z, h, style = {}, o = {}) =>
  put(layer, name, [cx, cy, z + h / 2], (o.wrap ?? ((x) => x))(S(k.cylinder(cx, cy, r, z, h, P, o.steps ?? 28), { tone: "mid", ...style, inner: o.inner ?? "" }) + (o.after ?? "")), [{ kind: "cylinder", cx, cy, r, z, h, ground: o.ground }], o);

// ---------------------------------------------------------------- the treadmill
const RAIL_TOP = 12;
const HOOD = { rear: [M.FRAME_X[0], M.SPAN[0], 76], front: [M.SPAN[1], M.FRAME_X[1], 104] };
const SLOT = 45; // the hoods open this high over the belt, enough for the tallest bump
const yIn = M.BELT_W / 2 + 8;
const yOut = yIn + RAIL;

function treadmill() {
  // legs and rubber feet under the rails, a cross beam at each end
  for (const x of [M.FRAME_X[0] + 40, M.FRAME_X[1] - 40]) {
    for (const y of [-yIn - RAIL / 2, yIn + RAIL / 2]) {
      cyl("before", "stand.foot", x, y, 16, FLOOR, 8, { tone: "lo" }, { steps: 32, ground: true });
      cyl("before", "frame.leg", x, y, 10, FLOOR + 8, -40 - FLOOR - 8, {}, { steps: 24, inner: L(k.sideArc(x, y, 10, -60, P, 16), { tone: "faint" }) });
    }
    slab("before", "frame.beam", { x: x - 14, y: -yIn, w: 28, d: yIn * 2, r: 2 }, -56, 16, {}, { steps: 2 });
  }
  // the rails: the far one behind the belt, the near one in front of everything
  for (const [layer, y, x0, x1, name] of [["before", -yOut, M.FRAME_X[0], M.FRAME_X[1], "frame.rail.far"], ["before", yIn, M.FRAME_X[0], M.SPAN[0], "frame.rail.near.rear"], ["after", yIn, M.SPAN[0], M.FRAME_X[1], "frame.rail.near"]]) {
    const plan = { x: x0, y, w: x1 - x0, d: RAIL, r: x0 === M.FRAME_X[0] || x1 === M.FRAME_X[1] ? 3 : 0 };
    const seam = L(k.sideSeam(plan, -14, P, 3), { tone: "faint" });
    let after = "";
    if (name === "frame.rail.near") {
      // a ruler on the near rail: belt travel reads against it, 10 mm ticks, every 50th major
      const strip = { x: M.SPAN[0] + 6, y: y + 6, w: M.SPAN[1] - M.SPAN[0] - 12, d: 9, r: 1 };
      const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 10, 5, strip.y + 0.8, RAIL_TOP + 0.6, [3, 5.4], P);
      after = S(k.slabOf(strip, RAIL_TOP, 0.6, P, 3), { tone: "lo", crease: "none" }) + L(t.minor, { tone: "lo" }) + L(t.major, { tone: "mid" }) + D([at([strip.x + 2, strip.y + 4.5, RAIL_TOP + 0.6]), at([strip.x + strip.w - 2, strip.y + 4.5, RAIL_TOP + 0.6])], { size: 0.45 });
    }
    slab(layer, name, plan, -40, RAIL_TOP + 40, {}, { steps: 3, bevel: 0.8, inner: seam, after });
  }
  // the bed under the belt, and the belt itself (rubber), between the hoods
  slab("before", "frame.bed", { x: M.FRAME_X[0] + 4, y: -yIn, w: M.FRAME_X[1] - M.FRAME_X[0] - 8, d: yIn * 2, r: 0 }, -40, 22, { tone: "lo" }, { steps: 1, wrap: (x) => `<g class="mat-cavity">${x}</g>` });
  const belt = { x: M.SPAN[0], y: -M.BELT_W / 2, w: M.SPAN[1] - M.SPAN[0], d: M.BELT_W, r: 0 };
  slab("before", "belt", belt, -18, 18, { tone: "mid" }, { steps: 1, bevel: 0, wrap: ink });

  // hoods over the rollers: a cover on the rails, open 45 mm over the belt between them
  for (const [name, [x0, x1, top]] of Object.entries(HOOD)) {
    const layer = name === "rear" ? "before" : "after";
    const cover = { x: x0, y: -yOut, w: x1 - x0, d: yOut * 2, r: 5 };
    let after = "";
    if (name === "front") {
      // vents on the motor hood's top, closed slots
      after += L(Array.from({ length: 6 }, (_, i) => k.planOutline({ x: x0 + 22 + i * 12, y: -130, w: 5, d: 260, r: 2.5 }, top, P, 2)).join(""), { tone: "lo" });
    }
    slab(layer, `hood.${name}`, cover, RAIL_TOP + SLOT, top - RAIL_TOP - SLOT, {}, { steps: 4, bevel: 1, inner: L(k.sideSeam(cover, RAIL_TOP + SLOT + 6, P, 4), { tone: "faint" }), after });
    for (const y of [-yOut, yIn]) slab(layer, `hood.${name}.cheek`, { x: x0, y, w: x1 - x0, d: RAIL, r: 3 }, RAIL_TOP, SLOT, {}, { steps: 3, bevel: 0.6 });
    if (name === "rear") {
      // inside the opening: the dark of the hood, behind the belt as it goes round the roller
      const back = x0 + 30;
      const c = (y, z) => at([back, y, z]);
      const q = (pts) => k.pathOf(pts, true);
      put("before", "hood.rear.inside", [back, 0, 20],
        `<g class="mat-cavity"><path class="iso-fill" d="${q([c(-yIn, -18), c(yIn, -18), c(yIn, RAIL_TOP + SLOT), c(-yIn, RAIL_TOP + SLOT)])}"/><path class="iso-shade" data-shade="0" d="${q([c(-yIn, -18), c(yIn, -18), c(yIn, RAIL_TOP + SLOT), c(-yIn, RAIL_TOP + SLOT)])}"/></g>`, [{ kind: "slab", plan: { x: back - 1, y: -yIn, w: 1, d: yIn * 2, r: 0 }, z: -18, h: RAIL_TOP + SLOT + 18 }], { bias: -400 });
    }
  }
}

// ---------------------------------------------------------------- the console on the front hood's near side
// three push buttons choose the terrain (their caps carry a pictogram each); a dial reads belt speed
const FACE_Y = yOut;
const CONSOLE = { buttons: [[304, 74], [328, 74], [352, 74]], dial: [384, 76, 15] };
function consoleSvg() {
  const out = [];
  const F = (x, z, s = 0) => G.frameOf([x, FACE_Y + s, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  // a recessed panel plate
  const plate = G.prismOf(G.frameOf([343, FACE_Y, 75], [0, 1, 0], [1, 0, 0], [0, 0, 1]), J.rect(102, 36, 5, 4), 0, 1.4, P);
  out.push(S(plate, { tone: "mid" }));
  out.push(D([[296, 61], [390, 61], [296, 89], [390, 89]].map(([x, z]) => at([x, FACE_Y + 1.4, z])), { size: 0.45 }));
  CONSOLE.buttons.forEach(([x, z], i) => {
    out.push(S(G.disc(1.4, 3.2, 10.5, F(x, z), P), { tone: "mid" }));
    out.push(`<g data-button="${i}" class="tb-button">${S(G.disc(3.2, 7, 8, F(x, z), P), { tone: "hi" })}${L(buttonMark(i, x, z, FACE_Y + 7), { tone: "mid", free: true })}</g>`);
  });
  const [dx, dz, dr] = CONSOLE.dial;
  out.push(S(G.disc(1.4, 4, dr, F(dx, dz), P), { tone: "mid" }));
  out.push(S(G.disc(4, 4.6, dr - 2.6, F(dx, dz), P), { tone: "hi", crease: "none" }));
  const dial = F(dx, dz);
  const ticks = [];
  for (let i = 0; i <= 20; i++) {
    const a = Math.PI * 1.25 - (i / 20) * Math.PI * 1.5;
    const r0 = dr - 3.2;
    const r1 = r0 - (i % 5 === 0 ? 4 : 2.2);
    const p = (r) => at([dx + Math.cos(a) * r, FACE_Y + 4.6, dz + Math.sin(a) * r]);
    ticks.push({ d: k.pathOf([p(r0), p(r1)]), major: i % 5 === 0 });
  }
  out.push(L(ticks.filter((t) => !t.major).map((t) => t.d).join(""), { tone: "lo", free: "end" }));
  out.push(L(ticks.filter((t) => t.major).map((t) => t.d).join(""), { tone: "mid", free: "end" }));
  out.push(L(G.circleOf(dial, 4.6, dr - 3.2, P, 48), { tone: "lo" }));
  out.push(`<path class="iso-line" data-tone="lit" data-needle data-free="end" style="stroke-width:1.1" d="${needleD(0)}"/>`);
  out.push(D([at([dx, FACE_Y + 4.8, dz])], { size: 1.1, tone: "hi" }));
  return out.join("");
}
// 0 to 1 of full scale (1 m/s)
function needleD(share) {
  const [dx, dz, dr] = CONSOLE.dial;
  const a = Math.PI * 1.25 - share * Math.PI * 1.5;
  return k.pathOf([at([dx, FACE_Y + 4.8, dz]), at([dx + Math.cos(a) * (dr - 6), FACE_Y + 4.8, dz + Math.sin(a) * (dr - 6)])]);
}
// a pictogram on each cap: a level line, a heightfield, two blocks
function buttonMark(i, x, z, y) {
  const p = (dx, dz) => at([x + dx, y, z + dz]);
  if (i === 0) return k.pathOf([p(-4.4, -1), p(4.4, -1)]);
  if (i === 1) return k.pathOf([p(-4.6, -2), p(-4.6, 0.6), p(-1.6, 0.6), p(-1.6, -0.6), p(1.4, -0.6), p(1.4, 2.2), p(4.6, 2.2), p(4.6, -2)]);
  return k.pathOf([p(-4.6, -2), p(-4.6, 1.4), p(-0.6, 1.4), p(-0.6, -2)]) + k.pathOf([p(0.8, -2), p(0.8, 0), p(4.6, 0), p(4.6, -2)]);
}

// ---------------------------------------------------------------- the robot and terrain at rest
const B0 = 820; // belt travel for the still: the rough section coming in under the front legs
function restPose(b) {
  const feet = M.LEGS.map((leg) => {
    const [fx, fy] = M.homeOf(leg);
    return [fx, fy, M.heightAt(fx, fy, b)];
  });
  const zb = M.STAND + feet.reduce((s, f) => s + f[2], 0) / 4;
  return { zb, feet: feet.map(([x, y, h]) => [x, y, h - zb]) };
}

treadmill();
const rest = restPose(B0);
const bodyItems = J.body();
const liftSvg = (svg) => `<g transform="${k.translateAlong(P, [0, 0, rest.zb])}">${svg}</g>`;
const bodyRecorded = bodyItems.map((it, i) => put("body", it.shapes[0]?.name ?? `body.${i}`, [0, 0, rest.zb], liftSvg(it.svg), it.shapes, { offset: [0, 0, rest.zb] }));
bodyRecorded.forEach((item, i) => { item.plain = bodyItems[i].svg; });
const legGroups = M.LEGS.map((leg, i) => {
  const ik = M.legIK(leg, rest.feet[i]);
  const parts = J.leg(leg, ik);
  const rec = (name, list) => list.map((it) => Object.assign(put(name, it.shapes[0]?.name ?? `leg${i}.${name}`, [0, 0, 0], liftSvg(J.pieceSvg(it)), it.shapes, { offset: [0, 0, rest.zb] }), { plain: J.pieceSvg(it) }));
  const anchorKey = G.dot3(G.add3(parts.anchor.upper, [0, 0, rest.zb]), V);
  const behindBody = anchorKey < G.dot3([0, 0, rest.zb], V);
  return {
    under: rec("under", parts.under),
    upper: behindBody ? rec("upper", parts.upper) : [],
    over: behindBody ? rec("over", parts.over) : [],
    joined: behindBody ? [] : rec("upper", parts.joined),
    lower: rec("lower", parts.lower),
    anchor: parts.anchor,
  };
});
const terrainItems = J.terrain(B0).map((it) => { const item = put("terrain", "terrain", it.centre, it.svg, it.shapes); item.centre = it.centre; return item; });

A.settle(R, P);

// The page draws: the "before" layer by settled keys; then one sorted list of terrain blocks, the
// body (one group) and each leg's upper and lower halves (each a group) by their anchors' depths; then
// the "after" layer. Give the audit exactly that order.
const depth = (p) => G.dot3(p, V);
const bodyKey = depth([0, 0, rest.zb]);
const ordered = (list) => [...list].sort((a, b) => a.key - b.key);
const before = ordered(R.items.filter((i) => layerOf.get(i) === "before"));
const after = ordered(R.items.filter((i) => layerOf.get(i) === "after"));
const bodyOrder = ordered(bodyRecorded);
const groupSets = legGroups.map((g) => ({
  ...Object.fromEntries(["under", "upper", "over", "lower"].map((name) => [name, { key: depth(G.add3(g.anchor[name], [0, 0, rest.zb])), items: g[name] }])),
  joined: { key: depth(G.add3(g.anchor.upper, [0, 0, rest.zb])), items: g.joined },
}));
const robot = J.order(groupSets, bodyKey);
// give the audit the page's exact order: before, terrain, behind, body, front, after
let n = 0;
const seq = (list) => list.forEach((item) => { item.key = n++; });
seq(before);
seq(terrainItems);
robot.behind.forEach((g) => seq(g.items));
seq(bodyOrder);
robot.front.forEach((g) => seq(g.items));
seq(after);
const bodySvg = bodyOrder.map((i) => i.plain).join("");
// legs are built in the body's frame, so each group rides the body's lift
const lift = (svg) => `<g transform="${k.translateAlong(P, [0, 0, rest.zb])}">${svg}</g>`;
const groupSvg = (g) => lift(g.items.map((i) => i.plain).join(""));
const behindSvg = robot.behind.map(groupSvg).join("");
const frontSvg = robot.front.map(groupSvg).join("");
const svg = k.figureSvg({
  width: M.W,
  height: M.H,
  label: "JeevI-II, a 3D-printed four-legged robot with twelve servos, trotting on a treadmill test bench. The belt carries the three terrains its walking policy was trained on in NVIDIA Isaac Lab: flat, a rough heightfield and low boxes. Three buttons on the console choose the terrain; the readout gives the converged reward for the one under the robot.",
  className: "jv-figure",
  body: [
    `<path class="iso-halo" d="${k.haloOf(FRAME, FLOOR, 4, P)}"/>`,
    before.map((i) => i.svg).join(""),
    `<path class="iso-line jv-belt" data-tone="lo" data-belt d="${J.beltLines(B0)}"/>`,
    `<g data-terrain>${J.terrain(B0, "whole").map((i) => i.svg).join("")}</g><g data-terrain-cut>${J.terrain(B0, "cut").map((i) => i.svg).join("")}</g>`,
    `<g data-behind>${behindSvg}</g><g data-body transform="${k.translateAlong(P, [0, 0, rest.zb])}">${bodySvg}</g><g data-front>${frontSvg}</g>`,
    after.map((i) => i.svg).join(""),
    `<g data-console>${consoleSvg()}</g>`,
  ],
});

const DATA = { P, B0, bodyKey0: depth([0, 0, 0]), needle: CONSOLE, face: FACE_Y };
const css = readFileSync(join(FIG, "figure.css"), "utf8");
const standalone = svg.replace('class="iso-svg jv-figure"', 'class="iso-svg iso jv-figure" data-theme="light"').replace(/^<svg([^>]*)>/, `<svg$1><style>${k.ISO_CSS}${css}</style>`);
mkdirSync(join(ROOT, "public", "figures"), { recursive: true });
writeFileSync(join(ROOT, "public", "figures", "jeevi.svg"), standalone);
writeFileSync(join(FIG, "data.json"), JSON.stringify(DATA));

// ---------------------------------------------------------------- the preview page
const source = (file) => readFileSync(join(ROOT, "src", "figures", file), "utf8");
const namesOf = (text) => [...text.matchAll(/^export (?:const|function) (\w+)/gm)].map((m) => m[1]);
const wrap = (name, text, names) => `const ${name} = (() => {${text.replace(/^import .*$/gm, "").replace(/^export /gm, "")}\nreturn { ${names.join(", ")} };})();\n`;
const lathe = source("kit/lathe.mjs");
const model = source("jeevi/model.mjs");
const script = [
  source("kit/iso-kit.mjs").replace(/^export /gm, ""),
  wrap("G", lathe, namesOf(lathe)),
  wrap("M", model, namesOf(model)),
  source("jeevi/parts.mjs").replace(/^export /gm, ""),
  existsLive() ? source("jeevi/live.mjs").replace(/^export /gm, "") : "",
  existsLive()
    ? `const DATA = ${JSON.stringify(DATA)};
const k = { ${namesOf(source("kit/iso-kit.mjs")).join(", ")} };
const stage = document.querySelector(".iso-stage");
const readoutEl = document.querySelector("[data-readout]");
const parts = makeJeevi(k, G, M, DATA.P);
window.__jv = { parts, DATA, M };
mountJeevi(stage, { k, G, M, parts, data: DATA, say: (text) => { if (readoutEl.textContent !== text) readoutEl.textContent = text; } });`
    : "",
].join("\n");
function existsLive() {
  try { readFileSync(join(FIG, "live.mjs")); return true; } catch { return false; }
}
const stageHtml = `<div class="iso-stage" tabindex="0" role="group" aria-label="JeevI on the treadmill: press 1, 2 or 3, or the console buttons, to choose a terrain">${svg}</div>`;
const page = k.pageHtml({
  title: "JeevI on three terrains",
  theme: "light",
  width: 720,
  body: `<style>${css}</style>` + k.plateHtml({ fig: "Fig 2", title: "JeevI on three terrains", hint: "press a terrain button", readout: "flat · reward 256.27", body: stageHtml }),
  script,
});
mkdirSync(join(HERE, "out"), { recursive: true });
writeFileSync(join(HERE, "out", "jeevi.html"), page);
console.log("wrote out/jeevi.html", `${(page.length / 1024).toFixed(0)} KB`, `items ${R.items.length}`);

A.auditOrExit(R, P, {});
