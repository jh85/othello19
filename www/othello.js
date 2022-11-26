class Othello {
    constructor(tileNum) {
	this.turnColor = BLACK;
	this.myColor = BLACK;
	this.opColor = WHITE;
	this.tileNum = tileNum;
	this.board = this.setInitialPositions();
	this.moves = [];
    }

    turn() {
	return this.turnColor;
    }

    grid2pos(gridPos) {
	return gridPos.x + gridPos.y*this.tileNum;
    }

    pos2grid(pos) {
	return new Phaser.Geom.Point(pos % this.tileNum, Math.floor(pos / this.tileNum));
    }

    isLegal(gridPos) {
	var pos = this.grid2pos(gridPos);
	if (this.board[pos] != EMPTY) {
	    return false;
	} else {
	    var flipped = this.getReversibleStones(this.turnColor, pos);
	    if (flipped == 0) {
		return false;
	    } else {
		return true;
	    }
	}
    }

    setInitialPositions() {
	var b = [...Array(this.tileNum*this.tileNum)].map(x => EMPTY);
	var x = Math.floor(this.tileNum/2)-1;
	var y = Math.floor(this.tileNum/2)-1;
	b[y*this.tileNum+x] = WHITE;

	x = Math.floor(this.tileNum/2);
	y = Math.floor(this.tileNum/2);
	b[y*this.tileNum+x] = WHITE;

	x = Math.floor(this.tileNum/2)-1;
	y = Math.floor(this.tileNum/2);
	b[y*this.tileNum+x] = BLACK;

	x = Math.floor(this.tileNum/2);
	y = Math.floor(this.tileNum/2)-1;
	b[y*this.tileNum+x] = BLACK;

	return b;
    }

    isLetter(c) {
	return c.toLowerCase() != c.toUpperCase();
    }

    toNumber(c) {
	return c.charCodeAt(0) - "a".charCodeAt(0);
    }
    
    str2pos(str) {
	if (str == "pass") {
	    return -1;
	} else {
	    var c0 = str.substr(0,1);
	    var c1 = str.substr(1,1);
	    var x,y;
	    var len = str.length;
	    if (this.isLetter(c1)) {
		x = (this.toNumber(c0)+1)*26 + this.toNumber(c1);
		y = Number(str.substr(2,len-2)) - 1;
	    } else {
		x = this.toNumber(c0);
		y = Number(str.substr(1,len-1)) - 1;
	    }
	    return x + y*this.tileNum;
	}
    }

    legalMoves() {
	var myColor = this.turnColor;
	var legalPositions = [];
	for (var pos = 0; pos < this.board.length; pos++) {
	    if (this.board[pos] == EMPTY) {
		if (this.getReversibleStones(myColor,pos) != 0) {
		    legalPositions.push(this.pos2grid(pos));
		}
	    }
	}
	return legalPositions;
    }
    
    move(gridPos) {
	this.moves.push(gridPos);
	var flipped = [];
	if (gridPos.x != -1) {
	    var pos = this.grid2pos(gridPos);
	    this.board[pos] = this.turnColor;
	    var reversibles = this.getReversibleStones(this.turnColor,pos);
	    reversibles.forEach((pos2) => {
		this.board[pos2] = this.turnColor;
		flipped.push(this.pos2grid(pos2));
	    });
	}
	this.turnColor = 1 - this.turnColor;
	return flipped;
    }

    getReversibleStones(myColor, pos) {
	const squareNums = [
            this.tileNum-1 - (pos % this.tileNum),
            Math.min(this.tileNum-1 - (pos % this.tileNum), ((this.tileNum-1)*this.tileNum + (pos % this.tileNum) - pos) / this.tileNum),
            ((this.tileNum-1)*this.tileNum + (pos % this.tileNum) - pos) / this.tileNum,
            Math.min(pos % this.tileNum, ((this.tileNum-1)*this.tileNum + (pos % this.tileNum) - pos) / this.tileNum),
            pos % this.tileNum,
            Math.min(pos % this.tileNum, (pos - (pos % this.tileNum)) / this.tileNum),
            (pos - (pos % this.tileNum)) / this.tileNum,
            Math.min(this.tileNum-1 - (pos % this.tileNum), (pos - (pos % this.tileNum)) / this.tileNum),
	];
	const parameters = [1, this.tileNum+1, this.tileNum, this.tileNum-1, -1, -this.tileNum-1, -this.tileNum, -this.tileNum+1];
	let results = [];
	for (let i = 0; i < 8; i++) {
            const box = [];
            const squareNum = squareNums[i];
            const param = parameters[i];
            const nextStoneState = this.board[pos + param];
            if (nextStoneState == EMPTY || nextStoneState == myColor) continue;
            box.push(pos + param);
            for (let j = 0; j < squareNum - 1; j++) {
		const targetPos = pos + param * 2 + param * j;
		const targetColor = this.board[targetPos];
		if (targetColor == EMPTY) {
		    break;
		}
		if (targetColor == myColor) {
                    results = results.concat(box);
                    break;
		} else {
                    box.push(targetPos);
		}
            }
	}
	return results;
    }
}
