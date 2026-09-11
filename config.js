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
    "assets/cats/black-cat-cut.png",
    "assets/cats/door-cat-cut.png",
    "assets/cats/shorthair-cat-cut.png",
    "assets/cats/white-cat-cut.png",
    "assets/cats/patterned-tabby-cut.png",
    "assets/cats/snow-tabby-cut.png",
    "assets/cats/watch-tabby-cut.png",
    "assets/cats/kitten-04-cut.png",
    "assets/cats/kitten-06-cut.png",
    "assets/cats/cat-02-cut.png",
    "assets/cats/cat-03-cut.png",
    "assets/cats/cat-04-cut.png",
    "assets/cats/cat-05-cut.png",
    "assets/cats/cat-06-cut.png",
    "assets/cats/cat-07-cut.png",
    "assets/cats/cat-09-cut.png",
    "assets/cats/cat-10-cut.png",
    "assets/cats/cat-11-cut.png",
  ],

  // Meow sounds. A random one plays when a cat is spotted. The 🔊 button
  // in the game mutes/unmutes (remembered per device). Empty list = silent.
  meowSounds: [
    "assets/sounds/meow-1.m4a",
    "assets/sounds/meow-2.m4a",
    "assets/sounds/meow-3.m4a",
    "assets/sounds/meow-4.m4a",
  ],

  // How big a cat appears, in pixels (special cats show a bit bigger).
  catSize: 84,

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
