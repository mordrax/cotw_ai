import { type IWorld, addComponent, addEntity } from "bitecs";
import { Health } from "../components/health";
import { Position } from "../components/position";
import { Sprite } from "../components/sprite";

export function createPlayer(world: IWorld, x: number, y: number): number {
  const eid = addEntity(world);

  addComponent(world, Position, eid);
  Position.x[eid] = x;
  Position.y[eid] = y;

  addComponent(world, Health, eid);
  Health.current[eid] = 100;
  Health.max[eid] = 100;

  addComponent(world, Sprite, eid);
  Sprite.tileIndex[eid] = 0;

  return eid;
}
