import { Engine, Camera, Scene, GameObject, Vector, GUI, QuaternionUtils } from "drake-engine";
import _default from "drake-engine";
import PlayerTank from "./gameObjects/Player/PlayerTank";
import Enemy from "./gameObjects/enemies/Enemy";
import Crosshair from "./gameObjects/gui/crosshair";
import Radar from "./gameObjects/gui/radar";
import Obstacle from "./gameObjects/obstacles/Obstacle";
import PlayerObstacleOverlap from "./gameObjects/overlaps/PlayerObstacleOverlap";

const canvas = document.getElementById("app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("unable to find canvas");

class Battlezone extends Engine {
  //* gameObjects
  player: PlayerTank;
  enemies: GameObject[] = [
    // new Enemy([-60, 0, 0], [0.2, 0.2, 0.2])
  ];
  obstacles: Obstacle[] = [];
  // playerUI
  radar: Radar | null = null;

  //* Game controls
  public keysPressed: Set<string> = new Set();

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    this.player = new PlayerTank(this, [0, 0, 0]);
    this.player.playerCrosshair = new Crosshair();
  }

  addEventListeners() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  handleKeyDown(e: KeyboardEvent) {
    this.keysPressed.add(e.key);
  }

  handleKeyUp(e: KeyboardEvent) {
    this.keysPressed.delete(e.key);
  }

  handlePlayerMove() {
    const VELOCITY_NORMALIZATION = 100;
    const prevPosition = structuredClone(this.player.position);

    if (this.keysPressed.has("w")) {
      this.player.move(
        this.player.playerCamera!.lookDir.x * this.deltaTime * VELOCITY_NORMALIZATION,
        this.player.playerCamera!.lookDir.y * this.deltaTime * VELOCITY_NORMALIZATION,
        this.player.playerCamera!.lookDir.z * this.deltaTime * VELOCITY_NORMALIZATION
      );
    }
    if (this.keysPressed.has("s")) {
      this.player.move(
        -this.player.playerCamera!.lookDir.x * this.deltaTime * VELOCITY_NORMALIZATION,
        -this.player.playerCamera!.lookDir.y * this.deltaTime * VELOCITY_NORMALIZATION,
        -this.player.playerCamera!.lookDir.z * this.deltaTime * VELOCITY_NORMALIZATION
      );
    }
    if (this.keysPressed.has("e")) {
      this.player.playerCamera?.rotate({ x: 0, y: 1, z: 0 }, (Math.PI / 180) * 1);
    }
    if (this.keysPressed.has("q")) {
      this.player.playerCamera?.rotate({ x: 0, y: -1, z: 0 }, (Math.PI / 180) * 1);
    }
    // TODO implement better way to rotate vectors
    // TODO this one kinda sucks
    if (this.keysPressed.has("a")) {
      const q = { x: 0, y: 0, z: 0, w: 0 };
      QuaternionUtils.setFromAxisAngle(q, { x: 0, y: 1, z: 0 }, (-Math.PI / 180) * 90);

      const rotatedVector = Vector.zero();
      QuaternionUtils.rotateVector(q, this.player.playerCamera!.lookDir, rotatedVector);
      this.player.move(
        rotatedVector.x * this.deltaTime * VELOCITY_NORMALIZATION,
        rotatedVector.y * this.deltaTime * VELOCITY_NORMALIZATION,
        rotatedVector.z * this.deltaTime * VELOCITY_NORMALIZATION
      );
    }
    if (this.keysPressed.has("d")) {
      const q = { x: 0, y: 0, z: 0, w: 0 };
      QuaternionUtils.setFromAxisAngle(q, { x: 0, y: 1, z: 0 }, (Math.PI / 180) * 90);

      const rotatedVector = Vector.zero();
      QuaternionUtils.rotateVector(q, this.player.playerCamera!.lookDir, rotatedVector);
      this.player.move(
        rotatedVector.x * this.deltaTime * VELOCITY_NORMALIZATION,
        rotatedVector.y * this.deltaTime * VELOCITY_NORMALIZATION,
        rotatedVector.z * this.deltaTime * VELOCITY_NORMALIZATION
      );
    }
    if (this.keysPressed.has("z")) {
      this.player.shoot();
    }

    // check for collision with obstacles
    for (const overlap of this.currentScene.overlaps.values()) {
      if (overlap.isHappening()) {
        /** @todo wyswietlac komunikat blocked w gui */
        this.player.setPosition(prevPosition.x, prevPosition.y, prevPosition.z);
      }
    }
  }

  spawnTank() {
    if (!this.currentScene) return;

    const enemy = new Enemy([0, 0, 60], [0.07, 0.07, 0.07]);
    this.enemies.push(enemy);
    this.currentScene.addGameObject(enemy);
  }

  spawnObstacle() {
    if (!this.currentScene) return;

    const obstacle = new Obstacle({ position: [20, 0, 50], size: [0.1, 0.1, 0.1] });
    this.obstacles.push(obstacle);
    this.currentScene.addGameObject(obstacle);
    obstacle.Start = () => {
      this.currentScene.addOverlap(new PlayerObstacleOverlap(this.player, obstacle));
    };
  }

  override Start(): void {
    this.setResolution(1280, 720);
    const camera = new Camera(60, 0.1, 1000, [0, 4, 0], [0, 0, 1]);
    // Scene set up
    const mainScene = new Scene();

    mainScene.setMainCamera(camera, this.width, this.height); // add camera to scene

    const mainSceneId = this.addScene(mainScene);
    this.setCurrentScene(mainSceneId);

    // assign main camera to player
    // we use 'component' binding similar to unity one
    this.player.playerCamera = this.mainCamera!;

    // create GUI and add it to the scene
    const mainGUI = new GUI(this.getCanvas, this.getCanvas.getContext("2d")!);
    const mainGUIId = mainScene.addGUI(mainGUI);
    mainScene.setCurrentGUI(mainGUIId);

    // add radar
    this.radar = new Radar(this.enemies, this.player.playerCamera!, this.player);

    // add player GUIs to the mainGUI
    mainGUI.addElement(this.player.playerCrosshair!);
    mainGUI.addElement(this.radar);

    console.log(mainGUI.elements);

    // add player to the scene
    mainScene.addGameObject(this.player);

    this.enemies.forEach((enemy) => mainScene.addGameObject(enemy));

    // add all essential event listeners
    this.addEventListeners();

    // test purpose only
    this.spawnTank();
    this.spawnObstacle();
  }

  override Update(): void {
    this.handlePlayerMove();
  }
}

export default Battlezone;

const game = new Battlezone(canvas);
game.run();
