# DESIGN: "In Focus"

> Status: direction proposed 2026-10-24, nothing built yet. Replaces the "Growing Up" Blender
> walker and every 3D experiment before it. Facts come from `docs/PROFILE.md` only.
> Format follows the `/awwwards` skill (Brief → Concepts → Concept Card → System → Composition),
> so that skill can pick this file up and build from it.

---

## 0. Brief

| | |
|---|---|
| Subject | Ashish Gupta: AI & robotics engineer, B.Tech AI at Kathmandu University, Head of Development at Haitomns Groups, intern at EncodeX. Builds robots (TomatoBot, JeevI), vision/AI systems (DocLipi, Phulbari) and software in daily use (ArthaVidhi, RestHat, RedSoil). Birgunj → Dhulikhel, Nepal. |
| Audience | Robotics/AI hiring engineers and recruiters, research supervisors, hackathon juries, Haitomns clients. |
| Job | In 10 seconds: "he builds real robots *and* real software, and it works". Then: contact. |
| Assets | `currentWebsiteAssets/`: B/W portrait, AG monogram, TomatoBot / rescue / face-tracking / obstacle robot photos, app screenshots (ArthaVidhi, DocLipi, Jiffy, Phulbari, RedSoil, RestHat). |
| Stack | **Next.js (App Router, TS), static export.** Reason: both figure skills ship React adapters (`anatomy/kit/react`, `@lucasmarkes/hairline/react`) and the site has no server needs. GSAP + Lenis per `/awwwards`. |
| Constraint | Never invent facts. Every number on screen must be in `docs/PROFILE.md`. |

### The current site (haitomns.dev, visited 2026-10-24)

- **Shape:** an admin-dashboard shell. Fixed left sidebar (monogram, Home / About / Projects /
  Robotics / Contact, socials), content on `#f5f5f5` to the right.
- **Home:** round B/W portrait, "Hey 👋, I'm Ashish!", three lines of intro, three pastel cards
  (Programming / AI/ML / Robotics) holding language tag pills. Footer "Programmed with ❤️".
- **About / Projects / Robotics / Contact:** stacked white cards with lists, icon tiles,
  photo+text rows and pastel link tiles.

| Keep | Drop |
|---|---|
| Honest first-person voice, B/W portrait, AG monogram, real robot photos and app screenshots, "Available for projects". | Sidebar app shell, pastel tri-colour cards, tag-pill lists (they say *what he typed*, not *what it did*), emoji hero, Robotics split from Projects, separate pages for a story that should be one scroll. |

**The biggest miss:** the strongest proof is buried or absent. 88% field ripeness detection,
a published paper, a quadruped that converged on three terrains, software running in a blood
bank and in restaurants. The new site leads with those numbers.

**Fact to confirm:** the live About page says *AAVISHKAR 2024, 1st Runner Up*; `PROFILE.md`
says 2023. Use neither until Ashish confirms.

---

## 1. Concepts (three territories, one chosen)

| | A. **In Focus** ✅ | B. Spec Sheet | C. Field Log |
|---|---|---|---|
| One line | A blurred stranger becomes Ashish as you scroll: every project is a reading that sharpens the picture. | The site is the datasheet of a device called "Ashish, Gen 3": parts, callouts, tolerances. | A month-by-month calendar from 2021 to now; a lime check on every month something shipped or won. |
| Territory | His material: computer vision (bringing things into focus) | Product/engineering document | Time / record |
| Signature | Scroll pulls focus on his silhouette; a glass loupe under the cursor shows the sharp portrait. | An Anatomy figure of "him" as a device with spec chips. | Months light up as you scroll. |
| Anchor | His work *is* vision: YOLO ripeness detection, OCR, flower classification. His portrait is already B/W. | Hardware + CAD background. | 2,516 contributions, 7 placements, 1 paper. |
| Originality / Fit / Feasible / Portability↓ | 4 / 5 / 5 / 2 | 3 / 4 / 4 / 3 | 3 / 4 / 5 / 3 |

**Pick A.** It is a story with a beginning (unknown) and an end (in focus) that costs almost
nothing to render, and it is his: an engineer who teaches machines to see. B is too cute and
reduces a person to a product. C survives as one section of A (§5, "Record").

---

## 2. Concept card

