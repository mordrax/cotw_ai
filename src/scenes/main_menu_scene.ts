import { gameSettings } from "@/config/game_settings";
import Phaser from "phaser";

const TITLE_COLOR = "#4a90d9";
const SUBTITLE_COLOR = "#8899bb";
const BUTTON_BG = 0x2a3a5c;
const BUTTON_BG_HOVER = 0x3a5a8c;
const BUTTON_BG_DISABLED = 0x1a1a2e;
const BUTTON_TEXT_COLOR = "#c8d8f0";
const BUTTON_TEXT_DISABLED = "#555566";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenuScene" });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // Get dynamic font sizes
    const titleSize = gameSettings.getFontSize(36);
    const subtitleSize = gameSettings.getFontSize(16);
    const buttonSize = gameSettings.getFontSize(18);

    // Title
    this.add
      .text(centerX, height * 0.3, "Castle of the Winds", {
        fontSize: `${titleSize}px`,
        color: TITLE_COLOR,
        fontFamily: "Georgia, serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(centerX, height * 0.3 + gameSettings.getFontSize(48), "Chapter 1: Quest for Vengeance", {
        fontSize: `${subtitleSize}px`,
        color: SUBTITLE_COLOR,
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    // Horizontal button row
    const buttonY = height * 0.58;
    const buttonSpacing = 130;
    const buttons = [
      { label: "New Game", enabled: true, action: () => this.startNewGame(), testId: "main-menu-button-new-game" },
      { label: "Load Game", enabled: false, action: () => {}, testId: "main-menu-button-load-game" },
      { label: "View Map", enabled: true, action: () => this.viewMap(), testId: "main-menu-button-view-map" },
      {
        label: "View Sprites",
        enabled: true,
        action: () => this.viewSprites(),
        testId: "main-menu-button-view-sprites",
      },
      { label: "Settings", enabled: true, action: () => this.openSettings(), testId: "main-menu-button-settings" },
    ];

    const totalWidth = (buttons.length - 1) * buttonSpacing;
    const startX = centerX - totalWidth / 2;

    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      const x = startX + i * buttonSpacing;
      this.createButton(x, buttonY, btn.label, btn.enabled, btn.action, btn.testId);
    }

    // "Load Game" hint
    this.add
      .text(centerX, buttonY + 40, "Save/Load coming soon", {
        fontSize: "11px",
        color: "#444455",
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    // Keyboard navigation
    this.setupKeyboardNav(buttons, startX, buttonSpacing, buttonY);
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    enabled: boolean,
    action: () => void,
    testId = "",
  ): Phaser.GameObjects.Container {
    const paddingX = 24;
    const paddingY = 12;
    const fontSize = gameSettings.getFontSize(18);

    const text = this.add
      .text(0, 0, label, {
        fontSize: `${fontSize}px`,
        color: enabled ? BUTTON_TEXT_COLOR : BUTTON_TEXT_DISABLED,
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    const bgWidth = text.width + paddingX * 2;
    const bgHeight = text.height + paddingY * 2;

    const bg = this.add.rectangle(0, 0, bgWidth, bgHeight, enabled ? BUTTON_BG : BUTTON_BG_DISABLED);
    bg.setStrokeStyle(1, enabled ? 0x4a6a9c : 0x333344);

    const container = this.add.container(x, y, [bg, text]);
    container.setSize(bgWidth, bgHeight);
    if (testId) {
      container.setData("testId", testId);
    }

    if (enabled) {
      container.setInteractive({ useHandCursor: true });

      container.on("pointerover", () => {
        bg.setFillStyle(BUTTON_BG_HOVER);
        bg.setStrokeStyle(2, 0x6a9adc);
      });

      container.on("pointerout", () => {
        bg.setFillStyle(BUTTON_BG);
        bg.setStrokeStyle(1, 0x4a6a9c);
      });

      container.on("pointerup", action);
    }

    return container;
  }

  private setupKeyboardNav(
    buttons: { label: string; enabled: boolean; action: () => void }[],
    startX: number,
    spacing: number,
    _y: number,
  ): void {
    const enabledIndices = buttons.map((b, i) => (b.enabled ? i : -1)).filter((i) => i >= 0);
    if (enabledIndices.length === 0) return;

    let selectedIdx = 0;

    // Selection indicator
    const indicator = this.add
      .text(startX + enabledIndices[0] * spacing, _y + 28, "▲", {
        fontSize: "14px",
        color: TITLE_COLOR,
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    const updateIndicator = () => {
      const btnIdx = enabledIndices[selectedIdx];
      indicator.setX(startX + btnIdx * spacing);
    };

    this.input.keyboard?.on("keydown-LEFT", () => {
      selectedIdx = (selectedIdx - 1 + enabledIndices.length) % enabledIndices.length;
      updateIndicator();
    });

    this.input.keyboard?.on("keydown-RIGHT", () => {
      selectedIdx = (selectedIdx + 1) % enabledIndices.length;
      updateIndicator();
    });

    this.input.keyboard?.on("keydown-ENTER", () => {
      const btnIdx = enabledIndices[selectedIdx];
      buttons[btnIdx].action();
    });
  }

  private startNewGame(): void {
    this.scene.start("CharacterCreationScene");
  }

  private viewMap(): void {
    this.scene.start("MapViewScene");
  }

  private viewSprites(): void {
    this.scene.start("SpriteViewerScene");
  }

  private openSettings(): void {
    this.scene.start("SettingsScene");
  }
}
