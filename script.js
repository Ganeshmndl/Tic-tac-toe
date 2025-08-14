let player1Name = "Player 1",
  player2Name = "Player 2";
let player1Symbol = "X",
  player2Symbol = "O";
let firstPlayerTurn = true;
let moveCount = 0;
let cells = [];
let score1 = 0,
  score2 = 0;
let roundsPlayed = 0;

let aiEnabled = false;
let aiDifficulty = "normal";

// Show AI Difficulty Modal or disable AI
document.getElementById("aiBtn").onclick = () => {
  if (!aiEnabled) {
    document.getElementById("aiModalOverlay").style.display = "flex";
  } else {
    aiEnabled = false;
    document.getElementById("aiBtn").textContent = "Enable AI";
    document.getElementById("name2").textContent = player2Name || "Player 2";
    showNameModal(true);
  }
};

// Start Game vs AI with chosen difficulty
document.getElementById("aiStartBtn").onclick = () => {
  aiDifficulty = document.querySelector(
    'input[name="aiDifficulty"]:checked'
  ).value;
  aiEnabled = true;
  document.getElementById("aiModalOverlay").style.display = "none";
  document.getElementById("aiBtn").textContent = "Disable AI";
  document.getElementById("name2").textContent = "Computer";

  const vsGraphicOverlay = document.getElementById("vsGraphicOverlay");
  const vsPlayerName = document.getElementById("vsPlayerName");

  let savedName1 =
    document.getElementById("player1Input").value.trim() || "Player 1";
  vsPlayerName.textContent = savedName1;

  // Show the Player vs Computer graphic overlay
  vsGraphicOverlay.style.display = "flex";
  document.getElementById("nameModalOverlay").style.display = "none";

  // After 2 seconds, hide graphic and start the game
  setTimeout(() => {
    vsGraphicOverlay.style.display = "none";
    player1Name = savedName1;
    player2Name = "Computer";
    document.getElementById("name1").textContent = player1Name;
    document.getElementById("name2").textContent = player2Name;
    resetGame();
    updateScores();
    updateRoundsPlayed();
  }, 2000);
};

// Show/Hide Name Modal
function showNameModal(clearInputs = true) {
  if (clearInputs) {
    document.getElementById("player1Input").value = "";
    document.getElementById("player2Input").value = "";
  }
  document.getElementById("nameModalOverlay").style.display = "flex";
  document.getElementById("player1Input").focus();
}
function hideNameModal() {
  document.getElementById("nameModalOverlay").style.display = "none";
}
function submitNames() {
  player1Name =
    document.getElementById("player1Input").value.trim() || "Player 1";
  player2Name = aiEnabled
    ? "Computer"
    : document.getElementById("player2Input").value.trim() || "Player 2";
  document.getElementById("name1").textContent = player1Name;
  document.getElementById("name2").textContent = player2Name;
  hideNameModal();
  resetGame();
  updateScores();
  updateRoundsPlayed();
}

// Winner Modal
function showWinnerModal(message) {
  document.getElementById("winnerMessage").textContent = message;
  document.getElementById("winnerModalOverlay").style.display = "flex";
}
function hideWinnerModal() {
  document.getElementById("winnerModalOverlay").style.display = "none";
  resetGame();
}

// Buttons
document.getElementById("nameConfirmBtn").onclick = submitNames;
document.getElementById("winnerOkBtn").onclick = hideWinnerModal;
document.getElementById("restartBtn").onclick = () => {
  score1 = 0;
  score2 = 0;
  roundsPlayed = 0;
  updateScores();
  updateRoundsPlayed();
  showNameModal(true);
};
document.getElementById("newGameBtn").onclick = resetGame;

