'use client';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { gsap } from 'gsap';
import { chapters as all } from '@/data/site';

// Robotics left the tabs for its own section (Robotics.tsx); its header pill scrolls there instead
const chapters = all.filter((c) => c.id !== 'robotics');
import { ease, prefersReducedMotion, scrollToTarget } from '@/engine';

/** Four tall pills (the chapter index) and the panel they control. The chosen pill comes into focus. */
export function ChapterTabs() {
  const [sel, setSel] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const first = useRef(true);
  const c = chapters[sel];

  // The header pills (and /#id links) choose a chapter here instead of jumping to the tab itself.
  useEffect(() => {
    const index = (id: string) => chapters.findIndex((x) => x.id === id);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-chapter-link]');
      if (!a || e.defaultPrevented) return;
      const i = index(a.dataset.chapterLink || '');
      if (i < 0) return;
      e.preventDefault();
      setSel(i);
      history.replaceState(null, '', `#${chapters[i].id}`);
      // next tick: Lenis's own anchor handling runs after this listener and would win
      setTimeout(() => {
        scrollToTarget('#chapters');
        tabs.current[i]?.focus({ preventScroll: true });
      }, 0);
    };
    document.addEventListener('click', onClick);
    const fromHash = index(location.hash.slice(1));
    let t: ReturnType<typeof setTimeout> | undefined;
    if (fromHash >= 0) {
      t = setTimeout(() => {
        setSel(fromHash);
        scrollToTarget('#chapters');
      }, 900); // after the page enter has reset the scroll
    }
    return () => {
      document.removeEventListener('click', onClick);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (prefersReducedMotion() || !panel.current) return;
    const tw = gsap.fromTo(
      panel.current.querySelectorAll('[data-panel-item]'),
      { y: 18, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.8, ease: ease.out, stagger: 0.04, overwrite: true },
    );
    return () => { tw.kill(); };
  }, [sel]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const n = chapters.length;
    const next = { ArrowRight: sel + 1, ArrowDown: sel + 1, ArrowLeft: sel - 1, ArrowUp: sel - 1, Home: 0, End: n - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const i = (next + n) % n;
    setSel(i);
    tabs.current[i]?.focus();
  };

  return (
    <div className="chapters__inner">
      <div className="panel" role="tabpanel" id="chapter-panel" aria-labelledby={`${c.id}`} ref={panel}>
        <p className="panel__n" data-panel-item>Chapter {c.n} of {all.length}</p>
        <h3 className="panel__title" data-panel-item>{c.title}</h3>
        <p className="panel__line" data-panel-item>{c.line}</p>
        <ul className="panel__list">
          {c.items.map((it) => (
            <li key={it.name} data-panel-item>
              <span className="panel__name">{it.name}</span>
              <span className="panel__text">{it.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* no data-reveal here: hidden-until-revealed buttons can't take keyboard focus */}
      <div className="tabs" role="tablist" aria-label="Chapters">
        {chapters.map((ch, i) => (
          <button
            key={ch.id}
            id={ch.id}
            ref={(el) => { tabs.current[i] = el; }}
            className="tab"
            role="tab"
            type="button"
            aria-selected={i === sel}
            aria-controls="chapter-panel"
            tabIndex={i === sel ? 0 : -1}
            onClick={() => setSel(i)}
            onKeyDown={onKey}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="tab__img tab__img--blur" src={ch.image} alt="" width={440} height={1100} loading="lazy" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="tab__img tab__img--sharp" src={ch.image} alt="" width={440} height={1100} loading="lazy" />
            <span className="tab__label">{ch.title}</span>
            <span className="tab__n" aria-hidden="true">{ch.n}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