```
Idea:        A blurred stranger becomes Ashish as you scroll. Each project is a reading that sharpens him.
Metaphor:    An SLR focusing screen. The first frame is out of register; the rest of the page locks it.
Signature:   The Split Prism. Hero type and the glasses in the silhouette are cut by a horizontal
             rangefinder: the top half sits ~14px to the left of the bottom half. Scroll drives
             that offset to 0 at the same rate as blur (40px → 0). Chapters hunt like AF.
             No loupe, no glass cards on the hero. Proof (JeevI, TomatoBot) starts in chapter 02.
Emotion:     You opened a camera. Someone is in the frame. It is not sharp yet.
Motion verb: Settle like a lens finding focus.
Screenshot:  Olive field, smeared figure, camera corner brackets, giant ASHISH with the letters
             split by a rangefinder, HUD reading 1/88 · f/2.56 · ISO 2026.
```

---

## 3. Art direction system

### Where it comes from (`inspo/`)

- `inspo/images/*`: Ron Design Lab "SOMA" series. A heavily blurred, motion-smeared human
  silhouette, out of focus, on a flat olive / cream / warm-grey field. In front of it sits **one**
  crisp frosted-glass squircle instrument: uppercase label + status dot, one huge light numeral +
  small unit, a ▲ delta, a thin chart with dashed grid, **one** acid-lime data dot with a dashed
  drop line. Giant heavy display type bleeds off the bottom. The CGM-device screen adds a
  technical line drawing with spec chips ("Mass 4.2 g", "NFC 13.56 MHz"), which is exactly
  Anatomy's territory.
- `inspo/videos/*` (frames in `inspo/contact-sheets/`): (1) tall numbered gradient pills as a
  chapter index, rounded tile grids, whip-pan motion-blur transitions, a month grid with lime
  checks, phones held in silhouetted hands; (2) a dark landing page: small pill nav, two-tone
  headline, a bento of 4 glass widgets in front of a blurred figure.

### Guardrails against the AI-default look

The inspo uses two known AI tells (glassmorphism, acid accent). We keep them only under rules:
- **Glass is the instrument, never the layout.** At most two glass instruments per viewport. No
  glass nav bars, glass sections or glass buttons beyond the one round scroll button.
- **Lime is the reading, never the brand.** It marks live data only: the chart dot, the status
  dots, the ▲. Never a fill, a button or a heading. Four lime marks per screen at most.
- The identity is the **field + blurred photograph + giant type**, not black + neon.
- Uppercase tracked labels live only inside instruments, never above section headings.
- **The hero has no glass instruments.** The SOMA glucose card is a chapter language, not the first frame. If the first screenshot could be a health-app ad, it is wrong.

### Palette

| Role | Token | Hex | Use |
|---|---|---|---|
| Field (default ground) | `--field` | `#C6C98A` | Olive, the hero and AI chapter |
| Field, cream | `--field-cream` | `#EFEBDD` | Robotics chapter |
| Field, ash | `--field-ash` | `#BDB7B2` | Software chapter |
| Ink | `--ink` | `#16130F` | Silhouette, text on light, dark section ground |
| Paper | `--paper` | `#F6F4EC` | Text on dark and on photos, light glass base |
| Muted | `--muted` | `#8F8A80` | Units, axis ticks, secondary text |
| Line | `--line` | `rgba(255,255,255,.22)` | Chart grids, dashed guides, glass edges |
| Signal | `--signal` | `#E6F06B` | The reading (see the rule above) |
| Glass, dark | `--glass-d` | `rgba(38,34,28,.52)` + `backdrop-filter: blur(28px) saturate(1.2)` | Main instrument |
| Glass, light | `--glass-l` | `rgba(250,248,240,.62)` + same filter | Secondary instrument, spec figures |

Each chapter shifts the field colour; the glow inside the glass picks up a warm yellow
(`#EFE7A0` at 40% radial, top-right) like the glucose card.

### Type

- **Urbanist** (Google, OFL, variable 100–900): one family for everything visible.
  - Display: 800, `clamp(120px, 19vw, 320px)`, leading 0.82, tracking -0.045em, white, bleeds off-frame.
  - Headline: 300, `clamp(36px, 4.2vw, 64px)`, leading 1.05, tracking -0.02em.
  - Instrument value: 300, 64–96px, `font-variant-numeric: tabular-nums`.
  - Instrument label: 500, 13px, uppercase, tracking 0.04em (inside instruments only).
  - Body: 400, 17/1.55.
