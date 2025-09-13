/**
 * Tic-Tac-Toe Game Logic
 * Encapsulated to prevent global scope pollution.
 */
const TicTacToe = {
  // --- STATE ---
  state: {
    player1Name: "Player 1",
    player2Name: "Player 2",
    player1Symbol: "X",
    player2Symbol: "O",
    firstPlayerTurn: true,
    moveCount: 0,
    cells: [],
    score1: 0,
    score2: 0,
    roundsPlayed: 0,
    aiEnabled: false,
    aiDifficulty: "normal",
    gameOver: false,
    themes: {
      default: "Default",
      light: "Light Mode",
      dark: "Dark Mode",
      neon: "Neon Glow",
      retro: "Retro Arcade",
      space: "Space",
      candy: "Candy",
    },
  },

  // --- DOM ELEMENTS ---
  nodes: {},

  /**
   * Caches all necessary DOM elements for the game.
   */
  cacheDOM() {
    this.nodes.mainMenuOverlay = document.getElementById("mainMenuOverlay");
    this.nodes.mainUI = document.getElementById("mainUI");
    this.nodes.nameModalOverlay = document.getElementById("nameModalOverlay");
    this.nodes.aiModalOverlay = document.getElementById("aiModalOverlay");
    this.nodes.winnerModalOverlay =
      document.getElementById("winnerModalOverlay");
    this.nodes.vsGraphicOverlay = document.getElementById("vsGraphicOverlay");
    this.nodes.settingsModalOverlay = document.getElementById(
      "settingsModalOverlay"
    );
    this.nodes.profileModalOverlay = document.getElementById(
      "profileModalOverlay"
    );
    this.nodes.board = document.getElementById("board");
    this.nodes.score1 = document.querySelector("#score1 .score");
    this.nodes.score2 = document.querySelector("#score2 .score");
    this.nodes.name1 = document.getElementById("name1");
    this.nodes.name2 = document.getElementById("name2");
    this.nodes.symbol1 = document.getElementById("symbol1");
    this.nodes.symbol2 = document.getElementById("symbol2");
    this.nodes.roundCount = document.getElementById("roundCount");
    this.nodes.winnerMessage = document.getElementById("winnerMessage");
    this.nodes.player1Input = document.getElementById("player1Input");
    this.nodes.player2Input = document.getElementById("player2Input");
    this.nodes.vsPlayerName = document.getElementById("vsPlayerName");
    this.nodes.aiBtn = document.getElementById("aiBtn");
  },

  /**
   * Binds all event listeners for the game.
   */
  bindEvents() {
    document.getElementById("menuComputerBtn").onclick = () =>
      this.showModal(this.nodes.aiModalOverlay);
    document.getElementById("menuMultiplayerBtn").onclick = () => {
      this.state.aiEnabled = false;
      this.nodes.aiBtn.textContent = "Enable AI";
      this.showNameModal(true);
    };
    document.getElementById("menuSettingsBtn").onclick = () =>
      this.showModal(this.nodes.settingsModalOverlay);
    document.getElementById("menuProfileBtn").onclick = () =>
      this.showModal(this.nodes.profileModalOverlay);

    this.nodes.aiBtn.onclick = () => this.toggleAIMode();
    document.getElementById("aiStartBtn").onclick = () => this.startGameVsAI();
    document.getElementById("nameConfirmBtn").onclick = () =>
      this.submitNames();
    document.getElementById("winnerOkBtn").onclick = () =>
      this.hideModal(this.nodes.winnerModalOverlay, true);
    document.getElementById("restartBtn").onclick = () => this.exitToMenu();
    document.getElementById("newGameBtn").onclick = () =>
      alert("This will be for custom game modes in the future!");

    document.getElementById("aiBackBtn").onclick = () =>
      this.goBackToMenu(this.nodes.aiModalOverlay);
    document.getElementById("nameBackBtn").onclick = () =>
      this.goBackToMenu(this.nodes.nameModalOverlay);
    document.getElementById("settingsExitBtn").onclick = () =>
      this.goBackToMenu(this.nodes.settingsModalOverlay);
    document.getElementById("profileBackBtn").onclick = () =>
      this.goBackToMenu(this.nodes.profileModalOverlay);
  },

  // --- MODAL & UI MANAGEMENT ---
  showModal(modal) {
    this.nodes.mainMenuOverlay.style.display = "none";
    modal.style.display = "flex";
  },
  hideModal(modal, shouldResetGame = false) {
    modal.style.display = "none";
    if (shouldResetGame) this.resetGame();
  },
  goBackToMenu(currentModal) {
    this.hideModal(currentModal);
    this.nodes.mainMenuOverlay.style.display = "flex";
  },
  exitToMenu() {
    this.state.score1 = 0;
    this.state.score2 = 0;
    this.state.roundsPlayed = 0;
    this.updateScores();
    this.updateRoundsPlayed();
    this.nodes.mainUI.style.display = "none";
    this.nodes.mainMenuOverlay.style.display = "flex";
  },
  showNameModal(clearInputs = true) {
    if (clearInputs) {
      this.nodes.player1Input.value = "";
      this.nodes.player2Input.value = "";
    }
    this.showModal(this.nodes.nameModalOverlay);
    if (this.nodes.player1Input.value) {
      this.nodes.player2Input.focus();
    } else {
      this.nodes.player1Input.focus();
    }
  },

  // --- THEME ENGINE ---
  setTheme(themeName) {
    document.body.className = `theme-${themeName}`;
    localStorage.setItem("ticTacToeTheme", themeName);

    const getVar = (varName) =>
      getComputedStyle(document.body).getPropertyValue(varName).trim();
    this.state.player1Symbol = getVar("--x-symbol").replace(/"/g, "");
    this.state.player2Symbol = getVar("--o-symbol").replace(/"/g, "");

    this.nodes.symbol1.textContent = this.state.player1Symbol;
    this.nodes.symbol2.textContent = this.state.player2Symbol;

    this.state.cells.forEach((cell) => {
      const symbol = cell.getAttribute("data-symbol");
      if (
        document.body.classList.contains("theme-space") ||
        document.body.classList.contains("theme-candy")
      ) {
        cell.textContent = "";
      } else if (symbol === "X") {
        cell.textContent = this.state.player1Symbol;
      } else if (symbol === "O") {
        cell.textContent = this.state.player2Symbol;
      }
    });
  },

  initTheme() {
    const savedTheme = localStorage.getItem("ticTacToeTheme") || "default";
    const container = document.getElementById("theme-buttons-container");
    container.innerHTML = ""; // Clear existing buttons

    for (const [key, value] of Object.entries(this.state.themes)) {
      // Create the main container for the swatch
      const swatch = document.createElement("div");
      swatch.className = "theme-swatch";
      swatch.dataset.theme = key; // e.g., 'data-theme="dark"'
      swatch.onclick = () => this.setTheme(key);

      // Create the colored circle preview
      const preview = document.createElement("div");
      preview.className = "swatch-preview";
      // Add a mini "X O" to the preview
      preview.innerHTML = `<span>X</span><span>O</span>`;

      // Create the text label
      const label = document.createElement("span");
      label.className = "swatch-label";
      label.textContent = value;

      // Put it all together
      swatch.appendChild(preview);
      swatch.appendChild(label);
      container.appendChild(swatch);
    }

    this.setTheme(savedTheme); // Apply the saved or default theme on load
  },

  // --- GAMEPLAY LOGIC ---
  createBoard() {
    this.nodes.board.innerHTML = "";
    this.state.cells = [];
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("button");
      cell.classList.add("cell");
      cell.onclick = () => this.handleMove(i);
      this.state.cells.push(cell);
      this.nodes.board.appendChild(cell);
    }
  },

  handleMove(index) {
    if (
      this.state.cells[index].getAttribute("data-symbol") === null &&
      !this.state.gameOver
    ) {
      const isPlayerMove = this.state.firstPlayerTurn;
      if (this.state.aiEnabled && !isPlayerMove) {
        // AI's turn, called from aiMove
      } else if (this.state.aiEnabled && isPlayerMove) {
        // Player's turn vs AI
      } else {
        // Player vs Player turn
      }

      const currentSymbol = isPlayerMove
        ? this.state.player1Symbol
        : this.state.player2Symbol;
      const symbolKey = isPlayerMove ? "X" : "O";

      if (
        document.body.classList.contains("theme-space") ||
        document.body.classList.contains("theme-candy")
      ) {
        this.state.cells[index].textContent = "";
      } else {
        this.state.cells[index].textContent = currentSymbol;
      }
      this.state.cells[index].setAttribute("data-symbol", symbolKey);

      this.state.moveCount++;
      this.state.firstPlayerTurn = !this.state.firstPlayerTurn;

      if (
        this.state.aiEnabled &&
        !this.state.firstPlayerTurn &&
        !this.checkGameOver()
      ) {
        setTimeout(() => this.aiMove(), 400);
      } else {
        this.checkGameOver();
      }
    }
  },

  resetGame() {
    this.state.gameOver = false;
    this.state.cells.forEach((c) => {
      c.textContent = "";
      c.removeAttribute("data-symbol");
      c.classList.remove("highlight");
    });
    this.state.firstPlayerTurn = true;
    this.state.moveCount = 0;
  },

  updateScores() {
    this.nodes.score1.textContent = this.state.score1;
    this.nodes.score2.textContent = this.state.score2;
  },

  updateRoundsPlayed() {
    this.nodes.roundCount.textContent = this.state.roundsPlayed;
  },

  submitNames() {
    this.state.player1Name = this.nodes.player1Input.value.trim() || "Player 1";
    this.state.player2Name = this.state.aiEnabled
      ? "Computer"
      : this.nodes.player2Input.value.trim() || "Player 2";
    this.nodes.name1.textContent = this.state.player1Name;
    this.nodes.name2.textContent = this.state.player2Name;
    this.hideModal(this.nodes.nameModalOverlay);
    this.nodes.mainUI.style.display = "flex";
    this.resetGame();
    this.updateScores();
    this.updateRoundsPlayed();
  },

  toggleAIMode() {
    this.state.score1 = 0;
    this.state.score2 = 0;
    this.state.roundsPlayed = 0;
    this.updateScores();
    this.updateRoundsPlayed();

    if (!this.state.aiEnabled) {
      this.showModal(this.nodes.aiModalOverlay);
    } else {
      this.state.aiEnabled = false;
      this.nodes.aiBtn.textContent = "Enable AI";
      this.nodes.name2.textContent = this.state.player2Name || "Player 2";
      this.nodes.player1Input.value = this.state.player1Name;
      this.nodes.player2Input.value = "";
      this.showNameModal(false);
    }
  },

  startGameVsAI() {
    this.state.aiDifficulty = document.querySelector(
      'input[name="aiDifficulty"]:checked'
    ).value;
    this.state.aiEnabled = true;
    this.hideModal(this.nodes.aiModalOverlay);
    this.nodes.aiBtn.textContent = "Disable AI";
    this.nodes.name2.textContent = "Computer";
    this.nodes.mainUI.style.display = "flex";
    this.nodes.vsPlayerName.textContent = this.state.player1Name;
    this.nodes.vsGraphicOverlay.style.display = "flex";

    setTimeout(() => {
      this.hideModal(this.nodes.vsGraphicOverlay);
      this.state.player2Name = "Computer";
      this.nodes.name1.textContent = this.state.player1Name;
      this.nodes.name2.textContent = this.state.player2Name;
      this.resetGame();
      this.updateScores();
      this.updateRoundsPlayed();
    }, 2000);
  },

  // --- GAME OVER & WINNER CHECKING ---
  checkGameOver() {
    if (this.state.gameOver) return true;
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
      const symbolA = this.state.cells[a].getAttribute("data-symbol");
      const symbolB = this.state.cells[b].getAttribute("data-symbol");
      const symbolC = this.state.cells[c].getAttribute("data-symbol");
      if (symbolA && symbolA === symbolB && symbolA === symbolC) {
        this.state.gameOver = true;
        [this.state.cells[a], this.state.cells[b], this.state.cells[c]].forEach(
          (cell) => cell.classList.add("highlight")
        );
        const winner =
          symbolA === "X" ? this.state.player1Name : this.state.player2Name;
        this.nodes.winnerMessage.textContent = `${winner} won the game!`;
        if (winner === this.state.player1Name) this.state.score1++;
        else this.state.score2++;
        this.state.roundsPlayed++;
        this.updateScores();
        this.updateRoundsPlayed();
        setTimeout(() => this.showModal(this.nodes.winnerModalOverlay), 300);
        return true;
      }
    }
    if (this.state.moveCount === 9) {
      this.state.gameOver = true;
      this.state.roundsPlayed++;
      this.updateRoundsPlayed();
      this.nodes.winnerMessage.textContent = "It's a Draw!";
      setTimeout(() => this.showModal(this.nodes.winnerModalOverlay), 300);
      return true;
    }
    return false;
  },

  // --- AI LOGIC ---
  aiMove() {
    let moveIndex;
    let emptyCells = this.state.cells
      .map((c, i) => (c.getAttribute("data-symbol") === null ? i : null))
      .filter((i) => i !== null);

    if (this.state.aiDifficulty === "normal") {
      moveIndex =
        this.getWinningMove("O") ??
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } else if (this.state.aiDifficulty === "medium") {
      moveIndex =
        this.getWinningMove("O") ??
        this.getWinningMove("X") ??
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } else if (this.state.aiDifficulty === "hard") {
      moveIndex = this.getBestMove();
    }
    if (moveIndex != null) this.handleMove(moveIndex);
  },

  getWinningMove(symbolKey) {
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
      const [a, b, c] = line;
      const values = [
        this.state.cells[a].getAttribute("data-symbol"),
        this.state.cells[b].getAttribute("data-symbol"),
        this.state.cells[c].getAttribute("data-symbol"),
      ];
      if (
        values.filter((v) => v === symbolKey).length === 2 &&
        values.includes(null)
      ) {
        return line[values.indexOf(null)];
      }
    }
    return null;
  },

  getBestMove() {
    let board = this.state.cells.map((c) => c.getAttribute("data-symbol"));
    const minimax = (board, isAiTurn) => {
      let win = this.checkWinner(board);
      if (win === "O") return { score: 1 };
      if (win === "X") return { score: -1 };
      if (!board.includes(null)) return { score: 0 };

      let moves = [];
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = isAiTurn ? "O" : "X";
          let result = minimax(board, !isAiTurn);
          moves.push({ index: i, score: result.score });
          board[i] = null;
        }
      }
      // Use reduce for a more concise way to find the best move
      if (isAiTurn) {
        return moves.reduce((best, move) =>
          move.score > best.score ? move : best
        );
      } else {
        return moves.reduce((best, move) =>
          move.score < best.score ? move : best
        );
      }
    };
    return minimax(board, true).index;
  },

  checkWinner(boardArr) {
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
      ) {
        return boardArr[a];
      }
    }
    return null;
  },

  /**
   * Initializes the game.
   */
  init() {
    this.cacheDOM();
    this.bindEvents();
    this.createBoard();
    this.initTheme();
  },
};

// Start the game once the DOM is fully loaded.
document.addEventListener("DOMContentLoaded", () => TicTacToe.init());
