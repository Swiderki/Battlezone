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

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    this.player = new PlayerTank(this, [0, 0, 0]);
    const { width, height } = this.getCanvas.getBoundingClientRect();
    this.player.playerCrosshair = new Crosshair(width, height);
  }

  spawnTank() {
    if (!this.currentScene) {
      return;
    }

    const enemy = new Enemy([0, 0, 60], [0.2, 0.2, 0.2]);
    this.enemies.push(enemy);
    this.currentScene.addGameObject(enemy);
  }

  handlePlayerMove(e: KeyboardEvent) {
    if (!this.mainCamera) return;
    if (e.key === "w") this.player.move(0, 0, 1);
    if (e.key === "s") this.player.move(0, 0, -1);
    if (e.key === "a") this.player.move(-1, 0, 0);
    if (e.key === "d") this.player.move(1, 0, 0);
    if (e.key === "e") this.mainCamera.rotate({ x: 0, y: 1, z: 0 }, (Math.PI / 180) * 5);
    if (e.key === "q") this.mainCamera.rotate({ x: 0, y: -1, z: 0 }, (Math.PI / 180) * 5);
  }

  drawRadar() {
    if (!this.mainCamera) return;

    const centerX = this.width / 2;
    const radius = 80;
    const topMargin = 30;
    const color = "#f0f";
    const thickness = 3;

    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;

    // circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, radius + topMargin, radius, 0, Math.PI * 2);
    this.ctx.lineWidth = thickness;
    this.ctx.stroke();

    // outer pitch: left, right, top, bottom
    const outerPitchWidth = 20;

    this.ctx.fillRect(centerX - radius - outerPitchWidth, radius + topMargin, outerPitchWidth, thickness);
    this.ctx.fillRect(centerX + radius, radius + topMargin, outerPitchWidth, thickness);
    this.ctx.fillRect(centerX, topMargin - outerPitchWidth, thickness, outerPitchWidth);
    this.ctx.fillRect(centerX, radius * 2 + topMargin, thickness, outerPitchWidth);

    // inside fov show
    const fovRad = (this.mainCamera.fov / 180) * Math.PI;

    this.ctx.beginPath();
    this.ctx.moveTo(centerX, topMargin + radius);
    this.ctx.lineTo(
      -radius * Math.sin(fovRad / 2) + centerX,
      -radius * Math.cos(fovRad / 2) + topMargin + radius
    );
    this.ctx.moveTo(centerX, topMargin + radius);
    this.ctx.lineTo(
      -radius * Math.sin(-fovRad / 2) + centerX,
      -radius * Math.cos(fovRad / 2) + topMargin + radius
    );
    this.ctx.stroke();

    for (const enemy of this.enemies) {
      const distanceToEnemy = Math.hypot(
        this.player.position.x - enemy.position.x,
        this.player.position.z - enemy.position.z
      );

      if (distanceToEnemy > radius) {
        continue;
      }

      this.ctx.fillStyle = "#fff";
      this.ctx.fillRect(
        centerX - this.player.position.x + enemy.position.x,
        radius + topMargin + this.player.position.z - enemy.position.z,
        3,
        3
      );
    }
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
    this.player.playerCamera = this.mainCamera!;
    // add player to the scene
    mainScene.addGameObject(this.player);

    // add player controls
    document.addEventListener("keydown", this.handlePlayerMove.bind(this));

    // test purpose only
    this.spawnTank();

    console.log(Vector.dotP({ x: 1, y: 0, z: 1 }, { x: -1, y: 0, z: -1 }));
    console.log(Vector.dotP({ x: 2, y: 0, z: 2 }, { x: -2, y: 0, z: -2 }));
    console.log(Vector.length({ x: 2, y: 0, z: 2 }));
  }

  override Update(): void {
    this.drawRadar();
  }
}

export default Battlezone;

const game = new Battlezone(canvas);
game.run();
