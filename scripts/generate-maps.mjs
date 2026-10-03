import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const out = resolve("public/assets/pixel/maps");
mkdirSync(out, { recursive: true });
const TILE = 16;
const gids = { outdoor: 1, house: 97, furniture: 217, trees: 313 };
const tilesets = [
  { firstgid: gids.outdoor, name: "Outdoor", tilewidth: 16, tileheight: 16, tilecount: 96, columns: 12, image: "../Forchild/BasicVillageTileset/Outdoor_tileset.png", imagewidth: 192, imageheight: 128 },
  { firstgid: gids.house, name: "House", tilewidth: 16, tileheight: 16, tilecount: 120, columns: 12, image: "../Forchild/BasicVillageTileset/House_tileset.png", imagewidth: 192, imageheight: 160 },
  { firstgid: gids.furniture, name: "Furniture", tilewidth: 16, tileheight: 16, tilecount: 96, columns: 12, image: "../Forchild/BasicVillageTileset/Furniture.png", imagewidth: 192, imageheight: 128 },
  { firstgid: gids.trees, name: "Trees", tilewidth: 16, tileheight: 16, tilecount: 54, columns: 9, image: "../Forchild/BasicVillageTileset/Trees_and_bushes.png", imagewidth: 144, imageheight: 96 },
];
const blank = (w, h) => Array(w * h).fill(0);
const at = (a, w, x, y, value) => { if (x >= 0 && y >= 0 && x < w && y < a.length / w) a[y * w + x] = value; };
const layer = (id, name, w, h, data, visible = true) => ({ id, name, type: "tilelayer", x: 0, y: 0, width: w, height: h, opacity: 1, visible, data });
const mapBase = (w, h, layers) => ({ compressionlevel: -1, height: h, infinite: false, layers, nextlayerid: layers.length + 1, nextobjectid: 100, orientation: "orthogonal", renderorder: "right-down", tiledversion: "1.11.2", tileheight: TILE, tilesets, tilewidth: TILE, type: "map", version: "1.10", width: w });

