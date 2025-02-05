import Renderer from './renderer.js';
import World from './world.js';
import Player from './player.js';

class Game {
    constructor(canvas) {
        // Initialize properties first
        this.canvas = canvas;
        this.lastTime = 0;
        this.running = false;
        this.keys = new Set();
        this.initialized = false;  // Track initialization state
        
        // Start async initialization
        this.initAsync(canvas).catch(console.error);
    }

    async initAsync(canvas) {
        this.world = new World();
        this.renderer = new Renderer(canvas, this.world);
        await this.renderer.init();
        this.player = new Player(this.world);
        
        // Initial chunk loading
        this.world.updateLoadedChunks(0, 10, 0);

        // Set up controls
        this.setupControls();
        
        this.initialized = true;  // Mark as initialized
        // Start the game loop once everything is ready
        this.start();
    }

    setupControls() {
        // Lock pointer on click
        this.canvas.addEventListener('click', () => {
            this.canvas.requestPointerLock();
        });

        window.addEventListener('keydown', e => {
            this.keys.add(e.code);
            if (e.code === 'Space') {
                this.player.jump();
            }
        });

        window.addEventListener('keyup', e => {
            this.keys.delete(e.code);
        });

        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === this.canvas) {
                const mouseSensitivity = 0.002;
                this.player.rotation[1] += e.movementX * mouseSensitivity;
                this.player.rotation[0] += e.movementY * mouseSensitivity;
            
                // Clamp vertical rotation to prevent flipping
                this.player.rotation[0] = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.player.rotation[0]));
            }
        });
    }

    start() {
        this.running = true;
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        if (this.running) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    update(deltaTime) {
        if (!this.initialized) return;  // Skip update if not initialized

        // Handle movement
        let forward = 0;
        let right = 0;
        
        // WASD movement
        if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) forward += 1;
        if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) forward -= 1;
        if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) right += 1;
        if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) right -= 1;
        
        this.player.move(forward, right);
        this.player.update();

        this.world.update();
    }

    render() {
        if (!this.initialized) return;
        this.renderer.render(this.world, this.player);
    }
}

export default Game; 