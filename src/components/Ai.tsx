'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { gsap } from 'gsap';
import { ai, frames } from '@/data/site';
import { ease, onScroll } from '@/engine';
import { FrameVisual } from './figures/AiVisuals';
import { Sky } from './Sky';
import './ai.css';

// Chapter 02, the arc: the AI projects stand on a shallow curve of frosted cards, the one in focus in
// the middle, up front, inside the hero's apricot corners, the others falling back and turning in
// toward it on either side. The arc turns on its own, a few seconds on each project, and the words at
// the foot follow it; a click or the arrow keys bring a card to the middle, and a click on the middle
// card opens it. The arch's cards come down from Robotics into the cards' icons (Bridge.tsx), the top
// one into the middle card, so the arc starts on it.

const N = frames.length;
export const AI_MID = Math.floor((N - 1) / 2); // the card the arch's top card drops into
const HOLD = 3800; // ms the arc rests on each project
const two = (n: number) => String(n + 1).padStart(2, '0');
// a card's place on the arc, from the middle: -2 … 2
const slot = (i: number, a: number) => ((i - a + N + Math.floor(N / 2)) % N) - Math.floor(N / 2);

type Mode = 'scene' | 'grid';

export function Ai() {
  const section = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const print = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('scene');
  const [still, setStill] = useState(false); // reduced motion: the arc only turns when asked
  const [active, setActive] = useState(AI_MID);
  const [held, setHeld] = useState(false); // a hand on the arc, or the keyboard in it
  const [seen, setSeen] = useState(false); // on screen
  const [bridging, setBridging] = useState(false); // the arch's cards are on their way (Bridge.tsx)
  const [open, setOpen] = useState<number | null>(null);
  const was = useRef<number[]>(frames.map((_, i) => slot(i, AI_MID)));
  const openedFrom = useRef<HTMLButtonElement | null>(null);
  const openedAt = useRef(0);
  const closing = useRef(false);

  // phones get a grid you scroll past; reduced motion keeps the arc, still
  useEffect(() => {
    const narrow = matchMedia('(max-width: 899px)');
    const calm = matchMedia('(prefers-reduced-motion: reduce)');
    const pick = () => { setMode(narrow.matches ? 'grid' : 'scene'); setStill(calm.matches); };
    pick();
    narrow.addEventListener('change', pick);
    calm.addEventListener('change', pick);
    return () => { narrow.removeEventListener('change', pick); calm.removeEventListener('change', pick); };
  }, []);

  // on screen, and whether the arch's cards are coming down into the arc
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => setSeen(entries[entries.length - 1].isIntersecting));
    io.observe(el);
    // while they fly, the arc waits on the middle card, where the arch's focused card lands
    const mo = new MutationObserver(() => {
      const on = el.dataset.bridge !== undefined;
      setBridging(on);
      if (on) { setActive(AI_MID); setHeld(false); }
    });
    mo.observe(el, { attributes: true, attributeFilter: ['data-bridge'] });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);

  // ------------------------------------------------------------ the arc
  // it turns on its own, one project after the next, unless a hand or the keyboard is on it
  useEffect(() => {
    if (mode !== 'scene' || still || !seen || bridging || open !== null || held) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % N), HOLD);
    return () => clearTimeout(t);
  }, [active, mode, still, seen, bridging, open, held]);

  // a card that goes round the back, from one end of the arc to the other, does not sweep across the
  // middle: it jumps to its new end and fades in there
  useLayoutEffect(() => {
    const now = frames.map((_, i) => slot(i, active));
    now.forEach((d, i) => {
      const el = cards.current[i]?.parentElement;
      if (!el || Math.abs(d - was.current[i]) <= 1) return;
      el.style.transition = 'none';
      void el.offsetWidth;
      el.style.transition = '';
      if (!still) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: 'ease-out' });
    });
    was.current = now;
  }, [active, still]);

  // ------------------------------------------------------------ opening a project
  const choose = (i: number) => {
    if (open !== null) return;
    if (mode === 'scene' && i !== active) { setActive(i); return; }
    openedFrom.current = cards.current[i];
    setActive(i);
    setOpen(i);
  };

  useLayoutEffect(() => {
    if (open === null || !print.current) return;
    openedAt.current = scrollY;
    const from = openedFrom.current?.getBoundingClientRect();
    const to = print.current.getBoundingClientRect();
    const tw = from && mode === 'scene'
      ? gsap.fromTo(print.current,
        { x: from.left - to.left, y: from.top - to.top, scaleX: from.width / to.width, scaleY: from.height / to.height, transformOrigin: '0 0' },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.85, ease: ease.out })
      : gsap.fromTo(print.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
    print.current.focus({ preventScroll: true });
    return () => { tw.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = useCallback(() => {
    if (open === null || closing.current) return;
    const el = print.current;
    const box = openedFrom.current;
    closing.current = true;
    const done = () => { closing.current = false; setOpen(null); box?.focus({ preventScroll: true }); };
    if (!el || !box || mode !== 'scene') { done(); return; }
    const to = el.getBoundingClientRect();
    const from = box.getBoundingClientRect();
    gsap.to(el, { x: from.left - to.left, y: from.top - to.top, scaleX: from.width / to.width, scaleY: from.height / to.height, transformOrigin: '0 0', duration: 0.6, ease: ease.inOut, onComplete: done });
  }, [open, mode]);

  // scrolling a third of a screen away puts it back
  useEffect(() => {
    if (open === null) return;
    const check = () => { if (Math.abs(scrollY - openedAt.current) > innerHeight * 0.35) close(); };
    const off = onScroll(check);
    addEventListener('scroll', check, { passive: true });
    return () => { off(); removeEventListener('scroll', check); };
  }, [open, close]);

  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape' && open !== null) { e.preventDefault(); close(); return; }
    if (open !== null || mode !== 'scene') return;
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = (active + step + N) % N;
    setActive(next);
    cards.current[next]?.focus({ preventScroll: true });
  };

  const current = frames[open ?? active];
  return (
    <section
      ref={section}
      id="ai"
      className="ai"
      data-mode={mode}
      data-open={open !== null ? '' : undefined}
      aria-labelledby="ai-title"
      onKeyDown={onKey}
    >
      <Sky className="ai__sky" />
      <header className="ai__head">
        <p className="ai__index"><span className="ai__bracket" aria-hidden="true" />02 / 03</p>
        <h2 id="ai-title" className="ai__title">{ai.title}</h2>
        <p className="ai__line">{ai.line[0]} <em>{ai.line[1]}</em></p>
      </header>

      <div
        className="ai__scene"
        onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHeld(true); }}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false); }}
      >
        <div className="ai__arc">
          {/* the orbit the cards ride, and the light pooled under the middle one */}
          <svg className="ai__orbit" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
            <ellipse cx="500" cy="150" rx="498" ry="148" />
            <ellipse className="ai__orbitIn" cx="500" cy="150" rx="330" ry="96" />
          </svg>
          <span className="ai__pool" aria-hidden="true" />
          <ol className="ai__cards" aria-label="AI projects, in order">
            {frames.map((f, i) => {
              const d = slot(i, active);
              const mid = mode === 'scene' && d === 0;
              return (
                <li key={f.id} className="acard" data-mid={mid ? '' : undefined} style={{ '--d': d, '--ad': Math.abs(d), '--i': i } as CSSProperties}>
                  <button
                    type="button"
                    ref={(el) => { cards.current[i] = el; }}
                    className="acard__plate"
                    onClick={() => choose(i)}
                    aria-label={mid || mode === 'grid' ? `Open ${f.name}` : `Bring ${f.name} to the middle`}
                    aria-current={mid ? 'true' : undefined}
                  >
                    {/* the arch's cards land on these (Bridge.tsx) */}
                    <span className="detect__box acard__icon">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="detect__mark" src={f.mark} alt="" width={512} height={512} />
                    </span>
                    <span className="acard__name">{f.name}</span>
                    <span className="acard__task">{f.task}</span>
                    <span className="acard__af" aria-hidden="true"><i /><i /><i /><i /></span>
                  </button>
                  {mode === 'grid' && <p className="acard__line">{f.line}</p>}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* the project in focus, under the middle card */}
      {mode === 'scene' && (
        <div className="ai__foot">
          <div className="ai__cap" aria-live="polite">
            {frames.map((f, i) => (
              <div key={f.id} className="ai__capItem" data-active={i === active ? '' : undefined} aria-hidden={i !== active} inert={i !== active}>
                <p className="ai__capIndex">{two(i)} / {two(N - 1)}</p>
                <p className="ai__capName">{f.name}</p>
                <p className="ai__capLine">{f.line}</p>
                {/* Robotics' open button, so both chapters open a project the same way */}
                <button type="button" className="robotics__openBtn" onClick={() => choose(i)}>
                  Open {f.name}
                  <span className="robotics__openArrow" aria-hidden="true">
                    <svg viewBox="0 0 12 12" width="12" height="12"><path d="M3 9 9 3M4 3h5v5" /></svg>
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {open !== null && (
        <div className="ai__print" role="dialog" aria-modal="false" aria-labelledby="ai-print-name">
          <div className="ai__printText">
            <p className="ai__printIndex">{two(open)} / {two(N - 1)}</p>
            <h3 id="ai-print-name" className="ai__printName">{current.name}</h3>
            <p className="ai__printLine">{current.line}</p>
            {current.stat && <p className="ai__stat"><span>{current.stat.value}</span>{current.stat.label}</p>}
            {current.chip && <p className="ai__chip">{current.chip}</p>}
            {current.readouts.length > 0 && <ul className="ai__specs" aria-label="Built with">
              {current.readouts.map((s) => <li key={s}>{s}</li>)}
            </ul>}
            <button type="button" className="ai__back" onClick={close}><span aria-hidden="true">← </span>Back to the projects</button>
          </div>
          <div className="ai__printFrame" ref={print} tabIndex={-1}>
            <button type="button" className="ai__close" onClick={close} aria-label="Close">×</button>
            {current.print || current.image
              // eslint-disable-next-line @next/next/no-img-element
              ? <img className="ai__printImg" src={current.print ?? current.image} alt={current.imageAlt ?? ''} />
              : current.visual && <FrameVisual kind={current.visual} className="ai__printVisual" />}
          </div>
        </div>
      )}
    </section>
  );
}
