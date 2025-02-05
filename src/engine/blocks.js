class BlockRegistry {
    constructor() {
        this.blocks = new Map();
        this.initializeBlocks();
    }

    initializeBlocks() {
        // Define block types and their textures
        this.registerBlock(0, {
            name: 'air',
            transparent: true,
            solid: false
        });

        this.registerBlock(1, {
            name: 'dirt',
            textures: {
                all: 'dirt'
            }
        });

        this.registerBlock(2, {
            name: 'grass',
            textures: {
                top: 'grass_top',
                bottom: 'dirt',
                sides: 'grass_side'
            }
        });

        this.registerBlock(3, {
            name: 'stone',
            textures: {
                all: 'stone'
            }
        });

        this.registerBlock(4, {
            name: 'sand',
            textures: {
                all: 'sand'
            }
        });

        this.registerBlock(5, {
            name: 'log',
            textures: {
                top: 'oak_log_top',
                bottom: 'oak_log_top',
                sides: 'oak_log'
            }
        });
    }

    registerBlock(id, definition) {
        this.blocks.set(id, {
            id,
            solid: true,
            transparent: false,
            ...definition
        });
    }

    getBlock(id) {
        return this.blocks.get(id);
    }
}

export default BlockRegistry; 