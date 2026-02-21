import { createSceneLayout } from "@/ui/scene_layout";
import Phaser from "phaser";
import { getAttributeDescription } from "../data/attribute_descriptions";

const TITLE_COLOR = "#4a90d9";
const SUBTITLE_COLOR = "#8899bb";
const LABEL_COLOR = "#c8d8f0";
const VALUE_COLOR = "#ffffff";
const DIM_COLOR = "#667788";
const BAR_BG = 0x111122;
const BAR_FILL = 0x4a90d9;
const BAR_AVAILABLE = 0x2a6a3a;
const SLIDER_TRACK = 0x1a2a3a;
const SLIDER_THUMB = 0x4a90d9;
const SLIDER_THUMB_HOVER = 0x6ab0f9;
const BUTTON_BG = 0x2a3a5c;
const BUTTON_BG_HOVER = 0x3a5a8c;
const RADIO_INACTIVE = 0x1a2a3a;
const RADIO_ACTIVE = 0x4a90d9;

type AttrKey = "str" | "int" | "con" | "dex";
type Gender = "male" | "female";
type Difficulty = "easy" | "intermediate" | "hard" | "impossible";

export interface CharacterConfig {
  name: string;
  gender: Gender;
  difficulty: Difficulty;
  attributes: Record<AttrKey, number>;
}

const ATTR_LABELS: Record<AttrKey, string> = {
  str: "Strength",
  int: "Intelligence",
  con: "Constitution",
  dex: "Dexterity",
};

const ATTR_ORDER: readonly AttrKey[] = ["str", "int", "con", "dex"];

export class CharacterCreationScene extends Phaser.Scene {
  private attributes: Record<AttrKey, number> = { str: 50, int: 50, con: 50, dex: 50 };
  private available = 100;
  private gender: Gender = "female";
  private difficulty: Difficulty = "hard";
  private playerName = "Conan the destroyer";

  // UI references for live updates
  private availableText!: Phaser.GameObjects.Text;
  private availableBar!: Phaser.GameObjects.Rectangle;
  private sliderThumbs: Partial<Record<AttrKey, Phaser.GameObjects.Arc>> = {};
  private valueTexts: Partial<Record<AttrKey, Phaser.GameObjects.Text>> = {};
  private descTexts: Partial<Record<AttrKey, Phaser.GameObjects.Text>> = {};
  private derivedTexts!: { hp: Phaser.GameObjects.Text; mana: Phaser.GameObjects.Text; ac: Phaser.GameObjects.Text };
  private genderButtons!: Record<Gender, { bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text }>;
  private difficultyButtons!: Record<Difficulty, { bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text }>;
  private nameInput!: HTMLInputElement;
  private sliderDragging = false;
  private contentY = 0;

  constructor() {
    super({ key: "CharacterCreationScene" });
  }

  create(): void {
    const { width } = this.scale;
    const cx = width / 2;

    const layout = createSceneLayout(this);
    layout.menuBar.addTitle("Castle of the Winds", {
      color: TITLE_COLOR,
      fontFamily: "Georgia, serif",
      fontStyle: "bold",
    });
    layout.menuBar.addBackButton(() => this.cancelCreation(), "Cancel");

    // Add subtitle as a bar control
    const subtitle = this.add.text(0, 0, "Chapter 1: Quest for Vengeance", {
      fontSize: "12px",
      color: SUBTITLE_COLOR,
      fontFamily: "Georgia, serif",
    });
    layout.menuBar.addControl(subtitle, "left", 16);

    this.contentY = layout.contentBounds.y;

    // Name input
    this.createNameInput(cx, this.contentY + 20);

    // Attributes section
    this.createAttributeSection(cx, this.contentY + 60);

    // Gender + Difficulty row
    this.createGenderSection(200, this.contentY + 300);
    this.createDifficultySection(520, this.contentY + 300);

    // Derived stats
    this.createDerivedStats(cx, this.contentY + 390);

    // Begin Adventure button
    this.createButton(cx, this.contentY + 460, "Begin Adventure", true, () => this.beginAdventure());
  }

  // --- Name Input (DOM-based) ---

