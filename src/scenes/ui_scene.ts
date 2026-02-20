import Phaser from "phaser";

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene" });
  }

  create(): void {
    // UI overlay scene — runs in parallel with GameScene
  }
}
