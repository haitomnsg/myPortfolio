'use client';
import * as k from '@/figures/kit/iso-kit.mjs';
import * as G from '@/figures/kit/lathe.mjs';
import * as M from '@/figures/rovers/rescue.mjs';
import * as W from '@/figures/rovers/wheels.mjs';
import { mountRescue } from '@/figures/rovers/live.mjs';
import data from '@/figures/rovers/rescue.json';
import { FigureCard, type Mount } from './FigureCard';

// Built by tools/figures/rescue.mjs.
const mount: Mount = (el, say, describe) => mountRescue(el, { k, G, M, W, data, say, describe });
const HINT: [string, string] = ['hover to launch the drone', 'tap to launch the drone'];

/** Fig 5, the disaster rescue vehicle: the drone lifts off its roof pad while the arm behind the cabin unfolds. */
export function RescueFigure({ className }: { className?: string }) {
  return (
    <FigureCard
      fig="Fig 5"
      title="Rescue vehicle"
      hint={HINT}
      readout="drone docked · arm folded"
      src="/figures/rescue.svg"
      aspect={[M.W, M.H]}
      label="The rescue vehicle with a drone on its roof and a folded arm. Press Enter to launch the drone and unfold the arm, and again to bring them back."
      mount={mount}
      className={className}
    />
  );
}
