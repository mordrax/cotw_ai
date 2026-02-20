import Phaser from "phaser";
import { BootScene } from "./scenes/boot_scene";
import { GameScene } from "./scenes/game_scene";
import { UIScene } from "./scenes/ui_scene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  backgroundColor: "#1a1a2e",
  scene: [BootScene, GameScene, UIScene],
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(gameConfig);
