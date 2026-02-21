# Castle of the Winds Sprite Loading Strategy

## Asset Manifest

All sprite sheets are located in `src/assets/original/` and loaded in `BootScene.preload()`.

### Core Sprite Sheets (32×32 pixel frames)

#### 1. Tiles — `tiles.png`
- **Dimensions**: 224×320px
- **Frame size**: 32×32
- **Total frames**: 70 (48 actively used)
- **Asset key**: `TILES`
- **Usage**: Dungeon floors, walls, terrain, decorative elements
- **Categories**:
  - Terrain: grass, rock, water, dirt paths, cave transitions
  - Structures: doors (open/closed/broken), stairs (up/down), portcullis
  - Decorative: flowers, crops, fountains, wells, altars, thrones
  - Special: treasure indicator, fog indicators

#### 2. Monsters — `monsters.png`
- **Dimensions**: 448×160px
- **Frame size**: 32×32
- **Total frames**: 70 (all used)
- **Asset key**: `MONSTERS`
- **Usage**: Player characters, enemies, NPCs, bosses
- **Categories**:
  - Hero: Male, Female variants
  - Basic enemies: Kobold, Giant Rat, Snake, Ant, Dog, Skeleton
  - Medium threats: Ogre, Corpse, Lizard, Goblin, Wolf variants
  - Advanced enemies: Bandit, Wizard, Necromancer, Vampire
  - Boss/special: Barrow-Wight, Dragon (4 colors), Surtur
  - Humanoid variants: Rat-man, Wolf-man, Bear-man, Bull-man

#### 3. Items — `items.png`
- **Dimensions**: 320×928px
- **Frame size**: 32×32
- **Total frames**: 290 (87 item types used)
- **Asset key**: `ITEMS`
- **Usage**: Equipment, consumables, containers, currency
- **Categories**:
  - Potions: Water, Minor Heal, Medium Heal, Major Heal, Divination
  - Staffs: Fire, Smoke, Minor, Medium, Major, Green, Light
  - Wands: Fireball, Lightning, Light, Divination, Cold, Fire/Lightning bolts
  - Amulets: Cursed, Fire/Lightning/Cold/Drain resistance
  - Weapons: Axe, Sword, Mace, Flail, Hammer, Morning-star, Spear, Club
  - Armor: Leather/Metal variants (light/medium/heavy)
  - Shields: Wood/Metal variants
  - Helmets: 4 variants
  - Accessories: Gauntlets, Bracers, Cloaks, Boots, Rings, Belts
  - Containers: Purse, Bag, Pack, Chest, Enchanted-pack
  - Currency: Copper, Silver, Gold, Platinum coins
  - Special: Parchment, Elemental Portal, Amulet of Kings, Apple
  - Broken variants: All equipment types have broken state frames

#### 4. Buildings — `buildings.png`
- **Dimensions**: 736×448px
- **Frame size**: Variable (32×32 to 160×160)
- **Asset key**: `BUILDINGS`
- **Usage**: Town and dungeon structures
- **Structures**:
  - Gate: 96×32
  - Hut: 64×64
  - Straw house (east): 96×96
  - Straw house (west): 96×96
  - Burnt straw house (west): 96×96
  - Hut-temple: 160×160
- **Building variants** (for scaling):
  - `1x_buildings.png`: Smallest scale
  - `2x_buildings.png`: 2× scale
  - `3x_buildings.png`: 3× scale
  - `4x_buildings.png`: 4× scale
  - `5x_buildings.png`: 5× scale

### Special Assets

#### 5. Spells — `spells.png`
- **Dimensions**: 192×96px
- **Frame size**: 32×32
- **Total frames**: 18
- **Asset key**: `SPELLS`
- **Usage**: Spell menu icons (static for now)
- **Status**: Loaded as static sprite sheet
- **TODO**: Implement animation sequences when spell casting mechanics added

#### 6. Spell Effects — `spell_effects.png`
- **Dimensions**: 128×128px
- **Frame size**: 32×32
- **Total frames**: 16 (4×4 grid)
- **Asset key**: `SPELL_EFFECTS`
- **Usage**: Visual effects when spells are cast
- **Status**: Loaded as static sprite sheet
- **TODO**: Create animation configs when spell mechanic implemented

#### 7. RIP Screen — `RIP_blank.png`
- **Dimensions**: 428×336px
- **Asset key**: `RIP`
- **Usage**: Game-over screen background
- **Loading**: Via `this.load.image()` (not sprite sheet)
- **Status**: Single image, no frames

#### 8. Difficulty Icons — `difficulty_level.png`
- **Dimensions**: 128×32px
- **Frame size**: 32×32 (4 frames)
- **Asset key**: Not loaded
- **Status**: SKIP — cotwelm uses CSS for difficulty UI instead
- **Reason**: CSS approach is cleaner for menu UI

#### 9. Equipment Reference — `equipment-dude.jpg`
- **Dimensions**: 233×569px
- **Status**: SKIP — reference/design asset only
- **Reason**: Not used in gameplay

---

## Frame Size Reference

| Sprite Sheet | Width | Height | Type |
|---|---|---|---|
| tiles.png | 32 | 32 | Grid |
| monsters.png | 32 | 32 | Grid |
| items.png | 32 | 32 | Grid |
| buildings.png | Variable | Variable | Multi-tile |
| spells.png | 32 | 32 | Grid |
| spell_effects.png | 32 | 32 | Grid |
| RIP_blank.png | 428 | 336 | Single |

---

## Loading Strategy

**Location**: `src/scenes/boot_scene.ts` → `preload()` phase

**Method**: Call `assetLoader.loadAllAssets(this)` before scene transition

**Code structure**:
```typescript
preload(): void {
  loadAllAssets(this);  // Load all 9 assets
}

create(): void {
  this.scene.start("GameScene");  // Transition once loaded
}
```

---

## Animation Configuration

### Static Sprites (No animation)
- Tiles: Single frame per tile type
- Buildings: Single frame per building
- Items: Single frame per item
- Spells: Single frame per spell (for now)
- Spell Effects: Static frames (animation deferred)

### Future Animation Support
- **Monsters**: Animation support for walking/attacking (add configs in `GameScene.create()`)
- **Spell Effects**: Animation sequences when spell mechanics implemented
- **Character**: Walk/attack cycles tied to game input/AI

---

## Usage Examples

### Load a sprite sheet in a scene:
```typescript
// In preload()
this.load.spritesheet('tiles', 'assets/original/tiles.png', {
  frameWidth: 32,
  frameHeight: 32
});
```

### Create a sprite:
```typescript
// In create()
const tile = this.add.sprite(x, y, 'tiles', frameNumber);
```

### Display all items (grid in SpriteViewerScene):
```typescript
const itemsTexture = this.textures.get('items');
itemsTexture.frames.forEach((frame, index) => {
  const gridX = (index % 10) * 32;
  const gridY = Math.floor(index / 10) * 32;
  this.add.sprite(gridX, gridY, 'items', index);
});
```

---

## Files Modified

- `src/assets/assetLoader.ts` — Asset loading function
- `src/assets/index.ts` — ASSET_KEYS manifest
- `src/scenes/boot_scene.ts` — Call assetLoader
- `src/scenes/sprite_viewer_scene.ts` — Sprite preview UI
- `src/scenes/game_scene.ts` — Add "View Sprites" button
- `src/main.ts` — Register SpriteViewerScene

