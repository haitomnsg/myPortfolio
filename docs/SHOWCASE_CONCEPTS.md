# Showing, not telling: three ways to present the work

> Written 2026-10-27. Answers one question: is "I built X, it has these specs" the best way to show
> what Ashish can do? Short answer: no. That is the CV-on-a-website pattern, and the strongest
> portfolios stopped doing it years ago. This doc looks at what they do instead, picks three
> directions that fit the site we already have (the hero and the Robotics focus ring stay as they
> are), and ends with ChatGPT prompts so you can see each one before anything is built.

## 1. What the best portfolios actually do

I looked at the Awwwards portfolio winners of 2025–26 and the sites engineers keep sending each
other (Bruno Simon, Rauno Freiberg, Emil Kowalski, Paco Coursey, Josh Comeau, Teenage Engineering's
and Apple's product pages, Boston Dynamics' and Figure's robot pages). Six things repeat:

| Pattern | Who does it | What it means for us |
|---|---|---|
| **One world, carried all the way through** | Bruno Simon: you drive a car to every project. Rauno Freiberg: the whole site is a desktop OS with a dock and sounds. | We already have ours: a camera that focuses. Don't add a second metaphor. Every section should be something the camera does: focus, expose, develop, contact-sheet. |
| **You touch it and it answers** | Emil Kowalski and Paco Coursey ship small components you can play with; the component *is* the proof. Josh Comeau's articles are playgrounds. | The visitor should operate something you built, in the browser, in under five seconds. That is worth more than any paragraph. |
| **Evidence over claims** | Hiring managers consistently say they trust traces (a live demo, a readout, an annotated screenshot, a paper) over adjectives. | "88% in the field", "256.27 reward", "in use at a blood bank since 2022", "one paper", shown as instrument readouts. Never "passionate", "skilled", "expert". |
| **Few, deep** | Winners show 3–5 things with depth, not 25 cards. | Five robots, three AI things, three software systems. The rest is one quiet "lab bench" strip. |
| **Product-page confidence** | Apple, Teenage Engineering, Figure: huge object, tiny label, one number, lots of air. The object does the talking. | Our Anatomy figures are the objects. Give them a product page, not a project card. |
| **Craft in the small things** | Rauno's cursor, sounds and hover states. Léo Parpeix (Site of the Day, Sep 2026) and Pacôme Pertant (Site of the Day, Jun 2026) win on transitions, not on content volume. | Page transitions, the cursor, the pet, the AF corners. These are the "I'm very good at it" signal for Design, without a Design section having to say it. |

What none of them do: a list of specifications. Specs are what you read after you're already
convinced. The job of the page is to convince first.

**The honest limit of the research:** web searches returned mostly roundup articles, so the table
above leans on sites I know well rather than on a fresh survey. Spend an hour on
awwwards.com/websites/winner_category_portfolio/ before you decide; the winners' pages have video
previews.

## 2. The idea that ties it together

The hero says: *the camera can't focus on me yet; it focuses on the work.* So the whole site can be
one camera session:

```
Hero          the camera hunts for focus                                    (built)
Robotics      the focus ring: five machines on a turntable                  (built)
AI            exposure: point the camera at something, the model reads it   (new)
Software      the darkroom: three systems developing into real screens      (new)
Design        the contact sheet: every frame of the session, cut in craft   (new)
In Focus      the camera finally locks on Ashish: contact                   (new)
```

Robotics proves he builds machines by letting you *turn* them. AI should prove it by letting you
*run* one. Software by letting you *use* one. Design by the site itself being the proof. The three
directions below are three UI answers to that. They are not exclusive; the recommendation is at
the end.

---

## 3. Direction A: "Exposure", a live instrument wall

**One line:** every chapter is a working instrument you operate, not a card you read.

**AI chapter, first screen.** A big paper card on the right is a *viewfinder*: drop an image, or
allow the webcam, and a small model runs in the browser (a YOLO-nano or MobileNet export in ONNX, a
few MB). Boxes and labels draw in apricot the moment it sees something, with Geist Mono readouts at
the edge: `conf 0.91 · 14 ms · on-device`. Default state (no camera): it runs on a looping clip of
tomatoes, so it is already alive when you arrive. Left of it, the three AI projects as a thin index,
DocLipi active. Click DocLipi and the viewfinder swaps to a document demo: a sample bank form slides
in and the fields light up as they are extracted.

**Software chapter.** A "darkroom" band: three deep-blue trays. Each tray holds one real screen
(ArthaVidhi, RestHat, RedSoil) that *develops* as it scrolls into view: it starts as blank paper and
the UI fades up line by line like a print in developer. Under each, one readout only:
`in use since 2022-10 · 1 blood bank`, `IRD-certified · N restaurants`, `VAT invoicing · live`.
Hover a tray and a few hotspots show what he built (not the whole feature list).

**Design chapter.** Not a section: a single strip, "The craft in this page", where four or five
small things (the AF corners, the pet, the ring physics, the type) each get a 2-second loop.

**Why it's strong:** it is the only direction where a stranger can *verify* the AI claim in
seconds. "He put a vision model in his portfolio and it works on my face" is the thing people tell
each other.

**Cost:** highest. In-browser inference, webcam permission UX, a fallback clip. Two to three weeks
of build after approval. The robotics ring already taught us the pinning and performance rules, so
it is doable.

## 4. Direction B: "Contact sheet", the whole career as one roll of film

**One line:** every project is a frame on a contact sheet; scroll advances the film; one frame at a
time comes into focus and opens into a print.

**The screen.** A full-width strip of 35mm frames in paper white on mist, each with sprocket holes
in hairline blue and a Geist Mono frame number (`01`, `02` …). Robotics frames hold the isometric
figures, AI frames hold a crop of a model's output, Software frames hold a real screen. Scrolling
moves the strip sideways and a loupe (a soft circle, like a photographer's magnifier) sits in the
centre of the screen; whatever frame is under it is sharp and slightly enlarged, the rest are soft.
Three hand-drawn grease-pencil marks (apricot) circle the keepers: TomatoBot, DocLipi, ArthaVidhi.
Click a frame and it *prints*: the frame grows to a full card with the figure or screen, the
one-line story and three readouts.

**The roll is in time order**, so it tells the convergence story the vision doc asks for (Class 9
→ RedSoil → AAVISHKAR → KU → TomatoBot → JeevI → paper → EncodeX) without a timeline graphic. Short
mono dates sit above each frame.

**Why it's strong:** one gesture (scroll) does everything, the camera metaphor is airtight, and it
handles the awkward Design chapter for free: the sheet *is* photography and craft. It also scales:
a new project is one more frame.

**Cost:** medium. It reuses the ring's depth-of-field logic in a straight line. The risk is that it
is a gallery, not a proof: you look, you don't operate. Pair it with one live demo (A's viewfinder)
inside the DocLipi print and it has both.

## 5. Direction C: "Telemetry", one spine, three paths converge

**One line:** the page is a single flight recorder of one engineer; robotics, AI and software are
three traces that start apart and end as one line.

**The screen.** A tall, calm page. Down the left margin (the 72px line everything already hangs
from) runs a single vertical hairline with three coloured traces braided along it: robotics in deep
sky, AI in sky blue, software in navy. They begin as three separate lines at the top ("Class 9:
started programming and robotics the same year") and twist closer as you scroll, until at TomatoBot
all three run as one thick line. Projects are *nodes* on the traces: a node is a small paper card
pinned to the line with a mono timestamp. Scrolling moves a playhead; the node under the playhead
expands to the right into a wide panel with its figure and readouts; the others stay as 40px
thumbnails. At the bottom the braided line ends in the AF corners of the hero: the camera locks.

**Why it's strong:** it *argues* the thing he wants said ("I'm not three people, I'm one converged
engineer") structurally, without saying it. Recruiters read it as a story with a point. It is quiet
and premium in the Linear/Vercel sense, and the braiding animation is a signature nobody else has.

**Cost:** medium-low to build (SVG paths plus scroll), but it is the least "wow on arrival". It
works best as the *second* half of the page: after the ring and one live demo have impressed, the
telemetry explains.

---

## 6. Recommendation

**A + B, in this order:** keep Hero → Robotics ring; make **AI = Direction A's live viewfinder**
(one instrument, the single biggest proof on the site); make **Software + Design = Direction B's
contact sheet** (one gesture, carries the photography and the craft, scales forever); end with In
Focus / contact. Keep Direction C for a later About page, or drop it.

The reason: A gives the site its one unforgettable moment, B gives it a spine without a second
metaphor, and both are things a camera does. Three chapters with three different UI ideas would
read as a template.

If you want only one new image before deciding, generate **Prompt A1** (the AI viewfinder) first.

---

## 7. ChatGPT prompts

Attach `inspo/robotics/attach-1-hero.png` to every prompt (the finished hero: palette, fonts,
chrome). For A2 also attach a real ArthaVidhi or RestHat screenshot; for B1 attach
`attach-2-tomatobot-figure.png` and `attach-5-jeevi-figure.png` as well, and say "use them as they
are, only scaled". Generate 2–3 variants each, fix the keeper in the same chat ("keep everything,
only …"), and save keepers to `inspo/showcase/` as `a1.png`, `a2.png`, `b1.png`, `c1.png`.

### Style lock (paste at the top of every prompt)

```
Attached image 1 is the finished hero of my personal website and I love it. Design a new section that feels like the same site. Desktop 16:9 (1920×1080), a flat website mockup: no browser window, no device, no perspective.
COLOURS: sky blue #B8D4F0 melting into mist #EAF1F8 and paper #F5F8FB. Never a dark section. Navy #121A26 for type, deep sky #1E578F for mono readouts, muted #8A94A3 for secondary text. Apricot #FF8F4D only for tiny live marks (AF corners, one status dot, detection boxes). Nothing else is orange.
TYPE: titles in Rethink Sans ExtraBold, solid, tight, title case, never sliced or outlined. Thin lines in Urbanist Light. Labels and readouts in Geist Mono 12–13px. Body Urbanist Regular 17px.
CHROME, exactly as image 1: wordmark "Ashish Gupta" top-left in navy; frosted pill nav "Robotics · AI · Software · Design" top-centre; a 72px left margin that the wordmark, title, copy and chips all hang from.
MOOD: a premium precision-instrument product page. Calm, bright, lots of air, one big object, tiny labels. Small text may be gibberish; I only need the design.
```

### Prompt A1: AI chapter, the live viewfinder (Direction A)

```
[style lock]

THE IDEA: the camera turns from my robots to my models. This screen is a working viewfinder: the visitor points it at something and my vision model reads it, live, in the browser.

LAYOUT
Top band: a huge "AI" (about 220px, navy) hanging from the left margin with a small mono "02 / 04" above its top-right corner; on the same baseline a thin Urbanist Light line "Models that read, sort and recognise."
Left column (4 of 12): a slim vertical index in Geist Mono with hairlines: 01 DocLipi · 02 Phulbari · 03 TomatoBot vision · 04 Recyclo. Row 01 is active with one apricot dot. Under it, 3 short body lines about DocLipi (bank documents, Nepali and English OCR, fields extracted) and two readouts in mono: "DenseNet121 · Gemma 3 Vision".
Right (8 of 12): ONE large paper card, 28px corners, hairline navy edge at 10%, long soft blue-grey shadow. Inside it a live camera view: a photo of a scanned bank form on a desk in soft daylight. Over the photo, apricot detection boxes with hairline corners around the name, account number and date fields; next to each box a tiny mono label with a confidence number. In the card's corners the four apricot AF brackets from the hero. Along the card's bottom edge a mono readout strip: "on-device · 14 ms · conf 0.91 · ONNX". Top-right of the card a small frosted pill "Allow camera" and a second one "Drop an image".
Bottom of the screen: a faint hairline isometric floor grid in #C9DAEC fading in, and a mono "scroll to develop" hint at the left margin.
```

### Prompt A2: Software chapter, the darkroom trays (Direction A)

```
[style lock]
Attached image 2 is a real screenshot of a system I built. Place it as it is.

THE IDEA: software that people use every working day, shown developing like prints in a darkroom. Still bright: the "darkroom" is only three deep-sky-blue trays on a mist page.

LAYOUT
Top band: a huge "Software" (about 200px, navy) from the left margin, mono "03 / 04" above its corner, thin line "Systems people use every working day."
Main band: three wide shallow trays side by side, filling the width from the left margin. Each tray is a rounded rectangle in deep sky #1E578F with a lighter liquid surface, seen slightly from above. In each tray a paper "print" is floating: a real app screenshot inside a paper card. The left print (attached image 2) is fully developed and sharp. The middle print is half-developed: the top half of the UI is visible, the bottom half still blank paper with soft blue edges. The right print is blank paper with only faint UI lines emerging. Under each tray one mono readout only, left-aligned to the tray: "ArthaVidhi · VAT invoicing · live", "RestHat · IRD-certified · 6 restaurants", "RedSoil · 1 blood bank · since 2022-10".
Two or three apricot hotspot dots on the developed print, each with a hairline leading to a 3-word mono note ("live order queue", "dual printers").
Lots of air above and below the trays. No feature lists anywhere.
```

### Prompt B1: the contact sheet (Direction B)

```
[style lock]
Attached images 2 and 3 are finished robot drawings: use them as they are, only scaled.

THE IDEA: my whole body of work as one roll of film on a contact sheet. Scrolling advances the film; the frame under the loupe is sharp, the rest are soft.

LAYOUT
Top band: a huge "Contact sheet" (about 160px, navy) from the left margin, mono "03 / 04", thin line "Every frame of the session, in order."
Main band, full width, bleeding off both edges: one horizontal strip of 35mm film frames. The film base is paper #F5F8FB with sprocket holes drawn as hairline rounded rectangles in #C9DAEC along the top and bottom edges. Each frame is a paper card with a 12px corner, and above each frame a mono date and frame number: "2022-10 · 03", "2024-12 · 07" and so on. Frames hold, left to right: a desktop app screenshot (RedSoil), an isometric robot (attached image 2), a flower photo with a classification label, an isometric quadruped (attached image 3), a bank form with apricot boxes, a billing app screenshot, a phone app.
In the centre of the screen a loupe: a soft circle about 520px wide with a hairline navy edge and a faint glass highlight. The frame under it (attached image 2, TomatoBot) is sharp and enlarged by about 20%; every frame outside the loupe is softly blurred and slightly smaller. Under the loupe, hanging from the left margin, the sharp frame's one line in Urbanist Light: "Finds the ripe tomatoes and picks them." and three mono readouts: "YOLOv11 · 88% in the field · 6-DOF arm · published 2026-01".
Three frames have a hand-drawn apricot grease-pencil circle around them, like a photographer marking keepers.
At the bottom a mono "scroll advances the film" hint.
```

### Prompt C1: telemetry spine (Direction C)

```
[style lock]

THE IDEA: three paths, robotics, AI and software, that started apart and became one engineer. A vertical page where three traces braid into one line as you scroll.

LAYOUT (still 1920×1080: show one scroll position of a tall page)
From the 72px left margin a vertical hairline runs the full height. Along it three thin traces: deep sky #1E578F (robotics), sky blue #9DBCDD (AI), navy #121A26 (software). At the top of the screen they are three separate lines 40px apart; by the bottom of the screen they have twisted together into one braided line. Three mono labels at the top, one per trace: "robotics", "ai", "software".
Nodes on the traces: small paper cards (120×80, 12px corners) pinned to a trace with a mono timestamp to their left: "2022-10", "2023", "2024-12", "2025". The node at mid-height is active: it has expanded to the right into a wide paper card (8 columns) holding an isometric robot drawing, a title in Rethink Sans "TomatoBot v2", one Urbanist Light line and three mono readouts. The other nodes are small and muted. A horizontal apricot playhead line crosses the trace at the active node, with the four AF corners around the expanded card.
Right of the spine, big calm white space. Top-right a mono "2021 to 2026" and a thin Urbanist Light sentence: "Three paths. One engineer."
```

### Prompt D: storyboard of the direction you pick (run after choosing)

```
Attached image 1 is the section design I kept. Draw its motion as a storyboard: 4 frames in a 2×2 grid, each a 16:9 mini screen with a mono caption under it. Frame 1: the state on arrival. Frame 2: after one scroll (or the mouse touching the instrument). Frame 3: the thing opening or developing. Frame 4: settled, ready for the next section. Same colours, fonts and chrome; nothing new is introduced, only the same elements moving.
```

## 8. What happens after you approve one

1. Save the keeper to `inspo/showcase/`.
2. I write a design note from it (sizes, easing, pin rules, reduced-motion fallback), as with the
   ring.
3. Build in `src/components/`, one section at a time, verified in the browser at desktop and phone
   widths.
4. For Direction A: pick the on-device model first (a YOLO-nano export of the TomatoBot weights
   would be the honest choice) and measure its size and frame time before the UI is final.
