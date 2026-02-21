/**
 * ASCII to Tile Frame Mapping
 * Based on cotwelm's Tile.elm asciiTileMap
 * Maps ASCII characters from map files to tile frame indices
 */

export const ASCII_TILE_MAP: Record<string, number> = {
  // Terrain
  "^": 7, // Rock
  ",": 0, // Grass
  "~": 1, // Water
  ".": 2, // Path (roads)

  // Structures
  "#": 3, // Wall (building blocks)
  "!": 29, // Sign/Signpost
  ";": 5, // Fence/Hedge (PathGrass equivalent)
  e: 6, // Well (Stairs equivalent)

  // Underground
  o: 9, // DarkDgn → Cave Wall
  O: 11, // LitDgn → Light Stone
  d: 9, // WallDarkDgn → Cave Wall
  D: 11, // WallLitDgn → Light Stone

  // Water variants
  w: 13, // WaterGrass → Marsh
  W: 13, // WaterPath → Marsh

  // Paths & Rocks
  _: 2, // PathRock → Stone Path
  ":": 2, // PathGrass → Stone Path

  // Caves
  g: 12, // Grass50Cave50 → Tall Grass
  G: 12, // Grass10Cave90 → Tall Grass
  c: 14, // White50Cave50 → Sand
  C: 14, // White90Cave10 → Sand

  // Crops
  "=": 19, // Crop

  // Stairs
  ">": 40, // StairsDown
  "<": 41, // StairsUp
};

/**
 * Reverse mapping: Frame to ASCII character
 * Useful for displaying which ASCII represents each tile
 */
export const FRAME_TO_ASCII: Record<number, string> = {
  0: ",", // Grass
  1: "~", // Water
  2: ".", // Path
  3: "#", // Wall
  5: ";", // Fence
  6: "e", // Well
  7: "^", // Rock
  9: "d", // Cave Wall
  11: "D", // Light Stone
  12: "g", // Tall Grass
  13: "w", // Marsh
  14: "c", // Sand
  19: "=", // Crop
  29: "!", // Signpost
  40: ">", // Stairs Down
  41: "<", // Stairs Up
};

/**
 * Get the frame index for an ASCII character
 * Returns default (0 = Grass) if not found
 */
export function getFrameFromAscii(ascii: string): number {
  return ASCII_TILE_MAP[ascii] ?? 0;
}

/**
 * Get the ASCII character for a frame index
 */
export function getAsciiFromFrame(frame: number): string {
  return FRAME_TO_ASCII[frame] ?? "?";
}
