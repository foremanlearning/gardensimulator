import Noise from './noise.js';

class WorldGenerator {
    constructor(seed = Math.random() * 10000) {
        this.seed = seed;
        this.noise = new Noise(seed);
    }

    generateChunk(x, y, z) {
        const blocks = new Uint8Array(16 * 16 * 16);
        
        // Generate terrain
        for (let bx = 0; bx < 16; bx++) {
            for (let bz = 0; bz < 16; bz++) {
                // Generate height using noise
                const wx = x * 16 + bx;
                const wz = z * 16 + bz;
                const height = Math.floor(
                    16 + // Base height
                    this.noise.noise2D(wx * 0.05, wz * 0.05) * 2 // Height variation
                );
                
                // Generate soil types using different noise frequency
                const soilNoise = this.noise.noise2D(wx * 0.1, wz * 0.1);
                
                // Set blocks
                for (let by = 0; by < 16; by++) {
                    const worldY = y * 16 + by;
                    const index = bx + by * 16 + bz * 16 * 16;
                    
                    if (worldY < height - 4) {
                        blocks[index] = 3; // Stone
                    } else if (worldY < height) {
                        // Different soil types based on noise
                        if (soilNoise > 0.3) {
                            blocks[index] = 1; // Rich soil
                        } else if (soilNoise > -0.3) {
                            blocks[index] = 4; // Sandy soil
                        } else {
                            blocks[index] = 6; // Clay soil
                        }
                    } else if (worldY === height) {
                        blocks[index] = 2; // Grass
                    }
                }
            }
        }
        
        return blocks;
    }
}

export default WorldGenerator; 