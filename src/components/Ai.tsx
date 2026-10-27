'use client';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import { gsap } from 'gsap';
import { HUD } from '@/data/focus';
import { ai, frames } from '@/data/site';
import { ease, scrollState } from '@/engine';
import { FrameVisual } from './figures/AiVisuals';
import './ai.css';

// Chapter 02, the contact sheet (docs/SHOWCASE_CONCEPTS.md §4): every AI project is a frame on one
// roll of film, in time order. The film runs on its own once the section is on screen; scrolling
// nudges it along. A loupe sits in the middle, and the frame under it is sharp and a little larger.
// Hover holds the film and brings the loupe to the frame under the pointer; click prints the frame.

const N = frames.length;
const COPIES = 4; // the roll repeats, so it never runs out
const BASE = 34; // px per second the film runs on its own
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const two = (n: number) => String(n + 1).padStart(2, '0');
const years = `${frames[0].date.slice(0, 4)} – ${frames[N - 1].date.slice(2, 4)}`;

type Mode = 'film' | 'row';
type Hold = { k: number; by: 'pointer' } | { i: number; by: 'focus' } | null;

export function Ai() {
  const section = useRef<HTMLElement>(null);
  const clip = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const loupe = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const print = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('film');
  const [shown, setShown] = useState(0); // the frame under the loupe
  const [open, setOpen] = useState<number | null>(null);
  const hold = useRef<Hold>(null);
  const focusHold = useRef<number | null>(null);
  const openRef = useRef<number | null>(null);
  const openedFrom = useRef<HTMLButtonElement | null>(null);
  const openedAt = useRef(0);
  const closing = useRef(false);
  const offset = useRef(-1); // where the film stands, px; -1 until measured
  openRef.current = open;

  // phones and reduced motion get a strip you swipe, with no loupe and no running film
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
      return;
    }
    let raf = 0;
    let visible = false;
    let last = 0;
    let speed = 0;
    let lx = 0; // the loupe's centre, in the clip's coordinates
    let shownNow = -1;
    // the film's position wraps over one roll, placed so that the focusable copy (the second) is the
    // one that passes under the loupe: frame i of it sits there at offset lo + i * pitch
    const geo = { w: 0, fw: 0, pitch: 0, L: 0, lo: 0 };
    const measure = () => {
      const c = clip.current;
      const a = cards.current[0];
      const b = cards.current[1];
      if (!c || !a || !b) return;
      geo.w = c.clientWidth;
      geo.fw = a.offsetWidth;
      geo.pitch = b.offsetLeft - a.offsetLeft;
      geo.L = N * geo.pitch;
      geo.lo = N * geo.pitch + geo.fw / 2 - geo.w / 2;
      if (offset.current < 0) offset.current = geo.lo; // frame 01 under the loupe on arrival
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
      if (h?.by === 'focus') off += (lo + h.i * pitch - off) * (1 - Math.exp(-dt * 6)); // a keyboard focus brings its frame to the loupe
      off = ((((off - lo) % L) + L) % L) + lo;
      offset.current = off;
      if (track.current) track.current.style.transform = `translate3d(${(-off).toFixed(2)}px,0,0)`;
      // the loupe glides to the held frame, or back to the middle
      const lwant = h?.by === 'pointer' ? h.k * pitch + fw / 2 - off : h?.by === 'focus' ? (N + h.i) * pitch + fw / 2 - off : w / 2;
      lx += (lwant - lx) * (1 - Math.exp(-dt * 9));
      if (loupe.current) loupe.current.style.transform = `translate3d(${(lx - w / 2).toFixed(2)}px,0,0)`;
      // every frame on screen: sharp and large under the loupe, soft and small away from it
      let near = -1;
      let nd = Infinity;
      cards.current.forEach((el, k) => {
        if (!el) return;
        const cx = k * pitch + fw / 2 - off;
        if (cx < -fw || cx > w + fw) { el.style.setProperty('--focus', '0'); el.style.zIndex = ''; return; }
        const d = Math.abs(cx - lx) / pitch;
        const f = smooth(0.95, 0.22, d);
        el.style.setProperty('--focus', f.toFixed(3));
        el.style.zIndex = String(10 + Math.round(f * 10));
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
    const ro = new ResizeObserver(measure); // the clip's width, not only the window's
    if (clip.current) ro.observe(clip.current);
    return () => { io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf); };
    // `close` only reads refs; it is stable enough for the loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // the pointer on the film: the loupe goes to the frame under it and the film waits
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
    const paper = openedFrom.current?.querySelector('.fcard__paper');
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
    const paper = card?.querySelector('.fcard__paper');
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
      <header className="ai__head">
        <p className="ai__index"><span className="ai__bracket" aria-hidden="true" />02 / 04</p>
        <h2 id="ai-title" className="ai__title">{ai.title}</h2>
        <p className="ai__line">{ai.line[0]} <em>{ai.line[1]}</em></p>
      </header>
      <p className="ai__roll"><span className="ai__bracket ai__bracket--r" aria-hidden="true" />{two(N - 1)} frames · {years}</p>

      <div className="ai__band">
        <div className="ai__film" ref={clip} onPointerMove={onMove} onPointerLeave={onLeave}>
          <div className="ai__track" ref={track} role="list" aria-label="AI projects, in order">
            {Array.from({ length: copies }, (_, c) => (
              // the copies are the same roll again: the middle one speaks to assistive tech, the rest only to the pointer
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
                        aria-label={`Print ${f.name}`}
                        tabIndex={copies > 1 && c !== 1 ? -1 : 0}
                        style={{ '--focus': 0 } as CSSProperties}
                      >
                        <span className="fcard__date">{f.date} · {two(i)}</span>
                        <span className="fcard__paper">
                          <span className="fcard__tag"><span>Fig {i + 1}</span><span>{f.name}</span></span>
                          <span className="fcard__img">
                            {f.image
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={f.image} alt={f.imageAlt ?? ''} width={1200} height={1000} loading={c === 1 && i < 4 ? 'eager' : 'lazy'} />
                              : <FrameVisual kind={f.visual} className="fcard__visual" />}
                          </span>
                          {f.keeper && (
                            <svg className="fcard__mark" viewBox="0 0 300 260" aria-hidden="true">
                              <path d="M46 72C70 26 180 10 246 34c62 22 56 112 28 160-30 52-150 62-214 30C-6 190 4 110 72 60" />
                            </svg>
                          )}
                        </span>
                        {mode === 'row' && <span className="fcard__line">{f.line}</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="ai__loupe" ref={loupe} aria-hidden="true"><i /><i /><i /><i /></div>
        </div>
      </div>

      {/* what the loupe is on, hanging from the left margin */}
      {mode === 'film' && (
        <div className="ai__cap" aria-live="polite">
          <div className="ai__capStack">
            {frames.map((f, i) => (
              <div key={f.id} className="ai__capItem" data-active={i === shown ? '' : undefined} aria-hidden={i !== shown} inert={i !== shown}>
                <p className="ai__capLine">{f.line}</p>
                <p className="ai__capRead"><b>{f.name}</b>{[...f.readouts, ...(f.chip ? [f.chip] : [])].map((r) => <span key={r}> · {r}</span>)}</p>
              </div>
            ))}
          </div>
          <p className="ai__iso">{HUD.iso}<span className="ai__bracket ai__bracket--br" aria-hidden="true" /></p>
        </div>
      )}
      <p className="ai__hint"><span className="ai__mouse" aria-hidden="true" />{mode === 'film' ? 'The film runs on its own · hover holds a frame · click prints it' : 'Swipe the film · tap a frame to print it'}</p>

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
