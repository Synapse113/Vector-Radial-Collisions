// grab the canvas
const canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');
// set size
canvas.width = innerWidth;
canvas.height = innerHeight;

const button = document.getElementsByClassName('newTerrainButton'); // grab the button

// reload page on click
button[0].addEventListener('click', function() {
    document.location.reload(true)
})

let frameCount = 0; // counts animation frames

const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    },
    up: {
        pressed: false
    }
};

// *********************************** BASIC FUNCTIONS ***********************************
// calculates distance between 2 points
function dist() {
    let dx, dy, dz;
    if (arguments.length === 4) {
        dx = arguments[0] - arguments[2];
        dy = arguments[1] - arguments[3];
        return Math.sqrt(dx * dx + dy * dy)
    }
    if (arguments.length === 6) {
        dx = arguments[0] - arguments[3];
        dy = arguments[1] - arguments[4];
        dz = arguments[2] - arguments[5];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}
// shorthand to draw an ellipse
function ellipse(x, y, s, clr) {
    c.fillStyle = clr;
    c.beginPath();
    c.ellipse(x, y, s, s, Math.PI / 4, 0, 2 * Math.PI);
    c.fill();
}
// calculates the number between two numbers at a certain increment (used for smooth value transitions)
function lerp(val1, val2, amt) {
    return ((val2 - val1) * amt) + val1;
}

// *********************************** 2D VECTOR LIBRARY ***********************************
function PVector(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}
PVector.prototype.mag = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};
PVector.prototype.div = function(n) {
    this.x = this.x / n;
    this.y = this.y / n;
}
PVector.prototype.normalize = function() {
    let m = this.mag();
    if (m > 0) {
        this.div(m)
    }
};

// trail object
function Trail(x, y) {
    this.x = x;
    this.y = y;
    this.size = 10;
    this.dead = false;
}
Trail.prototype.run = function() {
    c.shadowBlur = 15;
    c.shadowColor = 'white';
    ellipse(this.x, this.y, this.size, 'blue')
    this.size -= 0.5;
    if (this.size <= 0) {
        this.dead = true;
    }
}

var trails = []; // store trails

// player object
function Player(x, y, s) {
    this.x = x;
    this.y = y;
    this.size = s;
    this.xVel = 0;
    this.yVel = 0;
    this.gravity = 0.5;
    this.maxSpeed = 5;
    this.friction = 0.8;
    this.canJump = false;
    this.jumpHeight = 12;
    this.updatedSize = this.size;
}
Player.prototype.draw = function() {
    c.shadowBlur = 20;
    c.shadowColor = 'white'
    ellipse(this.x, this.y, this.size, 'blue');

    // draw trails
    if (frameCount % 5 === 0) {
        trails.push(new Trail(this.x, this.y))
    }
};
Player.prototype.update = function() {
    // update positions by velocities.
    this.x += this.xVel;
    this.yVel += this.gravity;
    this.y += this.yVel;
    this.xVel *= this.friction;

    if (keys.right.pressed) {
        this.xVel = this.maxSpeed;
    }else if (keys.left.pressed) {
        this.xVel = -this.maxSpeed;
    }

    if (keys.up.pressed && this.canJump) {
        this.yVel = -this.jumpHeight;
        this.canJump = false;
    }

    if (this.canJump) {
        this.size = lerp(this.size, 17, 0.1);
    }else {
        this.size = lerp(this.size, 20, 0.1);
    }

    // wrap player when it reaches edge
    if (this.x > canvas.width + this.size) {
        this.x = -this.size;
    }else if (this.x < -this.size) {
        this.x = canvas.width + this.size;
    }else if (this.y > canvas.height) {
        this.y = -this.size;
    }

    // keep player from falling too fast
    if (this.yVel > 30) {
        this.yVel = 30;
    }
};

// circle object
function Circle(x, y, s) {
    this.x = x;
    this.y = y;
    this.size = s;
    this.drawTree = Math.random() * 50;
    this.grow = true;
}
Circle.prototype.draw = function() {
    c.shadowBlur = 10;
    c.shadowColor = 'black'
    ellipse(this.x, this.y, this.size, 'darkblue');

    if (this.drawTree > 45 && this.grow && trees.length < 3) {
        trees.push(new drawTree(this.x, this.y, this.size))
        this.grow = false;
    }
};
Circle.prototype.collide = function(obj) {
    if (dist(this.x, this.y, obj.x, obj.y) < this.size + obj.size) {
        if (obj.y < this.y + obj.size) {
            obj.canJump = true;
        }
        // make player bounce
        if (obj.yVel >= 0) {
            obj.yVel *= -0.5; 
        }
        // solve collision
        let newVect = new PVector(obj.x - this.x, obj.y - this.y);
        newVect.normalize();
        obj.x = (newVect.x * (this.size + obj.size)) + this.x;
        obj.y = (newVect.y * (this.size + obj.size)) + this.y;
    }
};

const player = new Player(canvas.width / 2, 200, 20);

var circles = []; // store circles

var maxCircles = Math.floor(Math.random() * 15 + 5); // max amout of circles spawned

// draw terrain
for (var i = 0; i < maxCircles; i ++) {
    circles.push(new Circle(Math.random() * canvas.width, Math.random() * canvas.height, Math.floor(Math.random() * 80 + 40)));
}

// animation loop
function animate() {
    c.clearRect(0, 0, canvas.width, canvas.height);

    // draw trees
    for (let i = 0; i < trees.length; i++) {
        trees[i].display();
    }

    // draw and update circles
    for (let i = 0; i < circles.length; i++) {
        var cir = circles[i];
        cir.draw();
        cir.collide(player);
    }

    // draw and update trails
    for (let i = 0; i < trails.length; i++) {
        trails[i].run();
        if (trails[i].dead) {
            trails.splice(i, 1);
        }
    }

    // draw and update player
    player.draw();
    player.update();

    frameCount = (frameCount + 1) % 60 // update frameCount

    requestAnimationFrame(animate);
}

window.onload = function() {
    animate();
}

addEventListener('keydown', ({ key }) => {
    switch(key) {
        case 'ArrowRight':
            keys.right.pressed = true;
            break;
        case 'ArrowLeft':
            keys.left.pressed = true;
            break;
        case 'ArrowUp':
            keys.up.pressed = true;
            break;
    }
})
addEventListener('keyup', ({ key }) => {
    switch(key) {
        case 'ArrowRight':
            keys.right.pressed = false;
            break;
        case 'ArrowLeft':
            keys.left.pressed = false;
            break;
        case 'ArrowUp':
            keys.up.pressed = false;
            break;
    }
})