import {
  PhysicalGameObject,
  QuaternionUtils,
  Rotation3D,
  Rotation3DTuple,
  Vec3D,
  Vec3DTuple,
  Vector,
} from "drake-engine";
import Battlezone from "../../main";
import Bullet from "../misc/Bullet";
import { BulletOverlap } from "../overlaps/BulletOverlap";

enum ActionType {
  Rotate,
  Move,
  Shoot,
  StartTargeting,
  EndTargeting,
  Idle,
}

interface Action {
  type: ActionType;
  data?: Vec3D | Rotation3DTuple | number;
}

class Enemy extends PhysicalGameObject {
  // movement constants
  private readonly movementSpeed = 5;
  readonly rotationSpeed = (Math.PI / 180) * 1;

  // shooting
  private readonly bulletSpeed = 100;
  private readonly shootingRange = 50;
  private readonly bulletRange = 100;
  private readonly shootDelay = 5 * 1000;
  private shootOverheat = false;

  // behavior
  private isTargeting = false;

  // rotation
  private angularVelocity: Rotation3DTuple | null = null;
  private rotationQuaternion = { x: 0, y: 0, z: 0, w: 0 };

  // action queue
  private actionQueue: Action[] = [];

  // TODO fix rotation
  private _tempRotation: Rotation3D;

  //* references
  private game: Battlezone;

  //* Start
  constructor(game: Battlezone, position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
    super("public/objects/tanks/tank.obj", { position, size, rotation });
    // this.showBoxcollider = true;
    this.autoupdateBoxCollider = true;
    this.showBoxcollider = true;
    this.game = game;
    this._tempRotation = { xAxis: 0, yAxis: Math.PI, zAxis: 0 }; //* to fix
  }

  override Start(): void {
    this.generateBoxCollider();
  }

  //* Queue management
  private enqueueAction(action: Action) {
    this.actionQueue.push(action);
  }

  private dequeueAction(): Action | undefined {
    return this.actionQueue.shift();
  }

  //* Player Actions
  shootPlayer() {
    this.enqueueAction({ type: ActionType.StartTargeting });
    this.rotateTowards(this.game.player.position);
    this.enqueueAction({ type: ActionType.Shoot });
    this.enqueueAction({ type: ActionType.EndTargeting });
    console.log(this.actionQueue);
  }

  idle(time: number) {
    this.enqueueAction({ type: ActionType.Idle, data: time });
  }

  rotateTowards(destiny: Vec3D) {
    const direction = Vector.normalize(Vector.subtract(destiny, this.position));
    const rotationY = Math.PI + Math.atan2(direction.x, direction.z);
    this.angularVelocity = [0, rotationY < Math.PI ? this.rotationSpeed : -this.rotationSpeed, 0];
    this.enqueueAction({ type: ActionType.Rotate, data: [0, rotationY, 0] });
  }

  moveTo(destiny: Vec3D) {
    //! Check if object have not reached destiny already
    if (Vector.length(Vector.subtract(destiny, this.position)) === 0) return;
    this.rotateTowards(destiny);
    const direction = Vector.normalize(Vector.subtract(destiny, this.position));
    this.velocity = Vector.multiply(direction, this.movementSpeed);
    this.enqueueAction({ type: ActionType.Move, data: destiny });
  }

  //? Instead of calling this method just enqueue Shoot action
  //? It shoots in direction tank is facing
  private shoot() {
    if (this.shootOverheat) return;
    this.shootOverheat = true;
    const bullet = new Bullet(Object.values(this.position) as Vec3DTuple, [0.01, 0.01, 0.01]);

    const bulletId = this.game.currentScene.addGameObject(bullet);

    bullet.Start = () => {
      if (bullet.vertecies.length < 1) return;

      bullet.generateBoxCollider();

      this.game.obstacles.forEach((obj) => {
        this.game.currentScene.addOverlap(new BulletOverlap(bullet, obj, this.game));
      });

      this.game.currentScene.addOverlap(new BulletOverlap(bullet, this.game.player, this.game));

      // cause tank model is facing backwards we simply use back vector
      bullet.velocity = Vector.multiply(
        Vector.rotateVector(Object.values(this._tempRotation) as Rotation3DTuple, Vector.back()),
        this.bulletSpeed
      );
    };

    const startPosition = { ...this.position };
    bullet.Update = () => {
      if (
        Math.hypot(bullet.position.x - startPosition.x, bullet.position.z - startPosition.z) >
        this.bulletRange
      ) {
        this.game.currentScene.removeGameObject(bulletId);
      }
    };

    setTimeout(() => (this.shootOverheat = false), this.shootDelay);
  }

