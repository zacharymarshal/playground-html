export default class Sprite {
  #spriteSheetImg;
  #size;
  #sheetX;
  #sheetY;
  constructor({ spriteSheetImg, size, sheetX, sheetY }) {
    this.#spriteSheetImg = spriteSheetImg;
    this.#size = size;
    this.#sheetX = sheetX;
    this.#sheetY = sheetY;
  }
  draw(ctx, x, y, cellSize) {
    ctx.drawImage(
      this.#spriteSheetImg,
      this.#sheetX,
      this.#sheetY,
      this.#size,
      this.#size,
      x * cellSize,
      y * cellSize,
      cellSize,
      cellSize
    );
  }
}
