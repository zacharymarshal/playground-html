function calculateCalories(weight, height, gender, age, a) {
  weight /= 2.205;
  height *= 2.54;
  let restCalories = 0;
  if (gender == "male") {
    let restCalories = 10 * weight + 6.25 * height - 5 * age + 5;
    return (restCalories *= a);
  } else {
    let restCalories = 10 * weight + 6.25 * height - 5 * age - 161;
    return (restCalories *= a);
  }
}

export { calculateCalories };
