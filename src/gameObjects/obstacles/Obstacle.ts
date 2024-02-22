import { GameObject, GameObjectInitialConfig } from "drake-engine";

export default class Obstacle extends GameObject {
  constructor(initialConfig?: GameObjectInitialConfig) {
    const obastacles = [
      "objects/obstacles/cube.obj",
      "objects/obstacles/halfcube.obj",
      "objects/obstacles/missile.obj",
      "objects/obstacles/pyramid.obj",
    ];
    const randomObstycleMesh = obastacles[Math.floor(Math.random() * obastacles.length)];
    super(randomObstycleMesh, initialConfig);
    this.autoupdateBoxCollider = true;
    this.showBoxcollider = true;
  }
}
