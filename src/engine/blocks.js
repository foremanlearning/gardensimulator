class BlockRegistry {
    constructor() {
        this.blocks = new Map();
        this.initializeBlocks();
    }

    initializeBlocks() {
        // Basic blocks
        this.registerBlock(0, {
            name: 'air',
            transparent: true,
            solid: false
        });

        // Soil types with properties
        this.registerBlock(1, {
            name: 'rich_soil',
            textures: { all: 'rich_soil' },
            properties: {
                fertility: 0.9,
                waterRetention: 0.7,
                pH: 6.8
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
            textures: { all: 'stone' }
        });

        this.registerBlock(4, {
            name: 'sandy_soil',
            textures: { all: 'sandy_soil' },
            properties: {
                fertility: 0.3,
                waterRetention: 0.2,
                pH: 7.2
            }
        });

        this.registerBlock(6, {
            name: 'clay_soil',
            textures: { all: 'clay_soil' },
            properties: {
                fertility: 0.5,
                waterRetention: 0.9,
                pH: 6.2
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

    // Add method to get soil properties
    getSoilProperties(id) {
        const block = this.blocks.get(id);
        return block?.properties || null;
    }
}

export default BlockRegistry; 