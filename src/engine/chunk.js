const FACE_NORMALS = [
    [0, 0, 1],  // Front
    [0, 0, -1], // Back
    [0, 1, 0],  // Top
    [0, -1, 0], // Bottom
    [1, 0, 0],  // Right
    [-1, 0, 0]  // Left
];

class Chunk {
    constructor(x, y, z, world) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.world = world;
        this.size = 16;
        this.blocks = new Uint8Array(this.size * this.size * this.size);
        this.dirty = true;
        this.mesh = null;
    }

    getBlock(x, y, z) {
        return this.blocks[x + y * this.size + z * this.size * this.size];
    }

    setBlock(x, y, z, type) {
        this.blocks[x + y * this.size + z * this.size * this.size] = type;
        this.dirty = true;
    }

    generateMesh(renderer) {
        if (!this.dirty) return;
        
        // Basic mesh generation
        // This will be expanded with greedy meshing later
        const vertices = [];
        const indices = [];
        
        // Generate mesh data
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                for (let z = 0; z < this.size; z++) {
                    const block = this.getBlock(x, y, z);
                    if (block !== 0) {
                        this.addBlockToMesh(x, y, z, vertices, indices);
                    }
                }
            }
        }

        this.mesh = {
            vertices: new Float32Array(vertices),
            indices: new Uint16Array(indices)
        };
        
        this.dirty = false;
    }

    addBlockToMesh(x, y, z, vertices, indices) {
        const pos = [
            this.x * this.size + x,
            this.y * this.size + y,
            this.z * this.size + z
        ];

        // Get texture coordinates based on block type
        const block = this.getBlock(x, y, z);
        const blockDef = this.world.blockRegistry.getBlock(block);
        if (!blockDef) return;

        // Check neighboring blocks
        const neighbors = [
            this.world.getBlockAt(pos[0], pos[1], pos[2] + 1),  // Front
            this.world.getBlockAt(pos[0], pos[1], pos[2] - 1),  // Back
            this.world.getBlockAt(pos[0], pos[1] + 1, pos[2]),  // Top
            this.world.getBlockAt(pos[0], pos[1] - 1, pos[2]),  // Bottom
            this.world.getBlockAt(pos[0] + 1, pos[1], pos[2]),  // Right
            this.world.getBlockAt(pos[0] - 1, pos[1], pos[2])   // Left
        ];

        const addFace = (vertices, normal, textureName) => {
            const tex = this.world.textureManager.getTextureCoords(textureName);
            // Add vertices based on face normal
            if (normal[2] === 1) { // Front face
                if (neighbors[0] !== 0) return; // Skip if blocked
                vertices.push(
                    pos[0], pos[1], pos[2]+1, tex.u1, tex.v2,      // Bottom-left
                    pos[0]+1, pos[1], pos[2]+1, tex.u2, tex.v2,    // Bottom-right
                    pos[0]+1, pos[1]+1, pos[2]+1, tex.u2, tex.v1,  // Top-right
                    pos[0], pos[1]+1, pos[2]+1, tex.u1, tex.v1     // Top-left
                );
            } else if (normal[2] === -1) { // Back face
                if (neighbors[1] !== 0) return; // Skip if blocked
                vertices.push(
                    pos[0]+1, pos[1], pos[2], tex.u1, tex.v2,      // Bottom-left
                    pos[0], pos[1], pos[2], tex.u2, tex.v2,        // Bottom-right
                    pos[0], pos[1]+1, pos[2], tex.u2, tex.v1,      // Top-right
                    pos[0]+1, pos[1]+1, pos[2], tex.u1, tex.v1     // Top-left
                );
            } else if (normal[1] === 1) { // Top face
                if (neighbors[2] !== 0) return; // Skip if blocked
                vertices.push(
                    pos[0], pos[1]+1, pos[2], tex.u1, tex.v1,
                    pos[0], pos[1]+1, pos[2]+1, tex.u1, tex.v2,
                    pos[0]+1, pos[1]+1, pos[2]+1, tex.u2, tex.v2,
                    pos[0]+1, pos[1]+1, pos[2], tex.u2, tex.v1
                );
            } else if (normal[1] === -1) { // Bottom face
                if (neighbors[3] !== 0) return; // Skip if blocked
                vertices.push(
                    pos[0], pos[1], pos[2], tex.u1, tex.v1,
                    pos[0]+1, pos[1], pos[2], tex.u2, tex.v1,
                    pos[0]+1, pos[1], pos[2]+1, tex.u2, tex.v2,
                    pos[0], pos[1], pos[2]+1, tex.u1, tex.v2
                );
            } else if (normal[0] === 1) { // Right face
                if (neighbors[4] !== 0) return; // Skip if blocked
                vertices.push(
                    pos[0]+1, pos[1], pos[2], tex.u1, tex.v2,      // Bottom-left
                    pos[0]+1, pos[1]+1, pos[2], tex.u1, tex.v1,    // Top-left
                    pos[0]+1, pos[1]+1, pos[2]+1, tex.u2, tex.v1,  // Top-right
                    pos[0]+1, pos[1], pos[2]+1, tex.u2, tex.v2     // Bottom-right
                );
            } else if (normal[0] === -1) { // Left face
                if (neighbors[5] !== 0) return; // Skip if blocked
                vertices.push(
                    pos[0], pos[1], pos[2]+1, tex.u1, tex.v2,      // Bottom-left
                    pos[0], pos[1]+1, pos[2]+1, tex.u1, tex.v1,    // Top-left
                    pos[0], pos[1]+1, pos[2], tex.u2, tex.v1,      // Top-right
                    pos[0], pos[1], pos[2], tex.u2, tex.v2         // Bottom-right
                );
            }
        };

        // Define vertices for a cube
        // Add faces based on block definition
        if (blockDef.textures.all) {
            // Use same texture for all faces
            for (let i = 0; i < 6; i++) {
                addFace(vertices, FACE_NORMALS[i], blockDef.textures.all);
            }
        } else {
            // Add each face with its specific texture
            addFace(vertices, [0, 0, 1], blockDef.textures.front || blockDef.textures.sides);
            addFace(vertices, [0, 0, -1], blockDef.textures.back || blockDef.textures.sides);
            addFace(vertices, [0, 1, 0], blockDef.textures.top);
            addFace(vertices, [0, -1, 0], blockDef.textures.bottom);
            addFace(vertices, [1, 0, 0], blockDef.textures.right || blockDef.textures.sides);
            addFace(vertices, [-1, 0, 0], blockDef.textures.left || blockDef.textures.sides);
        }

        // Calculate indices for the new vertices
        const offset = vertices.length / 5 - 24; // 5 components per vertex
        for (let i = 0; i < 6; i++) { // 6 faces
            const baseIndex = offset + i * 4;
            indices.push(
                baseIndex, baseIndex + 1, baseIndex + 2,
                baseIndex, baseIndex + 2, baseIndex + 3
            );
        }
    }

    getBlockTexCoords(blockType) {
        // Define texture coordinates for each block type
        const textureMap = {
            1: { // Dirt
                all: [0, 0, 1, 1]
            },
            2: { // Grass
                top: [1, 0, 2, 1],
                side: [2, 0, 3, 1],
                bottom: [0, 0, 1, 1]
            }
        };
        return textureMap[blockType] || textureMap[1];
    }
}

export default Chunk; 