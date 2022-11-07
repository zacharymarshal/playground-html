import { Character } from "/game-animation-sprite-1/character.js";

const c = new Character();
let prevTs = 0;
const fpsEl = document.querySelector("#fps");

const inputs = document.querySelectorAll("[name='animations']");
inputs.forEach((animationsInput) => {
  animationsInput.addEventListener("change", (e) => {
    c.setAnimation(e.target.value);
    console.log(e.target.value);
  });
});

const animationFpsEl = document.querySelector("#animation-fps");
animationFpsEl.addEventListener("change", (e) => {
  c.setFps(e.target.value);
});

function animate(ts) {
  const delta = ts - prevTs;
  prevTs = ts;

  c.update();
  c.draw(delta);

  fpsEl.innerHTML = parseInt(1000 / delta);

  requestAnimationFrame(animate);
}
animate(0);
