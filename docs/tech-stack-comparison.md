# Tech Stack Comparison: Castle of the Winds Rewrite

## What We're Optimizing For

Castle of the Winds is a 1989 Norse-mythology tile-based dungeon crawler RPG. This is a rewrite, not a port — we want modern architecture that supports a modern development workflow. Four criteria drive the tech stack decision:

1. **Agentic AI workflow** — AI agents write code, run validation, and iterate autonomously. The entire toolchain needs fast feedback loops: typecheck, test, and hot reload all completing in under a few seconds. If any step takes 30 seconds, the agent loop stalls and productivity collapses.

2. **Hot module reload (HMR)** — The ability to see changes instantly in the running game without restarting. This is critical for the agent loop (the agent needs to confirm its changes work) and for visual iteration (tweaking sprite positions, UI layouts, animation timing). A cold restart that takes 5 seconds is 5 seconds too many when you are iterating dozens of times per hour.

3. **Entity Component System (ECS)** — A data-oriented architecture that separates data (components) from logic (systems). Instead of deep class hierarchies, entities are composed from small, reusable data buckets. This is a natural fit for RPGs where you have many entity types (monsters, items, spells, terrain) with overlapping but distinct combinations of behaviors.

4. **Web deployment** — The game should run in a browser. All three previous versions of this project (cotwmtor, cotwelm, Castle of the Winds) were web-based. Staying on the web means reusing existing assets, avoiding platform-specific distribution headaches, and making the game instantly accessible to anyone with a browser.

---

## Option 1: Godot 4 + GDScript

Godot is a free, open-source game engine with a best-in-class 2D editor. Its scene tree hierarchy, built-in tilemap editor, and visual tools make it excellent for 2D games. GDScript is Python-like and dynamically typed, making it easy for both humans and AI to generate.

**Strengths:**
- The 2D editor is genuinely excellent. Tilemap editing, sprite animation, collision shapes — all visual and immediate.
- The scene tree hierarchy is intuitive: a `Dungeon` scene contains `Tile` scenes which contain `Sprite` and `Collider` nodes.
- GDScript is simple and readable. AI agents generate it fluently because of its Python-like syntax.
- Large community and extensive documentation.

**Weaknesses:**
- Hot reload is limited. Scene structure changes require a full restart. GDScript hot reload works for simple logic changes but can be flaky with signal connections, resource references, and scene state.
- No native ECS. The scene tree is an object-oriented hierarchy (nodes inherit from other nodes). You can bolt on ECS-like patterns, but you are fighting the engine's grain.
- Web export is a second-class citizen. Godot compiles to WASM for web, but the downloads are large (10-30 MB), audio has known issues on some browsers, and SharedArrayBuffer requirements complicate hosting.
- Agent-friendliness is decent but the tooling is editor-centric. Driving Godot headlessly (without the GUI editor) for automated testing and validation is possible but not the primary workflow the engine supports.

**Verdict:** Great engine, wrong fit. The editor-centric workflow and OOP scene tree fight against both ECS architecture and headless agent-driven development.

---

## Option 2: Bevy + Rust (WASM)

Bevy is a data-driven game engine built in Rust with ECS at its absolute core. If you want ECS purity, Bevy is the gold standard — everything is a system, component, or resource. Rust's type system catches entire categories of bugs at compile time, which has a similar appeal to Elm's compiler-driven development.

**Strengths:**
- Best ECS purity of any option. Bevy's ECS is not an add-on; it is the engine. Every game object is an entity, every piece of data is a component, every piece of logic is a system. The architecture is enforced, not optional.
- Rust's type system is extraordinarily powerful. If it compiles, it almost certainly works. Sum types (enums), pattern matching, ownership — these are the same guarantees that make Elm appealing, taken further.
- Headless testing is excellent. Systems are pure functions over queries. You can spin up a `World`, add entities with components, run a system, and assert on the results — no renderer needed.
- WASM target works. Bevy can compile to WebAssembly and run in a browser.

