export function fpsLimiter() {
  let frameTimer = 0;
  return (fps, deltaTime, cb) => {
    if (frameTimer < 1000 / fps) {
      frameTimer += deltaTime;
      return;
    }

    frameTimer = 0;
    cb();
  };
}
