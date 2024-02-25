import { Camera, GUIElement, GameObject } from "drake-engine";
import PlayerTank from "../Player/PlayerTank";

class Radar implements GUIElement {
  //* GUIElement stuff
  public height: number;
  public width: number;
  public position: { x: number; y: number };
  //* references
  public enemies: GameObject[];
  public camera: Camera;
  public player: PlayerTank;
  //* Radar properties
  public radius = 90;
  public color = "#f0f";
  public thickness = 3;
  public topMargin = 30;

  constructor(enemies: GameObject[], camera: Camera, player: PlayerTank) {
    this.width = 20;
    this.height = 20;
    this.position = { x: 0, y: 0 };
    this.enemies = enemies;
    this.camera = camera;
    this.player = player;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.camera) return;

    const canvasWidth = ctx.canvas.getBoundingClientRect().width;

    const centerX = canvasWidth / 2;

    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;

    // circle
    ctx.beginPath();
    ctx.arc(centerX, this.radius + this.topMargin, this.radius, 0, Math.PI * 2);
    ctx.lineWidth = this.thickness;
    ctx.stroke();

    // outer pitch: left, right, top, bottom
    const outerPitchWidth = 20;

    ctx.fillRect(
      centerX - this.radius - outerPitchWidth,
      this.radius + this.topMargin,
      outerPitchWidth,
      this.thickness
    );
    ctx.fillRect(centerX + this.radius, this.radius + this.topMargin, outerPitchWidth, this.thickness);
    ctx.fillRect(centerX, this.topMargin - outerPitchWidth, this.thickness, outerPitchWidth);
    ctx.fillRect(centerX, this.radius * 2 + this.topMargin, this.thickness, outerPitchWidth);

    // inside fov show
    const fovRad = (this.camera.fov / 180) * Math.PI;

    ctx.beginPath();
    ctx.moveTo(centerX, this.topMargin + this.radius);
    ctx.lineTo(
      -this.radius * Math.sin(fovRad / 2) + centerX,
      -this.radius * Math.cos(fovRad / 2) + this.topMargin + this.radius
    );
    ctx.moveTo(centerX, this.topMargin + this.radius);
    ctx.lineTo(
      -this.radius * Math.sin(-fovRad / 2) + centerX,
      -this.radius * Math.cos(fovRad / 2) + this.topMargin + this.radius
    );
    ctx.stroke();

    for (const enemy of this.enemies) {
      const distanceToEnemy = Math.hypot(
        this.player.position.x - enemy.position.x,
        this.player.position.z - enemy.position.z
      );

      if (distanceToEnemy > this.radius) {
        continue;
      }

      const x = -this.player.position.x + enemy.position.x;
      const y = this.player.position.z - enemy.position.z;
      const theta = -this.camera.rotation.y * 2;

      ctx.fillStyle = "#fff";
      ctx.fillRect(
        centerX + (x * Math.cos(theta) - y * Math.sin(theta)),
        this.radius + this.topMargin + (x * Math.sin(theta) + y * Math.cos(theta)),
        3,
        3
      );
    }
  }
}

export default Radar;