**Weaknesses:**
- Compile latency kills agentic loops. Even incremental Rust/Bevy builds take 5-15 seconds. Full rebuilds take 30 seconds or more. An agent that needs to write code, compile, check, and iterate cannot tolerate this. Ten iterations at 15 seconds each is over two minutes of just waiting for the compiler.
- WASM adds compilation complexity. Cross-compiling to `wasm32-unknown-unknown`, dealing with `wasm-bindgen`, configuring web audio and input — these are solvable but add friction at every step.
- Steep learning curve. Lifetimes, borrowing, trait bounds, generic system parameters — even experienced developers take weeks to become productive in Bevy. AI agents generate plausible-looking Rust that fails to compile in subtle ways.
- The 2D ecosystem is maturing but not mature. Tilemaps, sprite sheets, and UI are all available but require more manual setup than Godot or Phaser.

**Verdict:** Architecturally ideal (ECS + strong types), but the compile times are a dealbreaker for agentic development. If the feedback loop is the bottleneck, Bevy makes the bottleneck 10-30x worse.

---

## Option 3: Python + Pygame

Python is the language AI agents generate most fluently. Pygame is a venerable 2D game library. For pure logic prototyping, this combination offers the fastest iteration: write Python, run it, see results immediately.

**Strengths:**
- Best agent iteration speed for pure logic. Python runs instantly. No compilation step. AI agents generate Python more fluently than any other language.
- Pygame is simple and well-understood. Blit sprites to a surface, handle events in a loop, done.
- Excellent for prototyping game logic: turn-based combat, inventory management, pathfinding, dungeon generation. You can validate algorithms in seconds.

**Weaknesses:**
- Weakest web story of any option. Pygame has no native browser target. Pygbag exists as an experimental tool to package Pygame games for the web via WASM, but it is not production-ready, has significant limitations, and adds complexity.
- No type safety without significant effort. Python is dynamically typed. You can add type hints and enforce them with mypy or pyright, but this is opt-in and requires discipline. Without it, bugs that TypeScript or Rust would catch at compile time become runtime errors.
- No built-in ECS. You would need a library like `esper` (a lightweight Python ECS), which works but has a tiny community and limited tooling compared to bitECS or Bevy.
- Performance ceiling. Python is slow for anything computationally intensive. For a tile-based RPG with modest rendering needs this is likely fine, but it constrains future ambitions.

**Verdict:** Good for prototyping game logic in isolation, poor for shipping a web game. The lack of a viable browser target is disqualifying given our web deployment requirement.

---

## Option 4: TypeScript + Phaser + bitECS (Recommended)

This is the stack we chose. TypeScript provides type safety and instant feedback. Phaser is the most mature 2D web game framework. bitECS is a high-performance ECS library. Vite ties everything together with sub-second hot module reload.

**HMR:** Vite provides less-than-one-second hot module reload. Change a system function, save the file, and see the change reflected in the running game in the browser almost instantly. No restart, no lost state. This is the single most important property for agentic development — the agent writes code and confirms it works in under a second.

**Type safety:** `tsc --noEmit` runs an instant typecheck across the entire codebase. It catches type errors, missing properties, incorrect function signatures, and more — all before any code runs. For a developer coming from Elm, this is the familiar experience of the compiler catching your mistakes.

**Testing:** Vitest runs tests instantly using the same toolchain (Vite). Systems are pure functions that transform component data, making them straightforward to unit test without a browser, renderer, or game loop.

**ECS:** bitECS is a high-performance ECS library that uses TypedArrays and a Structure-of-Arrays (SoA) memory layout. Entities are numbers. Components are defined as schemas mapping to typed arrays (Float32Array, Uint32Array, etc.). Queries find entities matching component signatures. This is fast, cache-friendly, and architecturally clean.

**Web-native:** Phaser is built for browsers. It handles rendering (WebGL and Canvas), input (keyboard, mouse, touch), audio (Web Audio API), tilemaps, sprites, cameras, scenes, and more. There is no "web export" step because the web is the primary target.

