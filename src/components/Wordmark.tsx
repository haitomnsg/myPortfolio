'use client';

import { useEffect, useRef } from 'react';
import { METRICS as M, SHISH, UPTA } from './wordmark-geometry';

/** "Ashish Gupta" with the A and G built as robot arms (assets/logo/explore/motion.html, pair 02).
 *  The A is two links on a base plate, opened by the piston that forms its crossbar; the G is a claw
 *  hinged on its left pin, with the crossbar on a wrist. On load the piston pushes the A open while the
 *  claw bites shut: both run on one damped spring, so they start, land and settle together.
 *  The markup is the rest pose, so it reads without JS and under reduced motion. */

type Pt = readonly [number, number];
const add = (p: Pt, q: Pt): Pt => [p[0] + q[0], p[1] + q[1]];
const polar = (r: number, a: number): Pt => [r * Math.cos(a), r * Math.sin(a)];
const mix = (p: Pt, q: Pt, k: number): Pt => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
const dist = (p: Pt, q: Pt) => Math.hypot(q[0] - p[0], q[1] - p[1]);
const ang = (p: Pt, q: Pt) => Math.atan2(q[1] - p[1], q[0] - p[0]);
const n = (v: number) => +v.toFixed(2);

const w = M.w;
const PIN = 0.62 * w;
const HOLE = 0.2 * w;
const TIP = 0.58 * w;

/* A: base B, apex E, foot T; the piston joins the legs at the crossbar height */
const B: Pt = [M.A.l + 1.05 * w, -0.88 * w];
const E: Pt = [(M.A.l + M.A.r) / 2, -M.capH + PIN];
const T: Pt = [M.A.r - TIP, -TIP];
const L1 = dist(B, E), L2 = dist(E, T), B0 = ang(B, E), A0 = ang(E, T);
const YC = -0.32 * M.capH;
const F1 = (B[1] - YC) / (B[1] - E[1]), G2 = (YC - E[1]) / (T[1] - E[1]);
const CYL = 0.55 * Math.abs(E[0] + G2 * (T[0] - E[0]) - (B[0] + F1 * (E[0] - B[0])));

function poseA(db: number, da: number) {
  const b = B0 + db, a = A0 + da;
  const e = add(B, polar(L1, b)), t = add(e, polar(L2, a));
  const p1 = add(B, polar(F1 * L1, b)), p2 = add(e, polar(G2 * L2, a)), d = dist(p1, p2);
  return { e, t, p1, p2, cyl: mix(p1, p2, Math.min(CYL, d) / (d || 1)) };
}

/* G: an ellipse on the stroke centre line, split at the left pin J1 into two jaws */
const CX = M.gx + (M.G.l + M.G.r) / 2, CY = (M.G.t + M.G.b) / 2;
const RX = (M.G.r - M.G.l) / 2 - w / 2, RY = (M.G.b - M.G.t) / 2 - w / 2;
const onG = (deg: number): Pt => [CX + RX * Math.cos((deg * Math.PI) / 180), CY + RY * Math.sin((deg * Math.PI) / 180)];
const arc = (a: number, b: number) =>
  `M${n(onG(a)[0])} ${n(onG(a)[1])}A${n(RX)} ${n(RY)} 0 ${Math.abs(b - a) > 180 ? 1 : 0} 0 ${n(onG(b)[0])} ${n(onG(b)[1])}`;
const J0 = onG(-42), J1 = onG(-195), J3 = onG(-352);
const BAR_END: Pt = [CX + 0.1 * RX, J3[1]];
const JAW_TOP = arc(-42, -195), JAW_BOTTOM = arc(-195, -352);

