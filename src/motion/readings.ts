// The instruments take their reading: lines draw, the lime dot rides the lead curve to its last
// value and drops a guide, numbers count up, the gauge sweeps. The markup holds the final state,
// so reduced motion and no-JS simply show it.
import { gsap } from 'gsap';
import { ease, onPage, prefersReducedMotion } from '@/engine';

export function startReadings() {
  onPage(({ intro }) => {
    const root = document.querySelector<HTMLElement>('[data-readings]');
    // Late hydration (slow phones): the cards already rose in CSS with their final reading. Leave it.
    if (!root || prefersReducedMotion() || performance.now() > 2500) return;
    const lines = root.querySelectorAll<SVGPathElement>('[data-draw]');
    const drop = root.querySelector<SVGLineElement>('[data-drop]');
    const riders = root.querySelectorAll<SVGCircleElement>('[data-ride]');
    const path = root.querySelector<SVGPathElement>('[data-ride-path]');
    const gauge = root.querySelector<SVGPathElement>('[data-gauge]');
    const gaugeDot = root.querySelector<SVGCircleElement>('[data-gauge-dot]');
    const counts = root.querySelectorAll<HTMLElement>('[data-count]');

    const tl = gsap.timeline();
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
    tl.to(lines, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.12 }, 0);

    if (path && riders.length) {
      const len = path.getTotalLength();
      const pos = { p: 0 };
      const place = () => {
        const pt = path.getPointAtLength(pos.p * len);
        riders.forEach((r) => { r.setAttribute('cx', pt.x.toFixed(2)); r.setAttribute('cy', pt.y.toFixed(2)); });
      };
      place();
      gsap.set(riders, { autoAlpha: 0 });
      // the lead curve is the last of three in the stagger, so the dot rides its drawing tip
      tl.to(riders, { autoAlpha: 1, duration: 0.3 }, 0.24).to(pos, { p: 1, duration: 1.4, ease: 'power2.inOut', onUpdate: place }, 0.24);
    }
    if (drop) tl.fromTo(drop, { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 0%', duration: 0.7, ease: ease.out }, 1.62);
    if (gauge) {
      const to = 1 - Number(gauge.dataset.gauge || 0);
      tl.fromTo(gauge, { strokeDashoffset: 1 }, { strokeDashoffset: to, duration: 1.4, ease: ease.out }, 0.25);
    }
    if (gaugeDot) tl.fromTo(gaugeDot, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 1.1);

    counts.forEach((el) => {
      const end = Number(el.dataset.count);
      const dec = Number(el.dataset.decimals || 0);
      el.style.minWidth = `${el.offsetWidth}px`; // the unit beside it never shifts while digits grow
      const o = { v: 0 };
      el.textContent = (0).toFixed(dec);
      tl.to(o, { v: end, duration: 1.3, ease: 'power3.out', onUpdate: () => { el.textContent = o.v.toFixed(dec); } }, 0.1);
    });

    intro.add(tl, 0.75);
  });
}
