import { GameObject, Line3D, PhysicalGameObject, QuaternionUtils, Vec3DTuple, Vector } from "drake-engine";
import Battlezone from "../../main";
import Bullet from "../misc/Bullet";
import { BulletOverlap } from "../../overlaps/BulletOverlap";
import { motionBlockedMsg } from "../../gui/components/messages";
import PlayerObstacleOverlap from "../../overlaps/PlayerObstacleOverlap";
import { BestScore } from "../../util/BestScore";
import { AMMO_MAX, BULLET_SPEED } from "../../util/consts";
import { INITIAL_PLAYER_BOX_COLLIDER } from "../../util/consts";
import Missile from "../enemies/Missle";

class PlayerTank extends PhysicalGameObject {
  // constants
  private bulletSpeed = BULLET_SPEED;
  private maxAmmo = AMMO_MAX;
  private currentAmmo = AMMO_MAX;
  bulletRange = 400 as const;

  // references to game objects
  enemies: GameObject[];
  game: Battlezone;

  // shooting
  shootDelay = false;

  // score
  score: number = 0;
  bestScore: number = BestScore.get();

  // overrides
  override boxCollider: Line3D = [
    {
      x: this.position.x - INITIAL_PLAYER_BOX_COLLIDER / 2,
      y: this.position.y - INITIAL_PLAYER_BOX_COLLIDER / 2,
      z: this.position.z - INITIAL_PLAYER_BOX_COLLIDER / 2,
    },
    {
      x: this.position.x + INITIAL_PLAYER_BOX_COLLIDER / 2,
      y: this.position.y + INITIAL_PLAYER_BOX_COLLIDER / 2,
      z: this.position.z + INITIAL_PLAYER_BOX_COLLIDER / 2,
    },
  ];

  // collisions
  isBlockedByObstacle = false;

  private rotationQuaternion = { x: 0, y: 0, z: 0, w: 0 };

  constructor(game: Battlezone, position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
    super("objects/enemies/tank.obj", { position, size, rotation });
    this.enemies = game.enemies;
    // this.isHollow = true;
    this.isVisible = game.thirdPerson;
    this.game = game;
  }

  override Start(): void {
    this.autoupdateBoxCollider = true;
    this.boxColliderScale = 0.6;
  }

  // override default rotate func
  override rotate(xAxis: number, yAxis: number, zAxis: number): void {
    if (xAxis === 0 && zAxis === 0 && yAxis === 0) return;
    const vT = { x: xAxis, y: yAxis, z: zAxis };

    // preform rotation
    QuaternionUtils.setFromAxisAngle(this.rotationQuaternion, Vector.normalize(vT), Vector.length(vT));
    QuaternionUtils.normalize(this.rotationQuaternion);
    super.applyQuaternion(this.rotationQuaternion);
  }

  private thirdPersonHandle(): void {
    if (this.game.thirdPerson) {
      this.game.camera.position = {
        x: this.position.x - this.game.camera.lookDir.x * this.game.thirdPersonCameraDistance,
        y: this.position.y + this.game.thirdPersonCameraHeight,
        z: this.position.z - this.game.camera.lookDir.z * this.game.thirdPersonCameraDistance,
      };
    }
  }

  handlePlayerMove(e: Set<string>, deltaTime: number) {
    const VELOCITY_NORMALIZATION = 35;
    const ROTATION_NORMALIZATION = 40;

    const prevPosition = { ...this.position };
    const movementDirection = (+e.has("w") - +e.has("s")) as 1 | 0 | -1;

    this.move(
      this.game.camera!.lookDir.x * movementDirection * deltaTime * VELOCITY_NORMALIZATION,
      this.game.camera!.lookDir.y * movementDirection * deltaTime * VELOCITY_NORMALIZATION,
      this.game.camera!.lookDir.z * movementDirection * deltaTime * VELOCITY_NORMALIZATION
    );

    if (e.has("1")) {
      this.game.thirdPerson = false;
    }
    if (e.has("2")) {
      this.game.thirdPerson = true;
    }

    if (e.has("d")) {
      this.game.camera?.rotate(
        { x: 0, y: 1, z: 0 },
        (Math.PI / 180) * (movementDirection || 1) * deltaTime * ROTATION_NORMALIZATION
      );
      this.rotate(0, (Math.PI / 180) * (movementDirection || 1) * deltaTime * ROTATION_NORMALIZATION, 0);
    }

    if (e.has("a")) {
      this.game.camera?.rotate(
        { x: 0, y: -1, z: 0 },
        (Math.PI / 180) * (movementDirection || 1) * deltaTime * ROTATION_NORMALIZATION
      );
      this.rotate(0, -(Math.PI / 180) * (movementDirection || 1) * deltaTime * ROTATION_NORMALIZATION, 0);
    }

    if (e.has(" ") || e.has("k")) {
      this.shoot();
    }

    // check for collision with obstacles
    for (const overlap of this.game.currentScene.overlaps.values()) {
      if (overlap.isHappening() && overlap instanceof PlayerObstacleOverlap) {
        if (overlap.obj1 instanceof Missile || overlap.obj2 instanceof Missile) return;
        motionBlockedMsg.text = "MOTION BLOCKED BY OBSTACLE";
        this.setPosition(prevPosition.x, prevPosition.y, prevPosition.z);
        this.thirdPersonHandle();
        return;
      }
    }

    this.thirdPersonHandle();

    motionBlockedMsg.text = "";
  }

  shoot() {
    if (this.shootDelay) return;
    if (this.currentAmmo === 0) return;
    this.shootDelay = true;

    const bullet = new Bullet(
      Object.values(Vector.add(this.position, this.game.camera!.lookDir)) as Vec3DTuple,
      [0.01, 0.01, 0.01]
    );

    // to make bullet fly over, not on the ground
    bullet.position.y = 2;

    const bulletId = this.game.currentScene.addGameObject(bullet);

    bullet.Start = () => {
      bullet.generateBoxCollider();
      new Audio("sounds/bullet.mp3").play();
      this.game.enemies.forEach((enemy) => {
        this.game.currentScene.addOverlap(new BulletOverlap(bullet, enemy, this.game));
      });
      this.game.obstacles.forEach((obj) => {
        this.game.currentScene.addOverlap(new BulletOverlap(bullet, obj, this.game));
      });
      if (this.game.ufo) {
        this.game.currentScene.addOverlap(new BulletOverlap(bullet, this.game.ufo, this.game));
      }

      bullet.velocity = Vector.multiply(this.game.camera!.lookDir, this.bulletSpeed);
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

    //* decrease current ammo
    this.currentAmmo--;

    // reload if needed
    if (this.currentAmmo === 0) {
      setTimeout(() => (this.currentAmmo = this.maxAmmo), 3000);
    }
    setTimeout(() => (this.shootDelay = false), 1000);
  }

  override move(x: number, y: number, z: number): void {
    super.move(x, y, z);

    // bind camera to the player
    if (this.game.camera) {
      this.game.camera.move(x, y, z);
    }

    if (this.game.thirdPerson) return;

    // this.boxCollider = generateDefaultBoxCollider(this.position);
  }

  override setPosition(x: number, y: number, z: number): void {
    super.setPosition(x, y, z);

    // bind camera to the player
    if (this.game.camera) {
      this.game.camera.position = { x, y: this.game.camera.position.y, z };
    }

    if (this.game.thirdPerson) return;

    // this.boxCollider = generateDefaultBoxCollider(this.position);
  }
}

export default PlayerTank;
