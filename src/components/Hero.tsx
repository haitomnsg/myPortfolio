import type { CSSProperties } from 'react';
import { focusOf, HUD } from '@/data/focus';
import { site } from '@/data/site';
import { Focus } from './Focus';

// The hero's entrance is CSS (intro-* classes), so it starts at first paint, not at hydration.
const d = (s: number) => ({ '--d': `${s}s` }) as CSSProperties;
const REST = 40; // px of blur the subject rests at: 12% focus
const [first, last] = site.name.split(' ');

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-name" data-hero>
      <div className="hero__field" aria-hidden="true" />
      <Focus blur={REST} />

      {/* the viewfinder is the camera's own readout, so it stays out of the accessibility tree */}
      <div className="vf intro-fade" aria-hidden="true" style={d(0.6)}>
        <span className="vf__c vf__c--tl">{HUD.mode}</span>
        <span className="vf__c vf__c--tr"><span data-focus-readout>{focusOf(REST)}</span>%</span>
        <span className="vf__c vf__c--bl">{HUD.shutter} · {HUD.aperture}</span>
        <span className="vf__c vf__c--br">{HUD.iso}</span>
      </div>

      <div className="hero__type">
        {/* fades rather than unmasks: this is the phone's LCP, and a masked line is measured at its first sliver */}
        <p className="hero__lede intro-soft" style={d(0.15)}>
          <span className="line">{site.lede}</span>
        </p>
        <h1 id="hero-name" className="name intro-lines" style={d(0.3)}>
          <span className="line"><span>{first}</span></span>{' '}
          <span className="line" style={{ '--i': 1 } as CSSProperties}><span>{last}</span></span>
          <span className="sr-only">, {site.role}</span>
        </h1>
      </div>
    </section>
  );
}
