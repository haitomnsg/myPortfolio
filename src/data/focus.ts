/** Blur (px) at 0% focus. The hero rests at 40px, which reads as 12%. */
export const MAX_BLUR = 45.45;
export const focusOf = (blur: number) => Math.round(Math.min(1, Math.max(0, 1 - blur / MAX_BLUR)) * 100);

/** The portrait canvas (public/hero/portrait.webp, tools/hero-assets/build_hero_v2.py). */
export const PORTRAIT = { w: 1024, h: 1536, small: { w: 341, h: 512 } };

/** Where the AF box rests: the face, brow to mouth, as shares of the portrait canvas (hero-v2.json). */
export const FACE = { x: 0.5459, y: 0.28, w: 0.3046, h: 0.1315 };

/** The viewfinder's numbers are real: 88% field ripeness, 256 reward, the 2026 paper. */
export const HUD = { mode: 'AF-C', shutter: '1/88', aperture: 'f/2.56', iso: 'ISO 2026' };
