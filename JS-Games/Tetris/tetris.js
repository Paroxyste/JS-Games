const cvs   = document.getElementById('tetris');
const ctx   = cvs.getContext('2d');
const score = document.getElementById('score');

// ---------------------------------------------------------------- Grid config

const COL = 10; // Columns
const ROW = 20; // Row
const SQS = 20; // Square sizes
const GDC = '#1C1C1A'; // Background grid color

// --------------------------------------------------------------- Tetro colors

const TETROCOLOR = [
    [I, '#66BAD2'],
    [J, '#FE8081'],
    [L, '#FD8816'],
    [O, '#FECC00'],
    [S, '#70C836'],
    [T, '#DD87CE'],
    [Z, '#AADF87']
];


// ----------------------------------------------------------------- drawSquare

function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQS, y * SQS, SQS, SQS);

    ctx.strokeStyle = '#1B1D1A';
    ctx.strokeRect(x * SQS, y * SQS, SQS, SQS);
}

// --------------------------------------------------------------- Create board

let board = [];

for(r = 0; r < ROW; r++) {
    board[r] = [];

    for(c = 0; c < COL; c++) {
        board[r][c] = GDC;
    }
}

// ------------------------------------------------------------------ drawBoard

function drawBoard() {
    for(r = 0; r < ROW; r++) {
        for(c = 0; c < COL; c++){
            drawSquare(c, r, board[r][c]);
        }
    }
}

drawBoard();

// ---------------------------------------------------------------- randomTetro

function randomTetro() {
    let rand = Math.floor(Math.random() * TETROCOLOR.length); // 0 -> 6 Tetrominos

    return new Piece(TETROCOLOR[rand][0], TETROCOLOR[rand][1]);
}

let randTetro = randomTetro();

// ----------------------------------------------------------------- tetrominos

function Piece(tetromino, color) {
    this.tetromino = tetromino;
    this.color     = color;

    this.tetrominoN  = 0; // Start from the 1st pattern
    this.activeTetro = this.tetromino[this.tetrominoN];

    // Tetrominos control
    this.x = 3;
    this.y = -2;
}

// ------------------------------------------------------------------ fill func

Piece.prototype.fill = function(color) {
    for (r = 0; r < this.activeTetro.length; r++) {
        for (c = 0; c < this.activeTetro.length; c++) {
            // Draw only occuped squares
            if (this.activeTetro[r][c]) {
                drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
}

// ------------------------------------------------------------ Draw tetrominos

Piece.prototype.draw = function() {
    this.fill(this.color);
}

// ---------------------------------------------------------- Undraw tetrominos

Piece.prototype.unDraw = function() {
    this.fill(GDC);
}

// ------------------------------------------------------------ Move tetrominos

// Down
Piece.prototype.moveDown = function() {
    if (!this.collision(0, 1, this.activeTetro)) {
        this.unDraw();
        this.y++;
        this.draw();
    } else {
        // Lock tetrominos and generate a new one
        this.lock();
        randTetro = randomTetro();
    }
}

// Right
Piece.prototype.moveRight = function() {
    if (!this.collision(1, 0, this.activeTetro)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// Left
Piece.prototype.moveLeft = function() {
    if (!this.collision(-1, 0, this.activeTetro)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// Rotate
Piece.prototype.rotate = function() {
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let kick = 0;

    if (this.collision(0, 0, nextPattern)) {
        if (this.x > COL / 2) {
            // Right wall
            kick = -1;
        } else {
            // Left wall
            kick = 1;
        }
    }

    if (!this.collision(kick, 0, nextPattern)) {
        this.unDraw();
        this.x += kick;

        // (0 + 1) % 4 = 1
        this.tetrominoN  = (this.tetrominoN + 1) % this.tetromino.length;
        this.activeTetro = this.tetromino[this.tetrominoN];

        this.draw();
    }
}

let newScore = 0;

// ------------------------------------------------------------ Lock tetrominos

Piece.prototype.lock = function() {
    for(r = 0; r < this.activeTetro.length; r++) {
        for(c = 0; c < this.activeTetro.length; c++) {
            // Skip GDC squares
            if (!this.activeTetro[r][c]) {
                continue;
            }

            // Lock on top = Game Over
            if (this.y + r < 0) {
                alert('GAME OVER');
                gameOver =  true;

                break;
            }

            // Lock tetrominos
            board[this.y + r][this.x + c] = this.color;
        }
    }

    // Remove full rows
    for(r = 0; r < ROW; r++) {
        let isRowFull = true;

        for(c = 0; c < COL; c++) {
            isRowFull = isRowFull && (board[r][c] != GDC);
        }

        if (isRowFull) {
            // If row is full, move down other rows
            for(y = r; y > 1; y--) {
                for(c = 0; c < COL; c++) {
                    board[y][c] = board[y - 1][c];
                }
            }

            // The top row board[0][..] has no row above it
            for(c = 0; c < COL; c++) {
                board[0][c] = GDC;
            }

            // Increment score
            newScore += 1;
        }
    }

    // Update board + score
    drawBoard();
    score.innerHTML = newScore;
}

// ------------------------------------------------------------------ Collision

Piece.prototype.collision = function(x, y, piece) {
    for(r = 0; r < piece.length; r++) {
        for(c = 0; c < piece.length; c++) {
            // If square is empty, skip it
            if (!piece[r][c]) {
                continue;
            }

            // Coordinates of the pieces after movment
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            if (newX < 0 || newX >= COL || newY >= ROW) {
                return true;
            }

            if (newY < 0) {
                continue;
            }

            // Check if there is a locked piece already in place
            if (board[newY][newX] != GDC) {
                return true;
            }
        }
    }

    return false;
}

// ---------------------------------------------------------------- Control key

document.addEventListener('keydown', CONTROL);

function CONTROL(event) {
    // Left
    if (event.keyCode == 37) {
        randTetro.moveLeft();
        dropStart = Date.now();
    } 
    // Up
    else if (event.keyCode == 38) {
        randTetro.rotate();
        dropStart = Date.now();
    }
    // Right
    else if (event.keyCode == 39) {
        randTetro.moveRight();
        dropStart = Date.now();
    }
    // Down
    else if (event.keyCode == 40) {
        randTetro.moveDown();
    }
}

// --------------------------------------------------------------- Control game

let dropStart = Date.now();
let gameOver  = false;
let speed     = 890; // 0.8s

function drop() {
    let now   = Date.now();
    let delta = now - dropStart;

    if (delta > speed) {
        randTetro.moveDown();
        dropStart = Date.now();
    }

    if (newScore == 48) {
        speed -90; // 0.8s
    } else if (newScore == 91) {
        speed -80; // 0.72s
    } else if (newScore == 129) {
        speed -90; // 0.63s
    } else if (newScore == 162) {
        speed -80; // 0.55s
    } else if (newScore == 190) {
        speed -80; // 0.47s
    } else if (newScore == 213) {
        speed -90; // 0.38s
    } else if (newScore == 231) {
        speed -80; // 0.30s
    } else if (newScore == 244) {
        speed -80; // 0.22s
    } else if (newScore == 252) {
        speed -90; // 0.13s
    } else if (newScore == 258) {
        speed -30; // 0.10s
    } else if (newScore == 263) {
        speed -20; // 0.08s
    } else if (newScore == 267) {
        speed -10; // 0.07s
    } else if (newScore == 270) {
        speed -20; // 0.05s
    } else if (newScore == 272) {
        speed -20; // 0.03s
    } else if (newScore == 273) {
        speed -10; // 0.02s
    }

    if (!gameOver) {
        requestAnimationFrame(drop);
    }
}

drop();