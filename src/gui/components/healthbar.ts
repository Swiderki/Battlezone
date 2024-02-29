import { GUIComponent, Icon, Vec2D } from "drake-engine";
import { GUI_MARGIN, INITIAL_PLAYER_HEALTH } from "../../util/consts";

class HealthBar implements GUIComponent {
  //* references
  private _heartIcons: HeartIcon[] = [];

  //* healthBar specific values
  private _currentHealth: number;
  position: { x: number; y: number };

  //* constants
  private _heartGap = GUI_MARGIN + 10;

  constructor() {
    this.position = { x: GUI_MARGIN, y: GUI_MARGIN };
    this._currentHealth = INITIAL_PLAYER_HEALTH;
    this.applyInitialHealth();
  }

  private applyInitialHealth() {
    for (let i = 0; i < this._currentHealth; i++) {
      const heartIcon = new HeartIcon({
        x: this.position.x + i * this._heartGap,
        y: this.position.y,
      });
      this._heartIcons.push(heartIcon);
    }
  }

  get currentHealth() {
    return this._currentHealth;
  }

  set currentHealth(value: number) {
    if (this._currentHealth === value) return;

    console.log(value);

    this._heartIcons = [];
    for (let i = 0; i < value; i++) {
      const healthIcon = new HeartIcon({
        x: this.position.x + i * this._heartGap,
        y: this.position.y,
      });
      this._heartIcons.push(healthIcon);
    }
    this._currentHealth = value;
  }

  render(ctx: CanvasRenderingContext2D) {
    for (const heart of this._heartIcons) {
      heart.render(ctx);
    }
  }
}

class HeartIcon extends Icon {
  override width = 250;
  override height = 250;
  override fillColor = "#fff";

  constructor(position: Vec2D, width = 100, height = 100, strokeColor = "#f0f") {
    super(
      "M82.5 14L54 1L37.5 41L1 68.5L33 84H161L188.5 68.5L139.5 41L90.9444 18M82.5 14H173V18H90.9444M82.5 14L90.9444 18",
      width,
      height,
      position,
      strokeColor
    );
  }

  override render(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 9;
    const path = new Path2D(this.path);
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    const scale = Math.min(this.width / ctx.canvas.width, this.height / ctx.canvas.height);
    ctx.scale(scale, scale);
    ctx.strokeStyle = this.strokeColor;

    ctx.stroke(path);
    ctx.restore();
  }
}

export default HealthBar;
