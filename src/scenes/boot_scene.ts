import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    // Load assets here when available
    // this.load.spritesheet("tiles", "assets/tiles.png", { frameWidth: 32, frameHeight: 32 });
  }

  create(): void {
    this.scene.start("GameScene");
  }
}
