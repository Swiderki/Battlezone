import { Vec3DTuple } from "drake-engine";
import Enemy from "./Enemy";
import Battlezone from "../../main";

class SuperEnemy extends Enemy {
    // shooting constants
    protected override readonly bulletSpeed = 180;
    protected override readonly shootingRange = 200;
    protected override readonly bulletRange = 150;
    protected override readonly shootDelay = 10 * 1000;
    protected override readonly shootingChance = .9;

    // movement constants
    protected override readonly movementSpeed = 10;
    override rotationSpeed = Math.PI / 180 * 2; 

    constructor(game: Battlezone, position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
        super(game, position, size, rotation, 'supertank');
    }
}

export default SuperEnemy;