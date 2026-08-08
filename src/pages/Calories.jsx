import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  FaBreadSlice,
  FaBullseye,
  FaCalculator,
  FaChartLine,
  FaDumbbell,
  FaFire,
  FaHeartbeat,
  FaHome,
  FaInfoCircle,
  FaLeaf,
  FaRulerVertical,
  FaRunning,
  FaSignOutAlt,
  FaTint,
  FaUserCircle,
  FaUtensils,
  FaWeight,
} from "react-icons/fa";

import "../calories.css";

//import the functions from calculations.js
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  GOAL_ADJUSTMENTS,
} from "../utils/calculations";

//persists the weight field so Home.jsx can show it as the last recorded body weight
import { loadLastWeight, saveLastWeight } from "../utils/profile";

//list of activity levels for the dropdown
//key matches the ACTIVITY_MULTIPLIERS keys in calculations.js, value is only
//used for display/legacy reasons, key is what actually gets sent to calculateTDEE
const activityLevels = [
  {
    key: "sedentary",
    value: 1.2,
    label: "Sedentary",
    description: "Little exercise or mostly seated work",
  },
  {
    key: "light",
    value: 1.375,
    label: "Lightly Active",
    description: "Exercise 1–3 days per week",
  },
  {
    key: "moderate",
    value: 1.55,
    label: "Moderately Active",
    description: "Exercise 3–5 days per week",
  },
  {
    key: "active",
    value: 1.725,
    label: "Very Active",
    description: "Hard exercise 6–7 days per week",
  },
  {
    key: "veryActive",
    value: 1.9,
    label: "Extremely Active",
    description: "Very hard training or physical work",
  },
];

//display info + macro settings for each fitness goal
//the actual calorie adjustment percentage lives in GOAL_ADJUSTMENTS
//(calculations.js), not here, so there's only one source of truth for it
const goalProfiles = {
  maintenance: {
    name: "Maintenance",
    badge: "Maintain Weight",
    proteinPerKg: 1.6,
    fatPercentage: 0.25,
    description: "Maintain your weight while supporting training and recovery.",
  },

  cutting: {
    name: "Cutting",
    badge: "Fat-Loss Phase",
    proteinPerKg: 2.2,
    fatPercentage: 0.25,
    description: "Reduce body fat while helping maintain muscle mass.",
  },

  recomp: {
    name: "Body Recomposition",
    badge: "Muscle Gain and Fat Loss",
    proteinPerKg: 2,
    fatPercentage: 0.25,
    description:
      "Use high protein and a small calorie deficit to support recomposition.",
  },

  bulking: {
    name: "Bulking",
    badge: "Calorie Surplus",
    proteinPerKg: 1.6,
    fatPercentage: 0.25,
    description: "Use a calorie surplus to support weight and muscle gain.",
  },
};

//rounds a calorie number to the nearest 10, just for cleaner display
function roundToNearestTen(value) {
  return Math.round(value / 10) * 10;
}

