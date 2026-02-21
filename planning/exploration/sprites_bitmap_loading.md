# Phaser Sprite Sheet & Bitmap Loading Exploration

## Overview
Comprehensive research on loading sprite sheets and creating sprite game objects in Phaser for Castle of the Winds asset integration.

---

## 1. SPRITE SHEET LOADING METHODS

### Basic Sprite Sheet Loading
```javascript
// Preload phase
this.load.spritesheet('dude', 'assets/dude.png', {
    frameWidth: 32,
    frameHeight: 48
});
```

### Load with Configuration Object
```javascript
this.load.spritesheet({
    key: 'explosion',
    url: 'assets/sprites/explosion.png',
    frameConfig: {
        frameWidth: 64,
        frameHeight: 64,
        endFrame: 23  // Optional: specify total frames
    }
});
```

### Multiple Sprite Sheets Simultaneously
```javascript
this.load.spritesheet([
    {
        key: 'explosion',
        url: 'assets/explosion.png',
        frameConfig: { frameWidth: 64, frameHeight: 64, endFrame: 23 }
    },
    {
        key: 'balls',
        url: 'assets/balls.png',
        frameConfig: { frameWidth: 17, frameHeight: 17 }
    }
]);
```

---

## 2. SPRITE SHEETS VS TEXTURE ATLASES

### Key Distinction
- **Sprite Sheet**: Uniform cells in rows/columns with consistent frameWidth & frameHeight
- **Texture Atlas**: Frames can be any size/position, defined by metadata (JSON/XML)

### Loading Texture Atlases
```javascript
// Using Texture Packer format
this.load.atlas({
    key: 'mainmenu',
    textureURL: 'images/MainMenu.png',
    atlasURL: 'images/MainMenu.json'
});
```

### Supported Atlas Formats
- JSONHash
- JSONArray
- XML
- Unity Atlas format

### Texture Manager Direct Methods
```javascript
// Add sprite sheet from existing image element
this.textures.addSpriteSheet('myTexture', imageElement, {
    frameWidth: 32,
    frameHeight: 32
});

// Add atlas from existing image and metadata
this.textures.addAtlas('myAtlas', imageElement, atlasData, dataImage);

// Create sprite sheet from frames in an atlas
this.textures.addSpriteSheetFromAtlas('newSheetKey', {
    atlas: 'atlasKey',
    frame: 'frameNameFromAtlas',
    frameWidth: 32,
    frameHeight: 32,
    endFrame: 10
});
```

---

## 3. CREATING SPRITE GAME OBJECTS

### Simple Sprite
```javascript
// Create function
this.player = this.add.sprite(400, 300, 'dude');
```

### With Frame Specification
```javascript
// Using specific frame from sprite sheet
const alien = this.add.sprite(400, 300, 'aliens', 0);
```

### Physics-Enabled Sprite
```javascript
// Arcade Physics sprite
this.player = this.physics.add.sprite(100, 450, 'dude');
this.player.setBounce(0.2);
this.player.setCollideWorldBounds(true);
```

### Sprite Constructor
```javascript
new Sprite(scene, x, y, texture, [frame])
```

### Custom Sprite Classes
```javascript
class MySprite extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        // Custom initialization
    }
}

const mySprite = new MySprite(this, 100, 100, 'myTexture');
```

---

## 4. ANIMATION CREATION & PLAYBACK

### Creating Animations from Sprite Sheets
```javascript
// Sequential frames
this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNumbers('dude', {
        start: 0,
        end: 7
    }),
    frameRate: 8,
    repeat: -1  // -1 for infinite
});
```

### With Specific Frame Selection
```javascript
this.anims.create({
    key: 'kick',
    frames: this.anims.generateFrameNumbers('brawler', {
        frames: [0, 1, 2, 3, 4]  // Specific frames
    }),
    frameRate: 8,
    repeat: 0,  // Single playback
    repeatDelay: 1000  // Pause 1 second before replay
});
```

### From Texture Atlas (Named Frames)
```javascript
this.anims.create({
    key: 'run',
    frames: this.anims.generateFrameNames('atlas', {
        prefix: 'character_run_',
        start: 1,
        end: 8,
        suffix: '.png'
    }),
    frameRate: 10,
    repeat: -1
});
```

### Animation Config Properties
- **key**: Unique animation identifier
- **frames**: Array of frame references
- **frameRate**: Speed in FPS (default: 24)
- **repeat**: Number of repetitions (-1 = infinite)
- **yoyo**: Reverse before repeating (true/false)
- **delay**: Startup delay (milliseconds)
- **repeatDelay**: Pause between cycles (milliseconds)

