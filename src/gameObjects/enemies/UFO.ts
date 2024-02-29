import { Vec3DTuple, Vector } from "drake-engine";
import Battlezone from "../../main";
import Enemy from "./Enemy";
import { collideObjects } from "../../util/rayCast";

class UFO extends Enemy {
    protected override movementSpeed = 40;
    override rotationSpeed = Math.PI / 180 * 4;

    constructor(game: Battlezone, position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
        super(game, position, size, rotation, 'ufo');
        console.log(this.position);
    }

    override Update(): void {
        if(this.currentAction) return;

        this.randomMove();
    }

    override randomMove() {    
        if(Math.abs(this.position.x) > 1000 || Math.abs(this.position.z) > 1000) {
          this.moveTo({x:0, y: 0, z: 0});
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
}


export default UFO;