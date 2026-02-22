/**
 * Tile Type Definitions - Ported from cotwelm (Castle of the Winds Elm)
 * All tile types from the original Castle of the Winds game
 */

/**
 * All tile types in Castle of the Winds, from cotwelm/src/Tile.elm
 * These are the canonical tile classifications used across the game
 */
export enum TileType {
  // Rock & Stone
  Rock = "Rock",
  PathRock = "PathRock",

  // Mine & Dungeon Entrances
  MineEntrance = "MineEntrance",

  // Portcullis & Gates
  PortcullisClosed = "PortcullisClosed",
  PortcullisOpen = "PortcullisOpen",

  // Markers
  Sign = "Sign",
  Favicon = "Favicon",

  // Grass & Outdoor
  Grass = "Grass",
  PathGrass = "PathGrass",
  Crop = "Crop",
  DestoyedVegePatch = "DestoyedVegePatch",
  VegePatch = "VegePatch",

  // Water Features
  Well = "Well",
  GreenWell = "GreenWell",
  Water = "Water",
  WaterGrass = "WaterGrass",
  WaterPath = "WaterPath",

  // Outdoor Structures
  Wagon = "Wagon",
  Fountain = "Fountain",

  // Dungeon - Dark
  DarkDgn = "DarkDgn",
  WallDarkDgn = "WallDarkDgn",

  // Dungeon - Lit
  LitDgn = "LitDgn",
  WallLitDgn = "WallLitDgn",

  // Castle
  CastleCornerParapet = "CastleCornerParapet",
  CastleWall = "CastleWall",
  CastleParapet = "CastleParapet",

  // Town
  TownWallCorner = "TownWallCorner",
  TownWallStop = "TownWallStop",
  TownWall = "TownWall",

  // Doors
  DoorClosed = "DoorClosed",
  DoorOpen = "DoorOpen",
  DoorBroken = "DoorBroken",

  // Dungeon Elements
  Cobweb = "Cobweb",
  Pillar = "Pillar",
  Ashes = "Ashes",

  // Stairs
  StairsUp = "StairsUp",
  StairsDown = "StairsDown",

  // Cave Transitions
  Grass50Cave50 = "Grass50Cave50",
  Grass10Cave90 = "Grass10Cave90",
  White50Cave50 = "White50Cave50",
  White90Cave10 = "White90Cave10",

  // Interactive
  Altar = "Altar",
  Status = "Status",
  Throne = "Throne",

  // Paths
  Path = "Path",
  BlueSquare = "BlueSquare",

  // Treasure
  TreasurePile = "TreasurePile",
}

/**
 * ASCII character mapping from cotwelm - these are the canonical representations
 * used when parsing ASCII maps
 */
export const ASCII_TILE_MAP: Record<string, TileType> = {
  "^": TileType.Rock,
  ",": TileType.Grass,
  o: TileType.DarkDgn,
  "~": TileType.Water,
  ".": TileType.Path,
  O: TileType.LitDgn,
  _: TileType.PathRock,
  ";": TileType.PathGrass,
  d: TileType.WallDarkDgn,
  w: TileType.WaterGrass,
  W: TileType.WaterPath,
  D: TileType.WallLitDgn,
  g: TileType.Grass50Cave50,
  G: TileType.Grass10Cave90,
  c: TileType.White50Cave50,
  C: TileType.White90Cave10,
  "=": TileType.Crop,
  e: TileType.Well,
  ">": TileType.StairsDown,
  "!": TileType.Sign,
};

/**
 * Solid/collision tiles from cotwelm - tiles that block movement
 * These are the canonical solid tile definitions
 */
export const SOLID_TILES: TileType[] = [
  TileType.Rock,
  TileType.Grass10Cave90,
  TileType.White50Cave50,
  TileType.Crop,
  TileType.Well,
  TileType.PathRock,
  TileType.WallDarkDgn,
  TileType.WallLitDgn,
];

/**
 * Check if a tile type is solid (blocks movement)
 */
export function isSolidTile(tileType: TileType): boolean {
  return SOLID_TILES.includes(tileType);
}

/**
 * Get ASCII character for a tile type
 */
export function getTileAscii(tileType: TileType): string | undefined {
  return Object.entries(ASCII_TILE_MAP).find(([, type]) => type === tileType)?.[0];
}

/**
 * Get tile type from ASCII character
 */
export function getTileTypeFromAscii(ascii: string): TileType {
  return ASCII_TILE_MAP[ascii] ?? TileType.Grass;
}
