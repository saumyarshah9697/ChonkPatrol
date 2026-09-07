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

**Cutting cats out of photos — recommended flow:** if your photos have the cat sitting in a room, cut them out locally before uploading, so visitors get instant, pre-polished cutouts with zero download cost:

1. Drop raw photos (jpg/png/webp) into `raw-cats/` — this folder never gets committed
2. Run `node cut-cats.cjs` — each photo becomes a transparent-background `assets/cats/<name>-cut.png`, and photos with no detectable cat are reported and skipped
3. Check the cutouts look good, paste the printed `catImages` list into `config.js`
4. Run `./publish.sh` to ship them

**Runtime cutouts (fallback):** the game can also cut cats out in the visitor's browser — click the **✂️ Cat cutouts** button under the game (remembered per device) or force with `?extract=1` / `?extract=0` in the URL; `extractCats` in `config.js` sets the default. While cutouts are being prepared, a calm loading screen holds the game so cats only ever appear in their final form. Prefer the local flow: runtime extraction re-downloads the ML model for every visitor session.

Other knobs in `config.js`: `catSize` (pixels), `endScore` (when the ending screen shows), and `speedRamp` / `rampFullAt` (turn the ramp off, or set how fast it reaches full pace).

## Files

| File | What it does |
|------|--------------|
| `index.html` | The page: scene, score counter, ending screen |
| `config.js` | Your settings: background, cat images, size, end score, speed ramp |
| `style.css` | The cozy look — mobile-first, works on phones and desktops |
| `script.js` | The game: cat spawning, clicking, score, milestones, ramp |
| `cat-extractor.js` | Optional in-browser cat cutout (used when `extractCats` is on) |
| `cut-cats.cjs` | Local batch cutter: `raw-cats/` photos in, `assets/cats/` cutouts out |
| `publish.sh` | One-command commit + push to GitHub |
| `puzzle/` | Chonk Puzzle: a slide-tile puzzle of a cat photo, state survives reloads |
| `assets/` | Background images, the `cats/` folder, and meow sounds |

## Hosting it online

The game is a static page, so GitHub Pages hosts it for free:

1. Create a new GitHub repository and upload these files
2. Go to **Settings → Pages** and set the source to the `main` branch
3. GitHub gives you a link you can send to anyone

## Credits

Cat photos and meow sounds come from [Wikimedia Commons](https://commons.wikimedia.org):

- [Domestic Cat White](https://commons.wikimedia.org/wiki/File:Domestic_Cat_White.JPG) — public domain
- [Domestic Short Hair Cat](https://commons.wikimedia.org/wiki/File:Domestic_Short_Hair_Cat.jpg) — CC0
- [Domestic cat sitting by door](https://commons.wikimedia.org/wiki/File:Domestic_cat_sitting_by_door.jpg) — public domain
- [Domestic Cat Black Sitting](https://commons.wikimedia.org/wiki/File:Domestic_Cat_Black_Sitting.jpg) by Anish Anilkumar — [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- [Patterned Tabby Cat Standing](https://commons.wikimedia.org/wiki/File:Patterned_Tabby_Cat_Standing.jpg) (CC0), [Red tabby DLH cat in snow](https://commons.wikimedia.org/wiki/File:Red_tabby_DLH_cat_in_snow.jpg) (CC0), [Young tabby cat keeping watch](https://commons.wikimedia.org/wiki/File:Young_tabby_cat_keeping_watch.jpg) (CC0), [Kitten (04)](https://commons.wikimedia.org/wiki/File:Kitten_(04)_by_Ron.jpg) and [Kitten (06)](https://commons.wikimedia.org/wiki/File:Kitten_(06)_by_Ron.jpg) by Ron whisky (public domain)
- Puzzle photos: [Domestic Short Hair Cat](https://commons.wikimedia.org/wiki/File:Domestic_Short_Hair_Cat.jpg) (CC0), [Cat face 1](https://commons.wikimedia.org/wiki/File:Cat_face_1.jpg) by Love Krittaya (public domain), [Cat face portrait resting](https://commons.wikimedia.org/wiki/File:Cat_face_portrait_resting.jpg) by Tom Harpel — [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- Meows: [νιαούρισμα](https://commons.wikimedia.org/wiki/File:2015-11-24.%CE%BD%CE%B9%CE%B1%CE%BF%CF%8D%CF%81%CE%B9%CF%83%CE%BC%CE%B1.%CE%9D%CE%B9%CE%AC%CE%BF%CF%85.noise_reduced.flac) (CC0), [Maullido de gata hembra joven](https://commons.wikimedia.org/wiki/File:Maullido_de_gata_hembra_joven.ogg) (CC0), [Meow](https://commons.wikimedia.org/wiki/File:Meow.ogg) by Dcrosby ([CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)), [Meow of a pleading cat](https://commons.wikimedia.org/wiki/File:Meow_of_a_pleading_cat.oga) (public domain)

## License

MIT — see [LICENSE](LICENSE).
