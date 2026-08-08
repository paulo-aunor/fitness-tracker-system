import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  FaBolt,
  FaCalendarAlt,
  FaChartLine,
  FaDumbbell,
  FaFire,
  FaHome,
  FaPlus,
  FaSignOutAlt,
  FaUserCircle,
  FaUtensils,
} from "react-icons/fa";

//reads the same food log data FoodLog.jsx writes to localStorage
import {
  createLocalDateValue,
  createEmptyDay,
  loadFoodDays,
  loadTargets,
  calculateDailyTotals,
} from "../utils/foodLog";

//reads the weight last entered on the Calories page
import { loadLastWeight } from "../utils/profile";

//reads saved workouts from Firestore, same function Workout.jsx uses to build its history list
import { getWorkouts } from "../services/firestoreService";

//how far along a target the current value is, as a percentage capped at 100
function calculateProgress(current, target) {
  if (!target || target <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((current / target) * 100));
}

//true if the given ISO date string falls within the current calendar week (Sunday - Saturday)
function isInCurrentWeek(isoDateString) {
  const date = new Date(isoDateString);
  const now = new Date();

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return date >= startOfWeek && date < endOfWeek;
}

function Home({ user }) {
  const navigate = useNavigate();

  const memberName = user?.displayName || "Demo User";

  const memberEmail = user?.email || "demo@fitness.com";

  //today's food log + targets, read once on mount (same localStorage keys FoodLog.jsx uses)
  const [foodDays] = useState(loadFoodDays);

  const [targets] = useState(loadTargets);

  //last weight entered on the Calories page
  const [lastWeight] = useState(loadLastWeight);

  //workouts saved to Firestore, loaded on mount the same way Workout.jsx does
  const [savedWorkouts, setSavedWorkouts] = useState([]);

  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(true);

  const [workoutsError, setWorkoutsError] = useState("");

  useEffect(() => {
    async function loadWorkouts() {
      try {
        const workouts = await getWorkouts();

        const sortedWorkouts = [...workouts].sort(
          (a, b) => new Date(b.loggedAt) - new Date(a.loggedAt),
        );

        setSavedWorkouts(sortedWorkouts);
      } catch {
        setWorkoutsError("Could not load your workouts.");
      } finally {
        setIsLoadingWorkouts(false);
      }
    }

    loadWorkouts();
  }, []);

  //today's nutrition totals, derived from the same data FoodLog.jsx writes
  const todayTotals = useMemo(() => {
    const todayData = foodDays[createLocalDateValue()] || createEmptyDay();

    return calculateDailyTotals(todayData);
  }, [foodDays]);

  const calorieRemaining = targets.calories - todayTotals.calories;

  const proteinRemaining = targets.protein - todayTotals.protein;

  const caloriePercent = calculateProgress(
    todayTotals.calories,
    targets.calories,
  );

  const proteinPercent = calculateProgress(
    todayTotals.protein,
    targets.protein,
  );

  //how many saved workouts fall in the current calendar week
  const workoutsThisWeek = useMemo(() => {
    return savedWorkouts.filter((workout) => isInCurrentWeek(workout.loggedAt))
      .length;
  }, [savedWorkouts]);

  //most recently saved workout, used by the "Last Workout" panel below
  const lastWorkout = savedWorkouts[0] || null;

  function handleLogout() {
    navigate("/");
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
            className="sidebar-link active"
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

          <button
            type="button"
            className="sidebar-link"
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

          <button
            type="button"
            className="sidebar-link"
            onClick={() => navigate("/progress")}
          >
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
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-label">TODAY&apos;S OVERVIEW</p>

            <h1>
              Welcome back, {memberName}
              <span>.</span>
            </h1>

            <p>Stay consistent. Every workout counts.</p>
          </div>

          <button
            type="button"
            className="quick-add-button"
            onClick={() => navigate("/workouts")}
          >
            <FaPlus />
            Quick Add
          </button>
        </header>

        <section className="stats-grid">
          {/* today's calories vs target, from FoodLog.jsx's localStorage data */}
          <article
            className="stat-card"
            onClick={() => navigate("/calories")}
          >
            <div className="stat-card-top">
              <div className="stat-icon">
                <FaFire />
              </div>

              <span>DAILY CALORIES</span>
            </div>

            <h2>
              {Math.round(todayTotals.calories)}
              <small> / {targets.calories} kcal</small>
            </h2>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>

            <p>
              {calorieRemaining >= 0
                ? `${Math.round(calorieRemaining)} calories remaining`
                : `${Math.round(Math.abs(calorieRemaining))} calories over target`}
            </p>
          </article>

          <article className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <FaBolt />
              </div>

              <span>PROTEIN</span>
            </div>

            <h2>
              {Math.round(todayTotals.protein)}g
              <small> / {targets.protein}g</small>
            </h2>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>

            <p>
              {proteinRemaining > 0
                ? `${Math.round(proteinRemaining)}g protein remaining`
                : "Protein target completed"}
            </p>
          </article>

          {/* workout count for the current calendar week, from Firestore via getWorkouts() */}
          <article
            className="stat-card"
            onClick={() => navigate("/workouts")}
          >
            <div className="stat-card-top">
              <div className="stat-icon">
                <FaDumbbell />
              </div>

              <span>WORKOUTS</span>
            </div>

            <h2>{isLoadingWorkouts ? "..." : workoutsThisWeek}</h2>

            <p>
              {isLoadingWorkouts
                ? "Loading..."
                : workoutsThisWeek === 1
                  ? "1 workout logged this week"
                  : `${workoutsThisWeek} workouts logged this week`}
            </p>
          </article>

          {/* last weight entered on the Calories page -- no history is tracked,
              so this is a single "last recorded" value, not a trend */}
          <article className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <FaChartLine />
              </div>

              <span>BODY WEIGHT</span>
            </div>

            <h2>
              {lastWeight}
              <small> kg</small>
            </h2>

            <p>Last recorded on the Calories page</p>
          </article>
        </section>

        <section className="dashboard-main-grid">
          <article className="dashboard-panel">
            <div className="panel-header">
              <div>
                <p>DAILY NUTRITION</p>
                <h2>Calorie Progress</h2>
              </div>

              <button
                type="button"
                className="text-button"
                onClick={() => navigate("/calories")}
              >
                View Details
              </button>
            </div>

            <div className="calorie-content">
              <div className="calorie-ring">
                <div className="calorie-ring-center">
                  <strong>{caloriePercent}%</strong>
                  <span>Completed</span>
                </div>
              </div>

              <div className="macro-list">
                <div className="macro-item">
                  <div>
                    <span className="macro-dot protein" />
                    <p>Protein</p>
                  </div>

                  <strong>
                    {Math.round(todayTotals.protein)}g / {targets.protein}g
                  </strong>
                </div>

                <div className="macro-item">
                  <div>
                    <span className="macro-dot carbs" />
                    <p>Carbohydrates</p>
                  </div>

                  <strong>
                    {Math.round(todayTotals.carbs)}g / {targets.carbs}g
                  </strong>
                </div>

                <div className="macro-item">
                  <div>
                    <span className="macro-dot fat" />
                    <p>Fat</p>
                  </div>

                  <strong>
                    {Math.round(todayTotals.fat)}g / {targets.fat}g
                  </strong>
                </div>
              </div>
            </div>
          </article>

          {/* most recently saved workout from Firestore, instead of a fictional
              upcoming/planned session (nothing in the app tracks scheduled workouts) */}
          <article className="dashboard-panel">
            <div className="panel-header">
              <div>
                <p>LAST WORKOUT</p>
                <h2>{lastWorkout ? "Recent Session" : "No Workouts Yet"}</h2>
              </div>

              <div className="panel-icon">
                <FaCalendarAlt />
              </div>
            </div>

            {workoutsError && <p className="warning">{workoutsError}</p>}

            {isLoadingWorkouts ? (
              <p>Loading your workout history...</p>
            ) : lastWorkout ? (
              <>
                <div className="workout-time">
                  <FaBolt />

                  <div>
                    <strong>
                      {new Date(lastWorkout.loggedAt).toLocaleDateString()}
                    </strong>

                    <span>{lastWorkout.totalSets} total sets</span>
                  </div>
                </div>

                <div className="exercise-list">
                  {lastWorkout.exercises.slice(0, 3).map((exercise, index) => (
                    <div className="exercise-item" key={`${exercise.name}-${index}`}>
                      <span>{String(index + 1).padStart(2, "0")}</span>

                      <div>
                        <strong>{exercise.name}</strong>

                        <p>
                          {exercise.sets} sets × {exercise.reps} reps
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>Save a workout on the Workouts page to see it here.</p>
            )}

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/workouts")}
            >
              <FaDumbbell />
              {lastWorkout ? "Log Another Workout" : "Start Workout"}
            </button>
          </article>
        </section>

        <section className="quick-actions-section">
          <div className="section-title">
            <p>QUICK ACCESS</p>

            <h2>What do you want to track?</h2>
          </div>

          <div className="quick-actions-grid">
            <button
              type="button"
              className="action-card"
              onClick={() => navigate("/workouts")}
            >
              <div className="action-icon">
                <FaDumbbell />
              </div>

              <div>
                <strong>Log Workout</strong>

                <span>Add exercises, sets and reps</span>
              </div>

              <FaPlus className="action-plus" />
            </button>

            <button
              type="button"
              className="action-card"
              onClick={() => navigate("/food-log")}
            >
              <div className="action-icon">
                <FaUtensils />
              </div>

              <div>
                <strong>Log Food</strong>

                <span>Add meals and nutrition data</span>
              </div>

              <FaPlus className="action-plus" />
            </button>

            <button
              type="button"
              className="action-card"
              onClick={() => navigate("/calories")}
            >
              <div className="action-icon">
                <FaFire />
              </div>

              <div>
                <strong>Calculate Calories</strong>

                <span>Calculate TDEE and macros</span>
              </div>

              <FaPlus className="action-plus" />
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

export default Home;
