'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import { gsap } from 'gsap';
import { apps, software, type App } from '@/data/site';
import { ease, scrollToTarget } from '@/engine';
import './software.css';

// Chapter 03, the desktop: software shown the way people meet it, as apps. All six sit on a dock of
// the header's frosted glass, under one window on the hero's blue field. Scroll runs the dock one app
// at a time: the window in front shrinks back into its tile and the next app launches out of its own,
// opens on its splash and, where there are real screens, goes through them. The hero's focus corners
// lock on the running app. Open (or a click on the window) fills the stage with it.

const N = apps.length;
const STEP = 0.6; // screens of scroll per app
const SPLASH = 1.7; // s from launch until a window with screens shows the first one
const HOLD = 3.4; // s each screen stays in a running window
const two = (n: number) => String(n + 1).padStart(2, '0');

type Mode = 'desk' | 'row';
type Phase = 'splash' | 'screens';

/** An app's window: its title bar, then its splash, then (if it has any) its screens */
function Window({ app, phase, screen, tabs, onTab, onClose, titleId }: {
  app: App;
  phase: Phase;
  screen: number;
  tabs?: boolean;
  onTab?: (k: number) => void;
  onClose?: () => void;
  titleId?: string;
}) {
  return (
    <>
      <span className="swin__bar">
        <span className="swin__lights" aria-hidden="true"><i /><i /><i /></span>
        <span className="swin__title" id={titleId}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={app.icon} alt="" width={18} height={18} />
          {app.name}
        </span>
        {app.screens.length > 1 && (
          tabs
            ? (
              <span className="swin__tabs" role="group" aria-label={`${app.name} screens`}>
                {app.screens.map((s, k) => (
                  <button key={s.src} type="button" aria-label={`Screen ${k + 1} of ${app.screens.length}`} aria-pressed={k === screen} data-on={k === screen ? '' : undefined} onClick={() => onTab?.(k)} />
                ))}
              </span>
            )
            : <span className="swin__tabs" aria-hidden="true">{app.screens.map((s, k) => <i key={s.src} data-on={phase === 'screens' && k === screen ? '' : undefined} />)}</span>
        )}
        {onClose && <button type="button" className="swin__close" onClick={onClose} aria-label="Close">×</button>}
      </span>
      <span className="swin__body" data-phase={phase}>
        <span className="swin__splash">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="swin__icon" src={app.icon} alt="" width={512} height={512} />
          <span className="swin__name">{app.name}</span>
          <span className="swin__stack">{app.stack.join(' · ')}</span>
          <span className="swin__load" aria-hidden="true" />
        </span>
        {app.screens.map((s, k) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={s.src} className="swin__screen" src={s.src} alt={s.alt} width={1600} height={860} loading="lazy" data-on={phase === 'screens' && k === screen ? '' : undefined} />
        ))}
      </span>
    </>
  );
}

