# Hero v2 portrait: ChatGPT image prompt

Purpose: one clean, sharp portrait of Ashish for the new hero (`inspo/hero-v2/reference-hero.webp`).
The site does the blur, motion smear, focus brackets and type in code, so the photo must be
sharp, plain and easy to cut out. Nothing else goes in the picture.

## Attach these 2 images to the ChatGPT message, in this order

1. `currentWebsiteAssets/ashish-mountains.jpg`: the face, glasses, hair, beard and skin tone to keep
2. `currentWebsiteAssets/ashish-profile-circle.png`: the head turn and hoodie (the pose the reference hero uses)

Do not attach the reference hero itself: ChatGPT copies its blur, overlays and text.

## Prompt (paste as is)

```
Create a photorealistic studio portrait of the man in image 1. This is for my personal website, so it must look exactly like me: same face shape, eyes, nose, eyebrows, ears, glasses, beard, hairline and skin tone as image 1. Do not beautify, slim, smooth or lighten anything. Natural skin texture.

IDENTITY (from image 1): young South Asian man, warm medium-brown skin. Thick black hair, short on the sides, with volume on top swept up and to the side as in image 1. Thin dark metal wire-frame glasses with large, slightly rounded rectangular lenses, exactly the frame in image 1, clear lenses, eyes clearly visible through them, no glare. Full, neatly trimmed short black beard joined to the moustache, same density and cheek line as image 1.

POSE (from image 2): head turned about 35 degrees to the viewer's right, eyes looking off-frame to the right and slightly down, chin level. Shoulders almost square to the camera. Calm, focused, thoughtful expression, mouth closed, relaxed.

CLOTHING: a plain heavyweight cotton pullover hoodie in deep blue-black (#1C2532), matte, hood down and resting softly around the back of the neck. No zip, no drawstrings, no logo, no text, no shirt collar showing.

FRAMING: square 1:1, highest resolution. Head-and-shoulders bust, centred. Top of the hair about 10% below the top edge. Both shoulders fully inside the frame with a little background on each side. The body is cut only by the bottom edge, at mid-chest.

BACKGROUND: one flat, uniform pastel sky blue (#B8D3F0), edge to edge. No gradient, no vignette, no texture, no shadow on the backdrop, no scenery.

LIGHT: soft, diffused studio daylight from a large source front-left, gentle fill on the right, a faint cool rim of light on the right edge of the hair and shoulder. Even, natural colour.

SHARPNESS: everything tack sharp from hair to shoulders. No depth-of-field blur, no motion blur, no film grain, no filters, no colour grading.

Do not add text, watermarks, frames, overlays, props, jewellery or any second person.
```

## If a generation drifts (reply in the same chat)

- Face doesn't look like you → "The face has changed. Keep the face exactly as in image 1: same eyes, nose, glasses, beard and skin tone. Change nothing else."
- The 35° turn keeps breaking the likeness → "Turn the head less, about 15 degrees to the right, eyes still looking right. Keep everything else."
- Background has a gradient or shadow → "Make the background one flat colour, #B8D3F0, edge to edge. Change nothing on the person."
- Shoulders cut by the sides → "Zoom out slightly so both shoulders sit inside the frame. Change nothing else."
- Logo, drawstrings or a collar appeared → "Remove the [logo / drawstrings / collar]; plain hoodie only."

## When you have it

Save the full-size PNG as `currentWebsiteAssets/ashish-hero-v2.png`. The background is cut out and
the blurred / sharp hero states are made from it in code, so no transparent or blurred version is needed.

---

# Hero v2b: the same portrait, zoomed out

Why: the first generation cut both shoulders at the frame edge and stopped at mid-chest, so
`build_hero_v2.py` paints the rest of the hoodie in. A real upper body (both arms, down to the waist)
removes that, and gives the phone layout a real torso under the name.

## Attach 1 image

1. `currentWebsiteAssets/ashish-hero-v2.png`: the approved portrait (so the face stays the same)

## Prompt (paste as is)

```
This is my approved portrait. Make a zoomed-out version of this exact photo that shows more of me. The face must stay identical: same face, eyes, nose, glasses, beard, hair, expression and head angle (turned to the right, looking off-frame). Same hoodie, same soft studio light, same flat pastel sky blue backdrop.

FRAMING: portrait 2:3, highest resolution. Shot like a real studio portrait on a full-frame camera with an 85mm lens, from chest height. The top of my hair sits about 6% below the top edge, and I am horizontally centred. Show my whole upper body down to the waist: both shoulders and both arms completely inside the frame, with plain backdrop visible beside each arm. The frame cuts only along the bottom edge, at the waist. My arms hang relaxed at my sides; my hands are just below the frame.

CLOTHING: the same plain deep blue-black heavyweight cotton pullover hoodie (#1C2532), hood down, with real fabric folds, creases at the elbows and natural shading from the light. No zip, no drawstrings, no logo, no print.

BACKDROP: one flat, uniform pastel sky blue (#A5D1F9), edge to edge. No gradient, no vignette, no floor, no shadow on the backdrop.

Photorealistic and tack sharp everywhere: no blur, no grain, no filters, no retouching. No text, watermark or extra objects.
```

## If it drifts (reply in the same chat)

- Face changed → "The face changed. Keep the face exactly as in the photo I attached. Change nothing else."
- Face keeps drifting → new chat, attach `ashish-hero-v2.png` and `ashish-mountains.jpg`, paste the prompt and add: "Image 1 is the photo to zoom out; image 2 is me, for reference."
- An arm or shoulder touches the side edge → "Zoom out a little more so both arms have backdrop beside them. Change nothing else."
- Looks smooth or CGI → "Make it look like a real photograph: natural skin texture and real fabric. Change nothing else."
- Backdrop has a gradient or a floor → "Make the backdrop one flat colour, #A5D1F9, edge to edge. Change nothing on me."

## When you have it

Save it as `currentWebsiteAssets/ashish-hero-v2b.png`. The script then only needs to key out the
backdrop (no painted shoulders), and the hero keeps its current framing.
