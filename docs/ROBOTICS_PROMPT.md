# 01 Robotics: how we're thinking, and the ChatGPT prompts

> Written 2026-10-24. **Fig 1 (TomatoBot) and Fig 2 (JeevI) are built**: `/lab/robotics` on the dev
> server, or `tools/figures/out/{tomatobot,jeevi}.html` (DESIGN.md §6c). The hero is final and is not touched. Robotics comes straight after it: no
> chapter index in between (the dark "The work, in four chapters." tabs retire once the four
> chapters exist; the header pills scroll to the real sections). Order: Robotics → AI → Software →
> Design. Facts come from `docs/PROFILE.md` only.

## The thinking

**Story beat.** The hero is a camera that cannot find him yet ("I teach and make machines.",
focus 12%). One scroll and the camera turns to what he made. This chapter is a bench in daylight:
each robot is drawn as a precise Anatomy figure, and **each one senses you**. Its real sensor
takes the visitor's pointer as input. That ties the chapter back to the hero: a person who teaches
machines to see shows machines that see you.

| Robot | Real sensor | What the pointer does (the figure's live behaviour) |
|---|---|---|
| TomatoBot v2 | webcam + YOLOv11 | Point at a tomato: a detection box locks on it, the 6-DOF arm reaches it (IK), picks it and drops it in the cup. Ripe ones only. |
| JeevI | joint encoders, trained policy | Pick a terrain (flat / rough / obstacles): the strip changes under it, the trot changes, the reward reads 256.27 / 191.83 / 184.05. |
| Face & human tracker | MU vision sensor | It turns on its mecanum wheels to face your cursor; toggle person / traffic-sign mode. |
| Obstacle-avoiding car | HC-SR04 on an SG90 servo | The sensor sweeps left / centre / right; your cursor is the obstacle; the readout gives the distance and the side it chooses. |
| Rescue vehicle | camera | Hover: the drone lifts off the deck and hovers, the arm unfolds, the nozzle sprays. |

**Look.** The light colours stay. The field lifts from the hero's sky `#B8D4F0` to mist
`#EAF1F8`, then paper, so the chapter feels like stepping from the viewfinder into a bright room.
Type is navy ink `#121A26`. Figures are Anatomy's light theme retinted to the site: paper faces,
navy edges, cool blue-grey shading. Apricot `#FF8F4D` stays for live marks only: the AF corners
that lock on each robot's sensor, and the ripe fruit (ripeness *is* colour, so the tomatoes may
carry it; unripe fruit stays paper).

**Continuity devices from the hero, used lightly.**
- The apricot AF corners lock on each robot's sensor as its card scrolls in (the same 900 ms hunt as
  the hero). This replaces any eyebrow label.
- The focus readout rises chapter by chapter; Robotics reads `focus 38%` in mono at the top right,
  on the same margin line as the hero's `12%`.
- Everything hangs from the logo's margin line (72 px on desktop): title, copy, chips, card edges.

**Composition, desktop (about four screens).**

```
R0  Opener + TomatoBot (one screen)
    left 5 cols: "Robotics" (Rethink Sans 800, ink) · "Machines that move on their own."
                 TomatoBot v2 · 2 lines · big 88% "ripeness detection, in the field"
                 chip "Published · IJICTDC 2026" · spec chips YOLOv11 · 6-DOF arm · Raspberry Pi
                 small real photo tile (tomato-bot-v2.jpg) "the real one"
    right 7 cols: paper card, Fig 1 TomatoBot bench, hint "point at a tomato", readout "ripe · 88%"

R1  JeevI (one screen, mirrored: card left, copy right)
    "Then one learned to walk." · 12 joints, PPO in NVIDIA Isaac Lab
    three numbers as a terrain switch: 256.27 flat · 191.83 rough · 184.05 obstacles
    card: Fig 2 JeevI on three terrains, readout "reward 256.27 · flat"

R2  Earlier machines (one screen): three equal cards in a row
    Fig 3 Face tracker · Fig 4 Obstacle car · Fig 5 Rescue vehicle
    one line each, one live readout each, the real photo on hover/tap

R3  Hand-off: the field starts to shift toward the AI chapter's colour.
```

Phone: one column. Copy, then the card full width, then the photo tile. The earlier machines become
a horizontal swipe row. Hints say "tap" instead of "point".

**Motion.** Calm, as Anatomy specifies: exponential follow and springs, an idle tour when nobody
touches a figure (TomatoBot picks the ripe fruit one by one; JeevI trots; the car sweeps), still
offscreen, still under reduced motion (final pose, readouts final).