export function Software() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const desk = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLImageElement>(null);
  const big = useRef<HTMLDivElement>(null);
  const wins = useRef<(HTMLDivElement | null)[]>([]);
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const [mode, setMode] = useState<Mode>('desk');
  const [front, setFront] = useState(0); // the app the scroll has reached
  const [arrived, setArrived] = useState(false); // the first launch waits for the stage to settle
  // the running window's state belongs to its app, so a window just launched never shows the last
  // app's screen for a frame
  const [run, setRun] = useState<{ app: number; phase: Phase }>({ app: -1, phase: 'splash' });
  const [screen, setScreen] = useState(0); // the running window's screen
  const [open, setOpen] = useState<number | null>(null);
  const [bigScreen, setBigScreen] = useState(0); // the open view's screen, chosen by its tabs
  const frontRef = useRef(0);
  const shown = useRef(-1); // the app whose window is up
  const openRef = useRef<number | null>(null);
  const openedAt = useRef(0);
  const closing = useRef(false);
  const onScreen = useRef(false);
  const centres = useRef<number[]>([]);
  useLayoutEffect(() => { openRef.current = open; }, [open]);
  const closeRef = useRef<() => void>(() => {}); // the scroll loop's way to close, kept current
  useLayoutEffect(() => { closeRef.current = close; });

  // phones and reduced motion get the apps as a list, with no launching
  useEffect(() => {
    const narrow = matchMedia('(max-width: 899px)');
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    const pick = () => setMode(narrow.matches || still.matches ? 'row' : 'desk');
    pick();
    narrow.addEventListener('change', pick);
    still.addEventListener('change', pick);
    return () => { narrow.removeEventListener('change', pick); still.removeEventListener('change', pick); };
  }, []);

  // where the dock stands for a scroll position, and the scroll for an app
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

  // ------------------------------------------------------------ the scroll runs the dock
  useEffect(() => {
    if (mode !== 'desk') return;
    let raf = 0;
    const tick = () => {
      if (openRef.current === null) {
        const i = Math.min(N - 1, Math.max(0, Math.round(rawAt())));
        if (i !== frontRef.current) { frontRef.current = i; setFront(i); }
      } else if (!closing.current && Math.abs(scrollY - openedAt.current) > innerHeight * 0.35) closeRef.current();
      raf = onScreen.current ? requestAnimationFrame(tick) : 0;
    };
    const io = new IntersectionObserver((entries) => {
      onScreen.current = entries[entries.length - 1].isIntersecting;
      if (onScreen.current && !raf) raf = requestAnimationFrame(tick);
    });
    // the first app launches once the stage has all but come to rest on screen
    const settle = new IntersectionObserver((entries) => {
      if (entries[entries.length - 1].intersectionRatio >= 0.85) { setArrived(true); settle.disconnect(); }
    }, { threshold: [0.85] });
    if (section.current) io.observe(section.current);
    if (stage.current) settle.observe(stage.current);
    return () => { io.disconnect(); settle.disconnect(); cancelAnimationFrame(raf); };
  }, [mode, rawAt]);

  // ------------------------------------------------------------ launching
  // the window in front shrinks into its own tile; the next grows out of its tile, its icon flying
  // ahead of it to the middle of the splash
  useLayoutEffect(() => {
    if (mode !== 'desk' || !arrived) return;
    const to = front;
    const from = shown.current;
    if (to === from) return;
    shown.current = to;
    const box = desk.current?.getBoundingClientRect();
    const st = stage.current?.getBoundingClientRect();
    const win = wins.current[to];
    const tile = tiles.current[to]?.querySelector('.dock__img');
    if (!box || !st || !win || !tile) return;
    const toward = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - (box.left + box.width / 2), y: r.top + r.height / 2 - (box.top + box.height / 2), scale: r.width / box.width };
    };

    const prev = from >= 0 ? wins.current[from] : null;
    const prevTile = from >= 0 ? tiles.current[from]?.querySelector('.dock__img') : null;
    if (prev && prevTile) {
      gsap.killTweensOf(prev);
      gsap.to(prev, { ...toward(prevTile), duration: 0.5, ease: 'power3.in' });
      gsap.to(prev, { autoAlpha: 0, duration: 0.18, delay: 0.32, ease: 'none' });
    }

    gsap.killTweensOf(win);
    // the splash icon's place once the window is up, for the flying icon to land on
    gsap.set(win, { x: 0, y: 0, scale: 1 });
    const icon = win.querySelector<HTMLElement>('.swin__icon');
    const land = icon?.getBoundingClientRect();
    gsap.set(win, { ...toward(tile), autoAlpha: 0 });
    gsap.to(win, { x: 0, y: 0, scale: 1, duration: 0.85, ease: ease.out });
    gsap.to(win, { autoAlpha: 1, duration: 0.2, ease: 'none' });
    gsap.fromTo(tile, { y: 0 }, { y: -12, duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1 });

    const g = ghost.current;
    const tr = tile.getBoundingClientRect();
    if (g && icon && land) {
      g.src = apps[to].icon;
      gsap.killTweensOf(g);
      gsap.set(icon, { autoAlpha: 0 });
      gsap.set(g, { left: land.left - st.left, top: land.top - st.top, width: land.width, height: land.height, transformOrigin: '0 0' });
      gsap.fromTo(g,
        { x: tr.left - land.left, y: tr.top - land.top, scale: tr.width / land.width, autoAlpha: 1 },
        { x: 0, y: 0, scale: 1, duration: 0.85, ease: ease.out, onComplete: () => { gsap.set(icon, { autoAlpha: 1 }); gsap.set(g, { autoAlpha: 0 }); } });
    }

    setRun({ app: to, phase: 'splash' });
    setScreen(0);
    if (!apps[to].screens.length) return;
    const t = setTimeout(() => setRun({ app: to, phase: 'screens' }), SPLASH * 1000);
    return () => clearTimeout(t);
  }, [front, arrived, mode]);

  // back to a plain list: forget the desk's transforms
  useEffect(() => {
    if (mode !== 'row') return;
    shown.current = -1;
    wins.current.forEach((el) => { if (el) gsap.set(el, { clearProps: 'all' }); });
  }, [mode]);

  // a running window goes through its screens; the open view waits for a click on its tabs
  useEffect(() => {
    const n = run.app >= 0 ? apps[run.app].screens.length : 0;
    if (mode !== 'desk' || run.phase !== 'screens' || open !== null || n < 2) return;
    const id = setInterval(() => { if (onScreen.current) setScreen((s) => (s + 1) % n); }, HOLD * 1000);
    return () => clearInterval(id);
  }, [mode, run, open]);

  // ------------------------------------------------------------ the dock under the pointer
  // tiles swell toward the pointer, measured from where they stood before it came
  const onDockEnter = () => {
    centres.current = tiles.current.map((el) => { const r = el?.getBoundingClientRect(); return r ? r.left + r.width / 2 : 0; });
  };
  const onDockMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !centres.current.length) return;
    const reach = (tiles.current[0]?.offsetWidth ?? 64) * 2.4;
    tiles.current.forEach((el, k) => {
      const d = Math.min(1, Math.abs(e.clientX - centres.current[k]) / reach);
      el?.style.setProperty('--m', (1 + 0.34 * Math.cos((d * Math.PI) / 2) ** 2).toFixed(3));
    });
  };
  const onDockLeave = () => {
    centres.current = [];
    tiles.current.forEach((el) => el?.style.setProperty('--m', '1'));
  };

  // ------------------------------------------------------------ choosing and opening
  const show = (i: number) => {
    if (open !== null) return;
    if (mode === 'row' || i === frontRef.current) {
      setBigScreen(run.app === i && run.phase === 'screens' ? screen : 0); // the open view carries on from the window
      setOpen(i);
      return;
    }
    scrollToTarget(scrollFor(i));
  };

  // the window grows from its place on the desk to the open view
  useLayoutEffect(() => {
    if (open === null || !big.current) return;
    openedAt.current = scrollY;
    const from = mode === 'desk' ? wins.current[open]?.getBoundingClientRect() : undefined;
    const to = big.current.getBoundingClientRect();
    const tw = from
      ? gsap.fromTo(big.current,
        { x: from.left - to.left, y: from.top - to.top, scaleX: from.width / to.width, scaleY: from.height / to.height, transformOrigin: '0 0' },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.8, ease: ease.out })
      : gsap.fromTo(big.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
    big.current.focus({ preventScroll: true });
    return () => { tw.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    if (open === null || closing.current) return;
    const at = open;
    const el = big.current;
    const back = mode === 'desk' ? wins.current[at] : null;
    closing.current = true;
    const done = () => { closing.current = false; setOpen(null); (mode === 'desk' ? tiles.current[at] : section.current?.querySelector<HTMLButtonElement>(`[data-app="${apps[at].id}"]`))?.focus({ preventScroll: true }); };
    if (!el || !back) { done(); return; }
    const to = el.getBoundingClientRect();
    const from = back.getBoundingClientRect();
    gsap.to(el, { x: from.left - to.left, y: from.top - to.top, scaleX: from.width / to.width, scaleY: from.height / to.height, transformOrigin: '0 0', duration: 0.6, ease: ease.inOut, onComplete: done });
  }
  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape' && open !== null) { e.preventDefault(); close(); return; }
    if (open !== null || mode !== 'desk' || !dock.current?.contains(document.activeElement)) return;
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const i = Math.min(N - 1, Math.max(0, front + step));
    scrollToTarget(scrollFor(i));
    tiles.current[i]?.focus({ preventScroll: true });
  };

  const opened = open !== null ? apps[open] : null;
  return (
    <section
      ref={section}
      className="software"
      data-mode={mode}
      data-open={open !== null ? '' : undefined}
      style={{ '--steps': N - 1, '--step': STEP } as CSSProperties}
      aria-labelledby="software-title"
      onKeyDown={onKey}
    >
      {/* the header's Software pill lands here, where the desk pins */}
      <div className="software__track" ref={track} id="software">
        <div className="software__stage" ref={stage}>
          <header className="software__head">
            <p className="software__index"><span className="software__bracket" aria-hidden="true" />03 / 03</p>
            <h2 id="software-title" className="software__title">{software.title}</h2>
            <p className="software__line">{software.line[0]} <em>{software.line[1]}</em></p>
          </header>

          {mode === 'desk' && (
            <>
              <div className="software__desk" ref={desk}>
                {apps.map((a, i) => (
                  <div
                    key={a.id}
                    ref={(el) => { wins.current[i] = el; }}
                    className="swin"
                    aria-hidden={i !== front}
                    inert={i !== front}
                    onClick={() => show(i)}
                  >
                    <Window app={a} phase={run.app === i ? run.phase : 'splash'} screen={run.app === i ? screen : 0} />
                  </div>
                ))}
              </div>

              <div className="software__now" aria-live="polite">
                {apps.map((a, i) => (
                  <div key={a.id} className="software__nowItem" data-active={i === front ? '' : undefined} aria-hidden={i !== front} inert={i !== front}>
                    <p className="software__nowIndex">{two(i)} / {two(N - 1)}</p>
                    <p className="software__nowName">{a.name}</p>
                    <p className="software__nowLine">{a.line}</p>
                    <button type="button" className="software__openBtn" onClick={() => show(i)}>
                      Open {a.name}
                      <span className="software__openArrow" aria-hidden="true">
                        <svg viewBox="0 0 12 12" width="12" height="12"><path d="M3 9 9 3M4 3h5v5" /></svg>
                      </span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="software__dockWrap">
                <div className="dock" ref={dock} role="list" aria-label="Apps" onPointerEnter={onDockEnter} onPointerMove={onDockMove} onPointerLeave={onDockLeave}>
                  {apps.map((a, i) => (
                    <div key={a.id} role="listitem" className="dock__slot">
                      <button
                        type="button"
                        ref={(el) => { tiles.current[i] = el; }}
                        className="dock__item"
                        data-active={i === front ? '' : undefined}
                        aria-current={i === front ? 'true' : undefined}
                        aria-label={i === front ? `Open ${a.name}` : `Show ${a.name}`}
                        onClick={() => show(i)}
                        style={{ '--m': 1 } as CSSProperties}
                      >
                        <span className="dock__tip" aria-hidden="true">{a.name}</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="dock__img" src={a.icon} alt="" width={512} height={512} />
                        <span className="dock__af" aria-hidden="true"><i /><i /><i /><i /></span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* the icon that flies from the dock to the splash */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={ghost} className="software__ghost" src={apps[0].icon} alt="" aria-hidden="true" />
            </>
          )}

          {mode === 'row' && (
            <ul className="software__list">
              {apps.map((a, i) => (
                <li key={a.id}>
                  <button type="button" className="sapp" data-app={a.id} onClick={() => show(i)} aria-label={`Open ${a.name}`}>
                    <span className="swin sapp__win">
                      <Window app={a} phase={a.screens.length ? 'screens' : 'splash'} screen={0} />
                    </span>
                    <span className="sapp__line">{a.line}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {opened && open !== null && (
            <div className="software__open" role="dialog" aria-modal="false" aria-labelledby="software-open-name">
              <div className="software__openText">
                <p className="software__nowIndex">{two(open)} / {two(N - 1)}</p>
                <h3 id="software-open-name" className="software__openName">{opened.name}</h3>
                <p className="software__openLine">{opened.line}</p>
                {opened.stat && <p className="software__stat"><span>{opened.stat.value}</span>{opened.stat.label}</p>}
                {opened.chip && <p className="software__chip">{opened.chip}</p>}
                <ul className="software__specs" aria-label="Built with">
                  {opened.stack.map((s) => <li key={s}>{s}</li>)}
                </ul>
                <button type="button" className="software__back" onClick={close}><span aria-hidden="true">← </span>Back to the desk</button>
              </div>
              <div className="swin software__big" ref={big} tabIndex={-1}>
                <Window app={opened} phase={opened.screens.length ? 'screens' : 'splash'} screen={bigScreen} tabs onTab={setBigScreen} onClose={close} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
