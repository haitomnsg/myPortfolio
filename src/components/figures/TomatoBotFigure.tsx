'use client';
import * as k from '@/figures/kit/iso-kit.mjs';
import * as G from '@/figures/kit/lathe.mjs';
import * as M from '@/figures/tomatobot/model.mjs';
import { makeArm } from '@/figures/tomatobot/arm.mjs';
import { mountTomatobot } from '@/figures/tomatobot/live.mjs';
import data from '@/figures/tomatobot/data.json';
import { FigureCard, type Mount } from './FigureCard';

// Built by tools/figures/tomatobot.mjs.
const mount: Mount = (el, say, describe) => mountTomatobot(el, { k, G, M, arm: makeArm(k, G, M, data.P), data, say, describe });
const HINT: [string, string] = ['point at a tomato', 'tap a tomato'];

/** Fig 1, TomatoBot v2 on its bench: point at (or tap) a tomato and it drives over, focuses and picks the ripe ones. */
export function TomatoBotFigure({ className }: { className?: string }) {
  return (
    <FigureCard
      fig="Fig 1"
      title="TomatoBot bench"
      hint={HINT}
      readout="scanning · 3 ripe"
      src="/figures/tomatobot.svg"
      aspect={[M.W, M.H]}
      label="TomatoBot v2 picking tomatoes. Use the arrow keys to choose a tomato and Enter to pick it."
      mount={mount}
      className={className}
    />
  );
}
