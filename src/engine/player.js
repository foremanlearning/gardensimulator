import Physics from './physics.js';

class Player {
    constructor(world) {
        this.world = world;
        this.position = [0, 32.001, 0];
        this.velocity = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.speed = 0.04;
        this.jumpForce = 0.42;
        this.gravity = -0.012;
        this.onGround = false;
    }

    update() {
        // Check collisions and update position
        const collision = Physics.checkCollision(
            this.position,
            this.velocity,
            this.world
        );

        // Ensure we have valid values before updating
        if (collision && collision.position && collision.velocity) {
            this.position = collision.position;
            this.velocity = collision.velocity;
            this.onGround = collision.onGround;
        }

        // Update chunk loading based on player position
        this.world.updateLoadedChunks(
            this.position[0],
            this.position[1],
            this.position[2]
        );
    }

    move(forward, right) {
        const angle = this.rotation[1];
        // Camera looks in OPPOSITE direction of angle
        const sin = Math.sin(-angle);  // Negate for camera direction
        const cos = Math.cos(-angle);
        
        // Create new velocity vector instead of modifying directly
        const newVelX = (-forward * sin + right * cos) * this.speed;
        const newVelZ = (-forward * cos - right * sin) * this.speed;
        
        // Only update if we have valid values
        if (isFinite(newVelX) && isFinite(newVelZ)) {
            this.velocity[0] = newVelX;
            this.velocity[2] = newVelZ;
        }
    }

    jump() {
        if (this.onGround) {
            this.velocity[1] = this.jumpForce;
            this.onGround = false;
        }
    }
}

export default Player; 