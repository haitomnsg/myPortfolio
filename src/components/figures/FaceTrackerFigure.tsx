'use client';
import * as k from '@/figures/kit/iso-kit.mjs';
import * as G from '@/figures/kit/lathe.mjs';
import * as M from '@/figures/rovers/facetracker.mjs';
import * as W from '@/figures/rovers/wheels.mjs';
import { mountFaceTracker } from '@/figures/rovers/live.mjs';
import data from '@/figures/rovers/facetracker.json';
import { FigureCard, type Mount } from './FigureCard';

// Built by tools/figures/facetracker.mjs.
const mount: Mount = (el, say, describe) => mountFaceTracker(el, { k, G, M, W, data, say, describe });
const HINT: [string, string] = ['move to slide the sign', 'tap to place the sign'];

/** Fig 3, the face tracker in traffic-sign mode: the sign slides on its rail and the rover strafes to keep it centred. */
export function FaceTrackerFigure({ className }: { className?: string }) {
  return (
    <FigureCard
      fig="Fig 3"
      title="Face tracker"
      hint={HINT}
      readout="sign · centred"
      src="/figures/facetracker.svg"
      aspect={[M.W, M.H]}
      label="The face tracker following a traffic sign. The left and right arrow keys slide the sign; the rover strafes on its mecanum wheels to keep it centred."
      mount={mount}
      className={className}
    />
  );
}
