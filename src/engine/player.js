import Physics from './physics.js';

class Player {
    constructor(world) {
        this.world = world;
        this.position = [0, 32.001, 0];
        this.velocity = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.speed = 0.04;
        this.jumpForce = 0.3;
        this.gravity = -0.015;
        this.onGround = false;
    }

    update() {
        // Apply gravity
        if (!this.onGround) {
            this.velocity[1] += this.gravity;
        }

        // Check collisions and update position
        const collision = Physics.checkCollision(this.position, this.velocity, this.world);
        this.position = collision.position;
        this.velocity = collision.velocity;
        this.onGround = collision.onGround;

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
        
        // Set movement velocity
        // Forward is in camera's look direction
        this.velocity[0] = (-forward * sin + right * cos) * this.speed;
        this.velocity[2] = (-forward * cos - right * sin) * this.speed;
    }

    jump() {
        if (this.onGround) {
            this.velocity[1] = this.jumpForce;
            this.onGround = false;
        }
    }
}

export default Player; 