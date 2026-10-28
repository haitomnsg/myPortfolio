'use client';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import { gsap } from 'gsap';
import { ai, frames } from '@/data/site';
import { ease, scrollState } from '@/engine';
import { FrameVisual } from './figures/AiVisuals';
import { Sky } from './Sky';
import './ai.css';

// Chapter 02, the reel (docs/SHOWCASE_CONCEPTS.md §4): every AI project is a frame on one roll of
// film, in time order, under a slow moving sky. The whole strip runs, holes, frames and edge print
// together, on its own once the section is on screen; scrolling nudges it along. Every frame shows
// as it is; only the edge print of the frame at the middle brightens, and the caption names it.
// Hover holds the film on the frame under the pointer; click prints it. The frames are sized from
// the band's height, so the section fills one screen exactly.

const N = frames.length;
const COPIES = 4; // the roll repeats, so it never runs out
const BASE = 34; // px per second the film runs on its own
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const two = (n: number) => String(n + 1).padStart(2, '0');
const FILM_Y = 2 * 30 + 30; // the strip's height past the image: two hole rows and the edge print (ai.css)

type Mode = 'film' | 'row';
type Hold = { k: number; by: 'pointer' } | { i: number; by: 'focus' } | null;

export function Ai() {
  const section = useRef<HTMLElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const clip = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const print = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('film');
  const [shown, setShown] = useState(0); // the lit frame
  const [open, setOpen] = useState<number | null>(null);
  const hold = useRef<Hold>(null);
  const focusHold = useRef<number | null>(null);
  const openRef = useRef<number | null>(null);
  const openedFrom = useRef<HTMLButtonElement | null>(null);
  const openedAt = useRef(0);
  const closing = useRef(false);
  const offset = useRef(-1); // where the film stands, px; -1 until measured
  openRef.current = open;

  // phones and reduced motion get a strip you swipe, and the film does not run
  useEffect(() => {
    const narrow = matchMedia('(max-width: 899px)');
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    const pick = () => setMode(narrow.matches || still.matches ? 'row' : 'film');
    pick();
    narrow.addEventListener('change', pick);
    still.addEventListener('change', pick);
    return () => { narrow.removeEventListener('change', pick); still.removeEventListener('change', pick); };
  }, []);

  // ------------------------------------------------------------ the film
  useEffect(() => {
    if (mode !== 'film') {
      cards.current.forEach((el) => el?.style.setProperty('--focus', '1'));
      // the swiped strip's frames, on whole pixels too
      const size = () => {
        const fw = Math.floor((Math.min(innerWidth * 0.72, 340) + 14) / 6) * 6 - 14;
        section.current?.style.setProperty('--gap', '14px');
        section.current?.style.setProperty('--fw', `${fw}px`);
      };
      size();
      addEventListener('resize', size);
      return () => removeEventListener('resize', size);
    }
    let raf = 0;
    let visible = false;
    let last = 0;
    let speed = 0;
    let lx = 0; // where the light falls, in the clip's coordinates
    let shownNow = -1;
    // the film's position wraps over one roll, placed so that the focusable copy (the second) is the
    // one that passes the middle: frame i of it sits there at offset lo + i * pitch
    const geo = { w: 0, fw: 0, pitch: 0, L: 0, lo: 0 };
    const measure = () => {
      const c = clip.current;
      const a = cards.current[0];
      const b = cards.current[1];
      const bd = band.current;
      if (!c || !a || !b || !bd || !section.current) return;
      // the image takes the band's height less the strip's own rows, at most 42% of the width. The
      // frames butt edge to edge, so the gap and the six holes' pitch land on whole pixels, or each
      // join would show a hairline
      const pad = parseFloat(getComputedStyle(bd).paddingTop) * 2;
      const gap = 2 * Math.round(Math.min(22, Math.max(14, innerWidth * 0.013)) / 2);
      const raw = Math.max(180, Math.min((bd.clientHeight - pad - FILM_Y) * 1.2, bd.clientWidth * 0.42));
      const fw = Math.floor((raw + gap) / 6) * 6 - gap;
      section.current.style.setProperty('--gap', `${gap}px`);
      section.current.style.setProperty('--fw', `${fw}px`);
      geo.w = c.clientWidth;
      geo.fw = a.offsetWidth;
      geo.pitch = b.offsetLeft - a.offsetLeft;
      geo.L = N * geo.pitch;
      geo.lo = N * geo.pitch + geo.fw / 2 - geo.w / 2;
      if (offset.current < 0) offset.current = geo.lo; // frame 01 in the middle on arrival
      if (lx === 0) lx = geo.w / 2;
    };
    const tick = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      const { w, fw, pitch, L, lo } = geo;
      const h: Hold = hold.current ?? (focusHold.current !== null ? { i: focusHold.current, by: 'focus' } : null);
      const held = h !== null || openRef.current !== null;
      // the film runs on its own; a scroll pushes it along; a hand on it brings it to a stop
      const want = held ? 0 : BASE + Math.min(420, Math.abs(scrollState().velocity) * 7);
      speed += (want - speed) * (1 - Math.exp(-dt * (want < speed ? 7 : 2.2)));
      let off = offset.current + speed * dt;
      if (h?.by === 'focus') off += (lo + h.i * pitch - off) * (1 - Math.exp(-dt * 6)); // a keyboard focus brings its frame to the middle
      off = ((((off - lo) % L) + L) % L) + lo;
      offset.current = off;
      if (track.current) track.current.style.transform = `translate3d(${(-off).toFixed(2)}px,0,0)`;
      // the light glides to the held frame, or back to the middle
      const lwant = h?.by === 'pointer' ? h.k * pitch + fw / 2 - off : h?.by === 'focus' ? (N + h.i) * pitch + fw / 2 - off : w / 2;
      lx += (lwant - lx) * (1 - Math.exp(-dt * 9));
      // the edge print brightens under the light; the frames themselves never change
      let near = -1;
      let nd = Infinity;
      cards.current.forEach((el, k) => {
        if (!el) return;
        const cx = k * pitch + fw / 2 - off;
        if (cx < -fw || cx > w + fw) { el.style.setProperty('--focus', '0'); return; }
        const d = Math.abs(cx - lx) / pitch;
        const f = smooth(0.9, 0.18, d);
        el.style.setProperty('--focus', f.toFixed(3));
        if (d < nd) { nd = d; near = k; }
      });
      if (near >= 0 && near % N !== shownNow) { shownNow = near % N; setShown(shownNow); }
      if (openRef.current !== null && !closing.current && Math.abs(scrollY - openedAt.current) > innerHeight * 0.35) close();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    const io = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible && !raf) { last = 0; raf = requestAnimationFrame(tick); }
    });
    if (section.current) io.observe(section.current);
    measure();
    const ro = new ResizeObserver(measure); // the band's size, not only the window's
    if (band.current) ro.observe(band.current);
    return () => { io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf); };
    // `close` only reads refs; it is stable enough for the loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // the pointer on the film: the light goes to the frame under it and the film waits
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || mode !== 'film' || !clip.current || !cards.current[1] || !cards.current[0]) return;
    const pitch = cards.current[1].offsetLeft - cards.current[0].offsetLeft;
    const fw = cards.current[0].offsetWidth;
    const x = e.clientX - clip.current.getBoundingClientRect().left + offset.current;
    const k = Math.min(COPIES * N - 1, Math.max(0, Math.round((x - fw / 2) / pitch)));
    hold.current = { k, by: 'pointer' };
  };
  const onLeave = () => { hold.current = null; };

  // ------------------------------------------------------------ printing a frame
  const choose = (k: number) => {
    if (open !== null) return;
    openedFrom.current = cards.current[k];
    setOpen(k % N);
  };

  useLayoutEffect(() => {
    if (open === null || !print.current) return;
    openedAt.current = scrollY;
    const paper = openedFrom.current?.querySelector('.fcard__img');
    const to = print.current.getBoundingClientRect();
    const from = paper?.getBoundingClientRect();
    const tw = from && mode === 'film'
      ? gsap.fromTo(print.current,
        { x: from.left - to.left, y: from.top - to.top, scaleX: from.width / to.width, scaleY: from.height / to.height, transformOrigin: '0 0' },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.85, ease: ease.out })
      : gsap.fromTo(print.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
    print.current.focus({ preventScroll: true });
    return () => { tw.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    if (open === null || closing.current) return;
    const el = print.current;
    const card = openedFrom.current;
    const paper = card?.querySelector('.fcard__img');
    closing.current = true;
    const done = () => { closing.current = false; setOpen(null); card?.focus({ preventScroll: true }); };
    if (!el || !paper || mode === 'row') { done(); return; }
    const to = el.getBoundingClientRect();
    const from = paper.getBoundingClientRect();
    gsap.to(el, { x: from.left - to.left, y: from.top - to.top, scaleX: from.width / to.width, scaleY: from.height / to.height, transformOrigin: '0 0', duration: 0.6, ease: ease.inOut, onComplete: done });
  }

  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape' && open !== null) { e.preventDefault(); close(); return; }
    if (open !== null || mode !== 'film' || focusHold.current === null) return;
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const i = (focusHold.current + step + N) % N;
    cards.current[N + i]?.focus({ preventScroll: true });
  };

  const copies = mode === 'film' ? COPIES : 1;
  const current = frames[open ?? shown];
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

      <div className="ai__band" ref={band}>
        <div className="ai__film" ref={clip} onPointerMove={onMove} onPointerLeave={onLeave}>
          <div className="ai__track" ref={track} role="list" aria-label="AI projects, in order">
            {Array.from({ length: copies }, (_, c) => (
              // the copies are the same roll again: the second speaks to assistive tech, the rest only to the pointer
              <div key={c} className="ai__copy" role={c === 1 || copies === 1 ? undefined : 'presentation'} aria-hidden={copies > 1 && c !== 1 ? true : undefined}>
                {frames.map((f, i) => {
                  const k = c * N + i;
                  return (
                    <div role={c === 1 || copies === 1 ? 'listitem' : undefined} key={f.id} className="ai__item">
                      <button
                        type="button"
                        ref={(el) => { cards.current[k] = el; }}
                        className="fcard"
                        onClick={() => choose(k)}
                        onFocus={() => { if (mode === 'film') focusHold.current = i; }}
                        onBlur={() => { if (focusHold.current === i) focusHold.current = null; }}
                        aria-label={`Open ${f.name}`}
                        tabIndex={copies > 1 && c !== 1 ? -1 : 0}
                        style={{ '--focus': 0 } as CSSProperties}
                      >
                        <span className="fcard__img">
                          {f.image
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={f.image} alt={f.imageAlt ?? ''} width={1200} height={1000} loading={c === 1 && i < 4 ? 'eager' : 'lazy'} />
                            : <FrameVisual kind={f.visual} className="fcard__visual" />}
                          {f.keeper && (
                            <svg className="fcard__mark" viewBox="0 0 300 260" aria-hidden="true">
                              <path d="M46 72C70 26 180 10 246 34c62 22 56 112 28 160-30 52-150 62-214 30C-6 190 4 110 72 60" />
                            </svg>
                          )}
                          {/* the Robotics open button's arrow disc, shown on the frame under the pointer */}
                          <span className="fcard__open" aria-hidden="true">
                            <svg viewBox="0 0 12 12" width="12" height="12"><path d="M3 9 9 3M4 3h5v5" /></svg>
                          </span>
                        </span>
                        {/* the edge print: frame number, name and date, printed on the film itself */}
                        <span className="fcard__edge"><b>▸ {two(i)}</b><span>{f.name}</span><span>{f.date}</span></span>
                        {mode === 'row' && <span className="fcard__line">{f.line}</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* the frame at the middle, from the left margin */}
      {mode === 'film' && (
        <div className="ai__foot">
          <div className="ai__cap" aria-live="polite">
            {frames.map((f, i) => (
              <div key={f.id} className="ai__capItem" data-active={i === shown ? '' : undefined} aria-hidden={i !== shown} inert={i !== shown}>
                <p className="ai__capIndex">{two(i)} / {two(N - 1)} · {f.date}</p>
                <p className="ai__capName">{f.name}</p>
                <p className="ai__capLine">{f.line}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {open !== null && (
        <div className="ai__print" role="dialog" aria-modal="false" aria-labelledby="ai-print-name">
          <div className="ai__printText">
            <p className="ai__printIndex">{current.date} · {two(open)} / {two(N - 1)}</p>
            <h3 id="ai-print-name" className="ai__printName">{current.name}</h3>
            <p className="ai__printLine">{current.line}</p>
            {current.stat && <p className="ai__stat"><span>{current.stat.value}</span>{current.stat.label}</p>}
            {current.chip && <p className="ai__chip">{current.chip}</p>}
            <ul className="ai__specs" aria-label="Built with">
              {current.readouts.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <button type="button" className="ai__back" onClick={close}><span aria-hidden="true">← </span>Back to the film</button>
          </div>
          <div className="ai__printFrame" ref={print} tabIndex={-1}>
            <button type="button" className="ai__close" onClick={close} aria-label="Close">×</button>
            {current.print || current.image
              // eslint-disable-next-line @next/next/no-img-element
              ? <img className="ai__printImg" src={current.print ?? current.image} alt={current.imageAlt ?? ''} />
              : <FrameVisual kind={current.visual} className="ai__printVisual" />}
          </div>
        </div>
      )}
    </section>
  );
}
