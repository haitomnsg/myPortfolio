# Section image prompts (ChatGPT)

Copy one prompt at a time into ChatGPT (Images / DALL·E). Attach 1–2 reference stills from `inspo/images/` (the blurred-figure cards) for blur and composition only. Ignore their olive colour; the palette in the style lock wins. For 00, attach the portrait at `currentWebsiteAssets/ashish-profile-circle.png` only as the person to smear, and do **not** attach the current built hero. For 06, attach that portrait as the sharp photo.

These are **layout references for Claude Code**, not photos that go on the site. Real robot photos and app screenshots stay in `currentWebsiteAssets/`. Anatomy figures will be rebuilt as live SVG, so ChatGPT only has to show the *object*, the *glass card*, and the *type*.

Generate at **16:9, 1920×1080**, UI mockup, not a photo of a laptop. One viewport per prompt. No extra logos, no watermarks, no “portfolio of a designer” chrome.

---

## Style lock (paste at the top of every prompt)

```
Art direction for a single-page personal site called "In Focus".
Concept: a camera / vision model pulling focus on a person. A heavily motion-blurred, smeared black-and-white silhouette of a young South Asian man with glasses and a hoodie sits in the background; as the page progresses the blur drops (hero ~40px, later sections sharper, last section perfectly sharp). In front of the figure sit 1–2 frosted-glass squircle "instruments" (status label + apricot status dot, one huge light numeral + small unit, a thin dashed-grid chart, one apricot data dot with a dashed drop line). Giant heavy white or mist display type bleeds off the bottom or left edge.

Palette only (soft pastel blue, cool and airy):
- field blue #C3D6EC (pastel powder blue, the main field)
- field mist #EAF1F8 (near-white blue)
- field slate #B5BFCC (cool blue-grey)
- field dusk #8AA6C8 (deeper dusty blue, only where a field darkens under type)
- ink #121A26 (deep navy, never pure black)
- paper #F5F8FB
- muted #8A94A3
- signal apricot #FF9F5A (live data only: chart dots, status dots, small triangles — never a button fill, never a heading)
- dark glass: translucent navy ~52% opacity, soft ice-blue glow in the top-right of the glass
- light glass: translucent paper ~62%

Type: geometric neo-grotesk like Urbanist. Display 800, huge, tracking tight, leading ~0.82. Body 400. Tiny uppercase labels live ONLY inside instruments. Geist Mono-like 12px for spec chips.

Layout: 12-column editorial, 72px side margins. Top chrome: small AG monogram + "Ashish Gupta" left, a rounded pill nav (Robotics · AI · Software · Record) centre, a pill "Available for projects" with an apricot status dot right. Native cursor visible. No left sidebar. No pastel skill cards. No emoji. No purple or neon-blue AI gradients. No glass navbar. At most two glass instruments per viewport (ZERO on the hero). Apricot at most four marks per screen.

Quality: award-site still, like a paused poster. Soft studio light. Photoreal glass and type, not cartoon, not 3D-render plastic.
```

---

## 00 — Hero, redesigned: focusing screen (generate this, not the old glass-card hero)

The old hero copied a glucose-monitor card onto a blur. Kill it. The first frame is now an SLR **focusing screen**: corner brackets, a split-prism rangefinder through the name, camera HUD made of his real numbers. No glass widgets. JeevI and TomatoBot wait until chapter 02.

Story beat: you opened a camera. Someone is in the frame. It is not sharp yet.

**Attach:** one blurred-figure still from `inspo/images` for the smear only (ignore its olive colour). Do **not** attach `.shots/home/d-01-hero.png` (that is the design we are replacing). Optional: `currentWebsiteAssets/ashish-profile-circle.png` as the person to smear, not to show sharp.

