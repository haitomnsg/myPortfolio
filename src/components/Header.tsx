import Link from 'next/link';
import { chapters, site } from '@/data/site';
import { Wordmark } from './Wordmark';

export function Header() {
  return (
    <header className="top intro-fade" style={{ '--d': '0.1s' } as React.CSSProperties}>
      <Link className="brand" href="/" prefetch={false}>
        <Wordmark className="brand__wordmark" label={site.name} />
      </Link>
      <nav className="pills" aria-label="Chapters" data-pills>
        <span className="pills__marker" aria-hidden="true" data-pills-marker />
        <ul>
          {chapters.map((c) => (
            <li key={c.id}>
              <a href={`/#${c.id}`} data-chapter-link={c.id}>{c.title}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
