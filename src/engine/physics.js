class Physics {
    static PLAYER_HEIGHT = 1.8;  // Player height in blocks
    static PLAYER_WIDTH = 0.6;   // Player width in blocks
    static PLAYER_EYES = 1.6;    // Eye height from feet

    static checkCollision(pos, vel, world) {
        let newPos = [...pos];
        let newVel = [...vel];
        let onGround = false;

        // Convert camera position to feet position (collision box position)
        const feetPos = [pos[0], pos[1] - 2.0, pos[2]];
        
        // Apply gravity first
        if (!this.isOnGround(feetPos, world)) {
            newVel[1] -= 0.015; // Gravity
        }

        // Move with simple collision checks
        const width = 0.3;  // Half-width of player
        
        // Try X movement with step-up check
        const nextX = feetPos[0] + vel[0];
        if (!this.hasCollision(nextX, feetPos[1], feetPos[2], width, world)) {
            newPos[0] = nextX;
        } else {
            // Check if we can step up
            if (!this.hasCollision(nextX, feetPos[1] + 1.0, feetPos[2], width, world) &&
                this.hasCollision(nextX, feetPos[1] - 0.1, feetPos[2], width, world)) {
                newPos[0] = nextX;
                newPos[1] = Math.floor(feetPos[1] + 1.0) + 2.0;
                onGround = true;
            } else {
                newVel[0] = 0;
            }
        }

        // Try Z movement with step-up check
        const nextZ = feetPos[2] + vel[2];
        if (!this.hasCollision(newPos[0], feetPos[1], nextZ, width, world)) {
            newPos[2] = nextZ;
        } else {
            // Check if we can step up
            if (!this.hasCollision(newPos[0], feetPos[1] + 1.0, nextZ, width, world) &&
                this.hasCollision(newPos[0], feetPos[1] - 0.1, nextZ, width, world)) {
                newPos[2] = nextZ;
                newPos[1] = Math.floor(feetPos[1] + 1.0) + 2.0;
                onGround = true;
            } else {
                newVel[2] = 0;
            }
        }

        // Try Y movement
        const nextY = feetPos[1] + vel[1];
        if (!this.hasCollision(newPos[0], nextY, newPos[2], width, world)) {
            newPos[1] = nextY + 2.0; // Add offset back for camera position
        } else {
            // Hit something in Y direction
            if (vel[1] < 0) {
                // Hit ground
                newPos[1] = Math.floor(feetPos[1]) + 2.0; // Add offset back for camera
                onGround = true;
            }
            newVel[1] = 0;
        }

        return { position: newPos, velocity: newVel, onGround };
    }

    static hasCollision(x, y, z, width, world) {
        // Check a box around the position
        const minX = Math.floor(x - width);
        const maxX = Math.floor(x + width);
        const minZ = Math.floor(z - width);
        const maxZ = Math.floor(z + width);
        const minY = Math.floor(y);
        const maxY = Math.floor(y + 1.8); // Player height

        for (let bx = minX; bx <= maxX; bx++) {
            for (let by = minY; by <= maxY; by++) {
                for (let bz = minZ; bz <= maxZ; bz++) {
                    if (world.getBlockAt(bx, by, bz) !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    static isOnGround(pos, world) {
        // Check if there's a block directly below us
        return world.getBlockAt(
            Math.floor(pos[0]),
            Math.floor(pos[1] - 0.1),
            Math.floor(pos[2])
        ) !== 0;
    }
}

export default Physics; 