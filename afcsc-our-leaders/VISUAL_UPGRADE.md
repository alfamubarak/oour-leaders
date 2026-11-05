# Our Leaders — Visual Upgrade (Day 2)

## Creative direction

A ceremonial, human-centred leadership wall built around the supplied AFCSC crest. Sky blue and scarlet distinguish the two related leadership offices; midnight indigo and warm white bring depth and contrast. Gold is used sparingly, as in the emblem.

## What changed

- More prominent and readable portrait-led featured panels.
- A large editorial Our Leaders title, atmospheric emblem watermark, expressive crest-coloured gradients and refined framing.
- New Commandants / Air Warfare spotlight chips; tap one to expand its visual emphasis, or the central emblem / reset control to restore balance.
- Smoother full-screen motion; original leader roll, individual profiles, timeline, photo archive and search preserved.
- Pointer-based 3D card tilt and portrait parallax, with soft moving light for desktop.
- Optional ambient motion pause, keyboard spotlight shortcuts (`1`, `2`, `0`), and native animation fallbacks that run offline.
- Safer async optional GSAP loading, so the website does not wait for a CDN when operating offline.
- More polished small-screen composition and tap targets.

## Content integrity

Names, rank, portrait associations, tenure dates, biographies and service order remain exactly as represented in the previous provisional demo. Update and verify those in **data.js**; none were inferred from appearance or internet sources. The gallery remains sample content pending AFCSC approval.

## Testing summary

- HTML loads and interaction script executes with network requests blocked in Chromium.
- 1440x900 and 1920x1080 exhibition display layouts fit without document overflow.
- 390px mobile screen has no horizontal overflow and stacks both offices.
- Spotlight buttons, reset, portrait detail opening, return and historical roll tested.
- JS syntax checked. Original local image assets and Windows batch launchers retained.

Windows Edge kiosk scripts are supplied but must be validated on the target Windows machine.
