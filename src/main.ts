import { Engine, Camera, GameObject } from "drake-engine";
import _default from "drake-engine";
import PlayerTank from "./gameObjects/Player/PlayerTank";
import Enemy from "./gameObjects/enemies/Enemy";
import Obstacle from "./gameObjects/obstacles/Obstacle";
import PlayerObstacleOverlap from "./overlaps/PlayerObstacleOverlap";
import LobbyScene from "./Scenes/LobbyScene";
import LobbyOverlay from "./gui/overlays/LobbyOverlay";
import PlayOverlay from "./gui/overlays/PlayOverlay";
import PlayScene from "./Scenes/PlayScene";
import DeathOverlay from "./gui/overlays/DeathOverlay";

const canvas = document.getElementById("app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("unable to find canvas");

type ScenesIDs = {
  lobby?: number;
  play?: number;
};

type Overlays = {
  lobby?: LobbyOverlay;
  play?: PlayOverlay;
  death?: DeathOverlay;
};

class Battlezone extends Engine {
  _gameState: "lobby" | "play" | "death" = "death";

  //* gameObjects
  player: PlayerTank;
  enemies: GameObject[] = [];
  obstacles: Obstacle[] = [];

  private readonly battfledSize = [1000, 1000];
  private readonly spawnSize = [40, 40];
  private readonly enemyCount = 10;
  private readonly obstacleCount = 20;

  difficultyFactor = 0.1;

  camera = new Camera(60, 0.1, 1000, [0, 4, 0], [0, 0, 1]);
  scenesIDs: ScenesIDs = {};
  overlays: Overlays = {};

  //* Game controls
  keysPressed: Set<string> = new Set();

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    this.player = new PlayerTank(this, [0, 0, 0]);
  }

  // game state manipulation

  setGameStateToLobby(): void {
    this.removeAllScenes();

    const sceneBg = new GameObject("objects/background.obj", { color: "#00f", size: [2, 2, 2] });
    const lobbyScene = new LobbyScene(this, {
      object: sceneBg,
      position: { x: 0, y: this.canvas.height / 2 },
      repeat: true,
      rotationLikeCameraSpeed: 6,
    });
    lobbyScene.useLobbyOverlay();

    this.scenesIDs.lobby = this.addScene(lobbyScene);

    this.removeEventListeners();

    this._gameState = "lobby";
    this.setCurrentScene(this.scenesIDs.lobby!);
  }

  setGameStateToPlay(): void {
    this.removeAllScenes();

    const sceneBg = new GameObject("objects/background.obj", { color: "#00f", size: [2, 2, 2] });
    const playScene = new PlayScene(this, {
      object: sceneBg,
      position: { x: 0, y: this.canvas.height / 2 },
      repeat: true,
      rotationLikeCameraSpeed: 6,
    });
    playScene.usePlayOverlay();

    this.scenesIDs.play = this.addScene(playScene);
    this.setCurrentScene(this.scenesIDs.play);

    // test purpose only
    // this.spawnTank();
    for (let i = 0; i < this.obstacleCount; i++) {
      this.spawnObstacle();
    }

    for (let i = 0; i < this.enemyCount; i++) {
      this.spawnTank();
    }

    // add player to the scene
    playScene.addGameObject(this.player);

    this.enemies.forEach((enemy) => playScene.addGameObject(enemy));

    // add all essential event listeners
    this.addEventListeners();
  }

  setGameStateToDeath() {
    if (!(this.currentScene instanceof PlayScene)) {
      console.error("Death state can be set only after play state! Current state: ", this._gameState);
      console.error(this.currentScene);
      throw new Error();
    }

    this.currentScene.useDeathOverlay();
    this.removeEventListeners();
    this.keysPressed.clear();
    // this.pauseGame();
  }

  removeAllScenes() {
    this.removeCurrentScene();

    if (this.scenesIDs.lobby) this.removeScene(this.scenesIDs.lobby);
    if (this.scenesIDs.play) this.removeScene(this.scenesIDs.play);

    delete this.scenesIDs.lobby;
    delete this.scenesIDs.play;
  }

  addEventListeners(): void {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }

  removeEventListeners(): void {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  }

  // those 2 function have to be arrow function to avoid this refering to document
  handleKeyDown = (e: KeyboardEvent) => {
    this.keysPressed.add(e.key.toLocaleLowerCase());
  };

  handleKeyUp = (e: KeyboardEvent) => {
    this.keysPressed.delete(e.key.toLocaleLowerCase());
  };

  spawnTank() {
    if (!this.currentScene) return;
    let randomX =
      Math.round((Math.random() * (this.battfledSize[0] - this.spawnSize[0])) / 2) + this.spawnSize[0];
    let randomZ =
      Math.round((Math.random() * (this.battfledSize[0] - this.spawnSize[1])) / 2) + this.spawnSize[1];
    randomX *= Math.random() > 0.5 ? 1 : -1;
    randomZ *= Math.random() > 0.5 ? 1 : -1;

    const enemy = new Enemy(this, [randomX, 0, randomZ], [0.07, 0.07, 0.07]);

    this.enemies.push(enemy);
    this.currentScene.addGameObject(enemy);
  }

  removeEnemy(enemy: Enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
    }
  }

  spawnObstacle() {
    if (!this.currentScene) return;
    let randomX =
      Math.round((Math.random() * (this.battfledSize[0] - this.spawnSize[0])) / 2) + this.spawnSize[0];
    let randomZ =
      Math.round((Math.random() * (this.battfledSize[0] - this.spawnSize[1])) / 2) + this.spawnSize[1];
    randomX *= Math.random() > 0.5 ? 1 : -1;
    randomZ *= Math.random() > 0.5 ? 1 : -1;

    const obstacle = new Obstacle({ position: [randomX, 0, randomZ], size: [0.1, 0.1, 0.1] });

    this.obstacles.push(obstacle);
    this.currentScene.addGameObject(obstacle);
    obstacle.Start = () => {
      this.currentScene.addOverlap(new PlayerObstacleOverlap(this.player, obstacle));
    };
  }

  override Start(): void {
    this.setResolution(1280, 720);

    // Scene set up
    this.setGameStateToLobby();

    // assign main camera to player
    // we use 'component' binding similar to unity one
    this.player.playerCamera = this.mainCamera!;

    setTimeout(() => this.spawnTank(), Math.max(4000, 1000 / this.difficultyFactor));
  }

  override Update(): void {
    this.player.handlePlayerMove(this.keysPressed, this.deltaTime);
  }
}

export default Battlezone;

const game = new Battlezone(canvas);
game.run();