**Build plan for the figures (Anatomy, light theme).**

| Figure | Size | Estimate | Notes |
|---|---|---|---|
| TomatoBot v2 bench ✅ built | Hero, 228 drawn items | 3 to 4 h | Black plywood deck on four treaded wheels with white hubs, power bank, motor driver with heatsink, 2 × 18650 holder, webcam, the green "TomatoBot v2" cup, 6-DOF arm of black U-brackets and servo horns (the ribbon cable up the arm is not drawn yet); three tomato plants on a soil bed with stakes. |
| JeevI on three terrains ✅ built | Hero, 140 drawn items | 3 to 4 h | Drawn to the repo's URDF and print files: 12 servos, coxa/femur/tibia brackets, TPU socks; trots on a treadmill whose belt carries the three training terrains. |
| Face tracker | Figure, about 60 parts | about 1 h | Four yellow mecanum wheels with black rollers, Arduino + L293D shield, MU sensor on a bracket, 2 × 18650. |
| Obstacle car | Figure, about 55 parts | about 1 h | Four TT motors, black tyres on yellow hubs, Arduino + shield, HC-SR04 on an SG90. |
| Rescue vehicle | Figure, about 70 parts | about 1 h | Six wheels, box cabin with a window, deck drone, blue nozzle, rear arm. No weapons, no camo. |

Then the section itself in Next.js, laid out from the ChatGPT still: about 2 to 3 hours.

---

## ChatGPT prompts

> **Superseded 2026-10-25** by `docs/ROBOTICS_MOCKUP_PROMPT.md` (brighter, more motion, a storyboard).
> Kept for reference.

Generate at **16:9 landscape (1536 × 1024 or 1920 × 1080)**. It is a layout reference for Claude
Code, not a picture that goes on the site; the figures get rebuilt as live SVG and the photos are
the real ones. If ChatGPT misspells a word, that's fine.

**Attach, in this order:**
1. `inspo/robotics/attach-1-hero.png` — the finished hero (palette, type, chrome).
2. `inspo/robotics/attach-2-tomatobot-figure.png` — the real Fig 1, already built: place it, don't redraw it.
3. `inspo/robotics/attach-3-tomatobot-photo.jpg` — the real TomatoBot v2, for the small photo tile.

(`attach-4-anatomy-style.png` is the Anatomy style reference, for Prompts 2 and 3 until those figures exist.)

### Prompt 1 (the main one): Robotics opener + TomatoBot

```
Attached image 1 is the finished hero of my personal website. Design the NEXT section, the one
you see after scrolling once. Match image 1 exactly in palette, type, chrome and calm. Desktop,
16:9, one viewport, flat UI mockup (no laptop, no browser window, no perspective).

PALETTE (pastel blue daylight, light and airy):
- the field is mist #EAF1F8, with a faint wash of the hero's sky blue #B8D4F0 along the very top edge
- cards and drawing faces: paper #F5F8FB
- all type and the drawing's outlines: navy ink #121A26 (never pure black)
- small mono readouts: deep sky blue #1E578F; secondary text: muted #8A94A3
- apricot #FF8F4D ONLY for live marks: four small AF focus corners, the ripe tomatoes, one status
  dot. Never a fill, a button or a heading.

TOP CHROME (same as image 1): top-left the wordmark "Ashish Gupta" in navy; top-centre a frosted
pill nav "Robotics · AI · Software · Design" with Robotics active (a soft white pill behind it).
Nothing at top-right except a tiny Geist Mono readout "focus 38%" in deep sky blue, below the
chrome, where the hero shows "12%".

ALIGNMENT: one left margin line (72px) for the wordmark, the title, the copy and the chips. The
card's top edge lines up with the top of the title.

LEFT 5 COLUMNS (navy ink type):
- huge title "Robotics" in a solid extra-bold grotesk like Rethink Sans ExtraBold, tight tracking,
  title case, about 150px. Never sliced, glitched or cropped.
- under it, thin Urbanist Light ~36px: "Machines that move on their own."
- a gap, then the first machine:
  - "TomatoBot v2" in Rethink Sans Bold ~30px
  - two lines of body, Urbanist 17px: "Rolls a 6-DOF arm down a row of plants. YOLOv11 finds the
    ripe tomatoes and the arm picks them."
  - a big thin numeral "88%" (Urbanist Light, ~110px) with a small label "ripeness detection, in the field"
  - one rounded chip: "Published · IJICTDC 2026"
  - a row of three small Geist Mono spec chips: YOLOv11 · 6-DOF arm · Raspberry Pi
  - a small rounded-square photo tile (about 170px) of the real robot from attached image 3, sharp,
    with a tiny mono caption "the real one"

RIGHT 7 COLUMNS: ONE large paper card (rounded corners about 28px, hairline navy edge at 12%,
soft shadow), filling most of the height. Inside it, place attached image 2 AS IT IS: it is the
finished isometric figure of the robot on its bench, with its own mono corners ("Fig 1",
"TomatoBot bench", "point at a tomato", "ripe · picking it"). Do not redraw, restyle or recolour
it; only scale it to fill the card. The card is the frame the figure sits in.

EMPTY SPACE matters. No second card, no charts, no glass widgets, no people, no blurred portrait,
no giant background word, no extra logos, no "Available" pill, no sidebar, no emoji.
Quality: an award-winning site still, quiet and precise, like a page from a beautiful
engineering catalogue. Photoreal type rendering, crisp line drawing.
```