- **Geist Mono** (Google): only for spec chips on figures and chart axis ticks, 12px.
- Fallback if Urbanist reads too soft in testing: General Sans (Fontshare).

### Grid, shape, depth

- 12 columns, 24px gutter, 72px side margins on desktop; 4 columns, 16px margins on phone.
- Alignment rule: the focusing-screen crosshair sits on the silhouette's glasses. Text hangs
  from the top-left margin line. Display type hangs from the bottom-left margin and may bleed.
- Shape: one rule. Instruments (from chapter 02 on) are squircles with radius = 13% of their
  short side. Pills fully round. The hero uses L-brackets and hairlines, not squircles.
- Layer order, hero: field → blurred photo → streak smear → focusing-screen grain → AF brackets
  → HUD → giant split-prism type → chrome.
- Layer order, later: field → blurred photo → streak smear → giant word → instruments → chrome.

### Motion language

| Motion | Spec |
|---|---|
| Focus hunt (signature) | Blur on the silhouette layer goes target+30% → target−10% → target over 900ms, `cubic-bezier(.2,.7,.1,1)`, when a chapter enters. |
| Settle | Instruments rise 24px and fade in, 700ms, `cubic-bezier(.16,1,.3,1)`, 80ms stagger. |
| Reading | Numbers count up 600ms; chart line draws via `stroke-dashoffset` 900ms; then the lime dot travels to the latest point and drops its dashed line. |
| Whip | Chapter change: 450ms horizontal motion-blur smear + 6vw translate (from video 1). |
| Idle | Silhouette breathes, scale 1 ↔ 1.015 over 6s. Status dot pulses every 2.4s. |
| Split prism | Horizontal offset on the name (and the glasses) eases 14px → 0 with scroll. Same clock as blur. |
| Loupe | Removed from the hero. If it returns, it is only on inner chapters, never on the first frame. |
| Reduced motion | No whip, no hunt, no breathing; focus steps change as 300ms crossfades; values render final. |

Blur is cheap: pre-render the portrait at 3 blur radii, crossfade, add CSS `filter: blur()` only
for the hunt. OGL only if the variable-blur loupe needs it.

---

## 4. Where each installed skill fits

| Skill | Role in this site |
|---|---|
| `/awwwards` | Builds the site from this file: engine (Lenis + GSAP), transitions, SEO, a11y, performance, browser QA. |
| `/jury` | Blind score after each build pass (never shown this file). Target ≥ 8 everywhere. |
| `/anatomy` | **Two figures only**, light theme, retinted to the tokens (ink edges, paper faces, signal on the single live part). (1) **TomatoBot bench**: the 6-DOF arm on its wheeled base over a row of plants; hover → the arm reaches, a camera cone shows a detection box, readout "ripe · 88%". (2) **JeevI on a terrain strip** that switches flat / rough / obstacles; readout = reward per terrain (256.27 / 191.83 / 184.05). Both sit inside a light-glass instrument like the CGM-device screen, with Geist Mono spec chips. |
| `/hairline-create` | Small single-stroke isometric line figures *inside* software instruments, one per product: a receipt printer for RestHat's dual-printer billing, a blood-bag rack with an expiry tag for RedSoil, a stack of documents for DocLipi. Lighter than Anatomy on purpose. Needs `npm i @lucasmarkes/hairline` at scaffold time. |
| `/hairline-adopt` | Turns the AG monogram (`currentWebsiteAssets/logo-ocean.svg`) into a live line figure for the contact disc (§5, section 06). |

---

## 5. Composition plan

