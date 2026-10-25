import type { Metadata } from 'next';
import { FaceTrackerFigure } from '@/components/figures/FaceTrackerFigure';
import { JeevIFigure } from '@/components/figures/JeevIFigure';
import { ObstacleCarFigure } from '@/components/figures/ObstacleCarFigure';
import { RescueFigure } from '@/components/figures/RescueFigure';
import { TomatoBotFigure } from '@/components/figures/TomatoBotFigure';

// A workbench for the Robotics figures, all five on one page. Not linked, not in the sitemap; the
// figures live in the Robotics focus ring, so this can go once they no longer need side-by-side review.
export const metadata: Metadata = { title: 'Lab: Robotics figures', robots: { index: false, follow: false } };

export default function Lab() {
  return (
    <main style={{ minHeight: '100svh', padding: '120px var(--margin) 80px', background: 'var(--c-field-hi)' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 48 }}>
        <TomatoBotFigure />
        <JeevIFigure />
        <FaceTrackerFigure />
        <ObstacleCarFigure />
        <RescueFigure />
      </div>
    </main>
  );
}
