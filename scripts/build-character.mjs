import { writeFileSync } from "node:fs";

const directions = ["south", "southwest", "west", "northwest", "north", "northeast", "east", "southeast"];
const FRAME_W = 24;
const FRAME_H = 32;
const COLUMNS = 9;
const rect = (x, y, w, h, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
const frameGroup = (column, row, direction, phase, waving = false) => {
  const side = direction.includes("west") ? -1 : direction.includes("east") ? 1 : 0;
  const back = direction === "north" || direction === "northwest" || direction === "northeast";
  const stride = phase === 0 ? 0 : [0, 1, 1, 0, 0, -1, -1, 0][(phase - 1) % 8];
  const bob = phase === 0 ? 0 : [0, 0, 1, 1, 0, 0, 1, 1][(phase - 1) % 8];
  const faceShift = side;
  let svg = `<g transform="translate(${column * FRAME_W},${row * FRAME_H + bob})">`;
  if (back) {
    svg += rect(5 + faceShift, 3, 14, 10, "#11151b") + rect(7 + faceShift, 1, 5, 3, "#36404c") + rect(14 + faceShift, 2, 4, 3, "#20262e");
    svg += rect(7 + faceShift, 11, 10, 3, "#171c23");
  } else {
    svg += rect(6 + faceShift, 3, 12, 4, "#11151b") + rect(5 + faceShift, 6, 14, 5, "#11151b");
    svg += rect(7 + faceShift, 1, 4, 3, "#394552") + rect(13 + faceShift, 2, 4, 3, "#20262e");
    svg += rect(7 + faceShift, 9, 10, 6, "#d98e61");
    svg += rect(5 + faceShift, 7, 2, 6, "#11151b") + rect(17 + faceShift, 7, 2, 6, "#11151b");
    if (side < 0) svg += rect(8 + faceShift, 10, 2, 2, "#f7eee5") + rect(8 + faceShift, 13, 4, 1, "#542e26");
    else if (side > 0) svg += rect(15 + faceShift, 10, 2, 2, "#f7eee5") + rect(12 + faceShift, 13, 4, 1, "#542e26");
    else svg += rect(8, 10, 2, 2, "#f7eee5") + rect(14, 10, 2, 2, "#f7eee5") + rect(9, 13, 6, 1, "#542e26");
    svg += rect(11 + faceShift, 12, 2, 1, "#b86f49");
    svg += rect(9 + faceShift, 14, 6, 2, "#252027") + rect(11 + faceShift, 16, 3, 2, "#14161a");
  }
  svg += rect(6, 16, 12, 9, "#3f4b58") + rect(8, 17, 4, 8, "#5b6a79") + rect(15, 17, 3, 8, "#29323b");
  svg += rect(11, 17, 4, 8, back ? "#333b44" : "#8c4b35");
  const leftArm = waving ? -1 : stride;
  const rightArm = waving ? 0 : -stride;
  svg += rect(4 + leftArm, waving ? 10 : 18, 3, waving ? 12 : 7, "#4c5967");
  svg += rect(18 + rightArm, 18, 3, 7, "#2c3540");
  svg += rect(4 + leftArm, waving ? 8 : 24, 3, 2, "#d98e61") + rect(18 + rightArm, 24, 3, 2, "#d98e61");
  if (waving) svg += rect(4 + (phase % 2), 7, 3, 3, "#d98e61");
  const leftLeg = phase === 0 ? 0 : stride;
  const rightLeg = phase === 0 ? 0 : -stride;
  svg += rect(7 + leftLeg, 25, 5, 5, "#78818b") + rect(13 + rightLeg, 25, 5, 5, "#68727d");
  svg += rect(6 + leftLeg, 29, 6, 2, "#f4f2ed") + rect(13 + rightLeg, 29, 6, 2, "#fffdf7");
  svg += rect(6 + leftLeg, 31, 6, 1, "#9da8ae") + rect(13 + rightLeg, 31, 6, 1, "#9da8ae");
  return `${svg}</g>`;
};

const frames = [];
for (let row = 0; row < directions.length; row++) for (let column = 0; column < COLUMNS; column++) frames.push(frameGroup(column, row, directions[row], column));
for (let column = 0; column < COLUMNS; column++) frames.push(frameGroup(column, 8, "south", column % 4, column < 6));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COLUMNS * FRAME_W}" height="${9 * FRAME_H}" viewBox="0 0 ${COLUMNS * FRAME_W} ${9 * FRAME_H}" shape-rendering="crispEdges">${frames.join("")}</svg>`;
writeFileSync("/tmp/sandip-eight-direction.svg", svg);
