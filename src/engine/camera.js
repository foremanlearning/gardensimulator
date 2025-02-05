class Camera {
    constructor() {
        this.position = [0, 10, 10];
        this.rotation = [Math.PI/4, 0, 0];
        this.projectionMatrix = new Float32Array(16);
        this.viewMatrix = new Float32Array(16);
        
        // Set up projection matrix
        this.updateProjection();
    }

    updateProjection() {
        const fov = Math.PI / 4;
        const aspect = window.innerWidth / window.innerHeight;
        mat4.perspective(this.projectionMatrix, fov, aspect, 0.1, 1000.0);
    }

    update() {
        // Reset view matrix
        mat4.identity(this.viewMatrix);
        
        // Apply rotations
        mat4.rotateX(this.viewMatrix, this.viewMatrix, this.rotation[0]);
        mat4.rotateY(this.viewMatrix, this.viewMatrix, this.rotation[1]);
        
        // Apply translation
        mat4.translate(this.viewMatrix, this.viewMatrix, 
            [-this.position[0], -this.position[1], -this.position[2]]);
    }
}

export default Camera; 