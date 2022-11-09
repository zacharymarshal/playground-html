import { Character } from "/sprites-1/character.js";
import { fpsLimiter } from "/sprites-1/utils.js";

const character = new Character();

const inputs = document.querySelectorAll("[name='animations']");
inputs.forEach((animationsInput) => {
  animationsInput.addEventListener("change", (e) => {
    character.setAnimation(e.target.value);
  });
});

let fps = 16;
const animationFpsEl = document.querySelector("#animation-fps");
animationFpsEl.addEventListener("change", (e) => {
  fps = e.target.value;
});

const fpsEl = document.querySelector("#fps");
const limitFps = fpsLimiter();

let prevTs = 0;
function animate(ts) {
  const deltaTime = ts - prevTs;
  prevTs = ts;

  limitFps(fps, deltaTime, () => character.draw());

  fpsEl.innerHTML = parseInt(1000 / deltaTime);

  requestAnimationFrame(animate);
}
animate(0);
