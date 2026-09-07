(function () {
  "use strict";

  const cfg = window.CHONK_CONFIG || (typeof CHONK_CONFIG !== "undefined" ? CHONK_CONFIG : {});

  const scene = document.getElementById("scene");
  const scoreEl = document.getElementById("score");
  const milestoneEl = document.getElementById("milestone");
  const endingEl = document.getElementById("ending");
  const keepWatchingBtn = document.getElementById("keep-watching");

  const EMOJI_CATS = ["🐈", "🐈‍⬛", "🐱", "😺", "😸"];
  const REACTIONS = ["meow ♪", "💛", "purrr", "🤍", "mrrp!", "✨"];
  const MILESTONES = {
    10: "Ten cats! They like you.",
    25: "Twenty-five! You're a certified cat spotter.",
    50: "Fifty cats spotted. The whole neighborhood knows you now.",
  };

  const SPECIAL_CHANCE = 0.12;
  const CAT_SIZE = cfg.catSize || 84;
  const ENDING_SCORE = cfg.endScore || 75;
  const RAMP_FULL_AT = cfg.rampFullAt || 60;
  const SPEED_RAMP = cfg.speedRamp !== false;

  // Relaxed pace at score 0 -> brisker (but always spottable) at full ramp.
  // Even at full pace a cat lingers about 2-3s; faster spawns mean MORE
  // chances to spot cats, and spotted cats are cumulative — misses are free.
  const LINGER_START = [2600, 4600];
  const LINGER_FULL = [1900, 3200];
  const GAP_START = [900, 2400];
  const GAP_FULL = [420, 1100];

  let score = 0;
  let spawnTimer = null;
  let ended = false;
  let catImagePool = [];

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function rampT() {
    if (!SPEED_RAMP) return 0;
    return Math.min(score / RAMP_FULL_AT, 1);
  }

  function rampedInt(startRange, fullRange) {
    const t = rampT();
    const lo = lerp(startRange[0], fullRange[0], t);
    const hi = lerp(startRange[1], fullRange[1], t);
    return Math.round(rand(lo, hi));
  }

  function preloadImages(paths) {
    return Promise.all(
      (paths || []).map(function (path) {
        return new Promise(function (resolve) {
          const img = new Image();
          img.onload = function () { resolve(path); };
          img.onerror = function () { resolve(null); };
          img.src = path;
        });
      })
    ).then(function (loaded) {
      return loaded.filter(Boolean);
    });
  }

  function applyRandomBackground(urls) {
    // Shuffle the candidates, then try them in order: the first one that
    // actually loads wins. If none load (or the list is empty), the drawn
    // window scene stays.
    const candidates = (urls || []).slice();
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = candidates[i];
      candidates[i] = candidates[j];
      candidates[j] = tmp;
    }

    function tryNext(index) {
      if (index >= candidates.length) return;
      const url = candidates[index];
      if (url === "window") return; // the built-in drawn window scene
      const img = new Image();
      img.onload = function () {
        scene.style.backgroundImage = 'url("' + url + '")';
        scene.classList.add("custom-bg");
      };
      img.onerror = function () { tryNext(index + 1); };
      img.src = url;
    }

    tryNext(0);
  }

  function buildCatElement(special) {
    const size = special ? Math.round(CAT_SIZE * 1.25) : CAT_SIZE;
    if (catImagePool.length > 0) {
      const img = document.createElement("img");
      img.src = pick(catImagePool);
      img.alt = "a cat";
      img.draggable = false;
      img.className = special ? "cat cat-img special" : "cat cat-img";
      img.style.width = size + "px";
      return img;
    }
    const div = document.createElement("div");
    div.className = special ? "cat cat-emoji special" : "cat cat-emoji";
    div.textContent = pick(EMOJI_CATS);
    div.style.fontSize = Math.round(size * 0.55) + "px";
    return div;
  }

  function spawnCat() {
    if (ended) return;

    const special = Math.random() < SPECIAL_CHANCE;
    const cat = buildCatElement(special);

    const bounds = scene.getBoundingClientRect();
    const size = special ? CAT_SIZE * 1.25 : CAT_SIZE;
    cat.style.left = rand(6, Math.max(bounds.width - size - 6, 6)) + "px";
    cat.style.top = rand(6, Math.max(bounds.height - size - 6, 6)) + "px";

    let clicked = false;
    cat.addEventListener("click", function () {
      if (clicked || ended) return;
      clicked = true;
      spotCat(cat, special);
    });

    scene.appendChild(cat);

    const linger = rampedInt(LINGER_START, LINGER_FULL) * (special ? 1.8 : 1);
    setTimeout(function () {
      if (clicked) return;
      cat.classList.add("leaving");
      setTimeout(function () { cat.remove(); }, 650);
    }, linger);

    scheduleNextSpawn();
  }

  function scheduleNextSpawn() {
    if (ended) return;
    clearTimeout(spawnTimer);
    spawnTimer = setTimeout(spawnCat, rampedInt(GAP_START, GAP_FULL));
  }

  // --- Meow sounds ------------------------------------------------------
  const soundToggleEl = document.getElementById("sound-toggle");
  const SOUND_KEY = "chonk.meows";
  let meowClips = [];
  let soundOn = resolveSoundFlag();

  function resolveSoundFlag() {
    try {
      const stored = localStorage.getItem(SOUND_KEY);
      if (stored !== null) return stored === "true";
    } catch (err) { /* private mode */ }
    return true;
  }

  function updateSoundToggle() {
    soundToggleEl.textContent = soundOn ? "🔊 Meows: on" : "🔇 Meows: off";
  }

  function loadMeows(paths) {
    (paths || []).forEach(function (path) {
      const clip = new Audio();
      clip.preload = "auto";
      clip.addEventListener("canplaythrough", function () {
        if (meowClips.indexOf(clip) === -1) {
          meowClips.push(clip);
          soundToggleEl.hidden = false;
        }
      }, { once: true });
      clip.src = path;
    });
    updateSoundToggle();
  }

  function playMeow() {
    if (!soundOn || meowClips.length === 0) return;
    const clip = pick(meowClips).cloneNode();
    clip.volume = 0.5;
    const attempt = clip.play();
    if (attempt && attempt.catch) attempt.catch(function () { /* autoplay policy */ });
  }

  soundToggleEl.addEventListener("click", function () {
    soundOn = !soundOn;
    try { localStorage.setItem(SOUND_KEY, String(soundOn)); } catch (err) { /* ignore */ }
    updateSoundToggle();
  });

  function spotCat(cat, special) {
    score += 1;
    scoreEl.textContent = "Cats spotted: " + score;

    playMeow();
    showReaction(cat, special);
    cat.classList.add("spotted");
    setTimeout(function () { cat.remove(); }, 500);

    if (MILESTONES[score]) {
      showMilestone(MILESTONES[score]);
    }
    if (score >= ENDING_SCORE) {
      endSession();
    }
  }

  function showReaction(cat, special) {
    const reaction = document.createElement("div");
    reaction.className = "reaction";
    reaction.textContent = special ? "special cat! 💖" : pick(REACTIONS);
    reaction.style.left = cat.style.left;
    reaction.style.top = cat.style.top;
    scene.appendChild(reaction);
    setTimeout(function () { reaction.remove(); }, 1400);
  }

  function showMilestone(text) {
    milestoneEl.textContent = text;
    milestoneEl.classList.add("show");
    setTimeout(function () { milestoneEl.classList.remove("show"); }, 3200);
  }

  function endSession() {
    ended = true;
    clearTimeout(spawnTimer);
    document.querySelectorAll(".cat").forEach(function (cat) {
      cat.classList.add("leaving");
      setTimeout(function () { cat.remove(); }, 650);
    });
    setTimeout(function () { endingEl.classList.add("show"); }, 900);
  }

  keepWatchingBtn.addEventListener("click", function () {
    endingEl.classList.remove("show");
    ended = false;
    scheduleNextSpawn();
  });

  // --- Cat cutout control (browser-side) -------------------------------
  // Priority: ?extract=1/0 in the URL > saved toggle choice > config.js.
  // While cutouts are being prepared, a loading screen holds the game so
  // cats only ever appear in their final form.
  const extractToggleEl = document.getElementById("extract-toggle");
  const loadingEl = document.getElementById("loading");
  const STORAGE_KEY = "chonk.extractCats";

  let originalPool = [];
  let extractedPool = null;
  let extracting = false;
  let spawnPaused = false;
  let extractOn = resolveExtractFlag();

  function resolveExtractFlag() {
    const param = new URLSearchParams(location.search).get("extract");
    if (param !== null) return param === "1" || param === "true" || param === "on";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) return stored === "true";
    } catch (err) { /* private mode: fall through to config */ }
    return cfg.extractCats === true;
  }

  function setSpawnPaused(paused) {
    if (spawnPaused === paused) return;
    spawnPaused = paused;
    if (paused) {
      clearTimeout(spawnTimer);
    } else {
      scheduleNextSpawn();
    }
  }

  function showLoading(show) {
    loadingEl.classList.toggle("show", show);
  }

  function setToggleLabel(text, busy) {
    extractToggleEl.textContent = text;
    extractToggleEl.classList.toggle("busy", !!busy);
    extractToggleEl.disabled = !!busy;
  }

  function applyExtractState() {
    if (!extractOn) {
      catImagePool = originalPool;
      setToggleLabel("✂️ Cat cutouts: off", false);
      showLoading(false);
      setSpawnPaused(false);
      return;
    }
    if (extractedPool) {
      catImagePool = extractedPool;
      setToggleLabel("✂️ Cat cutouts: on", false);
      showLoading(false);
      setSpawnPaused(false);
      return;
    }
    setSpawnPaused(true);
    showLoading(true);
    setToggleLabel("✂️ Cutting out cats…", true);
    if (extracting) return;
    extracting = true;
    window.CHONK_EXTRACTOR.extract(originalPool).then(function (pool) {
      extractedPool = pool;
      extracting = false;
      applyExtractState();
    });
  }

  extractToggleEl.addEventListener("click", function () {
    extractOn = !extractOn;
    try { localStorage.setItem(STORAGE_KEY, String(extractOn)); } catch (err) { /* ignore */ }
    applyExtractState();
  });

  // --- Start ------------------------------------------------------------
  applyRandomBackground(cfg.backgroundImages);
  loadMeows(cfg.meowSounds);
  preloadImages(cfg.catImages).then(function (pool) {
    originalPool = pool;
    catImagePool = pool;

    if (pool.length > 0 && window.CHONK_EXTRACTOR) {
      extractToggleEl.hidden = false;
      applyExtractState();
    }
    if (!spawnPaused) {
      scheduleNextSpawn();
    }
  });
})();
