# Robotics section: ChatGPT mockup prompts (v2, premium)

> Written 2026-10-25. Supersedes the prompts in `docs/ROBOTICS_PROMPT.md` (its thinking still holds).
> Goal: see the whole Robotics section before building it. Light and bright (no dark navy section),
> more motion, premium type. The hero stays exactly as it is.

## Attach, in this order

1. `inspo/robotics/attach-1-hero.png` (the hero as it is now: palette, fonts, chrome)
2. `inspo/robotics/attach-2-tomatobot-figure.png` (the built TomatoBot figure; placed as it is)
3. `inspo/robotics/attach-5-jeevi-figure.png` (the built JeevI figure; placed as it is)
4. `inspo/robotics/attach-3-tomatobot-photo.jpg` (the real TomatoBot, for the photo tile)

Do not attach the current dark "four chapters" section: that's what this replaces.

## How to run it

1. Paste **Prompt A**. Generate 2–3 variants and keep the best. Ask for fixes in plain words
   ("lighter background", "bigger title", "align the title to the logo") rather than starting over.
2. Then paste **Prompt B** with the Prompt A image you kept attached as well. It shows the motion as a
   storyboard.
3. Optional: **Prompt C** for the phone layout.
   Or try the other direction, the **focus ring** carousel: **Prompt D** (one frame), then **Prompt E**
   (its motion as a storyboard). Section "The focus ring" below.
4. Save keepers to `inspo/robotics/` as `v2-a.png`, `v2-b.png`, `v2-c.png`.

If ChatGPT redraws the robot figures, tell it: "Use attached image 2 (and 3) exactly as they are,
only scaled." Misspelled small text is fine; the site copy comes from `src/data/site.ts`.

---

## Prompt A: the first screen of Robotics

```
I'm designing my personal website. Attached image 1 is the finished hero, and I love it. Design the NEXT section, "Robotics": the screen you land on after one scroll. It must feel like the same site (same palette, same fonts, same calm camera-viewfinder language) but brighter, more premium and more alive. Desktop 16:9 (1920×1080), a flat website mockup: no browser window, no device, no perspective.

THE IDEA
The hero is a camera that can't focus on me yet. Scroll once and the camera turns to the machines I built, and they are the first thing on the page in perfect focus. Everything here is crisp, bright and engineered, like a premium product page for a precision instrument.

BACKGROUND (light, never dark)
- The hero's sky blue #B8D4F0 comes in from the top edge and melts into bright mist #EAF1F8, then paper #F5F8FB at the bottom. No dark navy blocks anywhere.
- A very faint isometric floor grid in sky-blue hairlines (#C9DAEC) fades in toward the bottom, at the same angle as the drawings, so the robots feel placed in a real space.
- Soft daylight: one gentle pale-blue glow behind the main card.

TYPE (the hero's fonts)
- Titles: Rethink Sans ExtraBold, solid, tight tracking, title case. Never sliced, outlined or glitched.
- Lines and big numbers: Urbanist Light.
- Labels and readouts: Geist Mono, 12–13px.
- Body: Urbanist Regular, 17px.

COLOUR RULES
Navy #121A26 for type. Deep sky #1E578F for mono readouts. Muted #8A94A3 for secondary text. Apricot #FF8F4D only for tiny live marks: four AF focus corners, one status dot, the ripe tomatoes inside the drawing. Nothing else is orange.

CHROME (exactly as image 1)
Top-left the wordmark "Ashish Gupta" in navy. Top-centre the frosted pill nav "Robotics · AI · Software · Design" with Robotics active (a soft white pill behind it). The left margin is 72px and EVERYTHING hangs from it: wordmark, title, copy, chips.

LAYOUT
Top band, full width:
- a huge "Robotics" (about 220px) hanging from the left margin in navy, with a small mono "01 / 04" just above its top-right corner
- to its right, sitting on the same baseline, a thin Urbanist Light line: "Machines that move on their own."
- at the far right, a slim vertical index in Geist Mono, each row with a hairline under it: 01 TomatoBot v2 · 02 JeevI · 03 Face tracker · 04 Obstacle car · 05 Rescue vehicle. Row 01 is active (navy, with one apricot dot); the others are muted.

Main band:
- Right 7 columns: ONE large paper card (#F5F8FB, 28px corners, a hairline navy edge at 10% opacity, a long soft blue-grey shadow, lifted off the page). Inside it, place attached image 2 AS IT IS. It is the finished TomatoBot figure: do not redraw, restyle or recolour it, only scale it to fill the card.
- Left 5 columns, under the title:
  - "TomatoBot v2" in Rethink Sans Bold, 34px
  - body: "Rolls a 6-DOF arm down a row of plants. YOLOv11 finds the ripe tomatoes and the arm picks them."
  - a big Urbanist Light "88%" (about 120px) with the mono label "ripeness detection, in the field"
  - one rounded chip: "Published · IJICTDC 2026"
  - three small mono spec chips: YOLOv11 · 6-DOF arm · Raspberry Pi
  - a small rounded photo tile (about 220×150) showing the real robot from attached image 4, sharp, with a thin vertical divider handle in its middle and the mono caption "drawing ↔ photo", as if you can drag between the drawing and the real photo

MOTION CUES (it's a still, but show that it moves)
- the hero's four apricot AF corners sit around TomatoBot's webcam inside the card, as if focus has just locked
- a faint upward motion trail under the title's letters, as if they just slid into place
- the card's shadow is slightly deeper on one side, as if it just lifted
- a thin progress rail along the bottom: five ticks, the first filled navy, labelled 01–05 in mono

AVOID
Dark backgrounds, glass panels everywhere, neon or purple, gradient blobs, generic SaaS feature cards, 3D-render plastic robots, stock photos, emoji, a sidebar, any "available for hire" badge, extra logos, watermarks, lorem ipsum.

Quality bar: an Awwwards Site of the Day still. Generous white space, precise alignment, crisp type.
```