  // override default rotate func
  override rotate(xAxis: number, yAxis: number, zAxis: number): void {
    if (xAxis === 0 && zAxis === 0 && yAxis === 0) return;
    const vT = { x: xAxis, y: yAxis, z: zAxis };

    // preform rotation
    QuaternionUtils.setFromAxisAngle(this.rotationQuaternion, Vector.normalize(vT), Vector.length(vT));
    QuaternionUtils.normalize(this.rotationQuaternion);
    super.applyQuaternion(this.rotationQuaternion);

    // Move rotation range form [-pi;pi] to [0;2pi]
    this._tempRotation.xAxis = (this._tempRotation.xAxis + xAxis) % (Math.PI * 2);
    if (this._tempRotation.xAxis < 0) this._tempRotation.xAxis = Math.PI * 2 - this._tempRotation.xAxis;
    this._tempRotation.yAxis = (this._tempRotation.yAxis + yAxis) % (Math.PI * 2);
    if (this._tempRotation.yAxis < 0) this._tempRotation.yAxis = Math.PI * 2 - this._tempRotation.yAxis;
    this._tempRotation.zAxis = (this._tempRotation.zAxis + zAxis) % (Math.PI * 2);
    if (this._tempRotation.zAxis < 0) this._tempRotation.zAxis = Math.PI * 2 - this._tempRotation.zAxis;
  }

  //* handle all actions
  private handleActions() {
    //! prevent crash when there is not action
    if (this.actionQueue.length === 0) return;

    //* helper
    const distanceToSquared = (v1: Vec3D, v2: Vec3D) =>
      Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2) + Math.pow(v1.z - v2.z, 2);

    //* perform actions based on action queue
    switch (this.actionQueue[0].type) {
      case ActionType.Rotate:
        const desiredAngle = this.actionQueue[0].data as Rotation3DTuple;
        if (Math.abs(this._tempRotation.yAxis - desiredAngle[1]) <= Math.abs(this.rotationSpeed)) {
          this.rotate(
            this._tempRotation.xAxis - desiredAngle[0],
            this._tempRotation.yAxis - desiredAngle[1],
            this._tempRotation.zAxis - desiredAngle[2]
          );
          this.angularVelocity = null;
          this.dequeueAction();
        }

        if (this.angularVelocity)
          this.rotate(this.angularVelocity[0], this.angularVelocity[1], this.angularVelocity[2]);
        break;

      case ActionType.Move:
        const destiny = this.actionQueue[0].data as Vec3D;
        // check if object have reached destiny
        if (distanceToSquared(this.position, destiny) <= 0.01) {
          this.setPosition(destiny.x, destiny.y, destiny.z);
          this.velocity = Vector.zero();
          this.dequeueAction();
        }
        break;
      case ActionType.Shoot:
        this.shoot();
        this.dequeueAction();
        break;
      case ActionType.StartTargeting:
        this.isTargeting = true;
        this.dequeueAction();
        break;
      case ActionType.EndTargeting:
        this.isTargeting = false;
        this.dequeueAction();
        break;
      case ActionType.Idle:
        const idleTime = this.actionQueue[0].data as number;
        setTimeout(() => this.dequeueAction(), idleTime);
        break;
    }
  }

  //* handle all the movement
  override updatePhysics(deltaTime: number): void {
    // rotation has priority over movement
    if (this.angularVelocity === null) super.updatePhysics(deltaTime);

    this.handleActions();
  }

  //* tank behavior
  override Update(): void {
    // move and shoot logic
    const distanceToPlayer = Vector.length(Vector.subtract(this.position, this.game.player.position));
    if (distanceToPlayer < this.shootingRange && !this.shootOverheat && !this.isTargeting) {
      this.shootPlayer();
      this.idle(1000);
    }
  }
}

export default Enemy;
