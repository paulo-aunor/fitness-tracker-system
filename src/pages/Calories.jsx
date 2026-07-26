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


// Stores the available activity levels and their calorie multipliers.
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


// Stores calorie and macro settings for each fitness goal.
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


// Rounds a calorie value to the nearest ten.
function roundToNearestTen(value) {
    return Math.round(
        value / 10
    ) * 10;
}


// Formats a number with thousands separators.
function formatNumber(value) {
    return new Intl.NumberFormat(
        "en-US"
    ).format(value);
}


// Displays the calorie calculator and manages its data.
function Calories({ user }) {

    // Allows navigation between application pages.
    const navigate =
        useNavigate();


    // Stores the selected gender.
    const [
        gender,
        setGender
    ] = useState("male");


    // Stores the user's age.
    const [
        age,
        setAge
    ] = useState(22);


    // Stores the user's height in centimetres.
    const [
        height,
        setHeight
    ] = useState(176);


    // Stores the user's weight in kilograms.
    const [
        weight,
        setWeight
    ] = useState(77);


    // Stores the selected activity multiplier.
    const [
        activity,
        setActivity
    ] = useState(1.55);


    // Stores the selected fitness goal.
    const [
        goal,
        setGoal
    ] = useState("cutting");


    // Gets the user's display name or uses a demo name.
    const memberName =
        user?.displayName || "Demo User";


    // Gets the user's email or uses a demo email.
    const memberEmail =
        user?.email || "demo@fitness.com";


    // Finds the description for the selected activity level.
    const selectedActivity =
        activityLevels.find(
            (item) =>
                item.value ===
                Number(activity)
        );


    // Calculates and caches all calorie and nutrition results.
    const results =
        useMemo(() => {

            // Converts the form values into numbers.
            const numericAge =
                Number(age);

            const numericHeight =
                Number(height);

            const numericWeight =
                Number(weight);

            const numericActivity =
                Number(activity);


            // Stops the calculation when an input is invalid.
            if (
                numericAge <= 0 ||
                numericHeight <= 0 ||
                numericWeight <= 0 ||
                numericActivity <= 0
            ) {
                return null;
            }


            // Selects the gender value used in the BMR formula.
            const genderConstant =
                gender === "male"
                    ? 5
                    : -161;


            // Calculates basal metabolic rate.
            const bmr =
                10 * numericWeight +
                6.25 * numericHeight -
                5 * numericAge +
                genderConstant;


            // Calculates maintenance calories using the activity level.
            const tdee =
                bmr * numericActivity;


            // Gets the settings for the selected fitness goal.
            const selectedGoal =
                goalProfiles[goal];


            // Applies the goal adjustment to the maintenance calories.
            const targetCalories =
                roundToNearestTen(
                    tdee *
                        (
                            1 +
                            selectedGoal.adjustment
                        )
                );


            // Calculates the daily protein target.
            const protein =
                Math.round(
                    numericWeight *
                        selectedGoal.proteinPerKg
                );


            // Calculates the daily fat target.
            const fat =
                Math.round(
                    (
                        targetCalories *
                        selectedGoal.fatPercentage
                    ) / 9
                );


            // Converts the protein target into calories.
            const proteinCalories =
                protein * 4;


            // Converts the fat target into calories.
            const fatCalories =
                fat * 9;


            // Finds the calories remaining for carbohydrates.
            const remainingCalories =
                Math.max(
                    0,
                    targetCalories -
                        proteinCalories -
                        fatCalories
                );


            // Converts the remaining calories into carbohydrates.
            const carbs =
                Math.round(
                    remainingCalories / 4
                );


            // Estimates the daily fiber target.
            const fiber =
                Math.round(
                    (
                        targetCalories /
                        1000
                    ) * 14
                );


            // Estimates daily water intake using body weight.
            const waterLitres =
                Number(
                    (
                        (
                            numericWeight *
                            35
                        ) / 1000
                    ).toFixed(1)
                );


            // Compares the target with maintenance calories.
            const calorieDifference =
                Math.round(
                    targetCalories -
                        tdee
                );


            // Returns all values used by the results panel.
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


    // Restores the calculator inputs to their default values.
    function resetCalculator() {
        setGender("male");
        setAge(22);
        setHeight(176);
        setWeight(77);
        setActivity(1.55);
        setGoal("cutting");
    }


    // Displays the calorie calculator page.
    return (
        <main className="dashboard-page">

            {/* Displays the sidebar navigation. */}
            <aside className="dashboard-sidebar">

                {/* Displays the FitTrack logo. */}
                <div className="dashboard-logo">

                    <div className="dashboard-logo-icon">
                        <FaDumbbell />
                    </div>

                    <div>
                        <h2>FITTRACK</h2>
                        <span>Fitness System</span>
                    </div>

                </div>


                {/* Displays links to the main application pages. */}
                <nav className="sidebar-navigation">

                    {/* Opens the dashboard page. */}
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


                    {/* Opens the workouts page. */}
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


                    {/* Displays the food log navigation option. */}
                    <button
                        type="button"
                        className="sidebar-link"
                    >
                        <FaUtensils />
                        <span>Food Log</span>
                    </button>


                    {/* Shows the current calories page as active. */}
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


                    {/* Displays the progress navigation option. */}
                    <button
                        type="button"
                        className="sidebar-link"
                    >
                        <FaChartLine />
                        <span>Progress</span>
                    </button>

                </nav>


                {/* Displays the user profile and logout button. */}
                <div className="sidebar-bottom">

                    {/* Displays the current user's information. */}
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


                    {/* Returns the user to the login page. */}
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


            {/* Contains the calorie calculator content. */}
            <section className="dashboard-content calories-content">

                {/* Displays the page title and reset button. */}
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


                    {/* Resets all calculator values. */}
                    <button
                        type="button"
                        className="calories-reset-button"
                        onClick={resetCalculator}
                    >
                        Reset Calculator
                    </button>

                </header>


                {/* Places the input and results panels beside each other. */}
                <section className="calculator-layout">

                    {/* Collects personal details and the fitness goal. */}
                    <article className="calculator-panel">

                        {/* Displays the personal details heading. */}
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


                        {/* Contains the calculator input fields. */}
                        <div className="calculator-form-grid">

                            {/* Allows the user to select a gender. */}
                            <div className="calculator-field full-width-field">

                                <label>
                                    Gender
                                </label>

                                <div className="gender-selector">

                                    {/* Selects the male BMR formula. */}
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


                                    {/* Selects the female BMR formula. */}
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


                            {/* Collects the user's age. */}
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


                            {/* Collects the user's body weight. */}
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


                            {/* Collects the user's height. */}
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


                            {/* Allows the user to select an activity level. */}
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
                                    {/* Creates one option for each activity level. */}
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


                            {/* Explains the selected activity level. */}
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


                        {/* Allows the user to choose a fitness goal. */}
                        <div className="goal-section">

                            {/* Displays the fitness goal heading. */}
                            <div className="goal-section-heading">

                                <FaBullseye />

                                <div>
                                    <p>FITNESS GOAL</p>

                                    <h3>
                                        Select Your Goal
                                    </h3>
                                </div>

                            </div>


                            {/* Creates a selectable card for every goal. */}
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


                    {/* Displays calculated energy and nutrition targets. */}
                    <article className="calculator-panel">

                        {/* Displays the results panel heading. */}
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


                        {/* Shows the results only when all inputs are valid. */}
                        {results ? (
                            <>

                                {/* Displays BMR, TDEE and target calories. */}
                                <div className="energy-result-grid">

                                    {/* Displays the basal metabolic rate. */}
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


                                    {/* Displays maintenance calories. */}
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


                                    {/* Displays the selected daily calorie target. */}
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


                                {/* Explains the selected fitness goal. */}
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


                                {/* Introduces the macronutrient targets. */}
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


                                {/* Displays all macronutrient targets. */}
                                <div className="macro-result-grid">

                                    {/* Displays the daily protein target. */}
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


                                    {/* Displays the daily carbohydrate target. */}
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


                                    {/* Displays the daily fat target. */}
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


                                {/* Introduces the daily nutrition essentials. */}
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


                                {/* Displays fiber, water and mineral targets. */}
                                <div className="essential-grid">

                                    {/* Displays the daily fiber target. */}
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


                                    {/* Displays the daily water target. */}
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


                                    {/* Displays the recommended sodium limit. */}
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


                                    {/* Displays the daily potassium target. */}
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


                                {/* Reminds the user that the values are estimates. */}
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

                                {/* Displays an error for invalid inputs. */}
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