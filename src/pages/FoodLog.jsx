import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  FaAppleAlt,
  FaBullseye,
  FaCalendarAlt,
  FaChartLine,
  FaDumbbell,
  FaEdit,
  FaFire,
  FaHome,
  FaPlus,
  FaSave,
  FaSearch,
  FaSignOutAlt,
  FaTint,
  FaTrash,
  FaUserCircle,
  FaUtensils,
} from "react-icons/fa";
//function to search food by query, used by the "search online" section below
import { searchFoods } from "../services/foodApi";

//shared with Home.jsx -- see src/utils/foodLog.js for why these live there
//instead of being defined locally in this file
import {
  FOOD_STORAGE_KEY,
  TARGET_STORAGE_KEY,
  mealTypes,
  defaultTargets,
  createEmptyDay,
  createLocalDateValue,
  loadFoodDays,
  loadTargets,
  toNumber,
  calculateFoodNutrition,
  calculateMealTotals,
  calculateDailyTotals,
} from "../utils/foodLog";

import "../foodLog.css";
import "../gymFoodLibrary.css";

//category filter options for the local gym food library below
const foodCategories = [
  "All",
  "Protein",
  "Carbs",
  "Dairy",
  "Fruit",
  "Healthy Fats",
  "Vegetables",
];

//local curated food list (per-100g/per-serving values), separate from the
//live Open Food Facts search -- this is a fixed list, not fetched from anywhere
const suggestedFoods = [
  {
    id: "chicken-breast",
    name: "Chicken Breast",
    category: "Protein",
    servingSize: "100 g cooked",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
  },
  {
    id: "lean-ground-beef",
    name: "Lean Ground Beef",
    category: "Protein",
    servingSize: "100 g cooked",
    calories: 215,
    protein: 26,
    carbs: 0,
    fat: 11,
    fiber: 0,
  },
  {
    id: "whole-egg",
    name: "Whole Egg",
    category: "Protein",
    servingSize: "1 large egg",
    calories: 72,
    protein: 6.3,
    carbs: 0.4,
    fat: 4.8,
    fiber: 0,
  },
  {
    id: "egg-whites",
    name: "Egg Whites",
    category: "Protein",
    servingSize: "100 g",
    calories: 52,
    protein: 11,
    carbs: 0.7,
    fat: 0.2,
    fiber: 0,
  },
  {
    id: "shrimp",
    name: "Shrimp",
    category: "Protein",
    servingSize: "100 g cooked",
    calories: 99,
    protein: 24,
    carbs: 0.2,
    fat: 0.3,
    fiber: 0,
  },
  {
    id: "whey-protein",
    name: "Whey Protein",
    category: "Protein",
    servingSize: "1 scoop",
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 2,
    fiber: 0,
  },
  {
    id: "white-rice",
    name: "White Rice",
    category: "Carbs",
    servingSize: "1 cup cooked",
    calories: 205,
    protein: 4.3,
    carbs: 44.5,
    fat: 0.4,
    fiber: 0.6,
  },
  {
    id: "brown-rice",
    name: "Brown Rice",
    category: "Carbs",
    servingSize: "1 cup cooked",
    calories: 216,
    protein: 5,
    carbs: 44.8,
    fat: 1.8,
    fiber: 3.5,
  },
  {
    id: "oatmeal",
    name: "Oatmeal",
    category: "Carbs",
    servingSize: "40 g dry",
    calories: 150,
    protein: 5,
    carbs: 27,
    fat: 3,
    fiber: 4,
  },
  {
    id: "whole-wheat-bread",
    name: "Whole Wheat Bread",
    category: "Carbs",
    servingSize: "1 slice",
    calories: 90,
    protein: 4,
    carbs: 15,
    fat: 1,
    fiber: 2,
  },
  {
    id: "sweet-potato",
    name: "Sweet Potato",
    category: "Carbs",
    servingSize: "200 g baked",
    calories: 180,
    protein: 4,
    carbs: 41,
    fat: 0.3,
    fiber: 6,
  },
  {
    id: "pasta",
    name: "Pasta",
    category: "Carbs",
    servingSize: "1 cup cooked",
    calories: 220,
    protein: 8,
    carbs: 43,
    fat: 1.3,
    fiber: 2.5,
  },
  {
    id: "tortilla",
    name: "Whole Wheat Tortilla",
    category: "Carbs",
    servingSize: "1 medium",
    calories: 140,
    protein: 4,
    carbs: 24,
    fat: 3.5,
    fiber: 2,
  },
  {
    id: "greek-yogurt",
    name: "Greek Yogurt 0%",
    category: "Dairy",
    servingSize: "170 g",
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0,
    fiber: 0,
  },
  {
    id: "cottage-cheese",
    name: "Cottage Cheese",
    category: "Dairy",
    servingSize: "1/2 cup",
    calories: 90,
    protein: 12,
    carbs: 5,
    fat: 2.5,
    fiber: 0,
  },
  {
    id: "skim-milk",
    name: "Skim Milk",
    category: "Dairy",
    servingSize: "1 cup",
    calories: 83,
    protein: 8.3,
    carbs: 12,
    fat: 0.2,
    fiber: 0,
  },
  {
    id: "banana",
    name: "Banana",
    category: "Fruit",
    servingSize: "1 medium",
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    fiber: 3.1,
  },
  {
    id: "apple",
    name: "Apple",
    category: "Fruit",
    servingSize: "1 medium",
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    fiber: 4.4,
  },
  {
    id: "blueberries",
    name: "Blueberries",
    category: "Fruit",
    servingSize: "1 cup",
    calories: 84,
    protein: 1.1,
    carbs: 21,
    fat: 0.5,
    fiber: 3.6,
  },
  {
    id: "peanut-butter",
    name: "Peanut Butter",
    category: "Healthy Fats",
    servingSize: "2 tablespoons",
    calories: 190,
    protein: 8,
    carbs: 7,
    fat: 16,
    fiber: 2,
  },
  {
    id: "almonds",
    name: "Almonds",
    category: "Healthy Fats",
    servingSize: "28 g",
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    fiber: 3.5,
  },
  {
    id: "avocado",
    name: "Avocado",
    category: "Healthy Fats",
    servingSize: "100 g",
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7,
  },
  {
    id: "broccoli",
    name: "Broccoli",
    category: "Vegetables",
    servingSize: "100 g cooked",
    calories: 35,
    protein: 2.4,
    carbs: 7.2,
    fat: 0.4,
    fiber: 3.3,
  },
  {
    id: "spinach",
    name: "Spinach",
    category: "Vegetables",
    servingSize: "100 g cooked",
    calories: 23,
    protein: 3,
    carbs: 3.8,
    fat: 0.3,
    fiber: 2.4,
  },
];

