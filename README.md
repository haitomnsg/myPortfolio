# Ashish Gupta: portfolio (redesign)

The direction is **"In Focus"**: a blurred stranger becomes Ashish as you scroll, read through
frosted-glass instruments that show real numbers from his work. See [DESIGN.md](DESIGN.md).
Built so far: the hero, the chapter index, a contact footer and the 404 (DESIGN.md §6).

The old "Growing Up" build, the Blender walker and the 3D experiments were removed on
2026-10-24 (sent to the Windows Recycle Bin, not hard-deleted).

## Run

```bash
npm install
npm run dev
```

`npm run build` writes the static site to `out/` (any static host: GitHub Pages, Vercel,
Cloudflare Pages). QA a build the way `/awwwards` does:

```bash
node .claude/skills/awwwards/scripts/serve.mjs out --port 4400
node .claude/skills/awwwards/scripts/shoot.mjs http://127.0.0.1:4400/ --crawl --nav
node .claude/skills/awwwards/scripts/audit.mjs http://127.0.0.1:4400/
```

| Code | What |
|---|---|
| `src/data/site.ts` | Every visible string, the instrument values and the chapters. |
| `src/motion/focus.ts` | The concept driver: blur → silhouette canvas, focus readout, loupe; scroll pulls focus. |
| `src/motion/readings.ts` | Chart lines draw, the lime dot rides to the last value, counters count. |
| `src/components/` | Header, Hero (Focus + Readings), ChapterTabs, Footer. |
| `src/engine/` | The `/awwwards` motion engine (GSAP ticker, Lenis, reveals, transitions), copied verbatim. |
| `tools/hero-assets/` | Rebuild `public/hero/*.webp` from a portrait (MediaPipe segmentation, Python). |

## What's here

| Path | What |
|---|---|
| [DESIGN.md](DESIGN.md) | Brief, current-site audit, three concepts, the chosen concept card, palette, type, motion, section-by-section layout. The `/awwwards` skill builds from it. |
| [docs/PROFILE.md](docs/PROFILE.md) | The only source of facts. Nothing goes on the site that isn't in here. |
| [docs/HERO_PROMPT.md](docs/HERO_PROMPT.md) | ChatGPT image prompt to mock up the hero before building. |
| `inspo/images`, `inspo/videos` | The UI direction (Ron Design Lab SOMA cards, CreditKarma). `inspo/contact-sheets` has stills of the videos. |
| `inspo/fonts`, `inspo/pet` | Earlier references, kept. |
| `currentWebsiteAssets/` | Portrait, AG monogram (SVG + PNG), robot photos, app screenshots from haitomns.dev. |
| `.claude/skills/` | Project-only skills (below). |

## Skills (installed in this project only)

Copied from their repos into `.claude/skills/`, not into `~/.claude`. Reviewed before install:
the scripts only drive a local headless Chrome, download fonts (Google/Fontshare) and stock
photos (picsum), and load a hash-pinned axe-core.

| Skill | From | Commit | Use |
|---|---|---|---|
| `anatomy` | [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy) | `1482e84` | Isometric, interactive technical figures with live readouts. Its `scripts/publish.mjs` pushes to a public gallery, so only run it on purpose. |
| `hairline-create`, `hairline-adopt` | [lucasmarkes/hairline](https://github.com/lucasmarkes/hairline) | `37d2e78` | Single-stroke isometric line figures that answer the pointer. Runtime package: `@lucasmarkes/hairline`. |
| `awwwards` | [juliobsz/skills](https://github.com/juliobsz/skills) | `ea8f145` | Builds the site to an Awwwards-level bar, with browser QA. |
| `jury` | [juliobsz/skills](https://github.com/juliobsz/skills) | `ea8f145` | Blind Awwwards-style score of a URL or local build. |

Invoke with `/anatomy`, `/hairline-create`, `/hairline-adopt`, `/awwwards`, `/jury`. If they
don't appear in the `/` menu, start a new session. To update one, re-clone its repo and replace
its folder.
