import { type IWorld, defineQuery } from "bitecs";
import { Position } from "../components/position";
import { Velocity } from "../components/velocity";

const movementQuery = defineQuery([Position, Velocity]);

export function movementSystem(world: IWorld): IWorld {
  const entities = movementQuery(world);

  for (const eid of entities) {
    Position.x[eid] += Velocity.x[eid];
    Position.y[eid] += Velocity.y[eid];
  }

  return world;
}
