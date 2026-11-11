# Hero Unfocus still: ChatGPT image prompt

Purpose: the picture the hero fades to when someone presses **Unfocus**. The face is sharp and the
edges are dragged sideways like a slow shutter, as in Ashish's mockup (`inspo/hero-unfocus/mockup.webp`),
but as one still photograph, so nothing moves or warps on the page.

It has to be **the approved hero photo, edited**, with the same size, framing and backdrop. Then it lines
up exactly with the blurred hero and the AF box when it fades in.

## Attach these 2 images to the ChatGPT message, in this order

1. `currentWebsiteAssets/ashish-hero-v2b.png`: the photo to edit (face, pose, framing, backdrop)
2. `inspo/hero-unfocus/mockup.webp`: only for the look of the blur

## Prompt (paste as is)

```
Image 1 is my approved portrait. Edit image 1 only. Keep it exactly the same photo: same size (2:3 portrait), same framing, same position and size of me in the frame, same face, glasses, beard, hair, expression, head angle, hoodie, light and the same flat pastel sky blue backdrop. Do not zoom, crop, move or redraw me.

Add one thing: a slow-shutter camera effect, as in the portrait in image 2. Use image 2 ONLY for the look of the blur. Do not copy anything else from image 2: no text, no letters, no brackets, no boxes, no circles, no buttons, no logo, and do not change my face or framing to match it.

THE EFFECT: it looks like a real photo taken with a flash and a slow shutter while the camera moved slightly sideways (dragging the shutter). The flash freezes the centre of me: my face, eyes, glasses, beard, ear, the front of my hair and the front of the hoodie stay tack sharp. Around the outer silhouette there is a soft HORIZONTAL motion trail: the back and top of my hair streak sideways into the backdrop, and the hoodie's shoulders, sides and arms drag sideways in soft, slightly ghosted horizontal streaks that fade into the blue. The trail is strongest at the outer edges and the lower body, about 3 to 6 percent of the image width long, and there is none on the face.

Horizontal streaks only: no vertical blur, no swirl, no zoom blur, no warping, no wobble, no double face. It is one still photograph. Photorealistic, natural colour, no grain, no filters, no glow. The backdrop stays one flat, uniform pastel sky blue edge to edge: no gradient, no vignette, no shadow. No text, watermark or extra objects.
```

## If it drifts (reply in the same chat)

- Text, brackets or circles from image 2 appeared → "Remove all text, brackets, boxes and circles. It must be only the photo of me on the plain blue backdrop."
- Face changed or blurred → "The face changed. Keep my face, glasses and beard exactly as in image 1, tack sharp. Only the outer edges have the motion trail."
- Framing changed (zoomed, moved, cropped) → "Keep the framing exactly as in image 1: same size and position of me in the frame. Only add the motion trail."
- Blur too strong or everywhere → "Make the motion trail subtler: only along the outer edge of my hair, shoulders and arms. The face and chest stay sharp."
- Too subtle → "Make the horizontal motion trail longer and more visible at the edges of the hair, shoulders and arms, like image 2."
- Backdrop got a gradient → "Make the backdrop one flat colour, the same blue as image 1, edge to edge. Change nothing on me."
- It keeps copying image 2's overlays → new chat, attach image 1 only, and paste the prompt with the two sentences about image 2 removed.

## When you have it

Save the full-size PNG as `currentWebsiteAssets/ashish-hero-unfocus.png`. Claude then keys out the backdrop
(the streaks become soft transparency over the hero's sky), registers it to `portrait.webp`, and
replaces the code-drawn smear with it.
