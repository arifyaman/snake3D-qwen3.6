/**
 * Game Configuration
 */
const CONFIG = {
    GRID_SIZE: 20,          // 20x20 grid
    CELL_SIZE: 1,           // Size of each grid cell in 3D units
    INITIAL_SPEED: 180,     // Milliseconds per snake move
    SPEED_INCREMENT: 2,     // Speed up by 2ms per food eaten
    MIN_SPEED: 80,          // Fastest possible speed
    WALL_WRAP: true,        // Wrap around walls instead of dying
    CAMERA_SMOOTHNESS: 0.05 // Camera follow smoothing factor
};
