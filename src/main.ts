import { Engine, Camera, Scene, GameObject, Vector, GUI } from "drake-engine";
import _default from "drake-engine";
import PlayerTank from "./gameObjects/Player/PlayerTank";
import Enemy from "./gameObjects/enemies/Enemy";
import Crosshair from "./gameObjects/gui/crosshair";

const canvas = document.getElementById("app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("unable to find canvas");

class Battlezone extends Engine {
  player: PlayerTank;
  enemies: GameObject[] = [
    new Enemy([10, 0, 30]),
    new Enemy([90, 0, 30]),
    new Enemy([10, 0, 70]),
    new Enemy([10, 0, 10]),
    new Enemy([20, 0, -50]),
  ];

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


  spawnTank() {
    if (!this.currentScene) {
      return;
    }

    const enemy = new Enemy([0, 0, 60], [0.2, 0.2, 0.2]);
    this.enemies.push(enemy);
    this.currentScene.addGameObject(enemy);
  }


  override Start(): void {
    this.setResolution(1280, 720);
    const camera = new Camera(60, 0.1, 1000, [0, 12, 0], [0, 0, 1]);
    // Scene set up
    const mainScene = new Scene();

    mainScene.setMainCamera(camera, this.width, this.height); // add camera to scene

    const mainSceneId = this.addScene(mainScene);
    this.setCurrentScene(mainSceneId);

    // create GUI and add it to the scene
    const mainGUI = new GUI(this.getCanvas, this.getCanvas.getContext("2d")!);
    const mainGUIId = mainScene.addGUI(mainGUI);
    mainScene.setCurrentGUI(mainGUIId);

    // add player GUIs to the mainGUI
    mainGUI.addElement(this.player.playerCrosshair!);
    console.log(mainGUI.elements);

    // assign main camera to player
    // we use 'component' binding similar to unity one
    this.player.playerCamera = this.mainCamera!;
    // add player to the scene
    mainScene.addGameObject(this.player);

    // add all essential event listeners 
    this.addEventListeners();

    //* start the main scene
    mainScene.started = true;
    
    // test purpose only
    this.spawnTank();
<<<<<<< HEAD
  }

  override Update(): void {
    this.player.handlePlayerMove(this.keysPressed);
    this.drawRadar();
  }
}

export default Battlezone;

const game = new Battlezone(canvas);
game.run();