// Score and round logic
function updateScores() {
  document.querySelector("#score1 .score").textContent = score1;
  document.querySelector("#score2 .score").textContent = score2;
}
function updateRoundsPlayed() {
  document.getElementById("roundCount").textContent = roundsPlayed;
}
function createBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  cells = [];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("button");
    cell.classList.add("cell");
    cell.onclick = () => handleMove(i);
    cells.push(cell);
    board.appendChild(cell);
  }
}
function handleMove(index) {
  if (cells[index].textContent === "" && !checkGameOver()) {
    if (aiEnabled && !firstPlayerTurn) return; // Only human on their turn
    cells[index].textContent = firstPlayerTurn ? player1Symbol : player2Symbol;
    moveCount++;
    firstPlayerTurn = !firstPlayerTurn;
    if (aiEnabled && !firstPlayerTurn && !checkGameOver()) {
      setTimeout(() => aiMove(aiDifficulty), 400);
    }
    checkGameOver();
  }
}

// --- AI Implementation ---
function aiMove(level) {
  let moveIndex;
  let emptyCells = cells
    .map((c, i) => (c.textContent === "" ? i : null))
    .filter((i) => i !== null);

  if (level === "normal") {
    // Win if possible, else random
    moveIndex =
      getWinningMove(player2Symbol) ??
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
  } else if (level === "medium") {
    // Win if possible, else block, else random
    moveIndex =
      getWinningMove(player2Symbol) ??
      getWinningMove(player1Symbol) ??
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
  } else if (level === "hard") {
    moveIndex = getBestMove();
  }

  if (moveIndex != null && cells[moveIndex].textContent === "") {
    cells[moveIndex].textContent = player2Symbol;
    moveCount++;
    firstPlayerTurn = !firstPlayerTurn;
    checkGameOver();
  }
}

// Helper: find an immediate winning move for given symbol
function getWinningMove(symbol) {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let line of wins) {
    let [a, b, c] = line;
    let values = [
      cells[a].textContent,
      cells[b].textContent,
      cells[c].textContent,
    ];
    if (
      values.filter((v) => v === symbol).length === 2 &&
      values.includes("")
    ) {
      return line[values.indexOf("")];
    }
  }
  return null;
}

// Hard AI - unbeatable minimax
function getBestMove() {
  let board = cells.map((c) => c.textContent);
  function minimax(board, isAiTurn) {
    let win = checkWinner(board);
    if (win === player2Symbol) return { score: 1 };
    if (win === player1Symbol) return { score: -1 };
    if (!board.includes("")) return { score: 0 };
    let moves = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = isAiTurn ? player2Symbol : player1Symbol;
        let result = minimax(board, !isAiTurn);
        moves.push({ index: i, score: result.score });
        board[i] = "";
      }
    }
    if (isAiTurn) {
      let max = Math.max(...moves.map((m) => m.score));
      return moves.find((m) => m.score === max);
    } else {
      let min = Math.min(...moves.map((m) => m.score));
      return moves.find((m) => m.score === min);
    }
  }
  return minimax(board, true).index;
}
function checkWinner(boardArr) {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let [a, b, c] of wins) {
    if (
      boardArr[a] &&
      boardArr[a] === boardArr[b] &&
      boardArr[a] === boardArr[c]
    )
      return boardArr[a];
  }
  return null;
}

function checkGameOver() {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let [a, b, c] of wins) {
    if (
      cells[a].textContent &&
      cells[a].textContent === cells[b].textContent &&
      cells[a].textContent === cells[c].textContent
    ) {
      [cells[a], cells[b], cells[c]].forEach((cell) =>
        cell.classList.add("highlight")
      );
      let winner =
        cells[a].textContent === player1Symbol ? player1Name : player2Name;
      let message = `${winner} won the game!`;
      if (winner === player1Name) score1++;
      else score2++;
      updateScores();
      roundsPlayed++;
      updateRoundsPlayed();
      setTimeout(() => showWinnerModal(message), 300);
      return true;
    }
  }
  if (moveCount === 9) {
    roundsPlayed++;
    updateRoundsPlayed();
    setTimeout(() => showWinnerModal("It's a Draw!"), 300);
    return true;
  }
  return false;
}
function resetGame() {
  cells.forEach((c) => {
    c.textContent = "";
    c.classList.remove("highlight");
  });
  firstPlayerTurn = true;
  moveCount = 0;
}

// Init
createBoard();
showNameModal(true);
