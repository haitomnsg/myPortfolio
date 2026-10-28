// Fig 8, the fire & smoke network, as a model (mm; x along the bench, y across, z up). From the project
// in D:\fireSmokeDetectionNetwork (README, docs/wiring.md, docs/components.md, both config.h files and
// the firmware): two units, each on its own half-size breadboard. The sensor node is an ESP32-C3 Super
// Mini with an MQ-2 smoke sensor, a DHT11 and a buzzer module, run from one 18650 in a holder; it sleeps
// 10 s between readings, watches the MQ-2 for 2 s, sounds its own buzzer first, then sends the reading to the master
// over WiFi and goes back to sleep. The master is a NodeMCU (ESP8266) on USB power that runs its own
// access point (FireDetector, 192.168.4.1), shows the network on an SSD1306 OLED, and lights an RGB LED
// and sounds a buzzer at the worst level any node reports. On the bench a lighter, held over the MQ-2 in
// a helping hand, is the calibration's test: its gas is what the node smells.

export const W = 640;
export const H = 500;
export const AZIMUTH = 66;
export const PLATE = { x: -190, y: -88, w: 286, d: 140, r: 9 };

// ---------------------------------------------------------------- the breadboards (400 ties each)
export const BB = { len: 82.5, wide: 54.5, t: 8.5 };
export const BT = BB.t; // the boards' top
/** Along a board from its -x end: where row `r` (1..30) is. */
export const ROW = (r) => 4.4 + (r - 1) * 2.54;
/** Across a board, from its middle: the ten columns a–j, and the power rails (inner, outer) at each edge. */
export const COL = { a: -13.97, b: -11.43, c: -8.89, d: -6.35, e: -3.81, f: 3.81, g: 6.35, h: 8.89, i: 11.43, j: 13.97 };
export const RAIL = { in: 20.9, out: 23.4 };
/** Along a board: where the rails' holes are (five, then a gap). */
export const railHoles = () => Array.from({ length: 30 }, (_, p) => p).filter((p) => p % 6 !== 5).map((p) => 4.4 + p * 2.54);
export const NODE_X = -150; // the node's board, its -x end
export const MASTER_X = -20; // the master's board
export const holeOf = (x0, row, b) => [x0 + ROW(row), b, BT];

// ---------------------------------------------------------------- the node: what stands on its board
// the C3 Super Mini straddles the channel at the board's +x end, its antenna toward the master; its 5V,
// GND, 3V3, GPIO4, GPIO3, GPIO2, GPIO1, GPIO0 side runs along the back, row 23 (5V) to row 30 (GPIO0)
export const C3 = { row0: 23, back: COL.d, front: COL.h, len: 22.5, wide: 18, lift: 2.5, pcb: 1 };
// the three modules stand with their pins in column b, wired along the back (column a) to the C3
export const MQ = { row0: 5, len: 32, wide: 22, lift: 2.5, pcb: 1.6, r: 9.4, cap: 9 }; // VCC GND DO AO, rows 5–8
export const BZ_NODE = { row0: 13, len: 18, wide: 12, lift: 2.5, pcb: 1.6, r: 6, h: 9.5 }; // −, +, S, rows 13–15
export const DHT = { row0: 18, tall: 26, wide: 12, pcb: 1.6, body: { w: 12, d: 5.5, h: 15.5 } }; // −, DATA, +, rows 18–20
export const CELL = { x: -180, y: -38.5, w: 22, d: 77, h: 21 }; // the 18650 in its holder, along y, left of the board
// the helping hand behind the board holds the lighter over the MQ-2, nozzle down toward the cap
export const HAND = { base: [-122, -58], baseR: 17, post: 58 };

// ---------------------------------------------------------------- the master
// the NodeMCU straddles columns a and h, rows 16–30, its ESP-12E antenna toward the node and its micro-USB
// out of the +x end; its D0, D1, D2, D3, D4, 3V3, GND, D5, D6, D7 side runs along the front, rows 16–25
export const MCU = { row0: 16, back: COL.a, front: COL.h, len: 48.3, wide: 25.4, lift: 2.5, pcb: 1.6 };
export const LED = { row0: 3, col: COL.c, r: 2.5 }; // R, K (common cathode), G, B, rows 3–6
export const BZ_MASTER = { rows: [9, 12], col: COL.b, r: 6, h: 9.5 };
export const OLED = { x: -30, y: 40, w: 27.3, h: 27.8, t: 1.2, glass: { w: 26.7, h: 19.3 }, active: { w: 21.7, h: 10.9 }, z0: 7 };
export const CHARGER = { x: 32, y: -80, w: 32, d: 34, h: 20, r: 5 };

