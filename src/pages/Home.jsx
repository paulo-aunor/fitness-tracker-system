import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getWorkouts, addWeightLog, getWeightLogs, getDailyNutrition } from "../services/firestoreService";

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
    FaUtensils
} from "react-icons/fa";

function Home({ user }) {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);

    const memberName =
        user?.displayName || "Demo User";

    const memberEmail =
        user?.email || "demo@fitness.com";
    // this will hold the list of weight entries from the database
    const [weightLogs, setWeightLogs] = useState([]);

    // this holds whatever number the user types into the input box
    const [newWeight, setNewWeight] = useState("");

    // this is true while we are saving, so we can disable the button
    const [savingWeight, setSavingWeight] = useState(false);
    const [nutrition, setNutrition] = useState(null);

    const caloriesEaten = nutrition?.calories ?? 0;
    const proteinEaten = nutrition?.protein ?? 0;

    const calorieGoal = 2300;
    const proteinGoal = 160;

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
        } catch (error) {
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
        } catch (error) {
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

    function handleLogout() {
        navigate("/");
    }
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

    // calculate the change, only if we have both numbers
    let weightChangeText = "No history yet";
    if (latestWeight !== null && oldWeight !== null) {
        const difference = (latestWeight - oldWeight).toFixed(1);
        if (difference <= 0) {
            weightChangeText = "↓ " + Math.abs(difference) + " kg this month";
        } else {
            weightChangeText = "↑ " + difference + " kg this month";
        }
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

                <nav classNafme="sidebar-navigation">
                    <button
                        type="button"
                        className="sidebar-link active"
                        onClick={() =>
                            navigate("/home")
                        }
                    >
                        <FaHome />
                        <span>Dashboard</span>
                    </button>

                    <button
                        type="button"
                        className="sidebar-link"
                        onClick={() =>
                            navigate("/workouts")
                        }
                    >
                        <FaDumbbell />
                        <span>Workouts</span>
                    </button>

                    <button
                        type="button"
                        className="sidebar-link"
                    >
                        <FaUtensils />
                        <span>Food Log</span>
                    </button>

                    <button
                        type="button"
                        className="sidebar-link"
                        onClick={() =>
                            navigate("/calories")
                        }
                    >
                        <FaFire />
                        <span>Calories</span>
                    </button>

                    <button
                        type="button"
                        className="sidebar-link"
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

                        <h2>
                    {loadingStats ? "…" : workoutsThisWeek}
                    <small> / 5 this week</small>
                                </h2>

                                <div className="progress-track">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${Math.min((workoutsThisWeek / 5) * 100, 100)}%` }}
                                    />
                                </div>

                                <p>
                                    {loadingStats
                                        ? "Loading..."
                                        : workoutsThisWeek >= 5
                                        ? "Weekly goal reached!"
                                        : `${5 - workoutsThisWeek} workout${5 - workoutsThisWeek === 1 ? "" : "s"} left this week`}
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

                            <div className="weight-change">
                                {weightChangeText}
                            </div>

                            <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="Log weight (kg)"
                                    value={newWeight}
                                    onChange={(e) => setNewWeight(e.target.value)}
                                    style={{ flex: 1, padding: "4px 8px" }}
                                />
                                <button type="button" onClick={handleLogWeight} disabled={savingWeight}>
                                    {savingWeight ? "..." : "Log"}
                                </button>
                            </div>

                        <p>Goal weight: 72 kg</p>
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
                                    <strong>71%</strong>
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
                                        118g / 160g
                                    </strong>
                                </div>

                                <div className="macro-item">
                                    <div>
                                        <span className="macro-dot carbs" />
                                        <p>Carbohydrates</p>
                                    </div>

                                    <strong>
                                        180g / 260g
                                    </strong>
                                </div>

                                <div className="macro-item">
                                    <div>
                                        <span className="macro-dot fat" />
                                        <p>Fat</p>
                                    </div>

                                    <strong>
                                        48g / 65g
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </article>

                    <article className="dashboard-panel">
                        <div className="panel-header">
                            <div>
                                <p>NEXT SESSION</p>
                                <h2>Push Day</h2>
                            </div>

                            <div className="panel-icon">
                                <FaCalendarAlt />
                            </div>
                        </div>

                        <div className="workout-time">
                            <FaBolt />

                            <div>
                                <strong>
                                    Today at 6:00 PM
                                </strong>

                                <span>
                                    Estimated time:
                                    60 minutes
                                </span>
                            </div>
                        </div>

                        <div className="exercise-list">
                            <div className="exercise-item">
                                <span>01</span>

                                <div>
                                    <strong>
                                        Bench Press
                                    </strong>

                                    <p>
                                        4 sets × 8 reps
                                    </p>
                                </div>
                            </div>

                            <div className="exercise-item">
                                <span>02</span>

                                <div>
                                    <strong>
                                        Shoulder Press
                                    </strong>

                                    <p>
                                        3 sets × 10 reps
                                    </p>
                                </div>
                            </div>

                            <div className="exercise-item">
                                <span>03</span>

                                <div>
                                    <strong>
                                        Tricep Pushdown
                                    </strong>

                                    <p>
                                        3 sets × 12 reps
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                navigate("/workouts")
                            }
                        >
                            <FaDumbbell />
                            Start Workout
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