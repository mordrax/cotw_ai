import type Phaser from "phaser";

/**
 * Load all Castle of the Winds sprite sheets and assets.
 * Called in BootScene.preload() before scene transition.
 */
export function loadAllAssets(scene: Phaser.Scene): void {
  // Core sprite sheets (32×32 frames)
  scene.load.spritesheet("tiles", "assets/original/tiles.png", {
    frameWidth: 32,
    frameHeight: 32,
  });

  scene.load.spritesheet("monsters", "assets/original/monsters.png", {
    frameWidth: 32,
    frameHeight: 32,
  });

  scene.load.spritesheet("items", "assets/original/items.png", {
    frameWidth: 32,
    frameHeight: 32,
  });

  // Buildings (variable frame sizes)
  scene.load.spritesheet("buildings", "assets/original/buildings.png", {
    frameWidth: 32,
    frameHeight: 32,
  });

  // Spell and effect assets (32×32 frames)
  scene.load.spritesheet("spells", "assets/original/spells.png", {
    frameWidth: 32,
    frameHeight: 32,
  });

  scene.load.spritesheet("spellEffects", "assets/original/spell_effects.png", {
    frameWidth: 32,
    frameHeight: 32,
  });

  // Single images
  scene.load.image("rip", "assets/original/RIP_blank.png");
}
