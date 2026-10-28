'use client';
import * as k from '@/figures/kit/iso-kit.mjs';
import * as G from '@/figures/kit/lathe.mjs';
import * as M from '@/figures/rovers/phulbari.mjs';
import * as W from '@/figures/rovers/wheels.mjs';
import { mountPhulbari } from '@/figures/rovers/live.mjs';
import data from '@/figures/rovers/phulbari.json';
import { FigureCard, type Mount } from './FigureCard';

// Built by tools/figures/phulbari.mjs.
const mount: Mount = (el, say, describe) => mountPhulbari(el, { k, G, M, W, data, say, describe });
const HINT: [string, string] = ['click to dry the soil', 'tap to dry the soil'];

/** Fig 7, Phulbari's pot: an ESP32 reads the soil, and when it is dry a relay runs the pump that waters the plant. */
export function PhulbariFigure({ className }: { className?: string }) {
  return (
    <FigureCard
      fig="Fig 7"
      title="Phulbari"
      hint={HINT}
      readout="soil 46% · moist"
      src="/figures/phulbari.svg"
      aspect={[M.W, M.H]}
      label="Phulbari's pot: a peace lily in a terracotta pot with a soil-moisture probe, an ESP32 and a relay on a breadboard tied to the pot, and a small pump whose clear tube loops into the soil. The soil dries; when the ESP32 reads it as dry, the relay closes and the pump waters the plant, and the reading goes to Firebase. Enter dries the soil at once."
      mount={mount}
      className={className}
    />
  );
}
