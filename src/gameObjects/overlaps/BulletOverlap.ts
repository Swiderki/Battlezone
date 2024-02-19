import { GameObject, Overlap } from "drake-engine";
import Battlezone from "../../main";
import Bullet from "../misc/Bullet";

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
      console.log(123)
      if(!this.game.currentScene) 
        return;

      this.game.currentScene.animatedObjectDestruction(this.target.id);
    }
  }