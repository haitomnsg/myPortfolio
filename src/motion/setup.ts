// Global motion: runs once on the client, before the first page initializes.
import { gsap } from 'gsap';
import { ease, onScroll, setTransition } from '@/engine';
import { buttonFill } from './fill';
import { startHandoff } from './handoff';
import { startFocus } from './focus';
import { startIdle } from './idle';
import { startNav } from './nav';
import { startReadings } from './readings';

export function setupMotion() {
  startIdle();
  startFocus();
  startReadings();
  startNav();
  startHandoff();
  buttonFill();

  // The header stays put, and turns to paper while a dark section ([data-dark]) is under it.
  onScroll(() => {
    const h = document.documentElement.classList;
    const under = [...document.querySelectorAll('[data-dark]')].some((el) => {
      const r = el.getBoundingClientRect();
      return r.top < 40 && r.bottom > 40;
    });
    h.toggle('on-dark', under);
  });

  // Page change: the page you leave goes out of focus into ink; the next one comes back into focus.
  setTransition({
    leave: (c) => {
      const p = c.querySelector('.curtain__panel');
      return gsap.timeline()
        .set(c, { autoAlpha: 1 })
        .fromTo(p, { '--defocus': '0px', backgroundColor: 'rgba(18,26,38,0)' }, { '--defocus': '36px', backgroundColor: 'rgba(18,26,38,1)', duration: 0.75, ease: ease.inOut });
    },
    enter: (c) => {
      const p = c.querySelector('.curtain__panel');
      return gsap.timeline()
        .to(p, { '--defocus': '0px', backgroundColor: 'rgba(18,26,38,0)', duration: 0.8, ease: ease.inOut })
        .set(c, { autoAlpha: 0 });
    },
  });
}
