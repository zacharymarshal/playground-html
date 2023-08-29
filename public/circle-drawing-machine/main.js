import { interpret } from "https://unpkg.com/xstate@4.38.2/dist/xstate.web.js";
import { machine } from "./machine.js";

const service = interpret(machine).start();

const undoBtn = document.getElementById("undo");
undoBtn.addEventListener("click", () => {
  service.send("UNDO");
});

const redoBtn = document.getElementById("redo");
redoBtn.addEventListener("click", () => {
  service.send("REDO");
});

const circleRadiusInput = document.getElementById("circle-radius-input");
circleRadiusInput.addEventListener("input", (e) => {
  service.send("CIRCLE_CHANGE", {
    radius: Number(e.target.value),
  });
});

const canvasEl = document.getElementById("canvas");
canvasEl.addEventListener("click", (e) => {
  const { offsetX, offsetY } = e;
  service.send("CANVAS_CLICK", {
    x: offsetX,
    y: offsetY,
    radius: Number(circleRadiusInput.value),
  });
});

const drawCircle = (ctx, circle, selected = false) => {
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
  ctx.strokeStyle = selected ? "blue" : "black";
  ctx.lineWidth = selected ? 3 : 1;
  ctx.stroke();
};

const ctx = canvasEl.getContext("2d");
service.onTransition((state) => {
  if (state.value === "EDITING") {
    undoBtn.disabled = true;
    redoBtn.disabled = true;
    const selectedCircle = state.context.circles.find(
      (circle) => circle.circleID === state.context.selectedCircleID
    );
    circleRadiusInput.value = selectedCircle.radius;
    circleRadiusInput.disabled = false;
  } else {
    undoBtn.disabled = state.context.undoStack.length === 0;
    redoBtn.disabled = state.context.redoStack.length === 0;
    circleRadiusInput.disabled = true;
  }
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  state.context.circles.forEach((circle) => {
    drawCircle(ctx, circle, circle.circleID === state.context.selectedCircleID);
  });
});
