// The concept driver. One value, blur in px, decides how sharp the subject is: the canvas and the
// viewfinder's focus readout both read it. The autofocus hunt is a CSS animation on the <img> (it
// starts at first paint); this module reads it while it runs, then hands over to a canvas that
// smears the subject sideways like a slow shutter and lets scroll pull focus. The AF box rests on
// the face; under a mouse it follows the pointer and shows the portrait sharp inside it.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onPage, prefersReducedMotion } from '@/engine';
import { FACE, focusOf } from '@/data/focus';
import { idle } from './idle';

const SCALE = 3; // the canvas draws at a third of its size; the blur hides it
const BLEED = 0.22; // the canvas overhangs the stage by this share of its width, so blur never meets an edge
const SCROLL_SHARPEN = 16; // px of blur taken away across the hero's scroll
const SMEAR = 2.4; // sideways shake, CSS px each way per px of blur
const GHOSTS = 9; // copies across the shake: few enough to leave a slow shutter's doubled edges
const SOFT = 0.3; // the gaussian laid over the shake, per px of blur

export function startFocus() {
  onPage(() => {
    const stage = document.querySelector<HTMLElement>('[data-focus-stage]');
    const drift = stage?.querySelector<HTMLElement>('[data-focus-drift]');
    const canvas = stage?.querySelector<HTMLCanvasElement>('[data-focus-canvas]');
    const img = stage?.querySelector<HTMLImageElement>('[data-silhouette]');
    const ctx = canvas?.getContext('2d');
    if (!stage || !drift || !canvas || !img || !ctx) return;
    const af = stage.querySelector<HTMLElement>('[data-af]');
    const afImg = stage.querySelector<HTMLImageElement>('[data-af-img]');
    const hero = stage.closest<HTMLElement>('section') ?? stage;
    const readout = hero.querySelector<HTMLElement>('[data-focus-readout]');

    const reduced = prefersReducedMotion();
    const rest = Number(stage.dataset.blur || 40);
    const s = { scroll: 0 };
    // the AF box's centre, stage px; it rests on the face
    const box = { x: 0, y: 0, tx: 0, ty: 0, on: false, placed: false };
    let w = 0, h = 0, drawn = -1, shown = -1, ready = false;
    // the CSS hunt's current blur, while it runs
    const cssBlur = () => {
      const m = /blur\(([\d.]+)px\)/.exec(getComputedStyle(img).filter);
      return m ? Number(m[1]) : rest;
    };

    // Older engines ignore ctx.filter; then the canvas is drawn sharp and CSS blurs it.
    ctx.filter = 'blur(1px)';
    const canvasFilter = ctx.filter === 'blur(1px)';
    ctx.filter = 'none';

    // the portrait inside a margin (bleed) the smear and blur can spread into, composed once per size
    const composite = document.createElement('canvas');
    const shake = document.createElement('canvas');
    let bx = 0, by = 0; // the stage's origin inside the canvas, canvas px
    const compose = () => {
      composite.width = shake.width = canvas.width;
      composite.height = shake.height = canvas.height;
      composite.getContext('2d')!.drawImage(img, bx, by, w / SCALE, h / SCALE);
    };

    const size = () => {
      w = drift.clientWidth;
      h = drift.clientHeight;
      const m = w * BLEED; // CSS px of overhang on every side
      canvas.style.inset = `${-m}px`;
      canvas.style.width = `${w + 2 * m}px`;
      canvas.style.height = `${h + 2 * m}px`;
      canvas.width = Math.max(1, Math.round((w + 2 * m) / SCALE));
      canvas.height = Math.max(1, Math.round((h + 2 * m) / SCALE));
      bx = by = m / SCALE;
      if (afImg) afImg.style.width = `${w}px`;
      if (ready) compose();
      drawn = -1;
    };

    // A slow shutter: the subject drawn at evenly spaced offsets across the shake ('lighter' at
    // 1/n alpha is an exact average), then softened.
    const draw = (blur: number) => {
      if (!ready) return;
      const sc = shake.getContext('2d')!;
      const len = (blur * SMEAR) / SCALE;
      sc.clearRect(0, 0, shake.width, shake.height);
      sc.globalCompositeOperation = 'lighter';
      sc.globalAlpha = 1 / GHOSTS;
      for (let i = 0; i < GHOSTS; i++) sc.drawImage(composite, (i / (GHOSTS - 1) - 0.5) * 2 * len, 0);
      sc.globalCompositeOperation = 'source-over';
      sc.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (canvasFilter) ctx.filter = `blur(${(blur * SOFT) / SCALE}px)`;
      else canvas.style.filter = `blur(${blur * SOFT}px)`;
      ctx.drawImage(shake, 0, 0);
      ctx.filter = 'none';
      drawn = blur;
    };

    // The box sits on the face in CSS; JS moves it by its offset from there, and slides the sharp
    // portrait the other way so it stays registered with the blur.
    const placeAf = (lean: number) => {
      if (!af || !afImg) return;
      const dx = box.x - FACE.x * w, dy = box.y - FACE.y * h;
      gsap.set(af, { x: dx, y: dy });
      gsap.set(afImg, { x: lean - ((FACE.x - FACE.w / 2) * w + dx), y: -((FACE.y - FACE.h / 2) * h + dy) });
    };

    const tick = () => {
      const blur = ready ? Math.max(0, rest - s.scroll * SCROLL_SHARPEN) : cssBlur();
      if (ready && Math.abs(blur - drawn) > 1) draw(blur); // 1px steps are invisible at this blur
      const f = focusOf(blur);
      if (readout && f !== shown) { readout.textContent = String(f); shown = f; }
      // the subject leans away from the pointer a little; the sharp copy in the AF box leans with it
      const lean = reduced ? 0 : idle.x * -14;
      if (!reduced) gsap.set(drift, { x: lean });
      if (af && w) {
        // at rest the AF point hunts over the face, a few px either way
        const hx = reduced || box.on ? 0 : Math.sin(idle.t * 0.9) * 5 + Math.sin(idle.t * 2.3) * 2;
        const hy = reduced || box.on ? 0 : Math.cos(idle.t * 0.7) * 3;
        const tx = (box.on ? box.tx : FACE.x * w + idle.x * -14) + hx;
        const ty = (box.on ? box.ty : FACE.y * h) + hy;
        const k = reduced || !box.placed ? 1 : 1 - Math.pow(0.84, gsap.ticker.deltaRatio());
        box.x += (tx - box.x) * k;
        box.y += (ty - box.y) * k;
        box.placed = true;
        placeAf(lean);
      }
    };

    // Hand over to the canvas once the image is decoded and the CSS hunt has settled.
    let gone = false;
    const start = async () => {
      if (ready || gone) return;
      await img.decode().catch(() => {});
      await Promise.all(img.getAnimations().map((a) => a.finished.catch(() => {})));
      if (gone) return;
      ready = true;
      size();
      compose();
      draw(rest);
      stage.classList.add('is-live');
    };
    size();
    if (img.complete && img.naturalWidth) start();
    else img.addEventListener('load', start, { once: true });
    const ro = new ResizeObserver(() => { size(); if (ready) draw(drawn < 0 ? rest : drawn); });
    ro.observe(drift);

    // Pointer: the AF box follows a mouse over the hero and returns to the face when it leaves.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !w || !af) return;
      const r = stage.getBoundingClientRect(); // the box lives in the stage, not the leaning drift
      const hw = af.offsetWidth / 2, hh = af.offsetHeight / 2;
      box.tx = gsap.utils.clamp(hw, w - hw, e.clientX - r.left);
      box.ty = gsap.utils.clamp(hh, h - hh, e.clientY - r.top);
      if (!box.on) af.classList.add('is-on');
      box.on = true;
    };
    const onLeave = () => { box.on = false; af?.classList.remove('is-on'); };
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);

    // One clock, and only while the hero is on screen.
    let ticking = false;
    const run = (v: boolean) => {
      if (v === ticking) return;
      ticking = v;
      if (v) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    };
    run(true);
    ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: (st) => run(st.isActive) });
    if (!reduced) ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom top', onUpdate: (st) => { s.scroll = st.progress; } });

    return () => {
      gone = true;
      run(false);
      ro.disconnect();
      img.removeEventListener('load', start);
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
    };
  });
}
