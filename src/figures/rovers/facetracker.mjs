// Fig 3, the face & human tracking robot, as a model (mm; x along the bench, y across, z up).
// From docs/PROFILE.md and its photo: an Arduino with an MU vision sensor, two modes (follow a person
// or a traffic sign), on four mecanum wheels. The figure shows traffic-sign mode: the rover strafes
// sideways on its mecanum wheels to keep the sign centred in front of the sensor.

export const W = 640;
export const H = 500;
export const AZIMUTH = 30;
export const PLATE = { x: -186, y: -152, w: 336, d: 304, r: 9 };
export const DECK = { x: -80, y: -50, w: 160, d: 100, r: 3 };
export const DECK_Z = 41;
export const DECK_T = 4;
export const TOP = DECK_Z + DECK_T;
export const WHEEL = { r: 30, w: 30, x: 56, y: 70 };
export const SENSOR = { x: -86, size: 40, z0: 50 }; // the MU board stands across the deck's front edge
export const LENS = [-91, 0, SENSOR.z0 + 22]; // where it looks from, in the rover's frame
export const RAIL = { x: -168, w: 18, y0: -118, y1: 118 };
export const SIGN = { r: 22, z: 104, post: 3 };
export const STRAFE = 62; // the rover's travel either side, mm
export const SIGN_RANGE = 86;
