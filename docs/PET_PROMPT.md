# The pet: what to generate, in order

> Written 2026-10-25, revised the same day: the kitten is recoloured into the site's blues, and the
> video prompts are written for Veo 3.1 in Google Flow. Reference: `inspo/pet/Video-3880.mp4` (a
> fluffy white kitten with a lion's mane that blinks, looks around and shakes). Nothing is built
> yet; a throwaway test made from the reference's own frames proved the idea (idle, head follows
> the cursor, click to shake).

## How it works

```
1 image (ChatGPT)  →  8-second videos made from that image (Google Flow, Veo 3.1)  →  I cut them
                                                                                       into frames
```

- The **image** fixes how the pet looks. Every video starts from it.
- The **videos** are the animation. Each loop starts *and ends* on that same image, so the site
  can jump from one to the next without a visible cut.
- The **frames** are what goes on the site. The mouse decides which clip plays, and in the
  head-turn clip, which frame shows. That is how the head follows the cursor.

| On the site | Clip that plays |
|---|---|
| Nobody touching it | 1 Idle (loops) |
| Mouse moves across it | 2 Look: the cursor picks the frame, so the head follows it |
| Click, or rub it fast | 3 Shake |
| Mouse rests on it (round 2) | 4 Happy |
| Untouched for about 20 s (round 2) | 5 Fall asleep → 6 Sleeping (loops) → 7 Wake up when the mouse returns |

**Round 1 is enough to ship:** the image plus clips 1, 2 and 3. Round 2 adds the rest later.

Put everything you generate in **`assets/pet/`** with the names given below.

## The look: matched to the site

The reference kitten sits in a beige train and picks up warm, brownish light. Ours lives in the
hero's daylight instead:

| Part | Colour | Why |
|---|---|---|
| Backdrop | pastel sky `#B8D4F0`, lifting to mist `#EAF1F8` at the top | the hero's sky |
| Fur | white with a soft pastel-blue tint in the shadows and mane tips | "a little blue", still clearly a white kitten |
| Inner ears, paws, tail tip | dusty blue `#9DBCDD` | replaces the reference's warm grey |
| Eyes | deep sky blue `#1E578F` glass beads with a white catchlight | the site's deep blue |
| Cushion | deep sky-blue velvet `#1E578F` | like the dark hoodie in the hero: it grounds the white kitten |
| Blush | a faint apricot-peach tint on the cheeks | the only warm touch; apricot stays for the live marks the site draws on top, like the hero's AF corners |
| Light | cool, soft daylight from the upper left; blue-tinted shadows | no beige, cream or brown anywhere |

`inspo/pet/attach-1-kitten-blue.png` is the reference frame already shifted into these blues.
Image models copy a reference's colours far more than they follow text, so this attachment does
most of the work.

---

## Step 1. The master image (ChatGPT)

**Attach, in this order:**
1. `inspo/pet/attach-1-kitten-blue.png`: the character, already in our blues.
2. `inspo/pet/attach-2-site.png`: the finished hero, for its sky colour and daylight.