**Agent-friendly feedback loop:**
1. Agent writes or modifies TypeScript code
2. `tsc --noEmit` — instant typecheck catches errors before runtime
3. `vitest run` — instant unit tests confirm logic correctness
4. Vite HMR — changes appear in the running game in under one second
5. Visual confirmation — the agent or developer sees the result immediately

**Division of responsibilities:**
- Phaser handles: rendering, input, audio, tilemaps, sprites, cameras, scenes, asset loading
- bitECS handles: entity lifecycle, component storage, system queries, world state management

**Verdict:** Best overall fit. Sub-second feedback loops, strong type safety, mature web ecosystem, clean ECS architecture, and excellent AI agent support.

---

## Why We Chose TypeScript for This Project

Choosing a tech stack involves trade-offs. Here is the honest reasoning behind this decision:

**The developer's background matters.** Experience with Elm means a deep appreciation for type safety, pure functions, and compiler-driven development. TypeScript delivers type safety with a vastly larger ecosystem than Elm. The transition from "the compiler catches my mistakes" in Elm to "tsc catches my mistakes" in TypeScript is natural and immediate.

**The agentic workflow demands speed.** The entire premise of this project is that AI agents drive development — writing code, running validation, iterating. This workflow lives or dies on feedback loop speed. TypeScript plus Vite delivers sub-second feedback where Rust/Bevy adds 10-30 seconds of compile time and Godot requires editor restarts. That difference compounds across hundreds of iterations per day.

**All three previous attempts were web-based.** The cotwmtor (Elm), cotwelm (Elm), and earlier versions were all browser games. Staying on the web means reusing existing sprite assets, tilemap data, and domain knowledge. It also means zero friction for anyone who wants to play the game — just open a URL.

**bitECS systems mirror Elm's update functions.** Both are pure functions that transform state. An Elm update function takes a message and a model and returns a new model. A bitECS system takes a world (the collection of all component data) and transforms it. The mental model transfers directly.

**The ecosystem is mature and AI-friendly.** npm, Vitest, Vite, Biome (linting/formatting), TypeScript itself — these are among the most widely used tools in software development. AI models have been trained extensively on TypeScript codebases. The tooling is stable, well-documented, and actively maintained.

---

## What is ECS? (Entity Component System)

ECS is an architectural pattern that separates data from logic. It is an alternative to traditional object-oriented game architectures, and it is particularly well-suited to games with many entity types that share overlapping behaviors.

### Traditional OOP Approach

In a traditional object-oriented game, you might have a class hierarchy like this:

```
Entity
  └── Monster
        ├── Goblin
        ├── Dragon
        └── Skeleton
  └── Item
        ├── Weapon
        └── Potion
```

A `Goblin` class inherits from `Monster`, which inherits from `Entity`. Data and behavior are bundled together in the class. The `Goblin` class has a `health` field and an `attack()` method and a `move()` method all in one place.

This works until it doesn't. What if you want a monster that is also an item (a mimic)? What if you want a spell effect that moves like a monster but damages like a weapon? The class hierarchy becomes a prison. Adding a new behavior means modifying the hierarchy, and every modification risks breaking existing classes.

### ECS Approach

In ECS, there are three concepts:

- **Entity**: Just an ID. A number. Nothing more. Entity 42 could be a goblin, a sword, or a fireball. The entity itself has no data and no behavior.
- **Component**: Pure data attached to an entity. `Position { x: 5, y: 10 }`, `Health { current: 20, max: 30 }`, `Sprite { texture: "goblin.png" }`, `AI { behavior: "aggressive" }`. Components are just data — they have no methods, no logic.
- **System**: A function that operates on entities with specific component combinations. A system defines a query ("give me all entities that have both Position and Velocity") and then processes those entities.

**Example:** A `MovementSystem` processes all entities that have both a `Position` component and a `Velocity` component. It reads each entity's velocity and updates its position accordingly. The system does not care whether the entity is a goblin, a fireball, or the player character. If it has Position and Velocity, it moves.

