# Montagevideo: reels editing for @hanna_malkova

## Blog fonts (always use for every video unless the user asks otherwise)
Identified from the user's own reels ("хороша мама ≠ та, що кидає все (заради дітей)").
- **Main text / hooks:** Montserrat SemiBold (600), white, lowercase as written, soft dark shadow
  for readability (`0 2px 6px rgba(0,0,0,.45)`).
- **Secondary text / asides:** Montserrat Light (300), e.g. "( заради дітей )" with spaced parentheses.
- Accent words can be Montserrat Bold (700) or UPPERCASE with wide letter-spacing.
- Load in Remotion with `@fontsource/montserrat/{300,600,700}.css`; Cyrillic subsets are included.
- Do not replace with the reference video's font; references define layout/timing only.

## Workflow
- Sources come from Google Drive folder **Video** (id `1iUxHWeaCQJ4O0a0C2VgbufIMNa5OzPv7`);
  the user shares it by link, download via `drive.usercontent.google.com/download?id=…&confirm=t`.
  Remind the user to close link access afterwards.
- Footage is iPhone 4K HEVC 60 fps portrait; work in 1080×1920 @ 30 fps.
- Do not stabilise footage unless asked (user disliked the result once).
- Colour: keep skin tones natural; warmth only in shadows/highlights (see `remotion/src/ranok.jsx`).
- Sound effects must have energy in 150 Hz–3 kHz so they are audible on phone speakers.
- Don't guess who is in the frame; the user has four sons (no daughter).
- Remotion compositions live in `remotion/src/*.jsx`; render with
  `--public-dir=$PWD/remotion/public --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.
- Tools: `tools/upscale.py` (Real-ESRGAN), `tools/matte.py` (person matte, RVM),
  `tools/people_segments.py` + `tools/cut_people.py` (auto-cut where people are in frame),
  `tools/boom.py` (phone-audible boom SFX), `tools/lockshot.py` (tripod stabiliser).
