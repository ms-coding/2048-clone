var tiles = [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
];

function getTile(x, y) {
    if(x < 0 || 3 < x)
        return null;
    if(y < 0 || 3 < y)
        return null;
    
    return tiles[y][x];
}

function setTile(x, y, value) {
    if(x < 0 || 3 < x)
        return null;
    if(y < 0 || 3 < y)
        return null;
    
    tiles[y][x] = value;
    printBoard();
}

function printBoard() {
    for (let x = 0; x <= 3; x++) {
        for (let y = 0; y <= 3; y++) {
            $('#x' + x + 'y' + y).html(getTile(x, y));
        }
    }
}

function randomTileValue() {
    return Math.random() < .9 ? 2 : 4;
}

function randomTile() {
    let freeTiles = [];
    for (let x = 0; x <= 3; x++) {
        for (let y = 0; y <= 3; y++) {
            if(getTile(x, y) === null)
                freeTiles.push({x: x, y: y});
        }
    }
    if(freeTiles.length === 0)
        return false;
    let tile = freeTiles[Math.floor(Math.random() * freeTiles.length)];
    setTile(tile.x, tile.y, randomTileValue());
    return true;
}

function horizontalShift(row) {
    
}

$(document).ready(function () {
    randomTile();
    randomTile();
});

$(document).keydown(function (e) { 
    if(e.which == 37) {
        // Move to left
        var newTiles = [];
        tiles.forEach(row => {
            newTiles.push(row.filter(e => e !== null).concat(row.filter(e => e === null)));
        });
        tiles = newTiles;
        randomTile();
        printBoard();
        console.log('Left');
    } else if(e.which == 38) {
        // Move to top
    } else if(e.which == 39) {
        // Move to right
        var newTiles = [];
        tiles.forEach(row => {
            newTiles.push(row.filter(e => e === null).concat(row.filter(e => e !== null)));
        });
        tiles = newTiles;
        if(!randomTile()) {
            window.alert('Game over!');
        }
        printBoard();
        console.log('Right');
    } else if(e.which == 40) {
        // Move to bottom
    }
});