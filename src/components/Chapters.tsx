import { ChapterTabs } from './ChapterTabs';

export function Chapters() {
  return (
    // Robotics and AI have their own sections now; Software waits here until its own is built
    <section id="chapters" className="chapters" aria-labelledby="chapters-title" data-dark>
      <h2 id="chapters-title" className="chapters__title" data-split="lines">
        And the rest of the work.
      </h2>
      <ChapterTabs />
    </section>
  );
}