```
[PASTE STYLE LOCK]

Desktop website HERO, 16:9, 1920x1080, first viewport of a single-page site. Poster composition, not a dashboard.

FORBIDDEN on this frame:
- no frosted-glass squircle cards
- no line charts, gauges, or overlapping widgets
- no circular magnifying-glass loupe
- no photo of a robot, tomato, phone, or laptop
- no left sidebar
- no stock "creative portfolio" cursor
- if it looks like a health or fintech app, it is wrong. Start over.

Background: a flat pastel blue field #C3D6EC with a faint ground-glass grain, as if you are looking through an SLR focusing screen. It deepens toward dusk blue #8AA6C8 at the bottom, only enough for white type to sit. Centre: a large motion-smeared black-and-white silhouette of a young South Asian man, glasses, hoodie, short hair, filling about 55% of the height. Blur ~40px plus a horizontal smear. The face is not readable except the glasses, which are cut by a CLASSIC CAMERA SPLIT-PRISM: the top half of each lens is shifted ~14 pixels to the left of the bottom half, a bright horizontal hairline through the middle. That misalignment is the whole idea.

Over the photograph, a focusing-screen overlay, ink and paper, hairline weight:
- four L-shaped corner brackets, inset ~8% from the edges, not touching the header
- a thin AF rectangle loosely around the head and shoulders, slightly too high (autofocus still hunting), with four tiny apricot ticks at its corners only
- a faint crosshair that meets on the glasses
- very subtle circular fresnel rings, almost invisible

Top chrome (website, not camera):
- left: small geometric AG monogram + "Ashish Gupta" in ink
- centre: a compact rounded pill with four words: Robotics · AI · Software · Record
- right: a pill "Available for projects" with one apricot status dot

Camera HUD in Geist Mono, 12–14px, ink, the four corners of the focusing screen (under the chrome, above the giant type):
- top-left: AF-C
- top-right: 12%
- bottom-left of the screen area: 1/88  ·  f/2.56
- bottom-right of the screen area: ISO 2026
These numbers are real work disguised as exposure (88% ripeness, 256 reward, paper year 2026). Do not add shutter icons, fake histograms, or extra EXIF.

Type, lower third, hanging from the left margin, white/paper on the blue:
- one thin headline, Urbanist 300, about 42px: "I teach machines to see."
- then the poster: giant Urbanist 800, tracking tight, leading 0.82, two lines bleeding off the bottom AND the left edge:
  ASHISH
  GUPTA
The word ASHISH is the split prism: every letter is sliced by a hair-thin horizontal line at mid-height. The top halves of the letters sit 14px to the left of the bottom halves, like a rangefinder that has not locked. Gupta is split the same way, slightly less offset. Do not make this a glitch font or RGB chromatic aberration. It is optical, mechanical, analogue.

Empty space is required. The right third of the lower area is empty blue. No scroll-down button, or at most a 1px hairline chevron under Gupta.

Mood: a still you would screenshot. Quiet, technical, a little unresolved. Studio, not neon. Photoreal type and grain, not 3D-render plastic, not cartoon.

Negative: glassmorphism, gradient blobs, purple, neon or electric blue, apricot used as a fill, extra logos, watermarks, "portfolio" word, mockup of a browser window, hands holding a camera.
```

### 00-B — Alternate if 00 feels too camera-gimmicky: split plane (work sharp / maker blurred)

Only generate this if 00 comes back looking like a camera UI kit. Same site, different first frame: the machine is already in focus, the person is not.

**Attach:** `currentWebsiteAssets/tomato-bot-v2.jpg` plus one blurred inspo still (for the smear, not the colour).

