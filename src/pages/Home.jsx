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
    FaUtensils
} from "react-icons/fa";

function Home({ user }) {
    const navigate = useNavigate();

    const memberName =
        user?.displayName || "Demo User";

    const memberEmail =
        user?.email || "demo@fitness.com";

    function handleLogout() {
        navigate("/");
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

                <nav className="sidebar-navigation">
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
                            1,640
                            <small>
                                {" "}
                                / 2,300 kcal
                            </small>
                        </h2>

                        <div className="progress-track">
                            <div
                                className="progress-fill"
                                style={{
                                    width: "71%"
                                }}
                            />
                        </div>

                        <p>
                            660 calories remaining
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
                            118g
                            <small>
                                {" "}
                                / 160g
                            </small>
                        </h2>

                        <div className="progress-track">
                            <div
                                className="progress-fill"
                                style={{
                                    width: "74%"
                                }}
                            />
                        </div>

                        <p>
                            42g protein remaining
                        </p>
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
                            4
                            <small>
                                {" "}
                                / 5 this week
                            </small>
                        </h2>

                        <div className="progress-track">
                            <div
                                className="progress-fill"
                                style={{
                                    width: "80%"
                                }}
                            />
                        </div>

                        <p>
                            One workout left this week
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
                            77.2
                            <small> kg</small>
                        </h2>

                        <div className="weight-change">
                            ↓ 0.8 kg this month
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