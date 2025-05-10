const board = document.getElementById('board');
const restartBtn = document.getElementById('restart-btn');
const captureSound = document.getElementById('capture-sound');
let selectedPiece = null;
let selectedCell = null;
let currentTurn = 'black';

function createBoard() {
  board.innerHTML = '';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      const isDark = (row + col) % 2 !== 0;
      cell.classList.add(isDark ? 'dark' : 'light');
      cell.dataset.row = row;
      cell.dataset.col = col;

      if (isDark && row < 3) {
        const piece = createPiece('red');
        cell.appendChild(piece);
      } else if (isDark && row > 4) {
        const piece = createPiece('black');
        cell.appendChild(piece);
      }

      cell.addEventListener('click', onCellClick);
      board.appendChild(cell);
    }
  }
  updateTurnDisplay();
}

function createPiece(color) {
  const piece = document.createElement('div');
  piece.classList.add('piece', color);
  return piece;
}

function onCellClick(e) {
  const cell = e.currentTarget;
  const piece = cell.querySelector('.piece');

  if (piece && piece.classList.contains(currentTurn)) {
    selectedPiece = piece;
    selectedCell = cell;
    clearHighlights();
    cell.classList.add('selected');
  } else if (selectedPiece) {
    const fromRow = parseInt(selectedCell.dataset.row);
    const fromCol = parseInt(selectedCell.dataset.col);
    const toRow = parseInt(cell.dataset.row);
    const toCol = parseInt(cell.dataset.col);
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;

    const isRed = selectedPiece.classList.contains('red');
    const isBlack = selectedPiece.classList.contains('black');
    const isKing = selectedPiece.classList.contains('king');
    const isForward = isRed ? rowDiff > 0 : rowDiff < 0;
    const isDiagonal = Math.abs(rowDiff) === Math.abs(colDiff);

    if (!cell.querySelector('.piece')) {
      if (isDiagonal && Math.abs(rowDiff) === 1 && (isKing || isForward)) {
        movePiece(cell);
        switchTurn();
      } else if (isDiagonal && Math.abs(rowDiff) === 2) {
        const jumpedRow = fromRow + rowDiff / 2;
        const jumpedCol = fromCol + colDiff / 2;
        const jumpedCell = document.querySelector(
          `.cell[data-row='${jumpedRow}'][data-col='${jumpedCol}']`
        );
        const jumpedPiece = jumpedCell?.querySelector('.piece');

        if (jumpedPiece && jumpedPiece.classList.contains(oppositeColor(currentTurn))) {
          jumpedPiece.remove();
          captureSound.play();
          movePiece(cell);
          if (canCaptureAgain(cell, selectedPiece)) {
            selectedCell = cell;
            cell.classList.add('selected');
          } else {
            selectedPiece = null;
            selectedCell = null;
            switchTurn();
          }
        }
      }
    }
  }
}

function movePiece(toCell) {
  toCell.appendChild(selectedPiece);
  const toRow = parseInt(toCell.dataset.row);
  if (selectedPiece.classList.contains('red') && toRow === 7) {
    selectedPiece.classList.add('king');
    selectedPiece.innerHTML = '👑';
  } else if (selectedPiece.classList.contains('black') && toRow === 0) {
    selectedPiece.classList.add('king');
    selectedPiece.innerHTML = '👑';
  }
  clearHighlights();
}

function canCaptureAgain(cell, piece) {
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  const isRed = piece.classList.contains('red');
  const isBlack = piece.classList.contains('black');
  const isKing = piece.classList.contains('king');
  const directions = isKing
    ? [[-2, -2], [-2, 2], [2, -2], [2, 2]]
    : isRed ? [[2, -2], [2, 2]] : [[-2, -2], [-2, 2]];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    const midRow = row + dr / 2;
    const midCol = col + dc / 2;

    const destCell = document.querySelector(`.cell[data-row='${newRow}'][data-col='${newCol}']`);
    const midCell = document.querySelector(`.cell[data-row='${midRow}'][data-col='${midCol}']`);

    if (
      destCell &&
      !destCell.querySelector('.piece') &&
      midCell &&
      midCell.querySelector('.piece') &&
      midCell.querySelector('.piece').classList.contains(oppositeColor(currentTurn))
    ) {
      return true;
    }
  }
  return false;
}

function switchTurn() {
  currentTurn = currentTurn === 'black' ? 'red' : 'black';
  updateTurnDisplay();
  checkForWin();
}

function checkForWin() {
  const redPieces = document.querySelectorAll('.piece.red');
  const blackPieces = document.querySelectorAll('.piece.black');
  if (redPieces.length === 0) {
    alert('⚫ Սևերը հաղթեցին!');
    restartGame();
  } else if (blackPieces.length === 0) {
    alert('🔴 Կարմիրները հաղթեցին!');
    restartGame();
  }
}

function oppositeColor(color) {
  return color === 'black' ? 'red' : 'black';
}

function clearHighlights() {
  document.querySelectorAll('.cell').forEach(cell =>
    cell.classList.remove('selected')
  );
}

function updateTurnDisplay() {
  const display = document.getElementById('turn-display');
  display.textContent = `Հերթը՝ ${currentTurn === 'black' ? '⚫ Սև' : '🔴 Կարմիր'}`;
}

function restartGame() {
  selectedPiece = null;
  selectedCell = null;
  currentTurn = 'black';
  createBoard();
}

restartBtn.addEventListener('click', restartGame);
createBoard();
