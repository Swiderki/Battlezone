import { GameObject, Overlap } from "drake-engine";
import Battlezone from "../main";
import Bullet from "../gameObjects/misc/Bullet";
import Enemy from "../gameObjects/enemies/Enemy";
import { NORMAL_TANK_POINTS, SUPER_TANK_POINTS, UFO_POINTS } from "../util/consts";
import { BestScore } from "../util/BestScore";
import PlayerTank from "../gameObjects/Player/PlayerTank";
import SuperEnemy from "../gameObjects/enemies/SuperEnemy";
import UFO from "../gameObjects/enemies/UFO";

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
    console.log(123)
    if (!this.game.currentScene) return;

    //* handle ufo collision
    if(this.target instanceof UFO) {
      console.log('ufoufo trafione')
      this.game.currentScene.animatedObjectDestruction(this.target.id);
      this.game.currentScene.removeGameObject(this.bullet.id);
      this.game.player.score += UFO_POINTS;
      BestScore.checkAndSave(this.game.player.score);

      // sprawn new ufo after some time
      setTimeout(() => this.game.spawnUfo(), 4000 + Math.floor(Math.random() * 6000))
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
