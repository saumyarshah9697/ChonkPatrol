# Chonk Patrol 🐈

A calm little browser game. Cats wander into the scene — click them before they slip away.

No timer, no losing, no pressure. Just a peaceful "notice the cats" experience that gently picks up speed as you go.

For Arina 🤍

## How to play

Open `index.html` in any browser. That's it — no install, no build step, no dependencies.

- Cats appear at random spots and stay for a few seconds
- Click (or tap) a cat to spot it — each one gives a little reaction
- Keep an eye out for glowing special cats; they linger longer
- Small surprises at 10, 25, and 50 cats spotted
- The pace slowly ramps up as your score climbs
- After 75 cats (configurable), the cats head home for a rest — but you can always keep watching

## Using your own images

All customization happens in one file: `config.js`.

**Backgrounds:** drop images into `assets/` and list them — every page load picks one at random:

```js
backgroundImages: [
  "assets/living-room.jpg",
  "assets/balcony.jpg",
],
```

Leave the list empty and the game uses the built-in drawn window scene.

**Cats:** drop images into `assets/cats/` and list them in `catImages`:

```js
catImages: [
  "assets/cats/mochi.png",
  "assets/cats/biscuit.png",
],
```

Each spawned cat is picked randomly from the list. PNGs with transparent backgrounds look best. Any image that fails to load is skipped, and if the list is empty the game falls back to emoji cats — so it always works.

**Automatic cat cutouts (optional):** if your photos have the cat sitting in a room, the game can cut the cat out automatically — a small ML model runs in your browser (downloaded on first use, needs internet, takes a few seconds). Control it right in the browser: click the **✂️ Cat cutouts** button under the game (your choice is remembered on that device), or force it in the URL with `?extract=1` / `?extract=0`. The `extractCats` value in `config.js` is just the default. The game keeps playing with the original photos while cutouts are being prepared, and if the model can't load or a photo has no detectable cat, that photo is used as-is.

Other knobs in `config.js`: `catSize` (pixels), `endScore` (when the ending screen shows), and `speedRamp` / `rampFullAt` (turn the ramp off, or set how fast it reaches full pace).

## Files

| File | What it does |
|------|--------------|
| `index.html` | The page: scene, score counter, ending screen |
| `config.js` | Your settings: background, cat images, size, end score, speed ramp |
| `style.css` | The cozy look — mobile-first, works on phones and desktops |
| `script.js` | The game: cat spawning, clicking, score, milestones, ramp |
| `cat-extractor.js` | Optional in-browser cat cutout (used when `extractCats` is on) |
| `assets/` | Background images and the `cats/` folder with cat pictures |

## Hosting it online

The game is a static page, so GitHub Pages hosts it for free:

1. Create a new GitHub repository and upload these files
2. Go to **Settings → Pages** and set the source to the `main` branch
3. GitHub gives you a link you can send to anyone

## License

MIT — see [LICENSE](LICENSE).
