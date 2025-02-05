class SoilManager {
    constructor(world) {
        this.world = world;
        this.moistureMap = new Map(); // Track moisture levels
        this.nutrientMap = new Map(); // Track nutrient levels
    }

    // Get soil data at position
    getSoilData(x, y, z) {
        const blockId = this.world.getBlockAt(x, y, z);
        const properties = this.world.blockRegistry.getSoilProperties(blockId);
        
        if (!properties) return null;

        const pos = `${x},${y},${z}`;
        return {
            ...properties,
            moisture: this.moistureMap.get(pos) || 0.5,
            nutrients: this.nutrientMap.get(pos) || properties.fertility
        };
    }

    // Update soil moisture (called when it rains or player waters)
    updateMoisture(x, y, z, amount) {
        const pos = `${x},${y},${z}`;
        const currentMoisture = this.moistureMap.get(pos) || 0.5;
        const properties = this.world.blockRegistry.getSoilProperties(
            this.world.getBlockAt(x, y, z)
        );
        
        if (properties) {
            const newMoisture = Math.min(1, Math.max(0, 
                currentMoisture + amount * properties.waterRetention
            ));
            this.moistureMap.set(pos, newMoisture);
        }
    }

    // Update soil nutrients
    updateNutrients(x, y, z, amount) {
        const pos = `${x},${y},${z}`;
        const currentNutrients = this.nutrientMap.get(pos) || 0.5;
        this.nutrientMap.set(pos, Math.min(1, Math.max(0, currentNutrients + amount)));
    }
}

export default SoilManager; 