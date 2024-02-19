import { Engine, Camera, Scene, GameObject, Vector, GUI } from "drake-engine";
import _default from "drake-engine";
import PlayerTank from "./gameObjects/Player/PlayerTank";
import Enemy from "./gameObjects/enemies/Enemy";
import Crosshair from "./gameObjects/gui/crosshair";
import Radar from "./gameObjects/gui/radar";

const canvas = document.getElementById("app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("unable to find canvas");

class Battlezone extends Engine {
  //* gameObjects
  player: PlayerTank;
  enemies: GameObject[] = [
    // new Enemy([-60, 0, 0], [0.2, 0.2, 0.2])
  ];
  terrain: GameObject[] = [

  ]

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

  spawnTank() {
    if (!this.currentScene) {
      return;
    }

    const enemy = new Enemy([0, 0, 60], [.07, .07, .07]);
    this.enemies.push(enemy);
    this.currentScene.addGameObject(enemy);
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

    this.enemies.forEach(enemy => mainScene.addGameObject(enemy));

    // add all essential event listeners 
    this.addEventListeners();

    //* start the main scene
    mainScene.started = true;
    
    // test purpose only
    this.spawnTank();
  }

  override Update(): void {
    this.player.handlePlayerMove(this.keysPressed);
  }

}

export default Battlezone;

const game = new Battlezone(canvas);
game.run();
