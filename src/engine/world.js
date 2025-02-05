import Chunk from './chunk.js';
import WorldGenerator from './worldgen.js';
import BlockRegistry from './blocks.js';

class World {
    constructor() {
        this.chunks = new Map();
        this.loadQueue = [];
        this.worldGen = new WorldGenerator();
        this.renderDistance = 2;
        this.blockRegistry = new BlockRegistry();
        this.textureManager = null; // Will be set by renderer
    }

    getChunkKey(x, y, z) {
        return `${x},${y},${z}`;
    }

    getBlockAt(x, y, z) {
        const chunkX = Math.floor(x / 16);
        const chunkY = Math.floor(y / 16);
        const chunkZ = Math.floor(z / 16);
        
        const chunk = this.getChunk(chunkX, chunkY, chunkZ);
        if (!chunk) return 0; // Return air if chunk doesn't exist
        
        const localX = ((x % 16) + 16) % 16;
        const localY = ((y % 16) + 16) % 16;
        const localZ = ((z % 16) + 16) % 16;
        
        return chunk.getBlock(localX, localY, localZ);
    }

    setBlockAt(x, y, z, type) {
        const chunkX = Math.floor(x / 16);
        const chunkY = Math.floor(y / 16);
        const chunkZ = Math.floor(z / 16);
        
        let chunk = this.getChunk(chunkX, chunkY, chunkZ);
        if (!chunk) {
            chunk = this.loadChunk(chunkX, chunkY, chunkZ);
        }
        
        const localX = ((x % 16) + 16) % 16;
        const localY = ((y % 16) + 16) % 16;
        const localZ = ((z % 16) + 16) % 16;
        
        chunk.setBlock(localX, localY, localZ, type);
    }

    getChunk(x, y, z) {
        const key = this.getChunkKey(x, y, z);
        return this.chunks.get(key);
    }

    setChunk(x, y, z, chunk) {
        const key = this.getChunkKey(x, y, z);
        this.chunks.set(key, chunk);
    }

    loadChunk(x, y, z) {
        const chunk = new Chunk(x, y, z, this);
        chunk.blocks = this.worldGen.generateChunk(x, y, z);
        this.setChunk(x, y, z, chunk);
        return chunk;
    }

    updateLoadedChunks(playerX, playerY, playerZ) {
        const chunkX = Math.floor(playerX / 16);
        const chunkY = Math.floor(playerY / 16);
        const chunkZ = Math.floor(playerZ / 16);

        // Limit world size to 100x100x10
        const worldLimitX = 6;  // 6 chunks ≈ 96 blocks
        const worldLimitZ = 6;  // 6 chunks ≈ 96 blocks
        const worldLimitY = 0;  // Keep Y at 1 chunk (16 blocks)

        // Load chunks within render distance
        for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
                    const wx = chunkX + x;
                    const wy = chunkY + y;
                    const wz = chunkZ + z;
                    
                    // Only load chunks within world limits
                    if (Math.abs(wx) > worldLimitX || 
                        Math.abs(wz) > worldLimitZ ||
                        wy > worldLimitY) {
                        continue;
                    }

                    if (!this.getChunk(wx, wy, wz)) {
                        this.loadQueue.push({x: wx, y: wy, z: wz});
                    }
                }
            }
        }

        // Unload distant chunks
        for (const [key, chunk] of this.chunks.entries()) {
            const dx = chunk.x - chunkX;
            const dy = chunk.y - chunkY;
            const dz = chunk.z - chunkZ;
            
            if (Math.abs(dx) > this.renderDistance + 1 ||
                Math.abs(dy) > 2 ||
                Math.abs(dz) > this.renderDistance + 1) {
                this.chunks.delete(key);
            }
        }
    }

    update() {
        // Process load queue
        while (this.loadQueue.length > 0) {
            const {x, y, z} = this.loadQueue.shift();
            this.loadChunk(x, y, z);
        }

        // Update chunks
        for (const chunk of this.chunks.values()) {
            if (chunk.dirty) {
                chunk.generateMesh();
            }
        }
    }
}

export default World; 