const W = 64, H = 48;
const ground = blank(W, H), decoration = blank(W, H), collision = blank(W, H), above = blank(W, H), portal = blank(W, H), spawn = blank(W, H), interaction = blank(W, H);
const vertices = [{x:32,y:3},{x:59,y:18},{x:50,y:44},{x:14,y:44},{x:5,y:18}];
const inside = (x, y) => {
  let hit = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const a = vertices[i], b = vertices[j];
    if (((a.y > y) !== (b.y > y)) && x < (b.x-a.x) * (y-a.y) / (b.y-a.y) + a.x) hit = !hit;
  }
  return hit;
};
for (let y=0;y<H;y++) for (let x=0;x<W;x++) {
  const safe = inside(x+.5,y+.5);
  at(ground,W,x,y,safe ? gids.outdoor : gids.outdoor+46);
  if (!safe) at(collision,W,x,y,gids.outdoor);
}
const edgePoints = [];
for (let i=0;i<vertices.length;i++) {
  const a=vertices[i], b=vertices[(i+1)%vertices.length], steps=Math.max(Math.abs(b.x-a.x),Math.abs(b.y-a.y));
  for(let s=0;s<=steps;s++){ const x=Math.round(a.x+(b.x-a.x)*s/steps), y=Math.round(a.y+(b.y-a.y)*s/steps); edgePoints.push([x,y]); at(decoration,W,x,y,gids.house+96); at(collision,W,x,y,gids.outdoor); }
}
const buildings = [
  { destination:"home", title:"HOME", worldName:"Arrival Courtyard", x:32, y:8, rotation:0 },
  { destination:"skills", title:"SKILLS", worldName:"Skills Workshop", x:53, y:19, rotation:4 },
  { destination:"contact", title:"CONTACT", worldName:"Contact Lodge", x:46, y:38, rotation:2 },
  { destination:"projects", title:"PROJECTS", worldName:"Project Pavilion", x:18, y:38, rotation:-2 },
  { destination:"about", title:"ABOUT", worldName:"About Hall", x:11, y:19, rotation:-4 },
];
const doorFor = (building) => {
  const dx = 32 - building.x, dy = 24 - building.y;
  const length = Math.hypot(dx, dy);
  const ux = dx / length, uy = dy / length;
  return { x: Math.round(building.x + ux * 3.6), y: Math.round(building.y + uy * 3.6), ux, uy, angle: Math.atan2(dy, dx) * 180 / Math.PI };
};
const line = (x0,y0,x1,y1,value,width=2) => { const steps=Math.max(Math.abs(x1-x0),Math.abs(y1-y0)); for(let s=0;s<=steps;s++){ const x=Math.round(x0+(x1-x0)*s/steps),y=Math.round(y0+(y1-y0)*s/steps); for(let oy=-width;oy<=width;oy++)for(let ox=-width;ox<=width;ox++)if(Math.abs(ox)+Math.abs(oy)<=width+1)at(decoration,W,x+ox,y+oy,value); } };
// The plain soil tile keeps the pentagonal route network calm and legible; sparse
// detail tiles are reserved for the central courtyard rather than repeated as noise.
for (const b of buildings) line(32,24,b.x,b.y+4,gids.outdoor+9,1);
for (let i=0;i<buildings.length;i++) line(buildings[i].x,buildings[i].y+4,buildings[(i+1)%5].x,buildings[(i+1)%5].y+4,gids.outdoor+9,1);
for (let y=21;y<=27;y++)for(let x=29;x<=35;x++)at(decoration,W,x,y,gids.outdoor+9);
for (const [x,y] of [[30,22],[34,22],[32,24],[30,26],[34,26]]) at(decoration,W,x,y,gids.outdoor+8);
for(const b of buildings){
  const door = doorFor(b);
  for(let y=b.y-3;y<=b.y+3;y++)for(let x=b.x-5;x<=b.x+5;x++){
    const rx=x-b.x, ry=y-b.y, toward=rx*door.ux+ry*door.uy, across=Math.abs(rx*door.uy-ry*door.ux);
    if(!(toward>1.5&&across<1.25))at(collision,W,x,y,gids.outdoor);
  }
  at(portal,W,door.x,door.y,gids.outdoor+1); at(interaction,W,door.x,door.y,gids.outdoor+1);
}
// Sparse scenery keeps the centre readable while making the pentagon feel lived in.
// Trees use circular collision footprints; benches block a single tile.
for(const [x,y] of [[24,13],[40,13],[51,27],[43,39],[21,39],[13,27]]){
  for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++)if(Math.abs(ox)+Math.abs(oy)<=1)at(collision,W,x+ox,y+oy,gids.outdoor);
}
for(const [x,y] of [[27,25],[37,25]])at(collision,W,x,y,gids.outdoor);
at(spawn,W,32,24,gids.outdoor);
const outdoorObjects = buildings.map((b,i)=>{const door=doorFor(b);return { id:i+1, name:b.destination, type:"building", x:b.x*TILE+8, y:b.y*TILE+8, width:0, height:0, rotation:b.rotation, point:true, properties:[{name:"destination",type:"string",value:b.destination},{name:"title",type:"string",value:b.title},{name:"worldName",type:"string",value:b.worldName},{name:"doorX",type:"float",value:door.x*TILE+8},{name:"doorY",type:"float",value:door.y*TILE+8},{name:"doorAngle",type:"float",value:door.angle}] }});
const villageLayers=[layer(1,"ground",W,H,ground),layer(2,"decoration",W,H,decoration),layer(3,"collision",W,H,collision,false),layer(4,"above-player",W,H,above),layer(5,"portal",W,H,portal),layer(6,"spawn",W,H,spawn,false),layer(7,"interaction",W,H,interaction,false),{id:8,name:"buildings",type:"objectgroup",opacity:1,visible:true,x:0,y:0,objects:outdoorObjects}];
writeFileSync(resolve(out,"village.tmj"),JSON.stringify(mapBase(W,H,villageLayers)));
