const BOARD_SIZE = 4;

class Board {
    #score = 0;
    #moves = 0;
    #maxValue = 0;

    constructor(boardElement) {
        this.board = boardElement;
        this.board.css('--board-size', BOARD_SIZE);
        this.cells = this.createCells();
    }

    createCells() {
        let res = [];
        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                let e = $('<div class="cell"></div>')
                this.board.append(e);
                res.push(new Cell(this, e, x, y));
            }
        }
        return res;
    }

    get score() {
        return this.#score;
    }

    set score(val) {
        this.#score = val;
        $('#score').html(this.#score);
    }

    addMove() {
        this.#moves += 1;
        $('#moves').html(this.#moves);
    }

    addToScore(val) {
        this.#score += val;
        $('#score').html(this.#score);
    }

    set maxValue(val) {
        if (this.#maxValue < val) {
            this.#maxValue = val;
            $('#max-tile') = val;
        }
    }

    get cellsByColumn() {
        return this.cells.reduce((cellBoard, cell) => {
            cellBoard[cell.x] = cellBoard[cell.x] || [];
            cellBoard[cell.x][cell.y] = cell;
            return cellBoard;
        }, []);
    }

    get cellsByRow() {
        return this.cells.reduce((cellBoard, cell) => {
            cellBoard[cell.y] = cellBoard[cell.y] || [];
            cellBoard[cell.y][cell.x] = cell;
            return cellBoard;
        }, []);
    }

    emptyCells() {
        return this.cells.filter(cell => cell.tile === null);
    }

    randomEmptyCell() {
        let empties = this.emptyCells()
        let randomIdx = Math.floor(Math.random() * empties.length);
        empties[randomIdx].tile = new Tile(this);
        return empties[randomIdx].tile;
    }
}

class Cell {
    #tile;
    #mergeTile;
    #board;

    constructor(board, cellElement, x, y) {
        this.#board = board;
        this.cellElement = cellElement;
        this.x = x;
        this.y = y;
        this.#tile = null;
        this.#mergeTile = null;

    }

    get tile() {
        return this.#tile;
    }

    set tile(value) {
        this.#tile = value;
        if (value === null) return;
        this.#tile.x = this.x;
        this.#tile.y = this.y;
    }

    get mergeTile() {
        return this.#mergeTile;
    }

    set mergeTile(val) {
        this.#mergeTile = val;
        if (val === null) return;
        this.#mergeTile.x = this.x;
        this.#mergeTile.y = this.y;
    }

    canAccept(tile) {
        return (this.tile === null || (this.mergeTile === null && this.tile.value === tile.value));
    }

    mergeTiles() {
        if (this.tile === null || this.mergeTile === null) return;
        this.tile.value = this.tile.value * 2;
        this.#board.addToScore(this.tile.value);
        this.mergeTile.remove();
        this.mergeTile = null;
    }
}

class Tile {
    #tileElement
    #x
    #y
    #value
    #board;

    constructor(board, value = Math.random() > .9 ? 4 : 2) {
        this.#tileElement = $('<div class="tile"></div>');
        this.#board = board;
        board.board.append(this.#tileElement);
        this.value = value;
        //board.maxValue(value);
    }

    set x(val) {
        this.#x = val;
        this.#tileElement.css('--x', val);
    }

    set y(val) {
        this.#y = val;
        this.#tileElement.css('--y', val);
    }

    get value() {
        return this.#value;
    }

    set value(val) {
        this.#value = val;
        //this.#board.maxValue(val);
        this.#tileElement.html(val);
        let power = Math.log2(val);
        let bgLightness = 100 - power * 9;
        this.#tileElement.css('--bg-lightness', `${bgLightness}%`);
        this.#tileElement.css('--text-lightness', `${bgLightness <= 50 ? 90 : 10}%`);
    }

    remove() {
        this.#tileElement.remove();
    }

    waitForTransition(animation = false) {
        return new Promise(resolve => {
            this.#tileElement.one(animation ? 'animationend' : 'transitionend', resolve);
        })
    }
}


$(document).ready(function () {
    b = new Board($('#board'));
    b.randomEmptyCell();
    b.randomEmptyCell();
    setupInput();
});

function setupInput() {
    $(document).one('keydown', handleInput);
}

async function handleInput(e) {
    let cells = null;
    switch (e.key) {
        case 'ArrowUp':
            cells = b.cellsByColumn;
            break;
    
        case 'ArrowDown':
            cells = b.cellsByColumn.map(column => [...column].reverse());
            break;

        case 'ArrowLeft':
            cells = b.cellsByRow;
            break;

        case 'ArrowRight':
            cells = b.cellsByRow.map(row => [...row].reverse());
            break;

        default:
            setupInput();
            return;
    }

    if (!canMove(cells)) {
        setupInput();
        return;
    }
    b.addMove();
    await slideTiles(cells);

    b.cells.forEach(cell => cell.mergeTiles());

    newTile = b.randomEmptyCell();

    if (!canMove(b.cellsByColumn) &&
        !canMove(b.cellsByColumn.map(column => [...column].reverse())) && 
        !canMove(b.cellsByRow) &&
        !canMove(b.cellsByRow.map(row => [...row].reverse()))
        ) {
        newTile.waitForTransition(true).then(() => {
            alert('Game Over!');
        });
        return;
    }

    setupInput();
}

function canMove(cells) {
    return cells.some(group => {
        return group.some((cell, index) => {
            if (index === 0) return false;
            if (cell.tile === null) return false;
            const moveToCell = group[index - 1];
            return moveToCell.canAccept(cell.tile);
        });
    });
}

function slideTiles(cells) {
    return Promise.all(
        cells.flatMap(group => {
            const promises = [];
            for (let i = 1; i < group.length; i++) {
                const cell = group[i];
                if (cell.tile === null) continue;
                let lastValidCell = null;
                for (let j = i - 1; j >= 0; j--) {
                    const moveToCell = group[j];
                    if (!moveToCell.canAccept(cell.tile)) break;
                    lastValidCell = moveToCell;
                }
                if (lastValidCell === null) continue;
                promises.push(cell.tile.waitForTransition());
                if (lastValidCell.tile !== null) {
                    lastValidCell.mergeTile = cell.tile;
                } else {
                    lastValidCell.tile = cell.tile;
                }
                cell.tile = null;
            }
            return promises;
        })
    );
}