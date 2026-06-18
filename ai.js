/**
 * Auto-Play AI - Pathfinding and decision making
 */

/**
 * Main AI function - called every game tick when auto-play is enabled
 */
function autoPlayAI() {
    if (!autoPlay || isGameOver) return;

    const head = snake[0];
    const gridSize = CONFIG.GRID_SIZE;

    // Get all possible directions (excluding reverse)
    const possibleDirs = [
        { x: 1, y: 0 },   // Right
        { x: -1, y: 0 },  // Left
        { x: 0, y: 1 },   // Down
        { x: 0, y: -1 }   // Up
    ].filter(dir => !(dir.x === -direction.x && dir.y === -direction.y));

    // Filter to safe moves
    const safeMoves = possibleDirs.filter(dir => {
        let newX, newY;

        if (CONFIG.WALL_WRAP) {
            newX = (head.x + dir.x + gridSize) % gridSize;
            newY = (head.y + dir.y + gridSize) % gridSize;
        } else {
            newX = head.x + dir.x;
            newY = head.y + dir.y;
        }

        // Check self collision
        return !snake.some(segment => segment.x === newX && segment.y === newY);
    });

    if (safeMoves.length === 0) {
        // No safe moves - can't avoid death
        return;
    }

    if (safeMoves.length === 1) {
        // Only one safe move
        nextDirection = { ...safeMoves[0] };
        return;
    }

    // BFS to find shortest path to food
    const sortedMoves = safeMoves.sort((a, b) => {
        const distA = bfsDistance(head, a, gridSize);
        const distB = bfsDistance(head, b, gridSize);
        return distA - distB;
    });

    // Use the move with shortest distance to food
    nextDirection = { ...sortedMoves[0] };
}

/**
 * BFS to find shortest path from a position to food
 * Returns distance or Infinity if unreachable
 */
function bfsDistance(startPos, initialDir, gridSize) {
    const simulatedHead = {
        x: (startPos.x + initialDir.x + gridSize) % gridSize,
        y: (startPos.y + initialDir.y + gridSize) % gridSize
    };

    // Create a set of snake body positions (excluding tail which will move)
    const bodySet = new Set(snake.slice(0, -1).map(s => `${s.x},${s.y}`));

    // Check if simulated head is safe
    if (bodySet.has(`${simulatedHead.x},${simulatedHead.y}`)) {
        return Infinity;
    }

    const visited = new Set();
    visited.add(`${simulatedHead.x},${simulatedHead.y}`);

    const queue = [{ pos: simulatedHead, dist: 0 }];

    while (queue.length > 0) {
        const { pos, dist } = queue.shift();

        if (pos.x === food.x && pos.y === food.y) {
            return dist;
        }

        const directions = [
            { x: 1, y: 0 }, { x: -1, y: 0 },
            { x: 0, y: 1 }, { x: 0, y: -1 }
        ];

        for (const dir of directions) {
            const newX = (pos.x + dir.x + gridSize) % gridSize;
            const newY = (pos.y + dir.y + gridSize) % gridSize;
            const key = `${newX},${newY}`;

            if (!visited.has(key) && !bodySet.has(key)) {
                visited.add(key);
                queue.push({ pos: { x: newX, y: newY }, dist: dist + 1 });
            }
        }
    }

    // If food not reachable, prefer move that keeps most space (simple heuristic)
    return 999;
}
