'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { gsap } from 'gsap';
import { ai, frames } from '@/data/site';
import { ease, onScroll } from '@/engine';
import { FrameVisual } from './figures/AiVisuals';
import { Sky } from './Sky';
import './ai.css';

// Chapter 02, recognised: the AI projects stand in one row on the field the way a model sees them, each
// mark bare inside a detection box, its class name on the box's tag and what reads it underneath. The
// hero's apricot focus box hunts from one to the next on its own, a few seconds on each, and the words
// at the foot follow it; the pointer or the keyboard takes it to the one they are on, and a click opens
// it. The arch's cards come down into the boxes from Robotics (Bridge.tsx), the top one into the middle
// box still in focus, so the focus box starts there.

const N = frames.length;
export const AI_MID = Math.floor((N - 1) / 2); // the box the arch's top card drops into
const HOLD = 3400; // ms the focus rests on each project
const LOCK = 620; // ms the focus box takes to reach a box; it locks (turns apricot) as it lands
const two = (n: number) => String(n + 1).padStart(2, '0');

type Mode = 'scene' | 'grid';

export function Ai() {
  const section = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const af = useRef<HTMLSpanElement>(null);
  const boxes = useRef<(HTMLButtonElement | null)[]>([]);
  const print = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('scene');
  const [still, setStill] = useState(false); // reduced motion: the focus only moves when asked
  const [active, setActive] = useState(AI_MID);
  const [held, setHeld] = useState<number | null>(null); // under the pointer or the keyboard
  const [seen, setSeen] = useState(false); // on screen
  const [bridging, setBridging] = useState(false); // the arch's cards are on their way (Bridge.tsx)
  const [open, setOpen] = useState<number | null>(null);
  const hunt = useRef<Animation | null>(null);
  const huntedFor = useRef(-1); // the box the focus box last went to
  const openedFrom = useRef<HTMLButtonElement | null>(null);
  const openedAt = useRef(0);
  const closing = useRef(false);

  // phones get a grid you scroll past; reduced motion keeps the row, still
  useEffect(() => {
    const narrow = matchMedia('(max-width: 899px)');
    const calm = matchMedia('(prefers-reduced-motion: reduce)');
    const pick = () => { setMode(narrow.matches ? 'grid' : 'scene'); setStill(calm.matches); };
    pick();
    narrow.addEventListener('change', pick);
    calm.addEventListener('change', pick);
    return () => { narrow.removeEventListener('change', pick); calm.removeEventListener('change', pick); };
  }, []);

  // on screen, and whether the arch's cards are coming down into the row
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => setSeen(entries[entries.length - 1].isIntersecting));
    io.observe(el);
    // while they fly, the focus waits on the middle box, where the arch's focused card lands
    const mo = new MutationObserver(() => {
      const on = el.dataset.bridge !== undefined;
      setBridging(on);
      if (on) { setActive(AI_MID); setHeld(null); }
    });
    mo.observe(el, { attributes: true, attributeFilter: ['data-bridge'] });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);

  // ------------------------------------------------------------ the focus box
  // it hunts on its own, one box after the next, unless a hand or the keyboard holds it
  useEffect(() => {
    if (mode !== 'scene' || still || !seen || bridging || open !== null || held !== null) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % N), HOLD);
    return () => clearTimeout(t);
  }, [active, mode, still, seen, bridging, open, held]);

  const place = useCallback(() => {
    const el = af.current;
    const box = boxes.current[active];
    const sc = scene.current;
    if (!el || !box || !sc) return;
    const s = sc.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    el.style.transform = `translate3d(${(b.left - s.left).toFixed(1)}px, ${(b.top - s.top).toFixed(1)}px, 0)`;
    el.style.width = `${b.width.toFixed(1)}px`;
    el.style.height = `${b.height.toFixed(1)}px`;
  }, [active]);

  // to a new box: it glides over, opening a little as it goes, overshoots, settles, and locks. Only a
  // move hunts: while the arch's cards fly it jumps to the middle box unseen, and is locked on landing
  useLayoutEffect(() => {
    const el = af.current;
    if (!el) return;
    if (bridging) el.style.transition = 'none';
    place();
    if (bridging) { void el.offsetWidth; el.style.transition = ''; }
    const moved = huntedFor.current !== active;
    huntedFor.current = active;
    if (bridging || still || !moved) { hunt.current?.cancel(); el.dataset.lock = ''; return; }
    delete el.dataset.lock;
    hunt.current?.cancel();
    hunt.current = el.animate(
      [{ scale: 1 }, { scale: 1.12, offset: 0.4 }, { scale: 0.96, offset: 0.78 }, { scale: 1 }],
      { duration: LOCK + 420, easing: 'cubic-bezier(0.2, 0.7, 0.1, 1)' },
    );
    const t = setTimeout(() => { el.dataset.lock = ''; }, LOCK);
    return () => clearTimeout(t);
  }, [active, mode, place, bridging, still]);

  // the row resizes with the screen; the box follows without gliding
  useEffect(() => {
    const sc = scene.current;
    if (!sc || mode !== 'scene') return;
    const ro = new ResizeObserver(() => {
      const el = af.current;
      if (!el) return;
      el.style.transition = 'none';
      place();
      requestAnimationFrame(() => { el.style.transition = ''; });
    });
    ro.observe(sc);
    return () => ro.disconnect();
  }, [mode, place]);

  const point = (i: number) => { if (open === null) { setHeld(i); setActive(i); } };
  const letGo = (i: number) => setHeld((h) => (h === i ? null : h));

  // ------------------------------------------------------------ opening a project
  const choose = (i: number) => {
    if (open !== null) return;
    openedFrom.current = boxes.current[i];
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
    if (open !== null || mode !== 'scene' || held === null) return;
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    boxes.current[(held + step + N) % N]?.focus();
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

      <div className="ai__scene" ref={scene}>
        <ol className="ai__row" style={{ '--n': N } as CSSProperties} aria-label="AI projects, in order">
          {frames.map((f, i) => (
            <li key={f.id} className="detect" data-active={mode === 'scene' && i === active ? '' : undefined} style={{ '--i': i } as CSSProperties}>
              <button
                type="button"
                ref={(el) => { boxes.current[i] = el; }}
                className="detect__box"
                onClick={() => choose(i)}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') point(i); }}
                onPointerLeave={() => letGo(i)}
                onFocus={() => point(i)}
                onBlur={() => letGo(i)}
                aria-label={`Open ${f.name}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="detect__mark" src={f.mark} alt="" width={512} height={512} />
                <span className="detect__corners" aria-hidden="true"><i /><i /><i /><i /></span>
                <span className="detect__tag" aria-hidden="true">{f.name.toLowerCase()}</span>
              </button>
              {f.readouts[0] && <p className="detect__meta">{f.readouts[0]}</p>}
              {mode === 'grid' && <p className="detect__name">{f.name}</p>}
              {mode === 'grid' && <p className="detect__line">{f.line}</p>}
            </li>
          ))}
        </ol>
        {/* the hero's focus box, on the project in focus */}
        {mode === 'scene' && <span className="ai__af" ref={af} aria-hidden="true"><i /><i /><i /><i /></span>}
      </div>

      {/* the project in focus, from the left margin */}
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
