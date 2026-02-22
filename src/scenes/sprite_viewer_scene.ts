import { ASSET_KEYS } from "@/assets/index";
import { tileMetadataEditor } from "@/config/tile_metadata_editor";
import { getTileMetadata } from "@/entities/tile";
import { type SceneLayout, type ScrollArea, createSceneLayout } from "@/ui/scene_layout";
import Phaser from "phaser";

type TabKey = "tiles" | "monsters" | "items" | "buildings" | "spells" | "effects";

/**
 * Sprite Viewer Scene — Browse and preview all loaded Castle of the Winds sprites.
 * Accessible from MainMenuScene via "View Sprites" button.
 */
export class SpriteViewerScene extends Phaser.Scene {
  private currentTab: TabKey = "tiles";
  private tabButtons: Map<string, Phaser.GameObjects.Text> = new Map();
  private selectedTileFrame: number | null = null;
  private metadataPanel: Phaser.GameObjects.Container | null = null;
  private layout!: SceneLayout;
  private currentScrollArea: ScrollArea | null = null;

  constructor() {
    super({ key: "SpriteViewerScene" });
  }

  create(): void {
    this.layout = createSceneLayout(this);
    this.layout.menuBar.addTitle("Sprite Viewer");
    this.layout.menuBar.addBackButton(() => this.scene.start("MainMenuScene"));
    this.buildTabButtons();
    this.switchTab("tiles");

    // Clean up HTML inputs when scene shuts down
    this.events.on("shutdown", () => this.destroyMetadataPanel());
    this.events.on("sleep", () => this.destroyMetadataPanel());
  }

  private buildTabButtons(): void {
    const tabNames = ["Tiles", "Monsters", "Items", "Buildings", "Spells", "Effects"];
    const tabKeys: TabKey[] = ["tiles", "monsters", "items", "buildings", "spells", "effects"];

    for (let i = 0; i < tabKeys.length; i++) {
      const key = tabKeys[i];
      const btn = this.add
        .text(0, 0, tabNames[i], {
          fontSize: "14px",
          color: this.currentTab === key ? "#ffff00" : "#aaaaaa",
          fontFamily: "Arial",
        })
        .setInteractive({ useHandCursor: true })
        .on("pointerup", () => this.switchTab(key));

      btn.setData("testId", `sprite-viewer-tab-${key}`);
      this.layout.menuBar.addControl(btn, "left", 12);
      this.tabButtons.set(key, btn);
    }
  }

  private switchTab(tab: TabKey): void {
    this.currentTab = tab;

    // Update button colors
    this.tabButtons.forEach((btn, key) => {
      btn.setColor(key === tab ? "#ffff00" : "#aaaaaa");
    });

    // Destroy previous scroll area
    if (this.currentScrollArea) {
      this.currentScrollArea.destroy();
      this.currentScrollArea = null;
    }

    // Clear metadata panel
    this.destroyMetadataPanel();

    const { contentBounds } = this.layout;
    const gridWidth = contentBounds.width * 0.65;

    const textureKeyMap: Record<TabKey, string> = {
      tiles: ASSET_KEYS.TILES,
      monsters: ASSET_KEYS.MONSTERS,
      items: ASSET_KEYS.ITEMS,
      buildings: ASSET_KEYS.BUILDINGS,
      spells: ASSET_KEYS.SPELLS,
      effects: ASSET_KEYS.SPELL_EFFECTS,
    };

    const columnsMap: Record<TabKey, number> = {
      tiles: 10,
      monsters: 7,
      items: 5,
      buildings: 11,
      spells: 3,
      effects: 2,
    };

    const textureKey = textureKeyMap[tab];
    const columns = columnsMap[tab];

    this.currentScrollArea = this.layout.createScrollArea(
      contentBounds.x,
      contentBounds.y,
      gridWidth,
      contentBounds.height,
      (container, availableWidth) => {
        this.populateGrid(container, textureKey, columns, availableWidth);
      },
    );
  }

