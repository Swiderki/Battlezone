import { Engine, Camera, Scene, GameObject, Vector, GUI } from "drake-engine";
import _default from "drake-engine";
import PlayerTank from "./gameObjects/Player/PlayerTank";
import Enemy from "./gameObjects/enemies/Enemy";
import Crosshair from "./gameObjects/gui/crosshair";

const canvas = document.getElementById("app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("unable to find canvas");

class Battlezone extends Engine {
  player: PlayerTank;
  public enemies: GameObject[] = [];

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    this.player = new PlayerTank(this, [0, 0, 0]);
    const { width, height } = this.getCanvas.getBoundingClientRect();
    this.player.playerCrosshair = new Crosshair(width, height);
  }

  spawnTank() {
    if(!this.currentScene) {
      return;
    }

    const enemy = new Enemy([0, 0, 60], [.2, .2, .2]);
    this.enemies.push(enemy);
    this.currentScene.addGameObject(enemy);
  }

  handlePlayerMove(e: KeyboardEvent) {
    if(!this.mainCamera) return;
    if (e.key === "w") this.player.move(0, 0, 1);
    if (e.key === "s") this.player.move(0, 0, -1);
    if (e.key === "a") this.player.move(-1, 0, 0);
    if (e.key === "d") this.player.move(1, 0, 0);
    if (e.key === "e") this.mainCamera.rotate({x: 0, y: 1, z: 0}, Math.PI / 180 * 5);
    if (e.key === "q") this.mainCamera.rotate({x: 0, y: -1, z: 0}, Math.PI / 180 * 5);
  }

  override Start(): void {
    this.setResolution(1280, 720);
    const camera =  new Camera(60, .1, 1000, [0, 12, 0], [0, 0, 1]);
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
    this.player.playerCamera = this.mainCamera!;
    // add player to the scene
    mainScene.addGameObject(this.player);

    // add player controls
    document.addEventListener("keydown", this.handlePlayerMove.bind(this));

    // test purpose only
    this.spawnTank();
   
    console.log(Vector.dotP({x: 1, y: 0, z: 1}, {x: -1, y: 0, z: -1}))
    console.log(Vector.dotP({x: 2, y: 0, z: 2}, {x: -2, y: 0, z: -2}))
    console.log(Vector.length({x: 2, y: 0, z: 2}));
  }

  override Update(): void {

  }
}

export default Battlezone;

const game = new Battlezone(canvas);
game.run();