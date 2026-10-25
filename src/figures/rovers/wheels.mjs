// Wheels for the small rovers, shared by the build and the live pages (it takes the kit as
// arguments). A wheel's axis is `F.a` (along y), its outer face at s = +w2.

/** A TT wheel's rubber tyre: rounded shoulders on a flat tread band. */
export const ttProfile = (r, w2) => [[-w2, r - 3.4], [-w2 + 2.2, r], [w2 - 2.2, r], [w2, r - 3.4]];
/** A mecanum wheel: two side plates and the band of rollers between them. */
export const mecanumProfile = (r, w2) => [[-w2, r - 5], [-w2 + 2.6, r], [w2 - 2.6, r], [w2, r - 5]];

/**
 * What turns: a TT tyre's chevron lugs, or a mecanum wheel's rollers (diagonal at 45°). Every line
 * ends on a seam at the shoulder or meets its partner at the crown, and fades toward the limbs.
 * `hand` (+1 or -1) mirrors a mecanum wheel's rollers: the front and back pairs are opposite hands.
 */
export function surface(k, G, P, F, kind, r, w2, turn, hand = 1) {
  if (kind === "tt") {
    const edge = w2 - 2.2;
    const lean = 0.14;
    const half = (s0, s1, phase, twist, seams) => G.ribsOf(F, s0, s1, r, 24, P, { phase, twist, fade: [0.12, 0.5], seams });
    return k.fadedSvg([...half(-edge, 0, turn, lean, "first"), ...half(0, edge, turn + lean, -lean, "last")], { tone: "lo" });
  }
  const edge = w2 - 2.6;
  return k.fadedSvg(G.ribsOf(F, -edge, edge, r, 9, P, { phase: turn, twist: 0.62 * hand, fade: [0.12, 0.5], seams: true }), { tone: "mid" });
}

/** The face you see: a TT wheel's yellow spoked hub, or a mecanum wheel's side plate and hub; `inner` for the inboard face. */
export function hub(k, G, P, F, kind, r, w2, inner = false) {
  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const D = (points, style) => k.dotsSvg(points, style);
  const at = (p) => k.iso(p, P);
  if (kind === "tt") {
    if (inner) return "";
    const rim = r - 7;
    const disc = G.disc(w2 - 3, w2 - 0.6, rim, F, P);
    const spokes = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      spokes.push(k.pathOf([at(G.pointOf(F, w2 - 0.6, 6, a)), at(G.pointOf(F, w2 - 0.6, rim - 3.4, a))]));
    }
    return `<g class="mat-yellow">${S(disc, { tone: "mid" })}${L(G.circleOf(F, w2 - 0.6, rim - 3.4, P) + G.circleOf(F, w2 - 0.6, 6, P), { tone: "lo" })}${L(spokes.join(""), { tone: "lo" })}</g>` + D([at(G.pointOf(F, w2 - 0.6, 0, 0))], { size: 0.9, tone: "mid" });
  }
  if (inner) {
    // seen from inboard: only the far side plate and its screws
    const back = G.disc(-w2, -w2 + 2.6, r - 6, F, P);
    return `<g class="mat-yellow">${S(back, { tone: "mid" })}</g>` + D(G.dotsOf(F, -w2, r - 10, 6, P, { all: true }), { size: 0.5, tone: "mid" });
  }
  const plate = G.disc(w2 - 2.6, w2, r - 6, F, P);
  const boss = G.disc(w2, w2 + 2, 7, F, P);
  const screws = D(G.dotsOf(F, w2, r - 10, 6, P, { all: true }), { size: 0.5, tone: "mid" });
  return `<g class="mat-yellow">${S(plate, { tone: "mid" })}</g>${screws}<g class="mat-dark">${S(boss, { tone: "mid" })}</g>`;
}
