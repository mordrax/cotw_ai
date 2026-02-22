/**
 * Mapping from sprite sheet frame numbers to cotwelm TileType
 * This bridges the gap between the sprite atlas indices and the canonical tile types
 */

import { TileType } from "./tile_types";

/**
 * Maps sprite sheet frame indices to their cotwelm TileType equivalents
 * Frames are indexed from 0-69 in the tiles texture atlas
 */
export const FRAME_TO_TILE_TYPE: Record<number, TileType> = {
  // Terrain Tiles (Frames 0-15)
  0: TileType.Grass,
  1: TileType.Water,
  2: TileType.Path,
  3: TileType.Rock, // Wall representation
  4: TileType.DoorClosed, // Door (generic, state-based in cotwelm)
  5: TileType.PathGrass, // Fence/barrier
  6: TileType.Well, // Stairs/Well entrance
  7: TileType.Rock, // Mountain
  8: TileType.DarkDgn, // Dirt Floor
  9: TileType.WallDarkDgn, // Cave Wall
  10: TileType.DarkDgn, // Dark Stone
  11: TileType.LitDgn, // Light Stone
  12: TileType.Grass50Cave50, // Tall Grass
  13: TileType.WaterGrass, // Marsh
  14: TileType.White50Cave50, // Sand
  15: TileType.Grass10Cave90, // Moss

  // Decorative & Interactive (Frames 16-39)
  16: TileType.Grass, // Flower
  17: TileType.Grass, // Flower 2
  18: TileType.Grass, // Flower 3
  19: TileType.Crop, // Crop
  20: TileType.Fountain, // Fountain
  21: TileType.Well, // Well
  22: TileType.Altar, // Altar
  23: TileType.Throne, // Throne
  24: TileType.Grass, // Chest (overlay on terrain)
  25: TileType.Grass, // Locked Chest
  26: TileType.Grass, // Open Chest
  27: TileType.Grass, // Crate
  28: TileType.Grass, // Barrel
  29: TileType.Sign, // Signpost
  30: TileType.WallDarkDgn, // Torch Wall
  31: TileType.Grass, // Torchstand
  32: TileType.Grass, // Burning Torch
  33: TileType.Grass, // Candles
  34: TileType.Grass, // Brazier
  35: TileType.Ashes, // Bones
  36: TileType.Grass, // Grave
  37: TileType.Grass, // Spike Trap
  38: TileType.Grass, // Spike Trap Active
  39: TileType.Grass, // Poison Cloud

  // Stairs & Transitions (Frames 40-49)
  40: TileType.StairsDown, // Stairs Down
  41: TileType.StairsUp, // Stairs Up
  42: TileType.StairsDown, // Ladder Down
  43: TileType.StairsUp, // Ladder Up
  44: TileType.Path, // Portal
  45: TileType.DoorOpen, // Door Open
  46: TileType.DoorClosed, // Door Closed
  47: TileType.DoorBroken, // Door Broken
  48: TileType.PortcullisClosed, // Gate (Portcullis-like)
  49: TileType.PortcullisClosed, // Portcullis

  // Cave & Underground (Frames 50-59)
  50: TileType.MineEntrance, // Cave Entrance
  51: TileType.WallDarkDgn, // Cave Wall
  52: TileType.Grass, // Crystal (light source)
  53: TileType.Grass, // Stalactite
  54: TileType.Water, // Underground River
  55: TileType.Grass, // Lava
  56: TileType.Grass, // Magma Pool
  57: TileType.White50Cave50, // Ice Floor
  58: TileType.Ashes, // Rubble
  59: TileType.Grass, // Chasm

  // Fog & Special Markers (Frames 60-69)
  60: TileType.Grass, // Fog Light
  61: TileType.Grass, // Fog Medium
  62: TileType.Grass, // Fog Heavy
  63: TileType.TreasurePile, // Treasure
  64: TileType.Ashes, // Blood Stain
  65: TileType.Grass, // Scorch Mark
  66: TileType.Grass, // Magic Rune
  67: TileType.Grass, // Reserved
  68: TileType.Grass, // Reserved
  69: TileType.Grass, // Reserved
};

/**
 * Get the cotwelm TileType for a sprite frame index
 * Returns the canonical tile type from cotwelm
 */
export function getTileTypeForFrame(frameIndex: number): TileType {
  return FRAME_TO_TILE_TYPE[frameIndex] ?? TileType.Grass;
}

/**
 * Get all frames that correspond to a specific TileType
 * Useful for finding all sprite variations of a tile
 */
export function getFramesForTileType(tileType: TileType): number[] {
  return Object.entries(FRAME_TO_TILE_TYPE)
    .filter(([, type]) => type === tileType)
    .map(([frame]) => Number.parseInt(frame, 10));
}