```
00  HERO  ·  focusing screen  ·  field olive  ·  blur 40px  ·  NO glass cards
┌──────────────────────────────────────────────────────────────────────┐
│ (AG) Ashish Gupta        ( Robotics  AI  Software  Record )   ( ● Available ) │
│  AF-C                                                    12%         │
│     ┌─                                               ─┐              │
│     │          smeared silhouette (glasses split)     │              │
│     └─                                               ─┘              │
│  1/88 · f/2.56                                      ISO 2026         │
│                                                                      │
│  I teach machines to see.                                            │
│  ASHISH   <- letters cut by a horizontal rangefinder, halves offset  │
│  GUPTA                                                               │
└──────────────────────────────────────────────────────────────────────┘
   HUD numbers are real: 88 = field ripeness, 2.56 = 256 reward, 2026 = the paper.
   JeevI chart and TomatoBot 88% card MOVE to chapter 02. They do not belong here.

01  INDEX  ·  four tall gradient pills (video 1), each a blurred crop of that chapter's photo
    │1 Robotics│ │2 AI│ │3 Software│ │4 Record│   hover widens one pill, whip into the chapter

02  ROBOTICS  ·  field cream  ·  blur 28px  ·  backdrop = blurred TomatoBot v2 photo
    left: headline + 3 lines of copy · right: light-glass instrument holding the Anatomy
    TomatoBot figure with spec chips (YOLOv11 · 6-DOF · Raspberry Pi) · second screen: JeevI
    reward instrument (3 curves) + Anatomy JeevI figure · chip: "Published · IJICTDC 2026"

03  VISION & AI  ·  field olive→gold  ·  blur 18px
    DocLipi as a "metabolic score"-style dot-strip instrument (pages classified per document
    type) · Phulbari: phone held in a silhouetted hand showing the real app screenshot,
    "100 species" value, ICT Award semi-finalist chip

04  SOFTWARE IN REAL USE  ·  field ash  ·  blur 10px
    bento of four instruments in front of a blurred figure (video 2): RedSoil "30% less
    wastage", RestHat "IRD-certified billing", ArthaVidhi "VAT invoicing", WadaConnect
    "ward offices"; each with a Hairline figure; phones/laptops show real screenshots

05  RECORD  ·  dark ink ground  ·  blur 4px
    month grid 2021 → 2026 (video 1 calendar): a lime check on each month with a ship, win or
    publication; hover a check → tooltip with the fact from PROFILE.md

06  IN FOCUS  ·  field paper  ·  blur 0
    the portrait is finally sharp · SOMA-style radial selector around the AG disc:
    Email / GitHub / LinkedIn / Instagram · giant "Say hello" bleeding off · footer one line
```

Phone: one column. Instruments full-width, the silhouette crops to head and shoulders, display
type at 30vw on two lines, the loupe becomes a press-and-hold.

---

## 6. Build notes (hero pass, 2026-10-24)

Built: section 00 (hero), 01 (chapter index, as tabs the header pills select), a temporary
contact footer, the 404, and the page transition (the page you leave defocuses into ink, the next
comes back into focus). Sections 02–06 are next.

Where the build departs from the mockup, and why:
- **Headline, meta line and nav are ink, not white.** White on the light olive is about 1.7:1.
  The field darkens toward the bottom-left instead, so the white name sits on dark.
- **The TomatoBot card has no ↗.** It isn't a link until its case study exists.
- **The entrance is CSS, not JS.** Text lines, cards and the autofocus hunt (a filter animation
  on the silhouette `<img>`) start at first paint. On a throttled phone hydration lands around
  5 s, and a JS-gated intro left the hero blank until then. JS keeps the canvas (smear, scroll
  focus), the loupe, chart drawing and counters, and skips its own animations when it hydrates
  late. The lede fades from opacity 0.01: it is the phone's LCP, and Chrome ignores text first
  painted at 0 and blurred images.
- **No breathing scale on the silhouette.** It forced both glass cards to recompute their
  backdrop blur every frame. The idle motion is the lens drifting, which says "scanning" anyway.
- **The 404 is still at rest on purpose.** A quiet page with one link out.
- **JeevI curves are drawn, not logged.** Only the three converged values are data.
- **The name is no longer sheared, and the scroll button sits beside it.** The first blind
  critic (7.25 overall) read the baseline cut as a bug once you scroll, and "Gu●ta" with the
  button on the p. The frame now takes only the p's descender.
- **The footer already ends in focus.** The sharp portrait at "focus 100%" sits beside "Say
  hello." It is the concept's payoff and the seed of section 06.
