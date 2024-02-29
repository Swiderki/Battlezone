import { Vec3DTuple, Vector } from "drake-engine";
import Enemy, { ActionType } from "./Enemy";
import Battlezone from "../../main";

class SuperEnemy extends Enemy {
    // shooting constants
    protected override bulletSpeed = 300;
    protected override shootingRange = 60;
    protected spootingRange = 300;
    protected override bulletRange = 60;
    protected override shootDelay = 1 * 1000;
    protected override shootingChance = .9;

    // movement constants
    protected override movementSpeed = 20;
    override rotationSpeed = Math.PI / 180 * 2; 

    constructor(game: Battlezone, position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
        super(game, position, size, rotation, 'supertank');
    }
    
    override Update(): void {
        // shooting player takes priority
        // console.log(this.currentAction)
        const distanceToPlayer = Vector.length(Vector.subtract(this.position, this.game.player.position));
        const canShoot = distanceToPlayer < this.shootingRange && !this.shootOverheat && !this.isTargeting;
        if(distanceToPlayer < this.spootingRange) {
            if(!this.isChasingPlayer) {
                this.isChasingPlayer = true;
                this.movementSpeed = 40;
                this.cleanActionQueue();
                this.randomMove();
            }
            this.isChasingPlayer = true;
            this.movementSpeed = 70;
            if(this.chaseTimeOut) 
                clearTimeout(this.chaseTimeOut);
    
            this.chaseTimeOut = setTimeout(() => {
                this.isChasingPlayer = false;
                this.movementSpeed = 25;
            }, 1000);
        }
        if ((Math.random() < this.shootingChance && canShoot) || (this.isChasingPlayer && canShoot)) {
          this.cleanActionQueue();
          this.shootPlayer();
          this.idle(this.isChasingPlayer ? 400 : 1000);
          return;
        }
    
        // if enemy is already going somewhere skip the process
        if (this.currentAction) return;
    
        // else find new random direction
        this.randomMove();
      }
}

export default SuperEnemy;