### Prompt 2: JeevI (second screen of the chapter)

Attach `attach-1-hero.png`, your generated Prompt 1 image (so it keeps the same card and type) and
`inspo/robotics/attach-5-jeevi-figure.png`, the built Fig 2: place it as it is, don't redraw it.

```
Same website, same chapter, the next screen down. Match the attached Prompt 1 image exactly:
same mist field, navy type, paper card, drawing style, mono card chrome, header (Robotics active),
"focus 38%" readout. Desktop 16:9, flat UI mockup.

Mirror the layout: the paper card on the LEFT 7 columns, copy on the RIGHT 5 columns, the copy's
left edge on a column line.

RIGHT, navy type:
- "JeevI" in Rethink Sans ExtraBold ~110px
- Urbanist Light ~32px: "Then one learned to walk."
- body: "A 3D-printable quadruped with 12 joints. Its gait was trained with PPO in NVIDIA Isaac
  Lab, and converged on three terrains."
- three stacked rows, a segmented switch, the first row selected (a soft paper pill behind it,
  one apricot dot):  256.27  flat   ·   191.83  rough   ·   184.05  obstacles
  (numbers in Urbanist Light ~56px, labels small)

LEFT CARD: place the attached JeevI figure AS IT IS (a printed four-legged robot trotting on a
treadmill whose belt carries flat, rough and box terrain, with its own mono corners "Fig 2",
"JeevI on three terrains", "move to set the speed · press a terrain", "rough · reward 191.83").
Do not redraw, restyle or recolour it; only scale it to fill the card.

No Boston Dynamics look, no dog fur, no glass widgets, no charts outside the card.
```

### Prompt 3: the earlier machines (third screen)

Attach 1, 2, your Prompt 1 image, and the three photos: `currentWebsiteAssets/face-bot-robot.jpg`,
`currentWebsiteAssets/obstacle-bot-robot.jpg`, `currentWebsiteAssets/rescue-bot-robot.jpg`.

```
Same website, same chapter, the screen after JeevI. Match the attached Prompt 1 image exactly.
Desktop 16:9, flat UI mockup.

Top-left, on the margin line: "Before that, smaller machines." in Urbanist Light ~44px, navy.

Below it, THREE equal paper cards in a row (same corners, edge and shadow as Prompt 1), each
with a smaller isometric drawing in the same style, drawn from the attached photos:
1. "Fig 3 · Face tracker": a small rover on four yellow mecanum wheels with black rollers (the
   only colour besides apricot), a blue Arduino with a motor shield, two cells, and a small
   vision-sensor board on a bracket at the front. Apricot AF corners on the sensor.
   Under the card: "Follows a person, or a traffic sign. Arduino and an MU vision sensor."
   readout "mode · person"
2. "Fig 4 · Obstacle car": a small car on four black tyres with yellow hubs, an Arduino with a
   shield, an ultrasonic sensor (two round transducers) on a little servo at the front, with a
   faint sweep fan in front of it. readout "24 cm · turn left"
   Under the card: "Looks left and right, then takes the clearer side."
3. "Fig 5 · Rescue vehicle": a six-wheel rover with a box cabin, a front window, a small
   quadcopter drone lifting off its roof deck, a small blue nozzle on top, a folded arm at the
   back. readout "drone · up". No weapons, no camouflage, a student workshop build.
   Under the card: "An arm, a drone, a camera and fire suppression, on an Arduino."

Card chrome in Geist Mono 12px. The drawings are paper and navy, cool-grey shading, many small
parts. Lots of mist space above and below. No photos, no charts, no glass widgets.
```

Save keepers to `inspo/robotics/` as `01-tomatobot.png`, `02-jeevi.png`, `03-earlier.png`.
