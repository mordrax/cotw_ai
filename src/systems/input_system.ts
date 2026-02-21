import { type IWorld, defineQuery } from "bitecs";
import Phaser from "phaser";
import { Input } from "../components/input";

const inputQuery = defineQuery([Input]);

export function inputSystem(world: IWorld, scene: Phaser.Scene): IWorld {
  // Reset all input fields each frame
  const entities = inputQuery(world);
  for (const eid of entities) {
    Input.dx[eid] = 0;
    Input.dy[eid] = 0;
    Input.isInteract[eid] = 0;
    Input.isInventory[eid] = 0;
    Input.isMagic[eid] = 0;
    Input.isWait[eid] = 0;
  }

  // Sample keyboard state — assume player is the first (and only) entity with Input component
  if (entities.length === 0) return world;

  const playerId = entities[0];
  const keyboard = scene.input.keyboard;

  if (!keyboard) return world;

  // Arrow keys and WASD
  const cursors = keyboard.createCursorKeys();
  const wKey = keyboard.addKey("W");
  const aKey = keyboard.addKey("A");
  const sKey = keyboard.addKey("S");
  const dKey = keyboard.addKey("D");

  // Numpad keys for 8-directional movement
  const numpad1 = keyboard.addKey("NUMPAD_1");
  const numpad2 = keyboard.addKey("NUMPAD_2");
  const numpad3 = keyboard.addKey("NUMPAD_3");
  const numpad4 = keyboard.addKey("NUMPAD_4");
  const numpad5 = keyboard.addKey("NUMPAD_5");
  const numpad6 = keyboard.addKey("NUMPAD_6");
  const numpad7 = keyboard.addKey("NUMPAD_7");
  const numpad8 = keyboard.addKey("NUMPAD_8");
  const numpad9 = keyboard.addKey("NUMPAD_9");

  // Period key for wait
  const periodKey = keyboard.addKey("PERIOD");

  // Action keys
  const spaceKey = keyboard.addKey("SPACE");
  const enterKey = keyboard.addKey("ENTER");
  const iKey = keyboard.addKey("I");
  const mKey = keyboard.addKey("M");
  const escKey = keyboard.addKey("ESC");

  // Cardinal directions: compute dx/dy
  const isNorth = cursors.up.isDown || wKey.isDown || numpad8.isDown;
  const isSouth = cursors.down.isDown || sKey.isDown || numpad2.isDown;
  const isWest = cursors.left.isDown || aKey.isDown || numpad4.isDown;
  const isEast = cursors.right.isDown || dKey.isDown || numpad6.isDown;

  // Diagonal overrides cardinal
  if (numpad7.isDown) {
    Input.dx[playerId] = -1;
    Input.dy[playerId] = -1;
  } else if (numpad9.isDown) {
    Input.dx[playerId] = 1;
    Input.dy[playerId] = -1;
  } else if (numpad1.isDown) {
    Input.dx[playerId] = -1;
    Input.dy[playerId] = 1;
  } else if (numpad3.isDown) {
    Input.dx[playerId] = 1;
    Input.dy[playerId] = 1;
  } else {
    // Cardinal movement
    if (isEast) Input.dx[playerId] = 1;
    if (isWest) Input.dx[playerId] = -1;
    if (isSouth) Input.dy[playerId] = 1;
    if (isNorth) Input.dy[playerId] = -1;
  }

  // Action flags — use JustDown for one-shot behavior
  if (Phaser.Input.Keyboard.JustDown(spaceKey) || Phaser.Input.Keyboard.JustDown(enterKey)) {
    Input.isInteract[playerId] = 1;
  }
  if (Phaser.Input.Keyboard.JustDown(iKey)) {
    Input.isInventory[playerId] = 1;
  }
  if (Phaser.Input.Keyboard.JustDown(mKey)) {
    Input.isMagic[playerId] = 1;
  }
  if (Phaser.Input.Keyboard.JustDown(numpad5) || Phaser.Input.Keyboard.JustDown(periodKey)) {
    Input.isWait[playerId] = 1;
  }

  return world;
}
