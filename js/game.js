// Group class for managing collections of sprites
class Group {
    constructor(maxSize = 0) {
        this.members = [];
        this.maxSize = maxSize;
        this.length = 0;

        // Pre-populate with null if maxSize is specified
        if (maxSize > 0) {
            for (let i = 0; i < maxSize; i++) {
                this.members.push(null);
            }
        }
    }

    add(sprite) {
        if (this.maxSize > 0) {
            // Find an empty slot
            for (let i = 0; i < this.maxSize; i++) {
                if (!this.members[i]) {
                    this.members[i] = sprite;
                    this.length++;
                    return sprite;
                }
            }
        } else {
            // Just add to the end
            this.members.push(sprite);
            this.length++;
        }
        return sprite;
    }

    recycle(classRef = null) {
        // Find the first dead member
        for (let i = 0; i < this.members.length; i++) {
            if (this.members[i] && !this.members[i].exists) {
                return this.members[i];
            }
        }

        // If none found and we have a class, create a new one
        if (classRef) {
            const newObj = new classRef();
            this.add(newObj);
            return newObj;
        }

        return null;
    }

    getFirstDead() {
        console.log("Searching for dead bullets in group of length:", this.members.length);
        let deadCount = 0;
        // Find the first dead member
        for (let i = 0; i < this.members.length; i++) {
            if (this.members[i] && !this.members[i].exists) {
                console.log("Found dead bullet at index:", i);
                return this.members[i];
            }
            if (this.members[i] && this.members[i].exists) {
                deadCount++;
            }
        }
        console.log("No dead bullets found. Active bullets:", deadCount);
        return null;
    }

    update(elapsed) {
        for (let i = 0; i < this.members.length; i++) {
            if (this.members[i] && this.members[i].exists && this.members[i].active) {
                this.members[i].update(elapsed);
            }
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.members.length; i++) {
            if (this.members[i] && this.members[i].exists && this.members[i].visible) {
                this.members[i].draw(ctx);
            }
        }
    }

    forEach(callback) {
        for (let i = 0; i < this.members.length; i++) {
            if (this.members[i]) {
                callback(this.members[i], i);
            }
        }
    }
}

// Base state class
class State {
    constructor() {
        this.members = [];
    }

    create() {
        // Override in subclasses
    }

    update(elapsed) {
        for (let i = 0; i < this.members.length; i++) {
            if (this.members[i].update) {
                this.members[i].update(elapsed);
            }
        }
    }

    draw(ctx) {
        // Clear the canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, Game.width, Game.height);

        // Draw all members
        for (let i = 0; i < this.members.length; i++) {
            if (this.members[i].draw) {
                this.members[i].draw(ctx);
            }
        }
    }

    add(object) {
        this.members.push(object);
        return object;
    }
}

// Menu state - displays game title and waits for player to start
class MenuState extends State {
    create() {
        // Show mouse cursor
        Game.canvas.style.cursor = 'default';

        // Add title text
        this.titleText = {
            text: "FlxTeroids",
            x: 0,
            y: Game.height / 2 - 20,
            size: 32,
            color: '#FFFFFF',
            draw: function(ctx) {
                ctx.font = this.size + 'px Arial';
                ctx.fillStyle = this.color;
                ctx.textAlign = 'center';
                ctx.fillText(this.text, Game.width / 2, this.y);
            }
        };
        this.add(this.titleText);

        // Add start text
        this.startText = {
            text: "click to play",
            x: 0,
            y: Game.height - 30,
            size: 16,
            color: '#FFFFFF',
            draw: function(ctx) {
                ctx.font = this.size + 'px Arial';
                ctx.fillStyle = this.color;
                ctx.textAlign = 'center';
                ctx.fillText(this.text, Game.width / 2, this.y);
            }
        };
        this.add(this.startText);

        // Add click handler
        this.clickHandler = (e) => {
            Game.canvas.removeEventListener('click', this.clickHandler);
            Game.switchState(new PlayState());
        };
        Game.canvas.addEventListener('click', this.clickHandler);
    }
}

// Play state - the main game state
class PlayState extends State {
    create() {
        // Hide mouse cursor
        Game.canvas.style.cursor = 'none';

        // Add background stars
        for (let i = 0; i < 100; i++) {
            const star = new WrapSprite(Utils.random(Game.width), Utils.random(Game.height));
            star.makeGraphic(1, 1, '#FFFFFF');
            star.active = false;
            this.add(star);
        }

        // Create asteroid group
        this.asteroids = new Group();
        this.add(this.asteroids);

        // Spawn initial asteroids
        this.spawnAsteroid();
        this.spawnAsteroid();
        this.spawnAsteroid();

        // Create player ship
        this.playerShip = new PlayerShip();
        this.add(this.playerShip);

        // Create bullets
        const numBullets = 32;
        this.bullets = new Group(numBullets);

        console.log("Creating " + numBullets + " bullets");
        for (let i = 0; i < numBullets; i++) {
            const bullet = new WrapSprite(-100, -100);

            // Make bullets larger and more visible
            bullet.makeGraphic(10, 4, '#FFFFFF');
            bullet.frameWidth = 10;
            bullet.frameHeight = 4;
            bullet.width = 10;
            bullet.height = 4;
            bullet.offset.x = 0;
            bullet.offset.y = 0;

            // IMPORTANT: Make sure bullet is initially marked as dead
            bullet.exists = false;
            bullet.visible = false;
            bullet.active = false;

            this.bullets.add(bullet);
            console.log("Added bullet " + i + ", exists = " + bullet.exists);
        }
        this.add(this.bullets);

        // Initialize asteroid timer
        this.timer = 1 + Utils.random(4);
    }