```
[PASTE STYLE LOCK]

Desktop website HERO, 16:9, 1920x1080. Split frame, a vertical focusing-plane line, not 50/50: left 7 columns, right 5.

FORBIDDEN: glass cards, charts, loupe, sidebar, browser chrome, extra people.

LEFT (sharp): mist-blue field. A black wheeled TomatoBot on grass — low rectangular chassis, four mecanum wheels with white hubs, a 6-DOF arm of black servo blocks and rainbow jumper wires, a webcam, a green cup labelled TomatoBot with a cartoon tomato. Grade the photo cool, toward mist and pale blue with muted greens, keep it sharp. This is the only sharp photograph on the screen.

A vertical rangefinder hairline with tiny tick marks divides the viewport. One apricot tick sits on the line at 12% from the top. Left of the line a small Geist Mono chip reads "88% · in focus". Right of the line a chip reads "AF hunting".

RIGHT (blurred): pastel blue field #C3D6EC, the same young man in hoodie and glasses as a heavy smear, no readable face.

Top chrome as in the style lock.

Lower-left, over the grass, giant white type bleeding off the bottom:
ASHISH
and a thin line "I teach machines to see."
The name does not cross the split. Gupta can sit small under Ashish, or wait.

Lower-right stays empty except the smear. No widgets.

This must read in 3 seconds: the robot is the work, the blur is the person, the line is a lens.
```

---

## 01 — Chapter index (dark ink, four tall pills)

Story beat: the table of contents. Four rooms. Hover will later widen one pill and whip into that chapter.

**Attach:** `inspo/contact-sheets/video-rdl-finance.jpg` (the four numbered gradient bars).

```
[PASTE STYLE LOCK]

Desktop website section, 16:9, 1920x1080, deep navy ink ground #121A26.

Same top chrome as the hero, but the header sits on a thin paper-on-ink band.

Left third: paper type.
Eyebrow: "CHAPTER 1 OF 4"
Huge headline "Robotics"
Subline "Machines that move on their own."
Four stacked text rows under it (not cards):
TomatoBot v2 — Finds ripe tomatoes with YOLOv11, 88% in the field, picks them with a 6-DOF arm. Published in IJICTDC, 2026.
JeevI — A 12-joint quadruped that learned to walk with PPO in NVIDIA Isaac Lab on flat, rough and obstacle terrain.
Face tracking robot — Follows a person, or traffic signs, with an MU vision sensor on an Arduino.
Rescue vehicle — An Arduino rover with an arm, a drone, fire suppression and a camera.

Right two-thirds: four tall rounded-end vertical pills standing in a row like organ pipes, numbered 1–4 at the bottom. Each pill is a blurred photographic crop inside a rounded capsule:
1 Robotics — green tomato plants and a wheeled robot (heavily blurred)
2 AI — pale blue blur of documents / flowers
3 Software — slate-grey blur of a dashboard
4 Record — dark navy blur of a calendar
The first pill is WIDER than the others (hover state), vertical label "Robotics" in paper. The other three are narrower with vertical labels AI, Software, Record.

No glass instruments on this screen. No sidebar. Generous dark space. Looks like a paused scroll chapter, not a gallery website.
```

---

## 02A — Robotics: TomatoBot bench (field mist, blur 28px)

Story beat: the machine that sees fruit. The glass card holds an isometric Anatomy figure of the harvester over a row of plants. This still is the main reference Claude Code will rebuild in SVG.

**Attach:** blurred-figure inspo cards (smear only, not colour) + `currentWebsiteAssets/tomato-bot-v2.jpg` (for the real robot’s silhouette only — do not copy the photo into the figure).

