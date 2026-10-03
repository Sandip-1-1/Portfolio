import Phaser from "phaser";
import { WorldScene } from "./WorldScene";

export function createGame(parent: HTMLElement) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: parent.clientWidth,
    height: parent.clientHeight,
    transparent: true,
    pixelArt: true,
    render: { antialias: false, roundPixels: true, powerPreference: "high-performance" },
    physics: { default: "arcade", arcade: { debug: false, gravity: { x: 0, y: 0 } } },
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    input: { activePointers: 2 },
    scene: [WorldScene],
  });
}
