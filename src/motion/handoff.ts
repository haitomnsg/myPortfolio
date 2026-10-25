// Hero → Robotics: a nudge of the wheel past the hero glides the whole way to the robots' stage, and
// a nudge back up from the band between them returns to the hero. Wheel only, so touch stays native;
// the trailing flick of a trackpad is swallowed until the glide has settled.
import { glideTo, onPage, onWheelGate } from '@/engine';

const GLIDE = 1.1; // s
const SETTLE = 350; // ms after landing that the same flick is still swallowed

export function startHandoff() {
  onPage(() => {
    const hero = document.querySelector<HTMLElement>('[data-hero]');
    const stage = document.getElementById('robotics');
    if (!hero || !stage) return;
    let until = 0;
    return onWheelGate((dy, y) => {
      const now = performance.now();
      if (now < until) return true;
      const dest = Math.round(stage.getBoundingClientRect().top + y);
      const down = dy > 0 && y < dest - 4;
      const up = dy < 0 && y > 4 && y <= dest + 4; // from the first robot straight back
      if (!down && !up) return false;
      glideTo(down ? dest : 0, GLIDE);
      until = now + GLIDE * 1000 + SETTLE;
      return true;
    });
  });
}
