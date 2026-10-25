// Header pills: a paper marker settles on the pill under the pointer or keyboard focus, like a
// focus point moving between subjects. It is clipped, not resized, so nothing reflows.
import { gsap } from 'gsap';
import { ease, isTouch, onPage, prefersReducedMotion } from '@/engine';

export function startNav() {
  onPage(() => {
    const nav = document.querySelector<HTMLElement>('[data-pills]');
    const marker = nav?.querySelector<HTMLElement>('[data-pills-marker]');
    if (!nav || !marker) return;
    const links = [...nav.querySelectorAll<HTMLAnchorElement>('a')];
    const d = prefersReducedMotion() ? 0 : 1;
    const clip = (a: HTMLElement) => {
      const left = a.offsetLeft - marker.offsetLeft;
      const right = marker.offsetWidth - left - a.offsetWidth;
      return `inset(0px ${right}px 0px ${left}px round 999px)`;
    };
    let shown = false;
    const show = (a: HTMLElement) => {
      if (!shown) gsap.set(marker, { clipPath: clip(a) }); // appear in place, then travel
      shown = true;
      gsap.to(marker, { clipPath: clip(a), autoAlpha: 1, duration: 0.55 * d, ease: ease.out, overwrite: true });
    };
    const hide = () => {
      shown = false;
      gsap.to(marker, { autoAlpha: 0, duration: 0.3 * d, ease: ease.soft, overwrite: true });
    };
    const off: (() => void)[] = [];
    links.forEach((a) => {
      const enter = (e: PointerEvent) => { if (e.pointerType === 'mouse') show(a); };
      const focus = () => { if (a.matches(':focus-visible') || isTouch()) show(a); };
      a.addEventListener('pointerenter', enter);
      a.addEventListener('focus', focus);
      off.push(() => { a.removeEventListener('pointerenter', enter); a.removeEventListener('focus', focus); });
    });
    const leave = () => { if (!nav.contains(document.activeElement)) hide(); };
    const blur = (e: FocusEvent) => { if (!nav.contains(e.relatedTarget as Node)) hide(); };
    nav.addEventListener('pointerleave', leave);
    nav.addEventListener('focusout', blur);
    return () => {
      off.forEach((f) => f());
      nav.removeEventListener('pointerleave', leave);
      nav.removeEventListener('focusout', blur);
    };
  });
}
