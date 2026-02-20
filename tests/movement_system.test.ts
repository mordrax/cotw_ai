import { addComponent, addEntity, createWorld } from "bitecs";
import { describe, expect, it } from "vitest";
import { Position } from "../src/components/position";
import { Velocity } from "../src/components/velocity";
import { movementSystem } from "../src/systems/movement_system";

describe("movementSystem", () => {
  it("updates position by velocity each tick", () => {
    const world = createWorld();
    const eid = addEntity(world);

    addComponent(world, Position, eid);
    addComponent(world, Velocity, eid);

    Position.x[eid] = 10;
    Position.y[eid] = 20;
    Velocity.x[eid] = 1;
    Velocity.y[eid] = -1;

    movementSystem(world);

    expect(Position.x[eid]).toBe(11);
    expect(Position.y[eid]).toBe(19);
  });

  it("does not move entities without velocity", () => {
    const world = createWorld();
    const eid = addEntity(world);

    addComponent(world, Position, eid);
    Position.x[eid] = 5;
    Position.y[eid] = 5;

    movementSystem(world);

    expect(Position.x[eid]).toBe(5);
    expect(Position.y[eid]).toBe(5);
  });
});
