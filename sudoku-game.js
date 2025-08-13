// Sudoku Game Logic with Multiplayer Support
class SudokuGame {
  constructor() {
    this.board = [];
    this.solution = [];
    this.initialBoard = [];
    this.selectedCell = null;
    this.difficulty = 'easy';
    this.isMultiplayer = false;
    this.roomCode = '';
    this.ws = null;
    this.partnerId = null;
    this.startTime = null;
    this.timerInterval = null;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupWebSocket();
    this.createEmptyBoard();
  }

  setupEventListeners() {
    // Room controls
    document.getElementById('create-room').addEventListener('click', () => this.createRoom());
    document.getElementById('join-room').addEventListener('click', () => this.joinRoom());
    document.getElementById('new-game').addEventListener('click', () => this.startNewGame());
    document.getElementById('hint').addEventListener('click', () => this.giveHint());
    document.getElementById('solve').addEventListener('click', () => this.solvePuzzle());

    // Difficulty selector
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.difficulty = e.target.dataset.level;
        if (this.board.some(row => row.some(cell => cell !== 0))) {
          this.startNewGame();
        }
      });
    });

    // Number pad
    document.querySelectorAll('.number-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const num = parseInt(e.target.dataset.num);
        if (this.selectedCell) {
          this.placeNumber(this.selectedCell.row, this.selectedCell.col, num);
        }
      });
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (!this.selectedCell) return;
      
      if (e.key >= '1' && e.key <= '9') {
        this.placeNumber(this.selectedCell.row, this.selectedCell.col, parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        this.placeNumber(this.selectedCell.row, this.selectedCell.col, 0);
      }
    });
  }

  setupWebSocket() {
    // Using a public WebSocket echo service for demo
    // In production, you'd use your own WebSocket server
    this.updateConnectionStatus('Single Player Mode');
  }

  createRoom() {
    this.roomCode = this.generateRoomCode();
    document.getElementById('room-code').textContent = this.roomCode;
    document.getElementById('room-info').style.display = 'block';
    document.getElementById('create-room').style.display = 'none';
    document.getElementById('join-room').style.display = 'none';
    document.getElementById('new-game').style.display = 'inline-block';
    document.getElementById('difficulty-selector').style.display = 'flex';
    
    this.isMultiplayer = true;
    this.setupMultiplayerConnection();
    this.showMessage('Room created! Share the code with your partner.', 'success');
  }

  joinRoom() {
    const code = prompt('Enter room code:');
    if (code) {
      this.roomCode = code.toUpperCase();
      document.getElementById('create-room').style.display = 'none';
      document.getElementById('join-room').style.display = 'none';
      document.getElementById('new-game').style.display = 'inline-block';
      document.getElementById('difficulty-selector').style.display = 'flex';
      
      this.isMultiplayer = true;
      this.setupMultiplayerConnection();
      this.showMessage(`Joined room ${this.roomCode}!`, 'success');
    }
  }

  setupMultiplayerConnection() {
    // For demo purposes, we'll simulate multiplayer with localStorage
    // In production, use WebSocket connection to a server
    
    this.updateConnectionStatus('Connected to Room: ' + this.roomCode);
    document.getElementById('partner-indicator').style.display = 'inline-block';
    
    // Simulate partner connection
    setTimeout(() => {
      this.showMessage('Partner connected!', 'success');
    }, 2000);
    
    // Listen for storage events (simulating multiplayer)
    window.addEventListener('storage', (e) => {
      if (e.key === `sudoku-${this.roomCode}`) {
        const data = JSON.parse(e.newValue);
        if (data.type === 'move' && data.senderId !== this.getPlayerId()) {
          this.handlePartnerMove(data);
        } else if (data.type === 'newgame' && data.senderId !== this.getPlayerId()) {
          this.loadGameState(data.gameState);
        }
      }
    });
  }

  handlePartnerMove(data) {
    const { row, col, value } = data;
    this.board[row][col] = value;
    this.updateCell(row, col, value);
    
    // Show partner's cursor briefly
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add('partner-cursor');
    setTimeout(() => cell.classList.remove('partner-cursor'), 1000);
  }

  broadcastMove(row, col, value) {
    if (this.isMultiplayer) {
      const data = {
        type: 'move',
        row,
        col,
        value,
        senderId: this.getPlayerId(),
        timestamp: Date.now()
      };
      localStorage.setItem(`sudoku-${this.roomCode}`, JSON.stringify(data));
    }
  }

  broadcastNewGame() {
    if (this.isMultiplayer) {
      const data = {
        type: 'newgame',
        gameState: {
          board: this.board,
          solution: this.solution,
          initialBoard: this.initialBoard,
          difficulty: this.difficulty
        },
        senderId: this.getPlayerId(),
        timestamp: Date.now()
      };
      localStorage.setItem(`sudoku-${this.roomCode}`, JSON.stringify(data));
    }
  }

  getPlayerId() {
    if (!this.playerId) {
      this.playerId = 'player-' + Math.random().toString(36).substr(2, 9);
    }
    return this.playerId;
  }

  generateRoomCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  updateConnectionStatus(status) {
    document.getElementById('connection-text').textContent = status;
  }

  createEmptyBoard() {
    const boardElement = document.getElementById('sudoku-board');
    boardElement.innerHTML = '';
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        // Add thicker borders for 3x3 boxes
        if (col % 3 === 2 && col !== 8) cell.style.borderRight = '2px solid #333';
        if (row % 3 === 2 && row !== 8) cell.style.borderBottom = '2px solid #333';
        
        cell.addEventListener('click', () => this.selectCell(row, col));
        boardElement.appendChild(cell);
      }
    }
  }

  startNewGame() {
    this.generatePuzzle();
    this.renderBoard();
    this.startTimer();
    
    document.getElementById('hint').style.display = 'inline-block';
    document.getElementById('solve').style.display = 'inline-block';
    document.getElementById('number-pad').style.display = 'grid';
    document.getElementById('timer').style.display = 'block';
    
    this.showMessage('New game started! Good luck!', 'success');
    this.broadcastNewGame();
  }

  generatePuzzle() {
    // Generate a complete valid Sudoku solution
    this.solution = this.generateCompleteSudoku();
    
    // Copy solution to board
    this.board = this.solution.map(row => [...row]);
    
    // Remove numbers based on difficulty
    const cellsToRemove = {
      easy: 35,
      medium: 45,
      hard: 55
    }[this.difficulty];
    
    const positions = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        positions.push([i, j]);
      }
    }
    
    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    // Remove cells
    for (let i = 0; i < cellsToRemove; i++) {
      const [row, col] = positions[i];
      this.board[row][col] = 0;
    }
    
    // Store initial board state
    this.initialBoard = this.board.map(row => [...row]);
  }

  generateCompleteSudoku() {
    const board = Array(9).fill().map(() => Array(9).fill(0));
    
    // Fill diagonal 3x3 boxes first (they're independent)
    for (let box = 0; box < 9; box += 3) {
      this.fillBox(board, box, box);
    }
    
    // Fill remaining cells
    this.solveSudoku(board);
    return board;
  }

  fillBox(board, startRow, startCol) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    
    let index = 0;
    for (let row = startRow; row < startRow + 3; row++) {
      for (let col = startCol; col < startCol + 3; col++) {
        board[row][col] = nums[index++];
      }
    }
  }

  solveSudoku(board) {
    const emptyCell = this.findEmptyCell(board);
    if (!emptyCell) return true;
    
    const [row, col] = emptyCell;
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    // Shuffle numbers for randomization
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    
    for (const num of numbers) {
      if (this.isValidMove(board, row, col, num)) {
        board[row][col] = num;
        
        if (this.solveSudoku(board)) {
          return true;
        }
        
        board[row][col] = 0;
      }
    }
    
    return false;
  }

  findEmptyCell(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          return [row, col];
        }
      }
    }
    return null;
  }

  isValidMove(board, row, col, num) {
    // Check row
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num) return false;
    }
    
    // Check column
    for (let i = 0; i < 9; i++) {
      if (board[i][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if (board[i][j] === num) return false;
      }
    }
    
    return true;
  }

  renderBoard() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        this.updateCell(row, col, this.board[row][col]);
      }
    }
  }

  updateCell(row, col, value) {
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.textContent = value || '';
    
    // Mark fixed cells
    if (this.initialBoard && this.initialBoard[row][col] !== 0) {
      cell.classList.add('fixed');
    } else {
      cell.classList.remove('fixed');
    }
    
    // Check for errors
    if (value !== 0 && value !== this.solution[row][col]) {
      cell.classList.add('error');
    } else {
      cell.classList.remove('error');
    }
  }

  selectCell(row, col) {
    // Don't select fixed cells
    if (this.initialBoard && this.initialBoard[row][col] !== 0) return;
    
    // Clear previous selection
    document.querySelectorAll('.cell').forEach(cell => {
      cell.classList.remove('selected', 'highlight');
    });
    
    // Select new cell
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add('selected');
    this.selectedCell = { row, col };
    
    // Highlight same number
    const value = this.board[row][col];
    if (value !== 0) {
      document.querySelectorAll('.cell').forEach(c => {
        const r = parseInt(c.dataset.row);
        const cl = parseInt(c.dataset.col);
        if (this.board[r][cl] === value) {
          c.classList.add('highlight');
        }
      });
    }
  }

  placeNumber(row, col, num) {
    if (this.initialBoard && this.initialBoard[row][col] !== 0) return;
    
    this.board[row][col] = num;
    this.updateCell(row, col, num);
    this.broadcastMove(row, col, num);
    
    if (this.checkWin()) {
      this.handleWin();
    }
  }

  checkWin() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.board[row][col] !== this.solution[row][col]) {
          return false;
        }
      }
    }
    return true;
  }

  handleWin() {
    clearInterval(this.timerInterval);
    this.showMessage('🎉 Congratulations! You solved the puzzle! 🎉', 'success');
    
    // Celebrate with animation
    document.querySelectorAll('.cell').forEach((cell, index) => {
      setTimeout(() => {
        cell.style.transform = 'scale(1.1)';
        cell.style.background = '#4CAF50';
        cell.style.color = 'white';
        setTimeout(() => {
          cell.style.transform = 'scale(1)';
        }, 200);
      }, index * 20);
    });
  }

  giveHint() {
    const emptyCells = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.board[row][col] === 0) {
          emptyCells.push([row, col]);
        }
      }
    }
    
    if (emptyCells.length === 0) return;
    
    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    this.placeNumber(row, col, this.solution[row][col]);
    
    // Highlight the hint cell
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.style.background = '#4CAF50';
    setTimeout(() => {
      cell.style.background = '';
    }, 1000);
  }

  solvePuzzle() {
    if (confirm('Are you sure you want to see the solution?')) {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          this.board[row][col] = this.solution[row][col];
          this.updateCell(row, col, this.solution[row][col]);
        }
      }
      clearInterval(this.timerInterval);
      this.showMessage('Puzzle solved!', 'success');
    }
  }

  startTimer() {
    this.startTime = Date.now();
    clearInterval(this.timerInterval);
    
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }

  loadGameState(gameState) {
    this.board = gameState.board;
    this.solution = gameState.solution;
    this.initialBoard = gameState.initialBoard;
    this.difficulty = gameState.difficulty;
    
    this.renderBoard();
    this.startTimer();
    
    document.getElementById('hint').style.display = 'inline-block';
    document.getElementById('solve').style.display = 'inline-block';
    document.getElementById('number-pad').style.display = 'grid';
    document.getElementById('timer').style.display = 'block';
    
    // Update difficulty selector
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === this.difficulty);
    });
    
    this.showMessage('Game synchronized with partner!', 'success');
  }

  showMessage(text, type = '') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = 'message ' + type;
    
    setTimeout(() => {
      messageEl.textContent = '';
      messageEl.className = '';
    }, 3000);
  }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
  new SudokuGame();
});
