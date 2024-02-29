import { GameObject, Overlap } from "drake-engine";
import Battlezone from "../main";
import Bullet from "../gameObjects/misc/Bullet";
import Enemy from "../gameObjects/enemies/Enemy";
import { NORMAL_TANK_POINTS } from "../util/consts";
import { BestScore } from "../util/BestScore";
import PlayerTank from "../gameObjects/Player/PlayerTank";

export class BulletOverlap extends Overlap {
  private game: Battlezone;
  target: GameObject;
  bullet: Bullet;

  constructor(obj1: Bullet, obj2: GameObject, game: Battlezone) {
    super(obj1, obj2);
    this.game = game;
    this.bullet = obj1;
    this.target = obj2;
  }

  override onOverlap(): void {
    if (!this.game.currentScene) return;

    //* handle enemy collision
    if (this.target instanceof Enemy) {
      this.game.currentScene.animatedObjectDestruction(this.target.id);
      this.game.removeEnemy(this.target);
      this.game.player.score += NORMAL_TANK_POINTS;
      this.game.difficultyFactor += 0.1;
      // save score every time player scores to avoid situation of losing their
      // points in case of unfinishing the game properly (e.g. power loss)
      BestScore.checkAndSave(this.game.player.score);
    }

    //* handle player collision
    if (this.target instanceof PlayerTank) {
      this.target.game.overlays.play?.changeHealthBy(-1);

      if (this.target.game.overlays.play?.currentHealth === 0) {
        this.game.setGameStateToDeath();
      }
    }

    this.game.currentScene.removeGameObject(this.bullet.id);
  }
}
