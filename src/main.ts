import Phaser from "phaser";
import { BootScene } from "./scenes/boot_scene";
import { CharacterCreationScene } from "./scenes/character_creation_scene";
import { GameScene } from "./scenes/game_scene";
import { MainMenuScene } from "./scenes/main_menu_scene";
import { MapViewScene } from "./scenes/map_view_scene";
import { SettingsScene } from "./scenes/settings_scene";
import { SpriteViewerScene } from "./scenes/sprite_viewer_scene";
import { UIScene } from "./scenes/ui_scene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: Math.min(window.innerWidth, 1920),
  height: Math.min(window.innerHeight, 1440),
  parent: "game-container",
  backgroundColor: "#0d1117",
  dom: { createContainer: true },
  scene: [
    BootScene,
    MainMenuScene,
    CharacterCreationScene,
    MapViewScene,
    SettingsScene,
    GameScene,
    UIScene,
    SpriteViewerScene,
  ],
  pixelArt: false, // Set to false for larger viewport to allow smooth scaling
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: true,
    fullscreenTarget: "parent",
  },
};

new Phaser.Game(gameConfig);
