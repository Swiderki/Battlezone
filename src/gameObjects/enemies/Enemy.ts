import { PhysicalGameObject, Rotation3D, Rotation3DTuple, Vec3D, Vec3DTuple, Vector } from "drake-engine";
import Battlezone from "../../main";

class Enemy extends PhysicalGameObject {
    // constants
    private movementSpeed = 5;
    rotationSpeed = Math.PI / 180 * .3; 

    // rotation
    desiredAngle: Rotation3DTuple | null = null
    angularVelocity: Rotation3DTuple | null = null;

    // move
    private destiny: Vec3D | null = null;

    // TODO fix rotation
    private _tempRotation: Rotation3D;

    //* references
    game: Battlezone
    constructor(game: Battlezone, position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
        super('public/objects/tanks/tank.obj', { position, size, rotation });
        // this.showBoxcollider = true;
        this.autoupdateBoxCollider = true;
        this.showBoxcollider = true;
        this.game = game;
        this._tempRotation = {xAxis: 0, yAxis: 0, zAxis: 0}; //* to fix
    }

    override Start(): void {
        this.generateBoxCollider();
        // this.shootPlayer();
        // this.moveTo({x: 0, y: 0, z: 0});
    }

    shootPlayer() {
        this.rotateTowards(this.game.player.position);
    }

    // TODO resolve error with degrees greater than PI
    rotateTowards(destiny: Vec3D) {
        const direction = Vector.normalize(Vector.subtract(destiny, this.position));
        const rotationY = Math.atan2(direction.x, direction.z);
        const rotationY2 = Math.atan2(direction.x, direction.z) % Math.PI / 2;
        console.log(rotationY, rotationY2)
        this.desiredAngle = [0, rotationY, 0];
        // console.log(direction, this.position, this.desiredAngle);
        this.angularVelocity = [0, rotationY > 0 ? this.rotationSpeed : -this.rotationSpeed, 0]
    }

    moveTo(destiny: Vec3D) {
        //! Check if object have not reached destiny already
        if(Vector.length(Vector.subtract(destiny, this.position)) === 0) return;
        this.rotateTowards(destiny);
        this.destiny = destiny;
        const direction = Vector.normalize(Vector.subtract(destiny, this.position));
        this.velocity = Vector.multiply(direction, this.movementSpeed);
    }
    
    override updatePhysics(deltaTime: number): void {
        const distanceToSquared = (v1: Vec3D, v2: Vec3D) => Math.pow(v1.x-v2.x, 2) + Math.pow(v1.y-v2.y, 2) +Math.pow(v1.z-v2.z, 2);
        if(this.desiredAngle !== null) {
            if(Math.abs(this._tempRotation.yAxis - this.desiredAngle[1]) <= Math.abs(this.rotationSpeed)) {
                this.rotate(this._tempRotation.xAxis - this.desiredAngle[0], this._tempRotation.yAxis - this.desiredAngle[1], this._tempRotation.zAxis - this.desiredAngle[2])
                this.angularVelocity = null;
                this.desiredAngle = null;
            }
            if(this.angularVelocity)
                this.rotate(this.angularVelocity[0], this.angularVelocity[1], this.angularVelocity[2]);
            
        }
        else if(this.destiny !== null) {
            // check if object have reached destiny
            if(distanceToSquared(this.position, this.destiny) <= 0.01) {
                this.setPosition(this.destiny.x, this.destiny.y, this.destiny.z);
                this.destiny = null;
                this.velocity = Vector.zero();
            }
        }
        if(this.angularVelocity === null)
            super.updatePhysics(deltaTime);
    }

    override rotate(xAxis: number, yAxis: number, zAxis: number): void {
        super.rotate(xAxis, yAxis, zAxis);
        // TODO fix this way is horrible
        this._tempRotation.xAxis += xAxis;
        this._tempRotation.yAxis += yAxis;
        this._tempRotation.zAxis += zAxis;
    }

    doRandomMove() {

    }

    shoot() {

    }

    override Update(deltaTime: number): void {
        // move and shoot logic

    }
}

export default Enemy;
