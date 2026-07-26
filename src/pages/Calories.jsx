import {
    useMemo,
    useState
} from "react";

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
    FaWeight
} from "react-icons/fa";

import "../calories.css";

const activityLevels = [
    {
        value: 1.2,
        label: "Sedentary",
        description:
            "Little exercise or mostly seated work"
    },
    {
        value: 1.375,
        label: "Lightly Active",
        description:
            "Exercise 1–3 days per week"
    },
    {
        value: 1.55,
        label: "Moderately Active",
        description:
            "Exercise 3–5 days per week"
    },
    {
        value: 1.725,
        label: "Very Active",
        description:
            "Hard exercise 6–7 days per week"
    },
    {
        value: 1.9,
        label: "Extremely Active",
        description:
            "Very hard training or physical work"
    }
];

const goalProfiles = {
    maintenance: {
        name: "Maintenance",
        badge: "Maintain Weight",
        adjustment: 0,
        proteinPerKg: 1.6,
        fatPercentage: 0.25,
        description:
            "Maintain your weight while supporting training and recovery."
    },

    cutting: {
        name: "Cutting",
        badge: "Fat-Loss Phase",
        adjustment: -0.2,
        proteinPerKg: 2.2,
        fatPercentage: 0.25,
        description:
            "Reduce body fat while helping maintain muscle mass."
    },

    recomp: {
        name: "Body Recomposition",
        badge: "Muscle Gain and Fat Loss",
        adjustment: -0.05,
        proteinPerKg: 2,
        fatPercentage: 0.25,
        description:
            "Use high protein and a small calorie deficit to support recomposition."
    },

    bulking: {
        name: "Bulking",
        badge: "Calorie Surplus",
        adjustment: 0.15,
        proteinPerKg: 1.6,
        fatPercentage: 0.25,
        description:
            "Use a calorie surplus to support weight and muscle gain."
    }
};

function roundToNearestTen(value) {
    return Math.round(
        value / 10
    ) * 10;
}

function formatNumber(value) {
    return new Intl.NumberFormat(
        "en-US"
    ).format(value);
}

