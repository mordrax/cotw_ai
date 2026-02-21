import Phaser from "phaser";
import { BootScene } from "./scenes/boot_scene";
import { CharacterCreationScene } from "./scenes/character_creation_scene";
import { GameScene } from "./scenes/game_scene";
import { MainMenuScene } from "./scenes/main_menu_scene";
import { MapViewScene } from "./scenes/map_view_scene";
import { SpriteViewerScene } from "./scenes/sprite_viewer_scene";
import { UIScene } from "./scenes/ui_scene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  backgroundColor: "#0d1117",
  dom: { createContainer: true },
  scene: [BootScene, MainMenuScene, CharacterCreationScene, MapViewScene, GameScene, UIScene, SpriteViewerScene],
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(gameConfig);
