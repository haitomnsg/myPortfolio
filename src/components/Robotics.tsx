'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { gsap } from 'gsap';
import { robotics, robots } from '@/data/site';
import { ease, scrollToTarget } from '@/engine';
import { FaceTrackerFigure } from './figures/FaceTrackerFigure';
import { JeevIFigure } from './figures/JeevIFigure';
import { ObstacleCarFigure } from './figures/ObstacleCarFigure';
import { RescueFigure } from './figures/RescueFigure';
import { TomatoBotFigure } from './figures/TomatoBotFigure';
import './robotics.css';

// Chapter 01, the focus ring (docs/ROBOTICS_MOCKUP_PROMPT.md): the robots stand on an arch, a half
// circle of cards that each lean along it. Scroll turns it one robot at a time, with a pause on each;
// the robot at the top wears the hero's focus corners and its text sits inside the arch. Click a
// robot and it comes to the top and opens; the open view runs its live figure.

const N = robots.length;
const STEP = 0.7; // screens of scroll per robot
const ARC = 0.74; // radians between neighbouring cards: five robots span the half circle
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
// a turn that holds each robot at the front for the middle 60% of its step
const turnOf = (raw: number) => {
  const i = Math.floor(raw);
  return Math.min(N - 1, i + smooth(0.3, 0.7, raw - i));
};
const two = (n: number) => String(n + 1).padStart(2, '0');

type Mode = 'ring' | 'row';