  private populateGrid(
    container: Phaser.GameObjects.Container,
    textureKey: string,
    columns: number,
    availableWidth: number,
  ): void {
    const texture = this.textures.get(textureKey);
    const frames = Object.values(texture.frames).filter((f) => f.name !== "__BASE");
    const startX = 30;
    const startY = 20;
    const tileSpacing = (availableWidth - startX * 2) / columns;

    frames.forEach((frame, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + col * tileSpacing + tileSpacing / 2;
      const y = startY + row * 72;

      const sprite = this.add.sprite(x, y, textureKey, frame.name);
      sprite.setScale(2);
      container.add(sprite);

      // Frame number label (shown on hover)
      const label = this.add
        .text(x, y + 40, index.toString(), {
          fontSize: "10px",
          color: "#aaaaaa",
          fontFamily: "Arial",
        })
        .setOrigin(0.5)
        .setAlpha(0);
      container.add(label);

      sprite
        .setInteractive()
        .setData("testId", `sprite-viewer-sprite-${index}`)
        .on("pointerover", () => label.setAlpha(1))
        .on("pointerout", () => label.setAlpha(0))
        .on("pointerup", () => {
          if (textureKey === "tiles") {
            this.selectedTileFrame = index;
            this.showMetadataPanel(index);
          }
        });

      // Show ASCII character above tiles
      if (textureKey === "tiles") {
        const metadata = getTileMetadata(index);
        if (metadata?.ascii) {
          const asciiLabel = this.add.text(x, y - 40, metadata.ascii, {
            fontSize: "12px",
            color: "#ffff99",
            fontFamily: "Arial",
            fontStyle: "bold",
          });
          container.add(asciiLabel);
        }
      }
    });
  }

  private destroyMetadataPanel(): void {
    if (this.metadataPanel) {
      // Remove any HTML input elements
      const inputs = document.querySelectorAll("input[data-sprite-viewer], textarea[data-sprite-viewer]");
      for (const el of inputs) {
        el.remove();
      }
      this.metadataPanel.destroy();
      this.metadataPanel = null;
    }
  }

