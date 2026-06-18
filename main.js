/**
 * Main Entry Point - Initialization and animation loop
 */

/**
 * Animation loop - called every frame via requestAnimationFrame
 */
function animate(currentTime) {
    requestAnimationFrame(animate);

    // Update food mesh position and animation
    updateFoodMeshPosition();

    // Update point light to follow snake head
    updatePointLight();

    // Camera slightly follows snake head
    updateCamera();

    // Render scene
    renderer.render(scene, camera);
}

/**
 * Initialize the game
 */
function init() {
    // Three.js setup
    initThreeJS();

    // Initialize game state
    initGame();

    // Start snake meshes
    updateSnakeMeshes();

    // Setup input
    setupInput();

    // Start animation loop
    animate(0);

    // Start game tick loop
    setInterval(gameTick, 16); // ~60fps tick for game logic
}

// Start the game when page loads
window.addEventListener('load', init);
