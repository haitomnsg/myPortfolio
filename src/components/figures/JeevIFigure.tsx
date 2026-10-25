'use client';
import * as k from '@/figures/kit/iso-kit.mjs';
import * as G from '@/figures/kit/lathe.mjs';
import * as M from '@/figures/jeevi/model.mjs';
import { makeJeevi } from '@/figures/jeevi/parts.mjs';
import { mountJeevi } from '@/figures/jeevi/live.mjs';
import data from '@/figures/jeevi/data.json';
import { FigureCard, type Mount } from './FigureCard';

// Built by tools/figures/jeevi.mjs.
const mount: Mount = (el, say, describe) => mountJeevi(el, { k, G, M, parts: makeJeevi(k, G, M, data.P), data, say, describe });
const HINT: [string, string] = ['move to set the speed · press a terrain', 'tap a terrain button'];

/** Fig 2, JeevI trotting on a treadmill that carries its three training terrains. */
export function JeevIFigure({ className }: { className?: string }) {
  return (
    <FigureCard
      fig="Fig 2"
      title="JeevI on three terrains"
      hint={HINT}
      readout="flat · reward 256.27"
      src="/figures/jeevi.svg"
      aspect={[M.W, M.H]}
      label="JeevI on a treadmill. Press 1, 2 or 3 for flat, rough or box terrain; the left and right arrows change the belt speed."
      mount={mount}
      className={className}
    />
  );
}
