import { GameObject, GameObjectInitialConfig } from "drake-engine";

export default class Obstacle extends GameObject {
  constructor(initialConfig?: GameObjectInitialConfig) {
    const obstacles = [
      "objects/obstacles/cube.obj",
      "objects/obstacles/halfcube.obj",
      "objects/obstacles/pyramid.obj",
    ];
    const randomObstacleMesh = obstacles[Math.floor(Math.random() * obstacles.length)];
    super(randomObstacleMesh, initialConfig);
    this.autoupdateBoxCollider = true;
  }
}
