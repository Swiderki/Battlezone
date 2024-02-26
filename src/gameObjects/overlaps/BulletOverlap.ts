import { GameObject, Overlap } from "drake-engine";
import Battlezone from "../../main";
import Bullet from "../misc/Bullet";
import Enemy from "../enemies/Enemy";

export class BulletOverlap extends Overlap {
    private game: Battlezone;
    target: GameObject
    bullet: Bullet
  
    constructor(obj1: Bullet, obj2: GameObject, game: Battlezone) {
      super(obj1, obj2);
      this.game = game;
      this.bullet = obj1;
      this.target = obj2;
    }
  
    override onOverlap(): void {
      if(!this.game.currentScene) 
        return;
      if(this.target instanceof Enemy) {
        this.game.currentScene.animatedObjectDestruction(this.target.id);
        this.game.removeEnemy(this.target);
      }
      this.game.currentScene.removeGameObject(this.bullet.id);
    }
}