// ---------------------------------------------------------------- the firmware's numbers
export const SLEEP = 10; // REPORT_INTERVAL_S
export const WATCH = 2; // SMOKE_WATCH_MS: the node watches the MQ-2 this long and keeps the peak
export const JOIN = 1.1; // joining the master's access point (WIFI_TIMEOUT_MS caps it at 10 s)
export const SEND = 0.35; // the GET to /api/data and the master's reply
export const SMOKE = { warn: 120, crit: 600 }; // SMOKE_WARN / SMOKE_CRIT (both config.h files agree)
export const TEMP = { warn: 45, crit: 60 };
export const AIR = { temp: 24, hum: 58 }; // what the DHT11 reads on the bench
export const NODE_BEEPS = [[], [[0, 0.08], [0.2, 0.08]], [0, 1, 2, 3, 4].map((i) => [i * 0.5, 0.25])]; // the node's own alarm, per level
export const MASTER_BEEP = [null, { on: 0.2, off: 1.8 }, { on: 0.4, off: 0.2 }]; // the master's cadence, per level
export const OLED_ROTATE = 4; // OLED_ROTATE_MS
export const OLED_TOP = 5; // OLED_TOP_OFFSET: the panel's top rows are dead, everything is drawn 5 px lower
export const LEVELS = ["NORMAL", "WARNING", "CRITICAL"];
export const levelOf = (smoke, temp = AIR.temp) => (smoke >= SMOKE.crit || temp >= TEMP.crit ? 2 : smoke >= SMOKE.warn || temp >= TEMP.warn ? 1 : 0);

// ---------------------------------------------------------------- the MQ-2 and the lighter's gas
// The gas at the cap rises within half a second of the lever and thins out over a few seconds; the MQ-2's
// tin oxide answers it fast and lets go slowly, so one puff reads critical, then warning, then clean air
// on three wakes in a row. The index is the firmware's: 0 in clean air, 1000 for the lighter held close.
export const GAS = { rise: 0.35, hold: 1.4, thin: 3.2 };
export const MQ2 = { rise: 0.9, fall: 9, full: 980, noise: 9 };
/** The gas at the cap, 0..1, `t` seconds after the lever went down. */
export function gasAt(t) {
  if (t < 0) return 0;
  if (t < GAS.rise) return t / GAS.rise;
  if (t < GAS.rise + GAS.hold) return 1;
  return Math.exp(-(t - GAS.rise - GAS.hold) / GAS.thin);
}
/** The sensor's index after `dt` more seconds of `gas`. */
export function sensorStep(index, gas, dt) {
  const target = MQ2.full * gas;
  const tau = target > index ? MQ2.rise : MQ2.fall;
  return target + (index - target) * Math.exp(-dt / tau);
}