  /**
   * Show metadata panel with editable fields for a tile
   */
  private showMetadataPanel(frameIndex: number): void {
    this.destroyMetadataPanel();

    const metadata = getTileMetadata(frameIndex);
    if (!metadata) return;

    const { contentBounds } = this.layout;
    const panelX = contentBounds.width * 0.65;
    const panelY = contentBounds.y;
    const panelWidth = contentBounds.width * 0.35 - 20;
    const panelHeight = contentBounds.height;

    const customMetadata = tileMetadataEditor.getCustomMetadata(frameIndex);

    // Panel background
    const panelBg = this.add.rectangle(
      panelX + panelWidth / 2,
      panelY + panelHeight / 2,
      panelWidth,
      panelHeight,
      0x1a1a2e,
      0.95,
    );
    panelBg.setStrokeStyle(2, 0x6a9adc);

    let yOffset = panelY + 20;

    // Frame info
    const frameLabel = this.add.text(panelX + 10, yOffset, `Frame ${frameIndex}`, {
      fontSize: "14px",
      color: "#ffffff",
      fontFamily: "Arial",
      fontStyle: "bold",
    });

    yOffset += 35;

    // Name
    const nameLabel = this.add.text(panelX + 10, yOffset, "Name:", {
      fontSize: "12px",
      color: "#ffffff",
      fontFamily: "Arial",
    });

    const nameInput = this.createInputField(
      panelX + 10,
      yOffset + 20,
      panelWidth - 20,
      customMetadata?.name || metadata.name,
      1,
      "sprite-viewer-input-name",
    );

    yOffset += 65;

    // ASCII
    const asciiLabel = this.add.text(panelX + 10, yOffset, "ASCII:", {
      fontSize: "12px",
      color: "#ffffff",
      fontFamily: "Arial",
    });

    const asciiInput = this.createInputField(
      panelX + 10,
      yOffset + 20,
      panelWidth - 20,
      customMetadata?.ascii || metadata.ascii || "",
      1,
      "sprite-viewer-input-ascii",
    );

    yOffset += 65;

    // Category
    const categoryLabel = this.add.text(panelX + 10, yOffset, "Category:", {
      fontSize: "12px",
      color: "#ffffff",
      fontFamily: "Arial",
    });

    const categoryInput = this.createInputField(
      panelX + 10,
      yOffset + 20,
      panelWidth - 20,
      customMetadata?.category || metadata.category,
      1,
      "sprite-viewer-input-category",
    );

    yOffset += 65;

    // Function
    const functionLabel = this.add.text(panelX + 10, yOffset, "Function:", {
      fontSize: "12px",
      color: "#ffffff",
      fontFamily: "Arial",
    });

    const functionInput = this.createInputField(
      panelX + 10,
      yOffset + 20,
      panelWidth - 20,
      customMetadata?.function || metadata.function,
      3,
      "sprite-viewer-input-function",
    );

    yOffset += 110;

    // Buttons
    const buttonY = panelY + panelHeight - 50;
    const buttonSpacing = panelWidth / 2 - 10;

    const saveButton = this.createPanelButton(
      panelX + 10,
      buttonY,
      "Save",
      "#88ff88",
      "sprite-viewer-button-save",
      () => {
        const newMetadata = {
          name: nameInput.value,
          ascii: asciiInput.value,
          category: categoryInput.value,
          function: functionInput.value,
        };
        tileMetadataEditor.updateMetadata(frameIndex, newMetadata);
        this.showMetadataPanel(frameIndex);
      },
    );

    const resetButton = this.createPanelButton(
      panelX + buttonSpacing,
      buttonY,
      "Reset",
      "#ff8888",
      "sprite-viewer-button-reset",
      () => {
        tileMetadataEditor.resetMetadata(frameIndex);
        this.showMetadataPanel(frameIndex);
      },
    );

    this.metadataPanel = this.add.container(0, 0, [
      panelBg,
      frameLabel,
      nameLabel,
      asciiLabel,
      categoryLabel,
      functionLabel,
      saveButton,
      resetButton,
    ]);
  }

  /**
   * Create a text input field overlaid on the canvas
   */
  private createInputField(
    x: number,
    y: number,
    width: number,
    initialValue: string,
    lines = 1,
    testId = "",
  ): HTMLInputElement | HTMLTextAreaElement {
    const canvas = this.game.canvas;
    const canvasRect = canvas.getBoundingClientRect();

    let inputElement: HTMLInputElement | HTMLTextAreaElement;

    if (lines > 1) {
      inputElement = document.createElement("textarea");
      (inputElement as HTMLTextAreaElement).rows = lines;
    } else {
      inputElement = document.createElement("input");
      (inputElement as HTMLInputElement).type = "text";
    }

    inputElement.value = initialValue;
    inputElement.setAttribute("data-sprite-viewer", "true");
    if (testId) {
      inputElement.id = testId;
    }
    inputElement.style.position = "absolute";
    inputElement.style.fontSize = "12px";
    inputElement.style.padding = "6px";
    inputElement.style.backgroundColor = "#2a3a5c";
    inputElement.style.color = "#ffffff";
    inputElement.style.border = "1px solid #6a9adc";
    inputElement.style.fontFamily = "Arial";
    inputElement.style.width = `${width}px`;
    if (lines > 1) {
      inputElement.style.resize = "none";
    }

    inputElement.style.left = `${canvasRect.left + x}px`;
    inputElement.style.top = `${canvasRect.top + y}px`;
    inputElement.style.zIndex = "1000";

    document.body.appendChild(inputElement);
    return inputElement;
  }

  /**
   * Create a button in the metadata panel
   */
  private createPanelButton(
    x: number,
    y: number,
    label: string,
    color: string,
    testId: string,
    action: () => void,
  ): Phaser.GameObjects.Text {
    return this.add
      .text(x, y, `[ ${label} ]`, {
        fontSize: "12px",
        color,
        fontFamily: "Arial",
      })
      .setOrigin(0, 0)
      .setData("testId", testId)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", action);
  }
}
