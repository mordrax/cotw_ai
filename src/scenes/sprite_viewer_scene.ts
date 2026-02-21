import { ASSET_KEYS } from "@/assets/index";
import { getTileMetadata } from "@/entities/tile";
import Phaser from "phaser";

/**
 * Sprite Viewer Scene — Browse and preview all loaded Castle of the Winds sprites.
 * Accessible from GameScene via "[ View Sprites ]" button.
 */
export class SpriteViewerScene extends Phaser.Scene {
  private currentTab: "tiles" | "monsters" | "items" | "buildings" | "spells" | "effects" = "tiles";
  private scrollOffset = 0;
  private tabButtons: Map<string, Phaser.GameObjects.Text> = new Map();
  private tooltip: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: "SpriteViewerScene" });
  }

  create(): void {
    // Title
    this.add
      .text(400, 20, "Sprite Viewer", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);

    // Tab buttons
    const tabNames = ["Tiles", "Monsters", "Items", "Buildings", "Spells", "Effects"];
    const tabKeys = ["tiles", "monsters", "items", "buildings", "spells", "effects"] as const;
    const tabX = 100;
    const tabSpacing = 110;

    tabKeys.forEach((key, i) => {
      const btn = this.add
        .text(tabX + i * tabSpacing, 50, tabNames[i], {
          fontSize: "14px",
          color: this.currentTab === key ? "#ffff00" : "#aaaaaa",
          fontFamily: "Arial",
        })
        .setInteractive()
        .on("pointerup", () => this.switchTab(key));

      this.tabButtons.set(key, btn);
    });

    // Tooltip for metadata
    this.tooltip = this.add
      .text(400, 520, "", {
        fontSize: "12px",
        color: "#ffff99",
        fontFamily: "Arial",
        backgroundColor: "#1a1a2e",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Sprite grid area (will be populated by switchTab)
    this.switchTab("tiles");

    // Back button
    this.add
      .text(400, 580, "[ Back to Menu ]", {
        fontSize: "14px",
        color: "#8888ff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerup", () => this.scene.start("MainMenuScene"));
  }

  private switchTab(tab: "tiles" | "monsters" | "items" | "buildings" | "spells" | "effects"): void {
    this.currentTab = tab;
    this.scrollOffset = 0;

    // Update button colors
    this.tabButtons.forEach((btn, key) => {
      btn.setColor(key === tab ? "#ffff00" : "#aaaaaa");
    });

    // Clear existing sprites (except UI)
    for (const child of this.children.list) {
      if (child instanceof Phaser.GameObjects.Sprite) {
        child.destroy();
      }
    }

    // Reset tooltip
    if (this.tooltip) {
      this.tooltip.setText("").setAlpha(0);
    }

    // Display sprites for the current tab
    switch (tab) {
      case "tiles":
        this.displaySpriteGrid(ASSET_KEYS.TILES, 10, 100, 80);
        break;
      case "monsters":
        this.displaySpriteGrid(ASSET_KEYS.MONSTERS, 14, 70, 80);
        break;
      case "items":
        this.displayScrollableGrid(ASSET_KEYS.ITEMS, 10, 100, 80);
        break;
      case "buildings":
        this.displaySpriteGrid(ASSET_KEYS.BUILDINGS, 23, 80, 80);
        break;
      case "spells":
        this.displaySpriteGrid(ASSET_KEYS.SPELLS, 6, 100, 80);
        break;
      case "effects":
        this.displaySpriteGrid(ASSET_KEYS.SPELL_EFFECTS, 4, 120, 80);
        break;
    }
  }

  private displaySpriteGrid(textureKey: string, columns: number, startX: number, startY: number): void {
    const texture = this.textures.get(textureKey);
    const frames = Object.values(texture.frames).filter((f) => f.name !== "__BASE");

    frames.forEach((frame, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + col * 36;
      const y = startY + row * 36;

      if (y < 550) {
        // Only show sprites that fit on screen
        const sprite = this.add.sprite(x, y, textureKey, frame.name);
        sprite.setScale(1);

        // Add frame number on hover
        const label = this.add
          .text(x, y + 20, index.toString(), {
            fontSize: "10px",
            color: "#aaaaaa",
            fontFamily: "Arial",
          })
          .setOrigin(0.5)
          .setAlpha(0);

        sprite
          .setInteractive()
          .on("pointerover", () => {
            label.setAlpha(1);
            // Show tile metadata if available
            if (textureKey === "tiles") {
              const metadata = getTileMetadata(index);
              if (metadata && this.tooltip) {
                this.tooltip.setText(`${metadata.name}\n${metadata.function}`).setAlpha(1);
              }
            }
          })
          .on("pointerout", () => {
            label.setAlpha(0);
            if (this.tooltip) {
              this.tooltip.setAlpha(0);
            }
          });
      }
    });
  }

  private displayScrollableGrid(textureKey: string, columns: number, startX: number, startY: number): void {
    const texture = this.textures.get(textureKey);
    const frames = Object.values(texture.frames).filter((f) => f.name !== "__BASE");

    const itemsPerPage = columns * 6;
    const totalPages = Math.ceil(frames.length / itemsPerPage);

    // Render current page
    const startIndex = this.scrollOffset * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, frames.length);

    frames.slice(startIndex, endIndex).forEach((frame, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + col * 36;
      const y = startY + row * 36;

      const sprite = this.add.sprite(x, y, textureKey, frame.name);
      sprite.setScale(1);

      const label = this.add
        .text(x, y + 20, (startIndex + index).toString(), {
          fontSize: "10px",
          color: "#aaaaaa",
          fontFamily: "Arial",
        })
        .setOrigin(0.5)
        .setAlpha(0);

      sprite
        .setInteractive()
        .on("pointerover", () => label.setAlpha(1))
        .on("pointerout", () => label.setAlpha(0));
    });

    // Pagination info
    this.add
      .text(400, 540, `Items ${startIndex + 1}–${endIndex} / ${frames.length}`, {
        fontSize: "12px",
        color: "#aaaaaa",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);

    // Scroll buttons
    if (this.scrollOffset > 0) {
      this.add
        .text(50, 540, "[ < ]", {
          fontSize: "14px",
          color: "#8888ff",
          fontFamily: "Arial",
        })
        .setInteractive()
        .on("pointerup", () => {
          this.scrollOffset--;
          this.switchTab("items");
        });
    }

    if (this.scrollOffset < totalPages - 1) {
      this.add
        .text(750, 540, "[ > ]", {
          fontSize: "14px",
          color: "#8888ff",
          fontFamily: "Arial",
        })
        .setInteractive()
        .on("pointerup", () => {
          this.scrollOffset++;
          this.switchTab("items");
        });
    }
  }
}
