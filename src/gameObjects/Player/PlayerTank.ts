import { Camera, GUI, GameObject, PhysicalGameObject, Vec3DTuple, Vector } from "drake-engine";
import Crosshair from "../gui/crosshair";
import Battlezone from "../../main";
import Enemy from "../enemies/Enemy";
import { QuaternionUtils } from "drake-engine";
import { checkVectorSimilarity, rayCast } from "../../util/rayCast";
import Bullet from "../misc/Bullet";
import { BulletOverlap } from "../overlaps/BulletOverlap";
import HealthBar from "../gui/healthbar";
import Radar from "../gui/radar";


class PlayerTank extends PhysicalGameObject {
    // constants
    private bulletSpeed = 10;

    // references to game objects
    playerCamera?: Camera;
    enemies: GameObject[];
    game: Battlezone;
    // references to playUI
    playerGUI: GUI;
    radar?: Radar;
    playerCrosshair?: Crosshair;
    playerHealthBar: HealthBar;

    // shooting
    shootDelay = false

    constructor(game: Battlezone, position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
        super('public/empty.obj', { position, size, rotation });
        this.enemies = game.enemies;
        this.isHollow = true;
        this.game = game;
        this.playerGUI = new GUI(this.game.getCanvas, this.game.getCanvas.getContext('2d')!);
        this.playerHealthBar = new HealthBar(5, this.playerGUI);
        this.createPlayerGUI();
    }

    Start(): void {
        this.createPlayerGUI();
    }
    
    createPlayerGUI() {
        // create ale needed 
        this.playerCrosshair = new Crosshair();
        this.radar = new Radar(this.enemies, this.playerCamera!, this);
        // add everything to the GUI
        this.playerGUI.addElement(this.playerCrosshair);
        this.playerGUI.addElement(this.radar);
    }

    handleCamera(): void {
        // pspsps
        // oh well whatever nevermind
    }

    handlePlayerMove(e: Set<string>) {
        if(e.has("w")) 
            this.move(this.playerCamera!.lookDir.x, this.playerCamera!.lookDir.y, this.playerCamera!.lookDir.z);
        if(e.has("s")) 
            this.move(-this.playerCamera!.lookDir.x, -this.playerCamera!.lookDir.y, -this.playerCamera!.lookDir.z);
        if(e.has("e")) 
            this.playerCamera?.rotate({x: 0, y: 1, z: 0}, Math.PI / 180 * 1)
        if(e.has("q")) 
            this.playerCamera?.rotate({x: 0, y: -1, z: 0}, Math.PI / 180 * 1)
        // TODO implement better way to rotate vectors
        // TODO this one kinda sucks  
        if(e.has('a')) {
            const q = { x: 0, y: 0, z: 0, w: 0 };
            QuaternionUtils.setFromAxisAngle(
                q,
                { x: 0, y: 1, z: 0 },
                -Math.PI / 180 * 90
            );
            
            const rotatedVector = Vector.zero();
            QuaternionUtils.rotateVector(q, this.playerCamera!.lookDir, rotatedVector);
            this.move(rotatedVector.x, rotatedVector.y, rotatedVector.z);
        }
        if(e.has('d')) {
            const q = { x: 0, y: 0, z: 0, w: 0 };
            QuaternionUtils.setFromAxisAngle(
                q,
                { x: 0, y: 1, z: 0 },
                Math.PI / 180 * 90
            );
            
            const rotatedVector = Vector.zero();
            QuaternionUtils.rotateVector(q, this.playerCamera!.lookDir, rotatedVector);
            this.move(rotatedVector.x, rotatedVector.y, rotatedVector.z);
        }
        if(e.has('z')) {
            this.shoot();
        }
    }


    handleCrosshair(): void {    
        if(this.playerCrosshair === undefined || this.playerCamera === undefined){
            return;
        }

        this.playerCrosshair.isTargeting = false;
        this.enemies.some(enemy => {
            if(enemy.boxCollider === null) return false; // prevent further errors
            if(rayCast(this.position, this.playerCamera!.lookDir, enemy.boxCollider)) {
                this.playerCrosshair!.isTargeting = true;
                return true;
            }
            return false;
        })
    }

    shoot() {
        if(this.shootDelay) return;
        this.shootDelay = true;
        const bullet = new Bullet(Object.values(Vector.add(this.position, this.playerCamera!.lookDir)) as Vec3DTuple, [.01, .01, .01]);
        this.game.currentScene.addGameObject(bullet);
        bullet.Start = () => {
            bullet.generateBoxCollider();
            bullet.showBoxcollider = true;
            this.enemies.forEach(enemy => {
                this.game.currentScene.addOverlap(
                    new BulletOverlap(bullet, enemy, this.game)
                );
            });
            bullet.velocity = Vector.multiply(this.playerCamera!.lookDir, this.bulletSpeed);
        }
        setTimeout(()=>this.shootDelay = false, 1000);
    }

    override move(x: number, y: number, z: number): void {
        super.move(x, y, z);
        // bind camera to the player
        if(this.playerCamera) {
            this.playerCamera.move(x, y, z);
        }
    }

    override Update(deltaTime: number): void {
        this.handleCrosshair();
    }
}

export default PlayerTank   