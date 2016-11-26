/*The Game Board hold the player, enemies and some other stuff,
  it control the game update logic and render the things in it.*/
var Board = function(player, enemies, counter, picker) {
    this.numRows = 6;
    this.numCols = 5;
    /* This array holds the relative URL to the image used
     * for that particular row of the game level.
     */
    this.rowImages = [
        'images/water-block.png', // Top row is water
        'images/stone-block.png', // Row 1 of 3 of stone
        'images/stone-block.png', // Row 2 of 3 of stone
        'images/stone-block.png', // Row 3 of 3 of stone
        'images/grass-block.png', // Row 1 of 2 of grass
        'images/grass-block.png' // Row 2 of 2 of grass
    ];
    this.player = player;
    this.enemies = enemies;
    this.counter = counter;
    this.picker = picker;
    player.board = this;
    counter.board = this;
    this.isActive = true;
};


Board.prototype.reset = function() {
    this.player.reset();
    this.enemies.forEach(function(bug) {
        bug.reset();
    });
    this.counter.reset();
    this.render();
};

Board.prototype.render = function() {
    if (!this.isActive) return;
    var col, row;
    /* Loop through the number of rows and columns we've defined above
     * and, using the rowImages array, draw the correct image for that
     * portion of the "grid"
     */
    for (row = 0; row < this.numRows; row++) {
        for (col = 0; col < this.numCols; col++) {
            /* The drawImage function of the canvas' context element
             * requires 3 parameters: the image to draw, the x coordinate
             * to start drawing and the y coordinate to start drawing.
             * We're using our Resources helpers to refer to our images
             * so that we get the benefits of caching these images, since
             * we're using them over and over.
             */
            ctx.drawImage(Resources.get(this.rowImages[row]), col * 101, row * 83);
        }
    }

    /* Loop through all of the objects within the allEnemies array and call
     * the render function you have defined.
     */
    this.picker.render();
    this.enemies.forEach(function(enemy) {
        enemy.render();
    });
    if (!this.picker.isSeleting) {
        this.player.render();
    }
    this.counter.render();

};

/*update the enetity on board*/
Board.prototype.update = function(dt) {
    if (!this.isActive) return;
    this.enemies.forEach(function(enemy) {
        enemy.update(dt);
        //check collision
        if (enemy.isCollised(this.player)) {
            this.player.reset();
            this.counter.reduceHeart();
        }
    }, this);
    this.picker.update();
};

//get notify when player win the game
//insted of checking player' position every update time
Board.prototype.playerWin = function() {
    this.counter.addScore();
    this.enemies.forEach(function(bug) {
        bug.reset();
    });
    this.player.reset();
};

/*no heart left, game over, showe the scores*/
Board.prototype.gameOver = function(scores) {
    //if player win, reset all game
    this.reset();
    this.isActive = false; //pause the game
    swal({
        title: "Your Scores: " + scores,
        type: "success",
        confirmButtonText: "start agin"
    }, (function() {
        this.reset(); //reset player's pos
        this.isActive = true;
    }).bind(this));
};

/*receive input from keyboard, move the player*/
Board.prototype.handleInput = function(dir) {
    if (this.player.isInPickerZone()) { //player in Selector zone
        if (dir === 'space') {
            this.picker.toggleSelect(this.player);
        }
        if (!this.picker.isSeleting) {
            this.player.move(dir);
        }
    } else {
        this.player.move(dir);
    }
};

var Character = function(sprite, x, y) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
}

Character.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


// Enemies our player must avoid
var Enemy = function(row) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    Character.call(this, 'images/enemy-bug.png',
        this.getRandomInt(-101, 606),
        54 + row * 84);
    this.speed = 100 + this.getRandomInt(0, 400);
};

Enemy.prototype = Object.create(Character.prototype);

Enemy.prototype.constructor = Enemy;
Enemy.prototype.WIDTH = 98;
Enemy.prototype.HEIGHT = 60;

Enemy.prototype.getRandomInt = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (this.x > 505) {
        this.x = -101;
    }
    this.x += dt * this.speed;
};

Enemy.prototype.isCollised = function(player) {
    if (player.realX() < this.realX() + this.WIDTH &&
        player.realX() + player.WIDTH > this.realX() &&
        player.realY() < this.realY() + this.HEIGHT &&
        player.realY() + player.HEIGHT > this.realY()) {
        // //if player fail, reset the player position, remain the bugs speed.
        return true;
    }
    return false;
};


