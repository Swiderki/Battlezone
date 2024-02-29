import { BackgroundObjectConfig, GUI, PhysicalGameObject, Scene, Vec3DTuple } from "drake-engine";
import Battlezone from "../main";
import PlayOverlay from "../gui/overlays/PlayOverlay";
import DeathOverlay from "../gui/overlays/DeathOverlay";
import { randomTupleFromRange } from "../util/math";

export default class PlayScene extends Scene {
  private game: Battlezone;
  private gui: GUI;

  constructor(game: Battlezone, background?: BackgroundObjectConfig) {
    super(background, game._isStarted);
    this.game = game;
    this.setMainCamera(game.camera, game.width, game.height);

    this.gui = new GUI(game.canvas, game.ctx);

    const guiID = this.addGUI(this.gui);
    this.setCurrentGUI(guiID);
  }

  usePlayOverlay(): void {
    this.game.overlays.play = new PlayOverlay(this.game);
    this.game.overlays.death?.removeOverlay();
    this.game.overlays.play.applyOverlay(this.gui);
    this.gui.addElement(this.game.overlays.play);
  }

  useDeathOverlay(): void {
    this.game.overlays.death = new DeathOverlay(this.game);
    this.game.overlays.play?.removeOverlay();
    this.game.overlays.death.applyOverlay(this.gui);
    this.gui.addElement(this.game.overlays.death);
  }

  override animatedObjectDestruction(gameObjectID: number) {
    const gameObject = this.gameObjects.get(gameObjectID);
    if (!gameObject) throw new Error("No objects with this id");

    const positionTuple: Vec3DTuple = [gameObject.position.x, gameObject.position.y, gameObject.position.z];

    const VELOCITIES = [
      { x: -4, y: 10, z: 0 },
      { x: -2, y: 9, z: 2 },
      { x: 0, y: 8, z: 4 },
      { x: 2, y: 8, z: -4 },
      { x: 4, y: 10, z: -2 },
      { x: 2.384, y: 6.712, z: 4.921 },
      { x: -1.234, y: 7.895, z: 3.567 },
      { x: 0.456, y: 5.123, z: -2.345 },
      { x: 3.789, y: 8.456, z: 1.234 },
      { x: -4.567, y: 9.012, z: -3.678 },
      { x: 1.234, y: 7.89, z: -2.345 },
      { x: -3.456, y: 9.876, z: 5.678 },
      { x: 2.789, y: 8.012, z: -1.234 },
      { x: -0.567, y: 6.789, z: 3.012 },
      { x: 4.567, y: 7.345, z: -4.789 },
    ];

    [...Array(15)].forEach((_, i) => {
      const randomScale = randomTupleFromRange(2, 3);
      const randomRotation = randomTupleFromRange(0.5, 2);
      const randomVelocity = randomTupleFromRange(3, 5);

      const particleObjects = ["objects/piramide.obj", "objects/cube.obj"];

      const velocities = VELOCITIES.map((velo) => ({
        x: velo.x * randomVelocity[0],
        y: velo.y * randomVelocity[1],
        z: velo.z * randomVelocity[2],
      }));

      const cube = new PhysicalGameObject(particleObjects[Math.floor(Math.random() * 2)], {
        position: positionTuple,
        size: randomScale,
        velocity: velocities[i],
      });

      cube.Update = (deltaTime) => {
        cube.velocity.x -= cube.velocity.x * deltaTime;
        cube.velocity.y -= 30 * deltaTime;
        cube.velocity.z -= cube.velocity.z * deltaTime;
        cube.rotate(
          randomRotation[0] * deltaTime,
          randomRotation[1] * deltaTime,
          randomRotation[2] * deltaTime
        );
        if (cube.position.y < 0) {
          cube.isVisible = false;
        }
      };
      return this.addGameObject(cube);
    });

    this.removeGameObject(gameObjectID);
  }
}
