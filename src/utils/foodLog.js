//shared food-log helpers used by both FoodLog.jsx and Home.jsx
//pulled out of FoodLog.jsx so the localStorage keys and day/meal shape
//only live in one place -- Home.jsx needs to read the same data FoodLog.jsx
//writes, and duplicating the keys/logic would risk them drifting out of sync

export const FOOD_STORAGE_KEY = "fittrack-food-log";

export const TARGET_STORAGE_KEY = "fittrack-food-targets";

export const mealTypes = [
  {
    id: "breakfast",
    name: "Breakfast",
    description: "Start the day with energy",
  },
  {
    id: "lunch",
    name: "Lunch",
    description: "Midday meal",
  },
  {
    id: "dinner",
    name: "Dinner",
    description: "Evening meal",
  },
  {
    id: "snacks",
    name: "Snacks",
    description: "Snacks and drinks",
  },
];

export const defaultTargets = {
  calories: 2100,
  protein: 170,
  carbs: 220,
  fat: 60,
  fiber: 30,
  waterMl: 2700,
};

//shape of one day's log: foods grouped by meal, plus water intake
export function createEmptyDay() {
  return {
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    },
    waterMl: 0,
  };
}

//turns a Date into a YYYY-MM-DD string in local time (not UTC), used as
//the key for foodDays
export function createLocalDateValue(date = new Date()) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

//reads the saved food log out of localStorage, falls back to {} if nothing
//saved yet or if the saved data is corrupted/unparseable
export function loadFoodDays() {
  try {
    const saved = localStorage.getItem(FOOD_STORAGE_KEY);

    if (!saved) {
      return {};
    }

    const parsed = JSON.parse(saved);

    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Unable to load food log:", error);

    return {};
  }
}

//same idea as loadFoodDays but for nutrition targets, falls back to defaultTargets
export function loadTargets() {
  try {
    const saved = localStorage.getItem(TARGET_STORAGE_KEY);

    if (!saved) {
      return defaultTargets;
    }

    const parsed = JSON.parse(saved);

    return {
      ...defaultTargets,
      ...parsed,
    };
  } catch (error) {
    console.error("Unable to load nutrition targets:", error);

    return defaultTargets;
  }
}

//safely converts a form value (which could be "", undefined, etc.) into a
//real number, defaulting to 0 instead of NaN
export function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

//scales one food entry's per-serving nutrition by how many servings were logged
export function calculateFoodNutrition(food) {
  const servings = toNumber(food.servings);

  return {
    calories: toNumber(food.calories) * servings,
    protein: toNumber(food.protein) * servings,
    carbs: toNumber(food.carbs) * servings,
    fat: toNumber(food.fat) * servings,
    fiber: toNumber(food.fiber) * servings,
  };
}

//sums calculateFoodNutrition across every food in one meal (e.g. all of breakfast)
export function calculateMealTotals(foods) {
  return foods.reduce(
    (totals, food) => {
      const nutrition = calculateFoodNutrition(food);

      return {
        calories: totals.calories + nutrition.calories,
        protein: totals.protein + nutrition.protein,
        carbs: totals.carbs + nutrition.carbs,
        fat: totals.fat + nutrition.fat,
        fiber: totals.fiber + nutrition.fiber,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

//adds calculateMealTotals together across every meal in a day, for a
//whole-day total (used by both FoodLog.jsx's daily summary and Home.jsx's dashboard)
export function calculateDailyTotals(dayData) {
  return mealTypes.reduce(
    (totals, meal) => {
      const mealTotal = calculateMealTotals(dayData.meals[meal.id] || []);

      return {
        calories: totals.calories + mealTotal.calories,
        protein: totals.protein + mealTotal.protein,
        carbs: totals.carbs + mealTotal.carbs,
        fat: totals.fat + mealTotal.fat,
        fiber: totals.fiber + mealTotal.fiber,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}
