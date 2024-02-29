import Battlezone from "../../main";
import Score from "../components/Score";
import Crosshair from "../components/crosshair";
import HealthBar from "../components/healthbar";
import { enemyInRangeMsg, enemyLocationMsg, motionBlockedMsg } from "../components/messages";
import Radar from "../components/radar";
import { rayCast } from "../../util/rayCast";
import { GUIComponent } from "drake-engine";
import Overlay from "./Overlay";

export default class PlayOverlay extends Overlay {
  private crosshair?: Crosshair;
  private healthBar?: HealthBar;
  override components: GUIComponent[] = [enemyInRangeMsg, enemyLocationMsg, motionBlockedMsg];

  constructor(game: Battlezone) {
    super(game);

    this.initComponents();
  }

  private initComponents() {
    const healthBar = new HealthBar();
    const crosshair = new Crosshair();
    const radar = new Radar(this.game.enemies, this.game.player.game.camera!, this.game.player);
    const score = new Score(this.game.player);

    this.components.push(healthBar, crosshair, radar, score);
    this.crosshair = crosshair;
    this.healthBar = healthBar;
  }

  private handleCrosshair(): void {
    if (this.crosshair === undefined || this.game.player.game.camera === undefined) {
      return;
    }

    this.crosshair.isTargeting = false;

    this.crosshair.isTargeting = false;
    this.game.enemies.some((enemy) => {
      if (enemy.boxCollider === null) return false; // prevent further errors
      if (rayCast(this.game.player.position, this.game.player.game.camera!.lookDir, enemy.boxCollider)) {
        this.crosshair!.isTargeting = true;
        return true;
      }
      return false;
    });
  }

  changeHealthBy(amount: number) {
    if (!this.healthBar) return;

    this.healthBar.currentHealth += amount;
  }

  get currentHealth() {
    for (const component of this.components) {
      if (component instanceof HealthBar) {
        return Math.max(component.currentHealth, 0);
      }
    }
    return null;
  }

  override render(): void {
    this.handleCrosshair();
  }
}
