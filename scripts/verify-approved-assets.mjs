import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve("public/assets/pixel/approved");
const expected = {
  "character-walk-8dir.png": [256, 384], "character-idle-8dir.png": [128, 384], "character-wave-south.png": [320, 48],
  "character-sit-down-south.png": [192, 48], "character-sit-loop-south.png": [128, 48], "character-stand-up-south.png": [192, 48], "character-portal-react.png": [256, 48],
  "island-terrain-tileset.png": [256, 256], "water-animation.png": [128, 32], "foam-animation.png": [128, 32], "island-decoration-tileset.png": [256, 64], "island-tree-tileset.png": [192, 96],
  "closed-island-example.png": [768, 768], "island-collision-preview.png": [768, 768], "portal-transition-frames.png": [512, 64],
  ...Object.fromEntries(["home", "about", "skills", "projects", "contact"].flatMap((id) => [
    [`building-${id}.png`, [192, 160]], [`building-${id}-portal.png`, [192, 160]], [`building-${id}-shadow.png`, [192, 160]],
    [`building-${id}-collision.png`, [192, 160]], [`building-${id}-interaction.png`, [192, 160]], [`sign-${id}.png`, [72, 24]],
  ])),
  ...Object.fromEntries(["home-north", "skills-northeast", "contact-southeast", "projects-southwest", "about-northwest"].map((id) => [`wayfinding-${id}.png`, [64, 64]])),
};

const readPng = (file) => {
  const buffer = readFileSync(resolve(root, file));
  const header = buffer.subarray(0, 8).toString("hex");
  if (header !== "89504e470d0a1a0a") throw new Error(`${file}: not a PNG`);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), colorType: buffer[25] };
};

for (const [file, [width, height]] of Object.entries(expected)) {
  const image = readPng(file);
  if (image.width !== width || image.height !== height) throw new Error(`${file}: expected ${width}x${height}, found ${image.width}x${image.height}`);
  if (![4, 6].includes(image.colorType)) throw new Error(`${file}: expected alpha-capable PNG color type, found ${image.colorType}`);
}
for (const file of ["character-animation-manifest.json", "island-tile-manifest.json", "building-asset-manifest.json"]) JSON.parse(readFileSync(resolve(root, file), "utf8"));
console.log(`Verified ${Object.keys(expected).length} alpha-capable PNGs and 3 JSON manifests.`);
