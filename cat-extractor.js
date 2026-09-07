// Optional cat extraction for Chonk Patrol.
// When CHONK_CONFIG.extractCats is true, this cuts the cat out of each photo
// (removing the background) using TensorFlow.js DeepLab semantic segmentation,
// which runs entirely in the browser. Everything degrades gracefully: if the
// libraries can't load, or a photo has no detectable cat, the original image
// is used unchanged.

(function () {
  "use strict";

  const TF_URL = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js";
  const DEEPLAB_URL = "https://cdn.jsdelivr.net/npm/@tensorflow-models/deeplab@0.2.2/dist/deeplab.min.js";
  const MIN_CAT_AREA = 0.01; // require the cat to cover at least 1% of pixels
  const CROP_PADDING = 6;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error("failed to load " + src)); };
      document.head.appendChild(s);
    });
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error("failed to load " + src)); };
      img.src = src;
    });
  }

  async function extractOne(model, src) {
    const img = await loadImage(src);
    const result = await model.segment(img);
    const catColor = result.legend && result.legend.cat;
    if (!catColor) return src;

    const width = result.width;
    const height = result.height;
    const map = result.segmentationMap;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    let minX = width, minY = height, maxX = -1, maxY = -1, catPixels = 0;
    for (let i = 0; i < width * height; i++) {
      const off = i * 4;
      const isCat =
        map[off] === catColor[0] &&
        map[off + 1] === catColor[1] &&
        map[off + 2] === catColor[2];
      if (isCat) {
        catPixels++;
        const x = i % width;
        const y = (i / width) | 0;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      } else {
        imageData.data[off + 3] = 0;
      }
    }

    if (catPixels < width * height * MIN_CAT_AREA) return src;

    ctx.putImageData(imageData, 0, 0);

    const cx = Math.max(minX - CROP_PADDING, 0);
    const cy = Math.max(minY - CROP_PADDING, 0);
    const cw = Math.min(maxX + CROP_PADDING, width - 1) - cx + 1;
    const ch = Math.min(maxY + CROP_PADDING, height - 1) - cy + 1;

    const out = document.createElement("canvas");
    out.width = cw;
    out.height = ch;
    out.getContext("2d").drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
    return out.toDataURL("image/png");
  }

  window.CHONK_EXTRACTOR = {
    extract: async function (paths) {
      try {
        if (!window.tf) await loadScript(TF_URL);
        if (!window.deeplab) await loadScript(DEEPLAB_URL);
        const model = await window.deeplab.load({ base: "pascal", quantizationBytes: 2 });

        const out = [];
        for (const path of paths) {
          try {
            out.push(await extractOne(model, path));
          } catch (err) {
            out.push(path);
          }
        }
        return out;
      } catch (err) {
        return paths;
      }
    },
  };
})();