**Example:** A `RenderSystem` processes all entities that have both a `Position` component and a `Sprite` component. It draws the sprite at the position. Again, it does not care what the entity "is" — only what components it has.

### Why ECS Works for RPGs

Castle of the Winds has approximately 68 monster types, dozens of item types, various spell effects, traps, doors, treasure chests, and the player character. These entity types have overlapping but different combinations of behaviors:

- A goblin has: Position, Health, Sprite, AI, Inventory, Equipment, Stats
- A sword has: Position (when on the ground), Sprite, Equipment stats, Name
- A fireball has: Position, Velocity, Sprite, Damage, Lifetime
- The player has: Position, Health, Sprite, Inventory, Equipment, Stats, PlayerControlled

In OOP, you would need a complex class hierarchy to model these overlaps. In ECS, you just attach the relevant components to each entity. A mimic? Give it both the monster components and the item components. A cursed sword that follows the player? Give it Position, Velocity, AI, and Equipment stats. Composition replaces inheritance.

### bitECS Specifically

bitECS takes the ECS concept and optimizes it for performance using TypedArrays. Here is how it works:

- Components are defined as schemas that map to typed arrays. A `Position` component with `x` and `y` fields becomes two `Float32Array` instances — one for all x values, one for all y values.
- Entities are indices into these arrays. Entity 42's x position is `Position.x[42]`. Entity 42's y position is `Position.y[42]`.
- This Structure-of-Arrays (SoA) layout is cache-friendly. When a system iterates over all positions, it reads contiguous memory rather than jumping between scattered objects. This is fast.
- Queries use bitwise operations on component bitmasks to find matching entities, which is where the name "bitECS" comes from.

---

## The Agentic Development Loop

AI-agent-driven development is a workflow where AI agents are the primary authors of code. The developer provides direction, reviews results, and makes architectural decisions, but the agents do the bulk of the writing, testing, and iterating. This only works if the feedback loop is fast.

Here is how the loop works in practice with this stack:

1. **Agent reads context from memory MCP.** The Memory MCP (Model Context Protocol) server stores context from prior work sessions: what was built, what decisions were made, what is left to do. The agent reads this to understand the current state of the project.

2. **Agent writes or modifies TypeScript code.** Based on the task, the agent creates new files, modifies existing systems, adds components, or writes tests. TypeScript is generated fluently by modern AI models.

3. **`tsc --noEmit` — instant typecheck.** The TypeScript compiler checks the entire codebase for type errors without emitting any output files. This catches incorrect types, missing properties, bad function signatures, and more. If there are errors, the agent reads them and fixes the code immediately. This step takes milliseconds.

4. **`vitest run` — instant unit tests.** Vitest runs the test suite using the same Vite toolchain. Because ECS systems are pure functions (take component data in, produce component data out), they are straightforward to test without a browser, renderer, or running game. This step takes milliseconds to seconds depending on test count.

5. **Vite HMR — changes appear in the running game in under one second.** If the game is running in a browser, Vite's hot module replacement pushes the changed modules to the browser without a full page reload. The agent (or developer watching) sees the change reflected immediately.

6. **Agent updates memory MCP with results.** What was accomplished, what issues were encountered, what should happen next. This context persists across sessions.

This entire loop can complete in seconds. The agent writes code, validates it, sees it working, and moves on to the next task. Multiply this by dozens or hundreds of iterations per session and the productivity is substantial.

**Compare this to alternative stacks:**
- **Bevy/Rust:** Steps 3 and 4 become a single compile step that takes 10-30 seconds. Ten iterations costs two to five minutes of waiting. The agent loop stalls.
- **Godot:** Step 5 may require an editor restart instead of a hot reload. Steps 3 and 4 do not exist in the same way (GDScript is dynamically typed, testing requires the editor). The agent cannot easily drive the editor headlessly.
- **Python/Pygame:** Steps 3 does not exist without significant mypy setup. Step 5 does not exist (no HMR, must restart the game). Step 4 works well, but the lack of a web target means the final product cannot ship.

