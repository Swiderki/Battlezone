import { Camera, GUIElement, GameObject } from "drake-engine";
import PlayerTank from "../../Player/PlayerTank";
import { enemyInRangeMsg, enemyLocationMsg } from "./messages";
import { GUI_MARGIN } from "../../../util/consts";

class Radar implements GUIElement {
  //* GUIElement stuff
  height: number;
  width: number;
  position: { x: number; y: number };
  //* references
  enemies: GameObject[];
  camera: Camera;
  player: PlayerTank;
  //* Radar properties
  radius = 90;
  color = "#f0f";
  thickness = 3;

  constructor(enemies: GameObject[], camera: Camera, player: PlayerTank) {
    this.width = 20;
    this.height = 20;
    this.position = { x: 0, y: 0 };
    this.enemies = enemies;
    this.camera = camera;
    this.player = player;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.camera) return;

    const canvasWidth = ctx.canvas.getBoundingClientRect().width;

    const centerX = canvasWidth / 2;

    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;

    // circle
    ctx.beginPath();
    ctx.arc(centerX, this.radius + GUI_MARGIN, this.radius, 0, Math.PI * 2);
    ctx.lineWidth = this.thickness;
    ctx.stroke();

    // outer pitch: left, right, top, bottom
    const outerPitchWidth = 20;

    ctx.fillRect(
      centerX - this.radius - outerPitchWidth,
      this.radius + GUI_MARGIN,
      outerPitchWidth,
      this.thickness
    );
    ctx.fillRect(centerX + this.radius, this.radius + GUI_MARGIN, outerPitchWidth, this.thickness);
    ctx.fillRect(centerX, GUI_MARGIN - outerPitchWidth, this.thickness, outerPitchWidth);
    ctx.fillRect(centerX, this.radius * 2 + GUI_MARGIN, this.thickness, outerPitchWidth);

    // inside fov show
    const fovRad = (this.camera.fov / 180) * Math.PI;

    ctx.beginPath();
    ctx.moveTo(centerX, GUI_MARGIN + this.radius);
    ctx.lineTo(
      -this.radius * Math.sin(fovRad / 2) + centerX,
      -this.radius * Math.cos(fovRad / 2) + GUI_MARGIN + this.radius
    );
    ctx.moveTo(centerX, GUI_MARGIN + this.radius);
    ctx.lineTo(
      -this.radius * Math.sin(-fovRad / 2) + centerX,
      -this.radius * Math.cos(fovRad / 2) + GUI_MARGIN + this.radius
    );
    ctx.stroke();

    let tooFarEnemies = 0;
    for (const enemy of this.enemies) {
      const distanceToEnemy = Math.hypot(
        this.player.position.x - enemy.position.x,
        this.player.position.z - enemy.position.z
      );

      if (distanceToEnemy > this.player.bulletRange) {
        tooFarEnemies++;
        continue;
      }

      enemyInRangeMsg.text = "ENEMY IN RANGE";

      const x = -this.player.position.x + enemy.position.x;
      const y = this.player.position.z - enemy.position.z;
      const theta = -this.camera.rotation.y * 2;

      const xPrimo = x * Math.cos(theta) - y * Math.sin(theta);
      const yPrimo = x * Math.sin(theta) + y * Math.cos(theta);

      if (xPrimo > 0 && xPrimo > Math.abs(yPrimo)) {
        enemyLocationMsg.text = "ENEMY TO RIGHT";
      } else if (yPrimo > 0 && yPrimo > Math.abs(xPrimo)) {
        enemyLocationMsg.text = "ENEMY TO REAR";
      } else if (xPrimo < 0 && yPrimo > xPrimo) {
        enemyLocationMsg.text = "ENEMY TO LEFT";
      } else {
        enemyLocationMsg.text = "";
      }

      const drawingScale = this.radius / this.player.bulletRange;

      ctx.fillStyle = "#fff";
      ctx.fillRect(centerX + xPrimo * drawingScale, this.radius + GUI_MARGIN + yPrimo * drawingScale, 3, 3);
    }

    if (tooFarEnemies === this.enemies.length) {
      enemyInRangeMsg.text = "";
      enemyLocationMsg.text = "";
    }
  }
}

export default Radar;
