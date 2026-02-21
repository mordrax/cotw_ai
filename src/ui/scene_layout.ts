import Phaser from "phaser";

const BAR_HEIGHT = 56;
const BAR_BG = 0x111827;
const BAR_BORDER = 0x334466;
const SCROLLBAR_W = 12;
const SCROLLBAR_TRACK = 0x1a2a3a;
const SCROLLBAR_THUMB = 0x4a6a9c;

export interface SceneMenuBar {
  readonly height: number;
  addTitle(text: string, style?: Partial<Phaser.Types.GameObjects.Text.TextStyle>): Phaser.GameObjects.Text;
  addBackButton(action: () => void, label?: string): Phaser.GameObjects.Text;
  addControl(go: Phaser.GameObjects.GameObject, side?: "left" | "right", gap?: number): void;
}

export interface ScrollArea {
  readonly container: Phaser.GameObjects.Container;
  resetScroll(): void;
  destroy(): void;
}

export interface SceneLayout {
  readonly menuBar: SceneMenuBar;
  readonly contentBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  createScrollArea(
    x: number,
    y: number,
    width: number,
    height: number,
    populateFn: (container: Phaser.GameObjects.Container, width: number) => void,
  ): ScrollArea;
}

export function createSceneLayout(scene: Phaser.Scene, barHeight = BAR_HEIGHT): SceneLayout {
  const { width, height } = scene.scale;

  // Draw bar background
  const barBg = scene.add.rectangle(width / 2, barHeight / 2, width, barHeight, BAR_BG);
  barBg.setDepth(10);

  // 1px separator line
  const separator = scene.add.rectangle(width / 2, barHeight, width, 1, BAR_BORDER);
  separator.setDepth(10);

  let leftCursor = 20;
  let rightCursor = width - 20;

  const menuBar: SceneMenuBar = {
    height: barHeight,

    addTitle(text: string, style?: Partial<Phaser.Types.GameObjects.Text.TextStyle>): Phaser.GameObjects.Text {
      const t = scene.add
        .text(leftCursor, barHeight / 2, text, {
          fontSize: "24px",
          color: "#ffffff",
          fontFamily: "Arial",
          ...style,
        })
        .setOrigin(0, 0.5)
        .setDepth(11);
      leftCursor = t.x + t.width + 20;
      return t;
    },

    addBackButton(action: () => void, label = "\u2190 Back"): Phaser.GameObjects.Text {
      const btn = scene.add
        .text(rightCursor, barHeight / 2, label, {
          fontSize: "14px",
          color: "#8888ff",
          fontFamily: "Arial",
        })
        .setOrigin(1, 0.5)
        .setDepth(11)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => btn.setColor("#aaaaff"))
        .on("pointerout", () => btn.setColor("#8888ff"))
        .on("pointerup", action);
      rightCursor = btn.x - btn.width - 20;
      return btn;
    },

    addControl(go: Phaser.GameObjects.GameObject, side: "left" | "right" = "left", gap = 16): void {
      const textObj = go as Phaser.GameObjects.Text;

      if (side === "left") {
        textObj.setPosition(leftCursor, barHeight / 2);
        const bounds = textObj.getBounds?.();
        leftCursor += (bounds?.width ?? 80) + gap;
      } else {
        const bounds = textObj.getBounds?.();
        const w = bounds?.width ?? 80;
        rightCursor -= w;
        textObj.setPosition(rightCursor, barHeight / 2);
        rightCursor -= gap;
      }

      textObj.setDepth(11);
      textObj.setOrigin(0, 0.5);
    },
  };

  const contentBounds = {
    x: 0,
    y: barHeight + 1,
    width,
    height: height - barHeight - 1,
  };

  function createScrollArea(
    areaX: number,
    areaY: number,
    areaWidth: number,
    areaHeight: number,
    populateFn: (container: Phaser.GameObjects.Container, width: number) => void,
  ): ScrollArea {
    const innerContainer = scene.add.container(areaX, areaY);

    populateFn(innerContainer, areaWidth);

    // Compute total content height from children
    let totalContentHeight = 0;
    for (const child of innerContainer.list) {
      if ("y" in child && "displayHeight" in child) {
        const c = child as unknown as { y: number; displayHeight: number };
        const bottom = c.y + c.displayHeight;
        if (bottom > totalContentHeight) {
          totalContentHeight = bottom;
        }
      }
    }

    // Collected objects to destroy on cleanup
    const cleanupObjects: Phaser.GameObjects.GameObject[] = [];

    let scrollY = 0;
    const maxScroll = Math.max(0, totalContentHeight - areaHeight);

    // Apply geometry mask to clip content
    const maskGraphics = scene.add.graphics();
    maskGraphics.fillRect(areaX, areaY, areaWidth, areaHeight);
    maskGraphics.setVisible(false);
    const mask = maskGraphics.createGeometryMask();
    innerContainer.setMask(mask);
    cleanupObjects.push(maskGraphics);

    // Scrollbar (only if content overflows)
    let thumb: Phaser.GameObjects.Rectangle | null = null;

    if (totalContentHeight > areaHeight) {
      const trackX = areaX + areaWidth - SCROLLBAR_W;
      const track = scene.add.rectangle(
        trackX + SCROLLBAR_W / 2,
        areaY + areaHeight / 2,
        SCROLLBAR_W,
        areaHeight,
        SCROLLBAR_TRACK,
      );
      cleanupObjects.push(track);

      const thumbHeight = Math.max(30, (areaHeight / totalContentHeight) * areaHeight);
      thumb = scene.add.rectangle(
        trackX + SCROLLBAR_W / 2,
        areaY + thumbHeight / 2,
        SCROLLBAR_W - 2,
        thumbHeight,
        SCROLLBAR_THUMB,
      );
      thumb.setInteractive({ draggable: true, useHandCursor: true });
      scene.input.setDraggable(thumb);
      cleanupObjects.push(thumb);

      const updateThumbPosition = () => {
        if (!thumb) return;
        const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
        const thumbTravel = areaHeight - thumb.displayHeight;
        thumb.y = areaY + thumb.displayHeight / 2 + progress * thumbTravel;
      };

      const applyScroll = () => {
        innerContainer.y = areaY - scrollY;
        updateThumbPosition();
      };

      // Mouse wheel scrolling
      const wheelHandler = (
        _pointer: Phaser.Input.Pointer,
        _gos: Phaser.GameObjects.GameObject[],
        _dx: number,
        dy: number,
      ) => {
        scrollY = Phaser.Math.Clamp(scrollY + dy * 0.5, 0, maxScroll);
        applyScroll();
      };
      scene.input.on("wheel", wheelHandler);

      // Thumb drag scrolling
      const dragHandler = (
        _pointer: Phaser.Input.Pointer,
        dragTarget: Phaser.GameObjects.GameObject,
        _dragX: number,
        dragY: number,
      ) => {
        if (dragTarget !== thumb) return;
        const thumbH = thumb?.displayHeight ?? 30;
        const thumbTravel = areaHeight - thumbH;
        if (thumbTravel <= 0) return;
        const clampedY = Phaser.Math.Clamp(dragY, areaY + thumbH / 2, areaY + areaHeight - thumbH / 2);
        const progress = (clampedY - areaY - thumbH / 2) / thumbTravel;
        scrollY = progress * maxScroll;
        innerContainer.y = areaY - scrollY;
        if (thumb) thumb.y = clampedY;
      };
      scene.input.on("drag", dragHandler);
    }

    return {
      container: innerContainer,
      resetScroll() {
        scrollY = 0;
        innerContainer.y = areaY;
        if (thumb) {
          thumb.y = areaY + thumb.displayHeight / 2;
        }
      },
      destroy() {
        innerContainer.clearMask(true);
        innerContainer.destroy();
        for (const obj of cleanupObjects) {
          obj.destroy();
        }
      },
    };
  }

  return {
    menuBar,
    contentBounds,
    createScrollArea,
  };
}
