// Shared builder for the three small rovers (Figs 3–5): the recorder and drawing helpers of Fig 1,
// plus the parts the rovers share. Millimetres, x along the bench, y across it, z up.
import * as k from "../../src/figures/kit/iso-kit.mjs";
import * as G from "../../src/figures/kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../../src/figures/kit/tube.mjs";
import * as A from "../../src/figures/kit/audit.mjs";
import * as W from "../../src/figures/rovers/wheels.mjs";

export function makeBuilder(P) {
  const V = G.viewOf(P);
  const KS = G.scaleOf(P);
  const at = (p) => k.iso(p, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const D = (points, style) => k.dotsSvg(points, style);
  const ink = (svg) => `<g class="mat-dark">${svg}</g>`;
  const DOT = 0.8;
  const R = A.recorder(P);
  const layerOf = new Map();
  const wheels = [];

  function put(layer, name, centre, svg, shapes = [], { bias = 0, route, chunk, record = true } = {}) {
    const id = R.nameFor(name);
    const named = shapes.map((s) => ({ ...s, name: s.name ?? id }));
    R.put({ name: id, at: centre, bias, svg, shapes: record ? named.map((s) => R.solid(s)) : named, route, chunk });
    layerOf.set(R.items[R.items.length - 1], layer);
    return id;
  }
  const wrapOf = (o) => o.wrap ?? ((x) => x);
  const slab = (layer, name, plan, z, h, style = {}, o = {}) =>
    put(layer, name, [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2], wrapOf(o)(S(k.slabOf(plan, z, h, P, o.steps ?? 3, o.bevel ?? 0.5), { tone: "mid", ...style, inner: o.inner ?? "" }) + (o.after ?? "")), [A.slab(plan, z, h, { name, ground: o.ground }, o.steps ?? 3)], o);
  const cyl = (layer, name, cx, cy, r, z, h, style = {}, o = {}) =>
    put(layer, name, [cx, cy, z + h / 2], wrapOf(o)(S(k.cylinder(cx, cy, r, z, h, P, o.steps ?? 28, o.bevel ?? 0), { tone: "mid", ...style, inner: o.inner ?? "" }) + (o.after ?? "")), [A.cylinder(cx, cy, r, z, h, { name, ground: o.ground })], o);
  const disc = (layer, name, F, s0, s1, r, style = {}, o = {}) =>
    put(layer, name, G.pointOf(F, (s0 + s1) / 2, 0, 0), wrapOf(o)(S(G.disc(s0, s1, r, F, P), { tone: "mid", ...style, inner: o.inner ?? "" }) + (o.after ?? "")), [A.disc(F, s0, s1, r, { name })], o);
  const dotAt = (layer, name, p, o = {}) => put(layer, name, p, D([at(p)], { size: DOT, tone: o.tone ?? "mid" }), [A.ball(p, DOT / KS, { name, owner: o.owner })], { bias: 0.05, ...o });
  const routeOf = (points, r, bend) => G.fillet(points, bend ?? Math.max(3, r * 2.6), 8, { P, tube: r });
  /** A wire: chunks depth-sorted on their own, recorded for the audit, a terminal dot at each end. */
  function wire(layer, name, points, r = 0.8, { tone = "mid", touch, bend, dots = [true, true], maxLength = 14 } = {}) {
    const route = routeOf(points, r, bend);
    const id = R.nameFor(name);
    R.route(id, route, r, { owner: id, touch, limp: true, piece: layer });
    tubePieces(route, r, P, { maxLength, spacing: 1 }).forEach((part, index) =>
      put(layer, `${id}:${index}`, part.mid, tubeSvg(part, { tone }), [A.tube(part.points, part.radii)], { route: id, chunk: index, record: false }),
    );
    // each end's dot sits a hair back from the face it lands on
    const back = (tip, from) => G.add3(tip, G.mul3(G.unit3(G.sub3(from, tip)), 0.12));
    if (dots[0]) dotAt(layer, `${id}.end`, back(route[0], route[1]), { owner: id });
    if (dots[1]) dotAt(layer, `${id}.end`, back(route[route.length - 1], route[route.length - 2]), { owner: id });
    return route;
  }

  // ------------------------------------------------------------ the bench every figure stands on
  function bench(plate, { label, labelAt, ruler = true, z = 0, height = 10, foot = 5 } = {}) {
    R.solid(A.slab(plate, z - height, height, { name: "stand.plate", ground: true }, 8));
    const out = [];
    const z0 = z - height - foot;
    out.push(`<path class="iso-halo" d="${k.haloOf(plate, z0, height, P)}"/>`);
    for (const [x, y] of [...k.corners(plate, 20)].sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) {
      out.push(S(k.cylinder(x, y, 7, z0, 1.6, P, 32), { tone: "lo" }));
      out.push(S(k.cylinder(x, y, 5.4, z0 + 1.6, foot - 1.6, P, 32), { tone: "mid" }));
    }
    out.push(S(k.slabOf(plate, z - height, height, P, 8, 1.2), { tone: "mid", inner: L(k.sideSeam(plate, z - height + 3, P, 8), { tone: "faint" }) }));
    out.push(L(k.planOutline(k.insetPlan(plate, 5), z, P), { tone: "lo" }));
    const screws = k.corners(plate, 10);
    out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, z, P, 16)).join(""), { tone: "lo" }));
    out.push(D(screws.map(([x, y]) => at([x, y, z])), { size: 0.55 }));
    if (ruler) {
      const strip = { x: plate.x + 24, y: plate.y + plate.d - 14, w: plate.w - 48 - (label ? 52 : 0), d: 7, r: 1 };
      out.push(S(k.slabOf(strip, z, 0.6, P, 3), { tone: "lo", crease: "none" }));
      const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, z + 0.6, [2, 3.6], P);
      out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
      out.push(D([at([strip.x + 2, strip.y + 3.5, z + 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, z + 0.6])], { size: 0.45 }));
    }
    if (label) {
      const lp = labelAt ? { x: labelAt[0], y: labelAt[1], w: 46, d: 17, r: 1.5 } : { x: plate.x + plate.w - 62, y: plate.y + plate.d - 26, w: 46, d: 17, r: 1.5 };
      out.push(S(k.slabOf(lp, z, 0.8, P, 4), { tone: "lo", crease: "none" }));
      out.push(L(k.planOutline(k.insetPlan(lp, 1.6), z + 0.8, P, 4), { tone: "faint" }));
      out.push(k.faceTextSvg(k.topMatrix([lp.x + 4.5, lp.y + 7.2], z + 0.8, P, "x"), label, { size: 3.1, tone: "mid" }));
      out.push(L(k.lineOnTop([lp.x + 4.5, lp.y + 10.8], [lp.x + 30, lp.y + 10.8], z + 0.8, P), { tone: "faint", free: true }));
      out.push(L(k.lineOnTop([lp.x + 4.5, lp.y + 13.2], [lp.x + 21, lp.y + 13.2], z + 0.8, P), { tone: "faint", free: true }));
      out.push(D([at([lp.x + 2.4, lp.y + 2.4, z + 0.8]), at([lp.x + lp.w - 2.4, lp.y + lp.d - 2.4, z + 0.8])], { size: 0.4 }));
    }
    return out.join("");
  }

  // ------------------------------------------------------------ an Arduino Uno under a motor shield
  // `at`: the Uno's lower corner (x, y), its board's top z; `dir`: +1 or -1, which way the USB end faces along x
  function arduino(layer, { x, y, z, dir = -1, shield = "l293d", name = "uno" }) {
    const bw = 68.6;
    const bd = 53.4;
    const uno = { x, y, w: bw, d: bd, r: 2 };
    for (const [px, py] of [[x + 14, y + 2.5], [x + 15.3, y + 50.8], [x + 66, y + 7.6], [x + 66, y + 35.5]]) cyl(layer, `${name}.standoff`, px, py, 1.6, z - 8, 8, {}, { steps: 12 });
    slab(layer, `${name}.board`, uno, z, 1.6, { tone: "mid" }, { steps: 2, bevel: 0.3, wrap: (s) => `<g class="mat-pcb">${s}</g>` });
    // the USB and power jacks stand out of the end under the shield
    const end = dir < 0 ? x - 6.2 : x + bw - 10;
    slab(layer, `${name}.usb`, { x: end, y: y + 9.5, w: 16.2, d: 12, r: 0.6 }, z + 1.6, 10.9, {}, { steps: 1, after: L(k.planOutline({ x: dir < 0 ? end : end + 16.2 - 0.01, y: y + 11, w: 0.01, d: 9, r: 0 }, z + 6, P, 1), { tone: "faint" }) });
    slab(layer, `${name}.jack`, { x: dir < 0 ? x - 1.8 : x + bw - 12.4, y: y + 38, w: 14.2, d: 9, r: 1 }, z + 1.6, 11, {}, { steps: 2, wrap: ink });
    if (!shield) return;
    // the shield on long headers: chips, screw terminals, the big capacitors
    const sz = z + 14.5;
    for (const hy of [y + 1.2, y + bd - 3.6]) slab(layer, `${name}.header`, { x: x + 17, y: hy, w: 48, d: 2.4, r: 0.3 }, z + 1.6, sz - z - 1.6, {}, { steps: 1, wrap: ink });
    slab(layer, `${name}.shield`, { ...uno, y: y - 0.6, d: bd + 1.2 }, sz, 1.6, { tone: "mid" }, { steps: 2, bevel: 0.3, wrap: (s) => `<g class="mat-pcb">${s}</g>`, after: D(k.corners(uno, 3).map(([px, py]) => at([px, py, sz + 1.6])), { size: 0.5 }) });
    const top = sz + 1.6;
    for (const [cx, cy] of [[x + 22, y + 16], [x + 22, y + 32], [x + 42, y + 24]]) {
      slab(layer, `${name}.chip`, { x: cx - 10, y: cy - 3.7, w: 20, d: 7.4, r: 0.4 }, top, 3.2, {}, { steps: 1, wrap: ink, after: L(k.ring(cx - 7.6, cy, 0.9, top + 3.2, P, 10), { tone: "lo" }) });
    }
    // two-pole screw terminals along the far edges, screws up
    const terms = [[x + 4, y + 2], [x + 4, y + 13], [x + 4, y + 30], [x + 4, y + 41], [x + 56, y + 2]];
    for (const [tx, ty] of terms) {
      slab(layer, `${name}.terminal`, { x: tx, y: ty, w: 8, d: 10, r: 0.5 }, top, 9, {}, { steps: 1, wrap: (s) => `<g class="mat-blue">${s}</g>`, after: D([at([tx + 4, ty + 2.6, top + 9]), at([tx + 4, ty + 7.4, top + 9])], { size: 0.55, tone: "hi" }) });
    }
    for (const [cx, cy] of [[x + 56, y + 30], [x + 61, y + 40]]) cyl(layer, `${name}.cap`, cx, cy, 3.2, top, 9, {}, { steps: 18, wrap: ink, inner: L(k.sideArc(cx, cy, 3.2, top + 7.4, P, 12), { tone: "faint" }) });
    return { top, terminals: terms.map(([tx, ty]) => [tx + 4, ty + 5, top + 9]), box: uno };
  }

  // ------------------------------------------------------------ two 18650 cells in a holder
  function cells(layer, { x, y, z, along = "x", name = "cells" }) {
    const len = 77;
    const wide = 45;
    const plan = along === "x" ? { x, y, w: len, d: wide, r: 1.6 } : { x, y, w: wide, d: len, r: 1.6 };
    slab(layer, `${name}.tray`, plan, z, 1.6, {}, { steps: 2, bevel: 0.3, wrap: ink });
    const ends = along === "x" ? [[x, y, 2, wide], [x + len - 2, y, 2, wide]] : [[x, y, wide, 2], [x, y + len - 2, wide, 2]];
    for (const [ex, ey, ew, ed] of ends) slab(layer, `${name}.clip`, { x: ex, y: ey, w: ew, d: ed, r: 0.4 }, z + 1.6, 19.5, {}, { steps: 1, wrap: ink });
    for (const off of [12.5, 32.5]) {
      const F = along === "x" ? G.frameOf([x + 2, y + off, z + 1.6 + 9], [1, 0, 0], [0, 1, 0], [0, 0, 1]) : G.frameOf([x + off, y + 2, z + 1.6 + 9], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
      disc(layer, `${name}.cell`, F, 0, len - 4, 9, {}, { wrap: (s) => `<g class="mat-cell">${s}</g>`, inner: L(G.arcOf(F, len - 12, 9, P), { tone: "faint" }) });
    }
    return { ...plan, top: z + 21.1 };
  }

  // ------------------------------------------------------------ a TT gear motor along y, shaft at (sx, sy, sz)
  function ttMotor(layer, { sx, sy, sz, side, dir = 1, name }) {
    // `side` -1 or +1: which way (in y) the wheel is; the body runs inboard from the shaft, its motor
    // can toward `dir` along x
    const y0 = side > 0 ? sy - 19 : sy;
    const gear = { x: dir > 0 ? sx - 11 : sx - 26, y: y0, w: 37, d: 19, r: 1.5 };
    slab(layer, `${name}.gearbox`, gear, sz - 11, 22, {}, { steps: 2, bevel: 0.4, wrap: (s) => `<g class="mat-yellow">${s}</g>`, after: D([at([sx + dir * 20, y0 + 9.5, sz + 11])], { size: 0.5 }) });
    const F = G.frameOf([sx + dir * 26, y0 + 9.5, sz], [dir, 0, 0], [0, 1, 0], [0, 0, 1]);
    disc(layer, `${name}.can`, F, 0, 25, 9.2, {}, { wrap: ink, inner: L(G.arcOf(F, 18, 9.2, P), { tone: "faint" }) });
    return gear;
  }

  // ------------------------------------------------------------ an N20 micro gear motor along y, shaft at (sx, sy, sz)
  function n20(layer, { sx, sy, sz, side, name }) {
    // the gearbox against the wheel, the can inboard of it, both hanging under the chassis
    const y0 = side > 0 ? sy - 9.5 : sy;
    slab(layer, `${name}.gearbox`, { x: sx - 6, y: y0, w: 12, d: 9.5, r: 0.8 }, sz - 6, 12, {}, { steps: 2, bevel: 0.3, after: D([at([sx - 3.6, y0 + 4.75, sz + 6]), at([sx + 3.6, y0 + 4.75, sz + 6])], { size: 0.4 }) });
    const F = G.frameOf([sx, side > 0 ? sy - 9.5 : sy + 9.5, sz], [0, -side, 0], [1, 0, 0], [0, 0, 1]);
    disc(layer, `${name}.can`, F, 0, 15, 6, {}, { inner: L(G.arcOf(F, 11, 6, P), { tone: "faint" }) });
  }

  /**
   * A wheel on a shaft along y: `kind` "tt" (rubber tyre, yellow hub) or "mecanum" (rollers at 45°).
   * The tread or rollers are drawn live (`data-wheel`), so the page can turn them.
   */
  function wheel(layer, { cx, cy, cz, side, kind, name, r = 32.5, w = 26, hand = 1 }) {
    const F = G.frameOf([cx, cy, cz], [0, side, 0], [1, 0, 0], [0, 0, 1]);
    const w2 = w / 2;
    const shape = kind === "tt" ? W.ttProfile(r, w2) : W.mecanumProfile(r, w2);
    const tyre = G.solidOf(shape, F, P);
    // both tyres and mecanum rollers are rubber; a mecanum wheel's yellow is its side plates
    let svg = `<g class="mat-rubber">${S(tyre, { tone: "mid", inner: `<g data-wheel="${name}">${W.surface(k, G, P, F, kind, r, w2, 0, hand)}</g>` })}</g>`;
    const facing = G.dot3(F.a, V);
    if (facing > 0.05) svg += W.hub(k, G, P, F, kind, r, w2);
    else if (facing < -0.05) svg += W.hub(k, G, P, F, kind, r, w2, true);
    put(layer, name, [cx, cy, cz], svg, [A.solid(F, shape, {})]);
    wheels.push({ name, kind, r, w2, hand, F: { o: F.o, a: F.a, u: F.u, v: F.v } });
    return F;
  }

  return { R, layerOf, wheels, put, slab, cyl, disc, dotAt, wire, routeOf, bench, arduino, cells, ttMotor, n20, wheel, at, S, L, D, ink, V, KS };
}

