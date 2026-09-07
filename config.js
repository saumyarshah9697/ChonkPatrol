// Chonk Patrol configuration.
// This is the only file you need to edit when adding your own images.

const CHONK_CONFIG = {
  // Scene backgrounds. Each session (page load) picks one entry at random.
  // The special value "window" means the built-in drawn window scene.
  // Drop photo backgrounds into assets/ and mix them in, e.g.:
  //   backgroundImages: ["window", "assets/living-room.jpg", "assets/background.svg"],
  // An empty list (or every path failing to load) also falls back to the
  // drawn window scene.
  backgroundImages: [
    "window",
  ],

  // The cats. Drop images into assets/cats/ and list them here.
  // Any image that fails to load is skipped; if the list is empty the game
  // falls back to emoji cats, so it always works.
  catImages: [
    "assets/cats/chonk-orange.svg",
    "assets/cats/chonk-grey.svg",
    "assets/cats/chonk-black.svg",
  ],

  // How big a cat appears, in pixels (special cats show a bit bigger).
  catSize: 84,

  // Optional: cut the cat out of each photo automatically (removes the
  // background around the cat). Great for phone photos where the cat sits in
  // a room. Runs entirely in the browser via a small ML model downloaded on
  // first load (needs internet, adds a few seconds). If the model can't load
  // or no cat is found in a photo, that photo is used as-is.
  // This is only the DEFAULT: in the game you can flip it anytime with the
  // "✂️ Cat cutouts" button (choice is remembered), or force it via URL
  // with ?extract=1 or ?extract=0.
  extractCats: false,

  // The game ends (calm ending screen) when this many cats are spotted.
  // Spotted cats are cumulative — cats that get away never cost you anything.
  endScore: 75,

  // Speed ramp: as the score climbs, cats appear more often and stay a bit
  // less long, reaching full pace at rampFullAt spotted cats. The ramp is
  // gentle — even at full pace every cat stays on screen for about 2-3
  // seconds, and more frequent cats mean more chances, not fewer.
  // Set speedRamp to false for a fixed, fully relaxed pace.
  speedRamp: true,
  rampFullAt: 60,
};
