'use client';
import * as k from '@/figures/kit/iso-kit.mjs';
import * as G from '@/figures/kit/lathe.mjs';
import * as M from '@/figures/rovers/obstacle.mjs';
import * as W from '@/figures/rovers/wheels.mjs';
import { mountObstacleCar } from '@/figures/rovers/live.mjs';
import data from '@/figures/rovers/obstacle.json';
import { FigureCard, type Mount } from './FigureCard';

// Built by tools/figures/obstacle.mjs.
const mount: Mount = (el, say, describe) => mountObstacleCar(el, { k, G, M, W, data, say, describe });
const HINT: [string, string] = ['move to slide the wall', 'tap to place the wall'];

/** Fig 4, the obstacle car on a stand: it drives until the wall is close, looks left and right, and turns to the clearer side. */
export function ObstacleCarFigure({ className }: { className?: string }) {
  return (
    <FigureCard
      fig="Fig 4"
      title="Obstacle car"
      hint={HINT}
      readout="ahead clear · driving"
      src="/figures/obstacle.svg"
      aspect={[M.W, M.H]}
      label="The obstacle car facing a wall on a rail. The left and right arrow keys slide the wall; when it is close ahead the car looks left and right and turns to the clearer side."
      mount={mount}
      className={className}
    />
  );
}
