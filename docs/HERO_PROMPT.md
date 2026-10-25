# Hero mockup: ChatGPT image prompt

Purpose: see the "In Focus" hero (DESIGN.md §2, §5 section 00) as a picture before building it.

## Attach these 4 images to the ChatGPT message, in this order

1. `currentWebsiteAssets/ashish-profile-circle.png`: the person (used only as a blurred silhouette)
2. `inspo/images/846348145_18639188344056352_943318549344423298_n.jpg`: olive "GLUCOSE" poster (layout, palette, giant type)
3. `inspo/images/848390854_18639188170056352_235989867026770371_n.jpg`: "METABOLIC SCORE" card (glass material)
4. `currentWebsiteAssets/ashish-website-logo.png`: AG monogram

## Prompt (desktop, paste as is)

```
Create a high-fidelity website hero screenshot, landscape 3:2, desktop browser width, no browser chrome. It is the first screen of a personal portfolio for an AI & robotics engineer. Match the art direction of reference images 2 and 3 exactly: Ron Design Lab style, a heavily blurred human silhouette behind one crisp frosted-glass data card, soft and premium, calm, editorial.

BACKGROUND: a flat muted olive field (#C6C98A), slightly lighter and creamier toward the top-right corner. Fine film grain, very subtle.

SUBJECT: the young man from reference image 1 (glasses, beard, hoodie, head turned slightly to the right) rendered as a huge, extremely out-of-focus dark silhouette, near-black warm brown (#16130F). Head and shoulders fill the centre and right of the frame from the top edge down past the bottom edge. Gaussian blur so strong that no facial features are visible, only the shape of the head, glasses-edge highlight and hood. A short horizontal motion-smear streak trails off the right shoulder, like a long-exposure photo.

MAIN CARD (centre-right, in front of the chest, about 34% of the frame width): a dark smoky frosted-glass squircle card with very rounded corners (superellipse), translucent so the olive and the silhouette show through softly blurred, a thin bright 1px rim of light along the top edge, and a warm pale-yellow glow blooming inside its top-right corner. Content, all in a light geometric sans-serif (like Urbanist), white and grey:
- top row: "JEEVI · LOCOMOTION" in small uppercase, then a tiny acid-lime dot and "Converged" in grey; a small diagonal collapse-arrows icon in the top-right corner
- a big light-weight number "256.27" with a small grey unit "reward" beside it
- below it a small line: a tiny lime triangle then "PPO in Isaac Lab · flat terrain"
- a minimal line chart across the bottom half: three thin white curves that rise steeply from the left and level off into plateaus at different heights, faint dashed horizontal grid lines, small grey y-axis labels "300", "200", "100" on the right; on the highest curve, near the right end, one acid-lime (#E6F06B) dot with a soft glow and a thin dashed vertical line dropping from it

SECOND CARD (overlapping the lower-right corner of the main card, about 60% of its size): a light frosted-glass squircle (milky white, translucent). Content in dark text: "TOMATOBOT v2" small uppercase with a small "↗" in the corner, a big light number "88%", grey caption "ripeness detection", and at the bottom a thin outlined pill "Published · IJICTDC 2026".

TOP BAR (thin, no background): far left a solid black circle with the white single-stroke monogram from reference image 4, then "Ashish Gupta" in small dark text. Centre: four small pill tabs in one translucent rounded group: "Robotics", "AI", "Software", "Record", with "Robotics" filled white. Far right: an outlined rounded pill with a tiny lime dot and "Available for projects".

HEADLINE (top-left, below the top bar, left aligned, two lines, white, thin light weight, large): "I build robots that see," then "and software people use."

GIANT TYPE (bottom-left, in front of the silhouette and behind the cards): the name in an extremely large, heavy, tightly tracked geometric sans-serif, pure white, two lines stacked: "Ashish" on top, "Gupta" below, the second line so big its lower part is cut off by the bottom edge of the image, exactly like "Save this design" in reference image 2. A round smoky-glass button about the size of a large letter, containing a thin downward arrow, sits on top of the letter "p".

BOTTOM-RIGHT: one line of small dark-grey text: "AI & Robotics Engineer · Kathmandu University, Nepal".

CURSOR DETAIL: on the silhouette's blurred face, a circular glass lens about 150px wide (a magnifier), inside which the face is slightly sharper; next to it a tiny pill "focus 12%".

Rules: only one accent colour, the acid lime, used only on the two status dots, the triangle and the chart dot. No other colours, no gradients except the soft glow inside the glass, no purple, no neon, no icons other than those described, no extra text, no lorem ipsum, no health or medical wording. Every text string must be spelled exactly as given. Generous margins, everything aligned to a clean grid.
```

## Prompt (phone, as a follow-up message in the same chat)

```
Now the same hero as a phone screenshot, portrait 9:16. Same field, silhouette, cards and text, re-composed for one column: top bar with only the monogram, "Ashish Gupta" and a menu icon; headline at the top-left; the silhouette cropped to head and shoulders; the main JeevI card full-width in the middle with the TomatoBot card overlapping its bottom edge; "Ashish" / "Gupta" huge at the bottom, cut off by the bottom edge, with the round glass arrow button on the "p". No cursor lens.
```

## If a generation drifts

- Text garbled → reply "Keep everything, fix only the text, spelled exactly as in my prompt."
- Too much glass → "Only the two cards are glass; the top bar has no background."
- Face visible → "Blur the person far more: no features, only the shape."
