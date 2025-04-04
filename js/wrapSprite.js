// Base sprite class with screen wrapping functionality
class WrapSprite {
    constructor(x = 0, y = 0, graphic = null) {
        this.x = x;
        this.y = y;
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.angle = 0;
        this.angularVelocity = 0;
        this.elasticity = 0;
        this.mass = 1;
        this.exists = true;
        this.visible = true;
        this.active = true;
        this.solid = true;
        this.width = 0;
        this.height = 0;
        this.frameWidth = 0;
        this.frameHeight = 0;
        this.offset = { x: 0, y: 0 };
        this.dead = false;
        this.graphic = graphic;
        this.image = null;

        // Load the graphic if provided
        if (graphic) {
            this.loadGraphic(graphic);
        }
    }

    loadGraphic(graphic) {
        this.image = new Image();
        this.image.src = graphic;
        this.image.onload = () => {
            this.width = this.image.width;
            this.height = this.image.height;
            this.frameWidth = this.width;
            this.frameHeight = this.height;
        };
    }

    loadRotatedGraphic(graphic, frames = 1, frame = -1, antialiasing = false, autoBuffer = false) {
        this.loadGraphic(graphic);
        // In JS we can rotate the canvas rather than precalculating rotated frames
        this.antialiasing = antialiasing;
    }

    makeGraphic(width, height, color = '#FFFFFF') {
        this.width = width;
        this.height = height;
        this.frameWidth = width;
        this.frameHeight = height;

        // Create a canvas to draw the graphic
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);

        // Convert canvas to an image
        this.image = new Image();
        this.image.src = canvas.toDataURL();
    }

    alterBoundingBox() {
        // Reduce the collision box size
        const oldWidth = this.width;
        const oldHeight = this.height;
        this.width = this.width * 0.75;
        this.height = this.height * 0.75;
        this.centerOffsets(oldWidth, oldHeight);
    }

    centerOffsets(oldWidth, oldHeight) {
        // Center the sprite based on its actual size vs bounding box
        this.offset.x = (oldWidth - this.width) / 2;
        this.offset.y = (oldHeight - this.height) / 2;
    }

    update(elapsed) {
        if (!this.exists || !this.active) return;

        // Update position and angle based on velocity and acceleration
        this.velocity.x += this.acceleration.x * elapsed;
        this.velocity.y += this.acceleration.y * elapsed;
        this.x += this.velocity.x * elapsed;
        this.y += this.velocity.y * elapsed;
        this.angle += this.angularVelocity * elapsed;

        // Handle screen wrapping
        this.wrap();
    }

    wrap() {
        // Wrap sprite around the screen edges
        if (this.x < -this.frameWidth + this.offset.x) {
            this.x = Game.width + this.offset.x;
        } else if (this.x > Game.width + this.offset.x) {
            this.x = -this.frameWidth + this.offset.x;
        }

        if (this.y < -this.frameHeight + this.offset.y) {
            this.y = Game.height + this.offset.y;
        } else if (this.y > Game.height + this.offset.y) {
            this.y = -this.frameHeight + this.offset.y;
        }
    }

    draw(ctx) {
        if (!this.exists || !this.visible) {
            return;
        }

        // Special case for bullets to debug
        if (this.frameWidth === 8 && this.frameHeight === 2) {
            console.log(`Drawing bullet at (${this.x.toFixed(2)}, ${this.y.toFixed(2)}), velocity=(${this.velocity.x.toFixed(2)}, ${this.velocity.y.toFixed(2)})`);

            // Draw bullet as a simple white rectangle
            ctx.save();
            ctx.translate(this.x + this.frameWidth / 2, this.y + this.frameHeight / 2);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.translate(-this.frameWidth / 2, -this.frameHeight / 2);

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, this.frameWidth, this.frameHeight);
            ctx.restore();
            return;
        }

        if (!this.image) {
            // Draw a fallback rectangle if no image is available
            ctx.save();
            ctx.translate(this.x + this.frameWidth / 2, this.y + this.frameHeight / 2);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.translate(-this.frameWidth / 2, -this.frameHeight / 2);

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, this.frameWidth, this.frameHeight);
            ctx.restore();
            return;
        }

        ctx.save();
        ctx.translate(this.x + this.frameWidth / 2, this.y + this.frameHeight / 2);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.translate(-this.frameWidth / 2, -this.frameHeight / 2);

        if (this.antialiasing) {
            ctx.imageSmoothingEnabled = true;
        } else {
            ctx.imageSmoothingEnabled = false;
        }

        ctx.drawImage(this.image, 0, 0);
        ctx.restore();
    }

    kill() {
        this.exists = false;
        this.dead = true;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.exists = true;
        this.visible = true;
        this.active = true;
        this.dead = false;
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.angularVelocity = 0;
        console.log(`Sprite reset at position (${x}, ${y}), exists=${this.exists}, visible=${this.visible}`);
        return this;
    }

    justTouched(direction) {
        // Simple collision detection flag for the asteroid class
        return this.touchedBy !== null;
    }
}