Make 3 or 4 tries. If one is almost right, fix it in the same chat ("keep everything, only
change …") instead of starting over, so the face stays the same.

```
Attached image 1 is the character I want: a tiny, fluffy, white kitten-like creature with a huge
round lion's mane. Its colours are already shifted toward cool blue on purpose. Recreate THIS
character, with the same face, proportions and fur, in a new studio scene. Ignore the train seat
and the people behind it. Attached image 2 is my website: match its pastel sky-blue colour and its
soft, cool daylight, and take nothing else from it (no person, no text, no interface).

THE CHARACTER (keep the shape from image 1, use these colours):
- very long, soft, silky fur: white with a soft pastel-blue tint, most visible in the shadows and
  at the tips of the mane, like fresh snow in morning shade. It reads as a white kitten, not a
  blue one.
- a huge round fluffy mane framing the face like a lion's
- small rounded ears; inside and at the tips a dusty blue (#9DBCDD)
- two small round eyes set wide apart: deep sky blue (#1E578F), glossy like glass beads, each with
  a tiny white catchlight
- a faint apricot-peach blush on the cheeks; no visible mouth
- a short body, four short legs with soft dusty-blue (#9DBCDD) paws, a big fluffy tail with a
  dusty-blue tip
- a real, soft, living animal: photoreal fur and light, not a cartoon, not a plastic 3D render

POSE (every animation starts and ends on this pose, so keep it simple and neutral):
- sitting upright, facing the camera straight on, head and body straight and symmetrical
- both front paws together, the tail curled around beside its paws on the left side of the image
- eyes open, looking straight into the lens; a calm, sweet expression
- the mane is full, fluffy and STILL: no wind, no motion blur

SCENE:
- it sits on a small, round, deep sky-blue (#1E578F) velvet cushion, slightly pressed down under it
- a seamless studio backdrop in pastel sky blue #B8D4F0, lifting softly to a paler mist blue
  #EAF1F8 toward the top: smooth, no texture, no horizon line; the floor is the same blue
- cool, soft daylight from the upper left, like an overcast morning; a gentle soft shadow under
  the cushion; every shadow is a soft blue-grey
- the whole picture stays in cool blues and whites: no beige, cream, yellow or brown tones anywhere
- nothing else in the scene: no props, no text, no logo, no frame, no people

CAMERA:
- landscape 3:2 (1536 × 1024), at the kitten's eye level, straight on, an 85mm lens look
- the kitten is centred and SMALL in the frame: kitten plus cushion fill about half the image
  height, with plenty of empty blue on every side, most of all above the mane. The image will be
  cropped to 16:9, so keep everything inside the middle 70% of the height.
- the whole kitten in sharp focus

Quality: a photoreal, high-resolution studio photograph. Soft, airy, calm and premium, with clean
light, and as cute as image 1.
```

**Pick the one where:**
- the face matches the reference: bead eyes, rounded ears, a round mane
- it reads as a white kitten with a cool blue tint (not baby blue, and not warm or yellowish)
- it faces straight ahead, symmetrical, with its eyes open
- the whole kitten and cushion sit inside the frame with blue space all around (the fur flies
  out when it shakes and the head turns, so it needs room)
- the backdrop is clean, with no text or watermark, and the fur looks real, not plastic

If it comes out too blue, say "less blue: whiter fur, keep the blue only in the shadows". If it's
too warm, say "cooler: remove every cream and beige tone".

Save it as **`assets/pet/master.png`**. From here on, use **this exact file** for every
clip. Don't crop, upscale or edit it later: the loops only join cleanly if every clip starts from
the same file.

---

## Step 2. The videos in Google Flow (round 1: idle, look, shake)

**Flow settings:**

| Setting | Value |
|---|---|
| Mode | **Frames to Video** |
| Model | **Veo 3.1 Fast** to try a prompt, **Veo 3.1 Quality** for the takes you keep |
| Aspect ratio | Landscape 16:9. If Flow asks you to crop `master.png`, keep the kitten centred. |
| Frames | `master.png` as the first frame **and** as the last frame (except clip 5) |
| Outputs per prompt | 2 to 4. Send me every decent take and I'll pick. |
| Length | Veo makes 8 s clips; each prompt below is timed to fill 8 s |
| Download | 1080p (upscaled) if Flow offers it, otherwise the original |

**How these prompts are written for Veo.** Veo follows a description of what it should see better
than a list of "no …" rules, and Flow has no negative-prompt box. So every prompt says what stays
still ("a locked-off tripod shot", "unchanged from first frame to last") instead of "no zoom". Each
also gives the action a timeline across the 8 seconds, so the kitten holds still at the start and
the end. Those calm seconds are where clips join on the site.

**Paste this block under every video prompt** (it's already filled in for each clip below):

```
Camera: a locked-off static shot on a tripod at the kitten's eye level, straight on. The frame
stays perfectly still for the whole clip.
Scene: the same pastel sky-blue studio backdrop, deep-blue velvet cushion and soft cool daylight
as the first frame, unchanged from first frame to last.
Character: the kitten keeps exactly the face, bead eyes, ears, mane shape and cool white-and-blue
colours of the first frame.
Style: photoreal and calm, like a premium studio photograph; real, silky fur that moves naturally
and settles.
Audio: quiet room tone only.
```

### Clip 1: Idle (plays whenever nobody is touching it)

First frame: `master.png` · Last frame: `master.png` · Save as `clip-1-idle-a.mp4`, `-b`, …

```
A tiny fluffy white kitten with a huge lion's mane sits calmly on a deep-blue velvet cushion,
breathing slowly. Its chest rises and falls gently and the long mane stirs very slightly, as if
in the faintest breath of air. At about four seconds it blinks once, slowly. At about six seconds
one ear gives a small twitch. It keeps facing the camera and never leaves its spot, and it ends in
exactly the same pose as the first frame.

Camera: a locked-off static shot on a tripod at the kitten's eye level, straight on. The frame
stays perfectly still for the whole clip.
Scene: the same pastel sky-blue studio backdrop, deep-blue velvet cushion and soft cool daylight
as the first frame, unchanged from first frame to last.
Character: the kitten keeps exactly the face, bead eyes, ears, mane shape and cool white-and-blue
colours of the first frame.
Style: photoreal and calm, like a premium studio photograph; real, silky fur that moves naturally
and settles.
Audio: quiet room tone only.
```

### Clip 2: Look (the head follows the cursor)

First frame: `master.png` · Last frame: `master.png` · Save as `clip-2-look-a.mp4`, …

```
A tiny fluffy white kitten with a huge lion's mane sits on a deep-blue velvet cushion, curious, as
if watching something drift slowly past. For the first second it faces the camera. From one to
three seconds it slowly turns its head to look toward the left side of the frame. From three to
six seconds it slowly turns its head all the way across to look toward the right side of the
frame. From six to eight seconds it turns back to face the camera and settles into exactly the
pose of the first frame. Only the head and eyes turn, at a slow, steady, even speed; the body and
paws stay still and the mane swings softly with each turn.

Camera: a locked-off static shot on a tripod at the kitten's eye level, straight on. The frame
stays perfectly still for the whole clip.
Scene: the same pastel sky-blue studio backdrop, deep-blue velvet cushion and soft cool daylight
as the first frame, unchanged from first frame to last.
Character: the kitten keeps exactly the face, bead eyes, ears, mane shape and cool white-and-blue
colours of the first frame.
Style: photoreal and calm, like a premium studio photograph; real, silky fur that moves naturally
and settles.
Audio: quiet room tone only.
```

I only use the three-to-six-second stretch, where the head goes from far left to far right. An
even speed there matters, because it makes the head follow the cursor evenly.

### Clip 3: Shake (on click, or when someone rubs it fast)

First frame: `master.png` · Last frame: `master.png` · Save as `clip-3-shake-a.mp4`, …

```
A tiny fluffy white kitten with a huge lion's mane sits still on a deep-blue velvet cushion. For
the first two seconds it sits calmly and blinks once. At about two and a half seconds it suddenly
does a quick, vigorous wet-dog shake of its head and upper body, lasting about a second and a
half: the long mane flies outward and swirls around its face in soft white-and-blue strands.
By five seconds the fur has fallen back into place, and for the last three seconds it sits still
again, looking at the camera, in exactly the pose of the first frame. Playful and cute.

Camera: a locked-off static shot on a tripod at the kitten's eye level, straight on. The frame
stays perfectly still for the whole clip.
Scene: the same pastel sky-blue studio backdrop, deep-blue velvet cushion and soft cool daylight
as the first frame, unchanged from first frame to last.
Character: the kitten keeps exactly the face, bead eyes, ears, mane shape and cool white-and-blue
colours of the first frame.
Style: photoreal and calm, like a premium studio photograph; real, silky fur that moves naturally
and settles.
Audio: quiet room tone only.
```

**Throw a take away if:**
- the camera moved, zoomed or cut
- the backdrop, cushion or light changed, the colours drifted warm, or something new appeared
- the face changed (different eyes, ears or mane shape), or a leg or eye was added or melted
- it doesn't end back in the starting pose (this matters most for clips 1 and 3)
- it barely moves. With the same first and last frame, Veo sometimes plays it safe; generate
  again, or make the action words stronger ("a big, vigorous shake").

---

## Step 3. Round 2 (later): happy, sleep, wake up

Same Flow settings, and the same Camera / Scene / Character / Style / Audio block under each.

### Clip 4: Happy (when the mouse rests on it)

First frame: `master.png` · Last frame: `master.png` · `clip-4-happy-a.mp4`

```
A tiny fluffy white kitten with a huge lion's mane sits on a deep-blue velvet cushion. For the
first second it faces the camera. Then it closes its eyes happily and slowly tilts its head to one
side, leaning into it as if someone is gently scratching behind its ear. It holds that blissful
look until about five seconds, then opens its eyes and returns to exactly the pose of the first
frame, sitting still for the last two seconds.
```

### Clip 5: Fall asleep

First frame: `master.png` · **No last frame** · `clip-5-sleep-a.mp4`

```
A tiny fluffy white kitten with a huge lion's mane sits on a deep-blue velvet cushion and gets
sleepy. Its eyes slowly close and its head droops. From about three seconds it slowly lies down
and curls up on the cushion into a round fluffy ball, its tail wrapped around itself. For the last
two seconds it is fast asleep, breathing slowly, and does not move.
```

Send me this one first. I'll cut its last frame out as `assets/pet/sleep.png` for the next two.

### Clip 6: Sleeping (loops)

First frame: `sleep.png` · Last frame: `sleep.png` · `clip-6-sleeping-a.mp4`

```
A tiny fluffy white kitten sleeps curled up in a round ball on a deep-blue velvet cushion,
breathing slowly and gently, its fur rising and falling. At about four seconds one ear twitches
once. It stays asleep the whole time and ends in exactly the pose of the first frame.
```

### Clip 7: Wake up (when the mouse comes back)

First frame: `sleep.png` · Last frame: `master.png` · `clip-7-wake-a.mp4`

```
A tiny fluffy white kitten curled up asleep on a deep-blue velvet cushion wakes up. It lifts its
head, opens its eyes, stretches a little, and by five seconds sits back up into the upright pose
of the last frame, looking at the camera. It holds that pose, still, until the end.
```

---

## What I do with them

1. Pick the best take of each clip and trim it to where it starts and ends on the master pose.
2. Crop to the kitten and cut the frames: WebP images for the head-turn clip (the cursor scrubs
   them) and small videos for the rest, all loaded only when the section is near.
3. Build the player as a component: the same state machine as the test (idle, look, shake), and
   on phones, a tap plays the shake and a sideways drag turns the head. The apricot AF corners
   and any readout are drawn by the site on top, never baked into the video.
4. Place it where you choose. The pet sits in its own rounded card, so it can go anywhere: next to
   "Say hello" in the footer, on the 404 page, or in a chapter.
