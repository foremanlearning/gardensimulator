class AssetManager {
    constructor() {
        this.textures = new Map();
        this.models = new Map();
        this.audio = new Map();
        this.loadingPromises = [];
    }

    async init(gl) {
        // Load block textures from voxelsrv/dist/assets/textures/blocks
        await Promise.all([
            this.loadTexture(gl, 'dirt', '/assets/textures/blocks/dirt.png'),
            this.loadTexture(gl, 'grass_side', '/assets/textures/blocks/grass_side.png'),
            this.loadTexture(gl, 'grass_top', '/assets/textures/blocks/grass_top.png'),
            this.loadTexture(gl, 'stone', '/assets/textures/blocks/stone.png')
        ]);

        // Load sounds from voxelsrv/dist/assets/sounds
        await Promise.all([
            this.loadAudio('step', '/assets/sounds/step.ogg'),
            this.loadAudio('break', '/assets/sounds/break.ogg'),
            this.loadAudio('place', '/assets/sounds/place.ogg')
        ]);

        // Create texture atlas
        this.createTextureAtlas(gl);
    }

    createTextureAtlas(gl) {
        // Create a texture atlas from individual textures
        const atlas = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // We'll combine textures into a 2x2 atlas for now
        const atlasSize = 512;
        const textureSize = 256;
        
        // Create canvas for atlas
        const canvas = document.createElement('canvas');
        canvas.width = atlasSize;
        canvas.height = atlasSize;
        const ctx = canvas.getContext('2d');

        // Draw textures to atlas
        // TODO: Draw textures to atlas positions
        
        // Upload atlas to GPU
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.generateMipmap(gl.TEXTURE_2D);
        
        this.textureAtlas = atlas;
    }

    async loadTexture(gl, name, url) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Loading placeholder color
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([255, 0, 255, 255]));

        const image = new Image();
        const promise = new Promise((resolve) => {
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_2D);
                this.textures.set(name, texture);
                resolve();
            };
        });

        image.src = url;
        this.loadingPromises.push(promise);
    }

    async loadAudio(name, url) {
        const audio = new Audio();
        const promise = new Promise((resolve) => {
            audio.oncanplaythrough = () => {
                this.audio.set(name, audio);
                resolve();
            };
        });
        
        audio.src = url;
        this.loadingPromises.push(promise);
    }

    async waitForLoad() {
        await Promise.all(this.loadingPromises);
    }
}

export default AssetManager; 