---

## Functional Programming in TypeScript

For a developer coming from Elm, TypeScript might initially feel like a step backward — you lose Elm's enforced purity, its exhaustive pattern matching, and its "if it compiles, it works" guarantee. But TypeScript supports functional programming patterns well, and the ECS architecture reinforces them.

### TypeScript's FP Support

TypeScript fully supports functional programming patterns:

- **Pure functions:** Functions that take inputs and return outputs with no side effects. TypeScript does not enforce purity, but nothing prevents you from writing pure functions exclusively.
- **Immutable data patterns:** `readonly` types prevent mutation at compile time. `ReadonlyArray<T>`, `Readonly<T>`, and `as const` assertions all enforce immutability through the type system.
- **Function composition:** Higher-order functions, closures, and pipe patterns all work naturally. Libraries like `fp-ts` or `Effect` add Option, Either, pipe, and other FP constructs if you want them.
- **Discriminated unions:** TypeScript's union types with literal discriminants give you something close to Elm's custom types. `type Action = { tag: "attack"; target: number } | { tag: "move"; direction: Direction }` works similarly to Elm's `type Msg = Attack Target | Move Direction`.

### The TEA-to-ECS Mapping

The cotwelm project used The Elm Architecture (TEA). This maps naturally onto ECS:

| Elm (TEA) | ECS (bitECS + Phaser) |
|---|---|
| `Model` — the entire application state | `World` — the collection of all component data across all entities |
| `update : Msg -> Model -> Model` — a pure function that transforms state | `System` — a pure function that queries entities by component signature and transforms component values |
| `Msg` — a description of what happened | Events and queries — what triggers a system to run and what entities it operates on |
| `view : Model -> Html Msg` — a pure function from state to UI | Phaser's render pipeline — reads component data (Position, Sprite) and draws to the canvas |

The structural similarity is significant. In Elm, you write:

```elm
update : Msg -> Model -> Model
update msg model =
    case msg of
        MovePlayer direction ->
            { model | playerPos = move direction model.playerPos }
```

In ECS with TypeScript, you write:

```typescript
const movementSystem = (world: World): World => {
  const entities = query(world, [Position, Velocity]);
  for (const eid of entities) {
    Position.x[eid] += Velocity.dx[eid];
    Position.y[eid] += Velocity.dy[eid];
  }
  return world;
};
```

Both are pure functions that transform state. The ECS version operates on all matching entities rather than a single model, but the pattern is identical: data in, transformed data out.

### Strengthening FP Guarantees

If you want stronger functional programming guarantees in TypeScript, you have options:

- **`readonly` everywhere:** Mark component access types as readonly to prevent accidental mutation outside of designated system functions.
- **`fp-ts` or `Effect`:** These libraries bring Option (instead of null), Either (instead of thrown exceptions), pipe (for function composition), and other patterns familiar from Elm and Haskell.
- **Strict compiler options:** `strict: true` in tsconfig enables a battery of checks including strict null checks, no implicit any, and more.

### The Key Insight

You do not need Elm-the-language to get Elm-the-architecture. ECS plus TypeScript gives you the same fundamental separation of data and logic that makes Elm pleasant to work with:

- Data is separate from behavior (components are pure data, systems are pure functions).
- State transformations are explicit (systems take a world and return a world).
- Composition replaces inheritance (entities are composed from components, not derived from class hierarchies).
- The type system catches mistakes before runtime (not as strongly as Elm, but strongly enough to be useful).

The trade-off is that TypeScript does not enforce these patterns — you could write imperative, mutation-heavy, side-effect-laden code if you wanted to. The discipline comes from the architecture (ECS) and from convention, not from the compiler. For a developer who already thinks in functional patterns, this is a reasonable trade-off in exchange for the massive ecosystem, tooling, and AI-agent-friendliness that TypeScript provides.