  private createNameInput(cx: number, y: number): void {
    this.add
      .text(cx - 200, y, "Character name:", {
        fontSize: "14px",
        color: LABEL_COLOR,
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0, 0.5);

    this.nameInput = document.createElement("input");
    this.nameInput.type = "text";
    this.nameInput.value = this.playerName;
    this.nameInput.placeholder = "What did your mother utter as you came into this world?";
    this.nameInput.style.cssText = `
      width: 280px; padding: 6px 10px; font-size: 14px; font-family: Georgia, serif;
      background: #0d1117; color: #c8d8f0; border: 1px solid #334466; border-radius: 3px;
      outline: none;
    `;
    this.nameInput.addEventListener("input", () => {
      this.playerName = this.nameInput.value;
    });

    const dom = this.add.dom(cx + 50, y, this.nameInput);
    dom.setOrigin(0, 0.5);
  }

  // --- Attributes Section ---

  private createAttributeSection(_cx: number, startY: number): void {
    const leftX = 100;
    const barWidth = 200;
    const rowHeight = 46;

    // Available pool
    this.add.text(leftX, startY, "Available", {
      fontSize: "13px",
      color: DIM_COLOR,
      fontFamily: "Georgia, serif",
    });

    this.availableBar = this.add.rectangle(
      leftX + 90,
      startY + 8,
      barWidth * (this.available / 100),
      12,
      BAR_AVAILABLE,
    );
    this.availableBar.setOrigin(0, 0.5);

    // Track background for available bar
    this.add.rectangle(leftX + 90 + barWidth / 2, startY + 8, barWidth, 12, BAR_BG).setDepth(-1);

    this.availableText = this.add.text(leftX + 90 + barWidth + 10, startY, `${this.available}`, {
      fontSize: "13px",
      color: VALUE_COLOR,
      fontFamily: "Georgia, serif",
    });

    // Attribute sliders
    for (let i = 0; i < ATTR_ORDER.length; i++) {
      const attr = ATTR_ORDER[i];
      const y = startY + 30 + i * rowHeight;
      this.createAttributeSlider(attr, leftX, y, barWidth);
    }
  }

  private createAttributeSlider(attr: AttrKey, leftX: number, y: number, barWidth: number): void {
    // Label
    this.add.text(leftX, y, ATTR_LABELS[attr], {
      fontSize: "13px",
      color: LABEL_COLOR,
      fontFamily: "Georgia, serif",
    });

    const trackX = leftX + 90;
    const trackY = y + 8;

    // Track background
    this.add.rectangle(trackX + barWidth / 2, trackY, barWidth, 8, SLIDER_TRACK).setOrigin(0.5);

    // Filled portion
    const fill = this.add.rectangle(trackX, trackY, barWidth * (this.attributes[attr] / 100), 8, BAR_FILL);
    fill.setOrigin(0, 0.5);

    // Thumb
    const thumbX = trackX + barWidth * (this.attributes[attr] / 100);
    const thumb = this.add.circle(thumbX, trackY, 10, SLIDER_THUMB);
    thumb.setInteractive({ useHandCursor: true });

    // Value text
    const valueText = this.add.text(trackX + barWidth + 10, y, `${this.attributes[attr]}`, {
      fontSize: "13px",
      color: VALUE_COLOR,
      fontFamily: "Georgia, serif",
    });

    // Description
    const desc = getAttributeDescription(attr, this.attributes[attr]);
    const descText = this.add.text(trackX + barWidth + 40, y, desc, {
      fontSize: "10px",
      color: DIM_COLOR,
      fontFamily: "Georgia, serif",
      wordWrap: { width: 250 },
    });

    this.sliderThumbs[attr] = thumb;
    this.valueTexts[attr] = valueText;
    this.descTexts[attr] = descText;

    // Hover feedback
    thumb.on("pointerover", () => thumb.setFillStyle(SLIDER_THUMB_HOVER));
    thumb.on("pointerout", () => {
      if (!this.sliderDragging) thumb.setFillStyle(SLIDER_THUMB);
    });

    // Helper to apply a new value, respecting the available pool
    const applyValue = (newValue: number) => {
      const oldValue = this.attributes[attr];
      const delta = newValue - oldValue;
      if (delta === 0) return;

      const actualDelta = delta > 0 ? Math.min(delta, this.available) : delta;
      const finalValue = Phaser.Math.Clamp(oldValue + actualDelta, 0, 100);
      const actualUsed = finalValue - oldValue;

      this.attributes[attr] = finalValue;
      this.available -= actualUsed;

      const ratio = finalValue / 100;
      thumb.setX(trackX + barWidth * ratio);
      fill.setDisplaySize(barWidth * ratio, 8);
      valueText.setText(`${finalValue}`);
      descText.setText(getAttributeDescription(attr, finalValue));
      this.updateAvailableDisplay();
      this.updateDerivedStats();
    };

    // Drag via pointer move while holding down on thumb
    let isDragging = false;

    thumb.on("pointerdown", () => {
      isDragging = true;
      this.sliderDragging = true;
      thumb.setFillStyle(SLIDER_THUMB_HOVER);
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!isDragging || !pointer.isDown) {
        if (isDragging) {
          isDragging = false;
          this.sliderDragging = false;
          thumb.setFillStyle(SLIDER_THUMB);
        }
        return;
      }
      const clampedX = Phaser.Math.Clamp(pointer.x, trackX, trackX + barWidth);
      const newValue = Math.round(((clampedX - trackX) / barWidth) * 100);
      applyValue(newValue);
    });

    this.input.on("pointerup", () => {
      if (isDragging) {
        isDragging = false;
        this.sliderDragging = false;
        thumb.setFillStyle(SLIDER_THUMB);
      }
    });

    // Ensure thumb is on top for input events
    thumb.setDepth(1);

    // Click on track to jump to value
    const trackHitArea = this.add.rectangle(trackX + barWidth / 2, trackY, barWidth, 24, 0x000000, 0);
    trackHitArea.setInteractive({ useHandCursor: true });
    trackHitArea.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (this.sliderDragging) return;
      const localX = pointer.x - trackX;
      const newValue = Math.round(Phaser.Math.Clamp(localX / barWidth, 0, 1) * 100);
      applyValue(newValue);
    });
  }

  private updateAvailableDisplay(): void {
    this.availableText.setText(`${this.available}`);
    this.availableBar.setDisplaySize(200 * (this.available / 100), 12);
  }

  // --- Gender ---

  private createGenderSection(x: number, y: number): void {
    this.add.text(x, y, "Gender", { fontSize: "13px", color: DIM_COLOR, fontFamily: "Georgia, serif" });

    this.genderButtons = {} as typeof this.genderButtons;
    const options: Gender[] = ["male", "female"];
    const labels = { male: "Male", female: "Female" };

    for (let i = 0; i < options.length; i++) {
      const g = options[i];
      const bx = x + i * 90;
      const by = y + 28;

      const bg = this.add.rectangle(bx + 35, by, 70, 26, g === this.gender ? RADIO_ACTIVE : RADIO_INACTIVE);
      bg.setStrokeStyle(1, 0x334466);
      const text = this.add
        .text(bx + 35, by, labels[g], {
          fontSize: "12px",
          color: g === this.gender ? VALUE_COLOR : DIM_COLOR,
          fontFamily: "Georgia, serif",
        })
        .setOrigin(0.5);

      const container = this.add.container(0, 0, [bg, text]);
      container.setSize(70, 26);
      bg.setInteractive({ useHandCursor: true });
      bg.on("pointerup", () => {
        this.gender = g;
        this.updateGenderDisplay();
      });

      this.genderButtons[g] = { bg, text };
    }
  }

  private updateGenderDisplay(): void {
    for (const g of ["male", "female"] as Gender[]) {
      const btn = this.genderButtons[g];
      const isActive = g === this.gender;
      btn.bg.setFillStyle(isActive ? RADIO_ACTIVE : RADIO_INACTIVE);
      btn.text.setColor(isActive ? VALUE_COLOR : DIM_COLOR);
    }
  }

  // --- Difficulty ---

  private createDifficultySection(x: number, y: number): void {
    this.add.text(x, y, "Difficulty", { fontSize: "13px", color: DIM_COLOR, fontFamily: "Georgia, serif" });

    this.difficultyButtons = {} as typeof this.difficultyButtons;
    const options: Difficulty[] = ["easy", "intermediate", "hard", "impossible"];
    const labels: Record<Difficulty, string> = {
      easy: "Easy",
      intermediate: "Medium",
      hard: "Hard",
      impossible: "!!!",
    };

    for (let i = 0; i < options.length; i++) {
      const d = options[i];
      const bx = x + i * 65;
      const by = y + 28;

      const bg = this.add.rectangle(bx + 28, by, 56, 26, d === this.difficulty ? RADIO_ACTIVE : RADIO_INACTIVE);
      bg.setStrokeStyle(1, 0x334466);
      const text = this.add
        .text(bx + 28, by, labels[d], {
          fontSize: "11px",
          color: d === this.difficulty ? VALUE_COLOR : DIM_COLOR,
          fontFamily: "Georgia, serif",
        })
        .setOrigin(0.5);

      bg.setInteractive({ useHandCursor: true });
      bg.on("pointerup", () => {
        this.difficulty = d;
        this.updateDifficultyDisplay();
      });

      this.difficultyButtons[d] = { bg, text };
    }
  }

  private updateDifficultyDisplay(): void {
    for (const d of ["easy", "intermediate", "hard", "impossible"] as Difficulty[]) {
      const btn = this.difficultyButtons[d];
      const isActive = d === this.difficulty;
      btn.bg.setFillStyle(isActive ? RADIO_ACTIVE : RADIO_INACTIVE);
      btn.text.setColor(isActive ? VALUE_COLOR : DIM_COLOR);
    }
  }

  // --- Derived Stats ---

  private createDerivedStats(cx: number, y: number): void {
    this.add
      .text(cx, y, "\u2500\u2500\u2500 Derived Stats \u2500\u2500\u2500", {
        fontSize: "12px",
        color: DIM_COLOR,
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    const statsY = y + 24;
    const spacing = 160;
    const startX = cx - spacing;

    const hp = this.attributes.con * 5;
    const mana = this.attributes.int * 4;
    const ac = Math.floor(this.attributes.dex / 4);

    const hpText = this.add
      .text(startX, statsY, `HP: ${hp}`, {
        fontSize: "14px",
        color: "#66cc88",
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    const manaText = this.add
      .text(cx, statsY, `Mana: ${mana}`, {
        fontSize: "14px",
        color: "#6688cc",
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    const acText = this.add
      .text(startX + spacing * 2, statsY, `AC: ${ac}`, {
        fontSize: "14px",
        color: "#ccaa66",
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);

    this.derivedTexts = { hp: hpText, mana: manaText, ac: acText };
  }

  private updateDerivedStats(): void {
    this.derivedTexts.hp.setText(`HP: ${this.attributes.con * 5}`);
    this.derivedTexts.mana.setText(`Mana: ${this.attributes.int * 4}`);
    this.derivedTexts.ac.setText(`AC: ${Math.floor(this.attributes.dex / 4)}`);
  }

  // --- Action Buttons ---

  private createButton(x: number, y: number, label: string, _enabled: boolean, action: () => void): void {
    const text = this.add
      .text(0, 0, label, { fontSize: "16px", color: LABEL_COLOR, fontFamily: "Georgia, serif" })
      .setOrigin(0.5);

    const w = text.width + 40;
    const h = text.height + 20;
    const bg = this.add.rectangle(0, 0, w, h, BUTTON_BG);
    bg.setStrokeStyle(1, 0x4a6a9c);

    const container = this.add.container(x, y, [bg, text]);
    container.setSize(w, h);
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

  private cancelCreation(): void {
    if (this.nameInput.parentNode) {
      this.nameInput.parentNode.removeChild(this.nameInput);
    }
    this.scene.start("MainMenuScene");
  }

  private beginAdventure(): void {
    const config: CharacterConfig = {
      name: this.playerName,
      gender: this.gender,
      difficulty: this.difficulty,
      attributes: { ...this.attributes },
    };

    // Clean up DOM input
    if (this.nameInput.parentNode) {
      this.nameInput.parentNode.removeChild(this.nameInput);
    }

    this.scene.start("MapViewScene", { character: config });
  }
}