```
[PASTE STYLE LOCK]

Desktop website section, 16:9, 1920x1080. Field mist #EAF1F8. Background is a heavily blurred (28px) crop of a black wheeled farm robot among tomato plants, washed mist-blue, no sharp photo.

Same top chrome.

Left column:
small "02 · ROBOTICS"
headline "A robot that finds the ripe ones."
three short lines of body copy in ink:
"TomatoBot v2 rolls a 6-DOF arm through a row of plants."
"YOLOv11 grades fruit in the field at 88 percent."
"The paper is in IJICTDC, 2026."
A row of three tiny spec chips in Geist Mono: YOLOv11 · 6-DOF · Raspberry Pi

Right two-thirds: ONE large light-glass squircle instrument (paper glass, not dark), filling most of the frame. Inside the glass, not a photo: a highly detailed isometric technical drawing of a small harvesting robot on a bench, Linear-meets-laboratory style, four-tone paper shading (lo / mid / hi / one lit white part), solids not wireframe.

The object: a heavy rectangular wheeled base on four mecanum-style wheels, a Raspberry Pi in a case, cable glands, a vertical mast, a 6-DOF articulated arm with visible servo horns, bevels, screws as tiny dots, a two-finger gripper holding a red tomato. In front of the base, a row of three small tomato plants in pots on a grooved plate. A camera on the wrist casts a faint cone; one fruit has a thin detection box. Spec chips around the drawing, not floating in air: "Mass — field unit", "Cam — Pi + YOLO", "Arm — 6 DOF IK", "Ripe · 88%". A tiny engraved label plate on the base reads "TOMATOBOT V2".

Card chrome: top-left "Fig 1", top-right "TomatoBot bench", bottom-left hint "hover the arm", bottom-right live readout "ripe · 88%". Soft ice-blue glow in the top-right of the glass. One apricot status dot "Active".

Giant pastel blue word "SEE" bleeding off the bottom-left, low opacity, cropped by the frame.

No second instrument. No people. No cartoon robots. No exploded CAD screenshot. The drawing must look like a real small machine built from many precise parts.
```

---

## 02B — Robotics: JeevI locomotion (field mist, second screen of the same chapter)

Story beat: the quadruped that learned three terrains. Second Anatomy figure.

```
[PASTE STYLE LOCK]

Desktop website section, 16:9, 1920x1080. Field mist #EAF1F8 deepening to pastel blue at the edges. Same top chrome.

Left: headline "Then it learned to walk."
Body: "JeevI is a 12-joint quadruped. PPO in NVIDIA Isaac Lab. Converged on three terrains."
Three stacked numbers in huge light type:
256.27  flat
191.83  rough
184.05  obstacles
Chip: "Published research · IJICTDC 2026" only if it fits; otherwise omit. Do not invent extra awards.

Right: a large light-glass squircle. Inside: isometric Anatomy drawing of a small 3D-printed quadruped on a long terrain strip that changes along its length — first a smooth plate, then a rough stippled plate, then block obstacles. The robot stands mid-strip, one diagonal pair of legs lifted. Visible: 12 servo boxes, hip and knee links, cable loom along the spine, a small compute board on the back, feet with rubber pads, ruler ticks along the strip. Four-tone paper shading, one lit part = the raised front-left foot.

Beside the figure, still inside the glass, a dark inset chart: three learning curves (flat / rough / obstacles) with apricot dots at the three finals 256.27 / 191.83 / 184.05.

Card: "Fig 2" / "JeevI on three terrains" / hint "switch terrain" / readout "reward 256.27 · flat".

No photoreal furry robot. No Boston Dynamics copy. Small desktop-scale machine, workshop lighting, many screws and bushings.
```

---

## 02C — Robotics: the earlier machines (optional, same chapter, lower)

Story beat: the path that led here. Face-tracker and rescue rover as smaller instruments, not full Anatomy epics.

```
[PASTE STYLE LOCK]

Desktop website section, 16:9. Field mist. Same chrome.

Headline left: "Before the published arm, smaller machines."

Two glass instruments only, side by side, over a blurred silhouette:

Left dark-glass card "FACE TRACKER"
tiny isometric line-drawing of an Arduino rover with a camera mast and an MU vision sensor. Spec chips: Arduino · MU sensor. Caption: "Follows a person, or a traffic sign."

Right light-glass card "RESCUE VEHICLE"
tiny isometric drawing of a six-wheel rover with a small arm, a stowed drone on the deck, a fire-suppression canister. Caption: "Arm, drone, camera, suppression. Arduino."

Do not add a gun. Do not add military camo. Keep it a student workshop vehicle. Giant cropped word "EARLY" at the bottom.
```

