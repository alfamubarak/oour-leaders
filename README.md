# OUR LEADERS — AFCSC / DAW Hall of Fame touchscreen prototype

**Client:** Department of Air Warfare (DAW), Armed Forces Command and Staff College (AFCSC), Jaji  
**Reference:** AFCSC/527/DAW  
**Status:** interactive design prototype / SAMPLE CONTENT, NOT AN AUTHORIZED SERVICE ROLL

## Open the exhibition

Unzip the entire project, then double-click `index.html` in Edge or Chrome. No local server, Node, npm, or internet is required for the **core interface** and locally supplied images.

- `prepare.bat`: checks essential source files and two featured portraits.
- `run.bat`: opens Microsoft Edge in fullscreen kiosk mode on Windows; if Edge is unavailable, falls back to the default browser.
- Use the **?** control for touch and keyboard instructions.
- `F` toggles full screen, `Esc` returns from profile or overlay, and arrow keys navigate profiles. Profiles also respond to left/right swipes.

**GSAP note:** the supplied HTML references GSAP via a public CDN. The main interface and built-in transition fallback work offline, but the **GSAP-specific** animation easing, stagger, and transitions require an internet connection. For a fully air-gapped deployment, obtain a licensed/local copy of `gsap.min.js`, place it under `vendor/`, and change the CDN script in `index.html` to `vendor/gsap.min.js`. Do not claim GSAP is locally bundled in this package.

## Screens and interactions

1. Cinematic opening with AFCSC emblem and an optional Skip Intro button.
2. One-screen **matched pair** of featured leadership offices: Commandant and Director of Air Warfare.
3. Historical roll: 6 sample Commandant slots and 8 sample Director entries, separately searchable.
4. Full-screen profile detail with a photograph, supplied rank/name, sample appointment, provisional tenure, placeholders for approved biography and quote/contributions, back button and next/previous navigation.
5. Two-column illustrative tenure view with profile links. Dates and verified ordering have not been supplied.
6. Full supplied photo archive: 13 numbered images in the historical portrait set and 35 filename-labelled directors' images. Fullscreen portrait viewer.
7. Responsive touchscreen and keyboard support, accessible fallback images, and basic reduced-motion support.

## Content: one file

All UI content and photo mapping are in `data.js`. Update `window.LEADERS_DATA.leaders` to replace the provisional information **after** the client signs off on the actual current office holders, names, ranks, tenure start/end, photo associations, short biographies and quotes/contributions.

**Critical data notice:**

- The two named AVM images (`avm-oa-tuwase.jpg` and `avm-eo-alade.jpg`) were supplied separately. The project uses them as **visibly provisional candidate pairings** for its two current-office panels. The approved current office holders and matching photo assignments are NOT verified by the supplied brief.
- The 13 `photo-01.png` … `photo-13.png` images have no names attached. Six appear as **numbered sample** Commandant slots; their office association and identities are explicitly unverified.
- The 35 numbered `air-cdre...` / `gp-capt...` photos have rank/name-like filenames. Eight are used in the illustrative DAW roll. File numbering is **not proof** of appointment chronology; years are blank. The remaining pictures are available in the archive.
- Nothing here implies a merit award, individual achievement, completed historical roll, verified office assignment, or official tenure. No biographies or quotes were invented.

## Assets

All photos supplied by the user are copied locally into `assets/`. The AFCSC emblem is copied to `assets/afcsc-emblem.png`. No officer images were taken from the web. The site does not require network image downloads.

## File layout

```
index.html
style.css
app.js
data.js               ← edit this only to update factual content
prepare.bat
run.bat
assets/
  afcsc-emblem.png
  portrait-placeholder.svg
  current/            ← 2 portraits
  commandants/        ← 13 numbered portraits (identities unverified)
  directors/          ← 35 labelled portraits
```

## Before live demonstration

Have AFCSC confirm: the two office holders, exact image-to-person pairing, official rank and full names, tenure dates and sequence, approved short biographies and quotations/contributions, and which of the uploaded numbered portraits really belong in the Commandant group. Remove the `SAMPLE PREVIEW` label only when all facts have been approved.

For details, review `CONTENT_VALIDATION.md`.

## Day 2 visual upgrade — Logo-inspired interactive wall

The updated visual system follows the supplied AFCSC crest: ice blue, scarlet, deep indigo, ivory and small brass highlights. It includes:

- Three-dimensional card tilt on mouse devices, soft portrait parallax and reactive light.
- Tap/keyboard **office spotlight** controls to shift emphasis between Commandants and Directors while keeping both offices visible. On the home screen press **1** or **2** for spotlight; **0** resets.
- A central emblem medallion that returns to an equal two-office view.
- Animated opening sequence and staggered portrait entrance; gentle motion toggling on desktop.
- A touch-friendly matched pair with full-screen biography, searchable rolls, timeline and supplied photo archive unchanged.

Local files `experience.css` and `experience.js` contain the new presentation layer; factual content stays entirely in `data.js`. **Core animations use the browser's native animation API offline.** When online, the optional GSAP CDN is used for more advanced transitions. No user-supplied photograph has been replaced or reassigned.


## Day 2 final animation update — Historical Auto Tour + Exit

This update was applied to the **uploaded immersive redesign**, retaining the supplied photos, sample records, two-office spotlight, introduction, search, timeline, motion settings and Windows kiosk launchers. There are no changes to `data.js` or any photo identity assignments.

- In either historical roll, previous officers appear in a **continuously moving horizontal portrait rail**. The photos loop seamlessly, with **pause/play**, back/forward controls, drag, touch-swipe, and vertical-wheel-to-horizontal scrolling. Hovering, focusing, dragging or swiping temporarily pauses the tour. The existing global motion toggle and operating system reduced-motion setting are respected.
- The complete supplied photo archive now has the same horizontal auto-tour, with independent tabs for the 13 historical unidentified portraits and 35 filename-labelled Director portraits.
- The full-screen portrait viewer has cinematic transition animations (native offline fallback, optional online GSAP), a **horizontal thumbnail filmstrip**, automatic 6-second slideshow, pause/play, arrows, arrow-key navigation and touchscreen swipe gestures. All original image files remain local.
- An **EXIT** control is available from the home navigation, profile view and immersive image viewer. It opens a focusable confirmation modal with **Continue Exploring** and **Yes, Exit**. Confirming displays an exhibition-closed screen; **Return to Exhibition** restores the previous screen. Browsers cannot generally close an independently opened kiosk/tab, so the exit is intentionally implemented as an in-page closed state.
- The additional presentation styles are isolated in `cinematic.css` to preserve the original `style.css` and `experience.css`.

**Offline note:** All new carousel, modal, touch and native transition effects work offline. GSAP remains an optional CDN enhancement just as in the uploaded project; it is not included locally.

**Content note:** This modification does not authenticate the placeholder officer names, photographs, tenures, or appointments. All existing SAMPLE labels remain in place.
