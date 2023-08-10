import GameRenderer from "./GameRenderer.js";

const gameState = {
  cellSize: 8,
  cellWidth: 21,
  cellHeight: 11,
  sprites: {
    GRASS: {
      spriteSheet: "./images/map-sprite-sheet.png",
      size: 8,
      sheetX: 0,
      sheetY: 0,
    },
  },
  background: {
    color: "#191c19",
    sprites: {
      TOP: "",
      RIGHT: "",
      LEFT: "",
      BOTTOM: "",
      MIDDLE: "GRASS",
    },
  },
  camera: {
    position: [10, 5],
    zoom: 1,
  },
  gameObjects: [],
};

const gameboard = document.querySelector("#gameboard");

const game = new GameRenderer();

const FPS = 30;

(async () => {
  let lastTime = 0;
  // Use 999 to force a render on the first frame
  let frameTimer = 999;
  const animate = async (t) => {
    const deltaTime = t - lastTime;
    lastTime = t;
    if (frameTimer < 1000 / FPS) {
      frameTimer += deltaTime;
    } else {
      // Re-render the game every x frames per second
      await game.render(gameboard, gameState);
      frameTimer = 0;
    }

    requestAnimationFrame(animate);
  };

  // Start our game loop
  await animate(0);

  // Event listeners
  const handleCameraZoom = (e) => {
    const direction = e.target.dataset.cameraZoom;
    const { zoom } = gameState.camera;
    switch (direction) {
      case "in":
        if (zoom === 4) return;
        gameState.camera.zoom = zoom + 1;
        break;
      case "out":
        if (zoom === 1) return;
        gameState.camera.zoom = zoom - 1;
        break;
    }
  };
  const handleCameraMove = (e) => {
    const direction = e.target.dataset.cameraMove;
    const [x, y] = gameState.camera.position;
    switch (direction) {
      case "up":
        if (y === 0) return;
        gameState.camera.position = [x, y - 1];
        break;
      case "down":
        if (y === gameState.cellHeight) return;
        gameState.camera.position = [x, y + 1];
        break;
      case "left":
        if (x === 0) return;
        gameState.camera.position = [x - 1, y];
        break;
      case "right":
        if (x === gameState.cellWidth) return;
        gameState.camera.position = [x + 1, y];
        break;
    }
  };

  const cameraMoveEls = document.querySelectorAll("[data-camera-move]");
  cameraMoveEls.forEach((el) => el.addEventListener("click", handleCameraMove));

  const cameraZoomEls = document.querySelectorAll("[data-camera-zoom]");
  cameraZoomEls.forEach((el) => el.addEventListener("click", handleCameraZoom));
})();
