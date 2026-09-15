import sharp from "sharp";
import { mkdirSync } from "fs";

const INK = "#1f2a21";
const PAPER = "#eef0ea";
const FOREST = "#5fa97d";
const OCHRE = "#d6ac66";

// Ledger-inspired mark: ruled paper lines with a couple of "amount" accent
// chips, drawn as pure shapes so it renders identically everywhere (no
// dependency on a specific font being available to the SVG rasterizer).
function svgIcon({ size, padding }) {
  const inner = size - padding * 2;
  const lineX0 = padding + inner * 0.14;
  const lineX1 = padding + inner * 0.62;
  const chipX0 = padding + inner * 0.68;
  const chipX1 = padding + inner * 0.86;
  const rows = [0.32, 0.44, 0.56, 0.68].map((f) => padding + inner * f);
  const strokeW = Math.max(2, inner * 0.028);
  const chipH = inner * 0.06;

  const lines = rows
    .map(
      (y, i) =>
        `<line x1="${lineX0}" y1="${y}" x2="${lineX1}" y2="${y}" stroke="${PAPER}" stroke-width="${strokeW}" stroke-linecap="round" opacity="${i === 1 || i === 3 ? 0.55 : 0.9}"/>`,
    )
    .join("");

  const chips = [1, 3]
    .map((i) => {
      const y = rows[i] - chipH / 2;
      const color = i === 1 ? FOREST : OCHRE;
      return `<rect x="${chipX0}" y="${y}" width="${chipX1 - chipX0}" height="${chipH}" rx="${chipH / 2}" fill="${color}"/>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${INK}"/>
  ${lines}
  ${chips}
</svg>`;
}

async function render(svg, size, outPath) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(outPath);
  console.log("wrote", outPath);
}

const outDir = new URL("../public/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
mkdirSync(outDir, { recursive: true });

await render(svgIcon({ size: 512, padding: 512 * 0.16 }), 192, outDir + "icon-192.png");
await render(svgIcon({ size: 512, padding: 512 * 0.16 }), 512, outDir + "icon-512.png");
// Maskable: keep content inside the safe zone (~center 80%) since OS masks crop the edges.
await render(svgIcon({ size: 512, padding: 512 * 0.24 }), 512, outDir + "icon-maskable-512.png");
// Apple touch icon: iOS ignores alpha and applies its own rounding, no extra padding needed.
await render(svgIcon({ size: 512, padding: 512 * 0.16 }), 180, outDir + "apple-touch-icon.png");
await render(svgIcon({ size: 512, padding: 512 * 0.16 }), 32, outDir + "favicon-32.png");
