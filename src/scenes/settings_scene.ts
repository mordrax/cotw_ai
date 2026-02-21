import { gameSettings } from "@/config/game_settings";
import { createSceneLayout } from "@/ui/scene_layout";
import Phaser from "phaser";

const TITLE_COLOR = "#4a90d9";
const BUTTON_BG = 0x2a3a5c;
const BUTTON_BG_HOVER = 0x3a5a8c;
const BUTTON_TEXT_COLOR = "#c8d8f0";

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: "SettingsScene" });
  }

  create(): void {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d1117).setDepth(-1);

    const layout = createSceneLayout(this);
    layout.menuBar.addTitle("Settings", {
      color: TITLE_COLOR,
      fontFamily: "Georgia, serif",
      fontStyle: "bold",
    });
    layout.menuBar.addBackButton(() => this.scene.start("MainMenuScene"));

    const { contentBounds } = layout;
    const centerX = width / 2;

    // Font Size Setting
    const fontSettingY = contentBounds.y + contentBounds.height * 0.15;
    const labelSize = gameSettings.getFontSize(18);
    const optionSize = gameSettings.getFontSize(14);

    this.add
      .text(centerX - 200, fontSettingY, "Font Size:", {
        fontSize: `${labelSize}px`,
        color: BUTTON_TEXT_COLOR,
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    const fontOptions = [
      { label: "Small", value: 0.8 },
      { label: "Normal", value: 1.0 },
      { label: "Large", value: 1.2 },
      { label: "XL", value: 1.5 },
    ];

    const currentFontScale = gameSettings.getSetting("fontScale");
    const optionSpacing = 120;
    const startX = centerX - (optionSpacing * (fontOptions.length - 1)) / 2;

    fontOptions.forEach((option, index) => {
      const x = startX + index * optionSpacing;
      const isSelected = currentFontScale === option.value;
      this.createFontScaleButton(x, fontSettingY + 80, option.label, option.value, isSelected, optionSize);
    });

    // Volume Setting (placeholder)
    const volumeY = contentBounds.y + contentBounds.height * 0.4;
    this.add
      .text(centerX - 200, volumeY, "Volume:", {
        fontSize: `${labelSize}px`,
        color: BUTTON_TEXT_COLOR,
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, volumeY, "(Coming soon)", {
        fontSize: `${optionSize}px`,
        color: "#666688",
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    // Reset to Defaults Button
    this.createButton(
      centerX,
      contentBounds.y + contentBounds.height * 0.65,
      "Reset to Defaults",
      `${optionSize}px`,
      () => {
        gameSettings.resetToDefaults();
        this.scene.restart();
      },
    );

    // Listen for settings changes
    gameSettings.subscribe(() => {
      this.scene.restart();
    });
  }

  private createFontScaleButton(
    x: number,
    y: number,
    label: string,
    value: number,
    isSelected: boolean,
    fontSize: number,
  ): void {
    const paddingX = 12;
    const paddingY = 8;

    const text = this.add
      .text(0, 0, label, {
        fontSize: `${fontSize}px`,
        color: isSelected ? "#ffff00" : BUTTON_TEXT_COLOR,
        fontFamily: "Georgia, serif",
        fontStyle: isSelected ? "bold" : "normal",
      })
      .setOrigin(0.5);

    const bgWidth = text.width + paddingX * 2;
    const bgHeight = text.height + paddingY * 2;

    const bg = this.add.rectangle(0, 0, bgWidth, bgHeight, isSelected ? BUTTON_BG_HOVER : BUTTON_BG);
    bg.setStrokeStyle(isSelected ? 2 : 1, isSelected ? 0x6a9adc : 0x4a6a9c);

    const container = this.add.container(x, y, [bg, text]);
    container.setSize(bgWidth, bgHeight);
    container.setInteractive({ useHandCursor: true });

    container.on("pointerover", () => {
      bg.setFillStyle(BUTTON_BG_HOVER);
      bg.setStrokeStyle(2, 0x6a9adc);
    });

    container.on("pointerout", () => {
      bg.setFillStyle(isSelected ? BUTTON_BG_HOVER : BUTTON_BG);
      bg.setStrokeStyle(isSelected ? 2 : 1, isSelected ? 0x6a9adc : 0x4a6a9c);
    });

    container.on("pointerup", () => {
      gameSettings.updateSetting("fontScale", value);
    });
  }

  private createButton(x: number, y: number, label: string, fontSize: string, action: () => void): void {
    const paddingX = 16;
    const paddingY = 12;

    const text = this.add
      .text(0, 0, label, {
        fontSize,
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

    container.on("pointerup", action);
  }
}