// count enemy's real x position
Enemy.prototype.realX = function() {
    return this.x + 2;
};

Enemy.prototype.realY = function() {
    return this.y + 72;
};

Enemy.prototype.reset = function() {
    this.speed = 100 + this.getRandomInt(0, 400);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    Character.call(this, 'images/char-boy.png',
        202,
        390);
};

Player.prototype = Object.create(Character.prototype);

Player.prototype.constructor = Player;

Player.prototype.TILE_WIDTH = 101;
Player.prototype.TILE_HEIGHT = 83;
Player.prototype.WIDTH = 75;
Player.prototype.HEIGHT = 93;

Player.prototype.reset = function() {
    this.x = 202;
    this.y = 390; //54 + 84 * 4
};

/*player's real position*/
Player.prototype.realX = function() {
    return this.x + 13;
};

Player.prototype.realY = function() {
    return this.y + 56;
};

Player.prototype.move = function(dir) {
    switch (dir) {
        case "up":
            this.y -= this.TILE_HEIGHT;
            break;
        case "left":
            this.x -= this.TILE_WIDTH;
            break;
        case "right":
            this.x += this.TILE_WIDTH;
            break;
        case "down":
            this.y += this.TILE_HEIGHT;
            break;
    }
    if (this.x < 0) this.x = 0;
    if (this.x > 404) this.x = 404;
    if (this.y > 390) this.y = 390;
    if (this.y < 0) {
        this.board.playerWin();
    }
};

Player.prototype.isInPickerZone = function() {
    return this.x === 0 && this.y === 390;
};

/*game counter board*/
var GameCounter = function() {
    this.numHeart = 3;
    this.scores = 0;
    this.heartIco = "images/Heart.png";
};

GameCounter.prototype.reset = function() {
    this.numHeart = 3;
    this.scores = 0;
};

GameCounter.prototype.render = function() {
    ctx.clearRect(0, 0, 505, 40); //clear canvas top
    ctx.drawImage(Resources.get(this.heartIco), 0, -15, 40, 68); //draw heart
    ctx.fillText(" x " + this.numHeart, 45, 33);
    ctx.fillText("Scores: " + this.scores, 300, 33);
};

GameCounter.prototype.reduceHeart = function() {
    if (--this.numHeart === 0) {
        this.board.gameOver(this.scores);
    }
};


GameCounter.prototype.addScore = function() {
    this.scores += 100;
};

// TODO: add gem and heart to game to have more fun
var Bonus = function() {
    this.stuff = {
        heart: "images/Heart.png",
        GemB: "images/Gem Blue.png",
        GemG: "images/Gem Green.png",
        GemO: "images/Gem Orange.png"
    };
};


/*char Selector on the bottom left of game board*/
var CharPicker = function() {
    this.x = 0;
    this.y = 376;
    this.charY = 390;
    this.icon = "images/Selector.png";
    this.charArray = [
        'images/char-boy.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-cat-girl.png',
        'images/char-princess-girl.png'
    ];
    this.isSeleting = false;
    this.curIndex = 0;
    this.lastTime = 0;
};


CharPicker.prototype.render = function() {
    ctx.drawImage(Resources.get(this.icon), this.x, this.y);
    if (this.isSeleting) {
        ctx.drawImage(Resources.get(this.charArray[this.curIndex]), this.x, this.charY);
    }
};

/*change char every 0.5s*/
CharPicker.prototype.update = function() {
    var now = Date.now();
    var dt = (now - this.lastTime) / 1000.0;
    if (dt > 0.5) {
        if (++this.curIndex === this.charArray.length) {
            this.curIndex = 0;
        }
        this.lastTime = now;
    }
};

/*toggle the selector when press "space"*/
CharPicker.prototype.toggleSelect = function(player) {
    this.isSeleting = !this.isSeleting;
    if (!this.isSeleting) {
        player.sprite = this.charArray[this.curIndex];
    }
};



//init the gameBoard
var board = (function() {
    var allEnemies = [new Enemy(0),
        new Enemy(1),
        new Enemy(1),
        new Enemy(2)
    ];
    var player = new Player();
    var counter = new GameCounter();
    var picker = new CharPicker();
    return new Board(player, allEnemies, counter, picker);
})();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'space'
    };

    board.handleInput(allowedKeys[e.keyCode]);
});