- **One flood-fill treatment for every primary button** (the availability pill, the email,
  the 404's way back). Chapter pills sharpen and lean in under the pointer.
- **Chapter tabs are never hidden before reveal.** Hidden buttons can't take keyboard focus.
- **On phones the name comes right after the lede, in ink**, then the face in the lens, then
  the instruments. Both critics flagged the name landing on the second screen.
- **The header is a frame that steps aside** on the way down, returns on the way up, and turns
  to paper on a soft ink band over the dark sections.

Blind critic scores (rubric in `.claude/skills/awwwards/references/quality-bar.md`): pass 1
7.25, pass 2 7.0 (developer areas 8). Both read the idea back correctly. Remaining points are
mostly the unbuilt sections: focus visibly rising chapter by chapter, chapters 2 to 4 shown
without a click, and real case studies (problem, approach, outcome, links).

Silhouette assets: `tools/hero-assets/` (MediaPipe selfie segmentation on the 740 px portrait,
then the toned silhouette and the loupe portrait on one canvas, torso extended below the crop).
Re-run them when a better portrait arrives.

## 6b. Hero v2 (2026-10-24)

Rebuilt to match `inspo/hero-v2/reference-hero.webp`, which Ashish approved except for its sliced name type.

- **Palette is now pastel blue site-wide** (tokens only): field `#B8D4F0`, navy ink `#121A26`, paper
  `#F5F8FB`, muted `#8A94A3`, signal apricot `#FF8F4D` (live marks only: status dot, AF corners).
  Lime and olive are gone.
- **Type:** the name and big titles are Rethink Sans 800 (from his font inspiration in `inspo/fonts/`),
  solid, title case, fully on screen; everything else stays Urbanist; the viewfinder is Geist Mono.
- **Portrait:** `currentWebsiteAssets/ashish-hero-v2b.png` (ChatGPT, 1024×1536, waist-up with both
  arms in frame; prompt in `docs/HERO_ASSET_PROMPT.md`) → `tools/hero-assets/build_hero_v2.py`:
  colour-key matte off the flat backdrop, backdrop unmixed out of hair edges. Nothing is painted in:
  the first generation's cut shoulders were extended in code, and Ashish rejected that as fake.
- **Blur is a slow shutter now:** 9 copies across a sideways shake (2.4 px per px of blur) under a
  lighter gaussian, matching the reference's horizontal smear. Scroll still takes 16 px away.
- **The loupe became the AF box.** It rests on the face with a crosshair and the lens rings, hunts in,
  locks (corners turn apricot), and under a mouse follows the pointer showing the face sharp inside it.
- **Viewfinder:** AF-C, live focus %, 1/88 · f/2.56, ISO 2026 in four corner brackets, standing on the
  same margin line as the logo (its viewBox is cropped to the stroke), the type and the availability pill.
- **Lede:** "I teach and make machines." (his wording). The subject sits 4svh lower than the first pass,
  clear of the nav; the AF box rests brow-to-mouth, and on 16:10 or squarer screens the face slides
  right just enough that the box never lands on the end of the lede (`--face-x` in globals.css).
- **Contrast:** the field deepens toward the lower left so the white lede and name hold ≥ 3:1 (name ≥ 4.1).
- **Header:** pills are Robotics · AI · Software · Design (4px inside the bar on every side, so the
  hover marker's round ends are concentric with it). Record left the tabs for its own section 05; its
  data is kept as `record` in `src/data/site.ts`. The "Available for projects" pill is gone (Ashish found
  the claim a little controversial); the one solid button is "Say hello" in deep blue `#2E528A`
  (`--c-deep`), as tall as the pill bar, scrolling to the contact footer (`#contact`).
- **Design chapter** is built from PROFILE facts (Jiffy redesign, the AG mark, his photography, tools)
  until Ashish sends the design works he wants there; its pill image is cropped from `jiffyApp.png`.
- **The glass instruments left the hero** (as §2 always said). `Readings.tsx` and its styles are kept
  for chapter 02.

## 6c. Robotics chapter: plan and Fig 1 (2026-10-24)

The plan for chapter 01 and the ChatGPT prompts for its mockup are in `docs/ROBOTICS_PROMPT.md`:
Robotics follows the hero directly (the dark chapter-tabs index retires once the four chapters exist),
on a mist field, and every robot is an Anatomy figure that takes the visitor's pointer as its sensor input.

**Fig 1, TomatoBot bench, is built** (Anatomy Hero size, light theme retinted to the site tokens):
- Source: `src/figures/tomatobot/` (`model.mjs` sizes, IK and tomatoes; `arm.mjs` the arm, treads and hubs
  rebuilt per frame; `live.mjs` the drive → focus → pick → cup sequence; `figure.css` the retint).
  The kit is copied to `src/figures/kit/` (without `iso-kit.ts`, so the app type-checks the `.mjs`).
- Build: `node tools/figures/tomatobot.mjs [--audit]` writes `public/figures/tomatobot.svg` (standalone,
  about 110 KB gzipped, fetched by the card when it nears the viewport so it is not in the HTML twice),
  `src/figures/tomatobot/data.json` and the preview `tools/figures/out/tomatobot.html`.
- Site component: `src/components/figures/TomatoBotFigure.tsx` on the shared `FigureCard.tsx`
  (+ `figure-card.css`, a working card until the mockup sets its look). Both figures are shown on
  `/lab/robotics` (noindex, not in the sitemap); delete that route once they sit in the Robotics section.
- Behaviour: the robot drives along the row, the apricot AF corners hunt and lock on a tomato (the hero's
  AF box, reused), ripe ones are picked and dropped in the cup, unripe ones are left; the tour loops and the
  plants grow new fruit. Pointer hover or tap picks a tomato, arrow keys and Enter do the same. Reduced
  motion: no tour, final poses. Ripe fruit is the only colour, in the signal apricot.
- Verified: `--audit` passes (clearance, terminals, supports, depth order, crowding; two crowding pairs
  excused after an 8x look), `scripts/lines.mjs` reports 0 floating line ends at rest, reaching, carrying
  and home, 60 fps in headless Chrome on the Next route (about 4 ms of figure script a frame).
- Facts on screen: 6-DOF arm, webcam, Raspberry Pi, ripeness detection (PROFILE §3). The readout shows
  only the model's own state (driving distance in cm, ripe or not, how many in the cup).
- Not yet: the rainbow ribbon cable up the arm.

**Fig 2, JeevI on three terrains, is built** (2026-10-25, Hero size), to the robot's real proportions
from its repo (PROFILE §9: joint origins from the URDF, part sizes from the print files, the sim's
default stance, the diagonal trot from its test harness):
- The object is a treadmill test bench: its belt carries the three terrains the policy trained on, at
  the report's sizes (flat; a heightfield in 0.1 m cells, 10–40 mm, inside the documented 1–6 cm;
  45 cm boxes 5–20 mm high). The treadmill is the figure's way of showing them: the training ran in
  Isaac Lab, and the card's label and the section copy say so.
- Behaviour: JeevI trots (diagonal pairs), stance feet ride the belt, swing feet step onto whatever is
  ahead, the body rides the stance feet's height. The pointer sets the belt speed inside the trained
  0.2–0.4 m/s (the dial shows it); the console's three buttons, or keys 1–3, run the belt on to a
  terrain ("rough in 1.6 m"). The readout gives the converged reward of the terrain under the robot.
  Reduced motion: the belt stops, the robot stands, the buttons put the chosen terrain under it.
- Source: `src/figures/jeevi/` (`model.mjs`, `parts.mjs`, `live.mjs`, `figure.css`); build
  `node tools/figures/jeevi.mjs [--audit]` → `public/figures/jeevi.svg` (38 KB gzipped) and `data.json`.
  Site component `src/components/figures/JeevIFigure.tsx`.
- Painting: each leg is four groups (coxa bottom under the body; the rest of the leg; the hub and coxa
  top over the body; shank and sock), ordered by one function in `parts.mjs` that the page and the
  audit share. Leg parts are fixed path slots whose `d` is rewritten each frame; whole terrain blocks
  are drawn once and slid, and a block standing in front of a foot is painted again over it.
- Verified: `--audit` passes at rest; 0 floating line ends at rest, mid-trot, on rough, on boxes and
  under reduced motion; about 58 fps alone in headless Chrome (8 ms of script a frame).
**Figs 3 to 5, the three small rovers, are built** (2026-10-25, Hero size, 640 × 500), each from its
photo (`inspo/robotics/attach-6…8`) and PROFILE §3, on one shared builder:
- Shared: `tools/figures/rover-lib.mjs` (recorder, bench, Uno + L293D shield, two-cell holder, TT and N20
  gear motors, wheels, wires, `writeFigure`, `finish`); `src/figures/rovers/wheels.mjs` (TT tyre treads,
  mecanum rollers in left and right hands, hubs; turned live); `live.mjs` (all three mounts);
  `figure.css` (the retint, slate for black parts, a warm paper for the yellow plastic, apricot only for
  what the robot senses). Each build writes `public/figures/<name>.svg`, `src/figures/rovers/<name>.json`
  and a preview in `tools/figures/out/`.
- **Fig 3, face tracker** (`facetracker.mjs`): traffic-sign mode. A round sign rides a rail under the
  pointer; the rover strafes sideways on its mecanum wheels, with a lag, to keep it centred in front of
  the MU sensor (seen from behind, as you look over the rover). Apricot: the sight line and the focus
  box closing on the sign. Readout: "sign · 24 mm right · strafing", "sign · centred", "end of travel".
- **Fig 4, obstacle car** (`obstacle.mjs`): the car stands on a block, wheels free, facing a wall on a
  rail. It drives while the way ahead is clear; closer than 120 mm it stops, the SG90 turns the HC-SR04
  50° left and right, and it turns on the spot to the side with more room. The sensor head is rebuilt
  each frame; ranges come from rays in the sensor's 12° cone. Apricot: the sonar cone, ending in an
  arc where it hears an echo. Readout: "left clear · ahead 68 mm · right 97 mm → left".
- **Fig 5, rescue vehicle** (`rescue.mjs`): a cabin with a sloped front, window and camera on eight
  small wheels (four pods), a fire nozzle on the roof, a drone docked on a pad, a folding arm behind.
  Hover, tap or Enter: the props spin up, the drone lifts off and drifts forward, the arm unfolds; leave
  and both come back. Apricot: the pad's ring and the flight path while the drone is away. Monochrome,
  no camouflage. Readout: "drone · 84 mm up · arm out", "drone docked · arm folded".
- Verified: each `--audit` passes; 0 floating line ends; no console errors in the previews or in the ring.
- Site components: `FaceTrackerFigure`, `ObstacleCarFigure`, `RescueFigure` in `src/components/figures/`.

## 6d. Robotics section: the focus ring (2026-10-25)

Built from Ashish's ChatGPT mockup (his carousel idea, prompts in `docs/ROBOTICS_MOCKUP_PROMPT.md`), made
more minimal: the mockup's "5 robots built · 3 research projects · ∞ more to build" row and its extra
paragraph and tag line are gone (invented, and two of them untrue). The top right shows only the robot
in front: index, name, one line from `robots` in `src/data/site.ts`, its specs and an Open button.

- `src/components/Robotics.tsx` + `robotics.css`, placed straight after the hero in `page.tsx`. A band
  clears the hero's floor blue into mist; then a pinned stage holds while the wheel turns (one robot per
  70% of a screen, with a pause on each: `turnOf`).
