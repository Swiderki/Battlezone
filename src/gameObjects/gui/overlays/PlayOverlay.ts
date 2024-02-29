import Battlezone from "../../../main";
import Score from "../components/Score";
import Crosshair from "../components/crosshair";
import HealthBar from "../components/healthbar";
import { enemyInRangeMsg, enemyLocationMsg, motionBlockedMsg } from "../components/messages";
import Radar from "../components/radar";
import { rayCast } from "../../../util/rayCast";
import { GUIComponent } from "drake-engine";
import Overlay from "./Overlay";

export default class PlayOverlay extends Overlay {
  private crosshair?: Crosshair;
  override components: GUIComponent[] = [enemyInRangeMsg, enemyLocationMsg, motionBlockedMsg];

  constructor(game: Battlezone) {
    super(game);

    this.initComponents();
  }

  private initComponents() {
    const healthBar = new HealthBar();
    const crosshair = new Crosshair();
    const radar = new Radar(this.game.enemies, this.game.player.playerCamera!, this.game.player);
    const score = new Score(this.game.player);

    this.components.push(healthBar, crosshair, radar, score);
    this.crosshair = crosshair;
  }

  private handleCrosshair(): void {
    if (this.crosshair === undefined || this.game.player.playerCamera === undefined) {
      return;
    }

    this.crosshair.isTargeting = false;

    this.crosshair.isTargeting = false;
    this.game.enemies.some((enemy) => {
      if (enemy.boxCollider === null) return false; // prevent further errors
      if (rayCast(this.game.player.position, this.game.player.playerCamera!.lookDir, enemy.boxCollider)) {
        this.crosshair!.isTargeting = true;
        return true;
      }
      return false;
    });
  }

  changeHealthBy(amount: number) {
    for (const component of this.components) {
      if (component instanceof HealthBar) {
        component.currentHealth += amount;
      }
    }
  }

  get currentHealth() {
    for (const component of this.components) {
      if (component instanceof HealthBar) {
        return component.currentHealth;
      }
    }
    return null;
  }

  get currentHealth() {
    for (const component of this.components) {
      if (component instanceof HealthBar) {
        return component.currentHealth;
      }
    }
    return null;
  }

  override render(): void {
    this.handleCrosshair();
  }
}
