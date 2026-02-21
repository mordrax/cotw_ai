/** Type-safe asset manifest for Castle of the Winds sprites and tilesets. */

export const ASSET_KEYS = {
  TILES: "tiles",
  MONSTERS: "monsters",
  ITEMS: "items",
  BUILDINGS: "buildings",
  SPELLS: "spells",
  SPELL_EFFECTS: "spellEffects",
  RIP: "rip",
} as const;

export type AssetKey = (typeof ASSET_KEYS)[keyof typeof ASSET_KEYS];

export const TILE_SIZE = 32;

/**
 * Frame dimensions for each sprite sheet.
 * Used for sprite creation and animation setup.
 */
export const FRAME_SIZES = {
  [ASSET_KEYS.TILES]: { width: 32, height: 32 },
  [ASSET_KEYS.MONSTERS]: { width: 32, height: 32 },
  [ASSET_KEYS.ITEMS]: { width: 32, height: 32 },
  [ASSET_KEYS.BUILDINGS]: { width: 32, height: 32 },
  [ASSET_KEYS.SPELLS]: { width: 32, height: 32 },
  [ASSET_KEYS.SPELL_EFFECTS]: { width: 32, height: 32 },
} as const;
