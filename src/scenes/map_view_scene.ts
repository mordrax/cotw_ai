import { ASSET_KEYS, TILE_SIZE } from "@/assets/index";
import { getTileMetadata } from "@/entities/tile";
import Phaser from "phaser";

const TITLE_COLOR = "#4a90d9";
const MAP_TEXT_COLOR = "#ccddff";
const BUTTON_BG = 0x2a3a5c;
const BUTTON_BG_HOVER = 0x3a5a8c;
const BUTTON_TEXT_COLOR = "#c8d8f0";

// ASCII to tile frame mapping (from cotwelm tile system)
const ASCII_TO_FRAME: Record<string, number> = {
  ",": 0, // Grass
  "=": 19, // Crop (borders in village map)
  ".": 2, // Stone Path (roads)
  "#": 3, // Wall (building)
  "!": 29, // Signpost
  ";": 5, // Fence
  e: 6, // Stairs
  "^": 7, // Mountain
};

// Tiles that need orientation-based rotation
const ORIENTED_TILES = new Set([2, 7, 19]); // Stone Path, Mountain, Crop

type ViewMode = "ascii" | "tiles";

interface MapGrid {
  width: number;
  height: number;
  tiles: string[][];
}

export class MapViewScene extends Phaser.Scene {
  private viewMode: ViewMode = "ascii";
  private mapContainer?: Phaser.GameObjects.Container;
  private mapTextObject?: Phaser.GameObjects.Text;
  private mapGrid?: MapGrid;

  constructor() {
    super({ key: "MapViewScene" });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d1117).setDepth(-1);

    // Title
    this.add
      .text(centerX, 12, "Village Map", {
        fontSize: "24px",
        color: TITLE_COLOR,
        fontFamily: "Georgia, serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Parse the village map into grid
    this.mapGrid = this.parseVillageMap();

    // Toggle button
    this.createToggleButton();

    // Map display
    this.mapContainer = this.add.container(centerX, height / 2 + 10);
    this.renderCurrentView();

    // Back button
    this.createBackButton();

    // Keyboard shortcuts
    this.input.keyboard?.on("keydown-ESC", () => this.backToMenu());
    this.input.keyboard?.on("keydown-T", () => this.toggleView());
  }

  private parseVillageMap(): MapGrid {
    const villageMap = [
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

    const height = villageMap.length;
    const width = villageMap[0].length;
    const tiles = villageMap.map((row) => row.split(""));

    return { width, height, tiles };
  }

  private renderCurrentView(): void {
    if (!this.mapContainer) return;

    // Clear previous render
    this.mapContainer.removeAll(true);

    if (this.viewMode === "ascii") {
      this.renderAsciiView();
    } else {
      this.renderTileView();
    }
  }

  private renderAsciiView(): void {
    if (!this.mapContainer || !this.mapGrid) return;

    const villageMap = this.mapGrid.tiles.map((row) => row.join(""));
    const mapText = villageMap.join("\n");

    this.mapTextObject = this.add
      .text(0, 0, mapText, {
        fontSize: "12px",
        color: MAP_TEXT_COLOR,
        fontFamily: "monospace",
        fixedWidth: 288, // 24 chars × 12px per char
        fixedHeight: 336, // 28 rows × 12px per row
        align: "center",
      })
      .setOrigin(0.5);

    this.mapContainer?.add(this.mapTextObject);
  }

  private renderTileView(): void {
    if (!this.mapContainer || !this.mapGrid) return;

    const { width: mapWidth, height: mapHeight, tiles } = this.mapGrid;

    // Calculate total pixel dimensions
    const totalPixelWidth = mapWidth * TILE_SIZE;
    const totalPixelHeight = mapHeight * TILE_SIZE;

    // Render each tile with rotation based on neighbors
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const char = tiles[y][x];
        const frameIndex = ASCII_TO_FRAME[char] ?? 0;

        // Calculate tile position (centered)
        const tileX = x * TILE_SIZE - totalPixelWidth / 2;
        const tileY = y * TILE_SIZE - totalPixelHeight / 2;

        // Create sprite
        const sprite = this.add.sprite(tileX, tileY, ASSET_KEYS.TILES, frameIndex);
        sprite.setOrigin(0, 0);

        // Apply rotation for oriented tiles
        if (ORIENTED_TILES.has(frameIndex)) {
          const rotation = this.calculateTileRotation(tiles, x, y, char);
          sprite.setRotation((rotation * Math.PI) / 180);
        }

        this.mapContainer?.add(sprite);
      }
    }
  }

  /**
   * Calculate rotation angle based on cardinal neighbors
   * Follows cotwelm's half-tile rotation system
   */
  private calculateTileRotation(tiles: string[][], x: number, y: number, currentChar: string): number {
    const height = tiles.length;
    const width = tiles[0].length;

    // Get cardinal neighbors (N, S, E, W)
    const up = y > 0 ? tiles[y - 1][x] : null;
    const down = y < height - 1 ? tiles[y + 1][x] : null;
    const right = x < width - 1 ? tiles[y][x + 1] : null;
    const left = x > 0 ? tiles[y][x - 1] : null;

    // For paths and roads, rotate based on adjacent path tiles
    if (currentChar === ".") {
      return this.calculatePathRotation(up, down, left, right);
    }

    // For mountains/terrain, rotate based on adjacent similar tiles
    if (currentChar === "^" || currentChar === "=") {
      return this.calculateTerrainRotation(up, down, left, right, currentChar);
    }

    return 0; // No rotation
  }