---

## 03A — Vision & AI: DocLipi (field blue-dusk, blur 18px)

Story beat: he teaches machines to read Nepali paper. The instrument is a metabolic-score-style strip, not a screenshot collage.

**Attach:** `inspo/images` metabolic-score card (dot strip).

```
[PASTE STYLE LOCK]

Desktop website section, 16:9. Field pastel blue shifting toward dusk #8AA6C8. Background: motion-blurred silhouette, blur ~18px (sharper than the hero). Same top chrome.

Left copy:
"03 · VISION"
headline "Paper, in two scripts."
body: "DocLipi sorts bank documents, reads Nepali and English, groups them by person, and answers questions about them."

Centre, covering the figure's face like a diagnostic overlay: ONE large dark-glass squircle with a rainbow edge flare (subtle, like a coated lens):
- label "DOCLIPI · CLASSIFIER" + apricot "Great"
- huge "4" and unit "heads"
- small "DenseNet121 · Gemma 3 Vision · FastAPI"
- a metabolic-score style chart: vertical tick lines across the card, two rows of dots (white = page seen, apricot = classified). X labels: KYC, cheque, statement, ID.
- delta "▲ Nepali + English OCR"

Do not paste a fake desktop-app screenshot. Do not show Devanagari if the model will misspell it; use abstract document glyphs instead. Giant word "READ" bleeding off the bottom.
```

---

## 03B — Vision & AI: Phulbari in a hand (blue, phone still)

Story beat: a phone in a silhouetted hand. The one place a real app UI may appear, held like the SOMA phone stills.

**Attach:** `inspo/images` phone-in-hands glucose shots + `currentWebsiteAssets/phulbariApp.png`.

```
[PASTE STYLE LOCK]

Desktop website section, 16:9. Cool grey-blue studio. Same top chrome, small.

Left, ink type on the empty field:
headline "A garden in the pocket."
"Phulbari recognises 100 flower species and waters the plant when the soil runs dry."
huge number "100" + "species"
chip "ICT Award 2025 · semi-finalist"

Right two-thirds: a photoreal pair of silhouetted dark-skinned hands holding a black iPhone, like a product still. On the phone screen, a clean custom UI (not iOS settings):
- title "Phulbari"
- a radial glass selector with an apricot centre disc and three frosted petals labelled Identify / Care / Water
- behind the selector, a softly blurred photo of a red rose
- a bottom glass widget: soil moisture 24% and an apricot status "pump ready"
Keep the phone UI sparse. No app-store chrome, no notch clutter beyond a simple status bar.

The hands and phone are sharp. Everything behind them is smeared. No extra people. No stock smiling gardener.
```

---

## 03C — Vision & AI: Recyclo + DementiaBot (small pair)

```
[PASTE STYLE LOCK]

Desktop website section, 16:9, pastel blue field. Same chrome.

Headline "Also from the lab."

Exactly two glass instruments over a blurred figure:

1. Light glass "RECYCLO" — huge "waste" is wrong; use "sort" as the verb. Value "Gemini" is wrong; show "class" as a small word and a pictogram of four bins as a tiny isometric line drawing. Caption: "What you are holding, and what you could make of it."

2. Dark glass "DEMENTIABOT" — value "Top 20". Note "Harvard Health Hackathon · team DizzyBits". Do not invent a product UI or medical claims. A tiny isometric cabinet of labelled drawers standing for memory cues.

Giant cropped word "LAB". No third card.
```

---

## 04 — Software in real use (field slate, blur 10px, bento of four)

Story beat: the work people already click every day. Four instruments, one Hairline object each. Blurred figure behind, almost in focus.

**Attach:** `inspo/contact-sheets/video-creditkarma.jpg` (glass bento over a blurred person).

