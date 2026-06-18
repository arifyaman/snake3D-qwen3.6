/**
 * Three.js Renderer - Scene, lighting, meshes, and rendering
 */
let scene, camera, renderer;
let pointLight; // Point light following snake head

// DOM elements
const rendererDom = document.createElement('div');

/**
 * Initialize Three.js scene, camera, and renderer
 */
function initThreeJS() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 20, 40);

    // Camera - positioned at an angle for a nice perspective
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
    camera.position.set(0, 18, 14);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.tabIndex = 0;
    renderer.domElement.style.outline = 'none';

    // Add canvas to DOM
    document.getElementById('game-container').prepend(renderer.domElement);

    // Ensure canvas gets keyboard focus
    renderer.domElement.addEventListener('click', () => {
        renderer.domElement.focus();
    });

    // Lighting
    setupLighting();

    // Ground
    createGround();

    // Boundary walls (visible markers)
    createWalls();

    // Point light that will follow snake head
    pointLight = new THREE.PointLight(0x00ff88, 1, 15);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

/**
 * Set up scene lighting
 */
function setupLighting() {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Directional light for shadows
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    scene.add(dirLight);
}

/**
 * Create checkered ground and grid lines
 */
function createGround() {
    const gridSize = CONFIG.GRID_SIZE;
    const cellSize = CONFIG.CELL_SIZE;
    const totalSize = gridSize * cellSize;

    // Checkered ground
    const checkerGeometry = new THREE.PlaneGeometry(totalSize, totalSize);
    const checkerCanvas = document.createElement('canvas');
    checkerCanvas.width = 256;
    checkerCanvas.height = 256;
    const ctx = checkerCanvas.getContext('2d');
    const tileSize = 256 / 8; // 8x8 pattern for visual effect

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            ctx.fillStyle = (i + j) % 2 === 0 ? '#1a1a2e' : '#16213e';
            ctx.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
        }
    }

    const checkerTexture = new THREE.CanvasTexture(checkerCanvas);
    checkerTexture.wrapS = THREE.RepeatWrapping;
    checkerTexture.wrapT = THREE.RepeatWrapping;
    checkerTexture.repeat.set(gridSize / 8, gridSize / 8);

    const checkerMaterial = new THREE.MeshStandardMaterial({
        map: checkerTexture,
        roughness: 0.8,
        metalness: 0.2
    });

    const checkerPlane = new THREE.Mesh(checkerGeometry, checkerMaterial);
    checkerPlane.rotation.x = -Math.PI / 2;
    checkerPlane.position.y = -0.01;
    checkerPlane.receiveShadow = true;
    scene.add(checkerPlane);

    // Grid lines
    const gridHelper = new THREE.GridHelper(gridSize, gridSize, 0x00ff88, 0x0a3d20);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
}

/**
 * Create visible boundary walls
 */
function createWalls() {
    const halfSize = CONFIG.GRID_SIZE / 2;
    const wallHeight = 0.5;
    const wallThickness = 0.3;
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4444,
        emissive: 0x440000,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.4,
        roughness: 0.5
    });

    // Create 4 wall segments
    const wallPositions = [
        { x: 0, z: -halfSize - wallThickness / 2, sx: CONFIG.GRID_SIZE + wallThickness * 2, sz: wallThickness }, // Top
        { x: 0, z: halfSize + wallThickness / 2, sx: CONFIG.GRID_SIZE + wallThickness * 2, sz: wallThickness },  // Bottom
        { x: -halfSize - wallThickness / 2, z: 0, sx: wallThickness, sz: CONFIG.GRID_SIZE },                    // Left
        { x: halfSize + wallThickness / 2, z: 0, sx: wallThickness, sz: CONFIG.GRID_SIZE }                      // Right
    ];

    wallPositions.forEach(pos => {
        const geometry = new THREE.BoxGeometry(pos.sx, wallHeight, pos.sz);
        const wall = new THREE.Mesh(geometry, wallMaterial);
        wall.position.set(pos.x, wallHeight / 2 - 0.5, pos.z);
        wall.receiveShadow = true;
        scene.add(wall);
    });
}

