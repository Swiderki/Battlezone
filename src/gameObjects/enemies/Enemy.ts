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
import { BulletOverlap } from "../../overlaps/BulletOverlap";
import { collideObjects } from "../../util/rayCast";
import { BULLET_SPEED } from "../../util/consts";
import PlayerObstacleOverlap from "../../overlaps/PlayerObstacleOverlap";

export enum ActionType {
  Rotate,
  Move,
  Shoot,
  StartTargeting,
  EndTargeting,
  Idle,
  AvoidObstacle,
}

interface Action {
  type: ActionType;
  data?: Vec3D | Rotation3DTuple | number;
}

class Enemy extends PhysicalGameObject {
  // movement constants
  protected movementSpeed = 10;
  readonly rotationSpeed = (Math.PI / 180) * 2;

  // shooting
  protected bulletSpeed = BULLET_SPEED;
  protected shootingRange = 200;
  protected bulletRange = 150;
  protected shootDelay = 5 * 1000;
  protected shootingChance = 0.9;
  protected shootOverheat = false;

  // behavior
  protected isTargeting = false;
  protected moveTowardsPlayerChance = 0.5;
  protected isChasingPlayer = false;
  protected chaseTimeOut?: number;
  protected collidePlayer: boolean = true;

  // color
  protected currentColor = "#fff";

  // rotation
  protected angularVelocity: Rotation3DTuple | null = null;
  protected rotationQuaternion = { x: 0, y: 0, z: 0, w: 0 };

  // action queue
  protected actionQueue: Action[] = [];

  // we need this in order to keep track of the rotation
  protected _tempRotation: Rotation3D;

  //* references
  protected game: Battlezone;

  override boxColliderScale: number = 0.6;

  //* Start
  constructor(
    game: Battlezone,
    position?: Vec3DTuple,
    size?: Vec3DTuple,
    rotation?: Vec3DTuple,
    model = "tank"
  ) {
    super(`public/objects/enemies/${model}.obj`, { position, size, rotation });
    // this.showBoxcollider = true;
    this.autoupdateBoxCollider = true;
    this.showBoxcollider = true;
    this.game = game;
    this._tempRotation = { xAxis: 0, yAxis: Math.PI, zAxis: 0 };
  }

  override Start(): void {
    this.generateBoxCollider();
    for (const obstacle of this.game.obstacles) {
      if (!obstacle.boxCollider) continue;
      if (collideObjects(this.boxCollider!, obstacle.boxCollider)) {
        this.game.removeEnemy(this);
        this.game.currentScene!.removeGameObject(this.id);
        // console.log('ppspspsp');
        return;
      }
    }
    if(this.collidePlayer)
      this.game.currentScene.addOverlap(new PlayerObstacleOverlap(this.game.player, this));
  }

  //* Queue management
  protected enqueueAction(action: Action) {
    this.actionQueue.push(action);
  }

  get currentAction() {
    if (this.actionQueue.length == 0) return null;
    return this.actionQueue[0];
  }

  protected dequeueAction(): Action | undefined {
    return this.actionQueue.shift();
  }

  protected cleanActionQueue() {
    this.actionQueue = [];
    this.angularVelocity = null;
    this.velocity = Vector.zero();
  }

  //* Player Actions
  shootPlayer() {
    this.enqueueAction({ type: ActionType.StartTargeting });
    this.rotateTowards(this.game.player.position);
    this.enqueueAction({ type: ActionType.Shoot });
    this.enqueueAction({ type: ActionType.EndTargeting });
  }

  randomMove() {
    //* I am to lazy to implement Dijkstra or A* so we preform random moves
    //* If there is obstacle in a way we simply 'spin the wheel of fortune' again
    //* We have to finally be able to move right?
    // Random chance to move towards the player
    const keepDistanceFromPlayer = 30;

    if (Math.random() < this.moveTowardsPlayerChance || this.isChasingPlayer) {
      // Calculate direction vector from enemy to player
      const directionToPlayer = Vector.subtract(this.game.player.position, this.position);
      // Normalize the direction vector
      const normalizedDirection = Vector.normalize(directionToPlayer);
      // Calculate destination point by adding the normalized direction multiplied by the desired distance
      const destination = Vector.add(
        this.game.player.position,
        Vector.multiply(normalizedDirection, keepDistanceFromPlayer)
      );
      // console.table([this.game.player.position, destination])
      // Enqueue a movement action towards the calculated destination
      this.moveTo(destination);
      return; // Return early to avoid executing the rest of the method
    }

    // Otherwise, continue with random movement logic
    const randomDirection = {
      x: Math.random() * 5 + 5, // Random value between -1 and 1 for x-axis
      y: 0, // Assuming no vertical movement, you can adjust this if needed
      z: Math.random() * 5 + 5, // Random value between -1 and 1 for z-axis
    }; // Normalize the vector to ensure constant movement speed

    // Calculate the destination point by adding the random direction to the current position
    const destination = Vector.add(this.position, randomDirection);

    // Check if the destination is valid (not colliding with obstacles)
    let isValidDestination = true;
    for (const obstacle of this.game.obstacles) {
      if (
        collideObjects(
          [Vector.add(this.boxCollider![0], destination), Vector.add(this.boxCollider![1], destination)],
          obstacle.boxCollider!
        )
      ) {
        isValidDestination = false;
        break;
      }
    }

    // If the destination is valid, enqueue a movement action
    if (isValidDestination) {
      this.moveTo(destination);
    } else {
      // If not valid, try again by recursively calling randomMove
      this.randomMove();
    }
  }

