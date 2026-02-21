import { loadAllAssets } from "@/assets/assetLoader";
import { tileMetadataEditor } from "@/config/tile_metadata_editor";
import Phaser from "phaser";

const TITLE_COLOR = "#4a90d9";
const SUBTITLE_COLOR = "#8899bb";
const BAR_WIDTH = 320;
const BAR_HEIGHT = 16;

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // Title
    this.add
      .text(centerX, height * 0.3, "Castle of the Winds", {
        fontSize: "36px",
        color: TITLE_COLOR,
        fontFamily: "Georgia, serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(centerX, height * 0.3 + 48, "Chapter 1: Quest for Vengeance", {
        fontSize: "16px",
        color: SUBTITLE_COLOR,
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    // Progress bar track
    const barX = centerX - BAR_WIDTH / 2;
    const barY = height * 0.55;
    this.add.rectangle(centerX, barY + BAR_HEIGHT / 2, BAR_WIDTH, BAR_HEIGHT, 0x111122).setStrokeStyle(1, 0x334466);

    // Progress bar fill
    const fill = this.add.rectangle(barX, barY, 0, BAR_HEIGHT, 0x4a90d9).setOrigin(0, 0);

    // Percentage text
    const pctText = this.add
      .text(centerX, barY + BAR_HEIGHT + 14, "0%", {
        fontSize: "12px",
        color: SUBTITLE_COLOR,
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    // Update progress bar as assets load
    this.load.on("progress", (value: number) => {
      fill.setDisplaySize(BAR_WIDTH * value, BAR_HEIGHT);
      pctText.setText(`${Math.round(value * 100)}%`);
    });

    // Load all game assets
    loadAllAssets(this);
  }

  create(): void {
    // Note: tileMetadataEditor singleton is imported above and loads persisted tile metadata from localStorage
    this.scene.start("MainMenuScene");
  }
}
