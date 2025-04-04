// Utility functions
const Utils = {
    // Rotate a point around the origin
    rotatePoint: function(x, y, pivotX, pivotY, angle, result) {
        const rad = angle * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // Translate point to origin
        const transX = x - pivotX;
        const transY = y - pivotY;

        // Rotate point
        const rotX = transX * cos - transY * sin;
        const rotY = transX * sin + transY * cos;

        // Translate back
        result.x = rotX + pivotX;
        result.y = rotY + pivotY;

        return result;
    },

    // Absolute value function
    abs: function(value) {
        return Math.abs(value);
    },

    // Random number between 0 and max
    random: function(max = 1) {
        return Math.random() * max;
    },

    // Check overlap between two sprites
    overlap: function(sprite1, sprite2) {
        if (!sprite1.exists || !sprite2.exists) return false;

        const s1Left = sprite1.x;
        const s1Right = sprite1.x + sprite1.width;
        const s1Top = sprite1.y;
        const s1Bottom = sprite1.y + sprite1.height;

        const s2Left = sprite2.x;
        const s2Right = sprite2.x + sprite2.width;
        const s2Top = sprite2.y;
        const s2Bottom = sprite2.y + sprite2.height;

        return !(s1Bottom < s2Top || s1Top > s2Bottom || s1Right < s2Left || s1Left > s2Right);
    },

    // Distance between two points
    distance: function(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }
};

// Simple keyboard input manager
const Keys = {
    pressed: {},
    justPressed: {},
    lastUpdate: 0,

    init: function() {
        window.addEventListener('keydown', (e) => {
            // Handle spacebar specifically (different browsers might use different codes)
            if (e.code === 'Space' || e.keyCode === 32) {
                if (!this.pressed['Space']) {
                    this.justPressed['Space'] = true;
                    console.log("Space justPressed set to true");
                }
                this.pressed['Space'] = true;
                e.preventDefault(); // Prevent page scrolling
            } else {
                if (!this.pressed[e.code]) {
                    this.justPressed[e.code] = true;
                }
                this.pressed[e.code] = true;
            }

            // For debugging key codes - can be removed in production
            console.log('Key down:', e.code, e.keyCode);
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space' || e.keyCode === 32) {
                this.pressed['Space'] = false;
            } else {
                this.pressed[e.code] = false;
            }
        });
    },

    update: function() {
        // Debug info
        if (Object.keys(this.justPressed).length > 0) {
            console.log("Keys.justPressed before reset:", {...this.justPressed});
        }

        // Only clear justPressed status for keys that were pressed in the previous frame
        // This helps if justPressed is checked before update() is called
        const now = Date.now();
        if (now - this.lastUpdate > 16) { // Roughly 60fps
            this.justPressed = {};
            this.lastUpdate = now;
        }
    }
};

// Game global variables
const Game = {
    width: 640,
    height: 480,
    canvas: null,
    ctx: null,
    state: null,
    prevTime: 0,
    elapsed: 0,

    init: function() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        Keys.init();
    },

    switchState: function(newState) {
        this.state = newState;
        this.state.create();
    }
};