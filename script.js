(function () {
  "use strict";

  const scene = document.getElementById("scene");
  const scoreEl = document.getElementById("score");
  const milestoneEl = document.getElementById("milestone");
  const endingEl = document.getElementById("ending");
  const keepWatchingBtn = document.getElementById("keep-watching");

  const CATS = ["🐈", "🐈‍⬛", "🐱", "😺", "😸"];
  const REACTIONS = ["meow ♪", "💛", "purrr", "🤍", "mrrp!", "✨"];
  const MILESTONES = {
    10: "Ten cats! They like you.",
    25: "Twenty-five! You're a certified cat spotter.",
    50: "Fifty cats spotted. The whole neighborhood knows you now.",
  };

  const SPECIAL_CHANCE = 0.12;
  const CAT_LINGER_MS = [2600, 4600];
  const SPECIAL_LINGER_MS = [6000, 8000];
  const SPAWN_GAP_MS = [900, 2400];
  const ENDING_SCORE = 75;

  let score = 0;
  let spawnTimer = null;
  let ended = false;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function randInt(range) {
    return Math.round(rand(range[0], range[1]));
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function spawnCat() {
    if (ended) return;

    const cat = document.createElement("div");
    const special = Math.random() < SPECIAL_CHANCE;
    cat.className = special ? "cat special" : "cat";
    cat.textContent = pick(CATS);

    const bounds = scene.getBoundingClientRect();
    const size = special ? 52 : 42;
    cat.style.left = rand(8, bounds.width - size - 8) + "px";
    cat.style.top = rand(8, bounds.height - size - 8) + "px";

    let clicked = false;
    cat.addEventListener("click", function () {
      if (clicked || ended) return;
      clicked = true;
      spotCat(cat, special);
    });

    scene.appendChild(cat);

    const linger = special ? randInt(SPECIAL_LINGER_MS) : randInt(CAT_LINGER_MS);
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
    spawnTimer = setTimeout(spawnCat, randInt(SPAWN_GAP_MS));
  }

  function spotCat(cat, special) {
    score += 1;
    scoreEl.textContent = "Cats spotted: " + score;

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

  scheduleNextSpawn();
})();
