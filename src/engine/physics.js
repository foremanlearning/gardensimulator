class Physics {
    static checkCollision(pos, vel, world) {
        let newPos = [...pos];
        let newVel = [...vel];
        
        // First check if there's ground below us
        const blockBelow = world.getBlockAt(
            Math.floor(pos[0]), 
            Math.floor(pos[1] - 2.1),  // Check TWO BLOCKS below our position
            Math.floor(pos[2])
        );

        // If we're above ground, apply gravity
        if (blockBelow === 0) {
            newVel[1] += -0.015; // gravity
            newPos[1] += newVel[1];
            return { position: newPos, velocity: newVel, onGround: false };
        }

        // We're on ground, maintain position and zero vertical velocity
        newPos[0] += vel[0];
        newPos[2] += vel[2];
        newVel[1] = 0;
        newPos[1] = Math.floor(pos[1]); // Keep current height since we're checking 2 blocks below
        
        return { position: newPos, velocity: newVel, onGround: true };
    }
}

export default Physics; 