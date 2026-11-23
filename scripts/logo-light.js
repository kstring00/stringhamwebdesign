/**
 * Makes the light version of the logo, for the dark site: the same lockup,
 * with the dark navy of the word "Stringham" turned to the site's cream.
 * The blue S mark and the blue "WEB DESIGN" line are left exactly as they are.
 *
 *   node scripts/logo-light.js
 *
 * Reads public/brand/logo-lockup.png and logo-lockup@3x.png; writes
 * logo-lockup-light.png / .webp and logo-lockup-light@3x.png / .webp.
 * A pixel counts as "navy" by how dark and how grey-blue it is, with a soft
 * edge between the two so anti-aliased edges stay smooth.
 */
const path = require('path');
const sharp = require('sharp');

const DIR = path.join(__dirname, '..', 'public', 'brand');
const CREAM = [243, 231, 211];

(async () => {
  for (const name of ['logo-lockup', 'logo-lockup@3x']) {
    const { data, info } = await sharp(path.join(DIR, `${name}.png`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    // The S mark is the left 27% of the lockup: it is not touched.
    const from = Math.round(info.width * 0.27);
    for (let i = 0; i < data.length; i += 4) {
      if ((i / 4) % info.width < from) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const light = (max + min) / 510;
      const sat = max === 0 ? 0 : (max - min) / max;
      // Navy: dark. The brand blues are both lighter and far more saturated in value terms.
      const t = Math.min(1, Math.max(0, (0.42 - light) / 0.14)) * (max < 150 ? 1 : Math.max(0, 1 - (max - 150) / 40)) * (sat > 0.92 && max > 110 ? 0 : 1);
      if (t <= 0) continue;
      data[i] = Math.round(r + (CREAM[0] - r) * t);
      data[i + 1] = Math.round(g + (CREAM[1] - g) * t);
      data[i + 2] = Math.round(b + (CREAM[2] - b) * t);
    }
    const out = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
    await out.clone().png({ compressionLevel: 9 }).toFile(path.join(DIR, `${name.replace('logo-lockup', 'logo-lockup-light')}.png`));
    await out.clone().webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(DIR, `${name.replace('logo-lockup', 'logo-lockup-light')}.webp`));
    console.log(name, info.width, info.height);
  }
})();
