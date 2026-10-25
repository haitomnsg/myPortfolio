// Smooth scroll on ONE clock: Lenis is driven by gsap.ticker, ScrollTrigger reads Lenis.
// Reduced motion → native scroll, no Lenis.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './env';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
const listeners = new Set<(s: ScrollState) => void>();
// wheel gates: one returning true has taken the gesture, so Lenis leaves it alone
const wheelGates = new Set<(deltaY: number, y: number) => boolean>();

export type ScrollState = { y: number; velocity: number; progress: number };
const state: ScrollState = { y: 0, velocity: 0, progress: 0 };

export function initScroll() {
  if (lenis || prefersReducedMotion()) {
    // Still publish native scroll position for WebGL sync.
    if (!lenis) addEventListener('scroll', nativeTick, { passive: true });
    return;
  }
  lenis = new Lenis({
    lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.2, anchors: true,
    virtualScroll: ({ deltaY, event }) => {
      if (event.type !== 'wheel' || !lenis || lenis.isLocked) return true;
      for (const gate of wheelGates) {
        if (gate(deltaY, lenis.scroll)) { event.preventDefault(); return false; }
      }
      return true;
    },
  });
  lenis.on('scroll', (l: Lenis) => {
    state.y = l.scroll;
    state.velocity = l.velocity;
    state.progress = l.limit > 0 ? l.scroll / l.limit : 0; // Lenis reports 1 on pages that cannot scroll
    ScrollTrigger.update();
    listeners.forEach((fn) => fn(state));
  });
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function nativeTick() {
  const max = document.documentElement.scrollHeight - innerHeight;
  state.velocity = scrollY - state.y;
  state.y = scrollY;
  state.progress = max > 0 ? scrollY / max : 0;
  listeners.forEach((fn) => fn(state));
}

export const onScroll = (fn: (s: ScrollState) => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const scrollState = () => state;
/** Let fn take a wheel gesture before Lenis does: return true to swallow it (smooth scroll only). */
export const onWheelGate = (fn: (deltaY: number, y: number) => boolean) => {
  wheelGates.add(fn);
  return () => wheelGates.delete(fn);
};
/** A locked glide: wheel input waits until it lands. Falls back to scrollToTarget without Lenis. */
export function glideTo(y: number, duration = 1.1) {
  if (lenis) lenis.scrollTo(y, { duration, lock: true, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else scrollTo({ top: y });
}
export const stopScroll = () => lenis?.stop();
export const startScroll = () => lenis?.start();
export function resetScroll() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else scrollTo(0, 0);
  state.y = 0;
  state.velocity = 0;
}
export function scrollToTarget(target: string | HTMLElement | number) {
  if (lenis) lenis.scrollTo(target, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else if (typeof target === 'number') scrollTo({ top: target });
  else (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView();
}
