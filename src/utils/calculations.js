//file that contains all functions/methods related to calculations

//object to hold the multipliers for the activity levels
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

//object to hold the values for gain and loss goals
export const GOAL_ADJUSTMENTS = {
  maintenance: 0,
  cutting: -0.2,
  recomp: -0.05,
  bulking: 0.15,
};

//function to convert every value from english (lb, etc) to metric (kg, etc)
//currentUnitSystem will be either "metric" or "imperial"
//if imperial: convert weight (lb to kg) and height (in to cm)
//if metric keep as is
//returns weight and height objects
function toMetric(weight, height, currentUnitSystem) {
  let newWeight = weight;
  let newHeight = height;
  if (currentUnitSystem !== "metric" && currentUnitSystem !== "imperial") {
    throw new Error(`Unknown unit system: ${currentUnitSystem}`);
  }
  if (currentUnitSystem === "imperial") {
    newWeight = weight * 0.453592;
    newHeight = height * 2.54;
  }
  return { weight: newWeight, height: newHeight };
}

//function to calcuate the BMR  which is calories needed
//returns float no rounding
export function calculateBMR({ weight, height, age, gender, unitSystem }) {
  //validates weight and height before running toMetric
  if (weight <= 0 || height <= 0) {
    throw new Error(`Weight and Height must be greater than 0`);
  }
  let userDetails = toMetric(weight, height, unitSystem);
  //validate age. throws error if age is less than 0
  if (age <= 0) {
    throw new Error(`Age must be greater than 0`);
  }
  //validate gender. throws error if gender is not "Male" or "Female"
  if (gender !== "male" && gender !== "female") {
    throw new Error(`Gender should be either Male or Female`);
  }
  let base = 10 * userDetails.weight + 6.25 * userDetails.height - 5 * age;
  //if male, base + 5 if female, base - 5 based on TDEE calculation
  if (gender == "male") {
    base = base + 5;
  } else {
    base = base - 5;
  }
  return base;
}

//function to calculate the TDEE
//multipliers are located on the top and is hardcoded
export function calculateTDEE(bmr, activityLevel) {
  if (!(activityLevel in ACTIVITY_MULTIPLIERS)) {
    throw new Error(`Activity Level not valid`);
  }
  let multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  return bmr * multiplier;
}

//function to calculate the target calories
export function calculateTargetCalories({
  weight,
  height,
  age,
  gender,
  unitSystem,
  activityLevel,
  goal,
}) {
  let bmr = calculateBMR({ weight, height, age, gender, unitSystem });
  let tdee = calculateTDEE(bmr, activityLevel);
  if (!(goal in GOAL_ADJUSTMENTS)) {
    throw new Error(`Goal is not valid`);
  }
  return Math.round(tdee * (1 + GOAL_ADJUSTMENTS[goal]));
}