## Prompt B: the scroll storyboard (attach the Prompt A image too)

```
Same website and section as the attached mockup: use it as the exact style reference. Make ONE 16:9 storyboard sheet that shows how the Robotics section moves as you scroll: four numbered frames in a 2×2 grid on a paper (#F5F8FB) background. Each frame is a small desktop viewport with a one-line Geist Mono caption under it. Keep the light palette, fonts, chrome and the two robot figures exactly as given; never redraw the figures.

Frame 1, "hero → robotics: focus hands off". The bottom of the hero (blurred portrait, big white name "Ashish Gupta") slides up and away. The hero's apricot AF box shrinks and travels down toward the TomatoBot card in the Robotics section. The sky blue fades to mist.

Frame 2, "TomatoBot, pinned". The section is pinned in place. The TomatoBot card (attached image 2, as it is) is large; "88%" is mid count-up; the drawing ↔ photo tile is half dragged, showing the real robot photo (attached image 4) on one side and the drawing on the other. Progress rail at 01 / 05.

Frame 3, "JeevI slides in". The cards move sideways like a camera dolly along a lab bench: TomatoBot exits left, the JeevI card (attached image 3, as it is) enters from the right, slightly motion-blurred at its leading edge. Copy on the right in the same styles: "JeevI" title, the line "Then one learned to walk.", and three stacked readings as a segmented switch, 256.27 flat · 191.83 rough · 184.05 boxes, the first one selected. Progress rail at 02 / 05.

Frame 4, "the earlier machines". A horizontal row of three smaller paper cards with light empty drawing areas and mono captions: Face tracker · Obstacle car · Rescue vehicle. The middle card is lifted and in focus (AF corners on it); the outer two are a touch softer. Progress rail at 03–05.

Under the grid, one line of Geist Mono notes: "eased 700 ms rises · pinned sideways scroll · AF corners lock on each robot · numbers count up · light all the way, no dark section".
```

## The focus ring (Ashish's carousel idea, 2026-10-25)

