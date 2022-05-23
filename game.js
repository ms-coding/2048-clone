const BOARD_SIZE = 4;

class Board {
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
                res.push(new Cell(e, x, y));
            }
        }
        return res;
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
    }
}

class Cell {
    #tile;
    #mergeTile

    constructor(cellElement, x, y) {
        this.cellElement = cellElement;
        this.x = x;
        this.y = y;
        this.tile = null;
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
        this.#mergeTile.x = this.y;
    }

    canAccept(tile) {
        return (this.tile === null || (this.mergeTile === null && this.tile.value === tile.value));
    }
}

class Tile {
    #tileElement
    #x
    #y
    #value

    constructor(board, value = Math.random() > .9 ? 4 : 2) {
        this.#tileElement = $('<div class="tile"></div>');
        board.board.append(this.#tileElement);
        this.value = value;
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
        this.#tileElement.html(val);
        let power = Math.log2(val);
        let bgLightness = 100 - power * 9;
        this.#tileElement.css('--bg-lightness', `${bgLightness}%`);
        this.#tileElement.css('--text-lightness', `${bgLightness <= 50 ? 90 : 10}%`);
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

function handleInput(e) {
    switch (e.key) {
        case 'ArrowUp':
            moveUp();
            break;
    
        case 'ArrowDown':
            moveDown();
            break;

        case 'ArrowLeft':
            moveLeft();
            break;

        case 'ArrowRight':
            moveRight();
            break;

        default:
            setupInput();
            return;
    }

    setupInput();
}

function moveUp() {
    return slideTiles(b.cellsByColumn);
}

function moveDown() {
    return slideTiles(b.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeft() {
    return slideTiles(b.cellsByRow);
}

function moveRight() {
    return slideTiles(b.cellsByRow.map(row => [...row].reverse()))
}

function slideTiles(cells) {
    cells.forEach(group => {
        for (let i = 1; i < group.length; i++) {
            const cell = group[i];
            if (cell.tile === null) continue;
            let lastValidCell = null;
            for (let j = i - 1; j >= 0; j--) {
                const moveToCell = group[j];
                if (!moveToCell.canAccept(cell.tile)) break;
                lastValidCell = moveToCell;
            }
            if (lastValidCell !== null) {
                if (lastValidCell.tile !== null) {
                    lastValidCell.mergeTile = cell.tile;
                } else {
                    lastValidCell.tile = cell.tile;
                }
                cell.tile = null;
            }
        }
    });
}