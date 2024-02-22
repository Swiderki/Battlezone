import { Camera, GameObject, Line3D, PhysicalGameObject, Vec3DTuple, Vector } from "drake-engine";
import Crosshair from "../gui/crosshair";
import Battlezone from "../../main";
import { rayCast } from "../../util/rayCast";
import Bullet from "../misc/Bullet";
import { BulletOverlap } from "../overlaps/BulletOverlap";

class PlayerTank extends PhysicalGameObject {
  // constants
  private bulletSpeed = 300;
  private boxColliderSize = 50;

  // references
  playerCamera?: Camera;
  playerCrosshair?: Crosshair;
  enemies: GameObject[];
  game: Battlezone;

  // shooting
  shootDelay = false;

  // collisions
  isBlockedByObstacle = false;

  // overrides
  override boxCollider: Line3D;

  constructor(game: Battlezone, position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
    super("public/empty.obj", { position, size, rotation });
    this.enemies = game.enemies;
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
    console.log(this.boxCollider);
    this.showBoxcollider = true;
  }

  handleCamera(): void {
    // pspsps
    // oh well whatever nevermind
  }

  handleCrosshair(): void {
    if (this.playerCrosshair === undefined || this.playerCamera === undefined) {
      return;
    }

    this.playerCrosshair.isTargeting = false;

    this.enemies.forEach((enemy) => {
      if (enemy.boxCollider === null) return; // prevent further errors
      if (rayCast(this.position, this.playerCamera!.lookDir, enemy.boxCollider)) {
        this.playerCrosshair!.isTargeting = true;
      }
    });
  }

  shoot() {
    if (this.shootDelay) return;
    this.shootDelay = true;
    const bullet = new Bullet(
      Object.values(Vector.add(this.position, this.playerCamera!.lookDir)) as Vec3DTuple,
      [0.01, 0.01, 0.01]
    );
    console.log(bullet.position);
    this.game.currentScene.addGameObject(bullet);
    bullet.Start = () => {
      bullet.generateBoxCollider();
      this.enemies.forEach((enemy) => {
        this.game.currentScene.addOverlap(new BulletOverlap(bullet, enemy, this.game));
      });
      bullet.velocity = Vector.multiply(this.playerCamera!.lookDir, this.bulletSpeed);
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

  override Update(): void {
    this.handleCrosshair();
  }
}

export default PlayerTank;