//blank starting point for the add/edit food form
const emptyFoodForm = {
  name: "",
  meal: "breakfast",
  servingSize: "100 g",
  servings: 1,
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  fiber: "",
};

//generates a unique id for a new food entry, uses randomUUID when the
//browser supports it, otherwise falls back to a timestamp-based id
function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `food-${Date.now()}`;
}

//rounds to one decimal place for display, but drops the decimal entirely
//if the value is a whole number (so "165" instead of "165.0")
function formatValue(value) {
  const rounded = Math.round(value * 10) / 10;

  return Number.isInteger(rounded) ? rounded : rounded.toFixed(1);
}

//how far along a target the current value is, as a percentage capped at 100
//(used for the progress bars), returns 0 if target is missing/invalid instead of dividing by 0
function calculateProgress(current, target) {
  if (!target || target <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((current / target) * 100));
}

function FoodLog({ user }) {
  const navigate = useNavigate();

  //which day's log is currently shown
  const [selectedDate, setSelectedDate] = useState(createLocalDateValue());

  //every day's log, keyed by date string, loaded from localStorage once on mount
  const [foodDays, setFoodDays] = useState(loadFoodDays);

  //nutrition targets, also loaded from localStorage once on mount
  const [targets, setTargets] = useState(loadTargets);

  //current values in the add/edit food form
  const [foodForm, setFoodForm] = useState(emptyFoodForm);

  //the food entry being edited, or null when adding a brand new one
  const [editingFood, setEditingFood] = useState(null);

  const [quickAdd, setQuickAdd] = useState({
    name: "",
    meal: "snacks",
    calories: "",
  });

  //success/validation text shown under the add/edit form
  const [formMessage, setFormMessage] = useState("");

  //search + category filter for the local suggestedFoods list
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");

  //search text for the live Open Food Facts search (separate from the local search above)
  const [apiSearchTerm, setApiSearchTerm] = useState("");

  //results returned from the last Open Food Facts search
  const [apiResults, setApiResults] = useState([]);

  const [isSearching, setIsSearching] = useState(false);

  const [searchError, setSearchError] = useState("");

  const memberName = user?.displayName || "Demo User";

  const memberEmail = user?.email || "demo@fitness.com";

  //today's log, or a blank one if nothing's been logged for this date yet
  const dayData = foodDays[selectedDate] || createEmptyDay();

  //filters suggestedFoods by search text + category, recalculated only when those change
  const filteredFoods = useMemo(() => {
    const cleanedSearch = searchTerm.trim().toLowerCase();

    return suggestedFoods.filter((food) => {
      const matchesCategory =
        selectedCategory === "All" || food.category === selectedCategory;

      const matchesSearch =
        !cleanedSearch || food.name.toLowerCase().includes(cleanedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  //nutrition totals per meal for the selected day
  const mealTotals = useMemo(() => {
    const result = {};

    mealTypes.forEach((meal) => {
      result[meal.id] = calculateMealTotals(dayData.meals[meal.id] || []);
    });

    return result;
  }, [dayData]);

  //adds every meal together into one grand total for the whole day --
  //calculateDailyTotals lives in utils/foodLog.js so Home.jsx can compute
  //the same thing from the same raw dayData
  const dailyTotals = useMemo(() => {
    return calculateDailyTotals(dayData);
  }, [dayData]);

  //persists foodDays/targets to localStorage every time either one changes
  useEffect(() => {
    localStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(foodDays));
  }, [foodDays]);

  useEffect(() => {
    localStorage.setItem(TARGET_STORAGE_KEY, JSON.stringify(targets));
  }, [targets]);

  //helper for updating just the selected day's data without touching other days
  function updateDay(updater) {
    setFoodDays((currentDays) => {
      const currentDay = currentDays[selectedDate] || createEmptyDay();

      return {
        ...currentDays,

        [selectedDate]: updater(currentDay),
      };
    });
  }

  function updateFoodForm(field, value) {
    setFoodForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  //fills the add/edit form from a food clicked in the local suggestedFoods grid
  function loadSuggestedFood(food) {
    setEditingFood(null);

    setFoodForm((current) => ({
      ...current,
      name: food.name,
      servingSize: food.servingSize,
      servings: 1,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
    }));

    setFormMessage(`${food.name} was loaded into the food form.`);

    window.setTimeout(() => {
      document.getElementById("food-entry-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  //same idea as loadSuggestedFood above, but for a result that came back
  //from the Open Food Facts API instead of the local suggestedFoods list.
  //api results don't include a servingSize (values are per 100g), so
  //hardcode "100 g" here instead of reading it off the food object
  function loadApiFood(food) {
    setEditingFood(null);

    setFoodForm((current) => ({
      ...current,
      name: food.name,
      servingSize: "100 g",
      servings: 1,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
    }));

    setFormMessage(`${food.name} was loaded into the food form.`);

    window.setTimeout(() => {
      document.getElementById("food-entry-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  //runs when the "search online" form is submitted. searchFoods() is async
  //(it hits a real api), so it can't live in a useMemo like filteredFoods
  //does above -- it needs to be a real event handler with its own loading
  //and error state instead
  async function handleApiSearch(event) {
    //stop the browser's default full-page form submit/reload
    event.preventDefault();

    setIsSearching(true);
    setSearchError("");

    try {
      const results = await searchFoods(apiSearchTerm);
      setApiResults(results);
    } catch {
      //searchFoods throws on a failed request (bad response status) --
      //catch it here so a network hiccup doesn't crash the page
      setSearchError("Could not search Open Food Facts. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  //clears the form back to blank, keeping whichever meal was selected (or the one passed in)
  function resetFoodForm(meal = "breakfast") {
    setFoodForm({
      ...emptyFoodForm,
      meal,
    });

    setEditingFood(null);
    setFormMessage("");
  }

  //validates + saves the food form, either as a new entry or replacing the one being edited
  function handleSaveFood(event) {
    event.preventDefault();

    const cleanName = foodForm.name.trim();

    if (!cleanName) {
      setFormMessage("Enter a food name.");

      return;
    }

    const newFood = {
      id: editingFood?.id || createId(),

      name: cleanName,

      meal: foodForm.meal,

      servingSize: foodForm.servingSize.trim() || "1 serving",

      servings: Math.max(0.1, toNumber(foodForm.servings)),

      calories: Math.max(0, toNumber(foodForm.calories)),

      protein: Math.max(0, toNumber(foodForm.protein)),

      carbs: Math.max(0, toNumber(foodForm.carbs)),

      fat: Math.max(0, toNumber(foodForm.fat)),

      fiber: Math.max(0, toNumber(foodForm.fiber)),
    };

    updateDay((currentDay) => {
      const updatedMeals = {
        breakfast: [...currentDay.meals.breakfast],

        lunch: [...currentDay.meals.lunch],

        dinner: [...currentDay.meals.dinner],

        snacks: [...currentDay.meals.snacks],
      };

      //if editing, remove the old copy of this food from whichever meal it
      //was in before adding the updated version back in (possibly to a
      //different meal, if the user changed it)
      if (editingFood) {
        mealTypes.forEach((meal) => {
          updatedMeals[meal.id] = updatedMeals[meal.id].filter(
            (food) => food.id !== editingFood.id,
          );
        });
      }

      updatedMeals[newFood.meal].push(newFood);

      return {
        ...currentDay,
        meals: updatedMeals,
      };
    });

    setFormMessage(
      editingFood ? "Food updated successfully." : "Food added successfully.",
    );

    setFoodForm({
      ...emptyFoodForm,
      meal: foodForm.meal,
    });

    setEditingFood(null);
  }

  //loads an already-logged food back into the form for editing
  function handleEditFood(food) {
    setEditingFood(food);

    setFoodForm({
      name: food.name,
      meal: food.meal,
      servingSize: food.servingSize,
      servings: food.servings,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
    });

    setFormMessage("Editing selected food.");

    document.getElementById("food-entry-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleDeleteFood(mealId, foodId) {
    updateDay((currentDay) => ({
      ...currentDay,

      meals: {
        ...currentDay.meals,

        [mealId]: currentDay.meals[mealId].filter((food) => food.id !== foodId),
      },
    }));

    //if the food being deleted is also the one currently loaded in the edit
    //form, clear the form so it's not left pointing at a deleted entry
    if (editingFood?.id === foodId) {
      resetFoodForm(mealId);
    }
  }

  //adds a calories-only entry (no macros) from the quick add panel
  function handleQuickAdd(event) {
    event.preventDefault();

    const calories = toNumber(quickAdd.calories);

    if (calories <= 0) {
      return;
    }

    const quickFood = {
      id: createId(),

      name: quickAdd.name.trim() || "Quick Calories",

      meal: quickAdd.meal,

      servingSize: "1 entry",

      servings: 1,
      calories,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    };

    updateDay((currentDay) => ({
      ...currentDay,

      meals: {
        ...currentDay.meals,

        [quickAdd.meal]: [...currentDay.meals[quickAdd.meal], quickFood],
      },
    }));

    setQuickAdd({
      name: "",
      meal: quickAdd.meal,
      calories: "",
    });
  }

  function addWater(amount) {
    updateDay((currentDay) => ({
      ...currentDay,

      waterMl: currentDay.waterMl + amount,
    }));
  }

  function resetWater() {
    updateDay((currentDay) => ({
      ...currentDay,
      waterMl: 0,
    }));
  }

  function updateTarget(field, value) {
    setTargets((current) => ({
      ...current,

      [field]: Math.max(0, toNumber(value)),
    }));
  }

  //moves selectedDate forward/backward by the given number of days
  function changeDate(days) {
    const currentDate = new Date(`${selectedDate}T12:00:00`);

    currentDate.setDate(currentDate.getDate() + days);

    setSelectedDate(createLocalDateValue(currentDate));
  }

  //remaining amounts for the "daily status" panel, can go negative if over target
  const calorieRemaining = targets.calories - dailyTotals.calories;

  const proteinRemaining = targets.protein - dailyTotals.protein;

  const fiberRemaining = targets.fiber - dailyTotals.fiber;

  return (
    <main className="dashboard-page">
      {/* sidebar nav, same on every dashboard page */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          <div className="dashboard-logo-icon">
            <FaDumbbell />
          </div>

          <div>
            <h2>FITTRACK</h2>

            <span>Fitness System</span>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <button
            type="button"
            className="sidebar-link"
            onClick={() => navigate("/home")}
          >
            <FaHome />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={() => navigate("/workouts")}
          >
            <FaDumbbell />
            <span>Workouts</span>
          </button>

          {/* current page, marked active */}
          <button
            type="button"
            className="sidebar-link active"
            onClick={() => navigate("/food-log")}
          >
            <FaUtensils />
            <span>Food Log</span>
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={() => navigate("/calories")}
          >
            <FaFire />
            <span>Calories</span>
          </button>

          <button type="button" className="sidebar-link">
            <FaChartLine />
            <span>Progress</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <FaUserCircle />

            <div>
              <strong>{memberName}</strong>

              <span>{memberEmail}</span>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={() => navigate("/")}
          >
            <FaSignOutAlt />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <section className="dashboard-content food-log-content">
        <header className="food-log-header">
          <div>
            <p className="food-log-kicker">DAILY NUTRITION TRACKER</p>

            <h1>
              Food Log
              <span>.</span>
            </h1>

            <p>Track meals, calories, macros, fiber and daily water intake.</p>
          </div>

          {/* date picker + prev/next/today buttons, all drive selectedDate */}
          <div className="date-controller">
            <button type="button" onClick={() => changeDate(-1)}>
              ‹
            </button>

            <div>
              <FaCalendarAlt />

              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </div>

            <button type="button" onClick={() => changeDate(1)}>
              ›
            </button>

            <button
              type="button"
              className="today-button"
              onClick={() => setSelectedDate(createLocalDateValue())}
            >
              Today
            </button>
          </div>
        </header>

        {/* local curated food list -- search + category filter over suggestedFoods,
            clicking a card calls loadSuggestedFood to fill the form below */}
        <section className="gym-food-library">
          <div className="gym-food-library-header">
            <div>
              <p>GYM FOOD LIBRARY</p>

              <h2>Popular Fitness Foods</h2>

              <span>
                Select a food to automatically fill in calories and macros.
              </span>
            </div>

            <div className="gym-food-search">
              <FaSearch />

              <input
                type="text"
                placeholder="Search chicken, rice, eggs..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="gym-food-categories">
            {foodCategories.map((category) => (
              <button
                type="button"
                key={category}
                className={selectedCategory === category ? "active" : ""}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredFoods.length === 0 ? (
            <div className="no-suggested-foods">
              <FaSearch />

              <p>No matching foods found.</p>
            </div>
          ) : (
            <div className="gym-food-grid">
              {filteredFoods.map((food) => (
                <article className="gym-food-card" key={food.id}>
                  <div className="gym-food-card-top">
                    <span>{food.category}</span>

                    <strong>{food.calories} kcal</strong>
                  </div>

                  <h3>{food.name}</h3>

                  <p>{food.servingSize}</p>

                  <div className="gym-food-macros">
                    <span>
                      <strong>{food.protein}g</strong>
                      Protein
                    </span>

                    <span>
                      <strong>{food.carbs}g</strong>
                      Carbs
                    </span>

                    <span>
                      <strong>{food.fat}g</strong>
                      Fat
                    </span>
                  </div>

                  <button type="button" onClick={() => loadSuggestedFood(food)}>
                    <FaPlus />
                    Use This Food
                  </button>
                </article>
              ))}
            </div>
          )}

          <p className="gym-food-disclaimer">
            Nutrition values are approximate and may vary by brand, portion and
            cooking method.
          </p>
        </section>

        {/*
          separate section for live Open Food Facts search, kept apart from
          the curated gym-food-library above. reuses the same
          gym-food-search / gym-food-grid / gym-food-card classes so it looks
          consistent, but this list has no category filter (the api doesn't
          return one) and it only ever holds whatever the last search
          returned, not a fixed local list
        */}
        <section className="gym-food-library">
          <div className="gym-food-library-header">
            <div>
              <p>SEARCH ONLINE</p>
              <h2>Open Food Facts Search</h2>
              <span>
                Can't find it above? Search the full Open Food Facts
                database.
              </span>
            </div>

            {/* onSubmit instead of onChange -- searches on button click,
                not on every keystroke, so we're not hitting the api on
                every character typed */}
            <form onSubmit={handleApiSearch} className="gym-food-search">
              <FaSearch />
              <input
                type="text"
                placeholder="Search any food online..."
                value={apiSearchTerm}
                onChange={(event) => setApiSearchTerm(event.target.value)}
              />
              <button type="submit">Search</button>
            </form>
          </div>

          {isSearching && <p>Searching...</p>}

          {searchError && <p className="gym-food-disclaimer">{searchError}</p>}

          {!isSearching && apiResults.length > 0 && (
            <div className="gym-food-grid">
              {/* api results have no stable id like the local list does, so
                  the key is built from name + index instead */}
              {apiResults.map((food, index) => (
                <article className="gym-food-card" key={`${food.name}-${index}`}>
                  <div className="gym-food-card-top">
                    <strong>{food.calories} kcal</strong>
                  </div>

                  <h3>{food.name}</h3>
                  <p>per 100 g</p>

                  <div className="gym-food-macros">
                    <span>
                      <strong>{food.protein}g</strong>
                      Protein
                    </span>

                    <span>
                      <strong>{food.carbs}g</strong>
                      Carbs
                    </span>

                    <span>
                      <strong>{food.fat}g</strong>
                      Fat
                    </span>
                  </div>

                  <button type="button" onClick={() => loadApiFood(food)}>
                    <FaPlus />
                    Use This Food
                  </button>
                </article>
              ))}
            </div>
          )}

          <p className="gym-food-disclaimer">
            Nutrition values come from Open Food Facts and are per 100g --
            they may not match the exact serving you eat.
          </p>
        </section>

        {/* calories/protein/carbs/fat/fiber progress cards for the selected day */}
        <section className="food-summary-grid">
          {[
            {
              label: "Calories",
              current: dailyTotals.calories,
              target: targets.calories,
              unit: "kcal",
              className: "calories-summary",
            },
            {
              label: "Protein",
              current: dailyTotals.protein,
              target: targets.protein,
              unit: "g",
            },
            {
              label: "Carbs",
              current: dailyTotals.carbs,
              target: targets.carbs,
              unit: "g",
            },
            {
              label: "Fat",
              current: dailyTotals.fat,
              target: targets.fat,
              unit: "g",
            },
            {
              label: "Fiber",
              current: dailyTotals.fiber,
              target: targets.fiber,
              unit: "g",
            },
          ].map((item) => (
            <article
              className={`food-summary-card ${item.className || ""}`}
              key={item.label}
            >
              <span>{item.label}</span>

              <strong>
                {formatValue(item.current)}

                <small>
                  {" "}
                  / {item.target} {item.unit}
                </small>
              </strong>

              <div className="food-progress-track">
                <div
                  className="food-progress-fill"
                  style={{
                    width: `${calculateProgress(item.current, item.target)}%`,
                  }}
                />
              </div>
            </article>
          ))}
        </section>

        <section className="food-log-main-grid">
          {/* the add/edit food form -- id used by scrollIntoView calls elsewhere in this file */}
          <article
            className="food-log-panel add-food-panel"
            id="food-entry-form"
          >
            <div className="food-panel-heading">
              <div className="food-panel-icon">
                <FaPlus />
              </div>

              <div>
                <p>{editingFood ? "EDIT FOOD" : "ADD FOOD"}</p>

                <h2>
                  {editingFood ? "Update Food Entry" : "Add Food to Your Day"}
                </h2>
              </div>
            </div>

            <form className="add-food-form" onSubmit={handleSaveFood}>
              <div className="food-form-grid">
                <div className="food-form-field food-name-field">
                  <label htmlFor="foodName">Food Name</label>

                  <input
                    id="foodName"
                    type="text"
                    placeholder="Example: Chicken Breast"
                    value={foodForm.name}
                    onChange={(event) =>
                      updateFoodForm("name", event.target.value)
                    }
                  />
                </div>

                <div className="food-form-field">
                  <label htmlFor="foodMeal">Meal</label>

                  <select
                    id="foodMeal"
                    value={foodForm.meal}
                    onChange={(event) =>
                      updateFoodForm("meal", event.target.value)
                    }
                  >
                    {mealTypes.map((meal) => (
                      <option key={meal.id} value={meal.id}>
                        {meal.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="food-form-field">
                  <label htmlFor="servingSize">Serving Size</label>

                  <input
                    id="servingSize"
                    type="text"
                    value={foodForm.servingSize}
                    onChange={(event) =>
                      updateFoodForm("servingSize", event.target.value)
                    }
                  />
                </div>

                <div className="food-form-field">
                  <label htmlFor="servings">Servings</label>

                  <input
                    id="servings"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={foodForm.servings}
                    onChange={(event) =>
                      updateFoodForm("servings", event.target.value)
                    }
                  />
                </div>

                {/* remaining nutrition fields, built from a list instead of
                    five near-identical <div> blocks */}
                {[
                  {
                    id: "foodCalories",
                    label: "Calories per Serving",
                    field: "calories",
                  },
                  {
                    id: "foodProtein",
                    label: "Protein (g)",
                    field: "protein",
                  },
                  {
                    id: "foodCarbs",
                    label: "Carbs (g)",
                    field: "carbs",
                  },
                  {
                    id: "foodFat",
                    label: "Fat (g)",
                    field: "fat",
                  },
                  {
                    id: "foodFiber",
                    label: "Fiber (g)",
                    field: "fiber",
                  },
                ].map((input) => (
                  <div className="food-form-field" key={input.field}>
                    <label htmlFor={input.id}>{input.label}</label>

                    <input
                      id={input.id}
                      type="number"
                      min="0"
                      step="0.1"
                      value={foodForm[input.field]}
                      onChange={(event) =>
                        updateFoodForm(input.field, event.target.value)
                      }
                    />
                  </div>
                ))}
              </div>

              {formMessage && (
                <p className="food-form-message">{formMessage}</p>
              )}

              <div className="food-form-actions">
                <button
                  type="button"
                  className="food-cancel-button"
                  onClick={() => resetFoodForm(foodForm.meal)}
                >
                  Clear
                </button>

                <button type="submit" className="food-save-button">
                  <FaSave />

                  {editingFood ? "Update Food" : "Add Food"}
                </button>
              </div>
            </form>
          </article>

          <div className="food-log-side-column">
            {/* water tracker */}
            <article className="food-log-panel water-panel">
              <div className="food-panel-heading">
                <div className="food-panel-icon">
                  <FaTint />
                </div>

                <div>
                  <p>WATER</p>
                  <h2>Water Intake</h2>
                </div>
              </div>

              <div className="water-total">
                <strong>{formatValue(dayData.waterMl / 1000)} L</strong>

                <span>/ {formatValue(targets.waterMl / 1000)} L</span>
              </div>

              <div className="food-progress-track large-progress">
                <div
                  className="food-progress-fill"
                  style={{
                    width: `${calculateProgress(
                      dayData.waterMl,
                      targets.waterMl,
                    )}%`,
                  }}
                />
              </div>

              <div className="water-actions">
                <button type="button" onClick={() => addWater(250)}>
                  +250 mL
                </button>

                <button type="button" onClick={() => addWater(500)}>
                  +500 mL
                </button>

                <button type="button" onClick={resetWater}>
                  Reset
                </button>
              </div>
            </article>

            {/* quick add -- logs calories only, no macro breakdown */}
            <article className="food-log-panel quick-add-panel">
              <div className="food-panel-heading">
                <div className="food-panel-icon">
                  <FaFire />
                </div>

                <div>
                  <p>QUICK ADD</p>

                  <h2>Add Calories Only</h2>
                </div>
              </div>

              <form className="quick-add-form" onSubmit={handleQuickAdd}>
                <input
                  type="text"
                  placeholder="Food name"
                  value={quickAdd.name}
                  onChange={(event) =>
                    setQuickAdd((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />

                <select
                  value={quickAdd.meal}
                  onChange={(event) =>
                    setQuickAdd((current) => ({
                      ...current,
                      meal: event.target.value,
                    }))
                  }
                >
                  {mealTypes.map((meal) => (
                    <option key={meal.id} value={meal.id}>
                      {meal.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  placeholder="Calories"
                  value={quickAdd.calories}
                  onChange={(event) =>
                    setQuickAdd((current) => ({
                      ...current,
                      calories: event.target.value,
                    }))
                  }
                />

                <button type="submit">
                  <FaPlus />
                  Quick Add
                </button>
              </form>
            </article>

            {/* remaining calories/protein/fiber for the day, warns (red) if over on calories */}
            <article className="food-log-panel nutrition-status-panel">
              <div className="food-panel-heading">
                <div className="food-panel-icon">
                  <FaAppleAlt />
                </div>

                <div>
                  <p>DAILY STATUS</p>

                  <h2>Nutrition Check</h2>
                </div>
              </div>

              <div className="nutrition-message-list">
                <p className={calorieRemaining < 0 ? "warning" : ""}>
                  {calorieRemaining >= 0
                    ? `${formatValue(calorieRemaining)} calories remaining.`
                    : `${formatValue(
                        Math.abs(calorieRemaining),
                      )} calories over target.`}
                </p>

                <p>
                  {proteinRemaining > 0
                    ? `${formatValue(proteinRemaining)} g protein remaining.`
                    : "Protein target completed."}
                </p>

                <p>
                  {fiberRemaining > 0
                    ? `${formatValue(fiberRemaining)} g fiber remaining.`
                    : "Fiber target completed."}
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* editable nutrition targets, saved to localStorage via the useEffect above */}
        <section className="food-log-panel targets-panel">
          <div className="food-panel-heading">
            <div className="food-panel-icon">
              <FaBullseye />
            </div>

            <div>
              <p>DAILY GOALS</p>

              <h2>Nutrition Targets</h2>
            </div>
          </div>

          <div className="target-input-grid">
            {[
              {
                field: "calories",
                label: "Calories",
              },
              {
                field: "protein",
                label: "Protein (g)",
              },
              {
                field: "carbs",
                label: "Carbs (g)",
              },
              {
                field: "fat",
                label: "Fat (g)",
              },
              {
                field: "fiber",
                label: "Fiber (g)",
              },
              {
                field: "waterMl",
                label: "Water (mL)",
              },
            ].map((target) => (
              <label key={target.field}>
                <span>{target.label}</span>

                <input
                  type="number"
                  value={targets[target.field]}
                  onChange={(event) =>
                    updateTarget(target.field, event.target.value)
                  }
                />
              </label>
            ))}

            <button type="button" onClick={() => setTargets(defaultTargets)}>
              Reset Targets
            </button>
          </div>
        </section>

        {/* one card per meal, listing every food logged to it for the selected day */}
        <section className="meal-section-grid">
          {mealTypes.map((meal) => {
            const foods = dayData.meals[meal.id] || [];

            const totals = mealTotals[meal.id];

            return (
              <article className="meal-card" key={meal.id}>
                <div className="meal-card-header">
                  <div>
                    <p>{meal.description}</p>

                    <h2>{meal.name}</h2>
                  </div>

                  <strong>{formatValue(totals.calories)} kcal</strong>
                </div>

                {foods.length === 0 ? (
                  <div className="empty-meal">
                    <FaUtensils />

                    <p>No food added to this meal.</p>
                  </div>
                ) : (
                  <div className="meal-food-list">
                    {foods.map((food) => {
                      const nutrition = calculateFoodNutrition(food);

                      return (
                        <div className="meal-food-item" key={food.id}>
                          <div className="meal-food-main">
                            <strong>{food.name}</strong>

                            <span>
                              {food.servings}
                              {" × "}
                              {food.servingSize}
                            </span>

                            <small>
                              {formatValue(nutrition.protein)}g protein ·{" "}
                              {formatValue(nutrition.carbs)}g carbs ·{" "}
                              {formatValue(nutrition.fat)}g fat
                            </small>
                          </div>

                          <div className="meal-food-actions">
                            <strong>
                              {formatValue(nutrition.calories)} kcal
                            </strong>

                            <button
                              type="button"
                              onClick={() => handleEditFood(food)}
                            >
                              <FaEdit />
                            </button>

                            <button
                              type="button"
                              className="delete-food-button"
                              onClick={() => handleDeleteFood(meal.id, food.id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  type="button"
                  className="meal-add-button"
                  onClick={() => {
                    resetFoodForm(meal.id);

                    document.getElementById("food-entry-form")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  <FaPlus />
                  Add Food
                </button>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}

export default FoodLog;
