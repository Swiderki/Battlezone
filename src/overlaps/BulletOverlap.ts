import { GameObject, Overlap } from "drake-engine";
import Battlezone from "../main";
import Bullet from "../gameObjects/misc/Bullet";
import Enemy from "../gameObjects/enemies/Enemy";
import { NORMAL_TANK_POINTS, SUPER_TANK_POINTS, UFO_POINTS } from "../util/consts";
import { BestScore } from "../util/BestScore";
import PlayerTank from "../gameObjects/Player/PlayerTank";
import SuperEnemy from "../gameObjects/enemies/SuperEnemy";
import UFO from "../gameObjects/enemies/UFO";
import Missile from "../gameObjects/enemies/Missle";

export class BulletOverlap extends Overlap {
  private game: Battlezone;
  target: GameObject;
  bullet: Bullet;

  constructor(obj1: Bullet | Missile, obj2: GameObject, game: Battlezone) {
    super(obj1, obj2);
    this.game = game;
    this.bullet = obj1;
    this.target = obj2;
  }

  override onOverlap(): void {
    if (!this.game.currentScene) return;
    new Audio("sounds/explosion.mp3").play();
    //* handle ufo collision
    if (this.target instanceof UFO) {
      this.game.currentScene.animatedObjectDestruction(this.target.id);
      this.game.currentScene.removeGameObject(this.bullet.id);
      this.game.player.score += UFO_POINTS;
      BestScore.checkAndSave(this.game.player.score);

      // spawn new ufo after some time
      setTimeout(() => this.game.spawnUfo(), 4000 + Math.floor(Math.random() * 6000));
      return;
    }

    if (this.target instanceof Missile) {
      this.game.removeEnemy(this.target);
      this.game.currentScene.animatedObjectDestruction(this.target.id);
      this.game.currentScene.removeGameObject(this.bullet.id);
      this.game.player.score += UFO_POINTS;
      BestScore.checkAndSave(this.game.player.score);

      // spawn new missile after some time
      setTimeout(
        () => this.game.spawnMissile(),
        Math.max(Math.floor(Math.random() * (1200 / Math.max(this.game.difficultyFactor - 1, 0.1))), 6000)
      );
      return;
    }

    //* handle enemy collision
    if (this.target instanceof Enemy && !(this.target instanceof UFO)) {
      this.game.currentScene.animatedObjectDestruction(this.target.id);
      this.game.removeEnemy(this.target);
      this.game.player.score += this.target instanceof SuperEnemy ? SUPER_TANK_POINTS : NORMAL_TANK_POINTS;
      this.game.difficultyFactor += 0.1;
      // save score every time player scores to avoid situation of losing their
      // points in case of unfinishing the game properly (e.g. power loss)
      BestScore.checkAndSave(this.game.player.score);
      this.game.currentScene.removeGameObject(this.bullet.id);

      return;
    }

    // * handle player collision
    if (this.target instanceof PlayerTank && this.bullet instanceof Missile) {
      // remove missile
      this.game.removeEnemy(this.bullet);
      this.game.currentScene.removeGameObject(this.bullet.id);

      // determine if player is dead && decease hp
      this.target.game.overlays.play?.changeHealthBy(-2);
      if (this.target.game.overlays.play?.currentHealth === 0) {
        this.game.setGameStateToDeath();
      }

      return;
    }

    //* remove on collision with obstacle
    this.game.currentScene.removeGameObject(this.bullet.id);
  }
}
