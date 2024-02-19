import { PhysicalGameObject, Vec3D, Vec3DTuple } from "drake-engine";

class Bullet extends PhysicalGameObject {
    
    constructor(position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
        super('public/objects/misc/missile.obj', { position, size, rotation });
        // this.showBoxcollider = true;
        this.autoupdateBoxCollider = true;
    }

    Start(): void {
        this.generateBoxCollider();
        console.log(this.getBoxColliderMesh());
    }


}

export default Bullet;   