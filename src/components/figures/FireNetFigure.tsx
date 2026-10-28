'use client';
import * as k from '@/figures/kit/iso-kit.mjs';
import * as G from '@/figures/kit/lathe.mjs';
import * as M from '@/figures/rovers/firenet.mjs';
import * as W from '@/figures/rovers/wheels.mjs';
import { mountFireNet } from '@/figures/rovers/live.mjs';
import data from '@/figures/rovers/firenet.json';
import { FigureCard, type Mount } from './FigureCard';

// Built by tools/figures/firenet.mjs.
const mount: Mount = (el, say, describe) => mountFireNet(el, { k, G, M, W, data, say, describe });
const HINT: [string, string] = ['click to press the lighter', 'tap to press the lighter'];

/** Fig 8, the fire & smoke network: a battery node smells the lighter's gas and the master raises the alarm. */
export function FireNetFigure({ className }: { className?: string }) {
  return (
    <FigureCard
      fig="Fig 8"
      title="Fire network"
      hint={HINT}
      readout="node asleep · wakes in 3 s"
      src="/figures/firenet.svg"
      aspect={[M.W, M.H]}
      label="The fire and smoke network: two units on two breadboards. The sensor node, an ESP32-C3 with an MQ-2 smoke sensor, a DHT11 and a buzzer on an 18650 cell, has a lighter held over its MQ-2. The master, a NodeMCU on USB power, has an RGB LED, a buzzer and an OLED standing in front. The node sleeps 10 seconds between readings; it reads the MQ-2, sounds its own buzzer if it smells gas, and sends the reading to the master over WiFi; the master's LED, buzzer and screen show the alarm. Enter presses the lighter's lever."
      mount={mount}
      className={className}
    />
  );
}