/**
 * Write the site's files (public/figures/<name>.svg with its styles inside, src/figures/rovers/<name>.json)
 * and a standalone preview (tools/figures/out/<name>.html) that inlines the kit and the live code.
 */
export async function writeFigure({ name, svg, data, model, mount, fig, title, hint, readout }) {
  const { readFileSync, writeFileSync, mkdirSync } = await import("node:fs");
  const { join, dirname } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const SRC = join(ROOT, "src", "figures");
  const css = readFileSync(join(SRC, "rovers", "figure.css"), "utf8");
  const standalone = svg.replace('class="iso-svg rv-figure"', 'class="iso-svg iso rv-figure" data-theme="light"').replace(/^<svg([^>]*)>/, `<svg$1><style>${k.ISO_CSS}${css}</style>`);
  mkdirSync(join(ROOT, "public", "figures"), { recursive: true });
  writeFileSync(join(ROOT, "public", "figures", `${name}.svg`), standalone);
  writeFileSync(join(SRC, "rovers", `${name}.json`), JSON.stringify(data));
  const source = (file) => readFileSync(join(SRC, file), "utf8");
  const namesOf = (text) => [...text.matchAll(/^export (?:const|function) (\w+)/gm)].map((m) => m[1]);
  const wrap = (id, text) => `const ${id} = (() => {${text.replace(/^import .*$/gm, "").replace(/^export /gm, "")}\nreturn { ${namesOf(text).join(", ")} };})();\n`;
  const kit = source("kit/iso-kit.mjs");
  const script = [
    kit.replace(/^export /gm, ""),
    wrap("G", source("kit/lathe.mjs")),
    wrap("M", source(`rovers/${model}`)),
    wrap("Wh", source("rovers/wheels.mjs")),
    wrap("Live", source("rovers/live.mjs")),
    `const DATA = ${JSON.stringify(data)};
const k = { ${namesOf(kit).join(", ")} };
const stage = document.querySelector(".iso-stage");
const readoutEl = document.querySelector("[data-readout]");
window.__rv = { DATA, M };
Live.${mount}(stage, { k, G, M, W: Wh, data: DATA, say: (text) => { if (readoutEl.textContent !== text) readoutEl.textContent = text; } });`,
  ].join("\n");
  const page = k.pageHtml({
    title,
    theme: "light",
    width: 720,
    body: `<style>${css}</style>` + k.plateHtml({ fig, title, hint, readout, body: `<div class="iso-stage" tabindex="0" role="group" aria-label="${title}">${svg}</div>` }),
    script,
  });
  mkdirSync(join(ROOT, "tools", "figures", "out"), { recursive: true });
  writeFileSync(join(ROOT, "tools", "figures", "out", `${name}.html`), page);
  console.log(`wrote out/${name}.html`, `${(page.length / 1024).toFixed(0)} KB`);
}

/** Settle, order by layer, and audit: the build's last step. */
export function finish(B, P, layers, { crowd = [] } = {}) {
  A.settle(B.R, P);
  const ordered = [...B.R.items].sort((a, b) => a.key - b.key);
  const svgOf = (layer) => ordered.filter((i) => B.layerOf.get(i) === layer).map((i) => i.svg).join("");
  const out = Object.fromEntries(layers.map((l) => [l, svgOf(l)]));
  return { out, audit: () => A.auditOrExit(B.R, P, { crowd }) };
}