All five robots stand on a ring, like cards on a turntable seen by a camera. Scrolling turns the ring
one robot at a time; the robot that reaches the front comes into sharp focus and grows, while the
others recede round the ring, smaller and softly out of focus. That is real depth of field, so it is
the hero's "In Focus" idea carried on. Click (or tap, or Enter) any robot and its card flies forward
and opens into the full view: the live Anatomy figure, its story and its numbers. Close it and the
card flies back into the ring.

How it should behave when built:
- **Turning snaps.** Each robot holds the front for a beat of scroll (about 70% of a screen), so a fast
  wheel never spins past three robots at once. The section is pinned only while the ring turns (five
  steps), then the page scrolls on.
- **Nothing is trapped.** Arrow keys turn the ring, Enter opens, Escape closes. Under reduced motion
  the ring is a plain row of five cards and opening is a cross-fade.
- **Phones swipe.** On a phone the ring becomes a sideways swipe with the front card full width, and
  the page isn't pinned.
- **Light to run.** The ring shows a still of each figure (an image); only the opened robot runs its
  live figure, so five animated figures never run at once.
- **Figs 3 to 5 come first.** The ring needs all five figures; until the face tracker, obstacle car and
  rescue vehicle are drawn, Prompt D has ChatGPT sketch them in the same style from their photos.
  (Done 2026-10-25: all five are built and live in the ring, DESIGN.md §6c.)

Attach for D and E: `attach-1-hero.png`, `attach-2-tomatobot-figure.png`, `attach-5-jeevi-figure.png`,
`attach-6-face-tracker-photo.jpg`, `attach-7-obstacle-car-photo.jpg`, `attach-8-rescue-vehicle-photo.jpg`
(and for E, the Prompt D image you kept).

### Prompt D: the ring, one frame

```
Attached image 1 is the finished hero of my personal website, and I love it. Design the NEXT section, "Robotics", as a "focus ring": a carousel of my five robots seen through the same calm camera. Desktop 16:9 (1920×1080), a flat website mockup: no browser window, no device.

THE IDEA
A camera looking at a ring of five robots on a turntable. The ring turns as you scroll. The robot that reaches the front comes into sharp focus and grows; the others recede round the ring, smaller and softly out of focus, like real lens depth of field. Clicking any robot makes it fly forward and open.

THE RING (right two-thirds of the screen)
- Five paper cards (#F5F8FB, 24px corners, a hairline navy edge at 10%, a soft blue-grey shadow) standing on an invisible tilted ellipse, seen slightly from above, like cards on a turntable. Each card holds one isometric robot drawing.
- The FRONT card is large, sharp and nearest, slightly right of centre. It holds attached image 2 AS IT IS (the TomatoBot figure: do not redraw it). Four small apricot AF focus corners frame it, as if focus has just locked.
- Behind it to the right, smaller and softly blurred: the JeevI card, attached image 3 AS IT IS.
- The other three cards further round the back, smaller still and more blurred: Face tracker, Obstacle car, Rescue vehicle. Draw these three robots in the SAME isometric technical style as images 2 and 3 (paper faces, thin navy outlines, soft cool-grey shading, many small precise parts, screws as dots, no photo), each based on its real robot in attached photos 4, 5 and 6. Face tracker: yellow mecanum wheels with black rollers (the only colour besides apricot), an Arduino and a small vision sensor at the front. Obstacle car: black tyres on yellow hubs, an ultrasonic sensor on a servo. Rescue vehicle: six wheels, a box cabin with a window, a small drone on its roof, a folded arm. No weapons, no camouflage.
- Under the ring, its rim as one thin elliptical sky-blue hairline with five tick marks; the front tick is navy.
- A small Geist Mono caption under each card: 01 TomatoBot v2 · 02 JeevI · 03 Face tracker · 04 Obstacle car · 05 Rescue vehicle.

LEFT COLUMN (on the 72px margin, navy type)
- a huge "Robotics" in Rethink Sans ExtraBold (about 200px), with a small mono "01 / 04" above its top-right corner
- "Machines that move on their own." in Urbanist Light, 36px
- the FRONT robot's details: "TomatoBot v2" in Rethink Sans Bold 32px; one line, "Finds the ripe tomatoes with YOLOv11 and picks them with a 6-DOF arm."; a big Urbanist Light "88%" with the mono label "ripeness detection, in the field"; one rounded chip "Published · IJICTDC 2026"
- a small mono hint at the bottom: "scroll to turn · click a robot to open"

BACKGROUND: light, never dark. The hero's sky blue #B8D4F0 comes in from the top edge and melts into mist #EAF1F8 and paper #F5F8FB. A very faint pale-blue glow under the front card, as if lit from above.
TYPE: Rethink Sans ExtraBold for titles, Urbanist Light for lines and numbers, Geist Mono for labels.
COLOUR: navy #121A26 for type, deep sky #1E578F for readouts, muted #8A94A3, apricot #FF8F4D only for the AF corners, one status dot and the ripe tomatoes.
CHROME, exactly as image 1: wordmark "Ashish Gupta" top-left, pill nav "Robotics · AI · Software · Design" top-centre with Robotics active.
MOTION CUES: a faint curved motion trail along the rim behind the cards, showing the turn; the front card's shadow a touch deeper, as if it just arrived.

AVOID: dark sections, glass panels, neon or purple, gradient blobs, 3D-render plastic robots, photos inside the ring, emoji, sidebars, availability badges, extra logos, watermarks.
Quality bar: an Awwwards Site of the Day still: generous space, precise alignment, crisp type.
```