  idle(time: number) {
    this.enqueueAction({ type: ActionType.Idle, data: time });
  }

  rotateTowards(destiny: Vec3D) {
    const direction = Vector.normalize(Vector.subtract(destiny, this.position));
    const rotationY = Math.PI + Math.atan2(direction.x, direction.z);
    // angle difference
    const currentRotationY = this._tempRotation.yAxis;
    let angleDifference = rotationY - currentRotationY;
    // normalize to [-π, π]
    angleDifference =
      ((((angleDifference + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;

    let rotationDirection = 0;
    if (angleDifference > 0) {
      rotationDirection = this.rotationSpeed;
    } else if (angleDifference < 0) {
      rotationDirection = -this.rotationSpeed;
    }

    this.angularVelocity = [0, rotationDirection, 0];
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
        this.currentColor = "green";
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

      case ActionType.Move || ActionType.AvoidObstacle:
        this.currentColor = "blue";
        const destiny = this.actionQueue[0].data as Vec3D;
        // check if object have reached destiny
        if (distanceToSquared(this.position, destiny) <= 0.01) {
          this.setPosition(destiny.x, destiny.y, destiny.z);
          this.velocity = Vector.zero();
          this.dequeueAction();
        }
        break;
      case ActionType.Shoot:
        this.currentColor = "red";
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
        this.currentColor = "#fff";
        const idleTime = this.actionQueue[0].data as number;
        setTimeout(() => this.dequeueAction(), idleTime);
        break;
    }

    this.changeColorOnAction();
  }

  avoidObstacle() {
    const backtrackDistance = 5;
    const backDest = Vector.add(
      Vector.rotateVector(
        [0, ((Math.PI + this._tempRotation.yAxis) % 2) * Math.PI, 0],
        Vector.multiply(Vector.back(), backtrackDistance)
      ),
      this.position
    );
    this.rotateTowards(backDest);
    this.moveTo(backDest);
  }

  isCollidingWithObstacle(): boolean {
    for (const obstacle of this.game.obstacles) {
      if (collideObjects(this.boxCollider!, obstacle.boxCollider!)) {
        return true;
      }
    }
    return false;
  }

  avoidObstacleAction() {
    // Generate a new destination to avoid obstacles
    this.avoidObstacle();
  }

  //* handle all the movement
  override updatePhysics(deltaTime: number): void {
    // rotation has priority over movement
    const previousPosition = { ...this.position };
    if (this.angularVelocity === null) super.updatePhysics(deltaTime);
    if(collideObjects(this.boxCollider!, this.game.player.boxCollider) && this.collidePlayer) {
      this.setPosition(previousPosition.x, previousPosition.y, previousPosition.z);
      return;
    }

    // Check for collisions with obstacles
    for (const obstacle of this.game.obstacles) {
      if (!obstacle.boxCollider) continue;
      if (collideObjects(this.boxCollider!, obstacle.boxCollider)) {
        // If collision occurs, adjust the destination to avoid the obstacle
        if (this.currentAction?.type === ActionType.Move || this.currentAction?.type === ActionType.Shoot) {
          this.cleanActionQueue();
          this.avoidObstacleAction();
        }
        // Reset position to previous position to avoid getting stuck
        this.setPosition(previousPosition.x, previousPosition.y, previousPosition.z);
        break;
      }
    }
    // prevent tanks from escaping the battlefield
    if (Math.abs(this.position.x) > 1000 || Math.abs(this.position.z) > 1000) {
      this.cleanActionQueue();
      this.moveTo({ x: 0, y: 0, z: 0 });
    }

    this.handleActions();
  }

  changeColorOnAction() {
    for (let i = 0; i < this.getMesh().length; i++) {
      this.setLineColor(i, this.currentAction?.type === ActionType.AvoidObstacle ? "red" : this.currentColor);
    }
  }

  //* tank behavior
  override Update(): void {
    // shooting player takes priority
    // console.log(this.currentAction)
    const distanceToPlayer = Vector.length(Vector.subtract(this.position, this.game.player.position));
    const canShoot = distanceToPlayer < this.shootingRange && !this.shootOverheat && !this.isTargeting;
    if (distanceToPlayer < this.shootingRange) {
      this.isChasingPlayer = true;
      if (this.chaseTimeOut) clearTimeout(this.chaseTimeOut);

      this.chaseTimeOut = setTimeout(() => (this.isChasingPlayer = false), 1000);
    }
    if (this.currentAction?.type === ActionType.AvoidObstacle) return;
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

export default Enemy;
