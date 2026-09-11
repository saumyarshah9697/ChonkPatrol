#!/usr/bin/env node
/*
 * Batch cat cutter for Chonk Patrol.
 *
 * Drop raw cat photos into raw-cats/ (jpg/png/webp), then run:
 *   node cut-cats.cjs
 *
 * Each photo gets its cat cut out (background removed, cropped) and saved
 * as assets/cats/<name>-cut.png. Photos where no cat is detected are
 * reported and skipped. At the end the script prints the catImages list
 * to paste into config.js.
 *
 * With --write-config (used by add-cats.sh) this run's cutouts are MERGED
 * into the existing catImages list in config.js (existing entries stay,
 * duplicates skipped) — the cat pool only ever grows.
 *
 * Uses the game's own cat-extractor.js inside headless Chromium (same
 * Playwright install used elsewhere on this machine). Needs internet the
 * first time for the segmentation model.
 */

"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execSync, spawn } = require("child_process");

const REPO_DIR = __dirname;
const POSITIONAL = process.argv.slice(2).filter(function (a) { return a.indexOf("--") !== 0; });
const RAW_DIR = POSITIONAL[0] || path.join(REPO_DIR, "raw-cats");
const OUT_DIR = path.join(REPO_DIR, "assets", "cats");
const PORT = 8873;
const EXTENSIONS = /\.(jpe?g|png|webp)$/i;

function findPlaywright() {
  try {
    return require.resolve("playwright");
  } catch (err) { /* not on the direct require path */ }
  const npxCache = path.join(os.homedir(), ".npm", "_npx");
  if (fs.existsSync(npxCache)) {
    for (const entry of fs.readdirSync(npxCache)) {
      const candidate = path.join(npxCache, entry, "node_modules", "playwright");
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  console.error("Playwright not found. Run: npx playwright install chromium");
  process.exit(3);
}

async function main() {
  if (!fs.existsSync(RAW_DIR)) {
    fs.mkdirSync(RAW_DIR, { recursive: true });
    console.log("Created " + RAW_DIR);
    console.log("Drop raw cat photos in there, then run this again.");
    return;
  }

  const rawFiles = fs.readdirSync(RAW_DIR).filter((f) => EXTENSIONS.test(f));
  if (rawFiles.length === 0) {
    console.log("No photos found in " + RAW_DIR + " (jpg/png/webp).");
    return;
  }
  console.log(rawFiles.length + " photo(s) to process.");

  const server = spawn("python3", ["-m", "http.server", String(PORT)], {
    cwd: REPO_DIR,
    stdio: "ignore",
  });

  const { chromium } = require(findPlaywright());
  const browser = await chromium.launch();
  const harness = path.join(REPO_DIR, "cutter-tmp.html");
  fs.writeFileSync(harness, '<!DOCTYPE html><script src="cat-extractor.js"></script>');

  try {
    const page = await browser.newPage();
    await page.goto("http://localhost:" + PORT + "/cutter-tmp.html", {
      waitUntil: "load",
    });

    fs.mkdirSync(OUT_DIR, { recursive: true });
    const written = [];
    const skipped = [];

    for (const file of rawFiles) {
      process.stdout.write("  " + file + " ... ");
      const rawUrl = "raw-cats/" + encodeURIComponent(file);
      const result = await page.evaluate(function (url) {
        return window.CHONK_EXTRACTOR.extract([url]);
      }, rawUrl);

      const out = result[0];
      if (!out || !out.startsWith("data:image/png;base64,")) {
        console.log("no cat detected, skipped");
        skipped.push(file);
        continue;
      }

      const name = file.replace(EXTENSIONS, "") + "-cut.png";
      const target = path.join(OUT_DIR, name);
      fs.writeFileSync(target, Buffer.from(out.split(",")[1], "base64"));
      const kb = Math.round(fs.statSync(target).size / 1024);
      console.log("-> assets/cats/" + name + " (" + kb + " KB)");
      written.push(name);
    }

    console.log("");
    console.log("Done: " + written.length + " cutout(s), " + skipped.length + " skipped.");
    if (skipped.length > 0) {
      console.log("Skipped (no cat found): " + skipped.join(", "));
    }
    if (written.length > 0) {
      const list = written.sort().map(function (f) { return "assets/cats/" + f; });
      if (process.argv.includes("--write-config")) {
        const configPath = path.join(REPO_DIR, "config.js");
        const config = fs.readFileSync(configPath, "utf8");
        const current = config.match(/catImages: \[([\s\S]*?)\]/)[1]
          .split("\n")
          .map(function (l) { return (l.match(/"([^"]+)"/) || [])[1]; })
          .filter(Boolean);
        const merged = current.concat(list.filter(function (p) { return current.indexOf(p) === -1; }));
        const block = "catImages: [\n" +
          merged.map(function (p) { return '    "' + p + '",'; }).join("\n") +
          "\n  ]";
        const updated = config.replace(/catImages: \[[\s\S]*?\]/, block);
        fs.writeFileSync(configPath, updated);
        execSync("node --check " + JSON.stringify(configPath));
        console.log("");
        console.log("config.js catImages updated: " + merged.length + " cats (" +
          (merged.length - current.length) + " added).");
      } else {
        const all = fs.readdirSync(OUT_DIR).filter((f) => /\.(png|svg)$/i.test(f)).sort();
        console.log("");
        console.log("catImages list for config.js (all files currently in assets/cats/):");
        console.log("  catImages: [");
        for (const f of all) {
          console.log('    "assets/cats/' + f + '",');
        }
        console.log("  ],");
      }
    }
  } finally {
    await browser.close();
    server.kill();
    try { fs.unlinkSync(harness); } catch (err) { /* already gone */ }
  }
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
