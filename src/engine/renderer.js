import TextureManager from './textures.js';

class Renderer {
    constructor(canvas, world) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2');
        this.textureManager = new TextureManager(this.gl);
        world.textureManager = this.textureManager;
        
        if (!this.gl) {
            throw new Error('WebGL2 not supported');
        }

        // Initialize basic shader program
        this.initShaders();
        this.initBuffers();
    }

    initShaders() {
        // Basic vertex shader for blocks
        const vsSource = `#version 300 es
            in vec4 aPosition;
            in vec2 aTexCoord;
            in vec2 aTexOffset;
            
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            
            out vec2 vTexCoord;
            
            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
                vTexCoord = aTexCoord + aTexOffset;
            }
        `;

        // Basic fragment shader
        const fsSource = `#version 300 es
            precision highp float;
            
            in vec2 vTexCoord;
            uniform sampler2D uTexture;
            
            out vec4 fragColor;
            
            void main() {
                fragColor = texture(uTexture, vTexCoord);
            }
        `;

        // Create shader program
        this.program = this.createShaderProgram(vsSource, fsSource);
    }

    createShaderProgram(vsSource, fsSource) {
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fsSource);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        return program;
    }

    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        return shader;
    }

    initBuffers() {
        // Create vertex array object
        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);

        // Create vertex buffer
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);

        // Create index buffer
        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        // Set up attribute locations
        this.positionLocation = this.gl.getAttribLocation(this.program, 'aPosition');
        this.texCoordLocation = this.gl.getAttribLocation(this.program, 'aTexCoord');

        // Enable attributes
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.enableVertexAttribArray(this.texCoordLocation);
    }

    render(world, player) {
        this.gl.clearColor(0.529, 0.808, 0.922, 1.0); // Sky blue
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);

        this.gl.useProgram(this.program);

        // Set up camera uniforms
        const uProjectionMatrix = this.gl.getUniformLocation(this.program, 'uProjectionMatrix');
        const uModelViewMatrix = this.gl.getUniformLocation(this.program, 'uModelViewMatrix');
        
        // Create projection matrix
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, 
            Math.PI / 4,  // 45 degree FOV
            this.canvas.width / this.canvas.height,
            0.1,
            1000.0
        );

        // Create view matrix from player position and rotation
        const viewMatrix = mat4.create();
        mat4.identity(viewMatrix);
        mat4.rotateX(viewMatrix, viewMatrix, player.rotation[0]);
        mat4.rotateY(viewMatrix, viewMatrix, player.rotation[1]);
        mat4.translate(viewMatrix, viewMatrix, 
            [-player.position[0], -player.position[1], -player.position[2]]);

        this.gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
        this.gl.uniformMatrix4fv(uModelViewMatrix, false, viewMatrix);

        // Render all chunks
        for (const chunk of world.chunks.values()) {
            if (chunk.mesh) {
                this.renderChunk(chunk);
            }
        }
    }

    renderChunk(chunk) {
        // Bind texture atlas
        this.textureManager.bindTextureAtlas();

        // Bind vertex data
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, chunk.mesh.vertices, this.gl.STATIC_DRAW);

        // Bind index data
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, chunk.mesh.indices, this.gl.STATIC_DRAW);

        // Set up vertex attributes
        this.gl.vertexAttribPointer(this.positionLocation, 3, this.gl.FLOAT, false, 20, 0);
        this.gl.vertexAttribPointer(this.texCoordLocation, 2, this.gl.FLOAT, false, 20, 12);

        // Draw the chunk
        this.gl.drawElements(this.gl.TRIANGLES, chunk.mesh.indices.length, this.gl.UNSIGNED_SHORT, 0);
    }

    async init() {
        await this.textureManager.loadTextures();
    }
}

export default Renderer; 