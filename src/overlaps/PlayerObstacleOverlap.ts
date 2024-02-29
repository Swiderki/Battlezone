import { Overlap } from "drake-engine";
import PlayerTank from "../gameObjects/Player/PlayerTank";
import Obstacle from "../gameObjects/obstacles/Obstacle";
import Enemy from "../gameObjects/enemies/Enemy";

export default class PlayerObstacleOverlap extends Overlap {
  declare obj1: PlayerTank;
  declare obj2: Obstacle | Enemy;

  constructor(player: PlayerTank, obstacle: Obstacle | Enemy) {
    super(player, obstacle);
  }
}