export function Robotics() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const frame = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('ring');
  const [front, setFront] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [live, setLive] = useState(false); // the open view's figure mounts once the card has landed
  const turn = useRef(0);
  const pending = useRef<number | null>(null);
  const openedAt = useRef(0);
  const closing = useRef(false);

  // phones and reduced motion get a plain row instead of the wheel
  useEffect(() => {
    const narrow = matchMedia('(max-width: 899px)');
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    const pick = () => setMode(narrow.matches || still.matches ? 'row' : 'ring');
    pick();
    narrow.addEventListener('change', pick);
    still.addEventListener('change', pick);
    return () => { narrow.removeEventListener('change', pick); still.removeEventListener('change', pick); };
  }, []);

  // where the wheel stands for a scroll position
  const rawAt = useCallback(() => {
    const el = track.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const run = r.height - innerHeight;
    return run > 0 ? Math.min(1, Math.max(0, -r.top / run)) * (N - 1) : 0;
  }, []);
  const scrollFor = useCallback((i: number) => {
    const el = track.current;
    if (!el) return 0;
    const top = el.getBoundingClientRect().top + scrollY;
    return top + (i / (N - 1)) * (el.offsetHeight - innerHeight);
  }, []);

  // ------------------------------------------------------------ the wheel
  useEffect(() => {
    if (mode !== 'ring') {
      cards.current.forEach((el) => { if (el) { el.removeAttribute('style'); el.style.setProperty('--i', String(cards.current.indexOf(el))); el.tabIndex = 0; } });
      return;
    }
    let raf = 0;
    let visible = false;
    let shown = -1;
    // the arch: cards of one size stand on a half circle, each leaning along it, the front one at the
    // top; the ends dip below the stage, where a card leaving one side comes back on the other
    const geo = { cx: 0, cy: 0, R: 0, cw: 0, ch: 0 };
    const measure = () => {
      const st = stage.current;
      if (!st) return;
      const w = st.clientWidth;
      const h = st.clientHeight;
      const cw = Math.round(Math.max(220, Math.min(360, 0.2 * w, 0.4 * h)));
      st.style.setProperty('--card-w', `${cw}px`);
      const ch = cards.current[0]?.offsetHeight ?? cw;
      const R = (cw + 18) / ARC;
      // the top card clears the header and the arch's outer edge clears the heading's corner; the
      // cards at either side sit low, partly out of the stage
      const out = Math.hypot(R + ch / 2, cw / 2) + 16;
      const head = headRef.current;
      const hx = head ? w / 2 - (head.offsetLeft + head.offsetWidth) : out;
      const clear = head && hx < out ? head.offsetTop + head.offsetHeight + Math.sqrt(out * out - hx * hx) : 0;
      const cy = Math.max(h * 0.8, 112 + ch / 2 + R, clear);
      Object.assign(geo, { cx: w / 2, cy, R, cw, ch });
      // the robot's text sits inside the arch, under the top card
      st.style.setProperty('--arch-x', `${(w / 2).toFixed(1)}px`);
      st.style.setProperty('--arch-y', `${cy.toFixed(1)}px`);
      st.style.setProperty('--arch-in', `${(R - ch / 2).toFixed(1)}px`);
    };
    const place = () => {
      const { cx, cy, R, cw, ch } = geo;
      const a = open === null ? (turn.current = turnOf(rawAt())) : turn.current;
      cards.current.forEach((el, i) => {
        if (!el) return;
        let o = ((i - a) % N + N) % N;
        if (o > N / 2) o -= N;
        const t = o * ARC;
        const d = Math.abs(o);
        el.style.transform = `translate3d(${(cx + R * Math.sin(t) - cw / 2).toFixed(1)}px, ${(cy - R * Math.cos(t) - ch / 2).toFixed(1)}px, 0) rotate(${(t * 57.2958).toFixed(2)}deg)`;
        el.style.setProperty('--focus', smooth(0.42, 0.06, d).toFixed(3));
        el.style.opacity = (1 - smooth(2.1, 2.45, d)).toFixed(3);
        el.style.zIndex = String(100 - Math.round(d * 10));
        el.tabIndex = d < 0.5 ? 0 : -1;
      });
      const near = Math.round(a);
      if (near !== shown) { shown = near; setFront(near); }
      const p = pending.current;
      if (p !== null && Math.abs(a - p) < 0.02) { pending.current = null; setOpen(p); }
    };
    const tick = () => {
      place();
      if (open !== null && !closing.current && Math.abs(scrollY - openedAt.current) > innerHeight * 0.35) close();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    const io = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    if (section.current) io.observe(section.current);
    measure();
    place();
    const onResize = () => { measure(); place(); };
    addEventListener('resize', onResize);
    return () => { io.disconnect(); cancelAnimationFrame(raf); removeEventListener('resize', onResize); };
    // `close` only reads refs; it is stable enough for the loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, open, rawAt]);

  // ------------------------------------------------------------ choosing and opening
  const choose = (i: number) => {
    if (open !== null) return;
    if (mode === 'row') { setOpen(i); return; }
    if (i === Math.round(turn.current) && Math.abs(turn.current - i) < 0.05) { setOpen(i); return; }
    pending.current = i;
    scrollToTarget(scrollFor(i));
  };

  // the card flies from its place on the wheel to the open frame, then the live figure takes over
  useLayoutEffect(() => {
    if (open === null || !frame.current) return;
    openedAt.current = scrollY;
    setLive(false);
    const card = cards.current[open]?.querySelector('.rcard__img');
    const to = frame.current.getBoundingClientRect();
    const from = card?.getBoundingClientRect();
    const tw = from
      ? gsap.fromTo(frame.current,
        { x: from.left - to.left, y: from.top - to.top, scaleX: from.width / to.width, scaleY: from.height / to.height, transformOrigin: '0 0' },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.85, ease: ease.out, onComplete: () => setLive(true) })
      : gsap.fromTo(frame.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, onComplete: () => setLive(true) });
    frame.current.focus({ preventScroll: true });
    return () => { tw.kill(); };
  }, [open]);

  function close() {
    if (open === null || closing.current) return;
    const at = open;
    const el = frame.current;
    const card = cards.current[at]?.querySelector('.rcard__img');
    closing.current = true;
    setLive(false);
    const done = () => { closing.current = false; setOpen(null); cards.current[at]?.focus({ preventScroll: true }); };
    if (!el || !card || mode === 'row') { done(); return; }
    const to = el.getBoundingClientRect();
    const from = card.getBoundingClientRect();
    gsap.to(el, { x: from.left - to.left, y: from.top - to.top, scaleX: from.width / to.width, scaleY: from.height / to.height, transformOrigin: '0 0', duration: 0.6, ease: ease.inOut, onComplete: done });
  }

  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape' && open !== null) { e.preventDefault(); close(); return; }
    if (open !== null || mode !== 'ring') return;
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const i = Math.min(N - 1, Math.max(0, front + step));
    scrollToTarget(scrollFor(i));
    requestAnimationFrame(() => cards.current[i]?.focus({ preventScroll: true }));
  };

  const shownRobot = robots[open ?? front];
  return (
    <section
      ref={section}
      className="robotics"
      data-mode={mode}
      data-open={open !== null ? '' : undefined}
      style={{ '--steps': N - 1, '--step': STEP } as CSSProperties}
      aria-labelledby="robotics-title"
      onKeyDown={onKey}
    >
      {/* the header's Robotics pill lands here, where the wheel pins, not on the band above */}
      <div className="robotics__track" ref={track} id="robotics">
      <div className="robotics__stage" ref={stage}>
        <header className="robotics__head" ref={headRef}>
          <p className="robotics__index"><span className="robotics__bracket" aria-hidden="true" />01 / 04</p>
          <h2 id="robotics-title" className="robotics__title">{robotics.title}</h2>
          <p className="robotics__line">{robotics.line[0]} <em>{robotics.line[1]}</em></p>
        </header>

        {mode === 'ring' && (
          <div className="robotics__now" aria-live="polite">
            {robots.map((r, i) => (
              <div key={r.id} className="robotics__nowItem" data-active={i === front ? '' : undefined} aria-hidden={i !== front} inert={i !== front}>
                <p className="robotics__nowIndex">{two(i)} / {two(N - 1)}</p>
                <p className="robotics__nowName">{r.name}</p>
                <p className="robotics__nowLine">{r.line}</p>
                <ul className="robotics__specs" aria-label="Built with">
                  {r.specs.map((s) => <li key={s}>{s}</li>)}
                </ul>
                <button type="button" className="robotics__openBtn" onClick={() => choose(i)}>Open {r.name}<span aria-hidden="true"> ↗</span></button>
              </div>
            ))}
          </div>
        )}

        <div className="robotics__ring" role="list" aria-label="Robots">
          {robots.map((r, i) => (
            <div role="listitem" key={r.id} className="robotics__item">
              <button
                type="button"
                ref={(el) => { cards.current[i] = el; }}
                className="rcard"
                onClick={() => choose(i)}
                aria-label={`Open ${r.name}`}
                style={{ '--i': i } as CSSProperties}
              >
                <span className="rcard__img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.image} alt={r.imageAlt} width={1280} height={1000} loading={i < 3 ? 'eager' : 'lazy'} />
                  <span className="rcard__af" aria-hidden="true"><i /><i /><i /><i /></span>
                </span>
                <span className="rcard__cap"><span>{two(i)}</span> {r.name}</span>
                {mode === 'row' && <span className="rcard__line">{r.line}</span>}
              </button>
            </div>
          ))}
        </div>

        {open !== null && (
          <div className="robotics__open" role="dialog" aria-modal="false" aria-labelledby="robot-open-name">
            <div className="robotics__openText">
              <p className="robotics__nowIndex">{two(open)} / {two(N - 1)}</p>
              <h3 id="robot-open-name" className="robotics__openName">{shownRobot.name}</h3>
              <p className="robotics__openLine">{shownRobot.line}</p>
              {shownRobot.stat && (
                <p className="robotics__stat"><span>{shownRobot.stat.value}</span>{shownRobot.stat.label}</p>
              )}
              {shownRobot.chip && <p className="robotics__chip">{shownRobot.chip}</p>}
              <ul className="robotics__specs" aria-label="Built with">
                {shownRobot.specs.map((s) => <li key={s}>{s}</li>)}
              </ul>
              <button type="button" className="robotics__back" onClick={close}><span aria-hidden="true">← </span>Back to the robots</button>
            </div>
            <div className="robotics__frame" ref={frame} tabIndex={-1}>
              <button type="button" className="robotics__close" onClick={close} aria-label="Close">×</button>
              {/* the still holds the frame while it flies; the live figure fades in over it */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="robotics__still" src={shownRobot.image} alt="" />
              {live && shownRobot.figure === 'tomatobot' && <TomatoBotFigure className="robotics__live" />}
              {live && shownRobot.figure === 'jeevi' && <JeevIFigure className="robotics__live" />}
              {live && shownRobot.figure === 'face-tracker' && <FaceTrackerFigure className="robotics__live" />}
              {live && shownRobot.figure === 'obstacle-car' && <ObstacleCarFigure className="robotics__live" />}
              {live && shownRobot.figure === 'rescue' && <RescueFigure className="robotics__live" />}
            </div>
          </div>
        )}
      </div>
      </div>
    </section>
  );
}