```
[PASTE STYLE LOCK]

Desktop website section, 16:9. Field slate #B5BFCC. Background: blurred (10px) full-length silhouette of the same young man, almost readable. Same top chrome.

Top-left headline, two lines, thin Urbanist:
"Software people"
"already use."
Subline: "Shipped to a blood bank, restaurants, small shops, and ward offices."

A 2×2 bento of FOUR rounded glass instruments floating in front of the figure (two dark, two light), not more:

1. REDSOIL — huge "30%" + "less wastage". Tiny isometric line drawing of a blood-bag rack with an expiry tag. Caption "Blood-bank inventory, in real use." Apricot dot Active.

2. RESTHAT — huge "IRD" as letters is too cryptic; show "billing" as the small unit and a large "live" status. Tiny isometric receipt printer with two paper mouths (dual printer). Caption "Restaurant OS. IRD-certified billing. Several clients."

3. ARTHAVIDHI — huge VAT-style invoice number look: "VAT" small, "invoices" as the label, a big "PDF". Tiny isometric ledger / invoice stack. Caption "Billing for small businesses."

4. WADACONNECT — huge "ward". Tiny isometric government desk with a document stamp. Caption "Registration and document requests for ward offices."

No app screenshots inside the cards. No sixth widget. Apricot only as four status dots, one per card. Giant paper "USE" bleeding off the bottom-right.
```

---

## 05 — Record (ink ground, blur 4px, month grid)

Story beat: time. Apricot checks on months that shipped, won, or published. This is the calendar from the finance inspo video, retold with his facts.

**Attach:** the month-grid frame in `inspo/contact-sheets/video-rdl-finance.jpg`.

```
[PASTE STYLE LOCK]

Desktop website section, 16:9. Ground navy ink #121A26. The silhouette is almost sharp (4px blur) and sits far right, very dark. Same top chrome on a paper band.

Left: huge paper "Record."
Subline: "Since 2021. One paper. Seven placements. 2,516 contributions last year."

Centre: a dark-glass squircle calendar, years 2021 to 2026 as rows, months as a 6×12 grid of small rounded cells. Most cells empty (muted). Apricot check-dots only on these months (do not invent extras):
- 2022 Aug: Head of Development, Haitomns Groups
- 2022 Oct: RedSoil in a blood bank
- 2023: AAVISHKAR runner-up (vacuum robot, 24 h) — pick one cell, label on hover
- 2023 Nov: B.Tech AI, Kathmandu University
- 2024 May: Phulbari
- 2024 Dec: TomatoBot v2
- 2024: CodeFest 2nd, JIFFY Hackathon 2nd
- 2025: JeevI, DocLipi, Global IME Best Presentation, ICT Award semi-finalist
- 2026 Jan: TomatoBot paper
- 2026 Mar: EncodeX intern
- 2026 Apr: Harvard Health Hackathon top 20

One cell is hovered: a small tooltip "Jan 2026 · TomatoBot paper, IJICTDC".

Do not fill every month. The empty cells are the point. No GitHub-contribution heatmap colours other than apricot-on-ink. No fake streak numbers other than 2,516 in the subline.
```

---

## 06 — In Focus / contact (field paper, blur 0)

Story beat: the stranger is now a person. Sharp portrait. Say hello.

**Attach:** `currentWebsiteAssets/ashish-profile-circle.png` and `.shots/home/d-07-scroll.png`.

```
[PASTE STYLE LOCK]

Desktop website last section, 16:9. Field paper #F5F8FB with a soft navy ink band at the very bottom. Same top chrome.

The same young South Asian man, glasses, hoodie, short hair, is now a SHARP black-and-white photographic portrait on the right (not illustrated, not AI-beautified, documentary, looking slightly down and aside). A small chip "focus 100%" sits beside his temple.

Left: giant display "Say hello." bleeding off the left edge. Under it the email haitomns@gmail.com in large light type. Under that three text links: GitHub  LinkedIn  Instagram.

Around a small AG monogram disc near the portrait, a SOMA-style radial glass selector: four frosted petals labelled Email / GitHub / LinkedIn / Instagram, apricot centre.

Footer one line, small muted: "© 2026 Ashish Gupta" left, "Set in Urbanist and Geist Mono" right.

No contact form. No map. No pastel buttons. The portrait is the only photograph on the page that is in focus.
```

