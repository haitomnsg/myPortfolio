'use client';
import { useEffect, useRef } from 'react';
import './figure-card.css';

export type Say = (text: string) => void;
export type Mount = (stage: HTMLElement, say: Say, describe: Say) => () => void;

type Props = {
  fig: string;
  title: string;
  /** what a mouse does, and what a finger does */
  hint: [string, string];
  readout: string;
  /** the static drawing, fetched when the card comes near the viewport (it is too big to inline) */
  src: string;
  aspect: [number, number];
  label: string;
  mount: Mount;
  className?: string;
};

/** The card an Anatomy figure lives in: the drawing, its four mono corners and a live readout. */
export function FigureCard({ fig, title, hint, readout, src, aspect, label, mount, className = '' }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const out = useRef<HTMLSpanElement>(null);
  const live = useRef<HTMLParagraphElement>(null);
  const hintEl = useRef<HTMLSpanElement>(null);
  const mountRef = useRef(mount);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    if (matchMedia('(hover: none)').matches && hintEl.current) hintEl.current.textContent = hint[1];
    let stop: (() => void) | undefined;
    let gone = false;
    const say: Say = (t) => { if (out.current && out.current.textContent !== t) out.current.textContent = t; };
    const describe: Say = (t) => { if (live.current) live.current.textContent = t; };
    const load = async () => {
      const text = await fetch(src).then((r) => r.text());
      if (gone) return;
      el.innerHTML = text;
      stop = mountRef.current(el, say, describe);
    };
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); void load(); }
    }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => { gone = true; io.disconnect(); stop?.(); };
  }, [src, hint]);

  return (
    <figure className={`fig-card ${className}`}>
      <div className="fig-card__corners" aria-hidden="true">
        <span data-corner="fig">{fig}</span>
        <span data-corner="title">{title}</span>
        <span data-corner="hint" ref={hintEl}>{hint[0]}</span>
        <span data-corner="readout" ref={out}>{readout}</span>
      </div>
      <div ref={stage} className="fig-card__stage" style={{ aspectRatio: `${aspect[0]} / ${aspect[1]}` }} tabIndex={0} role="group" aria-label={label} />
      <p className="sr-only" aria-live="polite" ref={live} />
    </figure>
  );
}
