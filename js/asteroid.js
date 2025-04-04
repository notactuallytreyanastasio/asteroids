// Asteroid class
class Asteroid extends WrapSprite {
    constructor() {
        super();
        this.elasticity = 1; // Bouncy!
        this.antialiasing = true; // Smooth rotations

        // Size constants
        this.LARGE = 'assets/large.png';
        this.MEDIUM = 'assets/medium.png';
        this.SMALL = 'assets/small.png';

        // Collision tracking
        this.touchedBy = null;
    }

    create(x = 0, y = 0, velocityX = 0, velocityY = 0, size = null) {
        // Reset asteroid properties
        this.exists = true;
        this.visible = true;
        this.active = true;
        this.solid = true;

        // Set the graphic based on size
        const sizeGraphic = size || this.LARGE;
        this.loadRotatedGraphic(sizeGraphic, 100, -1, false, true);
        this.alterBoundingBox();

        // Set mass based on size
        if (!size || size === this.LARGE) {
            this.mass = 9;
        } else if (size === this.MEDIUM) {
            this.mass = 3;
        } else {
            this.mass = 1;
        }

        // Set random rotation angle
        this.angle = Utils.random(360);

        // Initialize a splinter of asteroid if called with position arguments
        if (x !== 0 || y !== 0) {
            this.x = x;
            this.y = y;
            this.velocity.x = velocityX;
            this.velocity.y = velocityY;
            this.angularVelocity = (Math.abs(this.velocity.x) + Math.abs(this.velocity.y));
            return this;
        }

        // Otherwise spawn a new asteroid at a random edge
        const initialVelocity = 20;

        if (Utils.random() < 0.5) {
            // Appearing on the sides
            if (Utils.random() < 0.5) {
                // Appears on the left
                this.x = -64 + this.offset.x;
                this.velocity.x = initialVelocity / 2 + Utils.random(initialVelocity);
            } else {
                // Appears on the right
                this.x = Game.width + this.offset.x;
                this.velocity.x = -initialVelocity / 2 - Utils.random(initialVelocity);
            }
            this.y = Utils.random(Game.height - this.height);
            this.velocity.y = Utils.random(initialVelocity * 2) - initialVelocity;
        } else {
            // Appearing on top or bottom
            if (Utils.random() < 0.5) {
                // Appears above
                this.y = -64 + this.offset.y;
                this.velocity.y = initialVelocity / 2 + Utils.random(initialVelocity);
            } else {
                // Appears below
                this.y = Game.height + this.offset.y;
                this.velocity.y = -initialVelocity / 2 + Utils.random(initialVelocity);
            }
            this.x = Utils.random(Game.width - this.width);
            this.velocity.x = Utils.random(initialVelocity * 2) - initialVelocity;
        }

        this.angularVelocity = (Math.abs(this.velocity.x) + Math.abs(this.velocity.y));
        return this;
    }

    update(elapsed) {
        super.wrap();

        if (this.justTouched()) {
            this.angularVelocity = (Math.abs(this.velocity.x) + Math.abs(this.velocity.y));
        }

        // Update position
        this.velocity.x += this.acceleration.x * elapsed;
        this.velocity.y += this.acceleration.y * elapsed;
        this.x += this.velocity.x * elapsed;
        this.y += this.velocity.y * elapsed;
        this.angle += this.angularVelocity * elapsed;

        // Reset collision status for next frame
        this.touchedBy = null;
    }

    kill() {
        // Default kill behavior
        super.kill();

        // Don't spawn chunks if this was the smallest asteroid
        if (this.frameWidth <= 32) {
            return;
        }

        // Spawn new asteroid chunks
        let initialVelocity = 20;
        let size;

        // Determine size of chunks
        if (this.frameWidth >= 64) {
            size = this.MEDIUM;
            initialVelocity *= 2;
        } else {
            size = this.SMALL;
            initialVelocity *= 3;
        }

        // Generate random number of chunks
        const numChunks = 2 + Math.floor(Utils.random(3));

        // Create chunks
        for (let i = 0; i < numChunks; i++) {
            // Calculate position and velocity
            const ax = this.x + this.width / 2;
            const ay = this.y + this.height / 2;
            const avx = Utils.random(initialVelocity * 2) - initialVelocity;
            const avy = Utils.random(initialVelocity * 2) - initialVelocity;

            // Create new asteroid
            const asteroid = Game.state.asteroids.getFirstDead();
            if (asteroid) {
                asteroid.create(ax, ay, avx, avy, size);
            }
        }
    }
}