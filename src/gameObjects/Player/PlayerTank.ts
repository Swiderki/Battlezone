import { Camera, GameObject, Line3D, PhysicalGameObject, Vec3DTuple, Vector } from "drake-engine";
import Battlezone from "../../main";
import Bullet from "../misc/Bullet";
import { BulletOverlap } from "../../overlaps/BulletOverlap";
import { motionBlockedMsg } from "../../gui/components/messages";
import PlayerObstacleOverlap from "../../overlaps/PlayerObstacleOverlap";
import { BestScore } from "../../util/BestScore";
import { BULLET_SPEED } from "../../util/consts";

class PlayerTank extends PhysicalGameObject {
  // constants
  private bulletSpeed = BULLET_SPEED;
  private boxColliderSize = 15 as const;
  private movementMultiplayer = 4;
  bulletRange = 400 as const;

  // references to game objects
  playerCamera?: Camera;
  enemies: GameObject[];
  game: Battlezone;

  // shooting
  shootDelay = false;

  // score
  score: number = 0;
  bestScore: number = BestScore.get();

  // overrides
  override boxCollider: Line3D;

  // collisions
  isBlockedByObstacle = false;

  constructor(game: Battlezone, position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
    super("objects/empty.obj", { position, size, rotation });
    this.enemies = game.enemies;
    this.isHollow = true;
    this.game = game;

    this.boxCollider = [
      // box collider jest przesuniety do przodu troche zeby bylo go widac (dev)
      {
        x: this.position.x - this.boxColliderSize / 2,
        y: this.position.y - this.boxColliderSize / 2,
        z: this.position.z - this.boxColliderSize / 2,
      },
      {
        x: this.position.x + this.boxColliderSize / 2,
        y: this.position.y + this.boxColliderSize / 2,
        z: this.position.z + this.boxColliderSize / 2,
      },
    ];
  }

  override Start(): void {}

  handlePlayerMove(e: Set<string>, deltaTime: number) {
    const VELOCITY_NORMALIZATION = 35;
    const ROTATION_NORMALIZATION = 40;

    const prevPosition = { ...this.position };
    const movementDirection = (+e.has("w") - +e.has("s")) as 1 | 0 | -1;

    this.move(
      this.playerCamera!.lookDir.x * movementDirection * deltaTime * VELOCITY_NORMALIZATION * this.movementMultiplayer,
      this.playerCamera!.lookDir.y * movementDirection * deltaTime * VELOCITY_NORMALIZATION * this.movementMultiplayer,
      this.playerCamera!.lookDir.z * movementDirection * deltaTime * VELOCITY_NORMALIZATION * this.movementMultiplayer
    );

    if (e.has("d")) {
      this.playerCamera?.rotate(
        { x: 0, y: 1, z: 0 },
        (Math.PI / 180) * (movementDirection || 1) * deltaTime * ROTATION_NORMALIZATION
      );
    }

    if (e.has("a")) {
      this.playerCamera?.rotate(
        { x: 0, y: -1, z: 0 },
        (Math.PI / 180) * (movementDirection || 1) * deltaTime * ROTATION_NORMALIZATION
      );
    }

    if (e.has("z")) {
      this.shoot();
    }

    // check for collision with obstacles
    for (const overlap of this.game.currentScene.overlaps.values()) {
      if (overlap.isHappening() && overlap instanceof PlayerObstacleOverlap) {
        motionBlockedMsg.text = "MOTION BLOCKED BY OBSTACLE";
        this.setPosition(prevPosition.x, prevPosition.y, prevPosition.z);
        return;
      }
    }

    motionBlockedMsg.text = "";
  }

  shoot() {
    if (this.shootDelay) return;
    this.shootDelay = true;

    const bullet = new Bullet(
      Object.values(Vector.add(this.position, this.playerCamera!.lookDir)) as Vec3DTuple,
      [0.01, 0.01, 0.01]
    );

    const bulletId = this.game.currentScene.addGameObject(bullet);

    bullet.Start = () => {
      bullet.generateBoxCollider();
      this.game.enemies.forEach((enemy) => {
        this.game.currentScene.addOverlap(new BulletOverlap(bullet, enemy, this.game));
      });
      this.game.obstacles.forEach((obj) => {
        this.game.currentScene.addOverlap(new BulletOverlap(bullet, obj, this.game));
      })
      if(this.game.ufo) {
        this.game.currentScene.addOverlap(new BulletOverlap(bullet, this.game.ufo, this.game));
      }
      
      bullet.velocity = Vector.multiply(this.playerCamera!.lookDir, this.bulletSpeed);
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

    setTimeout(() => (this.shootDelay = false), 1000);
  }

  override move(x: number, y: number, z: number): void {
    super.move(x, y, z);

    // bind camera to the player
    if (this.playerCamera) {
      this.playerCamera.move(x, y, z);
    }

    this.boxCollider = [
      {
        x: this.position.x - this.boxColliderSize / 2,
        y: this.position.y - this.boxColliderSize / 2,
        z: this.position.z - this.boxColliderSize / 2,
      },
      {
        x: this.position.x + this.boxColliderSize / 2,
        y: this.position.y + this.boxColliderSize / 2,
        z: this.position.z + this.boxColliderSize / 2,
      },
    ];
  }

  override setPosition(x: number, y: number, z: number): void {
    super.setPosition(x, y, z);

    // bind camera to the player
    if (this.playerCamera) {
      this.playerCamera.position = { x, y: this.playerCamera.position.y, z };
    }

    this.boxCollider = [
      {
        x: this.position.x - this.boxColliderSize / 2,
        y: this.position.y - this.boxColliderSize / 2,
        z: this.position.z - this.boxColliderSize / 2,
      },
      {
        x: this.position.x + this.boxColliderSize / 2,
        y: this.position.y + this.boxColliderSize / 2,
        z: this.position.z + this.boxColliderSize / 2,
      },
    ];
  }
}

export default PlayerTank;
