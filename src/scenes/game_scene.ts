import { type IWorld, createWorld } from "bitecs";
import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  private world!: IWorld;

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    this.world = createWorld();

    this.add
      .text(400, 280, "Castle of the Winds", {
        fontSize: "28px",
        color: "#e0d0a0",
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    this.add
      .text(400, 320, "A Norse Mythology Dungeon Crawler", {
        fontSize: "14px",
        color: "#8888aa",
        fontFamily: "serif",
      })
      .setOrigin(0.5);
  }

  update(_time: number, _delta: number): void {
    // ECS systems will run here
  }
}