  /**
   * Rotation logic for paths/roads (connect to adjacent paths)
   */
  private calculatePathRotation(
    up: string | null,
    down: string | null,
    left: string | null,
    right: string | null,
  ): number {
    const isPathUp = up === ".";
    const isPathDown = down === ".";
    const isPathLeft = left === ".";
    const isPathRight = right === ".";

    // Check corner patterns for rotation
    // Up-Left corner
    if (isPathUp && isPathLeft) {
      return 90;
    }

    // Up-Right corner
    if (isPathUp && isPathRight) {
      return 180;
    }

    // Down-Right corner
    if (isPathDown && isPathRight) {
      return 270;
    }

    // Down-Left corner (default orientation)
    if (isPathDown && isPathLeft) {
      return 0;
    }

    // Straight connections
    if ((isPathUp && isPathDown) || (!isPathLeft && !isPathRight && (isPathUp || isPathDown))) {
      return 0; // Vertical
    }

    if ((isPathLeft && isPathRight) || (!isPathUp && !isPathDown && (isPathLeft || isPathRight))) {
      return 90; // Horizontal
    }

    return 0; // Default
  }

  /**
   * Rotation logic for terrain (mountains, crops)
   */
  private calculateTerrainRotation(
    up: string | null,
    down: string | null,
    left: string | null,
    right: string | null,
    currentChar: string,
  ): number {
    const isTerrainUp = up === currentChar;
    const isTerrainDown = down === currentChar;
    const isTerrainLeft = left === currentChar;
    const isTerrainRight = right === currentChar;

    // Check corner patterns for rotation
    // Up-Left corner
    if (isTerrainUp && isTerrainLeft) {
      return 90;
    }

    // Up-Right corner
    if (isTerrainUp && isTerrainRight) {
      return 180;
    }

    // Down-Right corner
    if (isTerrainDown && isTerrainRight) {
      return 270;
    }

    // Down-Left corner (default)
    if (isTerrainDown && isTerrainLeft) {
      return 0;
    }

    // Straight edges
    if ((isTerrainUp && isTerrainDown) || (!isTerrainLeft && !isTerrainRight && (isTerrainUp || isTerrainDown))) {
      return 0; // Vertical
    }

    if ((isTerrainLeft && isTerrainRight) || (!isTerrainUp && !isTerrainDown && (isTerrainLeft || isTerrainRight))) {
      return 90; // Horizontal
    }

    return 0; // Default
  }

  private createToggleButton(): void {
    const { width } = this.scale;
    const x = width - 80;
    const y = 20;

    const label = "(T) Toggle View";
    const paddingX = 12;
    const paddingY = 6;

    const text = this.add
      .text(0, 0, label, {
        fontSize: "12px",
        color: BUTTON_TEXT_COLOR,
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    const bgWidth = text.width + paddingX * 2;
    const bgHeight = text.height + paddingY * 2;

    const bg = this.add.rectangle(0, 0, bgWidth, bgHeight, BUTTON_BG);
    bg.setStrokeStyle(1, 0x4a6a9c);

    const container = this.add.container(x, y, [bg, text]);
    container.setSize(bgWidth, bgHeight);
    container.setInteractive({ useHandCursor: true });

    container.on("pointerover", () => {
      bg.setFillStyle(BUTTON_BG_HOVER);
      bg.setStrokeStyle(2, 0x6a9adc);
    });

    container.on("pointerout", () => {
      bg.setFillStyle(BUTTON_BG);
      bg.setStrokeStyle(1, 0x4a6a9c);
    });

    container.on("pointerup", () => this.toggleView());
  }

  private createBackButton(): void {
    const { width, height } = this.scale;
    const x = 60;
    const y = height - 20;

    const label = "← Back";
    const paddingX = 16;
    const paddingY = 8;

    const text = this.add
      .text(0, 0, label, {
        fontSize: "16px",
        color: BUTTON_TEXT_COLOR,
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    const bgWidth = text.width + paddingX * 2;
    const bgHeight = text.height + paddingY * 2;

    const bg = this.add.rectangle(0, 0, bgWidth, bgHeight, BUTTON_BG);
    bg.setStrokeStyle(1, 0x4a6a9c);

    const container = this.add.container(x, y, [bg, text]);
    container.setSize(bgWidth, bgHeight);
    container.setInteractive({ useHandCursor: true });

    container.on("pointerover", () => {
      bg.setFillStyle(BUTTON_BG_HOVER);
      bg.setStrokeStyle(2, 0x6a9adc);
    });

    container.on("pointerout", () => {
      bg.setFillStyle(BUTTON_BG);
      bg.setStrokeStyle(1, 0x4a6a9c);
    });

    container.on("pointerup", () => this.backToMenu());
  }

  private toggleView(): void {
    this.viewMode = this.viewMode === "ascii" ? "tiles" : "ascii";
    this.renderCurrentView();
  }

  private backToMenu(): void {
    this.scene.start("MainMenuScene");
  }
}