function Calories({ user }) {
    const navigate = useNavigate();

    const [
        gender,
        setGender
    ] = useState("male");

    const [
        age,
        setAge
    ] = useState(22);

    const [
        height,
        setHeight
    ] = useState(176);

    const [
        weight,
        setWeight
    ] = useState(77);

    const [
        activity,
        setActivity
    ] = useState(1.55);

    const [
        goal,
        setGoal
    ] = useState("cutting");

    const memberName =
        user?.displayName || "Demo User";

    const memberEmail =
        user?.email || "demo@fitness.com";

    const selectedActivity =
        activityLevels.find(
            (item) =>
                item.value ===
                Number(activity)
        );

    const results = useMemo(() => {
        const numericAge =
            Number(age);

        const numericHeight =
            Number(height);

        const numericWeight =
            Number(weight);

        const numericActivity =
            Number(activity);

        if (
            numericAge <= 0 ||
            numericHeight <= 0 ||
            numericWeight <= 0 ||
            numericActivity <= 0
        ) {
            return null;
        }

        const genderConstant =
            gender === "male"
                ? 5
                : -161;

        const bmr =
            10 * numericWeight +
            6.25 * numericHeight -
            5 * numericAge +
            genderConstant;

        const tdee =
            bmr * numericActivity;

        const selectedGoal =
            goalProfiles[goal];

        const targetCalories =
            roundToNearestTen(
                tdee *
                    (
                        1 +
                        selectedGoal.adjustment
                    )
            );

        const protein =
            Math.round(
                numericWeight *
                    selectedGoal.proteinPerKg
            );

        const fat =
            Math.round(
                (
                    targetCalories *
                    selectedGoal.fatPercentage
                ) / 9
            );

        const proteinCalories =
            protein * 4;

        const fatCalories =
            fat * 9;

        const remainingCalories =
            Math.max(
                0,
                targetCalories -
                    proteinCalories -
                    fatCalories
            );

        const carbs =
            Math.round(
                remainingCalories / 4
            );

        const fiber =
            Math.round(
                (
                    targetCalories /
                    1000
                ) * 14
            );

        const waterLitres =
            Number(
                (
                    (
                        numericWeight *
                        35
                    ) / 1000
                ).toFixed(1)
            );

        const calorieDifference =
            Math.round(
                targetCalories -
                    tdee
            );

        return {
            bmr:
                Math.round(bmr),

            tdee:
                roundToNearestTen(
                    tdee
                ),

            targetCalories,
            protein,
            carbs,
            fat,
            fiber,
            waterLitres,

            sodium: 2300,
            potassium: 3400,

            calorieDifference,
            selectedGoal
        };
    }, [
        age,
        height,
        weight,
        activity,
        gender,
        goal
    ]);

    function resetCalculator() {
        setGender("male");
        setAge(22);
        setHeight(176);
        setWeight(77);
        setActivity(1.55);
        setGoal("cutting");
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
                        className="sidebar-link"
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
                        className="sidebar-link active"
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
                            <strong>
                                {memberName}
                            </strong>

                            <span>
                                {memberEmail}
                            </span>
                        </div>

                    </div>


                    <button
                        type="button"
                        className="logout-button"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        <FaSignOutAlt />
                        <span>Log Out</span>
                    </button>

                </div>

            </aside>


            <section className="dashboard-content calories-content">

                <header className="calories-header">

                    <div>

                        <p className="calories-kicker">
                            ENERGY AND MACRO PLANNER
                        </p>

                        <h1>
                            Calories Calculator
                            <span>.</span>
                        </h1>

                        <p>
                            Estimate your BMR,
                            TDEE, calorie target,
                            macros and daily
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

                    <article className="calculator-panel">

                        <div className="calculator-panel-heading">

                            <div className="calculator-heading-icon">
                                <FaCalculator />
                            </div>

                            <div>
                                <p>
                                    PERSONAL DETAILS
                                </p>

                                <h2>
                                    Calculate Your Needs
                                </h2>
                            </div>

                        </div>


                        <div className="calculator-form-grid">

                            <div className="calculator-field full-width-field">

                                <label>
                                    Gender
                                </label>

                                <div className="gender-selector">

                                    <button
                                        type="button"
                                        className={
                                            gender === "male"
                                                ? "gender-button active"
                                                : "gender-button"
                                        }
                                        onClick={() =>
                                            setGender("male")
                                        }
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
                                        onClick={() =>
                                            setGender("female")
                                        }
                                    >
                                        Female
                                    </button>

                                </div>

                            </div>


                            <div className="calculator-field">

                                <label htmlFor="age">
                                    Age
                                </label>

                                <div className="calculator-input-box">

                                    <FaHeartbeat />

                                    <input
                                        id="age"
                                        type="number"
                                        min="14"
                                        max="100"
                                        value={age}
                                        onChange={(event) =>
                                            setAge(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <span>years</span>

                                </div>

                            </div>


                            <div className="calculator-field">

                                <label htmlFor="weight">
                                    Weight
                                </label>

                                <div className="calculator-input-box">

                                    <FaWeight />

                                    <input
                                        id="weight"
                                        type="number"
                                        min="30"
                                        max="300"
                                        step="0.1"
                                        value={weight}
                                        onChange={(event) =>
                                            setWeight(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <span>kg</span>

                                </div>

                            </div>


                            <div className="calculator-field full-width-field">

                                <label htmlFor="height">
                                    Height
                                </label>

                                <div className="calculator-input-box">

                                    <FaRulerVertical />

                                    <input
                                        id="height"
                                        type="number"
                                        min="120"
                                        max="230"
                                        value={height}
                                        onChange={(event) =>
                                            setHeight(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <span>cm</span>

                                </div>

                            </div>


                            <div className="calculator-field full-width-field">

                                <label htmlFor="activity">
                                    Activity Level
                                </label>

                                <select
                                    id="activity"
                                    value={activity}
                                    onChange={(event) =>
                                        setActivity(
                                            Number(
                                                event.target.value
                                            )
                                        )
                                    }
                                >
                                    {activityLevels.map(
                                        (item) => (
                                            <option
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </option>
                                        )
                                    )}
                                </select>

                            </div>


                            <div className="activity-description full-width-field">

                                <FaRunning />

                                <span>
                                    {
                                        selectedActivity
                                            ?.description
                                    }
                                </span>

                            </div>

                        </div>


                        <div className="goal-section">

                            <div className="goal-section-heading">

                                <FaBullseye />

                                <div>
                                    <p>FITNESS GOAL</p>

                                    <h3>
                                        Select Your Goal
                                    </h3>
                                </div>

                            </div>


                            <div className="goal-grid">

                                {Object.entries(
                                    goalProfiles
                                ).map(
                                    ([
                                        goalKey,
                                        profile
                                    ]) => (
                                        <button
                                            type="button"
                                            key={goalKey}
                                            className={
                                                goal === goalKey
                                                    ? "goal-card active"
                                                    : "goal-card"
                                            }
                                            onClick={() =>
                                                setGoal(goalKey)
                                            }
                                        >
                                            <strong>
                                                {profile.name}
                                            </strong>

                                            <span>
                                                {profile.badge}
                                            </span>

                                            <small>
                                                {
                                                    profile.adjustment === 0
                                                        ? "No calorie adjustment"
                                                        : `${
                                                            Math.abs(
                                                                profile.adjustment *
                                                                100
                                                            )
                                                        }% ${
                                                            profile.adjustment < 0
                                                                ? "deficit"
                                                                : "surplus"
                                                        }`
                                                }
                                            </small>
                                        </button>
                                    )
                                )}

                            </div>

                        </div>

                    </article>


                    <article className="calculator-panel">

                        <div className="calculator-panel-heading">

                            <div className="calculator-heading-icon">
                                <FaHeartbeat />
                            </div>

                            <div>
                                <p>YOUR ESTIMATES</p>

                                <h2>
                                    Daily Nutrition Targets
                                </h2>
                            </div>

                        </div>


                        {results ? (
                            <>

                                <div className="energy-result-grid">

                                    <div className="energy-result-card">

                                        <span>BMR</span>

                                        <strong>
                                            {
                                                formatNumber(
                                                    results.bmr
                                                )
                                            }
                                        </strong>

                                        <small>
                                            kcal/day at rest
                                        </small>

                                    </div>


                                    <div className="energy-result-card">

                                        <span>TDEE</span>

                                        <strong>
                                            {
                                                formatNumber(
                                                    results.tdee
                                                )
                                            }
                                        </strong>

                                        <small>
                                            maintenance calories
                                        </small>

                                    </div>


                                    <div className="energy-result-card target-card">

                                        <span>
                                            DAILY TARGET
                                        </span>

                                        <strong>
                                            {
                                                formatNumber(
                                                    results.targetCalories
                                                )
                                            }
                                        </strong>

                                        <small>
                                            {
                                                results.calorieDifference > 0
                                                    ? `+${
                                                        formatNumber(
                                                            results.calorieDifference
                                                        )
                                                    } kcal surplus`

                                                    : results.calorieDifference < 0
                                                        ? `${
                                                            formatNumber(
                                                                results.calorieDifference
                                                            )
                                                        } kcal deficit`

                                                        : "maintenance intake"
                                            }
                                        </small>

                                    </div>

                                </div>


                                <div className="selected-goal-summary">

                                    <div>

                                        <span>
                                            {
                                                results
                                                    .selectedGoal
                                                    .badge
                                            }
                                        </span>

                                        <h3>
                                            {
                                                results
                                                    .selectedGoal
                                                    .name
                                            }
                                        </h3>

                                    </div>

                                    <p>
                                        {
                                            results
                                                .selectedGoal
                                                .description
                                        }
                                    </p>

                                </div>


                                <div className="nutrition-section-heading">

                                    <div>
                                        <p>
                                            MACRONUTRIENTS
                                        </p>

                                        <h3>
                                            Daily Macro Targets
                                        </h3>
                                    </div>

                                </div>


                                <div className="macro-result-grid">

                                    <div className="macro-result-card">

                                        <div className="macro-result-icon">
                                            <FaDumbbell />
                                        </div>

                                        <span>
                                            Protein
                                        </span>

                                        <strong>
                                            {results.protein} g
                                        </strong>

                                        <small>
                                            {
                                                results
                                                    .selectedGoal
                                                    .proteinPerKg
                                            }
                                            {" "}
                                            g per kg
                                        </small>

                                    </div>


                                    <div className="macro-result-card">

                                        <div className="macro-result-icon">
                                            <FaBreadSlice />
                                        </div>

                                        <span>
                                            Carbohydrates
                                        </span>

                                        <strong>
                                            {results.carbs} g
                                        </strong>

                                        <small>
                                            training fuel
                                        </small>

                                    </div>


                                    <div className="macro-result-card">

                                        <div className="macro-result-icon">
                                            <FaTint />
                                        </div>

                                        <span>Fat</span>

                                        <strong>
                                            {results.fat} g
                                        </strong>

                                        <small>
                                            25% of calories
                                        </small>

                                    </div>

                                </div>


                                <div className="nutrition-section-heading">

                                    <div>
                                        <p>
                                            DAILY ESSENTIALS
                                        </p>

                                        <h3>
                                            Nutrition Support
                                        </h3>
                                    </div>

                                </div>


                                <div className="essential-grid">

                                    <div className="essential-card">

                                        <FaLeaf />

                                        <div>
                                            <span>
                                                Fiber
                                            </span>

                                            <strong>
                                                {results.fiber} g
                                            </strong>
                                        </div>

                                    </div>


                                    <div className="essential-card">

                                        <FaTint />

                                        <div>
                                            <span>
                                                Water
                                            </span>

                                            <strong>
                                                {
                                                    results.waterLitres
                                                }
                                                {" "}
                                                L
                                            </strong>
                                        </div>

                                    </div>


                                    <div className="essential-card">

                                        <FaInfoCircle />

                                        <div>
                                            <span>
                                                Sodium Limit
                                            </span>

                                            <strong>
                                                {
                                                    formatNumber(
                                                        results.sodium
                                                    )
                                                }
                                                {" "}
                                                mg
                                            </strong>
                                        </div>

                                    </div>


                                    <div className="essential-card">

                                        <FaHeartbeat />

                                        <div>
                                            <span>
                                                Potassium
                                            </span>

                                            <strong>
                                                {
                                                    formatNumber(
                                                        results.potassium
                                                    )
                                                }
                                                {" "}
                                                mg
                                            </strong>
                                        </div>

                                    </div>

                                </div>


                                <div className="calculator-note">

                                    <FaInfoCircle />

                                    <p>
                                        These values are
                                        estimates. Monitor
                                        your body weight and
                                        gym performance, then
                                        adjust calories based
                                        on actual progress.
                                    </p>

                                </div>

                            </>
                        ) : (
                            <div className="invalid-result">

                                <FaCalculator />

                                <h3>
                                    Enter valid information
                                </h3>

                                <p>
                                    Age, height and weight
                                    must be greater than zero.
                                </p>

                            </div>
                        )}

                    </article>

                </section>

            </section>

        </main>
    );
}

export default Calories;