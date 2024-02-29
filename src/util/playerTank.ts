import { Line3D, Vec3D } from "drake-engine";
import { INITIAL_PLAYER_BOX_COLLIDER } from "./consts";

export function generateDefaultBoxCollider(position: Vec3D): Line3D {
  return [
    {
      x: position.x - INITIAL_PLAYER_BOX_COLLIDER / 2,
      y: position.y - INITIAL_PLAYER_BOX_COLLIDER / 2,
      z: position.z - INITIAL_PLAYER_BOX_COLLIDER / 2,
    },
    {
      x: position.x + INITIAL_PLAYER_BOX_COLLIDER / 2,
      y: position.y + INITIAL_PLAYER_BOX_COLLIDER / 2,
      z: position.z + INITIAL_PLAYER_BOX_COLLIDER / 2,
    },
  ];
}
