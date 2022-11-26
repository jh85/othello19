var game;
var gameOptions = {
    tileSize: 40,
    tileSpacing: 1,
    tileOffset: 10,
    tileNum: 19,
    tweenSpeed: 500,
    scoreBoardWidth: 200
}

var othello;
const WHITE = 0;
const BLACK = 1;
const EMPTY = 2;

class Statistics {
    constructor() {
	this.passCount = 0;
	this.flipOver5 = 0;
	this.flipOver10 = 0;
	this.flipOver19 = 0;
	this.cornerCount = 0;
    }
}
var stats = [new Statistics(), new Statistics()];

window.onload = function() {
    var gameConfig = {
	width: (gameOptions.tileSize+gameOptions.tileSpacing)*gameOptions.tileNum +
	    gameOptions.tileOffset*2 + gameOptions.tileSpacing + gameOptions.scoreBoardWidth,
	height: (gameOptions.tileSize+gameOptions.tileSpacing)*gameOptions.tileNum +
	    gameOptions.tileOffset*2 + gameOptions.tileSpacing,
	backgroundColor: 0x028A0F, // emerald
	scene: [bootGame,playGame]
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
    resizeGame();
    window.addEventListener("resize", resizeGame);
}

function resizeGame() {
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if (windowRatio < gameRatio) {
	canvas.style.width = windowWidth + "px";
	canvas.style.height = (windowWidth / gameRatio) + "px";
    } else {
	canvas.style.width = (windowHeight * gameRatio) + "px";
	canvas.style.height = windowHeight + "px";
    }
}

class bootGame extends Phaser.Scene {
    constructor() {
	super("BootGame");
    }
    preload() {
	this.load.image("gameboard", "board19x19.png");
	this.load.spritesheet("tiles", "tiles.png", {
	    frameWidth: gameOptions.tileSize,
	    frameHeight: gameOptions.tileSize
	});
	this.load.image("scoreboard", "scoreboard.png");
	this.load.audio("move", ["move.mp3"]);
	this.load.audio("pass", ["pass.mp3"]);
	this.load.audio("recover1", ["recover1.mp3"]);
	this.load.audio("recover2", ["recover2.mp3"]);
	this.load.audio("recover3", ["recover3.mp3"]);
	this.load.spritesheet("passMessage", "pass.png", {frameWidth: 200, frameHeight: 200, endFrame: 0});
	this.load.spritesheet("gameoverMessage", "gameover.png", {frameWidth: 200, frameHeight: 200, endFrame: 0});
	this.load.bitmapFont("fontb", "digitb.png", "digitb.fnt");
	this.load.bitmapFont("fontw", "digitw.png", "digitw.fnt");
    }
    create() {
	this.scene.start("PlayGame");
    }
}

class playGame extends Phaser.Scene {
    constructor() {
	super("PlayGame");
    }
    create() {
	this.canMove = false;
	var backGround = this.add.image(400,400,"gameboard");
	backGround.setInteractive();
	backGround.on("pointerdown", this.handleMouse, this);

	var scoreBackGround = this.add.image(900,400,"scoreboard");
	
	this.blackScore = this.add.bitmapText(850,20,"fontb", "0");
	this.whiteScore = this.add.bitmapText(850,120,"fontw", "0");
	this.blackScore.text = "2";
	this.whiteScore.text = "2";

	this.input.on("pointerup", this.handleSwipe, this);
	
	this.boardArray = [];
	for (var i = 0; i < gameOptions.tileNum; i++) {
	    this.boardArray[i] = [];
	    for (var j = 0; j < gameOptions.tileNum; j++) {
		var tilePosition = this.getTilePosition(i,j);
		var tile = this.add.sprite(tilePosition.x, tilePosition.y, "tiles", WHITE);
		tile.visible = false;
		this.boardArray[i][j] = {
		    tileValue: WHITE,
		    tileSprite: tile
		}
	    }
	}
	var mid = Math.floor(gameOptions.tileNum/2);
	var posW0 = new Phaser.Geom.Point(mid-1, mid-1);
	var posW1 = new Phaser.Geom.Point(mid,   mid);
	var posB0 = new Phaser.Geom.Point(mid,   mid-1);
	var posB1 = new Phaser.Geom.Point(mid-1, mid);
	this.addTile(WHITE, posW0);
	this.addTile(WHITE, posW1);
	this.addTile(BLACK, posB0);
	this.addTile(BLACK, posB1);

	this.moveSound = this.sound.add("move");
	this.passSound = this.sound.add("pass");
	this.recover1Sound = this.sound.add("recover1");
	this.recover2Sound = this.sound.add("recover2");
	this.recover3Sound = this.sound.add("recover3");
	othello = new Othello(gameOptions.tileNum);
	this.canMove = true;
    }

    handleSwipe(e) {
	if (this.canMove) {
	    var swipeTime = e.upTime - e.downTime;
	    var pos = this.getGridPosition(e.upX,e.upY);
	    this.playerMove(pos);
	}
    }
    
    getTilePosition(row,col) {
	var posX = gameOptions.tileOffset + Math.floor(gameOptions.tileSize/2) +
	    gameOptions.tileSpacing + row * (gameOptions.tileSize+gameOptions.tileSpacing);
	var posY = gameOptions.tileOffset + Math.floor(gameOptions.tileSize/2) +
	    gameOptions.tileSpacing + col * (gameOptions.tileSize+gameOptions.tileSpacing);
	return new Phaser.Geom.Point(posX,posY);
    }

    getGridPosition(posX,posY) {
	var row = Math.floor((posX - gameOptions.tileOffset) / (gameOptions.tileSize+gameOptions.tileSpacing));
	var col = Math.floor((posY - gameOptions.tileOffset) / (gameOptions.tileSize+gameOptions.tileSpacing));
	return new Phaser.Geom.Point(row,col);
    }

    addTile(myColor,pos) {
	var row = pos.x;
	var col = pos.y;
	this.boardArray[row][col].tileValue = myColor;
	this.boardArray[row][col].tileSprite.visible = true;
	this.boardArray[row][col].tileSprite.setFrame(myColor);
	this.boardArray[row][col].tileSprite.alpha = 1;
    }

    handleMouse() {
	if (this.canMove) {
	    var x = Math.floor(game.input.mousePointer.x / gameOptions.tileNum);
	    var y = Math.floor(game.input.mousePointer.y / gameOptions.tileNum);
	    var pos = this.getGridPosition(game.input.mousePointer.x, game.input.mousePointer.y);
	    this.playerMove(pos);
	}
    }

    playerMove(pos) {
	if (this.canMove) {
	    if (0 <= pos.x && pos.x < gameOptions.tileNum &&
		0 <= pos.y && pos.y < gameOptions.tileNum) {
		if (othello.isLegal(pos)) {
		    this.canMove = false;
		    var myColor = othello.turn();
		    var flipped = othello.move(pos);
		    this.blackScore.text = (parseInt(this.blackScore.text) + flipped.length + 1).toString();
		    this.whiteScore.text = (parseInt(this.whiteScore.text) - flipped.length).toString();
		    this.moveAndFlip(myColor, pos, flipped);
		}
	    }
	}
    }

    computerMove() {
	var legalPositions = othello.legalMoves();
	var pos = new Phaser.Geom.Point(-1,-1);
	if (legalPositions.length != 0) {
	    var k = Phaser.Math.Between(0,legalPositions.length-1);
	    pos = legalPositions[k];
	}
	var myColor = othello.turn();
	var flipped = othello.move(pos);
	if (flipped.length != 0) {
	    this.blackScore.text = (parseInt(this.blackScore.text) - flipped.length).toString();
	    this.whiteScore.text = (parseInt(this.whiteScore.text) + flipped.length + 1).toString();
	}
	this.moveAndFlip(myColor,pos,flipped);
    }

    showPassMessage() {
	this.passSound.play();
	var passMsg = this.add.sprite(900,300,"passMessage",0);
	passMsg.alpha = 1;
	this.tweens.add({
	    targets: [passMsg],
	    alpha: 1,
	    duration: gameOptions.tweenSpeed * 6,
	    callbackScope: this,
	    onComplete: function() {
		passMsg.alpha = 0;
		this.canMove = true;
	    }
	});
    }

    moveAndFlip(myColor, pos, flipped) {
	if (flipped.length == 0) {
	    stats[myColor].passCount++;
	    this.showPassMessage();
	    if (myColor == BLACK) {
		this.computerMove();
	    }
	} else {
	    this.addTile(myColor,pos);
	    if (flipped.length < 5) {
		this.moveSound.play();
	    } else if (flipped.length < 10) {
		stats[myColor].flipOver5++;
		this.recover1Sound.play();
	    } else if (flipped.length < 19) {
		stats[myColor].flipOver10++;
		this.recover2Sound.play();
	    } else {
		stats[myColor].flipOver19++;
		this.recover3Sound.play();
	    }
	    var targets = [];
	    flipped.forEach((pos2) => {
		targets.push(this.boardArray[pos2.x][pos2.y].tileSprite);
		this.boardArray[pos2.x][pos2.y].tileSprite.alpha = 0;
		this.boardArray[pos2.x][pos2.y].tileValue = myColor;
		this.boardArray[pos2.x][pos2.y].tileSprite.visible = true;
		this.boardArray[pos2.x][pos2.y].tileSprite.setFrame(myColor);
	    });
	    this.tweens.add({
		targets: targets,
		alpha: 1,
		duration: gameOptions.tweenSpeed,
		callbackScope: this,
		onComplete: function() {
		    if (myColor == BLACK) {
			if (parseInt(this.blackScore.text) + parseInt(this.whiteScore.text) == 361) {
			    var gameOverMsg = this.add.sprite(900,400,"gameoverMessage",0);
			    gameOverMsg.alpha = 1;
			} else {
			    this.computerMove();
			}
		    } else {
			if ((othello.legalMoves()).length == 0) {
			    this.showPassMessage();
			    var pos = Phaser.Geom.Point(-1,-1);
			    othello.move(pos);
			    this.computerMove();
			} else {
			    this.canMove = true;
			}
		    }
		}
	    });
	}
    }
}
