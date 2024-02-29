import { Vec3DTuple, Vector } from "drake-engine";
import Battlezone from "../../main";
import Enemy, { ActionType } from "./Enemy";
import { BulletOverlap } from "../../overlaps/BulletOverlap";

class Missile extends Enemy {
    protected override movementSpeed = 100;
    override rotationSpeed = Math.PI / 180 * 5;

    constructor(game: Battlezone, position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
        super(game, position, size, rotation, 'missile');
        this.collidePlayer = false;
    }

    override Start(): void {
        this.generateBoxCollider();
        setInterval(() => this.reTargetPlayer(), 1000);
        this.game.currentScene.addOverlap(new BulletOverlap(this, this.game.player, this.game)); 
    }

    reTargetPlayer() {
        console.log(123)
        if(this.currentAction?.type === ActionType.Move) {
            this.cleanActionQueue();
            this.moveTo(this.game.player.position);
            return;
        }
        if(this.actionQueue.length < 5)
            this.moveTo(this.game.player.position);
    }   

    override Update(): void {}
}

export default Missile;