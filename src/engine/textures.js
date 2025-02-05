class TextureManager {
    constructor(gl) {
        this.gl = gl;
        this.textureAtlas = null;
        this.textureCoords = new Map();
        this.textureSize = 16; // Size of each texture in atlas
        this.atlasSize = 256;  // Total atlas size
    }

    async loadTextures() {
        const textureList = [
            'acacia_log',  // Using available textures from files.txt
            'dirt',
            'grass_side',
            'grass_top',
            'stone',
            'oak_log',
            'oak_log_top',
            'oak_leaves'
        ];

        // Create canvas for atlas
        const canvas = document.createElement('canvas');
        canvas.width = this.atlasSize;
        canvas.height = this.atlasSize;
        const ctx = canvas.getContext('2d');
        // Disable image smoothing for crisp pixel art
        ctx.imageSmoothingEnabled = false;

        // Load all textures
        const loadPromises = textureList.map((name, index) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    // Calculate position in atlas
                    const x = (index % 16) * this.textureSize;
                    const y = Math.floor(index / 16) * this.textureSize;
                    
                    // Draw to atlas
                    ctx.drawImage(img, x, y, this.textureSize, this.textureSize);
                    
                    // Store texture coordinates
                    this.textureCoords.set(name, {
                        u1: (x + 0.1) / this.atlasSize,            // Add small offset to prevent bleeding
                        v1: (y + 0.1) / this.atlasSize,
                        u2: (x + this.textureSize - 0.1) / this.atlasSize,
                        v2: (y + this.textureSize - 0.1) / this.atlasSize
                    });
                    
                    resolve();
                };
                img.src = `/public/assets/textures/block/${name}.png`;
            });
        });

        await Promise.all(loadPromises);

        // Create WebGL texture from atlas
        this.textureAtlas = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureAtlas);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
        // Set proper texture filtering for pixel art
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        // Prevent texture bleeding
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    }

    getTextureCoords(name) {
        return this.textureCoords.get(name) || this.textureCoords.get('dirt'); // Default to dirt if texture not found
    }

    bindTextureAtlas() {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureAtlas);
    }
}

export default TextureManager; 