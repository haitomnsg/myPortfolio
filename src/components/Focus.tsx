import type { CSSProperties } from 'react';
import { FACE, PORTRAIT } from '@/data/focus';

/**
 * The subject, out of focus. A canvas redraws the portrait at the driver's blur, smeared sideways
 * like a slow shutter (src/motion/focus.ts); the <img> is the no-JS and first-paint version. The AF
 * box rests on the face; under a mouse it follows the pointer and shows the portrait sharp inside
 * it, cut from the same canvas so it lines up with the blur under it.
 */
export function Focus({ blur = 40, af = true }: { blur?: number; af?: boolean }) {
  const vars = { '--blur': `${blur}px`, '--fx': FACE.x, '--fy': FACE.y, '--fw': FACE.w, '--fh': FACE.h } as CSSProperties;
  return (
    <div className="focus" data-focus-stage data-blur={blur} aria-hidden="true" style={vars}>
      <div className="focus__drift" data-focus-drift>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="focus__img" data-silhouette src="/hero/silhouette.webp" alt="" width={PORTRAIT.small.w} height={PORTRAIT.small.h} fetchPriority="high" />
        <canvas className="focus__canvas" data-focus-canvas />
      </div>
      {af && (
        <>
          <svg className="rings" viewBox="-100 -100 200 200">
            <circle r="70" />
            <circle r="99" />
          </svg>
          <div className="af" data-af>
            <div className="af__frame">
              <div className="af__lens">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/hero/portrait.webp" alt="" width={PORTRAIT.w} height={PORTRAIT.h} loading="lazy" data-af-img />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
