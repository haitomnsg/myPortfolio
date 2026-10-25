// JeevI's parts, rebuilt from the model. Shared by the build (rest pose, audit) and the page (every
// frame), so it takes the kit, the lathe module and the model as arguments instead of importing them.
// Every function returns `{ key, svg, shapes }` items; `key` is the painter's depth.

export function makeJeevi(k, G, M, P) {
  const V = G.viewOf(P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const Ln = (d, style) => k.lineSvg(d, style);
  const D = (points, style) => k.dotsSvg(points, style);
  const at = (p) => k.iso(p, P);
  const { add3, sub3, mul3, unit3, cross3, dot3 } = G;
  const depth = (p) => dot3(p, V);

  const rect = (w, h, r = 0.6, steps = 3) => {
    const out = [];
    const rr = Math.min(r, w / 2 - 0.01, h / 2 - 0.01);
    const corners = [[w / 2 - rr, h / 2 - rr, 0], [-w / 2 + rr, h / 2 - rr, Math.PI / 2], [-w / 2 + rr, -h / 2 + rr, Math.PI], [w / 2 - rr, -h / 2 + rr, (3 * Math.PI) / 2]];
    for (const [cx, cy, a0] of corners) for (let i = 0; i <= steps; i++) {
      const a = a0 + (i / steps) * (Math.PI / 2);
      out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return out;
  };
  /** A box from `from` along `a` for `len`, `wide` along `u`, `thick` along the third axis. */
  const box = (from, a, u, len, wide, thick, r = 0.8) => {
    const A = unit3(a);
    const U = unit3(sub3(u, mul3(A, dot3(u, A))));
    const F = G.frameOf(from, A, U, unit3(cross3(A, U)));
    const poly = rect(wide, thick, r, r >= 4 ? 3 : 1);
    return { paths: G.prismOf(F, poly, 0, len, P), F, poly, len, centre: add3(from, mul3(A, len / 2)) };
  };
  const prismShape = (b, name) => ({ kind: "prism", F: b.F, poly: b.poly, s0: 0, s1: b.len, name });

  // A piece is one solid: `{ key, solid, style, cls, marks, shapes }`. The page keeps a fixed set of
  // paths for each piece and rewrites their `d`, so the legs never go back through the HTML parser.
  const piece = (key, solid, style = {}, extra = {}) => ({ key, solid, style: { tone: "hi", ...style }, cls: extra.cls ?? "", marks: extra.marks ?? "", shapes: extra.shapes ?? [] });
  const pieceSvg = (p) => {
    const svg = S(p.solid, p.style) + p.marks;
    return p.cls ? `<g class="${p.cls}">${svg}</g>` : svg;
  };

  // ------------------------------------------------------------ a standard servo, 40 × 20 × 38
  // its shaft sits 10 mm from one end of the long side; `axis` is the shaft, `long` the body's length
  function servo(shaft, axis, long, name, tabLength = 54, height = 28) {
    const A = unit3(axis);
    const L = unit3(sub3(long, mul3(A, dot3(long, A))));
    const W = unit3(cross3(A, L));
    const centre = add3(shaft, mul3(L, -10));
    const body = box(add3(centre, mul3(A, -2 - height)), A, L, height, 40, 20, 1.2);
    const reach = tabLength / 2 - 20;
    const flange = (side) => box(add3(add3(centre, mul3(A, -8)), mul3(L, side * (20 + reach / 2))), A, L, 2.6, reach, 19, 0.6);
    const cap = box(add3(centre, mul3(A, -2)), A, L, 2, 30, 18, 3);
    const face = dot3(A, V) > 0.1;
    const screwsOf = (side) => (face ? D([-1, 1].map((t) => at(add3(add3(add3(centre, mul3(A, -5.4)), mul3(L, side * (20 + reach / 2))), mul3(W, t * 5)))), { size: 0.45, tone: "mid" }) : "");
    const key = depth(centre);
    const own = (shape) => ({ ...shape, owner: name });
    // the cap is on the shaft face and the flanges on the ends: each goes after the body when its face looks at the viewer
    const toward = (v) => (dot3(v, V) > 0 ? 1e-3 : -1e-3);
    return [
      piece(key, body.paths, { tone: "mid" }, { cls: "mat-dark", shapes: [own(prismShape(body, `${name}.body`))] }),
      ...[-1, 1].map((side, i) => {
        const t = flange(side);
        return piece(key + toward(mul3(L, side)) * (2 + i), t.paths, { tone: "mid" }, { cls: "mat-dark", marks: screwsOf(side), shapes: [own(prismShape(t, `${name}.tab${i}`))] });
      }),
      piece(key + toward(A) * 4, cap.paths, { tone: "mid" }, { cls: "mat-dark", shapes: [own(prismShape(cap, `${name}.cap`))] }),
    ];
  }

  // a horn on a shaft: a 16-sided disc (about a fifth of a turned disc's cost), four screws, hub ring
  const ROUND = Array.from({ length: 16 }, (_, i) => [Math.cos((i / 16) * Math.PI * 2) * 8, Math.sin((i / 16) * Math.PI * 2) * 8]);
  function horn(centre, axis, angle, name) {
    const F = G.frameAlong(centre, axis);
    let marks = "";
    if (dot3(F.a, V) > 0.12) {
      marks = D([0, 1, 2, 3].map((i) => at(G.pointOf(F, 1.6, 5.4, angle + (i * Math.PI) / 2))), { size: 0.42, tone: "mid" }) + Ln(k.pathOf(Array.from({ length: 12 }, (_, i) => at(G.pointOf(F, 1.6, 2.2, (i / 12) * Math.PI * 2))), true), { tone: "lo" });
    }
    return piece(depth(centre), G.prismOf(F, ROUND, 0, 1.6, P), { tone: "mid" }, { marks, shapes: [{ kind: "prism", F, poly: ROUND, s0: 0, s1: 1.6, name }] });
  }

  // ------------------------------------------------------------ the body, at the body origin
  function body() {
    const items = [];
    const put = (key, svg, shapes = []) => items.push({ key, svg, shapes });
    const plate = M.PLATE;
    put(depth([0, 0, 2.5]), S(k.slabOf(plate, 0, 5, P, 6, 0.6), { tone: "mid", inner: Ln(k.sideSeam(plate, 2.5, P, 6), { tone: "faint" }) }) +
      // mounting holes in a 24 mm grid, clear of the label plate in the middle
      Ln([-48, -24, 0, 24, 48].flatMap((x) => [-48, -24, 0, 24, 48].filter((y) => Math.abs(x) > 30 || Math.abs(y) > 18).map((y) => k.ring(x, y, 1.6, 5, P, 12))).join(""), { tone: "lo" }),
      [{ kind: "slab", plan: plate, z: 0, h: 5, name: "body.plate" }]);
    // the one engraved label, on a plate screwed to the deck
    const label = { x: -22, y: -10, w: 44, d: 20, r: 1.5 };
    put(depth([0, 0, 5.4]), S(k.slabOf(label, 5, 0.8, P, 4), { tone: "lo", crease: "none" }) + Ln(k.planOutline(k.insetPlan(label, 1.6), 5.8, P, 4), { tone: "faint" }) +
      k.faceTextSvg(k.topMatrix([label.x + 6, label.y + 11.6], 5.8, P, "x"), "JEEVI II", { size: 5.4, tone: "mid" }) +
      D([at([label.x + 2.6, label.y + 2.6, 5.8]), at([label.x + label.w - 2.6, label.y + label.d - 2.6, 5.8])], { size: 0.45 }),
      [{ kind: "slab", plan: label, z: 5, h: 0.8, name: "body.label" }]);
    for (const leg of M.LEGS) {
      const [hx, hy] = leg.hip;
      const d = [Math.cos(leg.dir), Math.sin(leg.dir), 0];
      const sx = Math.sign(hx);
      const sy = Math.sign(hy);
      // servo holder on the deck and the support under it, a spacer at each corner between them
      const holder = { x: sx > 0 ? 33 : -90.9, y: sy > 0 ? 14 : -83.2, w: 57.9, d: 69.2, r: 4 };
      const support = { x: sx > 0 ? 33 : -87.7, y: sy > 0 ? 29 : -72.4, w: 54.7, d: 43.4, r: 4 };
      // the hip servo hangs under the deck between the support and the holder; only its hub comes up,
      // through a hole in the holder, to the coxa
      put(depth([holder.x + holder.w / 2, holder.y + holder.d / 2, 7.5]), S(k.slabOf(holder, 5, 5, P, 4, 0.5), { tone: "mid" }) + Ln(k.ring(hx, hy, 7.4, 10, P, 24), { tone: "lo" }), [{ kind: "slab", plan: holder, z: 5, h: 5, name: `body.holder${leg.id}` }]);
      put(depth([support.x + support.w / 2, support.y + support.d / 2, -22.5]), S(k.slabOf(support, -25, 5, P, 4, 0.4), { tone: "mid" }), [{ kind: "slab", plan: support, z: -25, h: 5, name: `body.support${leg.id}` }]);
      for (const it of servo([hx, hy, 0], [0, 0, 1], d, `hip${leg.id}`, 54, 18)) items.push({ key: it.key, svg: pieceSvg(it), shapes: it.shapes });
      // spacers at the support's corners, clear of the servo; each runs up to whatever is over it
      const corners = [[support.x + 5, support.y + 5], [support.x + support.w - 5, support.y + 5], [support.x + 5, support.y + support.d - 5], [support.x + support.w - 5, support.y + support.d - 5]];
      const far = corners.reduce((best, c) => (Math.hypot(c[0] - hx, c[1] - hy) < Math.hypot(best[0] - hx, best[1] - hy) ? c : best));
      for (const [ox, oy] of corners.filter((c) => c !== far)) {
        const under = Math.abs(ox) < M.PLATE.w / 2 + 3.2 && Math.abs(oy) < M.PLATE.d / 2 + 3.2;
        const top = under ? 0 : 5;
        const sp = k.cylinder(ox, oy, 3.2, -20, top + 20, P, 6);
        put(depth([ox, oy, (top - 20) / 2]), S(sp, { tone: "mid", crease: "none" }), [{ kind: "cylinder", cx: ox, cy: oy, r: 3.2, z: -20, h: top + 20, name: `body.spacer${leg.id}` }]);
      }
    }
    return items;
  }

  // ------------------------------------------------------------ one leg, in the body frame
  // Across the leg (along n, from its plane): the coxa, the mid servo and the tibia block are 34 wide
  // about the plane; the femur's two plates clamp them from outside at ±18.6–21.6. Pieces come back in
  // the order they are painted, and their count never changes, so the page keeps one path set each.
  const C = 17; // half-width of the coxa and the tibia block
  function leg(legDef, ik) {
    const { d, n, mid, knee, foot } = ik;
    const id = legDef.id;
    const plane = (p, s) => add3(p, mul3(n, s));
    const base = plane([legDef.hip[0], legDef.hip[1], 0], M.MID_SIDE); // the leg plane over the hip axis
    const facing = dot3(n, V) >= 0 ? 1 : -1;
    const upper = [];
    const lower = [];
    const put = (list, layer, p) => { p.layer = layer * facing; list.push(p); };
    const along = (p, s) => add3(p, mul3(d, s));

    // coxa (arm 1): a C-bracket round the hip servo. Its bottom plate and the washer sit under the body
    // (`under`); the hip servo, its hub, the web and the top plate are painted in that order (`over`).
    const under = [];
    const hipAt = [legDef.hip[0], legDef.hip[1]];
    const bottom = box(along([base[0], base[1], -31.5 + 2.3], -10), d, n, 78, C * 2, 4.6, 1.2);
    under.push(piece(depth(bottom.centre), bottom.paths, {}, { shapes: [prismShape(bottom, `leg${id}.coxa.bottom`)] }));
    under.push(piece(depth([...hipAt, -26]), k.cylinder(hipAt[0], hipAt[1], 6, -26.9, 1.9, P, 24), { tone: "mid" }, { shapes: [{ kind: "cylinder", cx: hipAt[0], cy: hipAt[1], r: 6, z: -26.9, h: 1.9, name: `leg${id}.washer` }] }));
    const web = box(along([base[0], base[1], -26.9], 64), [0, 0, 1], d, 55.1, 4, C * 2, 0.8);
    // the mid servo stands in the coxa, shaft out of its side face on the mid axis
    const midServo = servo(plane(mid, C), n, [0, 0, 1], `leg${id}.mid`, 49);
    const midKey = midServo[0].key;
    const outward = dot3(d, V) > 0 ? 1 : -1; // does this leg point toward the viewer?
    for (const it of midServo) put(upper, 0, it);
    // the web is outboard of the servo, the hub inboard; the top plate covers all three
    put(upper, 0, piece(midKey + outward * 0.5, web.paths, {}, { shapes: [prismShape(web, `leg${id}.coxa.web`)] }));
    const top = box(along([base[0], base[1], 28.2 + 2.3], -10), d, n, 78, C * 2, 4.6, 1.2);
    const over = [
      piece(midKey - outward * 0.6, k.cylinder(hipAt[0], hipAt[1], 6, 10, 18.2, P, 24), { tone: "mid" }, { shapes: [{ kind: "cylinder", cx: hipAt[0], cy: hipAt[1], r: 6, z: 10, h: 18.2, name: `leg${id}.hub` }] }),
      piece(midKey + 0.9, top.paths, {}, { shapes: [prismShape(top, `leg${id}.coxa.top`)] }),
    ];
    over.forEach((p) => { p.layer = 0; });
    // femur (arm 2): two plates outside the coxa, joined by a web near the knee
    const fd = unit3(sub3(knee, mid));
    const fu = unit3(cross3(n, fd));
    for (const side of [-1, 1]) {
      const off = side * (C + 1.6);
      const plateBox = box(plane(add3(mid, mul3(fd, -10)), off + side * 1.5), fd, fu, M.FEMUR + 20, 20, 3, 9.6);
      const marks = side === facing ? D([mid, knee].flatMap((p) => [-1, 1].map((s2) => at(plane(add3(p, mul3(fd, s2 * 13)), off + side * 3)))), { size: 0.42, tone: "mid" }) : "";
      put(upper, off + side * 1.5, piece(depth(plane(add3(mid, mul3(fd, M.FEMUR / 2)), off)), plateBox.paths, {}, { marks, shapes: [prismShape(plateBox, `leg${id}.femur${side > 0 ? "+" : "-"}`)] }));
    }
    const webAt = add3(mid, mul3(fd, M.FEMUR * 0.62));
    const fweb = box(plane(webAt, -(C + 1.6)), n, fd, (C + 1.6) * 2, 12, 3, 0.6);
    put(upper, 0, piece(depth(webAt), fweb.paths, {}, { shapes: [prismShape(fweb, `leg${id}.femur.web`)] }));
    // horns on the servo side, under the near femur plate
    put(upper, C + 0.8, horn(plane(mid, C), n, ik.femur, `leg${id}.horn.mid`));
    put(upper, C + 0.8, horn(plane(knee, C), n, ik.tibia, `leg${id}.horn.knee`));
    // tibia (arm 3): a block round the knee servo, then a shank tapering to the TPU sock
    const tib = unit3(sub3(foot, knee));
    const tu = unit3(cross3(n, tib));
    const block = box(add3(knee, mul3(tib, -16)), tib, n, 50, C * 2, 30, 4);
    const blockMarks = D([-1, 1].map((s2) => at(add3(add3(knee, mul3(tib, 26)), mul3(tu, s2 * 9)))), { size: 0.42 });
    put(upper, 0, piece(depth(add3(knee, mul3(tib, 9))), block.paths, {}, { marks: blockMarks, shapes: [prismShape(block, `leg${id}.tibia.block`)] }));
    const sockC = add3(foot, [0, 0, M.SOCK_R]);
    const shankFrom = add3(knee, mul3(tib, 34));
    // the shank's end face sits on the sock
    const toBall = dot3(sub3(sockC, shankFrom), tib);
    const shankLen = toBall - M.SOCK_R + 0.05; // the end face rests on the ball, tangent
    const taper = (s2) => [[-12 + s2, -9 + s2 * 0.5], [12 - s2, -9 + s2 * 0.5], [12 - s2, 9 - s2 * 0.5], [-12 + s2, 9 - s2 * 0.5]];
    const F1 = G.frameOf(shankFrom, tib, n, tu);
    const F2 = G.frameOf(add3(shankFrom, mul3(tib, shankLen / 2)), tib, n, tu);
    put(lower, 0, piece(depth(add3(shankFrom, mul3(tib, shankLen * 0.25))), G.prismOf(F1, taper(0), 0, shankLen / 2, P), {}, { shapes: [{ kind: "prism", F: F1, poly: taper(0), s0: 0, s1: shankLen / 2, name: `leg${id}.tibia.a` }] }));
    put(lower, 0, piece(depth(add3(shankFrom, mul3(tib, shankLen * 0.75))), G.prismOf(F2, taper(4), 0, shankLen / 2, P), {}, { shapes: [{ kind: "prism", F: F2, poly: taper(4), s0: 0, s1: shankLen / 2, name: `leg${id}.tibia.b` }] }));
    // the sock: a TPU dome the foot stands on; the four socks are the figure's lit part
    put(lower, 0, piece(depth(sockC), G.sphereOf(sockC, M.SOCK_R, P, { steps: 40 }), { tone: "mid", crease: "none", lit: true }, { cls: "mat-tpu", shapes: [{ kind: "ball", c: sockC, r: M.SOCK_R, name: `leg${id}.sock` }] }));

    const byLayer = (list) => [...list].sort((p, q) => p.layer - q.layer || p.key - q.key);
    lower.sort((p, q) => p.key - q.key);
    // `joined`: the leg in front of the body paints its hub and coxa top in its own sequence. Behind
    // the body, `upper` holds what is behind and `over` the hub, top plate and the near-side plates
    // and horns, which lie over the top plate.
    const near = (p) => p.layer > 0;
    return {
      under,
      joined: byLayer([...upper, ...over]),
      upper: byLayer(upper.filter((p) => !near(p))),
      over: byLayer([...over, ...upper.filter(near)]),
      lower,
      anchor: { under: [...hipAt, -29], upper: add3(mid, mul3(fd, M.FEMUR * 0.5)), over: [...hipAt, 30], lower: add3(foot, [0, 0, 24]) },
    };
  }

  // ------------------------------------------------------------ terrain and belt, in world
  // `mode`: "all" (everything in the span), "whole" (only blocks wholly inside, drawn at belt travel
  // `b`), "cut" (only the ones the hood openings cut, rebuilt every frame)
  function terrain(b, mode = "all") {
    const items = [];
    for (const f of M.FEATURES) {
      const x0 = M.worldX(f.u0, b);
      const x1 = x0 + (f.u1 - f.u0);
      const a = Math.max(x0, M.SPAN[0]);
      const z = Math.min(x1, M.SPAN[1]);
      if (z - a < 0.5) continue;
      const whole = a === x0 && z === x1;
      if ((mode === "whole" && !whole) || (mode === "cut" && whole)) continue;
      const plan = { x: a, y: f.y0, w: z - a, d: f.y1 - f.y0, r: 0 };
      const paths = k.slabOf(plan, 0, f.h, P, 1, 0);
      const seam = f.section === "boxes" ? Ln(k.planOutline(k.insetPlan(plan, 6), f.h, P, 1), { tone: "faint" }) : "";
      const centre = [a + (z - a) / 2, (f.y0 + f.y1) / 2, f.h / 2];
      items.push({ key: depth(centre), centre, plan, h: f.h, feature: f, svg: `<g class="mat-terrain">${S(paths, { tone: "mid" })}</g>${seam}`, shapes: [{ kind: "slab", plan, z: 0, h: f.h, name: `terrain.${f.section}` }] });
    }
    return items.sort((p, q) => p.key - q.key);
  }
  // transverse ribs on the belt, every 50 mm of belt, running edge to edge
  function beltLines(b) {
    const d = [];
    const y0 = -M.BELT_W / 2;
    const y1 = M.BELT_W / 2;
    for (let u = 0; u < M.LOOP; u += 50) {
      const x = M.worldX(u, b);
      if (x <= M.SPAN[0] + 1 || x >= M.SPAN[1] - 1) continue;
      d.push(k.pathOf([at([x, y0, 0]), at([x, y1, 0])]));
    }
    return d.join("");
  }

  /**
   * The robot's paint order for one frame. `legs` holds each leg's groups with their keys:
   * `{ under, upper, lower }` each `{ key, ... }`. Under the body: every coxa bottom, then the lower
   * halves behind it. Over it: the upper halves and the lower halves in front, by depth.
   */
  function order(legs, bodyKey) {
    const unders = legs.map((l) => l.under).sort((p, q) => p.key - q.key);
    const behind = [...unders];
    const front = [];
    const back = [];
    const fore = [];
    for (const l of legs) {
      if (l.upper.key < bodyKey) { back.push(l.upper); front.push(l.over); } else fore.push(l.joined);
      (l.lower.key < bodyKey ? back : fore).push(l.lower);
    }
    behind.push(...back.sort((p, q) => p.key - q.key));
    front.push(...fore.sort((p, q) => p.key - q.key));
    return { behind, front };
  }

  return { body, leg, terrain, beltLines, servo, horn, box, rect, depth, pieceSvg, order };
}
