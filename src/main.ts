import { Engine, Camera, GameObject, GUI } from "drake-engine";
import _default from "drake-engine";
import PlayerTank from "./gameObjects/Player/PlayerTank";
import Enemy from "./gameObjects/enemies/Enemy";
import Obstacle from "./gameObjects/obstacles/Obstacle";
import PlayerObstacleOverlap from "./gameObjects/overlaps/PlayerObstacleOverlap";
import LobbyScene from "./Scenesss/LobbyScene";
import LobbyOverlay from "./gameObjects/gui/overlays/LobbyOverlay";
import PlayOverlay from "./gameObjects/gui/overlays/PlayOverlay";
import PlayScene from "./Scenesss/PlayScene";

const canvas = document.getElementById("app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("unable to find canvas");

type ScenesIDs = {
  lobby?: number;
  play?: number;
};

type Overlays = {
  lobby?: LobbyOverlay;
  play?: PlayOverlay;
};

class Battlezone extends Engine {
  _gameState: "lobby" | "play" | "death" = "lobby";

  //* gameObjects
  player: PlayerTank;
  enemies: GameObject[] = [
    new Enemy(this, [10, 0, 60], [0.07, 0.07, 0.07]),
    // new Enemy(this, [-60, 0, 0], [.07, .07, .07]),
    // new Enemy(this, [60, 0, 0], [.07, .07, .07]),
    // new Enemy(this, [-60, 0, -60], [.07, .07, .07]),
    // new Enemy(this, [0, 0, -60], [.07, .07, .07]),
  ];
  obstacles: Obstacle[] = [];

  camera = new Camera(60, 0.1, 1000, [0, 4, 0], [0, 0, 1]);
  gui: GUI;
  scenesIDs: ScenesIDs = {};
  overlays: Overlays = {};

  //* Game controls
  keysPressed: Set<string> = new Set();

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    this.player = new PlayerTank(this, [0, 0, 0]);
    this.gui = new GUI(this.canvas, this.canvas.getContext("2d")!);
  }

  // game state manipulation

  setGameStateToLobby(): LobbyScene {
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

    return lobbyScene;
  }

  setGameStateToPlay() {
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

    console.log(playScene, this.currentScene);

    // add player to the scene
    playScene.addGameObject(this.player);

    this.enemies.forEach((enemy) => playScene.addGameObject(enemy));

    // add all essential event listeners
    this.addEventListeners();

    // test purpose only
    // this.spawnTank();
    this.spawnObstacle();
  }

  removeAllScenes() {
    this.removeCurrentScene();
    Object.values(this.scenesIDs).forEach((sceneID) => this.removeScene(sceneID));
  }

  addEventListeners(): void {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  removeEventListeners(): void {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
    document.removeEventListener("keyup", this.handleKeyUp.bind(this));
  }

  handleKeyDown(e: KeyboardEvent): void {
    this.keysPressed.add(e.key.toLocaleLowerCase());
  }

  handleKeyUp(e: KeyboardEvent): void {
    this.keysPressed.delete(e.key.toLocaleLowerCase());
  }

  spawnTank() {
    if (!this.currentScene) {
      return;
    }

    const enemy = new Enemy(this, [10, 0, 60], [0.07, 0.07, 0.07]);
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

    const obstacle = new Obstacle({ position: [20, 0, 50], size: [0.1, 0.1, 0.1] });
    this.obstacles.push(obstacle);
    this.currentScene.addGameObject(obstacle);
    obstacle.Start = () => {
      this.currentScene.addOverlap(new PlayerObstacleOverlap(this.player, obstacle));
    };
  }

  override Start(): void {
    this.setResolution(1280, 720);

    // Scene set up
    const lobbyScene = this.setGameStateToLobby();

    // assign main camera to player
    // we use 'component' binding similar to unity one
    this.player.playerCamera = this.mainCamera!;
  }

  override Update(): void {
    this.player.handlePlayerMove(this.keysPressed, this.deltaTime);
  }
}

export default Battlezone;

const game = new Battlezone(canvas);
game.run();
