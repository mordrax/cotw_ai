/** Type-safe asset manifest for Castle of the Winds sprites and tilesets. */

export const ASSET_KEYS = {
  TILES: "tiles",
  MONSTERS: "monsters",
  ITEMS: "items",
  SPELLS: "spells",
  SPELL_EFFECTS: "spell_effects",
} as const;

export type AssetKey = (typeof ASSET_KEYS)[keyof typeof ASSET_KEYS];

export const TILE_SIZE = 32;
