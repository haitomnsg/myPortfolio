'use client';
import * as k from '@/figures/kit/iso-kit.mjs';
import * as G from '@/figures/kit/lathe.mjs';
import * as M from '@/figures/rovers/dementiabot.mjs';
import * as W from '@/figures/rovers/wheels.mjs';
import { mountDementiaBot } from '@/figures/rovers/live.mjs';
import data from '@/figures/rovers/dementiabot.json';
import { FigureCard, type Mount } from './FigureCard';

// Built by tools/figures/dementiabot.mjs.
const mount: Mount = (el, say, describe) => mountDementiaBot(el, { k, G, M, W, data, say, describe });
const HINT: [string, string] = ['move to walk, click to remind', 'tap ahead to walk, tap the robot to remind'];

/** Fig 6, DementiaBot on a bench: it follows a figure along a rail and, at reminder time, speaks and opens its medicine box. */
export function DementiaBotFigure({ className }: { className?: string }) {
  return (
    <FigureCard
      fig="Fig 6"
      title="DementiaBot"
      hint={HINT}
      readout="person · 76 mm ahead · holding"
      src="/figures/dementiabot.svg"
      aspect={[M.W, M.H]}
      label="DementiaBot behind a small figure on a rail. The left and right arrow keys move the figure and the robot follows at its distance; Enter gives a medicine reminder, and the speaker sounds as the servo lifts the medicine box's lid."
      mount={mount}
      className={className}
    />
  );
}
