// Player ship class
class PlayerShip extends WrapSprite {
    constructor() {
        super(Game.width / 2 - 8, Game.height / 2 - 8);
        this.loadRotatedGraphic('assets/ship.png', 32, -1, false, true);
        this.alterBoundingBox();
        this._thrust = 0;

        // Add direct spacebar listener for firing
        this.setupFiringControl();
    }

    setupFiringControl() {
        // Direct event listener for firing bullets
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.keyCode === 32) {
                this.fireBullet();
                e.preventDefault();
            }
        });
    }

    fireBullet() {
        console.log("DIRECT METHOD: Firing bullet");

        // Find a dead bullet
        let bullet = null;

        for (let i = 0; i < Game.state.bullets.members.length; i++) {
            if (!Game.state.bullets.members[i].exists) {
                bullet = Game.state.bullets.members[i];
                break;
            }
        }

        if (!bullet) {
            console.log("DIRECT METHOD: No bullets available!");
            return;
        }

        console.log("DIRECT METHOD: Found unused bullet");

        // Position the bullet
        bullet.x = this.x + (this.width - bullet.width) / 2;
        bullet.y = this.y + (this.height - bullet.height) / 2;
        bullet.angle = this.angle;

        // Calculate velocity
        const vel = { x: 0, y: 0 };
        Utils.rotatePoint(150, 0, 0, 0, bullet.angle, vel);

        // Set bullet velocity and make it active
        bullet.velocity.x = vel.x + this.velocity.x;
        bullet.velocity.y = vel.y + this.velocity.y;
        bullet.exists = true;
        bullet.visible = true;
        bullet.active = true;
        bullet.dead = false;

        console.log("DIRECT METHOD: Bullet velocity:", bullet.velocity);
    }

    update(elapsed) {
        super.wrap();

        // Handle ship rotation
        this.angularVelocity = 0;
        if (Keys.pressed['ArrowLeft']) {
            this.angularVelocity -= 240;
        }
        if (Keys.pressed['ArrowRight']) {
            this.angularVelocity += 240;
        }

        // Handle thrust
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        if (Keys.pressed['ArrowUp']) {
            // Rotate and apply thrust in the direction the ship is facing
            const acc = { x: 0, y: 0 };
            Utils.rotatePoint(90, 0, 0, 0, this.angle, acc);
            this.acceleration.x = acc.x;
            this.acceleration.y = acc.y;
        }

        // Update position
        this.velocity.x += this.acceleration.x * elapsed;
        this.velocity.y += this.acceleration.y * elapsed;
        this.x += this.velocity.x * elapsed;
        this.y += this.velocity.y * elapsed;
        this.angle += this.angularVelocity * elapsed;
    }
}