// The arm, rebuilt from its joint angles. Shared by the build (rest pose, audit) and the page (every
// frame), so it takes the kit, the lathe module and the model as arguments instead of importing them.
//
// Every piece of the arm is a slab parallel to the arm's plane or sits between two of them, so the
// painter's order inside the arm is exact by offset along the joint axis: far plates, then what lies
// between the plates, then the near plates and horns.

export function makeArm(k, G, M, P) {
  const V = G.viewOf(P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const Ln = (d, style) => k.lineSvg(d, style);
  const D = (points, style) => k.dotsSvg(points, style);
  const at = (p) => k.iso(p, P);
  const { add3, sub3, mul3, unit3, cross3, dot3 } = G;

  const rect = (w, h, r = 0.6, steps = 3) => {
    const out = [];
    const corners = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI], [w / 2 - r, -h / 2 + r, (3 * Math.PI) / 2]];
    for (const [cx, cy, a0] of corners) for (let i = 0; i <= steps; i++) {
      const a = a0 + (i / steps) * (Math.PI / 2);
      out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return out;
  };

  // A box from `from` along `along` for `len`, `across` wide along the joint axis `n`, `thick` in the plane.
  const box = (from, along, n, len, across, thick, r = 0.6) => {
    const a = unit3(along);
    const v = unit3(cross3(a, n));
    const F = G.frameOf(from, a, n, v);
    return { F, paths: G.prismOf(F, rect(across, thick, r), 0, len, P), shape: { F, poly: rect(across, thick, r), s0: 0, s1: len } };
  };

  // one horn: a disc on the outside of a plate, on the joint axis, with its four screws and the hub screw
  const horn = (centre, n, side, angle) => {
    const F = G.frameAlong(centre, mul3(n, side));
    const paths = G.disc(0, 1.1, 4.4, F, P, { steps: 40 });
    const face = dot3(F.a, V) > 0.12;
    let marks = "";
    if (face) {
      const pts = [0, 1, 2, 3].map((i) => at(G.pointOf(F, 1.1, 2.8, angle + (i * Math.PI) / 2)));
      marks = D(pts, { size: 0.42, tone: "mid" }) + Ln(G.circleOf(F, 1.1, 1.3, P, 20), { tone: "lo" });
    }
    return { paths, marks };
  };

  /** Pieces of the arm for one pose, in local robot coordinates, each `{ layer, key, svg }`. */
  function pieces(pose, { carried = false } = {}) {
    const c = M.chain(pose);
    const dir3 = [c.dir[0], c.dir[1], 0];
    const n = [-c.dir[1], c.dir[0], 0]; // the joint axis
    const facing = dot3(n, V) >= 0 ? 1 : -1; // which side of the arm faces the viewer
    const inPlane = (angle) => add3(mul3(dir3, Math.cos(angle)), [0, 0, Math.sin(angle)]);
    const out = [];
    // `layer` is the offset along n, so the arm sorts by it; `key` breaks ties along the plane
    const put = (layer, centre, svg) => out.push({ layer: layer * facing, key: dot3(centre, V), svg });
    const ink = (svg) => `<g class="mat-dark">${svg}</g>`;

    // turret: a U-bracket standing on the turntable, turned by the base servo
    const turretZ = M.TOP + 13;
    const turretFrom = [M.BASE[0], M.BASE[1], turretZ];
    for (const side of [-1, 1]) {
      const up = box(add3(turretFrom, mul3(n, side * 9.6)), [0, 0, 1], n, M.SHOULDER_Z - turretZ + 6, 1.2, 12, 0.8);
      put(side * 9.6, add3(turretFrom, add3(mul3(n, side * 9.6), [0, 0, 8])), ink(S(up.paths, { tone: "mid" })));
    }
    const floor = box(add3(turretFrom, mul3(dir3, -6)), dir3, n, 12, 20.4, 1.4, 0.6);
    put(0, add3(turretFrom, [0, 0, 0.7]), ink(S(floor.paths, { tone: "mid" })));

    // shoulder servo, lying in the turret with its shaft on the joint axis
    const servoAt = (centre, angle, len = 16, offset = -3) => {
      const a = inPlane(angle);
      const from = add3(centre, mul3(a, offset - len / 2 + 3));
      const body = box(from, a, n, len, 8, 15, 1);
      const tabs = box(add3(from, mul3(a, -2.2)), a, n, len + 4.4, 8.6, 1.4, 0.5);
      return { a, body, tabs, from };
    };
    const servo = (centre, angle, len, offset, tone = "mid") => {
      const s = servoAt(centre, angle, len, offset);
      const mid = add3(s.from, mul3(s.a, len / 2));
      put(0, mid, ink(S(s.body.paths, { tone }) + S(s.tabs.paths, { tone: "lo" })));
    };
    servo(c.shoulder, pose.a1 + Math.PI, 16, 2);

    // a link: two side plates from joint to joint, a web near the far end, horns on the outside
    const link = (from, to, half, plateW, web = 0.75) => {
      const a = unit3(sub3(to, from));
      const len = Math.hypot(...sub3(to, from));
      for (const side of [-1, 1]) {
        const start = add3(add3(from, mul3(a, -plateW / 2)), mul3(n, side * half));
        const plate = box(start, a, n, len + plateW, 1.2, plateW, plateW / 2 - 0.4);
        const centre = add3(add3(from, mul3(a, len / 2)), mul3(n, side * half));
        // the face you can see gets a lightening slot down the middle and two screws at each end
        let face = "";
        if (side === facing) {
          const v = unit3(cross3(a, n));
          const out = add3(centre, mul3(n, side * 0.6));
          const slot = [];
          const sl = Math.max(0, len / 2 - 9);
          for (let i = 0; i <= 16; i++) {
            const t = (i / 16) * Math.PI;
            slot.push(add3(add3(out, mul3(a, sl + Math.sin(t) * 1.3)), mul3(v, Math.cos(t) * 1.3)));
          }
          for (let i = 0; i <= 16; i++) {
            const t = (i / 16) * Math.PI;
            slot.push(add3(add3(out, mul3(a, -sl - Math.sin(t) * 1.3)), mul3(v, -Math.cos(t) * 1.3)));
          }
          const ends = [-1, 1].flatMap((e) => [-1, 1].map((w) => at(add3(add3(out, mul3(a, e * (len / 2 - 4.2))), mul3(v, w * 2.6)))));
          face = (sl > 0 ? Ln(k.pathOf(slot.map(at), true), { tone: "lo" }) : "") + D(ends, { size: 0.42, tone: "mid" });
        }
        put(side * half, centre, ink(S(plate.paths, { tone: "mid" }) + face));
      }
      const w = box(add3(from, mul3(a, len * web - 2)), a, n, 4, half * 2 - 1.2, plateW - 2, 0.4);
      put(0, add3(from, mul3(a, len * web)), ink(S(w.paths, { tone: "lo" })));
    };
    link(c.shoulder, c.elbow, 9.6, 10);
    servo(c.elbow, pose.a1, 16, -2);
    link(c.elbow, c.wrist, 11, 9, 0.3);
    servo(c.wrist, pose.a2, 15, -2);

    // horns on the outside of each joint
    for (const [centre, half, angle] of [[c.shoulder, 10.8, pose.a1], [c.elbow, 12.2, pose.a2], [c.wrist, 12.2, pose.a3]]) {
      for (const side of [-1, 1]) {
        const h = horn(add3(centre, mul3(n, side * half)), n, side, angle);
        put(side * (half + 0.6), add3(centre, mul3(n, side * half)), ink(S(h.paths, { tone: "mid" }) + h.marks));
      }
    }

    // wrist: a short bracket, the roll servo along the gripper, the gripper plate and two fingers
    const g = inPlane(pose.a3);
    const wristFrom = c.wrist;
    for (const side of [-1, 1]) {
      const b = box(add3(add3(wristFrom, mul3(g, -4)), mul3(n, side * 11)), g, n, 12, 1.2, 8, 3.6);
      put(side * 11, add3(add3(wristFrom, mul3(g, 2)), mul3(n, side * 11)), ink(S(b.paths, { tone: "mid" })));
    }
    const roll = box(add3(wristFrom, mul3(g, 6)), g, n, 9, 15, 8, 1);
    put(0, add3(wristFrom, mul3(g, 10)), ink(S(roll.paths, { tone: "mid" })));
    const palm = box(add3(wristFrom, mul3(g, 15)), g, n, 2.4, 22, 9, 0.6);
    put(0.2, add3(wristFrom, mul3(g, 16)), ink(S(palm.paths, { tone: "mid" })));
    const open = 9.6 - pose.grip * 3.4; // half-gap between the fingers: 9.6 open, 6.2 on a fruit
    for (const side of [-1, 1]) {
      const f = box(add3(add3(wristFrom, mul3(g, 17.4)), mul3(n, side * open)), g, n, 17, 1.6, 6, 0.8);
      const pad = box(add3(add3(wristFrom, mul3(g, 27)), mul3(n, side * (open - 1))), g, n, 6.5, 0.8, 5, 0.3);
      put(side * open, add3(add3(wristFrom, mul3(g, 26)), mul3(n, side * open)), S(f.paths, { tone: "hi", lit: true }));
      put(side * (open - 0.9), add3(add3(wristFrom, mul3(g, 30)), mul3(n, side * (open - 1))), ink(S(pad.paths, { tone: "lo" })));
    }
    if (carried) put(0.1, c.tip, `<g data-carried>${carried}</g>`);

    out.sort((p, q) => p.layer - q.layer || p.key - q.key);
    return out;
  }

  // A wheel turns by `turn` radians: chevron lugs across the tread, faded toward the limbs, and the
  // five hub screws. Both are rebuilt live; the tyre itself is round, so it never changes.
  const w2 = M.WHEEL_W / 2;
  const tread = (F, turn) => {
    const r = M.WHEEL_R;
    const edge = w2 - 1.6;
    // each half-row ends on its own seam at the shoulder, and the two halves meet at the crown
    const lean = 0.16;
    const half = (s0, s1, phase, twist, seams) => G.ribsOf(F, s0, s1, r, 26, P, { phase, twist, fade: [0.12, 0.5], seams });
    return k.fadedSvg([...half(-edge, 0, turn, lean, "first"), ...half(0, edge, turn + lean, -lean, "last")], { tone: "lo" });
  };
  const hub = (F, turn) => D(G.dotsOf(F, w2, M.WHEEL_R - 9.4, 5, P, { phase: turn, all: true }), { size: 0.5, tone: "mid" });

  return { pieces, svg: (pose, opts) => pieces(pose, opts).map((p) => p.svg).join(""), tread, hub };
}
