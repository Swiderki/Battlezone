import { Camera, GameObject, PhysicalGameObject, Vec3DTuple, Vector } from "drake-engine";
import Crosshair from "../gui/crosshair";
import Battlezone from "../../main";
import Enemy from "../enemies/Enemy";
import { checkVectorSimilarity } from "../../util/rayCast";

class PlayerTank extends PhysicalGameObject {
    public playerCamera?: Camera;
    public playerCrosshair?: Crosshair;
    public enemies: GameObject[];
    constructor(game: Battlezone, position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
        super('public/empty.obj', { position, size, rotation });
        this.enemies = game.enemies;

    }


    handleCamera(): void {
        // pspsps

    }

    handleCrosshair(): void {
        if(this.playerCrosshair === undefined || this.playerCamera === undefined){
            return;
        }

        this.playerCrosshair.isTargeting = false;

        this.enemies.forEach(enemy => {
            // its not working as intended
            // when we go far enough from target its nor working
            // issue being that vectors are normalized
            if(checkVectorSimilarity(Vector.subtract(enemy.position, this.playerCamera!.position), this.playerCamera!.lookDir, .999)) {
                this.playerCrosshair!.isTargeting = true;
            }
        })
    }

    override move(x: number, y: number, z: number): void {
        super.move(x, y, z);
        // bind camer to the player
        if(this.playerCamera) {
            this.playerCamera.move(x, y, z);
        }
    }

    override Update(deltaTime: number): void {
        this.handleCrosshair();
    }
}

export default PlayerTank   