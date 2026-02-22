import { ASSET_KEYS } from "@/assets/index";
import { getFrameFromAscii } from "@/entities/ascii_tile_map";
import { createSceneLayout } from "@/ui/scene_layout";
import Phaser from "phaser";

/**
 * Village Map Viewer Scene — Display and toggle between ASCII and tile views
 * of the Village of Bjarnarhaven from cotwelm's ASCIIMaps.elm
 * Accessible from MainMenuScene via "View Map" button.
 */
export class MapViewScene extends Phaser.Scene {
  private villageMapAscii: string[] = [
    "========,,###,,,========",
    "========,,,.,,,,========",
    "========,,,.,,,,========",
    "========,,,.,,,,========",
    "========,,,.,,,,========",
    "===,,,,,;...,,,!###=====",
    "===###!;.;,.,,;.###=====",
    "===###..;,,.,;.;###=====",
    "===###,,,,,...;,,,,,,===",
    "===,,,,,,,,.,,,,,,,,,===",
    "====,,,,,,,.,,,,,,,,,===",
    "====,,,,,,,.,,,,,,,,,===",
    "====,,,,,,,.,!###,,,,===",
    "====,,,##.....###,,,,===",
    "====,,,##!,.,,###,,,,===",
    "====,,,,,,,.,,,,,,,,,===",
    "====,,,,,,,.,,,,,,,,,===",
    "====,,###!...!###,======",
    "====,,###..e..###,======",
    "====,,###,...,###,======",
    "====,,,,,,,.,,,,,,======",
    "====,,,,,,,.!,,,,,======",
    "======,,,#####,=========",
    "======,,,#####,=========",
    "======,,,#####,=========",
    "======,,,#####,=========",
    "======,,,#####,=========",
    "========================",
  ];

  private showTileView = false;
  private mapContainer: Phaser.GameObjects.Container | null = null;
  private modeText!: Phaser.GameObjects.Text;
  private contentY = 0;

  constructor() {
    super({ key: "MapViewScene" });
  }

  create(): void {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d1117).setDepth(-1);

    const layout = createSceneLayout(this);
    layout.menuBar.addTitle("Village of Bjarnarhaven", {
      color: "#4a90d9",
      fontFamily: "Georgia, serif",
      fontStyle: "bold",
    });
    layout.menuBar.addBackButton(() => this.scene.start("MainMenuScene"));

    // Mode toggle text as a bar control
    this.modeText = this.add.text(0, 0, "[T] Toggle: ASCII", {
      fontSize: "12px",
      color: "#8899bb",
      fontFamily: "Arial",
    });
    layout.menuBar.addControl(this.modeText, "left", 16);

    // Sprite viewer hotkey
    const spriteViewerHotkey = this.add.text(0, 0, "[S] Sprite Viewer", {
      fontSize: "12px",
      color: "#8899bb",
      fontFamily: "Arial",
    });
    layout.menuBar.addControl(spriteViewerHotkey, "right", 12);

    this.contentY = layout.contentBounds.y;

    // Display initial map
    this.renderMap();

    // Keyboard handlers
    this.input.keyboard?.on("keydown-T", () => this.toggleMapView());
    this.input.keyboard?.on("keydown-S", () => this.scene.start("SpriteViewerScene"));
    this.input.keyboard?.on("keydown-ESC", () => this.scene.start("MainMenuScene"));
  }

  private toggleMapView(): void {
    this.showTileView = !this.showTileView;
    this.renderMap();
  }

  private renderMap(): void {
    if (this.mapContainer) {
      this.mapContainer.destroy(true);
      this.mapContainer = null;
    }

    this.mapContainer = this.add.container(0, 0);

    if (this.showTileView) {
      this.renderTileView();
    } else {
      this.renderAsciiView();
    }

    this.modeText.setText(`[T] Toggle: ${this.showTileView ? "TILE" : "ASCII"}`);
  }

  private renderAsciiView(): void {
    const { width } = this.scale;
    const startX = width / 2;
    const startY = this.contentY + 20;
    const mapText = this.villageMapAscii.join("\n");

    const text = this.add
      .text(startX, startY, mapText, {
        fontSize: "14px",
        color: "#00ff00",
        fontFamily: "monospace",
      })
      .setOrigin(0.5, 0);

    this.mapContainer?.add(text);
  }

  private renderTileView(): void {
    const { width } = this.scale;
    const tileSpacing = 32;
    const startX = width / 2 - (this.villageMapAscii[0].length * tileSpacing) / 2;
    const startY = this.contentY + 20;

    for (let y = 0; y < this.villageMapAscii.length; y++) {
      const row = this.villageMapAscii[y];
      for (let x = 0; x < row.length; x++) {
        const char = row[x];
        const frameIndex = getFrameFromAscii(char);

        const rotation = this.calculateTileRotation(x, y, char);

        const sprite = this.add.sprite(
          startX + x * tileSpacing,
          startY + y * tileSpacing,
          ASSET_KEYS.TILES,
          frameIndex.toString(),
        );

        sprite.setScale(1.0);
        sprite.setRotation(rotation);

        this.mapContainer?.add(sprite);
      }
    }
  }

  private calculateTileRotation(x: number, y: number, char: string): number {
    const orientedChars = [".", "=", "^"];
    if (!orientedChars.includes(char)) {
      return 0;
    }

    const hasNorth = y > 0 && this.villageMapAscii[y - 1][x] === char;
    const hasSouth = y < this.villageMapAscii.length - 1 && this.villageMapAscii[y + 1][x] === char;
    const hasEast = x < this.villageMapAscii[y].length - 1 && this.villageMapAscii[y][x + 1] === char;
    const hasWest = x > 0 && this.villageMapAscii[y][x - 1] === char;

    const pattern = (hasNorth ? 1 : 0) | (hasSouth ? 2 : 0) | (hasEast ? 4 : 0) | (hasWest ? 8 : 0);

    switch (pattern) {
      case 0:
      case 3:
      case 12:
        return 0;
      case 1:
      case 5:
      case 9:
        return 0;
      case 2:
      case 6:
      case 10:
        return Math.PI;
      case 4:
      case 7:
      case 13:
        return Math.PI / 2;
      case 8:
      case 11:
      case 14:
        return (3 * Math.PI) / 2;
      case 15:
        return 0;
      default:
        return 0;
    }
  }
}
