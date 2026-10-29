// Section handoffs: a nudge of the wheel past one stage glides the whole way to the next, and a nudge
// back up from the next returns to where the last one rested.
// - Hero → Robotics: past the hero to the robots' stage; up from the first robot back to the hero.
// - Robotics → AI: once the arch has turned to its last robot, down glides to the AI reel; up from
//   the reel's top glides back to the last robot. Only while the arch is pinned (ring mode).
// - AI → Software: the reel is one screen, so down from it glides to the desk, and up from the desk's
//   first app glides back to the reel. Only while the reel runs and the desk is pinned.
// Wheel only, so touch stays native; the trailing flick of a trackpad is swallowed until the glide
// has settled.
import { glideTo, onPage, onWheelGate } from '@/engine';

const GLIDE = 1.1; // s
const SETTLE = 350; // ms after landing that the same flick is still swallowed

export function startHandoff() {
  onPage(() => {
    const hero = document.querySelector<HTMLElement>('[data-hero]');
    const stage = document.getElementById('robotics');
    if (!hero || !stage) return;
    const ring = stage.closest<HTMLElement>('.robotics');
    const reel = document.getElementById('ai');
    let until = 0;
    return onWheelGate((dy, y) => {
      const now = performance.now();
      if (now < until) return true;
      const glide = (to: number) => {
        glideTo(to, GLIDE);
        until = now + GLIDE * 1000 + SETTLE;
        return true;
      };
      const dest = Math.round(stage.getBoundingClientRect().top + y);
      if (dy > 0 && y < dest - 4) return glide(dest);
      if (dy < 0 && y > 4 && y <= dest + 4) return glide(0); // from the first robot straight back
      if (!reel) return false;
      const ai = Math.round(reel.getBoundingClientRect().top + y);
      // the arch's last robot rests where its track stops pinning, and has settled 30% of a step before
      // (Robotics.tsx, turnOf)
      if (ring && ring.dataset.mode === 'ring') {
        const run = stage.offsetHeight - innerHeight;
        const steps = ring.querySelectorAll('.rcard').length - 1;
        const last = Math.round(dest + run);
        const settled = steps > 0 ? Math.round(dest + ((steps - 0.3) / steps) * run) : last;
        if (dy > 0 && y >= settled - 4 && y < ai - 4) return glide(ai);
        if (dy < 0 && y > last + 4 && y <= ai + 4) return glide(last);
      }
      const desk = document.getElementById('software');
      if (!desk || reel.dataset.mode !== 'film' || desk.closest<HTMLElement>('.software')?.dataset.mode !== 'desk') return false;
      const sw = Math.round(desk.getBoundingClientRect().top + y);
      if (dy > 0 && y >= ai - 4 && y < sw - 4) return glide(sw);
      if (dy < 0 && y > ai + 4 && y <= sw + 4) return glide(ai);
      return false;
    });
  });
}
