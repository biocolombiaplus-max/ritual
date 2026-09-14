import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "seed");
mkdirSync(outDir, { recursive: true });

const GRADIENTS = [
  ["#f6e0d8", "#a8664e"],
  ["#edc7ba", "#c17d63"],
  ["#e2ac9a", "#8a4f3b"],
  ["#f3d9cd", "#b0705a"],
];

function productSvg({ id, label, angle = 135 }) {
  const [c1, c2] = GRADIENTS[id % GRADIENTS.length];
  return `<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="#171217"/>
  <rect x="40" y="40" width="720" height="720" rx="24" fill="url(#g)" opacity="0.92"/>
  <circle cx="400" cy="340" r="130" fill="#ffffff" opacity="0.14"/>
  <path d="M400 250c-16-40-52-66-88-60-14 2-26 10-32 22-7 14 0 28 15 31 22 4 49-14 63-33" stroke="#ffffff" stroke-opacity="0.5" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M400 250c16-40 52-66 88-60 14 2 26 10 32 22 7 14 0 28-15 31-22 4-49-14-63-33" stroke="#ffffff" stroke-opacity="0.5" stroke-width="6" fill="none" stroke-linecap="round"/>
  <text x="400" y="620" font-family="Georgia, 'Playfair Display', serif" font-size="34" fill="#2a1f22" text-anchor="middle" opacity="0.85">${label}</text>
  <text x="400" y="660" font-family="Arial, sans-serif" font-size="16" letter-spacing="4" fill="#2a1f22" text-anchor="middle" opacity="0.55">RITUAL.COM</text>
</svg>`;
}

function heroSvg() {
  return `<svg width="1600" height="900" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1c1620"/>
      <stop offset="55%" stop-color="#120f13"/>
      <stop offset="100%" stop-color="#221a1f"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#d29a84" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#d29a84" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#glow)"/>
</svg>`;
}

function bannerSvg() {
  return `<svg width="1600" height="700" viewBox="0 0 1600 700" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2a1f24"/>
      <stop offset="100%" stop-color="#171217"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="700" fill="url(#bg2)"/>
</svg>`;
}

const categories = [
  "Vibradores",
  "Lubricantes y Aceites",
  "Juguetes de Pareja",
  "Bienestar Femenino",
  "Bienestar Masculino",
  "Bondage y Accesorios",
  "Lenceria",
];

let id = 0;
for (const cat of categories) {
  for (let v = 1; v <= 2; v++) {
    const filename = `${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${v}.svg`;
    writeFileSync(path.join(outDir, filename), productSvg({ id, label: cat, angle: 120 + id * 15 }));
    id++;
  }
}

writeFileSync(path.join(outDir, "hero.svg"), heroSvg());
writeFileSync(path.join(outDir, "banner.svg"), bannerSvg());

console.log(`Generados ${id} placeholders de producto + hero + banner en public/seed`);
