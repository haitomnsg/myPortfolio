import { ChapterTabs } from './ChapterTabs';

export function Chapters() {
  return (
    // Robotics has its own section now; AI, Software and Design wait here until theirs are built
    <section id="chapters" className="chapters" aria-labelledby="chapters-title" data-dark>
      <h2 id="chapters-title" className="chapters__title" data-split="lines">
        And the rest of the work.
      </h2>
      <ChapterTabs />
    </section>
  );
}