//formats a number with thousands separators (e.g. 2400 -> "2,400")
function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function Calories({ user }) {
  const navigate = useNavigate();

  //form inputs, all controlled state
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState(22);
  const [height, setHeight] = useState(176);
  //loaded from localStorage so it survives a page refresh/revisit, and so
  //Home.jsx can show it as the last recorded body weight
  const [weight, setWeight] = useState(loadLastWeight);
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState("cutting");

  //saves weight to localStorage every time it changes, so Home.jsx always
  //has the latest value without this page needing to push it anywhere directly
  useEffect(() => {
    saveLastWeight(weight);
  }, [weight]);

  const memberName = user?.displayName || "Demo User";

  const memberEmail = user?.email || "demo@fitness.com";

  //looks up the full activityLevels entry for the description text under the dropdown
  const selectedActivity = activityLevels.find((item) => item.key === activity);

  //recalculates bmr/tdee/target calories/macros whenever an input changes
  //wrapped in try/catch since calculateBMR etc. throw on invalid input (e.g.
  //while the user is mid-typing and a field is temporarily empty/0) -- that
  //should show the "invalid" state below, not crash the page
  const results = useMemo(() => {
    try {
      const bmr = calculateBMR({
        weight: Number(weight),
        height: Number(height),
        age: Number(age),
        gender,
        unitSystem: "metric",
      });

      const tdee = calculateTDEE(bmr, activity);

      const targetCalories = roundToNearestTen(
        calculateTargetCalories({
          weight: Number(weight),
          height: Number(height),
          age: Number(age),
          gender,
          unitSystem: "metric",
          activityLevel: activity,
          goal,
        }),
      );

      const selectedGoal = goalProfiles[goal];
      const numericWeight = Number(weight);

      //protein target from goal's g-per-kg setting
      const protein = Math.round(numericWeight * selectedGoal.proteinPerKg);
      //fat target as a percentage of total calories, converted from kcal to grams (9 kcal/g)
      const fat = Math.round((targetCalories * selectedGoal.fatPercentage) / 9);
      const proteinCalories = protein * 4;
      const fatCalories = fat * 9;
      //whatever calories are left after protein/fat go to carbs
      const remainingCalories = Math.max(
        0,
        targetCalories - proteinCalories - fatCalories,
      );

      const carbs = Math.round(remainingCalories / 4);
      //rough fiber estimate: 14g per 1000 kcal
      const fiber = Math.round((targetCalories / 1000) * 14);
      //rough water estimate: 35ml per kg of bodyweight
      const waterLitres = Number(((numericWeight * 35) / 1000).toFixed(1));
      //how far the target is from maintenance calories (negative = deficit)
      const calorieDifference = Math.round(targetCalories - tdee);

      return {
        bmr: Math.round(bmr),
        tdee: roundToNearestTen(tdee),
        targetCalories,
        protein,
        carbs,
        fat,
        fiber,
        waterLitres,
        sodium: 2300,
        potassium: 3400,
        calorieDifference,
        selectedGoal,
      };
    } catch {
      //invalid input (age/height/weight <= 0, etc) -- results panel shows
      //the "Enter valid information" message instead
      return null;
    }
  }, [age, height, weight, activity, gender, goal]);

  //puts every input back to its starting value
  function resetCalculator() {
    setGender("male");
    setAge(22);
    setHeight(176);
    setWeight(77);
    setActivity("moderate");
    setGoal("cutting");
  }

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

          <button type="button" className="sidebar-link">
            <FaUtensils />
            <span>Food Log</span>
          </button>

          {/* current page, marked active */}
          <button
            type="button"
            className="sidebar-link active"
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

      <section className="dashboard-content calories-content">
        <header className="calories-header">
          <div>
            <p className="calories-kicker">ENERGY AND MACRO PLANNER</p>

            <h1>
              Calories Calculator
              <span>.</span>
            </h1>

            <p>
              Estimate your BMR, TDEE, calorie target, macros and daily
              nutrition needs.
            </p>
          </div>

          <button
            type="button"
            className="calories-reset-button"
            onClick={resetCalculator}
          >
            Reset Calculator
          </button>
        </header>

        <section className="calculator-layout">
          {/* left panel: all the user's inputs */}
          <article className="calculator-panel">
            <div className="calculator-panel-heading">
              <div className="calculator-heading-icon">
                <FaCalculator />
              </div>

              <div>
                <p>PERSONAL DETAILS</p>

                <h2>Calculate Your Needs</h2>
              </div>
            </div>

            <div className="calculator-form-grid">
              {/* gender toggle, feeds the +5/-161 constant in calculateBMR */}
              <div className="calculator-field full-width-field">
                <label>Gender</label>

                <div className="gender-selector">
                  <button
                    type="button"
                    className={
                      gender === "male"
                        ? "gender-button active"
                        : "gender-button"
                    }
                    onClick={() => setGender("male")}
                  >
                    Male
                  </button>

                  <button
                    type="button"
                    className={
                      gender === "female"
                        ? "gender-button active"
                        : "gender-button"
                    }
                    onClick={() => setGender("female")}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div className="calculator-field">
                <label htmlFor="age">Age</label>

                <div className="calculator-input-box">
                  <FaHeartbeat />

                  <input
                    id="age"
                    type="number"
                    min="14"
                    max="100"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                  />

                  <span>years</span>
                </div>
              </div>

              <div className="calculator-field">
                <label htmlFor="weight">Weight</label>

                <div className="calculator-input-box">
                  <FaWeight />

                  <input
                    id="weight"
                    type="number"
                    min="30"
                    max="300"
                    step="0.1"
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
                  />

                  <span>kg</span>
                </div>
              </div>

              <div className="calculator-field full-width-field">
                <label htmlFor="height">Height</label>

                <div className="calculator-input-box">
                  <FaRulerVertical />

                  <input
                    id="height"
                    type="number"
                    min="120"
                    max="230"
                    value={height}
                    onChange={(event) => setHeight(event.target.value)}
                  />

                  <span>cm</span>
                </div>
              </div>

              {/* value stored here is the activity KEY (e.g. "moderate"), not
                  the numeric multiplier -- calculateTDEE needs the key */}
              <div className="calculator-field full-width-field">
                <label htmlFor="activity">Activity Level</label>

                <select
                  id="activity"
                  value={activity}
                  onChange={(event) => setActivity(event.target.value)}
                >
                  {activityLevels.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="activity-description full-width-field">
                <FaRunning />

                <span>{selectedActivity?.description}</span>
              </div>
            </div>

            {/* goal cards -- clicking one sets `goal`, which drives both the
                calorie adjustment (via GOAL_ADJUSTMENTS) and the macro split
                (via goalProfiles) */}
            <div className="goal-section">
              <div className="goal-section-heading">
                <FaBullseye />

                <div>
                  <p>FITNESS GOAL</p>

                  <h3>Select Your Goal</h3>
                </div>
              </div>

              <div className="goal-grid">
                {Object.entries(goalProfiles).map(([goalKey, profile]) => (
                  <button
                    type="button"
                    key={goalKey}
                    className={
                      goal === goalKey ? "goal-card active" : "goal-card"
                    }
                    onClick={() => setGoal(goalKey)}
                  >
                    <strong>{profile.name}</strong>

                    <span>{profile.badge}</span>

                    {/* pulls the adjustment % straight from GOAL_ADJUSTMENTS
                        so this label can never drift out of sync with the
                        actual math in calculateTargetCalories */}
                    <small>
                      {GOAL_ADJUSTMENTS[goalKey] === 0
                        ? "No calorie adjustment"
                        : `${Math.abs(GOAL_ADJUSTMENTS[goalKey] * 100)}% ${
                            GOAL_ADJUSTMENTS[goalKey] < 0
                              ? "deficit"
                              : "surplus"
                          }`}
                    </small>
                  </button>
                ))}
              </div>
            </div>
          </article>

          {/* right panel: the calculated results, or an error state if
              results is null (invalid input) */}
          <article className="calculator-panel">
            <div className="calculator-panel-heading">
              <div className="calculator-heading-icon">
                <FaHeartbeat />
              </div>

              <div>
                <p>YOUR ESTIMATES</p>

                <h2>Daily Nutrition Targets</h2>
              </div>
            </div>

            {results ? (
              <>
                <div className="energy-result-grid">
                  <div className="energy-result-card">
                    <span>BMR</span>

                    <strong>{formatNumber(results.bmr)}</strong>

                    <small>kcal/day at rest</small>
                  </div>

                  <div className="energy-result-card">
                    <span>TDEE</span>

                    <strong>{formatNumber(results.tdee)}</strong>

                    <small>maintenance calories</small>
                  </div>

                  <div className="energy-result-card target-card">
                    <span>DAILY TARGET</span>

                    <strong>{formatNumber(results.targetCalories)}</strong>

                    <small>
                      {results.calorieDifference > 0
                        ? `+${formatNumber(
                            results.calorieDifference,
                          )} kcal surplus`
                        : results.calorieDifference < 0
                          ? `${formatNumber(
                              results.calorieDifference,
                            )} kcal deficit`
                          : "maintenance intake"}
                    </small>
                  </div>
                </div>

                <div className="selected-goal-summary">
                  <div>
                    <span>{results.selectedGoal.badge}</span>

                    <h3>{results.selectedGoal.name}</h3>
                  </div>

                  <p>{results.selectedGoal.description}</p>
                </div>

                <div className="nutrition-section-heading">
                  <div>
                    <p>MACRONUTRIENTS</p>

                    <h3>Daily Macro Targets</h3>
                  </div>
                </div>

                <div className="macro-result-grid">
                  <div className="macro-result-card">
                    <div className="macro-result-icon">
                      <FaDumbbell />
                    </div>

                    <span>Protein</span>

                    <strong>{results.protein} g</strong>

                    <small>{results.selectedGoal.proteinPerKg} g per kg</small>
                  </div>

                  <div className="macro-result-card">
                    <div className="macro-result-icon">
                      <FaBreadSlice />
                    </div>

                    <span>Carbohydrates</span>

                    <strong>{results.carbs} g</strong>

                    <small>training fuel</small>
                  </div>

                  <div className="macro-result-card">
                    <div className="macro-result-icon">
                      <FaTint />
                    </div>

                    <span>Fat</span>

                    <strong>{results.fat} g</strong>

                    <small>25% of calories</small>
                  </div>
                </div>

                <div className="nutrition-section-heading">
                  <div>
                    <p>DAILY ESSENTIALS</p>

                    <h3>Nutrition Support</h3>
                  </div>
                </div>

                <div className="essential-grid">
                  <div className="essential-card">
                    <FaLeaf />

                    <div>
                      <span>Fiber</span>

                      <strong>{results.fiber} g</strong>
                    </div>
                  </div>

                  <div className="essential-card">
                    <FaTint />

                    <div>
                      <span>Water</span>

                      <strong>{results.waterLitres} L</strong>
                    </div>
                  </div>

                  <div className="essential-card">
                    <FaInfoCircle />

                    <div>
                      <span>Sodium Limit</span>

                      <strong>{formatNumber(results.sodium)} mg</strong>
                    </div>
                  </div>

                  <div className="essential-card">
                    <FaHeartbeat />

                    <div>
                      <span>Potassium</span>

                      <strong>{formatNumber(results.potassium)} mg</strong>
                    </div>
                  </div>
                </div>

                <div className="calculator-note">
                  <FaInfoCircle />

                  <p>
                    These values are estimates. Monitor your body weight and gym
                    performance, then adjust calories based on actual progress.
                  </p>
                </div>
              </>
            ) : (
              //shown when results is null, i.e. calculateBMR/TDEE/TargetCalories threw
              <div className="invalid-result">
                <FaCalculator />

                <h3>Enter valid information</h3>

                <p>Age, height and weight must be greater than zero.</p>
              </div>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}

export default Calories;
