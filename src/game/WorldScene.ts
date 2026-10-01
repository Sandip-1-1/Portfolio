import Phaser from "phaser";
import { destinations } from "../content";
import type { DestinationId, ThemeMode } from "../types";
import { gameEvents } from "./events";

const WORLD_W = 1400;
const WORLD_H = 960;

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private target?: Phaser.Math.Vector2;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private nearest: DestinationId | null = null;
  private nightOverlay!: Phaser.GameObjects.Rectangle;
  private reducedEffects = false;

  constructor() { super("world"); }

  preload() {
    this.load.image("world-map", "./assets/village-world.webp");
    this.load.image("avatar", "./assets/sandip-avatar.webp");
  }

  create() {
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.drawFallbackWorld();
    if (this.textures.exists("world-map")) {
      const map = this.add.image(WORLD_W / 2, WORLD_H / 2, "world-map").setDisplaySize(WORLD_W, WORLD_H).setDepth(-5);
      map.setAlpha(0.96);
    }
    this.drawPortalNetwork();
    this.player = this.createPlayer(700, 610);
    this.cameras.main.startFollow(this.player, true, 0.075, 0.075);
    this.cameras.main.setZoom(Math.min(1, Math.max(0.72, this.scale.width / 1200)));
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys("W,A,S,D,E,ENTER") as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
      this.target = new Phaser.Math.Vector2(worldPoint.x, worldPoint.y);
    });
    this.nightOverlay = this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x07152f, 0).setDepth(90).setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.events.on("set-theme", (theme: ThemeMode, amount: number) => this.applyTheme(theme, amount));
    this.events.on("teleport", (id: DestinationId) => this.teleport(id));
    this.events.on("reduced-effects", (value: boolean) => { this.reducedEffects = value; });
    this.scale.on("resize", () => this.cameras.main.setZoom(Math.min(1, Math.max(0.68, this.scale.width / 1200))));
  }

  private drawFallbackWorld() {
    const g = this.add.graphics().setDepth(-10);
    g.fillGradientStyle(0x295848, 0x295848, 0x183b3a, 0x183b3a, 1);
    g.fillRect(0, 0, WORLD_W, WORLD_H);
    g.fillStyle(0x9f8a63, 0.55);
    g.fillRoundedRect(600, 50, 200, 860, 80);
    g.fillRoundedRect(80, 420, 1240, 150, 70);
    g.lineStyle(4, 0xe6c47c, 0.22);
    for (let i = 0; i < 9; i += 1) g.strokeEllipse(700, 500, 170 + i * 36, 90 + i * 18);
  }

  private drawPortalNetwork() {
    destinations.forEach((destination) => {
      const { x, y } = destination.position;
      const ring = this.add.ellipse(x, y + 55, 108, 48, Phaser.Display.Color.HexStringToColor(destination.accent).color, 0.28).setDepth(9);
      this.tweens.add({ targets: ring, scaleX: 1.18, scaleY: 1.18, alpha: 0.08, duration: 1600, yoyo: true, repeat: -1, delay: destinations.indexOf(destination) * 170 });
      const portal = this.add.graphics().setDepth(8);
      portal.fillStyle(0x071d26, 0.82).fillRoundedRect(x - 42, y - 20, 84, 84, 22);
      portal.lineStyle(4, Phaser.Display.Color.HexStringToColor(destination.accent).color, 0.92).strokeRoundedRect(x - 42, y - 20, 84, 84, 22);
      this.add.text(x, y - 56, destination.worldName, { fontFamily: "system-ui, sans-serif", fontSize: "18px", fontStyle: "bold", color: "#fff7df", backgroundColor: "#071d26dd", padding: { x: 12, y: 7 }, align: "center" }).setOrigin(0.5).setDepth(12);
      this.add.text(x, y - 30, destination.title.toUpperCase(), { fontFamily: "system-ui, sans-serif", fontSize: "12px", color: destination.accent, letterSpacing: 2 }).setOrigin(0.5).setDepth(12);
    });
  }

  private createPlayer(x: number, y: number) {
    const container = this.add.container(x, y).setDepth(30);
    if (this.textures.exists("avatar")) {
      container.add(this.add.image(0, -45, "avatar").setDisplaySize(94, 122));
    } else {
      const avatar = this.add.graphics();
      avatar.fillStyle(0xf0c9a4).fillCircle(0, -66, 16);
      avatar.fillStyle(0x612e3f).fillRoundedRect(-22, -50, 44, 58, 14);
      avatar.fillStyle(0x17252b).fillRect(-18, 5, 13, 34).fillRect(5, 5, 13, 34);
      container.add(avatar);
    }
    const shadow = this.add.ellipse(0, 35, 58, 22, 0x000000, 0.28).setDepth(-1);
    container.addAt(shadow, 0);
    return container;
  }

  update(_time: number, delta: number) {
    if (!this.player || !this.cursors) return;
    const speed = 235 * (delta / 1000);
    let dx = 0; let dy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.keys.D.isDown) dx += 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.keys.S.isDown) dy += 1;
    if (dx || dy) {
      this.target = undefined;
      const length = Math.hypot(dx, dy);
      this.movePlayer((dx / length) * speed, (dy / length) * speed);
    } else if (this.target) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);
      if (distance < 8) this.target = undefined;
      else {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.target.x, this.target.y);
        this.movePlayer(Math.cos(angle) * speed, Math.sin(angle) * speed);
      }
    }
    this.checkProximity();
    if ((Phaser.Input.Keyboard.JustDown(this.keys.E) || Phaser.Input.Keyboard.JustDown(this.keys.ENTER)) && this.nearest) {
      gameEvents.emit("enter", { destination: this.nearest, source: "portal" });
    }
  }

  private movePlayer(dx: number, dy: number) {
    this.player.x = Phaser.Math.Clamp(this.player.x + dx, 72, WORLD_W - 72);
    this.player.y = Phaser.Math.Clamp(this.player.y + dy, 95, WORLD_H - 65);
    this.player.setDepth(30 + this.player.y / WORLD_H);
  }

  private checkProximity() {
    let next: DestinationId | null = null;
    let min = 112;
    destinations.forEach((d) => {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, d.position.x, d.position.y + 50);
      if (distance < min) { min = distance; next = d.id; }
    });
    if (next !== this.nearest) {
      this.nearest = next;
      gameEvents.emit("proximity", { destination: next });
    }
  }

  private teleport(id: DestinationId) {
    const destination = destinations.find((item) => item.id === id);
    if (!destination) return;
    const arrive = () => {
      this.player.setPosition(destination.position.x, destination.position.y + 72);
      this.cameras.main.centerOn(destination.position.x, destination.position.y);
      gameEvents.emit("enter", { destination: id, source: "teleport" });
    };
    if (this.reducedEffects) { arrive(); return; }
    this.tweens.add({ targets: this.player, alpha: 0, scale: 0.2, angle: 180, duration: 360, ease: "Cubic.In", onComplete: () => {
      arrive();
      this.tweens.add({ targets: this.player, alpha: 1, scale: 1, angle: 0, duration: 480, ease: "Back.Out" });
    }});
  }

  private applyTheme(theme: ThemeMode, amount: number) {
    const alpha = theme === "day" ? 0 : theme === "night" ? 0.56 : 0.56 * amount;
    this.tweens.add({ targets: this.nightOverlay, alpha, duration: this.reducedEffects ? 80 : 900 });
  }
}