// ---------------------------------------------------------------- the OLED: the firmware's three screens, in a 5 × 7 font
const GLYPHS = {
  " ": ".....|.....|.....|.....|.....|.....|.....",
  A: ".###.|#...#|#...#|#####|#...#|#...#|#...#",
  C: ".###.|#...#|#....|#....|#....|#...#|.###.",
  D: "####.|#...#|#...#|#...#|#...#|#...#|####.",
  E: "#####|#....|#....|####.|#....|#....|#####",
  F: "#####|#....|#....|####.|#....|#....|#....",
  G: ".###.|#...#|#....|#.###|#...#|#...#|.####",
  H: "#...#|#...#|#...#|#####|#...#|#...#|#...#",
  I: ".###.|..#..|..#..|..#..|..#..|..#..|.###.",
  L: "#....|#....|#....|#....|#....|#....|#####",
  M: "#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#",
  N: "#...#|#...#|##..#|#.#.#|#..##|#...#|#...#",
  O: ".###.|#...#|#...#|#...#|#...#|#...#|.###.",
  P: "####.|#...#|#...#|####.|#....|#....|#....",
  R: "####.|#...#|#...#|####.|#.#..|#..#.|#...#",
  S: ".####|#....|#....|.###.|....#|....#|####.",
  T: "#####|..#..|..#..|..#..|..#..|..#..|..#..",
  U: "#...#|#...#|#...#|#...#|#...#|#...#|.###.",
  W: "#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.",
  a: ".....|.....|.###.|....#|.####|#...#|.####",
  c: ".....|.....|.###.|#....|#....|#...#|.###.",
  d: "....#|....#|.##.#|#..##|#...#|#...#|.####",
  e: ".....|.....|.###.|#...#|#####|#....|.###.",
  i: "..#..|.....|.##..|..#..|..#..|..#..|.###.",
  k: "#....|#....|#..#.|#.#..|##...|#.#..|#..#.",
  l: ".##..|..#..|..#..|..#..|..#..|..#..|.###.",
  m: ".....|.....|##.#.|#.#.#|#.#.#|#...#|#...#",
  o: ".....|.....|.###.|#...#|#...#|#...#|.###.",
  p: ".....|.....|####.|#...#|####.|#....|#....",
  r: ".....|.....|#.##.|##..#|#....|#....|#....",
  s: ".....|.....|.####|#....|.###.|....#|####.",
  t: ".#...|.#...|###..|.#...|.#...|.#..#|..##.",
  u: ".....|.....|#...#|#...#|#...#|#..##|.##.#",
  v: ".....|.....|#...#|#...#|#...#|.#.#.|..#..",
  0: ".###.|#...#|#..##|#.#.#|##..#|#...#|.###.",
  1: "..#..|.##..|..#..|..#..|..#..|..#..|.###.",
  2: ".###.|#...#|....#|...#.|..#..|.#...|#####",
  3: "#####|...#.|..#..|...#.|....#|#...#|.###.",
  4: "...#.|..##.|.#.#.|#..#.|#####|...#.|...#.",
  5: "#####|#....|####.|....#|....#|#...#|.###.",
  6: "..##.|.#...|#....|####.|#...#|#...#|.###.",
  7: "#####|....#|...#.|..#..|.#...|.#...|.#...",
  8: ".###.|#...#|#...#|.###.|#...#|#...#|.###.",
  9: ".###.|#...#|#...#|.####|....#|...#.|.##..",
  ":": ".....|..#..|..#..|.....|..#..|..#..|.....",
  ".": ".....|.....|.....|.....|.....|.##..|.##..",
  "/": ".....|....#|...#.|..#..|.#...|#....|.....",
  "!": "..#..|..#..|..#..|..#..|..#..|.....|..#..",
  "%": "##...|##..#|...#.|..#..|.#...|#..##|...##",
  _: ".....|.....|.....|.....|.....|.....|#####",
};

/**
 * What the master's OLED shows: one of the firmware's screens as text runs at (x, y) in panel pixels,
 * `size` 1 or 2, and the rules under the titles. `screen` 0 is the summary, 1 the node's detail, 2 the alert.
 */
export function screenOf(screen, { smoke, level }) {
  const y = (v) => v + OLED_TOP;
  if (screen === 0) {
    return { text: [[0, y(0), 1, "FIRE MONITOR"], [0, y(16), 1, "Nodes : 1/1"], [0, y(28), 1, "AP IP : 192.168.4.1"], [0, y(42), 2, LEVELS[level]]], rules: [y(10)] };
  }
  if (screen === 1) {
    return {
      text: [[0, y(0), 1, "NODE: NODE_01"], [0, y(15), 1, `Smoke : ${smoke}`], [0, y(27), 1, `Temp  : ${AIR.temp.toFixed(1)} C`], [0, y(39), 1, `Humid : ${AIR.hum} %`], [0, y(51), 1, `State : ${LEVELS[level]}`]],
      rules: [y(10)],
    };
  }
  if (level === 0) return { text: [[0, y(0), 1, "All clear."], [0, y(16), 1, "No active alerts."]], rules: [] };
  return { text: [[0, y(6), 2, level === 2 ? "!! FIRE" : "WARNING"], [0, y(40), 1, "NODE_01"]], rules: [] };
}

/** A screen's lit pixels as runs [x, y, length] along each pixel row (the panel is 128 × 64). */
export function pixelsOf({ text, rules }) {
  const lit = new Uint8Array(128 * 64);
  const set = (x, y) => { if (x >= 0 && x < 128 && y >= 0 && y < 64) lit[y * 128 + x] = 1; };
  for (const [x0, y0, size, s] of text) {
    [...s].forEach((ch, n) => {
      const rows = (GLYPHS[ch] ?? GLYPHS[" "]).split("|");
      rows.forEach((row, ry) => [...row].forEach((c, rx) => {
        if (c !== "#") return;
        for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) set(x0 + n * 6 * size + rx * size + i, y0 + ry * size + j);
      }));
    });
  }
  for (const ry of rules) for (let x = 0; x < 128; x++) set(x, ry);
  const runs = [];
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 128; x++) {
      if (!lit[y * 128 + x]) continue;
      let n = 1;
      while (x + n < 128 && lit[y * 128 + x + n]) n++;
      runs.push([x, y, n]);
      x += n;
    }
  }
  return runs;
}
