import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Focus } from '@/components/Focus';

export const metadata: Metadata = {
  title: 'Out of focus',
  description: 'There is nothing at this address. Head back to the start of Ashish Gupta’s portfolio.',
};

const d = (s: number) => ({ '--d': `${s}s` }) as CSSProperties;

export default function NotFound() {
  return (
    <section className="hero hero--lost" aria-labelledby="lost-title">
      <div className="hero__field" aria-hidden="true" />
      <Focus blur={45} af={false} />
      <div className="lost">
        <h1 id="lost-title" className="lost__title intro-lines" style={d(0.1)}>
          <span className="line"><span>Out of focus.</span></span>
        </h1>
        <p className="lost__text intro-fade" style={d(0.4)}>Nothing lives at this address.</p>
        <Link className="lost__back intro-fade" href="/" prefetch={false} style={d(0.55)} data-fill>
          <span className="fill" aria-hidden="true" />
          Back to the start
        </Link>
      </div>
    </section>
  );
}
