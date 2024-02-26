import { Engine, Camera, Scene, GameObject } from "drake-engine";
import _default from "drake-engine";
import PlayerTank from "./gameObjects/Player/PlayerTank";
import Enemy from "./gameObjects/enemies/Enemy";
import Obstacle from "./gameObjects/obstacles/Obstacle";
import PlayerObstacleOverlap from "./gameObjects/overlaps/PlayerObstacleOverlap";
import { enemyInRangeMsg, enemyLocationMsg, motionBlockedMsg } from "./gameObjects/gui/messages";

const canvas = document.getElementById("app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("unable to find canvas");

class Battlezone extends Engine {
  //* gameObjects
  player: PlayerTank;
  enemies: GameObject[] = [
    // new Enemy(this, [-60, 0, 0], [.07, .07, .07]),
    // new Enemy(this, [60, 0, 0], [.07, .07, .07]),
    // new Enemy(this, [-60, 0, -60], [.07, .07, .07]),
    // new Enemy(this, [0, 0, -60], [.07, .07, .07]),
  ];
  
  obstacles: Obstacle[] = [];

  //* Game controls
  keysPressed: Set<string> = new Set();

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    this.player = new PlayerTank(this, [0, 0, 0]);
  }

  removeEnemy(enemy: Enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
        this.enemies.splice(index, 1);
    }
  }

  addEventListeners() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  handleKeyDown(e: KeyboardEvent) {
    this.keysPressed.add(e.key.toLocaleLowerCase());
  }

  handleKeyUp(e: KeyboardEvent) {
    this.keysPressed.delete(e.key.toLocaleLowerCase());
  }

  spawnTank() {
    if (!this.currentScene) {
      return;
    }

    const enemy = new Enemy(this, [10, 0, 60], [.07, .07, .07]);
    this.enemies.push(enemy);
    enemy.Update = () => {
      // console.log(enemy.desiredAngle)
    }
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
    const sceneBg = new GameObject("objects/background.obj", { color: "#00f", size: [2, 2, 2] });
    const mainScene = new Scene({
      object: sceneBg,
      position: { x: 0, y: this.canvas.height / 2 },
      repeat: true,
      rotationLikeCameraSpeed: 6,
    });

    mainScene.setMainCamera(camera, this.width, this.height); // add camera to scene

    const mainSceneId = this.addScene(mainScene);
    this.setCurrentScene(mainSceneId);

    // assign main camera to player
    // we use 'component' binding similar to unity one
    this.player.playerCamera = this.mainCamera!;

    const playerGUIId = mainScene.addGUI(this.player.playerGUI);
    mainScene.setCurrentGUI(playerGUIId);

    // game messages
    this.player.playerGUI.addElement(enemyInRangeMsg);
    this.player.playerGUI.addElement(enemyLocationMsg);
    this.player.playerGUI.addElement(motionBlockedMsg);

    // add player to the scene
    mainScene.addGameObject(this.player);

    this.enemies.forEach((enemy) => mainScene.addGameObject(enemy));

    // add all essential event listeners
    this.addEventListeners();

    //* start the main scene
    mainScene._started = true;

    // test purpose only
    this.spawnTank();
    this.spawnObstacle();
  }

  override Update(): void {
    this.player.handlePlayerMove(this.keysPressed, this.deltaTime);
  }
}

export default Battlezone;

const game = new Battlezone(canvas);
game.run();
