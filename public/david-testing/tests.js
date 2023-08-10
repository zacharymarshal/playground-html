import { calculateCalories } from "./calculateCalories.js";

QUnit.module("calculating calories", function () {
  QUnit.test("calculate for males", function (assert) {
    const calories = calculateCalories(145, 70, "male", 34, 1.2);
    assert.equal(calories.toFixed(2), 1924.62);
  });
  QUnit.test("calculate for females", function (assert) {
    const calories = calculateCalories(100, 60, "female", 34, 1.2);
    assert.equal(calories.toFixed(2), 1290.02);
  });
  QUnit.test("calculate using different activity level", function (assert) {
    const calories = calculateCalories(100, 60, "female", 34, 1.375);
    assert.equal(calories.toFixed(2), 1478.15);
  });
  QUnit.test("handles invalid gender", function (assert) {
    const calories = calculateCalories(100, 60, "non-binary", 34, 1.375);
    assert.throws(() => {
      calories.toFixed(2);
    }, /invalid gender/);
  });
});
