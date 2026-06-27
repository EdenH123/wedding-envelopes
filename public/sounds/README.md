# Crowd cheer sound (optional)

The biggest reveals (₪2000+ "royal" tier) and the summary finale will play a
**real crowd cheer** if you put an audio file here. If no file is present, the
app falls back to a synthesized crowd roar — so this is optional.

## How to add it

1. Get a crowd-cheer clip you have the rights to use. Good **royalty-free**
   sources (free, no attribution hassles):
   - https://pixabay.com/sound-effects/search/crowd%20cheer/
   - https://freesound.org (filter by Creative Commons 0)
   - https://mixkit.co/free-sound-effects/crowd/

   > Note: don't rip audio from a random YouTube video — that's copyrighted.
   > Use one of the royalty-free sources above (or your own recording).

2. Save it in **this folder** with one of these names (first match wins):
   - `crowd-cheer.mp3`  ← recommended
   - `crowd-cheer.ogg`
   - `crowd-cheer.wav`
   - `cheer.mp3`

3. Keep it short (~3–6 seconds) and reasonably small (under a few MB).

That's it — no code changes needed. Redeploy (or restart `npm run dev`), open
`/display`, tap **🔊 הפעלת סאונד**, and the next big reveal will roar.

## Payment chime (optional)

The two lowest tiers (< ₪500 and ₪500–999) play a soft "payment confirmed"
chime. A pleasant synth version plays by default. To use a real clip instead
(e.g. an Apple-Pay-style sound you have the rights to), add a file here named:

- `payment.mp3` (or `.ogg` / `.wav`), or `apple-pay.mp3`

Keep it short (~1 second).