/**
 * Create a snake segment mesh
 */
function createSnakeSegment(isHead = false) {
    const geometry = new THREE.BoxGeometry(0.85, 0.85, 0.85);
    const material = new THREE.MeshStandardMaterial({
        color: isHead ? 0x00ff44 : 0x00cc33,
        emissive: isHead ? 0x00ff44 : 0x00aa22,
        emissiveIntensity: isHead ? 0.5 : 0.3,
        roughness: 0.3,
        metalness: 0.7
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Wireframe overlay for border effect
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x00ff88, linewidth: 2 });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    mesh.add(edges);

    return mesh;
}

/**
 * Update snake meshes to match current snake positions
 */
function updateSnakeMeshes() {
    // Remove excess meshes
    while (snakeMeshes.length > snake.length) {
        const mesh = snakeMeshes.pop();
        scene.remove(mesh);
    }

    // Add missing meshes
    while (snakeMeshes.length < snake.length) {
        const isHead = snakeMeshes.length === 0;
        const mesh = createSnakeSegment(isHead);
        scene.add(mesh);
        snakeMeshes.push(mesh);
    }

    // Update positions
    snake.forEach((segment, index) => {
        const mesh = snakeMeshes[index];
        mesh.position.set(
            segment.x - CONFIG.GRID_SIZE / 2 + CONFIG.CELL_SIZE / 2,
            0.425,
            segment.y - CONFIG.GRID_SIZE / 2 + CONFIG.CELL_SIZE / 2
        );

        // Head glow is brighter
        if (index === 0) {
            mesh.material.emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.01) * 0.2;
        }
    });
}

/**
 * Create food mesh (torus knot with glow)
 */
function createFood() {
    if (foodMesh) {
        scene.remove(foodMesh);
    }

    // Create a torus knot for the food
    const geometry = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16);
    const material = new THREE.MeshStandardMaterial({
        color: 0xff3366,
        emissive: 0xff0044,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.8
    });

    foodMesh = new THREE.Mesh(geometry, material);
    foodMesh.castShadow = true;

    // Add a point light to the food for glow effect
    const foodLight = new THREE.PointLight(0xff3366, 0.5, 5);
    foodMesh.add(foodLight);

    scene.add(foodMesh);
    updateFoodMeshPosition();
}

/**
 * Update food mesh position and animation
 */
function updateFoodMeshPosition() {
    if (!foodMesh) return;

    foodMesh.position.set(
        food.x - CONFIG.GRID_SIZE / 2 + CONFIG.CELL_SIZE / 2,
        0.5 + Math.sin(Date.now() * 0.005) * 0.2,
        food.y - CONFIG.GRID_SIZE / 2 + CONFIG.CELL_SIZE / 2
    );

    // Rotate food
    foodMesh.rotation.x += 0.02;
    foodMesh.rotation.y += 0.03;
    foodMesh.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.15);
}

/**
 * Update point light position to follow snake head
 */
function updatePointLight() {
    if (snake.length > 0 && snakeMeshes.length > 0) {
        const headMesh = snakeMeshes[0];
        pointLight.position.copy(headMesh.position);
        pointLight.position.y += 2;
    }
}

/**
 * Update camera to slightly follow snake head
 */
function updateCamera() {
    if (snakeMeshes.length === 0) return;

    const headMesh = snakeMeshes[0];
    const targetX = headMesh.position.x * 0.3;
    const targetZ = 14 + headMesh.position.z * 0.3;
    camera.position.x += (targetX - camera.position.x) * CONFIG.CAMERA_SMOOTHNESS;
    camera.position.z += (targetZ - camera.position.z) * CONFIG.CAMERA_SMOOTHNESS;
    camera.lookAt(camera.position.x * 0.5, 0, camera.position.z * 0.3 - 7);
}

/**
 * Handle window resize
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