### Playing Animations
```javascript
sprite.play('walk');                    // Basic
sprite.playReverse('walk');             // Backwards
sprite.playAfterDelay('walk', 1000);    // Delayed
sprite.playAfterRepeat('walk', 3);      // After repeats
sprite.chain('kick');                   // Queue next
sprite.stop();                          // Stop immediately
sprite.stopAfterDelay(500);             // Stop after delay
sprite.stopAfterRepeat(2);              // Stop after repeats
```

---

## 5. SPRITE RENDERING & DISPLAY MANAGEMENT

### Depth and Z-Index (Layering)
```javascript
// Higher depth = rendered on top
player.setDepth(100);
enemy.setDepth(50);
background.setDepth(0);
```

### Display List Operations
```javascript
sprite.bringToTop();      // Move to front
sprite.sendToBack();      // Move to back
sprite.moveUp();          // Single position up
sprite.moveDown();        // Single position down
this.children.depthSort(); // Manual depth sort
```

### Using Layers for Organization
```javascript
this.backgroundLayer = this.add.layer();
this.characterLayer = this.add.layer();
this.uiLayer = this.add.layer();

// Add sprites to layers
this.backgroundLayer.add(backgroundSprite);
this.characterLayer.add(playerSprite);
this.uiLayer.add(healthBar);

// Control all children at once
this.backgroundLayer.setAlpha(0.5);
this.uiLayer.setVisible(false);
```

---

## 6. CASTLE OF THE WINDS SPECIFIC FEATURES

### Tile-Based Rendering
```javascript
// Create repeating background texture
const background = this.add.tileSprite(400, 300, 800, 600, 'tileset');

// Scroll texture independently
background.tilePositionX += 2;
background.tilePositionY += 1;

// Scale texture
background.setTileScale(2, 2);
```

**Note**: POT (power-of-two) textures (64, 128, 256, 512) work best for TileSprite.

### Character and Enemy Sprites
```javascript
this.load.spritesheet('player', 'assets/player.png', {
    frameWidth: 32,
    frameHeight: 32
});

this.load.atlas('enemies', 'assets/enemies.png', 'assets/enemies.json');

// Create animations & sprites
this.anims.create({
    key: 'player_idle',
    frames: this.anims.generateFrameNumbers('player', { frames: [0] }),
    frameRate: 1
});

this.player = this.physics.add.sprite(100, 100, 'player');
this.player.play('player_idle');
```

### UI Element Rendering
```javascript
// Create UI layer at front
this.uiLayer = this.add.layer();
this.uiLayer.setDepth(1000);

// Add UI sprites
this.healthBar = this.add.image(50, 30, 'ui_health');
this.manaBar = this.add.image(50, 50, 'ui_mana');
this.inventory = this.add.image(750, 300, 'ui_inventory');

// Add to UI layer
this.uiLayer.add([this.healthBar, this.manaBar, this.inventory]);

// UI stays on top and visible
this.uiLayer.setScrollFactor(0, 0);  // Don't move with camera
```

---

## 7. BEST PRACTICES

1. **Asset Organization**: Group related sprites in single atlas files
2. **Frame Dimensions**: Always specify correct frameWidth/frameHeight
3. **Memory Efficiency**:
   - Load sprite sheets instead of individual images
   - Use texture atlases for multiple related graphics
   - Reuse loaded textures across multiple sprites
4. **Animation Performance**:
   - Use global animations via `this.anims.create()`
   - Set appropriate frameRate (8-10 for movement, 20+ for effects)
   - Avoid creating new animations on every frame
5. **Rendering Order**:
   - Use consistent depth values for similar object types
   - Implement layering system (background, characters, ui)
   - Sort depth at scene start rather than per frame
6. **Tile-Based Considerations**:
   - Use POT textures for TileSprite
   - Position sprites on tile grid coordinates
   - Convert between world and tile coordinates as needed
7. **Multiple Sprites Management**:
   - Group related sprites in layers
   - Use physics groups for collision management
   - Consider object pooling for frequently created/destroyed sprites

---

## Resources
- Phaser Textures Documentation
- Phaser Sprite API
- Phaser Animations Documentation
- Phaser TextureManager API
- Phaser Display List Documentation
- Phaser Layer API
- Phaser TileSprite API
