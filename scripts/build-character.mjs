import { writeFileSync } from "node:fs";

const directions = ["south", "southwest", "west", "northwest", "north", "northeast", "east", "southeast"];
const rect = (x, y, w, h, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
const frameGroup = (column, row, direction, phase, waving = false) => {
  const side = direction.includes("west") ? -1 : direction.includes("east") ? 1 : 0;
  const back = direction === "north" || direction === "northwest" || direction === "northeast";
  const diagonal = direction.includes("west") || direction.includes("east");
  const stride = phase === 0 ? 0 : [0, -2, -1, 0, 2, 1][(phase - 1) % 6];
  const bob = phase === 0 ? 0 : [0, 1, 1, 0, 1, 1][(phase - 1) % 6];
  const faceShift = side * 2;
  let svg = `<g transform="translate(${column * 32},${row * 48 + bob})">`;
  if (back) {
    svg += rect(7 + faceShift, 4, 18, 15, "#11151b") + rect(9 + faceShift, 2, 6, 4, "#2f3542") + rect(18 + faceShift, 1, 5, 5, "#20252e");
    svg += rect(10 + faceShift, 16, 12, 4, "#191d24");
  } else {
    svg += rect(8 + faceShift, 4, 16, 5, "#11151b") + rect(6 + faceShift, 8, 19, 7, "#11151b");
    svg += rect(9 + faceShift, 2, 5, 4, "#343b49") + rect(17 + faceShift, 1, 5, 5, "#1d222b");
    svg += rect(9 + faceShift, 12, 14, 8, "#d68b5c");
    svg += rect(7 + faceShift, 9, 3, 8, "#11151b") + rect(22 + faceShift, 8, 3, 9, "#11151b");
    if (side < 0) svg += rect(10 + faceShift, 13, 2, 2, "#f8eee2") + rect(10 + faceShift, 17, 5, 1, "#41231f");
    else if (side > 0) svg += rect(20 + faceShift, 13, 2, 2, "#f8eee2") + rect(17 + faceShift, 17, 5, 1, "#41231f");
    else svg += rect(11, 13, 2, 2, "#f8eee2") + rect(19, 13, 2, 2, "#f8eee2") + rect(13, 17, 7, 1, "#41231f");
    svg += rect(15 + faceShift, 15, 3, 2, "#b86f49");
    svg += rect(14 + faceShift, 18, 6, 2, "#281817") + rect(16 + faceShift, 20, 3, 2, "#171518");
  }
  svg += rect(8, 20, 17, 14, "#303743") + rect(10, 21, 5, 12, "#485363") + rect(20, 21, 5, 12, "#242b35");
  svg += rect(15, 21, 5, 13, back ? "#26313a" : "#2f7779");
  if (diagonal) svg += rect(side < 0 ? 7 : 25, 20, 2, 10, "#687485");
  const leftArm = waving ? -1 : stride;
  const rightArm = waving ? 0 : -stride;
  svg += rect(6 + leftArm, waving ? 13 : 23, 4, waving ? 17 : 10, "#39434f");
  svg += rect(24 + rightArm, 23, 4, 10, "#252d37");
  svg += rect(7 + leftArm, waving ? 11 : 31, 4, 3, "#d68b5c") + rect(24 + rightArm, 31, 4, 3, "#d68b5c");
  if (waving) svg += rect(6 + (phase % 2), 9, 4, 4, "#d68b5c");
  const leftLeg = phase === 0 ? 0 : stride;
  const rightLeg = phase === 0 ? 0 : -stride;
  svg += rect(9 + leftLeg, 34, 7, 10, "#68717b") + rect(18 + rightLeg, 34, 7, 10, "#7a838c");
  svg += rect(8 + leftLeg, 42, 9, 4, "#f3f0e9") + rect(17 + rightLeg, 42, 9, 4, "#fffdf7");
  svg += rect(8 + leftLeg, 45, 9, 2, "#a8b1b6") + rect(17 + rightLeg, 45, 9, 2, "#a8b1b6");
  return `${svg}</g>`;
};

const frames = [];
for (let row = 0; row < directions.length; row++) for (let column = 0; column < 7; column++) frames.push(frameGroup(column, row, directions[row], column));
for (let column = 0; column < 7; column++) frames.push(frameGroup(column, 8, "south", column % 4, column < 4));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="224" height="432" viewBox="0 0 224 432" shape-rendering="crispEdges">${frames.join("")}</svg>`;
writeFileSync("/tmp/sandip-eight-direction.svg", svg);
