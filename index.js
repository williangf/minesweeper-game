const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Constants to define the size of the game board
const ROWS = 8;
const COLS = 8;
const MINES = 10;
const MINE_SYMBOL = '*';
const FOG_SYMBOL = '#';

// A 2D array to represent the game board
let board = [];

// An array to keep track of the positions of mines on the board
let mines = [];

// An 2D array to represent the fog
let fog = [];

// Turn counter
let turnCounter = 1;

// Initialize the board/fog, state, and place mines randomly
for (let row = 0; row < ROWS; row++) {
  board[row] = [];
  fog[row] = [];
  for (let col = 0; col < COLS; col++) {
    board[row][col] = 0;
    fog[row][col] = FOG_SYMBOL;
  }
}

for (let i = 0; i < MINES; i++) {
  let row = Math.floor(Math.random() * ROWS);
  let col = Math.floor(Math.random() * COLS);
  if (board[row][col] !== MINE_SYMBOL) {
    board[row][col] = MINE_SYMBOL;
    mines.push([row, col]);
  } else {
    i--;
  }
}

// Populate the board with the number of mines around each cell
for (let i = 0; i < mines.length; i++) {
  let row = mines[i][0];
  let col = mines[i][1];
  for (let r = Math.max(0, row - 1); r <= Math.min(row + 1, ROWS - 1); r++) {
    for (let c = Math.max(0, col - 1); c <= Math.min(col + 1, COLS - 1); c++) {
      if (board[r][c] !== MINE_SYMBOL) {
        board[r][c]++;
      }
    }
  }
}

// Function to display the game board in the console
function displayBoard() {
  console.log('= = = = = = = = =');
  console.log('Turn: ' + turnCounter);
  console.log('= = = = = = = = =');
  console.log('  ' + [...Array(COLS).keys()].join(' '));
  for (let row = 0; row < ROWS; row++) {
    console.log(row + ' ' + fog[row].join(' '));
  }
}

function checkValidInput(row, col) {
  if (
    row > ROWS - 1 ||
    row < 0 ||
    col > COLS ||
    col < 0 ||
    !Number.isInteger(row) ||
    !Number.isInteger(col)
  ) {
    return (
      'Invalid input, please provide the row between 0-' +
      (ROWS - 1) +
      ' and the col between 0-' +
      (COLS - 1)
    );
  }

  if (fog[row][col] !== FOG_SYMBOL) {
    return 'This cell has already been selected';
  }

  return false;
}

function checkIfWon() {
  const fogsRemaining = fog.reduce((total, value) => {
    return (total += value.filter((v) => v === '#').length);
  }, 0);

  return fogsRemaining === MINES;
}

function revealCell(row, col) {
  const hasError = checkValidInput(row, col);

  if (!hasError) {
    let revealedCell = board[row][col];
    fog[row][col] = revealedCell;

    if (revealedCell === 0) {
      revealAllNearbyCells(row, col);
    }

    if (revealedCell === MINE_SYMBOL) {
      displayBoard();
      console.log('= = = = = = = = =');
      console.log('You lost...');
      return rl.close();
    }

    if (checkIfWon()) {
      displayBoard();
      console.log('= = = = = = = = =');
      console.log('You win!');
      return rl.close();
    }

    turnCounter++;
  }

  displayBoard();

  if (hasError) {
    console.log('= = = = = = = = =');
    console.log('(!) ' + hasError);
  }

  askPlayerNextMove();
}

function askPlayerNextMove() {
  console.log('= = = = = = = = =');
  rl.question('Please, type the row to reveal the next cell:\n', (row) => {
    rl.question('Please, type the col to reveal the next cell:\n', (col) => {
      revealCell(+row, +col);
    });
  });
}

// Reveal all squares recursively until it reaches a number
function revealAllNearbyCells(row, col) {
  let initialRow = row - 1 < 0 ? 0 : row - 1;
  let initialCol = col - 1 < 0 ? 0 : col - 1;
  let finalRow = row + 1 > ROWS - 1 ? ROWS - 1 : row + 1;
  let finalCol = col + 1 > COLS - 1 ? COLS - 1 : col + 1;

  for (let currentRow = initialRow; currentRow <= finalRow; currentRow++) {
    for (let currentCol = initialCol; currentCol <= finalCol; currentCol++) {
      if (fog[currentRow][currentCol] !== FOG_SYMBOL) {
        continue;
      }

      let revealedCell = board[currentRow][currentCol];
      fog[currentRow][currentCol] = revealedCell;

      if (revealedCell === 0) {
        revealAllNearbyCells(currentRow, currentCol);
      }
    }
  }
}

// Call the displayBoard function to display the initial state of the board
displayBoard();

// Init the first turn
askPlayerNextMove();
