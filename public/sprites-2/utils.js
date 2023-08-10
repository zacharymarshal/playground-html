export function fpsLimiter() {
  let frameTimer = 0;
  return (fps, deltaTime) => {
    if (frameTimer < 1000 / fps) {
      frameTimer += deltaTime;
      return false;
    }

    frameTimer = 0;

    return true;
  };
}
