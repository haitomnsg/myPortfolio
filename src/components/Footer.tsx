import { PORTRAIT } from '@/data/focus';
import { site } from '@/data/site';

// The end of the scroll: the subject finally in focus. (Section 06 will grow from here.)
export function Footer() {
  return (
    <footer className="foot" id="contact" data-dark>
      <div className="foot__main">
        <p className="foot__title" data-split="lines">Say hello.</p>
        <a className="foot__mail" href={`mailto:${site.email}`} data-fill>
          <span className="fill" aria-hidden="true" />
          {site.email}
        </a>
        <ul className="foot__social">
          {site.socials.map((s) => (
            <li key={s.label}>
              <a className="draw" href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
            </li>
          ))}
        </ul>
      </div>
      <figure className="foot__portrait">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero/portrait.webp" alt={`${site.name}, in focus at last: glasses, beard, a dark hoodie.`} width={PORTRAIT.w} height={PORTRAIT.h} loading="lazy" />
        <figcaption className="foot__chip">focus 100%</figcaption>
      </figure>
      <p className="foot__small">
        <span>© 2026 {site.name}</span>
        <span>Set in Rethink Sans, Urbanist and Geist Mono</span>
      </p>
    </footer>
  );
}