/* one spring drives both letters: q runs 0 -> 1, dipping below 0 first as the wind-up */
const WIND = 0.3, DIP = 0.08, FQ = 1.2, Z = 0.38;
const OMEGA = 2 * Math.PI * FQ, DECAY = Z * OMEGA, OMEGA_D = OMEGA * Math.sqrt(1 - Z * Z);
const LAND = WIND + (Math.PI - Math.atan(OMEGA_D / DECAY)) / OMEGA_D; // first time q reaches 1
const END = WIND + 6 / DECAY;
const CLOSED_A = 0.8, OPEN_G = 40, WRIST = -25, LEAN = -0.12;
function progress(t: number) {
  if (t >= END) return 1;
  if (t < WIND) {
    const x = Math.max(0, t) / WIND;
    return -DIP * (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  }
  const s = t - WIND;
  const spring = 1 - Math.exp(-DECAY * s) * (Math.cos(OMEGA_D * s) + (DECAY / OMEGA_D) * Math.sin(OMEGA_D * s));
  return -DIP + (1 + DIP) * spring;
}

const ring = { r: n((PIN + HOLE) / 2), fill: 'none', stroke: 'currentColor', strokeWidth: n(PIN - HOLE) };
const REST = poseA(0, 0);
const TOP = Math.min(-M.capH, M.G.t);
const VIEW = [M.A.l, TOP, M.right + 0.04 * 100 - M.A.l, -TOP] as const;

export function Wordmark({ className, label }: { className?: string; label: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const q = <T extends Element>(s: string) => svg.querySelector<T>(s)!;
    const [l1, l2, rod, cyl, pinE, tipA] = ['l1', 'l2', 'rod', 'cyl', 'pinE', 'tipA'].map((k) => q(`[data-p="${k}"]`));
    const [jawTop, jawBottom, wrist, tipG] = ['jawTop', 'jawBottom', 'wrist', 'tipG'].map((k) => q(`[data-p="${k}"]`));
    const line = (el: Element, p: Pt, r: Pt) => {
      el.setAttribute('x1', `${n(p[0])}`); el.setAttribute('y1', `${n(p[1])}`);
      el.setAttribute('x2', `${n(r[0])}`); el.setAttribute('y2', `${n(r[1])}`);
    };
    const rotate = (el: Element, deg: number, p: Pt) => el.setAttribute('transform', `rotate(${n(deg)} ${n(p[0])} ${n(p[1])})`);

    const draw = (t: number) => {
      const k = progress(t), ping = 1 + 0.4 * Math.max(0, 1 - Math.abs(t - LAND) / 0.16);
      const a = poseA(LEAN * (1 - k), CLOSED_A * (1 - k));
      line(l1, B, a.e); line(l2, a.e, a.t); line(rod, a.p1, a.p2); line(cyl, a.p1, a.cyl);
      pinE.setAttribute('transform', `translate(${n(a.e[0])} ${n(a.e[1])})`);
      tipA.setAttribute('cx', `${n(a.t[0])}`); tipA.setAttribute('cy', `${n(a.t[1])}`); tipA.setAttribute('r', `${n(TIP * ping)}`);
      // the jaws hit a hard stop when they close, so the overshoot bounces them open again instead of crossing
      const open = OPEN_G * Math.abs(1 - k);
      rotate(jawTop, -open, J1); rotate(jawBottom, open, J1); rotate(wrist, WRIST * (1 - k), J3);
      tipG.setAttribute('r', `${n(TIP * ping)}`);
    };

    let raf = 0, start = 0;
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      draw(Math.min(t, END));
      raf = t < END ? requestAnimationFrame(tick) : 0;
    };
    const play = (delay = 0) => {
      if (raf) return;
      draw(0);
      start = performance.now() + delay;
      raf = requestAnimationFrame(tick);
    };
    play(250);
    svg.setAttribute('data-live', ''); // the arms were held back in CSS until they could start from the wind-up pose

    // pointing at the logo replays it, once the previous run has settled
    const link = svg.closest('a');
    const replay = (e: PointerEvent) => { if (e.pointerType === 'mouse') play(); };
    link?.addEventListener('pointerenter', replay);
    return () => {
      cancelAnimationFrame(raf);
      link?.removeEventListener('pointerenter', replay);
    };
  }, []);

  return (
    <svg
      ref={ref}
      className={className}
      viewBox={VIEW.map(n).join(' ')}
      style={{ aspectRatio: `${n(VIEW[2])} / ${n(VIEW[3])}` }}
      role="img"
      aria-label={label}
      overflow="visible"
    >
      <path d={SHISH} fill="currentColor" />
      <path d={UPTA} fill="currentColor" />

      <g data-arm>
        <rect x={n(B[0] - 1.05 * w)} y={n(-0.38 * w)} width={n(2.1 * w)} height={n(0.38 * w)} rx={n(0.19 * w)} fill="currentColor" />
        <g stroke="currentColor" strokeLinecap="round" fill="none">
          <line data-p="rod" strokeWidth={n(0.34 * w)} x1={n(REST.p1[0])} y1={n(REST.p1[1])} x2={n(REST.p2[0])} y2={n(REST.p2[1])} />
          <line data-p="cyl" strokeWidth={n(0.64 * w)} strokeLinecap="butt" x1={n(REST.p1[0])} y1={n(REST.p1[1])} x2={n(REST.cyl[0])} y2={n(REST.cyl[1])} />
          <line data-p="l1" strokeWidth={n(w)} x1={n(B[0])} y1={n(B[1])} x2={n(REST.e[0])} y2={n(REST.e[1])} />
          <line data-p="l2" strokeWidth={n(w)} x1={n(REST.e[0])} y1={n(REST.e[1])} x2={n(REST.t[0])} y2={n(REST.t[1])} />
        </g>
        <circle {...ring} cx={n(B[0])} cy={n(B[1])} />
        <g data-p="pinE" transform={`translate(${n(REST.e[0])} ${n(REST.e[1])})`}>
          <circle {...ring} />
        </g>
        <circle data-p="tipA" cx={n(REST.t[0])} cy={n(REST.t[1])} r={n(TIP)} fill="var(--c-signal)" />
      </g>

      <g data-arm stroke="currentColor" strokeWidth={n(w)} strokeLinecap="round" fill="none">
        <g data-p="jawTop">
          <path d={JAW_TOP} />
          <circle {...ring} cx={n(J0[0])} cy={n(J0[1])} />
        </g>
        <g data-p="jawBottom">
          <path d={JAW_BOTTOM} />
          <g data-p="wrist">
            <line x1={n(J3[0])} y1={n(J3[1])} x2={n(BAR_END[0])} y2={n(BAR_END[1])} />
            <circle data-p="tipG" cx={n(BAR_END[0])} cy={n(BAR_END[1])} r={n(TIP)} fill="var(--c-signal)" stroke="none" />
          </g>
          <circle {...ring} cx={n(J3[0])} cy={n(J3[1])} />
        </g>
        <circle {...ring} cx={n(J1[0])} cy={n(J1[1])} />
      </g>
    </svg>
  );
}