- The wheel: five cards on a wide circle centred below the stage, so the ring fans like the mockup; the
  front card is sharp with the hero's apricot AF corners, the rest scale down, tilt and blur with their
  distance. A rim with one dot per robot runs under their feet.
- Click (or Enter) on any card: the ring turns to it, then the card flies forward (a FLIP from the card to
  the open frame) and that robot's live figure (Figs 1 to 5) takes over. × , "Back to the robots", Escape, or
  scrolling away closes it and the card flies back. Arrow keys turn the ring.
- Phones and reduced motion: no pinning, a row of cards you swipe, each with its line; tapping opens a full
  sheet.
- Card images: `public/robots/*.webp`, 1280 × 1000 stills of the five figures, each caught mid-action.
- The old dark chapter tabs keep AI, Software and Design for now (Robotics left them; titled "And the rest
  of the work."). The header turns paper only over `[data-dark]` sections now, so it stays ink over the
  light ring. The header's Robotics pill lands where the wheel pins.

## 7. Open questions for Ashish

1. Hero line: "I build robots that see, and software people use." Alternatives: "Robots that
   see. Software people use." or the line from the current site.
2. AAVISHKAR: 2023 or 2024?
3. An uncropped, higher-resolution B/W portrait (the current one is a 740px circle crop) for
   the full-bleed silhouette and the final sharp frame.
4. Any real training logs or CSVs for JeevI so the curves are drawn from real points instead of
   only their converged values.
