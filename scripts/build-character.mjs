import { writeFileSync } from "node:fs";

const directions = ["south", "southwest", "west", "northwest", "north", "northeast", "east", "southeast"];
const FRAME_W = 24;
const FRAME_H = 32;
const COLUMNS = 9;
const rect = (x, y, w, h, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
const frameGroup = (column, row, direction, phase, waving = false) => {
  const side = direction.includes("west") ? -1 : direction.includes("east") ? 1 : 0;
  const back = direction === "north" || direction === "northwest" || direction === "northeast";
  // Eight readable walk poses: contact, recoil, passing and high point on
  // alternating feet. The stronger silhouette follows classic pixel-walk
  // principles while keeping Sandip's own design and palette.
  const gait = Math.max(0, phase - 1) % 8;
  const stride = phase === 0 ? 0 : [-2,-1,0,1,2,1,0,-1][gait];
  const bob = phase === 0 ? 0 : [0,1,1,0,0,1,1,0][gait];
  const leftLift = phase === 0 ? 0 : [0,0,2,1,0,0,1,2][gait];
  const rightLift = phase === 0 ? 0 : [0,0,1,2,0,0,2,1][gait];
  const faceShift = side;
  let svg = `<g transform="translate(${column * FRAME_W},${row * FRAME_H + bob})">`;
  if (back) {
    svg += rect(5 + faceShift, 3, 14, 10, "#171b24") + rect(7 + faceShift, 1, 5, 3, "#566171") + rect(14 + faceShift, 2, 4, 3, "#252b36");
    svg += rect(7 + faceShift, 11, 10, 3, "#171c23");
  } else {
    svg += rect(6 + faceShift, 3, 12, 4, "#171b24") + rect(5 + faceShift, 6, 14, 5, "#171b24");
    svg += rect(7 + faceShift, 1, 4, 3, "#566171") + rect(13 + faceShift, 2, 4, 3, "#252b36") + rect(5+faceShift,5,3,3,"#252b36");
    svg += rect(7 + faceShift, 9, 10, 6, "#e3a070");
    svg += rect(5 + faceShift, 7, 2, 6, "#11151b") + rect(17 + faceShift, 7, 2, 6, "#11151b");
    if (side < 0) svg += rect(8 + faceShift, 10, 2, 2, "#f7eee5") + rect(8 + faceShift, 13, 4, 1, "#542e26");
    else if (side > 0) svg += rect(15 + faceShift, 10, 2, 2, "#f7eee5") + rect(12 + faceShift, 13, 4, 1, "#542e26");
    else svg += rect(8, 10, 2, 2, "#f7eee5") + rect(14, 10, 2, 2, "#f7eee5") + rect(9, 13, 6, 1, "#542e26");
    svg += rect(11 + faceShift, 12, 2, 1, "#b86f49");
    svg += rect(9 + faceShift, 14, 6, 1, "#5b342f") + rect(10 + faceShift, 15, 4, 2, "#27212a") + rect(11 + faceShift, 17, 2, 1, "#171820");
  }
  svg += rect(6, 17, 12, 8, "#33485d") + rect(7, 18, 4, 7, "#526b82") + rect(16, 18, 2, 7, "#223346");
  svg += rect(11, 18, 5, 7, back ? "#2b3c4c" : "#a74e3a") + rect(12,18,1,7,"#e0b26d");
  const leftArm = waving ? -1 : Math.sign(stride) * Math.min(2,Math.abs(stride));
  const rightArm = waving ? 0 : -Math.sign(stride) * Math.min(2,Math.abs(stride));
  svg += rect(4 + leftArm, waving ? 10 : 18 + Math.max(0,-stride), 3, waving ? 12 : 7, "#526b82");
  svg += rect(18 + rightArm, 18 + Math.max(0,stride), 3, 7, "#263b50");
  svg += rect(4 + leftArm, waving ? 8 : 24, 3, 2, "#d98e61") + rect(18 + rightArm, 24, 3, 2, "#d98e61");
  if (waving) svg += rect(4 + (phase % 2), 7, 3, 3, "#d98e61");
  const leftLeg = phase === 0 ? 0 : stride;
  const rightLeg = phase === 0 ? 0 : -stride;
  svg += rect(7 + leftLeg, 25-leftLift, 5, 5, "#78818b") + rect(13 + rightLeg, 25-rightLift, 5, 5, "#68727d");
  svg += rect(6 + leftLeg, 29-leftLift, 6, 2, "#f4f2ed") + rect(13 + rightLeg, 29-rightLift, 6, 2, "#fffdf7");
  svg += rect(6 + leftLeg, 31-leftLift, 6, 1, "#9da8ae") + rect(13 + rightLeg, 31-rightLift, 6, 1, "#9da8ae");
  return `${svg}</g>`;
};

const sittingFrame = (column) => {
  const breathe = column % 4 === 2 ? 1 : 0;
  let svg = `<g transform="translate(${column * FRAME_W},${9 * FRAME_H + breathe})">`;
  svg += rect(6,4,12,4,"#171b24") + rect(5,7,14,5,"#171b24") + rect(7,10,10,6,"#e3a070");
  svg += rect(8,11,2,2,"#f7eee5") + rect(14,11,2,2,"#f7eee5") + rect(9,14,6,1,"#5b342f");
  svg += rect(10,15,4,2,"#27212a") + rect(11,17,2,1,"#171820");
  svg += rect(5,18,14,7,"#33485d") + rect(7,19,4,6,"#526b82") + rect(12,19,4,6,"#a74e3a");
  svg += rect(3,20,3,6,"#526b82") + rect(18,20,3,6,"#263b50");
  svg += rect(6,25,6,4,"#78818b") + rect(12,25,6,4,"#68727d");
  svg += rect(4,28,8,3,"#f4f2ed") + rect(12,28,8,3,"#fffdf7");
  return `${svg}</g>`;
};

const frames = [];
for (let row = 0; row < directions.length; row++) for (let column = 0; column < COLUMNS; column++) frames.push(frameGroup(column, row, directions[row], column));
for (let column = 0; column < COLUMNS; column++) frames.push(frameGroup(column, 8, "south", column % 4, column < 6));
for (let column = 0; column < COLUMNS; column++) frames.push(sittingFrame(column));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COLUMNS * FRAME_W}" height="${10 * FRAME_H}" viewBox="0 0 ${COLUMNS * FRAME_W} ${10 * FRAME_H}" shape-rendering="crispEdges">${frames.join("")}</svg>`;
writeFileSync("/tmp/sandip-eight-direction.svg", svg);
