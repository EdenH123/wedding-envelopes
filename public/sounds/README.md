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
