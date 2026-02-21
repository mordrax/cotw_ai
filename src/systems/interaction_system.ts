import type { IWorld } from "bitecs";
import type Phaser from "phaser";

export function interactionSystem(world: IWorld, scene: Phaser.Scene): IWorld {
  // Placeholder for mouse/pointer interaction handling.
  // Future: convert pointer world coords to tile coordinates, emit events for:
  // - Map tile clicks (move-to / target)
  // - Inventory slot clicks (select / use / context menu)
  // - UI button clicks

  const pointer = scene.input.activePointer;

  // Log pointer position (stub behavior for now)
  if (pointer.isDown) {
    const worldX = pointer.worldX;
    const worldY = pointer.worldY;
    console.log(`Pointer down at world: (${worldX}, ${worldY})`);
  }

  return world;
}
