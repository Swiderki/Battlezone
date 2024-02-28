import { Engine, Camera, Scene, GameObject, GUI, Vec3DTuple } from "drake-engine";
import _default from "drake-engine";
import PlayerTank from "./gameObjects/Player/PlayerTank";
import Enemy from "./gameObjects/enemies/Enemy";
import Obstacle from "./gameObjects/obstacles/Obstacle";
import PlayerObstacleOverlap from "./gameObjects/overlaps/PlayerObstacleOverlap";
import PlayOverlay from "./gameObjects/gui/overlays/PlayOverlay";

const canvas = document.getElementById("app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("unable to find canvas");

type Overlays = {
  play?: PlayOverlay;
};

class Battlezone extends Engine {
  gameState: "lobby" | "play" | "death" = "lobby";

  //* gameObjects
  player: PlayerTank;
  enemies: GameObject[] = [];
  obstacles: Obstacle[] = [];

  private readonly battfledSize = [1000, 1000];
  private readonly spawnSize = [40, 40];
  private readonly enemyCount = 10;
  private readonly obstacleCount = 20;
  
  difficultyFactor = .1;

  gui: GUI;
  overlays: Overlays = {};

  //* Game controls
  keysPressed: Set<string> = new Set();

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    
    this.player = new PlayerTank(this, [0, 0, 0]);
    this.gui = new GUI(this.canvas, this.canvas.getContext("2d")!);
  }

  removeEnemy(enemy: Enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
    }
    setTimeout(() => this.spawnTank(), Math.max(4000, 1000 / this.difficultyFactor));
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
    if (!this.currentScene) return;
    let randomX = Math.round(Math.random() * (this.battfledSize[0] - this.spawnSize[0]) / 2) + this.spawnSize[0];
    let randomZ = Math.round(Math.random() * (this.battfledSize[0] - this.spawnSize[1]) / 2) + this.spawnSize[1];
    randomX *= Math.random() > .5 ? 1 : -1;
    randomZ *= Math.random() > .5 ? 1 : -1;

    const enemy = new Enemy(this, [randomX, 0, randomZ], [0.07, 0.07, 0.07]);
    
    this.enemies.push(enemy);
    this.currentScene.addGameObject(enemy);
  }

  spawnObstacle() {
    if (!this.currentScene) return;
    let randomX = Math.round(Math.random() * (this.battfledSize[0] - this.spawnSize[0]) / 2) + this.spawnSize[0];
    let randomZ = Math.round(Math.random() * (this.battfledSize[0] - this.spawnSize[1]) / 2) + this.spawnSize[1];
    randomX *= Math.random() > .5 ? 1 : -1;
    randomZ *= Math.random() > .5 ? 1 : -1;
    
    const obstacle = new Obstacle({ position: [randomX, 0, randomZ], size: [0.1, 0.1, 0.1] });
    
    this.obstacles.push(obstacle);
    this.currentScene.addGameObject(obstacle);
    obstacle.Start = () => {
      this.currentScene.addOverlap(new PlayerObstacleOverlap(this.player, obstacle));
    };
  }

  override Start(): void {
    this.setResolution(1280, 720);
    const camera = new Camera(60, 0.1, 10000, [this.player.position.x, 6, this.player.position.y], [0, 0, 1]);
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

    // gui setup
    const playerGUIId = mainScene.addGUI(this.gui);
    mainScene.setCurrentGUI(playerGUIId);

    this.overlays.play = new PlayOverlay(this);
    this.overlays.play.applyOverlay();
    this.gui.addElement(this.overlays.play);

    // add player to the scene
    mainScene.addGameObject(this.player);

    this.enemies.forEach((enemy) => mainScene.addGameObject(enemy));

    // add all essential event listeners
    this.addEventListeners();

    //* start the main scene
    mainScene._started = true;

    // test purpose only
    for(let i=0;i<this.obstacleCount;i++) {
      this.spawnObstacle();
    }

    for(let i=0;i<this.enemyCount;i++) {
      this.spawnTank();
    }
  }

  override Update(): void {
    this.player.handlePlayerMove(this.keysPressed, this.deltaTime);
  }
}

export default Battlezone;

const game = new Battlezone(canvas);
game.run();