### Prompt E: the ring in motion, a storyboard

```
Same website and section as the attached ring mockup: use it as the exact style reference, and keep every robot drawing exactly as it appears there. Make ONE 16:9 storyboard sheet of six numbered frames (3 across, 2 down) on a paper (#F5F8FB) background. Each frame is a small desktop viewport with a one-line Geist Mono caption under it.

1 "arrive": the hero (blurred portrait, big white name) slides up; the five robot cards rise from below into their places on the ring, the front one last; the hero's apricot AF box drops onto the front card.
2 "scroll turns the ring": the ring has turned one step; JeevI is coming to the front, half sharp; TomatoBot is moving back and softening; the left column's details are cross-fading from TomatoBot to JeevI (JeevI · "Then one learned to walk." · "256.27" reward on flat).
3 "next robot in focus": the Face tracker card is at the front, sharp, AF corners locked; tick 03 on the rim is navy.
4 "click": a cursor clicks the Obstacle car card at the back of the ring; that card lifts and starts to fly forward and grow, the others dimming slightly.
5 "open": the Obstacle car card now fills the right two-thirds as a large card; the left column shows its details ("Obstacle car" · "Looks left and right, then takes the clearer side." · "Arduino · ultrasonic sensor on a servo"); a small round "close ×" button top-right of the card; the ring waits faintly behind.
6 "back": the card shrinks back into its place on the ring; the page then scrolls on toward the next chapter, "AI", whose title starts to appear at the bottom.

Under the grid, one line of Geist Mono notes: "one robot per scroll step · snaps · arrows turn, Enter opens, Esc closes · phones swipe · light all the way".
```

## Prompt C: phone (optional)

```
Same website and section as the attached mockups. Show the Robotics section on a phone: three phone screens side by side (390×844 each) on a paper background, flat UI, no hands, no device frame beyond a thin rounded outline.
Screen 1: the wordmark and a compact pill nav at the top; "Robotics" huge in Rethink Sans ExtraBold across the width; "Machines that move on their own." under it; the index 01–05 as a horizontal mono strip.
Screen 2: the TomatoBot card (attached image 2, as it is) full width; under it "TomatoBot v2", the 88% stat, the IJICTDC chip and the drawing ↔ photo tile.
Screen 3: the JeevI card (attached image 3, as it is) full width, with the three readings as a horizontal segmented switch under it.
Same light palette, 16px side margins, everything aligned to them.
```
