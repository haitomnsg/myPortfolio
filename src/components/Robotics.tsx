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

// Chapter 01, the focus ring (docs/ROBOTICS_MOCKUP_PROMPT.md): the robots stand on a wheel seen by
// the hero's camera. Scroll turns it one robot at a time, with a pause on each; the robot in front is
// sharp and large, the rest fall back and out of focus. Click a robot and it comes to the front and
// opens; the open view runs its live figure.

const N = robots.length;
const STEP = 0.7; // screens of scroll per robot
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
  const nowRef = useRef<HTMLDivElement>(null);
  const rim = useRef<SVGPathElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const dots = useRef<(SVGCircleElement | null)[]>([]);
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
    const place = () => {
      const st = stage.current;
      if (!st) return;
      const w = st.clientWidth;
      const h = st.clientHeight;
      // cards stand on a wide circle whose centre is far below the stage, so the ring fans out
      const R = 1.35 * w;
      const gap = Math.asin(Math.min(0.99, (0.47 * w) / R)) / 2;
      const cx = w / 2;
      // the front card stands just under the heading and the robot's text, whichever ends lower, and
      // the cards shrink to fit the height left, so nothing overlaps on a short, wide screen
      const below = (el: HTMLElement | null) => (el ? el.offsetTop + el.offsetHeight : 0);
      const top = Math.max(h * 0.34, below(headRef.current) + 32, below(nowRef.current) + 32);
      const cw = Math.round(Math.min(400, 0.22 * w, (h - top - 64 - 40) / 0.78));
      const cardW = `${Math.max(220, cw)}px`;
      if (st.style.getPropertyValue('--card-w') !== cardW) st.style.setProperty('--card-w', cardW);
      const a = open === null ? (turn.current = turnOf(rawAt())) : turn.current;
      // the rim runs under the cards' feet: the front card's height plus a little air
      const foot = (cards.current[0]?.offsetHeight ?? 400) + 26;
      const rimR = R - foot;
      if (rim.current) {
        const arc = (u: number) => `${(cx + rimR * Math.sin(u)).toFixed(1)} ${(top + R - rimR * Math.cos(u)).toFixed(1)}`;
        const span = gap * 2.6;
        rim.current.setAttribute('d', `M${arc(-span)} A${rimR.toFixed(1)} ${rimR.toFixed(1)} 0 0 1 ${arc(span)}`);
      }
      cards.current.forEach((el, i) => {
        if (!el) return;
        let o = ((i - a) % N + N) % N;
        if (o > N / 2) o -= N;
        const t = o * gap;
        const x = R * Math.sin(t);
        const y = R * (1 - Math.cos(t));
        const d = Math.abs(o);
        const scale = 1 - 0.19 * Math.min(d, 2.4);
        el.style.transform = `translate3d(${(cx + x).toFixed(1)}px, ${(top + y).toFixed(1)}px, ${(-d * 90).toFixed(1)}px) translate(-50%, 0) rotate(${(t * 57.3).toFixed(2)}deg) rotateY(${(-o * 16).toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        el.style.setProperty('--blur', `${(d * 1.35).toFixed(2)}px`);
        el.style.setProperty('--focus', smooth(0.42, 0.06, d).toFixed(3));
        el.style.opacity = (1 - smooth(1.95, 2.45, d)).toFixed(3);
        el.style.zIndex = String(100 - Math.round(d * 10));
        el.tabIndex = d < 0.5 ? 0 : -1;
        const dot = dots.current[i];
        if (dot) {
          dot.setAttribute('cx', (cx + rimR * Math.sin(t)).toFixed(1));
          dot.setAttribute('cy', (top + R - rimR * Math.cos(t)).toFixed(1));
          dot.setAttribute('opacity', (1 - smooth(1.95, 2.45, d)).toFixed(2));
          dot.toggleAttribute('data-front', d < 0.5);
        }
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
    place();
    const onResize = () => place();
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
          <div className="robotics__now" ref={nowRef} aria-live="polite">
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
          {mode === 'ring' && (
            <svg className="robotics__rim" aria-hidden="true">
              <path ref={rim} />
              {robots.map((r, i) => <circle key={r.id} ref={(el) => { dots.current[i] = el; }} r="5" />)}
            </svg>
          )}
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
