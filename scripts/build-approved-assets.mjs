import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// This is deliberately a deterministic pixel-art source build. The approved
// Gemini boards are art direction, not importable assets: this generator keeps
// every live asset on an exact grid with real alpha and documented anchors.
const OUT = resolve("/tmp/portfolio-approved-assets-svg");
const PUBLIC = resolve("public/assets/pixel/approved");
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(PUBLIC, { recursive: true });

const C = {
  outline: "#171b24", hair: "#1e1e24", hairHi: "#3a3f4c", skin: "#d99e78", skinShadow: "#b47656",
  jacket: "#434c5e", jacketHi: "#4c566a", shirt: "#bf616a", pants: "#d8dee9", pantsShadow: "#838a9b",
  shoe: "#eceff4", shoeShadow: "#9a91b3", grass: "#4caf50", grassDark: "#2f7c44", grassHi: "#86d765",
  path: "#e0ad72", pathDark: "#bd7e4e", rock: "#6b6b7f", rockDark: "#44465b", rockHi: "#9aa1b8",
  water: "#297eac", waterDeep: "#18577e", waterHi: "#8be3ef", foam: "#e8fbff", wood: "#8b5a2b",
  woodHi: "#c89155", roof: "#9b4b45", roofDark: "#5b2c38", portal: "#7627c9", portalHi: "#d08cff",
};
const rect = (x, y, w, h, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const svg = (w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${inner}</svg>`;
const save = (name, w, h, inner) => writeFileSync(resolve(OUT, `${name}.svg`), svg(w, h, inner));
const tile = (index, fn) => `<g transform="translate(${(index % 8) * 32} ${Math.floor(index / 8) * 32})">${fn()}</g>`;
const noise = (seed, colors, count = 11) => Array.from({ length: count }, (_, i) => {
  const x = (seed * 7 + i * 11) % 30 + 1, y = (seed * 13 + i * 7) % 29 + 1;
  return rect(x, y, i % 3 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1, colors[i % colors.length]);
}).join("");

function character(dx, dy, direction, phase = 0, action = "walk") {
  const back = direction === "north" || direction === "northwest" || direction === "northeast";
  const side = direction.includes("west") ? -1 : direction.includes("east") ? 1 : 0;
  const gait = [0, -1, 0, 1, 0, 1, 0, -1][phase % 8];
  const liftL = [0, 0, 2, 1, 0, 0, 1, 2][phase % 8];
  const liftR = [0, 1, 2, 0, 0, 1, 2, 0][phase % 8];
  const bob = action === "idle" ? (phase % 4 === 2 ? 1 : 0) : [0, 1, 1, 0, 0, 1, 1, 0][phase % 8];
  let p = `<g transform="translate(${dx} ${dy + bob})">`;
  // hair and head
  p += rect(9 + side, 3, 14, 7, C.hair) + rect(7 + side, 7, 18, 8, C.hair);
  p += rect(10 + side, 2, 7, 3, C.hairHi) + rect(18 + side, 5, 4, 3, C.hairHi);
  if (back) {
    p += rect(10 + side, 12, 13, 7, C.hair) + rect(12 + side, 18, 9, 2, C.skinShadow);
  } else {
    p += rect(10 + side, 11, 12, 9, C.skin) + rect(8 + side, 12, 3, 6, C.hair) + rect(22 + side, 12, 3, 6, C.hair);
    if (side === 0) p += rect(12, 14, 2, 2, "#f5f0e8") + rect(19, 14, 2, 2, "#f5f0e8") + rect(14, 18, 6, 2, "#38262d") + rect(16, 20, 3, 2, "#38262d");
    else p += rect(side < 0 ? 11 : 20, 14, 2, 2, "#f5f0e8") + rect(side < 0 ? 12 : 17, 18, 4, 2, "#38262d") + rect(side < 0 ? 14 : 18, 20, 2, 2, "#38262d");
  }
  // torso and arms
  p += rect(8, 22, 16, 11, C.jacket) + rect(10, 23, 4, 9, C.jacketHi) + rect(15, 23, 4, 9, C.shirt) + rect(19, 23, 3, 9, C.jacketHi);
  const armL = gait * 2, armR = -gait * 2;
  if (action === "wave") {
    const waveY = phase < 2 ? 20 - phase * 4 : phase < 7 ? 8 : 8 + (phase - 6) * 4;
    p += rect(5, waveY, 4, 10, C.jacketHi) + rect(5, waveY - 2, 4, 3, C.skin);
  } else p += rect(5 + armL, 24 + Math.max(0, -gait), 4, 9, C.jacketHi) + rect(23 + armR, 24 + Math.max(0, gait), 4, 9, C.jacket);
  if (action === "sit") {
    p += rect(9, 33, 9, 5, C.pants) + rect(18, 35, 9, 4, C.pantsShadow) + rect(18, 39, 9, 4, C.shoe) + rect(9, 38, 8, 4, C.shoeShadow);
  } else {
    p += rect(10 + gait, 33 - liftL, 6, 10, C.pants) + rect(17 - gait, 33 - liftR, 6, 10, C.pantsShadow);
    p += rect(9 + gait, 42 - liftL, 8, 4, C.shoe) + rect(17 - gait, 42 - liftR, 8, 4, C.shoe) + rect(9 + gait, 46 - liftL, 8, 1, C.shoeShadow) + rect(17 - gait, 46 - liftR, 8, 1, C.shoeShadow);
  }
  return `${p}</g>`;
}

const dirs = ["south", "southwest", "west", "northwest", "north", "northeast", "east", "southeast"];
save("character-walk-8dir", 256, 384, dirs.map((d, row) => Array.from({ length: 8 }, (_, col) => character(col * 32, row * 48, d, col)).join("")).join(""));
save("character-idle-8dir", 128, 384, dirs.map((d, row) => Array.from({ length: 4 }, (_, col) => character(col * 32, row * 48, d, col, "idle")).join("")).join(""));
save("character-wave-south", 320, 48, Array.from({ length: 10 }, (_, col) => character(col * 32, 0, "south", col, "wave")).join(""));
save("character-sit-down-south", 192, 48, Array.from({ length: 6 }, (_, col) => character(col * 32, 0, "south", col, col < 4 ? "walk" : "sit")).join(""));
save("character-sit-loop-south", 128, 48, Array.from({ length: 4 }, (_, col) => character(col * 32, 0, "south", col, "sit")).join(""));
save("character-stand-up-south", 192, 48, Array.from({ length: 6 }, (_, col) => character(col * 32, 0, "south", 5 - col, col < 2 ? "sit" : "walk")).join(""));
save("character-portal-react", 256, 48, Array.from({ length: 8 }, (_, col) => {
  const aura = rect(col * 32 + 4, 5, 24, 40, C.portal, `opacity="${.12 + col * .05}"`) + rect(col * 32 + 8, 10, 16, 30, C.portalHi, `opacity="${.1 + col * .04}"`);
  return aura + character(col * 32, 0, "south", col, "idle");
}).join(""));

function grass(seed) { return rect(0, 0, 32, 32, C.grass) + noise(seed, [C.grassDark, C.grassHi], 15) + (seed % 3 === 0 ? rect(16, 17, 2, 3, "#f7fb88") + rect(15, 18, 4, 1, "#f7fb88") : ""); }
function path(seed) { return rect(0, 0, 32, 32, C.path) + noise(seed, [C.pathDark, "#f1c486"], 9); }
function cliff(seed) { return rect(0, 0, 32, 10, C.grass) + noise(seed, [C.grassDark, C.grassHi], 5) + rect(0, 10, 32, 22, C.rockDark) + rect(0, 11, 32, 3, C.rockHi) + noise(seed + 3, [C.rock, C.rockHi, "#34354a"], 14); }
function ocean(seed) { return rect(0, 0, 32, 32, C.water) + noise(seed, [C.waterDeep, C.waterHi, "#54bddd"], 12) + rect((seed * 5) % 20, 8 + (seed * 3) % 15, 8, 1, C.waterHi); }
const terrainTiles = Array.from({ length: 64 }, (_, i) => tile(i, () => {
  if (i < 8) return grass(i);
  if (i < 16) return path(i);
  if (i < 32) return cliff(i);
  if (i < 48) return ocean(i);
  if (i < 56) return grass(i) + (i % 2 ? rect(11, 13, 4, 5, "#f7fb88") : rect(12, 13, 3, 7, C.grassDark));
  return cliff(i) + rect(4 + (i % 3) * 6, 16, 6, 5, C.rockHi);
})).join("");
save("island-terrain-tileset", 256, 256, terrainTiles);
save("water-animation", 128, 32, Array.from({ length: 4 }, (_, i) => `<g transform="translate(${i * 32} 0)">${ocean(i + 20)}${rect(5 + i * 2, 15, 12, 2, C.foam, `opacity=".7"`)}</g>`).join(""));
save("foam-animation", 128, 32, Array.from({ length: 4 }, (_, i) => `<g transform="translate(${i * 32} 0)">${ocean(i + 40)}${rect(0, 5 + i % 2, 32, 5, C.foam)}${rect(4 + i * 2, 10, 18, 2, C.waterHi)}</g>`).join(""));

function prop(i) {
  const base = rect(0, 0, 32, 32, "transparent");
  const kind = i % 12;
  if (kind === 0) return base + rect(6, 13, 20, 15, C.rockDark) + rect(8, 10, 16, 14, C.rock) + rect(11, 8, 9, 5, C.rockHi);
  if (kind === 1) return base + rect(3, 17, 26, 5, C.wood) + rect(4, 13, 24, 4, C.woodHi) + rect(6, 22, 4, 8, C.woodDark || C.wood) + rect(23, 22, 4, 8, C.woodDark || C.wood);
  if (kind === 2) return base + rect(7, 17, 18, 8, C.wood) + rect(8, 14, 16, 5, C.woodHi) + rect(11, 25, 4, 5, C.woodDark || C.wood) + rect(18, 25, 4, 5, C.woodDark || C.wood);
  if (kind === 3) return base + rect(14, 8, 4, 22, C.wood) + rect(6, 9, 20, 8, C.woodHi) + rect(8, 11, 16, 3, C.wood);
  if (kind === 4) return base + rect(5, 11, 22, 18, C.wood) + rect(7, 13, 18, 14, C.woodHi) + rect(9, 15, 14, 2, C.wood) + rect(9, 23, 14, 2, C.wood);
  if (kind === 5) return base + rect(10, 17, 12, 11, C.woodHi) + rect(8, 21, 16, 6, C.wood) + rect(12, 13, 8, 5, "#cf7e4b");
  if (kind === 6) return base + rect(13, 10, 6, 19, C.wood) + rect(10, 8, 12, 12, "#e9c96a") + rect(12, 10, 8, 8, "#fff1a5");
  if (kind === 7) return base + rect(7, 16, 18, 11, C.grassDark) + rect(5, 13, 22, 10, C.grass) + noise(i, [C.grassHi, "#f7fb88", "#ff8cb7"], 10);
  if (kind === 8) return base + rect(10, 14, 12, 14, C.grassDark) + rect(7, 10, 18, 12, C.grass) + noise(i, [C.grassHi, "#f7fb88"], 10);
  if (kind === 9) return base + rect(9, 19, 14, 9, C.grassDark) + rect(6, 12, 20, 12, C.grass) + rect(10, 8, 12, 7, C.grassHi);
  if (kind === 10) return base + rect(4, 23, 24, 5, C.rockDark) + rect(7, 17, 18, 8, C.rock);
  return base + rect(12, 8, 8, 20, C.wood) + rect(7, 6, 18, 5, C.woodHi);
}
save("island-decoration-tileset", 256, 64, Array.from({ length: 16 }, (_, i) => `<g transform="translate(${(i % 8) * 32} ${Math.floor(i / 8) * 32})">${prop(i)}</g>`).join(""));

const buildingSpec = [
  ["home", "south", "#9b4b45"], ["about", "southeast", "#7a5d9b"], ["skills", "southwest", "#4d7690"], ["projects", "northeast", "#a26b3f"], ["contact", "northwest", "#4d8b76"],
];
function building(name, face, roof, portal = false) {
  const w = 192, h = 160;
  const side = face.includes("west") ? -1 : face.includes("east") ? 1 : 0;
  const topDoor = face.includes("north"), bottomDoor = face.includes("south");
  const doorX = side < 0 ? 25 : side > 0 ? 143 : 80;
  const doorY = topDoor ? 20 : bottomDoor ? 101 : 101;
  let p = rect(24, 46, 144, 90, C.outline) + rect(28, 50, 136, 82, C.woodHi) + rect(32, 56, 128, 72, "#c58d5b");
  // roof has chunky stepped edges rather than rotated anti-aliased geometry
  p += rect(48, 16, 96, 8, C.roofDark) + rect(40, 24, 112, 12, roof) + rect(32, 36, 128, 14, roof) + rect(24, 48, 144, 9, C.roofDark);
  p += rect(39, 26, 114, 3, "#d78766") + rect(47, 18, 98, 3, "#d78766");
  p += rect(48, 72, 22, 20, C.rock) + rect(122, 72, 22, 20, C.rock) + rect(52, 76, 14, 12, "#c9d1dc") + rect(126, 76, 14, 12, "#c9d1dc");
  p += rect(20, 132, 152, 8, C.rockDark) + rect(30, 128, 132, 6, C.rock);
  p += rect(doorX, doorY, 32, 42, C.outline) + rect(doorX + 4, doorY + 4, 24, 38, portal ? C.portal : C.wood);
  if (portal) p += rect(doorX + 8, doorY + 6, 16, 32, C.portalHi) + rect(doorX + 11, doorY + 8, 10, 28, C.portal);
  else p += rect(doorX + 14, doorY + 6, 3, 34, C.woodHi) + rect(doorX + 19, doorY + 21, 3, 3, "#f7d47c");
  // sign is above door, never overlap portal
  const signY = Math.max(4, doorY - 20);
  p += rect(doorX - 12, signY, 56, 14, C.outline) + rect(doorX - 10, signY + 2, 52, 10, C.wood) + rect(doorX - 8, signY + 4, 48, 6, "#e8c789");
  return { w, h, p, doorX: doorX + 16, doorY: doorY + 42 };
}
for (const [id, face, roof] of buildingSpec) {
  const normal = building(id, face, roof);
  const active = building(id, face, roof, true);
  save(`building-${id}`, normal.w, normal.h, normal.p);
  save(`building-${id}-portal`, active.w, active.h, active.p);
  save(`building-${id}-shadow`, normal.w, normal.h, `<g opacity=".4" transform="translate(10 10)">${normal.p.replaceAll(/#[0-9a-fA-F]{6}/g, "#18202f")}</g>`);
  // Debug-friendly masks are separate alpha PNGs, never rendered in the world.
  const door = building(id, face, roof);
  const doorLeft = door.doorX - 16, doorTop = door.doorY - 42, doorBottom = doorTop + 42;
  const maskParts = [
    rect(24, 46, 144, Math.max(0, doorTop - 46), "#e25252", `opacity=".9"`),
    rect(24, Math.max(46, doorTop), Math.max(0, doorLeft - 24), Math.max(0, Math.min(136, doorBottom) - Math.max(46, doorTop)), "#e25252", `opacity=".9"`),
    rect(doorLeft + 32, Math.max(46, doorTop), Math.max(0, 168 - (doorLeft + 32)), Math.max(0, Math.min(136, doorBottom) - Math.max(46, doorTop)), "#e25252", `opacity=".9"`),
    rect(24, Math.max(46, doorBottom), 144, Math.max(0, 136 - Math.max(46, doorBottom)), "#e25252", `opacity=".9"`),
  ].join("");
  save(`building-${id}-collision`, normal.w, normal.h, maskParts);
  save(`building-${id}-interaction`, normal.w, normal.h, rect(door.doorX - 20, door.doorY - 10, 40, 18, "#f4cf54", `opacity=".95"`));
  const signBody = rect(4, 3, 64, 18, C.outline) + rect(6, 5, 60, 14, C.wood) + rect(8, 7, 56, 10, "#e8c789") + rect(14, 21, 3, 3, C.woodDark || C.wood) + rect(55, 21, 3, 3, C.woodDark || C.wood);
  save(`sign-${id}`, 72, 24, signBody);
}
save("portal-transition-frames", 512, 64, Array.from({ length: 8 }, (_, i) => `<g transform="translate(${i * 64} 0)">${rect(7, 4, 50, 56, C.portal, `opacity="${.28 + i * .08}"`)}${rect(13, 7, 38, 50, C.portalHi, `opacity="${.2 + i * .06}"`)}${noise(i, [C.portal, C.portalHi], 15)}</g>`).join(""));

const wayfinding = ["home-north", "skills-northeast", "contact-southeast", "projects-southwest", "about-northwest"];
for (const id of wayfinding) {
  const direction = id.split("-").slice(1).join("-");
  let p = rect(30, 30, 4, 30, C.wood) + rect(28, 58, 8, 4, C.woodDark || C.wood);
  if (direction === "north") p += rect(24, 16, 16, 26, C.outline) + rect(26, 18, 12, 22, C.woodHi) + rect(20, 16, 24, 8, C.woodHi) + rect(24, 8, 16, 8, C.woodHi);
  else if (direction === "northeast") p += [[10,36],[16,30],[22,24],[28,18],[34,12],[40,6]].map(([x,y]) => rect(x,y,12,8,C.woodHi)).join("") + rect(46,4,10,12,C.woodHi);
  else if (direction === "southeast") p += [[10,10],[16,16],[22,22],[28,28],[34,34],[40,40]].map(([x,y]) => rect(x,y,12,8,C.woodHi)).join("") + rect(46,42,10,12,C.woodHi);
  else if (direction === "southwest") p += [[42,10],[36,16],[30,22],[24,28],[18,34],[12,40]].map(([x,y]) => rect(x,y,12,8,C.woodHi)).join("") + rect(8,42,10,12,C.woodHi);
  else p += [[42,36],[36,30],[30,24],[24,18],[18,12],[12,6]].map(([x,y]) => rect(x,y,12,8,C.woodHi)).join("") + rect(8,4,10,12,C.woodHi);
  save(`wayfinding-${id}`, 64, 64, p);
}

function tree(frame) {
  const canopy = [C.grassDark, "#257345", "#3d9a57"][frame % 3];
  let p = rect(28, 48, 8, 42, C.wood) + rect(24, 70, 16, 18, "#6b4328");
  p += rect(12, 20, 40, 34, C.outline) + rect(8, 28, 48, 26, C.outline) + rect(16, 8, 32, 28, C.outline);
  p += rect(14, 22, 36, 30, canopy) + rect(10, 30, 44, 20, canopy) + rect(18, 10, 28, 26, canopy);
  p += noise(frame + 8, [C.grassHi, "#86c95d", "#e2c95e"], 24);
  return p;
}
save("island-tree-tileset", 192, 96, [0,1,2].map((f) => `<g transform="translate(${f * 64} 0)">${tree(f)}</g>`).join(""));

const characterManifest = { manifest_version: "1.3", character: "sandip_developer", frame_width: 32, frame_height: 48, anchor: { x: 16, y: 46 }, directions: dirs, animations: { walk: { file: "character-walk-8dir.png", columns: 8, rows: 8, frames_per_direction: 8, fps: 10, loop: true }, idle: { file: "character-idle-8dir.png", columns: 4, rows: 8, frames_per_direction: 4, fps: 3, loop: true }, wave_south: { file: "character-wave-south.png", frames: 6, fps: 8, loop: false }, sit_down: { file: "character-sit-down-south.png", frames: 6, fps: 8, loop: false }, sit_loop: { file: "character-sit-loop-south.png", frames: 4, fps: 3, loop: true }, stand_up: { file: "character-stand-up-south.png", frames: 6, fps: 8, loop: false }, portal_react: { file: "character-portal-react.png", frames: 8, fps: 10, loop: false } } };
const terrainManifest = {
  manifest_version: "2.2", tile_size: 32,
  tilesets: { terrain: "island-terrain-tileset.png", water_animation: "water-animation.png", foam_animation: "foam-animation.png", decorations: "island-decoration-tileset.png", trees: "island-tree-tileset.png" },
  layers: ["ocean", "ocean_animation", "foam", "cliff_base", "cliff_face", "cliff_top", "grass", "paths", "decorations", "player", "foreground"],
  walkable: ["grass:0,0-7,0", "paths:0,1-7,1", "grass_lip:0,2"],
  blocked: ["cliffs:1,2-7,3", "ocean:0,4-7,5", "shoreline:0,6-7,7"],
  animated: [{ file: "water-animation.png", frames: 4, fps: 3 }, { file: "foam-animation.png", frames: 4, fps: 4 }],
  collision_rules: { grass_lip: null, cliff: "blocked", foam: "blocked", ocean: "blocked", paths: null, tree_trunk: { x: 24, y: 62, width: 16, height: 28 } },
};
const buildingManifest = { manifest_version: "1.1", buildings: buildingSpec.map(([id, face]) => { const item = building(id, face, "#000"); return { id, door_facing: face, normal_file: `building-${id}.png`, portal_file: `building-${id}-portal.png`, shadow_file: `building-${id}-shadow.png`, collision_mask: `building-${id}-collision.png`, interaction_mask: `building-${id}-interaction.png`, sign_file: `sign-${id}.png`, origin: { x: 96, y: 140 }, door_center: { x: item.doorX, y: item.doorY } }; }), wayfinding: wayfinding.map((id) => ({ id, file: `wayfinding-${id}.png`, collision_box: { x: 28, y: 22, width: 8, height: 40 } })), portal: { transition_file: "portal-transition-frames.png", frame_width: 64, frame_height: 64, frames: 8, fps: 10 } };
writeFileSync(resolve(PUBLIC, "character-animation-manifest.json"), `${JSON.stringify(characterManifest, null, 2)}\n`);
writeFileSync(resolve(PUBLIC, "island-tile-manifest.json"), `${JSON.stringify(terrainManifest, null, 2)}\n`);
writeFileSync(resolve(PUBLIC, "building-asset-manifest.json"), `${JSON.stringify(buildingManifest, null, 2)}\n`);
console.log(`Wrote SVG source assets to ${OUT} and manifests to ${PUBLIC}`);
