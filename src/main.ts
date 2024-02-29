import { Engine, Camera, GameObject, Vector, Vec3D } from "drake-engine";
import _default from "drake-engine";
import PlayerTank from "./gameObjects/Player/PlayerTank";
import Enemy from "./gameObjects/enemies/Enemy";
import Obstacle from "./gameObjects/obstacles/Obstacle";
import PlayerObstacleOverlap from "./overlaps/PlayerObstacleOverlap";
import LobbyScene from "./Scenes/LobbyScene";
import LobbyOverlay from "./gui/overlays/LobbyOverlay";
import PlayOverlay from "./gui/overlays/PlayOverlay";
import PlayScene from "./Scenes/PlayScene";
import SuperEnemy from "./gameObjects/enemies/SuperEnemy";
import UFO from "./gameObjects/enemies/UFO";
import DeathOverlay from "./gui/overlays/DeathOverlay";
import Missile from "./gameObjects/enemies/Missle";

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
  _gameState: "lobby" | "play" | "death" = "lobby";

  //* gameObjects
  player: PlayerTank;
  enemies: GameObject[] = [];
  obstacles: Obstacle[] = [];
  ufo?: UFO;

  private readonly battleFieldSize = [1000, 1000];
  private readonly spawnSize = [60, 60];
  private readonly startingEnemyAmount = 4;
  private readonly startingObstacleAmount = 10;

  difficultyFactor = 0;

  // default camera is first-person
  private _thirdPerson: boolean = false;
  thirdPersonCameraDistance: number = 50;

  firstPersonCameraHeight: number = 4;
  thirdPersonCameraHeight: number = 8;

  camera = new Camera(60, 0.1, 1000, [0, this.firstPersonCameraHeight, 0], [0, 0, 1]);

  scenesIDs: ScenesIDs = {};
  overlays: Overlays = {};

  //* Game controls
  keysPressed: Set<string> = new Set();

  get thirdPerson() {
    return this._thirdPerson;
  }
  set thirdPerson(val: boolean) {
    this.player.isVisible = val;
    this._thirdPerson = val;

    this.camera.position = {
      x: this.player.position.x,
      y: this.firstPersonCameraHeight,
      z: this.player.position.z,
    };
  }

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    this.player = new PlayerTank(this, [0, 0, 0], [0.07, 0.07, 0.07]);
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
    for (let i = 0; i < this.startingObstacleAmount; i++) {
      this.spawnObstacle();
    }

    for (let i = 0; i < this.startingEnemyAmount; i++) {
      // this.spawnTank("normal");
    }

    // add player to the scene
    playScene.addGameObject(this.player);

    this.enemies.forEach((enemy) => playScene.addGameObject(enemy));

    // add all essential event listeners
    this.addEventListeners();

    setTimeout(() => this.spawnUfo(), 4000 + Math.floor(Math.random() * 6000));

    setTimeout(() => this.spawnMissile(), 10000 + Math.floor(Math.random() * 10000));
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

  spawnTank(type: "normal" | "super") {
    if (!this.currentScene) return;
    const randomPos = this.pickValidCoridantes();

    if (type === "normal") {
      const enemy = new Enemy(this, [randomPos.x, 0, randomPos.z], [0.07, 0.07, 0.07]);

      this.enemies.push(enemy);
      this.currentScene.addGameObject(enemy);

      return;
    }
    const enemy = new SuperEnemy(this, [randomPos.x, 0, randomPos.z], [0.07, 0.07, 0.07]);

    this.enemies.push(enemy);
    this.currentScene.addGameObject(enemy);
  }

  spawnUfo() {
    console.log("spawned ufo");
    const pos = this.pickValidCoridantes();
    this.ufo = new UFO(this, [pos.x, 0, pos.z], [0.07, 0.07, 0.07]);
    this.currentScene.addGameObject(this.ufo);
  }

  spawnMissile() {
    const pos = this.pickValidCoridantes();
    const missile = new Missile(this, [pos.x, 0, pos.z], [0.07, 0.07, 0.07]);
    this.currentScene.addGameObject(missile);
    this.enemies.push(missile);
  }

  removeEnemy(enemy: Enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
    }

    this.handleGameProgression();
  }

  handleGameProgression() {
    const maxEnemies = this.startingEnemyAmount + Math.floor(this.difficultyFactor * 3);
    const superEnemyPercentage = Math.max(0, Math.min(0.4, this.difficultyFactor / 1));
    const superEnemiesAmount = Math.floor(maxEnemies * superEnemyPercentage);
    const regularEnemiesAmount = maxEnemies - superEnemiesAmount;

    console.table([
      ["difficulty", "enemies", "super enemies", "super enemies %"],
      [this.difficultyFactor, regularEnemiesAmount, superEnemiesAmount, superEnemyPercentage],
    ]);
    // Count currently deployed enemies
    let currentEnemiesAmount = 0;
    let currentSuperEnemiesAmount = 0;
    for (const enemy of this.enemies) {
      if (enemy instanceof Enemy) {
        if (enemy instanceof SuperEnemy) {
          currentSuperEnemiesAmount++;
        } else {
          currentEnemiesAmount++;
        }
      }
    }

    // Determine how many more enemies to spawn
    const remainingRegularEnemies = Math.max(0, regularEnemiesAmount - currentEnemiesAmount);
    const remainingSuperEnemies = Math.max(0, superEnemiesAmount - currentSuperEnemiesAmount);

    // Spawn regular enemies
    for (let i = 0; i < remainingRegularEnemies; i++) {
      this.spawnTank("normal");
    }

    // Spawn super enemies
    for (let i = 0; i < remainingSuperEnemies; i++) {
      // Spawn super enemies with different properties
      // For now, let's assume it's similar to spawning regular enemies
      this.spawnTank("super");
    }
  }

  spawnObstacle() {
    if (!this.currentScene) return;
    let randomX =
      Math.round((Math.random() * (this.battleFieldSize[0] - this.spawnSize[0])) / 2) + this.spawnSize[0];
    let randomZ =
      Math.round((Math.random() * (this.battleFieldSize[0] - this.spawnSize[1])) / 2) + this.spawnSize[1];
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

    this.player.game.camera = this.mainCamera!;
  }

  pickValidCoridantes(): Vec3D {
    let randomX =
      Math.round((Math.random() * (this.battleFieldSize[0] - this.spawnSize[0])) / 2) + this.spawnSize[0];
    let randomZ =
      Math.round((Math.random() * (this.battleFieldSize[0] - this.spawnSize[1])) / 2) + this.spawnSize[1];
    randomX *= Math.random() > 0.5 ? 1 : -1;
    randomZ *= Math.random() > 0.5 ? 1 : -1;
    const pos = { x: randomX, y: 0, z: randomZ };
    const playerDistance = Vector.length(Vector.subtract(this.player.position, pos));
    if (playerDistance < 60) return this.pickValidCoridantes();
    for (const obstacle of this.obstacles) {
      const distance = Vector.length(Vector.subtract(obstacle.position, pos));
      if (distance < 60) return this.pickValidCoridantes();
    }

    return pos;
  }

  override Update(): void {
    this.player.handlePlayerMove(this.keysPressed, this.deltaTime);
  }
}

export default Battlezone;

const game = new Battlezone(canvas);
game.run();
