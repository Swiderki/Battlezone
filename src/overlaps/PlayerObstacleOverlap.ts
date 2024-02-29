import { Overlap } from "drake-engine";
import PlayerTank from "../gameObjects/Player/PlayerTank";
import Obstacle from "../gameObjects/obstacles/Obstacle";

export default class PlayerObstacleOverlap extends Overlap {
  declare obj1: PlayerTank;
  declare obj2: Obstacle;

  constructor(player: PlayerTank, obstacle: Obstacle) {
    super(player, obstacle);
  }
}
