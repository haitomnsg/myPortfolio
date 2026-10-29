'use client';
import { useEffect, useRef, type CSSProperties } from 'react';
import { frames, robots } from '@/data/site';
import { onScroll } from '@/engine';
import { AI_MID } from './Ai';
import './bridge.css';

// Between chapters 01 and 02: once the arch has turned to its last robot, the next screen of scroll
// brings its five cards down out of the Robotics stage. On the way each one turns over, from its robot
// to an AI project's mark on a white plate, straightens, and drops into that project's detection box in
// the AI row, which is still coming up; there the plate melts away, leaving the bare mark inside the
// box's corners. The top card keeps its focus corners all the way down, into the middle box, where AI's
// own focus box takes over. Scroll back up and they lift out of the row onto the arch again. The flying
// cards are stand-ins drawn over both chapters; the arch's cards and the row's boxes hide under them
// while they fly. Wide screens with motion only (the ring and the AI row).

const NR = robots.length;
const NF = frames.length;
const SLOTS = [-2, -1, 0, 1, 2]; // the arch's five places in view, left to right; 0 is its top
const LAG = 0.07; // of the flight: each place further from the top leaves this much later
const two = (n: number) => String(n + 1).padStart(2, '0');
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function Bridge() {
  const layer = useRef<HTMLDivElement>(null);
  const flyers = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const hidden = new Set<HTMLElement>();
    // a flight starts only from rest at either end with nothing open, so the cards never appear halfway
    // (a robot's open view still closing as the scroll moves on, a reload mid-way)
    let ready = false;
    const land = () => {
      hidden.forEach((el) => { el.style.visibility = ''; });
      hidden.clear();
      layer.current?.removeAttribute('data-on');
      document.querySelector('.robotics')?.removeAttribute('data-bridge');
      const row = document.getElementById('ai');
      row?.removeAttribute('data-bridge');
      row?.style.removeProperty('--seam');
    };
    const hide = (el: HTMLElement, keep: Set<HTMLElement>) => {
      keep.add(el);
      if (!hidden.has(el)) { el.style.visibility = 'hidden'; hidden.add(el); }
    };
    const update = () => {
      const row = document.getElementById('ai');
      const ring = document.querySelector<HTMLElement>('.robotics');
      const stage = ring?.querySelector<HTMLElement>('.robotics__stage');
      if (!row || !ring || !stage || !layer.current) return;
      // 0 with the last robot at rest and AI just under the screen, 1 with AI in place
      const p = 1 - row.getBoundingClientRect().top / innerHeight;
      const clear = ring.dataset.mode === 'ring' && row.dataset.mode === 'scene'
        && ring.dataset.open === undefined && row.dataset.open === undefined;
      const rest = p <= 0.001 || p >= 0.999;
      if (!clear || rest) ready = clear;
      if (!clear || rest || !ready) { land(); return; }

      // ---- read: the arch's cards, and the row's boxes, the middle one under the arch's top card
      const cards = ring.querySelectorAll<HTMLElement>('.rcard');
      const boxes = row.querySelectorAll<HTMLElement>('.detect__box');
      if (cards.length < NR || boxes.length < NF) return;
      const sx = stage.getBoundingClientRect().left;
      const geo = SLOTS.map((s) => {
        const card = cards[(NR - 1 + s) % NR];
        const m = new DOMMatrixReadOnly(card.style.transform || 'none');
        // a row of fewer than five: the outer cards have no box, and fall away under the screen
        const box: HTMLElement | undefined = boxes[AI_MID + s];
        const to = box?.getBoundingClientRect() ?? new DOMRect(sx + m.e, innerHeight * 1.5, card.offsetWidth, card.offsetWidth);
        return {
          card,
          box,
          // where the card stands with the stage still pinned (its top at 0) ...
          x0: sx + m.e + card.offsetWidth / 2,
          y0: m.f + card.offsetHeight / 2,
          a0: Math.atan2(m.b, m.a),
          w0: card.offsetWidth,
          // ... and its box in the row, which is still coming up: the card drops into it and rides up
          x1: to.left + to.width / 2,
          y1: to.top + to.height / 2,
          w1: to.width,
        };
      });

      // ---- write
      // set once per flight: Ai.tsx watches the attribute
      if (row.dataset.bridge === undefined) { row.dataset.bridge = ''; ring.dataset.bridge = ''; layer.current.dataset.on = ''; }
      // AI's sky comes up out of the arch's paper floor, and clears as the cards land
      row.style.setProperty('--seam', (1 - smooth(0.45, 1, p)).toFixed(3));
      const keep = new Set<HTMLElement>();
      geo.forEach((g, n) => {
        const s = SLOTS[n];
        const el = flyers.current[n];
        if (!el) return;
        hide(g.card, keep);
        if (g.box) hide(g.box, keep);
        const t = Math.min(1, Math.max(0, (p - LAG * Math.abs(s)) / (1 - 2 * LAG)));
        const e = smooth(0, 1, t); // gentle: the glide that carries the scroll here is eased already (handoff.ts)
        const w = lerp(g.w0, g.w1, e);
        el.style.transform = `translate3d(${lerp(g.x0, g.x1, e).toFixed(2)}px, ${lerp(g.y0, g.y1, e).toFixed(2)}px, 0) rotate(${lerp(g.a0, 0, e).toFixed(4)}rad)`;
        el.style.zIndex = String(10 - Math.abs(s));
        // it tips forward as it falls, its top edge coming toward you, and lands face up
        el.style.setProperty('--turn', `${(-180 * smooth(0.18, 0.82, t)).toFixed(2)}deg`);
        el.style.setProperty('--front', (w / g.w0).toFixed(4));
        el.style.setProperty('--back', (w / g.w1).toFixed(4));
        el.style.setProperty('--card-w', `${g.w0}px`);
        el.style.setProperty('--box', `${g.w1}px`);
        // in the box the plate melts away and the box's corners come up round the bare mark
        el.style.setProperty('--plate', (1 - smooth(0.72, 1, t)).toFixed(3));
        el.style.setProperty('--seen', smooth(0.55, 0.95, t).toFixed(3));
        el.style.opacity = g.box ? '' : (1 - smooth(0.2, 0.6, t)).toFixed(3);
      });
      hidden.forEach((el) => { if (!keep.has(el)) { el.style.visibility = ''; hidden.delete(el); } });
    };

    // Lenis reports its scroll in the same frame it moves the page; the keyboard and the scrollbar
    // only through the window's own event
    let y = -1;
    const onMove = () => { if (scrollY !== y) { y = scrollY; update(); } };
    // the stand-ins show for the first time mid-scroll: have their pictures ready, not blank for a frame
    layer.current?.querySelectorAll('img').forEach((img) => { img.decode().catch(() => {}); });
    const off = onScroll(onMove);
    addEventListener('scroll', onMove, { passive: true });
    addEventListener('resize', update);
    update();
    return () => { off(); removeEventListener('scroll', onMove); removeEventListener('resize', update); land(); };
  }, []);

  return (
    <div className="bridge" ref={layer} aria-hidden="true">
      {SLOTS.map((s, n) => {
        const r = (NR - 1 + s) % NR;
        const robot = robots[r];
        const f = frames[Math.min(NF - 1, Math.max(0, AI_MID + s))];
        return (
          // the arch's top card wears its focus corners the whole way down
          <div key={s} className="bridge__card" ref={(el) => { flyers.current[n] = el; }} style={{ '--focus': s === 0 ? 1 : 0 } as CSSProperties}>
            <div className="bridge__turn">
              {/* the arch's card, as Robotics.tsx draws it */}
              <span className="rcard bridge__front">
                <span className="rcard__img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={robot.image} alt="" width={1280} height={1000} decoding="async" />
                  <span className="rcard__af"><i /><i /><i /><i /></span>
                </span>
                <span className="rcard__cap"><span>{two(r)}</span> {robot.name}</span>
              </span>
              {/* the project's detection box, as Ai.tsx draws it, on a plate that melts away as it lands */}
              <span className="detect__box bridge__back">
                <span className="bridge__plate" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="detect__mark" src={f.mark} alt="" width={512} height={512} decoding="async" />
                <span className="detect__corners"><i /><i /><i /><i /></span>
                {s === 0 && <span className="ai__af bridge__af" data-lock=""><i /><i /><i /><i /></span>}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
