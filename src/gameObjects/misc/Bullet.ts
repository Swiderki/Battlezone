import { PhysicalGameObject, Vec3DTuple } from "drake-engine";

class Bullet extends PhysicalGameObject {
  constructor(position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
    super("objects/obstacles/cube.obj", { position, size, rotation });
    // this.showBoxcollider = true;
    this.autoupdateBoxCollider = true;
  }
}
export default Bullet;
