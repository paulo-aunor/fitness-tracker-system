import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getWorkouts, addWeightLog, getWeightLogs, getDailyNutrition } from "../services/firestoreService";

//real, editable nutrition targets (same source FoodLog.jsx reads/writes) --
//replaces the hardcoded goal numbers this page used to have
import { loadTargets } from "../utils/foodLog";

import {
  FaArrowDown,
  FaArrowUp,
  FaBolt,
  FaCalendarAlt,
  FaChartLine,
  FaDumbbell,
  FaFire,
  FaPlus,
  FaUtensils,
} from "react-icons/fa";

function Home({ user }) {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);

    const memberName =
        user?.displayName || "Demo User";

    // this will hold the list of weight entries from the database
    const [weightLogs, setWeightLogs] = useState([]);

    // this holds whatever number the user types into the input box
    const [newWeight, setNewWeight] = useState("");

    // this is true while we are saving, so we can disable the button
    const [savingWeight, setSavingWeight] = useState(false);
    const [nutrition, setNutrition] = useState(null);

    // real targets from the Food Log page (localStorage-backed, editable
    // there), loaded once on mount -- not hardcoded
    const [targets] = useState(loadTargets);

    const caloriesEaten = nutrition?.calories ?? 0;
    const proteinEaten = nutrition?.protein ?? 0;
    const carbsEaten = nutrition?.carbs ?? 0;
    const fatEaten = nutrition?.fat ?? 0;

    const calorieGoal = targets.calories;
    const proteinGoal = targets.protein;
    const carbsGoal = targets.carbs;
    const fatGoal = targets.fat;

    const caloriesRemaining = calorieGoal - caloriesEaten;
    const proteinRemaining = proteinGoal - proteinEaten;

    const caloriePercent = Math.min((caloriesEaten / calorieGoal) * 100, 100);
    const proteinPercent = Math.min((proteinEaten / proteinGoal) * 100, 100);


    useEffect(() => {
        if (!user?.uid) return;

        async function loadNutrition() {
            try {
                const today = new Date().toISOString().split("T")[0];
                const data = await getDailyNutrition(user.uid, today);
                setNutrition(data);
            } catch {
                setNutrition(null);
            }
        }

        loadNutrition();
    }, [user]);

    // this runs once when the page loads (and again if "user" changes)
    useEffect(() => {
        // if there is no logged in user yet, do nothing
        if (!user?.uid) return;

        // this function asks the database for this user's weight history
        async function loadWeight() {
            try {
                const data = await getWeightLogs(user.uid);
                setWeightLogs(data);
            } catch {
                // if something goes wrong, just show an empty list
                setWeightLogs([]);
            }
        }

        loadWeight();
    }, [user]);

    useEffect(() => {
        if (!user?.uid) return;

        async function loadStats() {
            try {
                const data = await getWorkouts(user.uid);
                setWorkouts(data);
            } catch {
                setWorkouts([]);
            } finally {
                setLoadingStats(false);
            }
        }

        loadStats();
    }, [user]);

    // count workouts logged in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const workoutsThisWeek = workouts.filter(
        (w) => new Date(w.loggedAt) >= oneWeekAgo
    ).length;

    // workouts sorted newest first, so we can show the most recent one below
    const sortedWorkouts = [...workouts].sort(
        (a, b) => new Date(b.loggedAt) - new Date(a.loggedAt)
    );
    const lastWorkout = sortedWorkouts[0] || null;

    // the most recent weight is the first item in the sorted list
    // if the list is empty, we use null instead
    let latestWeight = null;
    if (weightLogs.length > 0) {
        latestWeight = weightLogs[0].weight;
    }

    // find an entry from about a month ago, so we can compare
    let oldWeight = null;
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    for (const log of weightLogs) {
        if (new Date(log.date) <= oneMonthAgo) {
            oldWeight = log.weight;
            break; // stop as soon as we find one
        }
    }

    // calculate the change, only if we have both numbers -- split into a
    // direction ("down"/"up"/null) and an amount so the JSX can show a
    // colored arrow icon instead of a plain text character (same pattern
    // Progress.jsx uses for its own weight-change indicator)
    let weightChangeDirection = null;
    let weightChangeAmount = null;
    if (latestWeight !== null && oldWeight !== null) {
        const difference = (latestWeight - oldWeight).toFixed(1);
        weightChangeDirection = difference <= 0 ? "down" : "up";
        weightChangeAmount = Math.abs(difference);
    }
    // this runs when the user clicks the "Log" button
    async function handleLogWeight() {
        // turn the text input into a number
        const value = parseFloat(newWeight);

        // stop if the input is empty, not a number, or zero/negative
        if (!value || value <= 0) {
            return;
        }

        setSavingWeight(true);

        try {
            // save the new weight to the database
            await addWeightLog({
                userId: user.uid,
                weight: value,
                date: new Date().toISOString()
            });

            // after saving, get the updated list so the UI shows the new entry
            const updated = await getWeightLogs(user.uid);
            setWeightLogs(updated);

            // clear the input box
            setNewWeight("");
        } catch (error) {
            console.log("Could not save weight:", error);
        } finally {
            setSavingWeight(false);
        }
    }

    return (
        <main className="dashboard-page">
            <Sidebar user={user} active="dashboard" />

            <section className="dashboard-content">
                <header className="dashboard-header">
                    <div>
                        <p className="dashboard-label">
                            TODAY&apos;S OVERVIEW
                        </p>

                        <h1>
                            Welcome back, {memberName}
                            <span>.</span>
                        </h1>

                        <p>
                            Stay consistent. Every workout counts.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="quick-add-button"
                        onClick={() =>
                            navigate("/workouts")
                        }
                    >
                        <FaPlus />
                        Quick Add
                    </button>
                </header>

                <section className="stats-grid">
                    <article
                        className="stat-card"
                        onClick={() =>
                            navigate("/calories")
                        }
                    >
                        <div className="stat-card-top">
                            <div className="stat-icon">
                                <FaFire />
                            </div>

                            <span>DAILY CALORIES</span>
                        </div>

                        <h2>
                            {caloriesEaten}
                            <small> / {calorieGoal} kcal</small>
                        </h2>

                        <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${caloriePercent}%` }} />
                        </div>

                        <p>{caloriesRemaining} calories remaining</p>
                    </article>

                    <article className="stat-card">
                        <div className="stat-card-top">
                            <div className="stat-icon">
                                <FaBolt />
                            </div>

                            <span>PROTEIN</span>
                        </div>

                        <h2>
                            {proteinEaten}g
                            <small> / {proteinGoal}g</small>
                        </h2>

                        <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${proteinPercent}%` }} />
                        </div>

                        <p>{proteinRemaining}g protein remaining</p>
                    </article>

                    <article
                        className="stat-card"
                        onClick={() =>
                            navigate("/workouts")
                        }
                    >
                        <div className="stat-card-top">
                            <div className="stat-icon">
                                <FaDumbbell />
                            </div>

                            <span>WORKOUTS</span>
                        </div>

                        <h2>{loadingStats ? "…" : workoutsThisWeek}</h2>

                        {/* no weekly workout goal exists anywhere in the app, so this
                            just reports the count -- no invented "/5" quota */}
                        <p>
                            {loadingStats
                                ? "Loading..."
                                : workoutsThisWeek === 1
                                  ? "1 workout logged this week"
                                  : `${workoutsThisWeek} workouts logged this week`}
                        </p>
                    </article>

                    <article className="stat-card">
                        <div className="stat-card-top">
                            <div className="stat-icon">
                                <FaChartLine />
                            </div>

                            <span>BODY WEIGHT</span>
                        </div>

                        <h2>
                            {latestWeight === null ? "—" : latestWeight}
                            <small> kg</small>
                        </h2>

                        <div
                            className={
                                weightChangeDirection
                                    ? `weight-change ${weightChangeDirection}`
                                    : "weight-change"
                            }
                        >
                            {weightChangeDirection === "down" && <FaArrowDown />}
                            {weightChangeDirection === "up" && <FaArrowUp />}
                            <span>
                                {weightChangeDirection
                                    ? `${weightChangeAmount} kg this month`
                                    : "No history yet"}
                            </span>
                        </div>

                        <div className="weight-log-form">
                            <input
                                type="number"
                                step="0.1"
                                placeholder="Log weight (kg)"
                                value={newWeight}
                                onChange={(e) => setNewWeight(e.target.value)}
                                className="weight-log-input"
                            />
                            <button
                                type="button"
                                className="weight-log-button"
                                onClick={handleLogWeight}
                                disabled={savingWeight}
                            >
                                {savingWeight ? "..." : "Log"}
                            </button>
                        </div>

                        {/* no goal-weight feature exists, so this shows when the
                            latest entry was logged instead of an invented target */}
                        <p>
                            {weightLogs.length > 0
                                ? `Last logged ${new Date(weightLogs[0].date).toLocaleDateString()}`
                                : "Log your weight to start tracking"}
                        </p>
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
                                onClick={() =>
                                    navigate(
                                        "/calories"
                                    )
                                }
                            >
                                View Details
                            </button>
                        </div>

                        <div className="calorie-content">
                            <div className="calorie-ring">
                                <div className="calorie-ring-center">
                                    <strong>{Math.round(caloriePercent)}%</strong>
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
                                        {proteinEaten}g / {proteinGoal}g
                                    </strong>
                                </div>

                                <div className="macro-item">
                                    <div>
                                        <span className="macro-dot carbs" />
                                        <p>Carbohydrates</p>
                                    </div>

                                    <strong>
                                        {carbsEaten}g / {carbsGoal}g
                                    </strong>
                                </div>

                                <div className="macro-item">
                                    <div>
                                        <span className="macro-dot fat" />
                                        <p>Fat</p>
                                    </div>

                                    <strong>
                                        {fatEaten}g / {fatGoal}g
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* shows the most recently saved workout instead of a fake
                        "upcoming session", since nothing tracks scheduled workouts yet */}
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

                        {loadingStats ? (
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
                            onClick={() =>
                                navigate("/workouts")
                            }
                        >
                            <FaDumbbell />
                            {lastWorkout ? "Log Another Workout" : "Start Workout"}
                        </button>
                    </article>
                </section>

                <section className="quick-actions-section">
                    <div className="section-title">
                        <p>QUICK ACCESS</p>

                        <h2>
                            What do you want to track?
                        </h2>
                    </div>

                    <div className="quick-actions-grid">
                        <button
                            type="button"
                            className="action-card"
                            onClick={() =>
                                navigate("/workouts")
                            }
                        >
                            <div className="action-icon">
                                <FaDumbbell />
                            </div>

                            <div>
                                <strong>
                                    Log Workout
                                </strong>

                                <span>
                                    Add exercises,
                                    sets and reps
                                </span>
                            </div>

                            <FaPlus className="action-plus" />
                        </button>

                        <button
                            type="button"
                            className="action-card"
                            onClick={() =>
                                navigate("/food-log")
                            }
                        >
                            <div className="action-icon">
                                <FaUtensils />
                            </div>

                            <div>
                                <strong>
                                    Log Food
                                </strong>

                                <span>
                                    Add meals and
                                    nutrition data
                                </span>
                            </div>

                            <FaPlus className="action-plus" />
                        </button>

                        <button
                            type="button"
                            className="action-card"
                            onClick={() =>
                                navigate("/calories")
                            }
                        >
                            <div className="action-icon">
                                <FaFire />
                            </div>

                            <div>
                                <strong>
                                    Calculate Calories
                                </strong>

                                <span>
                                    Calculate TDEE
                                    and macros
                                </span>
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