// Fig 6, DementiaBot, as a model (mm; x along the bench, y across, z up). From the team's proposal
// and pitch decks (D:\HarwardHealth) and Ashish's photos: a white board on four TT gear motors, a
// power bank with a round speaker on it, a Raspberry Pi in its case with a USB webcam on top, a
// four-cell battery box, and a white medicine box whose lid an SG90 servo lifts at reminder time.
// It follows the patient indoors (vision-based person tracking, smoothed), and reminds them by voice.
// On the bench a peg figure stands in for the person, on a carriage that runs along a rail.

export const W = 640;
export const H = 500;
export const AZIMUTH = 58;
export const PLATE = { x: -178, y: -134, w: 530, d: 268, r: 9 };
export const WHEEL = { r: 32.5, w: 26, x: 76, y: 101 };
export const SHAFT_Z = WHEEL.r;
export const DECK_Z = SHAFT_Z + 11; // the board rests on the four gearboxes
export const DECK_T = 4;
export const TOP = DECK_Z + DECK_T;
export const DECK = { x: -108, y: -88, w: 216, d: 176, r: 3 };
export const BANK = { x: -104, y: -40, w: 62, d: 116, r: 5, h: 15 };
export const SPEAKER = { x: -72, y: 18, r: 36, h: 32 }; // lying on the power bank
export const SPEAKER_TOP = TOP + BANK.h + SPEAKER.h;
export const BOX = { x: -26, y: -84, w: 56, d: 56, r: 1.2, h: 92, wall: 1.8 }; // the medicine box
// the servo sits in a cut-out in the box's near wall, its shaft (the lid's hinge) along y
export const HINGE = { x: -18, z: TOP + BOX.h - 11 };
export const WALL_Y = BOX.y + BOX.d; // the box's near wall, where the servo's tabs sit
export const LID = { x0: BOX.x - 1, x1: BOX.x + BOX.w + 1, y0: BOX.y - 1, y1: WALL_Y + 12.2, t: 1.5 };
export const OPEN = 104; // how far the servo lifts the lid, degrees
export const PI = { x: 40, y: -84, w: 60, d: 92, r: 4, h: 28 };
// the webcam on its folding clip, a rounded bar along y, its lens to the front
export const CAM = { x: 70, y: -38, len: 92, w: 24, h: 26, r: 10, z: TOP + PI.h + 4 + 13 };
export const LENS = [CAM.x + CAM.w / 2 + 1.2, CAM.y, CAM.z]; // where it looks from
export const CELLS = { x: 46, y: 38, w: 56, d: 44, r: 3, h: 24 };
export const RAIL = { x0: 96, x1: 344, w: 18 };
export const CARRIAGE = { h: 10, z: 8 };
export const PERSON_Z = CARRIAGE.z + CARRIAGE.h; // the peg figure's base stands here
export const PERSON = { min: 150, max: 300 };
export const FOLLOW = 200; // from the robot's centre to the person, once it has caught up
export const TRAVEL = 50; // the robot's travel either way along the bench

/** The peg figure's body, turned: hem, waist, shoulders, neck (s up from its base, r). */
export const BODY = [[0, 0], [0, 12.4], [1.6, 12.8, 1], [26, 11.4, 1], [48, 11.6, 1], [62, 13.2, 1], [69, 12.4, 1], [74, 9, 1], [77.4, 5.6, 1], [79, 4.6], [79, 0]];
export const BASE = { r: 16, h: 3 };
// the head sits on the neck's flat top
export const HEAD = { r: 10.5, z: PERSON_Z + BASE.h + 79 + 10.5 };

/**
 * The servo's horn, the lid and its side flap, turned `deg` about the hinge (front edge up). Pieces come
 * back in painting order; each has `{ name, centre, solid, style, cls, marks, shape }`.
 */
export function lidOf(k, G, P, deg) {
  const { add3, mul3 } = G;
  const a = (deg * Math.PI) / 180;
  const f = [Math.cos(a), 0, Math.sin(a)]; // along the lid, toward its front edge
  const u = [-Math.sin(a), 0, Math.cos(a)]; // the lid's up
  const y = [0, 1, 0];
  const axis = [HINGE.x, 0, HINGE.z];
  const at = (dx, Y, dz) => add3(add3(add3(axis, mul3(f, dx)), mul3(y, Y)), mul3(u, dz));
  const iso = (p) => k.iso(p, P);
  const D = (points, style) => k.dotsSvg(points, style);
  const L = (d, style) => k.lineSvg(d, style);
  const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  // a flat piece across y from Y0 to Y1, its outline drawn in the lid's own (dx, dz) plane
  const sheet = (name, Y0, Y1, poly, cls, marks = "") => {
    const F = G.frameOf(at(0, 0, 0), y, f, u);
    return { name, centre: at(poly.reduce((s, p) => s + p[0], 0) / poly.length, (Y0 + Y1) / 2, poly.reduce((s, p) => s + p[1], 0) / poly.length), solid: G.prismOf(F, poly, Y0, Y1, P), style: { tone: "mid" }, cls, marks, shape: { kind: "prism", F, poly, s0: Y0, s1: Y1 } };
  };
  const pieces = [];
  // the horn: a one-armed servo horn on the shaft, its arm pointing up into the flap
  const horn = G.stadium(3.6, 2.2, 7).map(([p, q]) => [q, p]);
  pieces.push(sheet("lid.horn", WALL_Y + 9.6, WALL_Y + 11.2, horn, "mat-cell"));
  // the lid: a card plate on the rim, overhanging the near wall to carry the flap
  const plate = rect(LID.x0 - HINGE.x, LID.x1 - HINGE.x, 11, 11 + LID.t);
  const fold = (dx) => k.pathOf([iso(at(dx, LID.y0 + 1, 11 + LID.t)), iso(at(dx, LID.y1 - 1, 11 + LID.t))]);
  pieces.push(sheet("lid.plate", LID.y0, LID.y1, plate, "", L(fold(LID.x1 - HINGE.x - 9), { tone: "faint" })));
  // the side flap folded down from the plate's edge and screwed to the horn's arm
  const flap = [[LID.x0 - HINGE.x, 4], [9, 4], [9, 11], [LID.x0 - HINGE.x, 11]];
  pieces.push(sheet("lid.flap", LID.y1 - 1, LID.y1, flap, "", D([iso(at(0, LID.y1, 7))], { size: 0.55, tone: "hi" })));
  return pieces;
}

/** One lid piece as markup. */
export const pieceSvgOf = (k, p) => {
  const svg = k.solidSvg(p.solid, p.style) + (p.marks || "");
  return p.cls ? `<g class="${p.cls}">${svg}</g>` : svg;
};
