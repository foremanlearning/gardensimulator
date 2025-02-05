class Noise {
    constructor(seed = Math.random()) {
        this.p = new Uint8Array(256);
        this.perm = new Uint8Array(512);
        
        // Initialize the permutation array
        for (let i = 0; i < 256; i++) {
            this.p[i] = i;
        }

        // Create a random permutation using the seed
        let random = this.mulberry32(seed);
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }

        // Extend the permutation array to avoid overflow
        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
        }
    }

    // Simple random number generator with seed
    mulberry32(a) {
        return function() {
            a |= 0;
            a = a + 0x6D2B79F5 | 0;
            var t = Math.imul(a ^ a >>> 15, 1 | a);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    noise2D(x, y) {
        // Find unit grid cell containing point
        let X = Math.floor(x) & 255;
        let Y = Math.floor(y) & 255;

        // Get relative xy coordinates of point within that cell
        x -= Math.floor(x);
        y -= Math.floor(y);

        // Compute fade curves for each of x,y
        let u = this.fade(x);
        let v = this.fade(y);

        // Hash coordinates of the 4 square corners
        let A = this.perm[X] + Y;
        let B = this.perm[X + 1] + Y;

        // And add blended results from 4 corners of square
        return this.lerp(v,
            this.lerp(u, 
                this.grad(this.perm[A], x, y), 
                this.grad(this.perm[B], x-1, y)
            ),
            this.lerp(u,
                this.grad(this.perm[A+1], x, y-1),
                this.grad(this.perm[B+1], x-1, y-1)
            )
        );
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, y) {
        let h = hash & 15;
        let grad_x = 1 + (h & 7); // Gradient value is one of 8 possible values
        if (h & 8) grad_x = -grad_x; // Make half of them negative
        let grad_y = 1 + (h & 7);
        if (h & 8) grad_y = -grad_y;
        return grad_x * x + grad_y * y;
    }
}

export default Noise; 