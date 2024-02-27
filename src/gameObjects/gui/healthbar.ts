import { GUI, Icon, Vec2D } from "drake-engine";

class HealthBar {
  //* references
  private playerGUI: GUI;
  private _heartIcons: HeartIcon[] = [];

  //* healthBar specific values
  private _currentHealth: number;
  position: { x: number; y: number };

  //* constants
  private _heartGap = 40 + 10;

  constructor(startingHealth: number, gui: GUI) {
    this.position = { x: 40, y: 40 };
    this.playerGUI = gui;
    this._currentHealth = startingHealth;
    this.addStartingHealth();
  }

  private addStartingHealth() {
    for (let i = 0; i < this._currentHealth; i++) {
      const healthIcon = new HeartIcon({
        x: this.position.x + i * this._heartGap,
        y: this.position.y,
      });
      this._heartIcons.push(healthIcon);
      this.playerGUI.addElement(healthIcon);
    }
  }

  get currentHealth() {
    return this._currentHealth;
  }

  set currentHealth(value: number) {
    if (this._currentHealth === value || value <= 0) return; // no change or health below zero
    this.playerGUI.elements.forEach((v, k) => {
      if(v instanceof HeartIcon) this.playerGUI.removeElement(k);
    });
    for (let i = 0; i < value; i++) {
      const healthIcon = new HeartIcon({
        x: this.position.x + i * this._heartGap,
        y: this.position.y,
      });
      this._heartIcons.push(healthIcon);
      this.playerGUI.addElement(healthIcon);
    }
    this._currentHealth = value;
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
      strokeColor,
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
