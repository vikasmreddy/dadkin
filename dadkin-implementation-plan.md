# Dadkin Implementation Plan

A comprehensive technical and game design document for implementing "Dadkin" - a 2D pixel-art platformer game.

---

## Table of Contents

1. [Game Overview](#game-overview)
2. [Technical Stack](#technical-stack)
3. [Game Architecture](#game-architecture)
4. [Core Systems](#core-systems)
5. [Characters & Sprites](#characters--sprites)
6. [Game Objects & Mechanics](#game-objects--mechanics)
7. [Enemies](#enemies)
8. [Boss Fights](#boss-fights)
9. [Level Design](#level-design)
10. [World Structure](#world-structure)
11. [Controls & Input](#controls--input)
12. [Audio](#audio)
13. [UI/UX](#uiux)
14. [Asset Pipeline](#asset-pipeline)
15. [Implementation Phases](#implementation-phases)
16. **[MVP: First Playable Level](#mvp-first-playable-level)** ← Start Here!
17. [File Structure](#file-structure)

---

## Game Overview

### Concept
**Dadkin** is a 2D side-scrolling platformer with a 16-bit pixel art aesthetic. Players control a pumpkin dad navigating through kitchen-themed levels to rescue his mini-pumpkin children.

### Key Features
- 5 worlds with 10 levels each (50 total levels)
- Kitchen-themed enemies (food and kitchen supplies)
- Unique boss battle per world
- Kid rescue at end of each level with funny dialogue
- Classic platformer mechanics with puzzle elements

### Target Platforms
- Web browsers (Chrome, Firefox, Safari, Edge)
- Mobile web (iOS Safari, Android Chrome)
- Tablet support (iPad, Android tablets)

---

## Technical Stack

### Recommended Game Engine: **Phaser 3**

**Rationale:**
- Mature, well-documented 2D game framework
- Excellent mobile/touch support built-in
- No backend required - pure JavaScript
- Strong physics engine (Arcade Physics or Matter.js)
- Great tilemap support for level design
- Active community and extensive tutorials
- MIT licensed and free to use

**Alternative Options:**
- **Kaplay (formerly Kaboom.js)**: Simpler API, good for beginners
- **PixiJS**: Lower-level, more control but more work
- **Excalibur.js**: TypeScript-native, good documentation

### Technology Stack

```
Frontend:
├── Phaser 3 (Game Engine)
├── TypeScript (Type safety, better tooling)
├── Vite (Build tool, hot reload)
├── Tiled (Level editor - exports to JSON)
└── Aseprite/Piskel (Sprite creation)

Hosting (Static):
├── GitHub Pages
├── Netlify
├── Vercel
└── Cloudflare Pages
```

### Browser Requirements
- ES6+ JavaScript support
- Canvas/WebGL support
- Touch events for mobile
- Audio context for sound

---

## Game Architecture

### Scene Structure

```
Scenes/
├── BootScene          # Load essential assets, show logo
├── PreloadScene       # Load all game assets with progress bar
├── MainMenuScene      # Title screen, play button, settings
├── WorldSelectScene   # Select unlocked worlds
├── LevelSelectScene   # Select levels within a world
├── GameScene          # Main gameplay
├── PauseScene         # Pause menu overlay
├── DialogueScene      # Kid rescue dialogue overlay
├── BossScene          # Boss battle (extends GameScene)
├── GameOverScene      # Death/retry screen
└── CreditsScene       # End game credits
```

### State Management

```typescript
interface GameState {
  currentWorld: number;       // 1-5
  currentLevel: number;       // 1-10
  livesRemaining: number;     // Default: 3
  kidsRescued: number[];      // Array of level IDs
  worldsUnlocked: number[];   // Unlocked world IDs
  levelsCompleted: {          // Per-world level completion
    [worldId: number]: number[];
  };
  settings: {
    musicVolume: number;
    sfxVolume: number;
    touchControls: boolean;
  };
}
```

### Save System
- Use `localStorage` for persistence
- Auto-save after each level completion
- Save settings changes immediately

---

## Core Systems

### 1. Physics System

Use Phaser's Arcade Physics for simplicity and performance:

```typescript
// Physics configuration
const physicsConfig = {
  gravity: { x: 0, y: 800 },
  tileBias: 16,  // Helps with tilemap collisions
};

// Player physics body
player.body.setSize(24, 32);      // Hitbox size
player.body.setOffset(4, 0);      // Hitbox offset
player.body.setMaxVelocity(200, 600);
player.body.setDrag(600, 0);      // Ground friction
```

### 2. Collision System

```typescript
// Collision groups
enum CollisionCategory {
  PLAYER = 0x0001,
  GROUND = 0x0002,
  HAZARD = 0x0004,
  ENEMY = 0x0008,
  INTERACTIVE = 0x0010,
  COLLECTIBLE = 0x0020,
}

// Collision handlers
this.physics.add.collider(player, groundLayer);
this.physics.add.collider(player, platforms);
this.physics.add.overlap(player, hazards, handleDeath);
this.physics.add.overlap(player, enemies, handleDeath);
this.physics.add.overlap(player, keys, collectKey);
this.physics.add.overlap(player, kid, rescueKid);
```

### 3. Animation System

```typescript
// Animation configuration for Dadkin
const playerAnimations = {
  idle: { frames: [0, 1], frameRate: 2, repeat: -1 },
  walk: { frames: [0, 1, 2, 3, 4], frameRate: 10, repeat: -1 },
  jump: { frames: [5], frameRate: 1, repeat: 0 },
  fall: { frames: [6], frameRate: 1, repeat: 0 },
  death: { frames: [7, 8, 9, 10], frameRate: 8, repeat: 0 },
  land: { frames: [11], frameRate: 1, repeat: 0 },
};
```

### 4. Camera System

```typescript
// Camera follows player with dead zone
this.cameras.main.startFollow(player, true, 0.1, 0.1);
this.cameras.main.setDeadzone(100, 50);
this.cameras.main.setBounds(0, 0, levelWidth, levelHeight);
```

---

## Characters & Sprites

### Dadkin (Player Character)

**Visual Design:**
- Round pumpkin body
- Small stem on top
- Simple face (two dots for eyes, small mouth)
- 32x32 pixel sprite size

**Sprite Sheet Requirements:**

| Animation | Frames | Description |
|-----------|--------|-------------|
| Idle | 2 | Subtle breathing/bobbing |
| Walk | 5 | Walking cycle (reversible for left/right) |
| Jump | 1 | Squished upward pose |
| Fall | 1 | Stretched downward pose |
| Land | 2 | Impact squash and recover |
| Death | 4 | Shocked face (!!), shrink, fall off screen |
| Push | 4 | Leaning forward, pushing animation |

**Physics Properties:**
```typescript
const playerConfig = {
  moveSpeed: 160,
  jumpVelocity: -350,
  gravity: 800,
  drag: 600,
  bounceOnLand: 0,
  coyoteTime: 100,      // ms - can still jump after leaving platform
  jumpBufferTime: 100,  // ms - buffer jump input before landing
};
```

### Kid (Mini Pumpkin)

**Visual Design:**
- Smaller pumpkin (16x16 or 24x24)
- Cute expression
- Different accessories per world (hat, bow, etc.)

**Sprite Sheet Requirements:**

| Animation | Frames | Description |
|-----------|--------|-------------|
| Idle | 2 | Waiting/bouncing |
| Excited | 4 | Sees Dadkin approaching |
| Talking | 3 | Mouth moving during dialogue |

**Rescue Animation Sequence:**
1. Dadkin touches kid
2. Dadkin bounces backward
3. Dadkin lands facing kid
4. Dialogue box appears
5. Kid says something funny
6. Level complete fanfare

---

## Game Objects & Mechanics

### Platforms & Terrain

| Object | Behavior | Visual |
|--------|----------|--------|
| Ground Tile | Static, solid | Basic tile |
| One-Way Platform | Pass through from below | Thin platform |
| Moving Platform (H) | Horizontal oscillation | Platform on track |
| Moving Platform (V) | Vertical oscillation | Platform on track |
| Crumbling Platform | Falls after stood on | Cracked texture |

**Moving Platform Configuration:**
```typescript
interface MovingPlatform {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speed: number;
  pauseTime: number;  // ms pause at endpoints
}
```

### Hazards

| Hazard | Behavior | Kill Zone |
|--------|----------|-----------|
| Spikes | Static | Top surface |
| Spike Ball | Static or swinging | Entire sprite |
| Saw | Rotating, static or moving | Entire sprite |
| Water | Static | Top surface |

**Hazard Implementation:**
```typescript
// All hazards use overlap detection
this.physics.add.overlap(player, hazardGroup, () => {
  if (!player.isInvincible) {
    this.handlePlayerDeath();
  }
});
```

### Interactive Objects

#### Buttons & Button Blocks

```typescript
interface Button {
  id: string;
  linkedBlocks: string[];  // IDs of blocks this controls
  isPressed: boolean;
  isPermanent: boolean;    // Stay pressed or spring back
}

interface ButtonBlock {
  id: string;
  linkedButton: string;
  initialState: 'solid' | 'hidden';  // Toggle on button press
}
```

**Button Mechanics:**
- Player lands on button → button animates to pressed state
- Linked button blocks toggle visibility/collision
- For boss fights: buttons may be temporary (spring back)

#### Keys & Key Blocks

```typescript
interface Key {
  id: string;
  linkedBlocks: string[];
}

// On key collect:
// 1. Key disappears with sparkle effect
// 2. Linked key blocks fade out
// 3. Play unlock sound
```

#### Springs

```typescript
interface Spring {
  launchVelocity: number;  // Negative Y velocity
  cooldown: number;        // ms before can trigger again
}

// Default spring launches player at -500 velocity
// Strong springs at -700 velocity
```

#### Pushable Boxes

```typescript
interface PushableBox {
  weight: number;        // Affects push speed
  canFall: boolean;      // Falls when unsupported
  crushesPlayer: boolean;
}

// Box pushing:
// - Player must be grounded
// - Player moves slower while pushing
// - Box moves with player
// - Box affected by gravity if canFall
```

#### Balloons

```typescript
interface Balloon {
  riseSpeed: number;     // Upward velocity when attached
  maxHeight: number;     // Pops at this Y or after time
  lifetime: number;      // ms before automatic pop
}

// Balloon behavior:
// 1. Player touches balloon from below
// 2. Player attaches and rises
// 3. Player can move horizontally while attached
// 4. Balloon pops after lifetime or hitting ceiling
// 5. Player enters fall state
```

---

## Enemies

All enemies kill on contact. Player cannot kill enemies (except bosses).

### Knife

**Behavior:**
- Moves horizontally along ground
- Fast in one direction, slow returning
- Bounces off walls

```typescript
const knifeConfig = {
  fastSpeed: 200,
  slowSpeed: 80,
  spriteWidth: 48,
  spriteHeight: 16,
};
```

**Animation:**
- Slight wobble while moving
- Gleam effect periodically

### Tea Kettle

**Behavior:**
- Stationary enemy
- Activates when player gets close (proximity trigger)
- Three-phase attack:
  1. Steam rises from spout (warning)
  2. Chime/whistle sound plays
  3. Lid pops, hot water expels (kill zone expands)

```typescript
const teaKettleConfig = {
  triggerRadius: 100,
  steamDuration: 500,    // ms
  attackDuration: 1500,  // ms
  cooldown: 2000,        // ms before can attack again
  waterSprayWidth: 64,
  waterSprayHeight: 48,
};
```

### Cheese Shredder (Basic Enemy Version)

**Behavior:**
- Hops toward player
- Has a rectangular hitbox
- Patrols a set area

```typescript
const shredderEnemyConfig = {
  hopHeight: -200,
  hopDistance: 50,
  hopCooldown: 1000,
  detectionRange: 150,
};
```

### Future Enemy Ideas (Per World)

| World | Theme | Enemies |
|-------|-------|---------|
| 1 | Kitchen Basics | Knife, Tea Kettle, Shredder |
| 2 | Breakfast | Toaster, Spatula, Rolling Pin |
| 3 | Dinner | Fork, Pot, Blender |
| 4 | Dessert | Whisk, Cookie Cutter, Ice Cream Scoop |
| 5 | BBQ | Tongs, Grill, Meat Thermometer |

---

## Boss Fights

### Boss Fight Framework

```typescript
interface BossConfig {
  health: number;           // Hits to defeat (usually 3)
  phases: BossPhase[];      // Different attack patterns per health
  arena: ArenaConfig;       // Boss room layout
  vulnerableState: string;  // When can be damaged
}

interface BossPhase {
  healthThreshold: number;  // Phase starts at this health
  attackPattern: Attack[];
  speed: number;
  aggressionLevel: number;
}
```

### World 1 Boss: Cheese Shredder

**Arena Layout:**
```
┌─────────────────────────────────────┐
│ ▼▼▼▼▼▼▼▼▼ CEILING SPIKES ▼▼▼▼▼▼▼▼▼ │
│                                     │
│                                     │
│                                     │
│  [PLATFORM]  [BUTTON]  [PLATFORM]   │
│                                     │
│ ████████████     ████████████████   │
│             │PIT│                   │
│             │///│  (SPRINGS)        │
│             └───┘                   │
└─────────────────────────────────────┘
```

**Boss Behavior:**
```typescript
const cheeseShredderBoss = {
  health: 3,
  size: { width: 64, height: 80 },
  
  phases: {
    1: {
      jumpInterval: 2000,
      jumpHeight: -400,
      trackingAccuracy: 0.5,  // 50% accurate player prediction
    },
    2: {
      jumpInterval: 1500,
      jumpHeight: -450,
      trackingAccuracy: 0.7,
    },
    3: {
      jumpInterval: 1200,
      jumpHeight: -500,
      trackingAccuracy: 0.9,
    },
  },
};
```

**Fight Mechanics:**
1. Boss jumps toward player's position (with prediction)
2. Player must lure boss near pit
3. Player hits button → button blocks over pit disappear
4. Boss falls into pit
5. Springs in pit launch boss upward
6. Boss hits ceiling spikes → takes damage
7. Boss recovers, button blocks reappear
8. Repeat 3 times to defeat

**Implementation Flow:**
```typescript
// Boss state machine
enum BossState {
  IDLE,
  JUMPING,
  LANDING,
  FALLING_IN_PIT,
  LAUNCHED,
  DAMAGED,
  RECOVERING,
  DEFEATED,
}
```

### Future Boss Ideas

| World | Boss | Mechanic |
|-------|------|----------|
| 2 | Giant Toaster | Dodge toast projectiles, reflect back |
| 3 | Pressure Cooker | Release pressure valves in sequence |
| 4 | Mixer | Dodge spinning attachments, hit power cord |
| 5 | BBQ Grill | Extinguish flames, close lid |

---

## Level Design

### Level Structure

Each level is created using Tiled Map Editor and exported as JSON.

**Tilemap Layers:**
```
Layers (bottom to top):
├── Background          # Decorative, no collision
├── Background Details  # Additional decoration
├── Ground              # Main collision layer
├── Platforms           # One-way platforms
├── Hazards             # Spikes, saws, etc.
├── Interactive         # Buttons, springs, etc.
├── Enemies             # Enemy spawn points
├── Collectibles        # Keys, kids
└── Foreground          # In front of player (decoration)
```

**Object Layers:**
```
Objects:
├── PlayerSpawn         # Starting position
├── KidLocation         # End of level kid
├── MovingPlatforms     # With path data
├── Triggers            # Checkpoints, events
└── CameraBounds        # Level boundaries
```

### Level Progression Curve

```
World 1 (Tutorial World):
├── Level 1: Basic movement, jumping
├── Level 2: Moving platforms (horizontal)
├── Level 3: Springs introduction
├── Level 4: Buttons and button blocks
├── Level 5: First enemy (Knife)
├── Level 6: Combination mechanics
├── Level 7: Keys and key blocks
├── Level 8: Tea Kettle enemy
├── Level 9: Pushable boxes
└── Level 10: BOSS - Cheese Shredder
```

### Tile Sizes

- Base tile: 16x16 pixels
- Character grid: 32x32 pixels
- Level dimensions: Variable, typically 50-200 tiles wide, 15-30 tiles tall

---

## World Structure

### World Themes

| World | Name | Visual Theme | Color Palette |
|-------|------|--------------|---------------|
| 1 | Kitchen | Countertops, cabinets | Warm browns, cream |
| 2 | Breakfast Nook | Sunny, morning light | Yellows, oranges |
| 3 | Dining Room | Elegant, formal | Deep reds, wood |
| 4 | Dessert Pantry | Sweet, colorful | Pastels, pink |
| 5 | Backyard BBQ | Outdoor, evening | Sunset oranges, grays |

### World Unlocking

- World 1: Unlocked by default
- Worlds 2-5: Unlock by defeating previous world's boss

### Level Unlocking

- Level 1 of each world: Unlocked when world unlocks
- Levels 2-10: Unlock sequentially by completing previous level

---

## Controls & Input

### Keyboard Controls

| Action | Key | Alternative |
|--------|-----|-------------|
| Move Left | ← Arrow | A |
| Move Right | → Arrow | D |
| Jump | Space | W / ↑ Arrow |
| Pause | Escape | P |

### Touch Controls (Mobile)

```
┌─────────────────────────────────────┐
│                                     │
│            GAME AREA                │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  [←]  [→]              [JUMP]       │
│   Movement              Action      │
└─────────────────────────────────────┘
```

**Touch Control Implementation:**
```typescript
// Virtual button zones (percentage of screen)
const touchZones = {
  left: { x: 0, y: 0.7, width: 0.15, height: 0.3 },
  right: { x: 0.15, y: 0.7, width: 0.15, height: 0.3 },
  jump: { x: 0.7, y: 0.7, width: 0.3, height: 0.3 },
};

// Also support swipe-up for jump (optional)
```

### Input Handling

```typescript
class InputManager {
  // Support simultaneous keyboard and touch
  isLeftPressed(): boolean;
  isRightPressed(): boolean;
  isJumpPressed(): boolean;
  isJumpJustPressed(): boolean;  // For jump buffering
  
  // Vibration feedback for mobile (optional)
  vibrate(duration: number): void;
}
```

---

## Audio

### Sound Effects

| Event | Sound | Priority |
|-------|-------|----------|
| Jump | Soft "boing" | Medium |
| Land | Soft thud | Low |
| Death | Sad "splat" | High |
| Button Press | Click/mechanical | Medium |
| Spring Launch | Sproing | Medium |
| Key Collect | Sparkle/chime | High |
| Door Open | Whoosh | Medium |
| Kid Rescue | Happy jingle | High |
| Boss Hit | Impact + roar | High |
| Boss Defeat | Victory fanfare | High |
| Balloon Pop | Pop | Medium |

### Enemy Sounds

| Enemy | Sound |
|-------|-------|
| Knife | Swoosh while moving |
| Tea Kettle | Whistle when activated |
| Shredder | Grinding noise |

### Music

| Scene | Style | Loop |
|-------|-------|------|
| Main Menu | Cheerful, inviting | Yes |
| World 1 | Upbeat kitchen sounds | Yes |
| Boss Fight | Intense, faster tempo | Yes |
| Victory | Triumphant fanfare | No |
| Game Over | Sad, short | No |

### Audio Configuration

```typescript
const audioConfig = {
  musicVolume: 0.5,
  sfxVolume: 0.7,
  musicFadeTime: 1000,  // ms
  // Respect device silent mode on mobile
};
```

---

## UI/UX

### Main Menu

```
┌─────────────────────────────────────┐
│                                     │
│           🎃 DADKIN 🎃              │
│                                     │
│         [ START GAME ]              │
│         [ CONTINUE ]                │
│         [ SETTINGS ]                │
│                                     │
│     🎃🎃🎃  (animated kids)  🎃🎃🎃   │
└─────────────────────────────────────┘
```

### HUD (In-Game)

```
┌─────────────────────────────────────┐
│ 🎃 x3      World 1-3      🗝️ x1   │
│ Lives      Level ID       Keys     │
├─────────────────────────────────────┤
│                                     │
│            GAME AREA                │
│                                     │
└─────────────────────────────────────┘
```

### Dialogue Box

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ 🎃 "Thanks Dad! I was scared    │ │
│ │     of the angry cheese!"       │ │
│ │                    [Continue]   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Responsive Design

```typescript
// Scale game to fit screen while maintaining aspect ratio
const gameConfig = {
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 480,   // Base resolution
    height: 270,  // 16:9 aspect ratio
  },
  pixelArt: true,  // Crisp pixel rendering
};
```

---

## Asset Pipeline

### Sprite Creation Workflow

1. **Design**: Sketch in Aseprite/Piskel at 1x scale
2. **Animate**: Create frame-by-frame animations
3. **Export**: PNG sprite sheets with consistent frame sizes
4. **Pack**: Use TexturePacker or Phaser's built-in atlas support
5. **Load**: Import as sprite atlases in Phaser

### Tileset Creation

1. **Design**: Create 16x16 tiles in Aseprite
2. **Organize**: Arrange in tileset image (powers of 2)
3. **Import**: Load into Tiled as tileset
4. **Design Levels**: Build levels in Tiled
5. **Export**: Export as JSON from Tiled

### Asset Organization

```
assets/
├── sprites/
│   ├── player/
│   │   ├── dadkin.png
│   │   └── dadkin.json (atlas)
│   ├── enemies/
│   ├── items/
│   └── effects/
├── tilesets/
│   ├── world1-kitchen.png
│   ├── world2-breakfast.png
│   └── ...
├── levels/
│   ├── world1/
│   │   ├── level1.json
│   │   └── ...
│   └── ...
├── audio/
│   ├── music/
│   └── sfx/
└── ui/
    ├── buttons/
    ├── icons/
    └── fonts/
```

---

## Implementation Phases

### Phase 1: Core Engine (Foundation)
- [ ] Project setup (Vite + TypeScript + Phaser)
- [ ] Basic scene management
- [ ] Asset loading system
- [ ] Input handling (keyboard + touch)
- [ ] Basic physics setup
- [ ] Camera system

### Phase 2: Player Character
- [ ] Dadkin sprite and animations
- [ ] Movement mechanics (walk, run)
- [ ] Jump mechanics (with coyote time, jump buffer)
- [ ] Death and respawn system
- [ ] Collision with terrain

### Phase 3: Level Basics
- [ ] Tilemap loading from Tiled JSON
- [ ] Ground collision
- [ ] One-way platforms
- [ ] Moving platforms
- [ ] Camera bounds

### Phase 4: Interactive Objects
- [ ] Springs
- [ ] Buttons and button blocks
- [ ] Keys and key blocks
- [ ] Pushable boxes
- [ ] Balloons

### Phase 5: Hazards
- [ ] Spike implementation
- [ ] Spike balls (static + swinging)
- [ ] Saws (static + moving)
- [ ] Water zones

### Phase 6: Enemies
- [ ] Enemy base class
- [ ] Knife enemy
- [ ] Tea Kettle enemy
- [ ] Shredder enemy (patrol version)

### Phase 7: Level Completion
- [ ] Kid character and placement
- [ ] Rescue animation sequence
- [ ] Dialogue system
- [ ] Funny dialogue content
- [ ] Level complete transition

### Phase 8: Boss System
- [ ] Boss arena framework
- [ ] Cheese Shredder boss AI
- [ ] Boss health system
- [ ] Boss defeat sequence
- [ ] World unlock system

### Phase 9: Game Flow
- [ ] Main menu
- [ ] World select screen
- [ ] Level select screen
- [ ] Pause menu
- [ ] Game over screen
- [ ] Save/load system

### Phase 10: Audio
- [ ] Sound effect integration
- [ ] Music system
- [ ] Volume controls
- [ ] Mobile audio handling

### Phase 11: Polish
- [ ] Particle effects
- [ ] Screen shake
- [ ] UI animations
- [ ] Loading screens
- [ ] Performance optimization

### Phase 12: Content Creation
- [ ] Design all 50 levels
- [ ] Create all sprites and animations
- [ ] Write kid dialogue (50 unique lines)
- [ ] Design 5 boss fights
- [ ] Compose/source music

### Phase 13: Testing & Launch
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Performance profiling
- [ ] Bug fixes
- [ ] Deploy to hosting

---

## MVP: First Playable Level

This section provides a focused, step-by-step plan to get a **playable first level** as quickly as possible using placeholder assets. The goal is to have something testable that proves core mechanics work.

### MVP Scope

**What we're building:**
- Dadkin can move left/right and jump
- A simple test level with platforms and ground
- One hazard type (spikes)
- One interactive object (spring)
- Goal area (placeholder for kid) that triggers "level complete"
- Basic death/respawn

**What we're NOT building yet:**
- Menus, world select, level select
- Enemies or bosses
- Save system
- Audio
- Multiple levels

### Placeholder Assets Needed

| Asset | Placeholder | Final Asset |
|-------|-------------|-------------|
| Dadkin | `dadkin.png` (already have!) | Sprite sheet with animations |
| Ground tile | Colored rectangle (brown) | Kitchen tileset |
| Platform | Colored rectangle (gray) | Themed platform |
| Spikes | Red triangles | Pixel art spikes |
| Spring | Green rectangle | Animated spring |
| Kid/Goal | Small orange circle | Mini pumpkin sprite |
| Background | Solid color | Parallax background |

### Step-by-Step Implementation

---

#### Step 1: Project Setup
**Goal:** Get Phaser running with hot reload

**Tasks:**
- [ ] Initialize npm project
- [ ] Install dependencies: `phaser`, `vite`, `typescript`
- [ ] Create `vite.config.ts` with proper config
- [ ] Create basic `index.html`
- [ ] Create `src/main.ts` entry point
- [ ] Verify game canvas appears in browser

**Files to create:**
```
dadkin/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    └── main.ts
```

**Validation:** Browser shows black game canvas, console shows "Phaser v3.x"

---

#### Step 2: Basic Scene Structure
**Goal:** Load and display the dadkin sprite

**Tasks:**
- [ ] Create `PreloadScene.ts` - loads assets
- [ ] Create `GameScene.ts` - main gameplay
- [ ] Move `dadkin.png` to `public/assets/sprites/`
- [ ] Load and display dadkin sprite centered on screen

**Files to create:**
```
src/
├── scenes/
│   ├── PreloadScene.ts
│   └── GameScene.ts
└── config/
    └── game.config.ts
```

**Validation:** Dadkin sprite appears on screen

---

#### Step 3: Player Movement
**Goal:** Dadkin moves with arrow keys and jumps with space

**Tasks:**
- [ ] Create `Player.ts` entity class
- [ ] Enable Arcade Physics
- [ ] Implement left/right movement
- [ ] Implement jump (only when grounded)
- [ ] Add temporary ground (rectangle at bottom)
- [ ] Flip sprite based on direction

**Code structure:**
```typescript
// Player.ts
class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  
  update() {
    // Handle movement
    if (this.cursors.left.isDown) {
      this.setVelocityX(-160);
      this.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(160);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }
    
    // Handle jump
    if (this.cursors.space.isDown && this.body.blocked.down) {
      this.setVelocityY(-350);
    }
  }
}
```

**Validation:** Can move Dadkin left/right, jump, and land on ground

---

#### Step 4: Simple Level with Platforms
**Goal:** Create a hand-coded test level (no Tiled yet)

**Tasks:**
- [ ] Create ground platform spanning bottom
- [ ] Add 3-4 floating platforms at different heights
- [ ] Set up camera bounds
- [ ] Make camera follow player (if level is wider than screen)

**Level layout (code-based for now):**
```typescript
// Simple platform data
const platforms = [
  { x: 0, y: 550, width: 800, height: 50 },      // Ground
  { x: 200, y: 400, width: 150, height: 20 },    // Platform 1
  { x: 450, y: 300, width: 150, height: 20 },    // Platform 2
  { x: 100, y: 200, width: 150, height: 20 },    // Platform 3
];
```

**Validation:** Can jump between platforms, explore level

---

#### Step 5: Hazards (Spikes)
**Goal:** Touching spikes kills player and respawns

**Tasks:**
- [ ] Create placeholder spike graphics (red triangles)
- [ ] Add spike group to level
- [ ] Detect overlap between player and spikes
- [ ] Implement death: player disappears, respawns at start
- [ ] Add brief invincibility after respawn

**Code:**
```typescript
// Death handling
this.physics.add.overlap(player, spikes, () => {
  this.handleDeath();
});

handleDeath() {
  player.setVisible(false);
  player.setActive(false);
  
  this.time.delayedCall(500, () => {
    player.setPosition(spawnX, spawnY);
    player.setVisible(true);
    player.setActive(true);
  });
}
```

**Validation:** Touching spikes kills player, respawns at start

---

#### Step 6: Interactive Object (Spring)
**Goal:** Springs launch player upward

**Tasks:**
- [ ] Create placeholder spring graphic (green rectangle)
- [ ] Add spring group to level
- [ ] Detect overlap between player and spring
- [ ] Apply upward velocity (-500) when touched from above
- [ ] Add visual feedback (spring compresses)

**Validation:** Jumping on spring launches player higher than normal jump

---

#### Step 7: Goal/Kid (Level Complete)
**Goal:** Reaching the kid triggers level complete

**Tasks:**
- [ ] Create placeholder kid graphic (small orange circle)
- [ ] Place kid at end of level
- [ ] Detect overlap between player and kid
- [ ] Show "Level Complete!" text
- [ ] Restart level after 2 seconds (for now)

**Validation:** Reaching kid shows victory message

---

#### Step 8: Touch Controls (Mobile Support)
**Goal:** Playable on mobile devices

**Tasks:**
- [ ] Create `TouchControls.ts` UI component
- [ ] Add left/right buttons (bottom-left)
- [ ] Add jump button (bottom-right)
- [ ] Wire buttons to player input
- [ ] Only show on touch devices

**Validation:** Can play full level on phone/tablet

---

#### Step 9: Polish & Cleanup
**Goal:** Make it feel like a real game

**Tasks:**
- [ ] Add gravity and tweak physics values for good feel
- [ ] Add coyote time (can jump briefly after leaving platform)
- [ ] Add jump buffering (queue jump if pressed just before landing)
- [ ] Add simple background color
- [ ] Display "World 1-1" text in corner

**Validation:** Movement feels responsive and fun

---

### MVP Checklist Summary

```
[ ] Step 1: Project Setup
    [ ] npm init, install deps
    [ ] Vite + TypeScript config
    [ ] Basic HTML + main.ts
    [ ] Phaser canvas renders

[ ] Step 2: Scene Structure  
    [ ] PreloadScene loads dadkin.png
    [ ] GameScene displays sprite

[ ] Step 3: Player Movement
    [ ] Left/right with arrow keys
    [ ] Jump with space
    [ ] Gravity and ground collision
    [ ] Sprite flipping

[ ] Step 4: Platforms
    [ ] Ground platform
    [ ] 3-4 floating platforms
    [ ] Camera follows player

[ ] Step 5: Spikes (Hazard)
    [ ] Placeholder spike graphics
    [ ] Death on contact
    [ ] Respawn at start

[ ] Step 6: Spring
    [ ] Placeholder spring graphic
    [ ] Launch player upward

[ ] Step 7: Goal/Kid
    [ ] Placeholder kid graphic
    [ ] "Level Complete" on contact

[ ] Step 8: Touch Controls
    [ ] D-pad buttons
    [ ] Jump button
    [ ] Mobile responsive

[ ] Step 9: Polish
    [ ] Coyote time
    [ ] Jump buffer
    [ ] Good physics feel
```

### After MVP: Next Steps

Once the MVP is working:
1. **Replace placeholders** with real pixel art
2. **Add Tiled integration** for proper level design
3. **Add more mechanics** (buttons, keys, moving platforms)
4. **Add enemies** (knife, then tea kettle)
5. **Add menus** and game flow
6. **Add audio**
7. **Build more levels**

---

## File Structure

```
dadkin/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── dadkin-implementation-plan.md
│
├── src/
│   ├── main.ts                 # Entry point
│   ├── config/
│   │   ├── game.config.ts      # Phaser config
│   │   └── constants.ts        # Game constants
│   │
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── PreloadScene.ts
│   │   ├── MainMenuScene.ts
│   │   ├── WorldSelectScene.ts
│   │   ├── LevelSelectScene.ts
│   │   ├── GameScene.ts
│   │   ├── BossScene.ts
│   │   ├── PauseScene.ts
│   │   ├── DialogueScene.ts
│   │   └── GameOverScene.ts
│   │
│   ├── entities/
│   │   ├── Player.ts
│   │   ├── Kid.ts
│   │   ├── enemies/
│   │   │   ├── Enemy.ts        # Base class
│   │   │   ├── Knife.ts
│   │   │   ├── TeaKettle.ts
│   │   │   └── Shredder.ts
│   │   └── bosses/
│   │       ├── Boss.ts         # Base class
│   │       └── CheeseShredder.ts
│   │
│   ├── objects/
│   │   ├── Spring.ts
│   │   ├── Button.ts
│   │   ├── ButtonBlock.ts
│   │   ├── Key.ts
│   │   ├── KeyBlock.ts
│   │   ├── PushableBox.ts
│   │   ├── Balloon.ts
│   │   ├── MovingPlatform.ts
│   │   └── hazards/
│   │       ├── Spike.ts
│   │       ├── SpikeBall.ts
│   │       ├── Saw.ts
│   │       └── Water.ts
│   │
│   ├── systems/
│   │   ├── InputManager.ts
│   │   ├── AudioManager.ts
│   │   ├── SaveManager.ts
│   │   ├── DialogueManager.ts
│   │   └── LevelLoader.ts
│   │
│   ├── ui/
│   │   ├── HUD.ts
│   │   ├── TouchControls.ts
│   │   ├── MenuButton.ts
│   │   └── DialogueBox.ts
│   │
│   └── utils/
│       ├── math.ts
│       └── helpers.ts
│
├── public/
│   └── assets/
│       ├── sprites/
│       ├── tilesets/
│       ├── levels/
│       ├── audio/
│       └── ui/
│
├── game-design/               # Original design docs
│   ├── dadkingame.md
│   └── drawings/
│
└── tools/
    └── level-editor/          # Tiled project files
```

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

---

## Additional Notes

### Performance Considerations
- Use object pooling for enemies and projectiles
- Limit particle counts on mobile
- Use sprite atlases to reduce draw calls
- Implement level streaming for large levels (if needed)

### Accessibility
- High contrast option
- Configurable controls
- Screen reader support for menus (optional)
- Colorblind-friendly hazard indicators

### Future Expansion Ideas
- Speed run mode with timer
- Collectible achievements
- Unlockable skins for Dadkin
- Level editor for user-created content
- Multiplayer co-op mode

---

*Document created from game design materials in `/game-design/` folder.*
*Last updated: January 25, 2026*

---

## Current Assets

| Asset | Status | Location |
|-------|--------|----------|
| Dadkin sprite | Ready | `assets/dadkin.png` |
| Ground tiles | Placeholder needed | - |
| Platforms | Placeholder needed | - |
| Spikes | Placeholder needed | - |
| Springs | Placeholder needed | - |
| Kid | Placeholder needed | - |
