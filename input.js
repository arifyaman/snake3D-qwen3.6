/**
 * Input Handling - Keyboard input and UI updates
 */

/**
 * Handle keyboard input
 */
function handleKeydown(event) {
    if (isGameOver) return;

    const key = event.key;

    // Prevent page scrolling on space and arrow keys
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        event.preventDefault();
    }

    // Toggle auto-play with space
    if (key === ' ' || key === 'Space') {
        autoPlay = !autoPlay;
        if (autoPlay) {
            modeBadge.textContent = 'AUTO-PLAY ACTIVE';
            modeBadge.className = 'auto';
            instructionsEl.textContent = 'Auto-play resumed • Press SPACE for manual control';
            instructionsEl.style.display = 'block';
        } else {
            modeBadge.textContent = 'MANUAL MODE';
            modeBadge.className = 'manual';
            instructionsEl.textContent = 'Press SPACE to resume auto-play';
            instructionsEl.style.display = 'block';
        }
        return;
    }

    // Only arrow keys
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) return;

    // Disable auto-play on first arrow key press
    if (autoPlay) {
        autoPlay = false;
        modeBadge.textContent = 'MANUAL MODE';
        modeBadge.className = 'manual';
        instructionsEl.textContent = 'Press SPACE to resume auto-play';
        instructionsEl.style.display = 'block';
    }

    // Prevent reversing direction
    switch (key) {
        case 'ArrowUp':
            if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
            break;
    }

    event.preventDefault();
}

/**
 * Setup input event listeners
 */
function setupInput() {
    document.addEventListener('keydown', handleKeydown);
    restartBtn.addEventListener('click', restartGame);

    // Focus canvas for keyboard input
    renderer.domElement.focus();
    document.addEventListener('click', () => {
        if (!autoPlay || document.activeElement === renderer.domElement) {
            renderer.domElement.focus();
        }
    });
}