    update(elapsed) {
        // Count down asteroid spawn timer
        this.timer -= elapsed;
        if (this.timer <= 0) {
            this.spawnAsteroid();
        }

        // Debug bullet count
        let activeBullets = 0;
        for (let i = 0; i < this.bullets.members.length; i++) {
            if (this.bullets.members[i] && this.bullets.members[i].exists) {
                activeBullets++;
            }
        }
        if (activeBullets > 0) {
            console.log(`Active bullets: ${activeBullets}`);
        }

        // Update all sprites except bullets (we'll handle them specially)
        for (let i = 0; i < this.members.length; i++) {
            if (this.members[i] !== this.bullets && this.members[i].update) {
                this.members[i].update(elapsed);
            }
        }

        // Explicitly update bullets
        for (let i = 0; i < this.bullets.members.length; i++) {
            const bullet = this.bullets.members[i];
            if (bullet && bullet.exists) {
                // Explicitly update position
                bullet.x += bullet.velocity.x * elapsed;
                bullet.y += bullet.velocity.y * elapsed;
                bullet.wrap();
            }
        }

        // Check for collisions
        this.checkCollisions();

        // Reset game if player died
        if (!this.playerShip.exists) {
            Game.switchState(new PlayState());
        }
    }

    checkCollisions() {
        // Check bullets hitting asteroids
        for (let i = 0; i < this.bullets.members.length; i++) {
            const bullet = this.bullets.members[i];
            if (!bullet || !bullet.exists) continue;

            for (let j = 0; j < this.asteroids.members.length; j++) {
                const asteroid = this.asteroids.members[j];
                if (!asteroid || !asteroid.exists) continue;

                if (Utils.overlap(bullet, asteroid)) {
                    this.stuffHitStuff(bullet, asteroid);
                    break;
                }
            }
        }

        // Check asteroids hitting player
        for (let i = 0; i < this.asteroids.members.length; i++) {
            const asteroid = this.asteroids.members[i];
            if (!asteroid || !asteroid.exists) continue;

            if (Utils.overlap(asteroid, this.playerShip)) {
                this.stuffHitStuff(asteroid, this.playerShip);
                break;
            }
        }

        // Check asteroids colliding with each other
        for (let i = 0; i < this.asteroids.members.length; i++) {
            const asteroid1 = this.asteroids.members[i];
            if (!asteroid1 || !asteroid1.exists) continue;

            for (let j = i + 1; j < this.asteroids.members.length; j++) {
                const asteroid2 = this.asteroids.members[j];
                if (!asteroid2 || !asteroid2.exists) continue;

                if (Utils.overlap(asteroid1, asteroid2)) {
                    // Elastic collision
                    asteroid1.touchedBy = asteroid2;
                    asteroid2.touchedBy = asteroid1;

                    // Simple bounce physics
                    const temp = { x: asteroid1.velocity.x, y: asteroid1.velocity.y };
                    asteroid1.velocity.x = asteroid2.velocity.x;
                    asteroid1.velocity.y = asteroid2.velocity.y;
                    asteroid2.velocity.x = temp.x;
                    asteroid2.velocity.y = temp.y;
                }
            }
        }
    }

    stuffHitStuff(object1, object2) {
        object1.kill();
        object2.kill();
    }

    spawnAsteroid() {
        const asteroid = this.asteroids.recycle(Asteroid);
        asteroid.create();
        this.timer = 1 + Utils.random(4);
    }
}

// Main game loop
function gameLoop(timestamp) {
    if (!Game.prevTime) Game.prevTime = timestamp;
    Game.elapsed = (timestamp - Game.prevTime) / 1000;
    Game.prevTime = timestamp;

    // Cap max elapsed time to prevent weird behavior on tab switch
    if (Game.elapsed > 0.1) Game.elapsed = 0.1;

    // Update input state
    Keys.update();

    // Update and render game state
    if (Game.state) {
        Game.state.update(Game.elapsed);
        Game.state.draw(Game.ctx);
    }

    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Initialize game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    Game.init();
    Game.switchState(new MenuState());
    requestAnimationFrame(gameLoop);
});