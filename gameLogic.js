/**
 * Game State - Shared between modules
 */
let snake = [];                // Array of {x, y} positions
let snakeMeshes = [];          // Three.js meshes for snake segments
let food = null;               // Current food position {x, y}
let foodMesh = null;           // Three.js food mesh
let direction = { x: 1, y: 0 };   // Current movement direction
let nextDirection = { x: 1, y: 0 }; // Buffered next direction
let autoPlay = true;           // Auto-play enabled
let score = 0;                 // Current score
let gameSpeed = CONFIG.INITIAL_SPEED;
let lastMoveTime = 0;
let isGameOver = false;

// DOM elements
const modeBadge = document.getElementById('mode-badge');
const scoreEl = document.getElementById('score');
const instructionsEl = document.getElementById('instructions');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score-value');
const restartBtn = document.getElementById('restart-btn');

/**
 * Initialize game state
 */
function initGame() {
    // Clear existing snake
    snake = [];
    snakeMeshes.forEach(mesh => scene.remove(mesh));
    snakeMeshes = [];

    // Start snake in the center
    const startX = Math.floor(CONFIG.GRID_SIZE / 2);
    const startY = Math.floor(CONFIG.GRID_SIZE / 2);
    snake.push({ x: startX, y: startY });
    snake.push({ x: startX - 1, y: startY });
    snake.push({ x: startX - 2, y: startY });

    // Reset state
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    autoPlay = true;
    score = 0;
    gameSpeed = CONFIG.INITIAL_SPEED;
    isGameOver = false;

    // Update UI
    modeBadge.textContent = 'AUTO-PLAY ACTIVE';
    modeBadge.className = 'auto';
    scoreEl.textContent = '0';
    instructionsEl.textContent = 'Press any arrow key to take control • Press SPACE to toggle auto-play';
    instructionsEl.style.display = 'block';
    gameOverEl.classList.remove('show');

    // Create food
    spawnFood();
}

/**
 * Spawn food at random position not on snake
 */
function spawnFood() {
    const gridSize = CONFIG.GRID_SIZE;
    let validPosition = false;

    while (!validPosition) {
        food = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };

        // Make sure food doesn't spawn on snake
        validPosition = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }

    createFood();
}

/**
 * Move snake forward
 */
function moveSnake() {
    if (isGameOver) return;

    // Update direction from buffer
    direction = { ...nextDirection };

    // Calculate new head position
    const head = { ...snake[0] };

    if (CONFIG.WALL_WRAP) {
        // Wrap around edges
        head.x = (head.x + direction.x + CONFIG.GRID_SIZE) % CONFIG.GRID_SIZE;
        head.y = (head.y + direction.y + CONFIG.GRID_SIZE) % CONFIG.GRID_SIZE;
    } else {
        head.x += direction.x;
        head.y += direction.y;

        // Check wall collision (die on wall hit if not wrapping)
        if (head.x < 0 || head.x >= CONFIG.GRID_SIZE ||
            head.y < 0 || head.y >= CONFIG.GRID_SIZE) {
            gameOver();
            return;
        }
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    // Add new head
    snake.unshift(head);

    // Check if food eaten
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreEl.textContent = score;
        gameSpeed = Math.max(CONFIG.MIN_SPEED, CONFIG.INITIAL_SPEED - score * CONFIG.SPEED_INCREMENT);

        // Spawn new food
        spawnFood();
    } else {
        // Remove tail
        snake.pop();
    }

    // Update meshes
    updateSnakeMeshes();
}

/**
 * Handle game over
 */
function gameOver() {
    isGameOver = true;
    finalScoreEl.textContent = score;
    gameOverEl.classList.add('show');
}

/**
 * Restart the game
 */
function restartGame() {
    initGame();
}

/**
 * Game tick - called every frame for game logic
 */
function gameTick() {
    if (autoPlay && !isGameOver) {
        autoPlayAI();
    }

    const currentTime = Date.now();
    if (currentTime - lastMoveTime >= gameSpeed) {
        moveSnake();
        lastMoveTime = currentTime;
    }
}