---

## Extra stills Claude Code will need

### A. TomatoBot Anatomy hero still (square, for the figure itself)

```
Square 1024x1024. Isolated isometric technical illustration on a cool paper field #F5F8FB, no website chrome.

A small harvesting robot as a real workshop machine: wheeled base, 6-DOF arm, gripper with one tomato, three potted plants, camera cone, detection box on one fruit. Four-tone shading, many screws, knurls, cable glands, a label plate "TOMATOBOT V2". Framed like an instrument card: Fig 1, title "TomatoBot bench", hint "hover the arm", readout "ripe · 88%".

Solids, not wireframe. No photoreal product shot. No people. High detail at 4x: every junction has a part.
```

### B. JeevI Anatomy hero still (square)

```
Square 1024x1024. Isolated isometric technical illustration on paper #F5F8FB.

A 12-DOF 3D-printed quadruped on a three-zone terrain strip (flat, rough, obstacles). Four-tone shading, visible servos, wiring harness, rubber feet, ruler ticks. One foot lit white. Card: Fig 2, "JeevI on three terrains", readout "256.27 · flat". No Boston Dynamics, no photoreal dog.
```

### C. Hairline trio (one square each, single-stroke isometric, for software cards)

Generate three separate squares, same scale, ink lines on paper, almost no fill:

1. Dual-mouth receipt printer (RestHat).
2. Blood-bag rack with one tagged bag (RedSoil).
3. Stack of clipped bank documents (DocLipi).

```
Square 1024. Hairline isometric: a single continuous dark ink line drawing of [OBJECT], workshop precision, no shading fills, tiny ticks and screws implied by line, paper background #F5F8FB. Object only, no crop of a website, no labels in the air. Looks like a plotter drew it.
```

### D. OG image (1200×630)

```
Open Graph still 1200x630. Pastel blue field, smeared silhouette, one dark-glass JeevI instrument showing 256.27, giant "Ashish Gupta" bleeding off the bottom, small "AI & Robotics Engineer". No nav. No loupe. Must read at 200px wide.
```

---

## How to run the set

1. Paste the style lock + one section prompt. Generate 2–3 variants. Keep the one that matches the style lock (pastel blue, glass, giant type).
2. Do **00 (focusing screen), 02A, 04, 05, 06** first. Those five stills lock the whole page. If 00 looks like a camera-app skin, run 00-B instead. 01, 02B, 03A–C, 02C are supporting.
3. Drop keepers into `inspo/section-refs/` named `00-hero.png`, `02a-tomatobot.png`, … so Claude Code can be pointed at a folder.
4. If ChatGPT misspells Nepali product names, that is fine. The site copy comes from `src/data/site.ts`, not from the pixels.
5. Never use a generated face as the final portrait. Section 06 must use Ashish’s real photo.
6. Never ask ChatGPT to draw a weapon on the rescue rover.

---

## What each still is for (Claude Code)

| File | Builds |
|---|---|
| 00 | New focusing-screen hero. Replaces the glass-card first frame |
| 01 | Chapter index pills in `Chapters` |
| 02A + A | `/anatomy` TomatoBot figure inside a light-glass instrument |
| 02B + B | `/anatomy` JeevI figure + reward chart |
| 03A | DocLipi instrument (CSS/SVG chart, not Anatomy) |
| 03B | Phulbari phone composition; screenshot from `currentWebsiteAssets/phulbariApp.png` |
| 04 + C | Software bento; Hairline figures inside cards |
| 05 | Record month grid |
| 06 | Contact payoff; real portrait + Hairline-adopted AG disc |
| D | `public/og.png` |
