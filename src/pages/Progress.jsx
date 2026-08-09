import {
    useEffect,
    useMemo,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import {
    FaArrowDown,
    FaArrowUp,
    FaBullseye,
    FaCalendarAlt,
    FaChartLine,
    FaDumbbell,
    FaEdit,
    FaFire,
    FaHistory,
    FaHome,
    FaMedal,
    FaPlus,
    FaSave,
    FaSignOutAlt,
    FaTrash,
    FaTrophy,
    FaUserCircle,
    FaUtensils,
    FaWeight
} from "react-icons/fa";

import "../progress.css";


// Stores the localStorage key for progress entries.
const PROGRESS_STORAGE_KEY =
    "fittrack-progress-entries";


// Stores the localStorage key for personal strength records.
const RECORDS_STORAGE_KEY =
    "fittrack-personal-records";


// Stores the localStorage key for progress settings.
const SETTINGS_STORAGE_KEY =
    "fittrack-progress-settings";


// Provides default values for personal strength records.
const defaultRecords = {
    benchPress: 0,
    squat: 0,
    deadlift: 0,
    overheadPress: 0
};


// Provides the default goal weight setting.
const defaultSettings = {
    goalWeight: 72
};


// Defines the exercises shown in the personal records section.
const recordItems = [
    {
        field: "benchPress",
        label: "Bench Press"
    },
    {
        field: "squat",
        label: "Squat"
    },
    {
        field: "deadlift",
        label: "Deadlift"
    },
    {
        field: "overheadPress",
        label: "Overhead Press"
    }
];


// Converts a Date object into a local YYYY-MM-DD value.
function createLocalDateValue(
    date = new Date()
) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Creates an empty progress entry form.
function createEmptyForm() {
    return {
        date: createLocalDateValue(),
        weight: "",
        bodyFat: "",
        workouts: "",
        note: ""
    };
}


// Creates a unique ID for a progress entry.
function createId() {
    if (
        window.crypto &&
        typeof window.crypto.randomUUID ===
            "function"
    ) {
        return window.crypto.randomUUID();
    }

    return `progress-${Date.now()}`;
}


// Converts a value into a valid number.
function toNumber(value) {
    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
}


// Converts saved progress data into a consistent entry object.
function normalizeEntry(entry) {
    return {
        id:
            entry?.id ||
            createId(),

        date:
            entry?.date ||
            createLocalDateValue(),

        weight:
            toNumber(entry?.weight),

        bodyFat:
            toNumber(entry?.bodyFat),

        workouts:
            toNumber(entry?.workouts),

        note:
            typeof entry?.note ===
            "string"
                ? entry.note
                : ""
    };
}


// Loads saved progress entries from localStorage.
function loadProgressEntries() {
    try {
        const saved =
            localStorage.getItem(
                PROGRESS_STORAGE_KEY
            );

        if (!saved) {
            return [];
        }

        const parsed =
            JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed
            .map(normalizeEntry)
            .filter(
                (entry) =>
                    entry.date &&
                    entry.weight > 0
            );
    } catch (error) {
        console.error(
            "Unable to load progress entries:",
            error
        );

        return [];
    }
}


// Loads saved personal records from localStorage.
function loadRecords() {
    try {
        const saved =
            localStorage.getItem(
                RECORDS_STORAGE_KEY
            );

        if (!saved) {
            return defaultRecords;
        }

        const parsed =
            JSON.parse(saved);

        return {
            benchPress:
                toNumber(
                    parsed?.benchPress
                ),

            squat:
                toNumber(
                    parsed?.squat
                ),

            deadlift:
                toNumber(
                    parsed?.deadlift
                ),

            overheadPress:
                toNumber(
                    parsed?.overheadPress
                )
        };
    } catch (error) {
        console.error(
            "Unable to load personal records:",
            error
        );

        return defaultRecords;
    }
}


// Loads saved progress settings from localStorage.
function loadSettings() {
    try {
        const saved =
            localStorage.getItem(
                SETTINGS_STORAGE_KEY
            );

        if (!saved) {
            return defaultSettings;
        }

        const parsed =
            JSON.parse(saved);

        return {
            goalWeight:
                toNumber(
                    parsed?.goalWeight
                ) || 72
        };
    } catch (error) {
        console.error(
            "Unable to load progress settings:",
            error
        );

        return defaultSettings;
    }
}


// Formats a numeric value for display.
function formatValue(
    value,
    decimals = 1
) {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "—";
    }

    const number =
        Number(value);

    if (number === 0) {
        return "—";
    }

    return Number(
        number.toFixed(decimals)
    );
}


// Formats a saved date into a readable date.
function formatDate(dateValue) {
    if (!dateValue) {
        return "No date";
    }

    return new Date(
        `${dateValue}T12:00:00`
    ).toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}


// Keeps a number between a minimum and maximum value.
function clamp(
    value,
    minimum,
    maximum
) {
    return Math.min(
        maximum,
        Math.max(
            minimum,
            value
        )
    );
}


// Displays the progress tracker and manages progress data.
function Progress({ user }) {

    // Allows navigation between application pages.
    const navigate =
        useNavigate();


    // Stores all saved progress entries.
    const [
        entries,
        setEntries
    ] = useState(
        loadProgressEntries
    );


    // Stores personal strength records.
    const [
        records,
        setRecords
    ] = useState(loadRecords);


    // Stores progress settings such as goal weight.
    const [
        settings,
        setSettings
    ] = useState(loadSettings);


    // Stores values entered in the progress form.
    const [
        form,
        setForm
    ] = useState(
        createEmptyForm
    );


    // Stores the ID of the entry currently being edited.
    const [
        editingId,
        setEditingId
    ] = useState(null);


    // Stores validation and success messages for the form.
    const [
        formMessage,
        setFormMessage
    ] = useState("");


    // Stores the metric currently displayed in the chart.
    const [
        selectedMetric,
        setSelectedMetric
    ] = useState("weight");


    // Gets the user display name or uses a demo name.
    const memberName =
        user?.displayName ||
        "Demo User";


    // Gets the user email or uses a demo email.
    const memberEmail =
        user?.email ||
        "demo@fitness.com";


    // Sorts progress entries from newest to oldest.
    const sortedEntries =
        useMemo(() => {
            return [
                ...entries
            ].sort(
                (first, second) =>
                    new Date(
                        second.date
                    ) -
                    new Date(
                        first.date
                    )
            );
        }, [entries]);


    // Gets the newest progress entry.
    const latestEntry =
        sortedEntries[0] || null;


    // Gets the entry before the newest entry.
    const previousEntry =
        sortedEntries[1] || null;


    // Gets the oldest saved progress entry.
    const oldestEntry =
        sortedEntries[
            sortedEntries.length - 1
        ] || null;


    // Calculates the total number of logged workouts.
    const totalWorkouts =
        useMemo(() => {
            return sortedEntries.reduce(
                (total, entry) =>
                    total +
                    toNumber(
                        entry.workouts
                    ),
                0
            );
        }, [sortedEntries]);


    // Calculates weight change since the previous entry.
    const weightChange =
        latestEntry &&
        previousEntry
            ? latestEntry.weight -
              previousEntry.weight
            : 0;


    // Calculates body fat change since the previous entry.
    const bodyFatChange =
        latestEntry &&
        previousEntry &&
        latestEntry.bodyFat > 0 &&
        previousEntry.bodyFat > 0
            ? latestEntry.bodyFat -
              previousEntry.bodyFat
            : 0;


    // Calculates weight change from the first to latest entry.
    const totalWeightChange =
        latestEntry &&
        oldestEntry
            ? latestEntry.weight -
              oldestEntry.weight
            : 0;


    // Calculates progress toward the selected goal weight.
    const goalProgress =
        useMemo(() => {
            if (
                !latestEntry ||
                !oldestEntry ||
                settings.goalWeight <= 0
            ) {
                return 0;
            }

            const startingWeight =
                oldestEntry.weight;

            const currentWeight =
                latestEntry.weight;

            const goalWeight =
                settings.goalWeight;

            const totalDistance =
                goalWeight -
                startingWeight;

            const currentDistance =
                currentWeight -
                startingWeight;

            if (totalDistance === 0) {
                return 100;
            }

            return clamp(
                Math.round(
                    (
                        currentDistance /
                        totalDistance
                    ) * 100
                ),
                0,
                100
            );
        }, [
            latestEntry,
            oldestEntry,
            settings.goalWeight
        ]);


    // Builds chart points from the most recent progress entries.
    const chartData =
        useMemo(() => {
            const chartEntries =
                [
                    ...sortedEntries
                ]
                    .slice(0, 8)
                    .reverse()
                    .filter(
                        (entry) =>
                            toNumber(
                                entry[
                                    selectedMetric
                                ]
                            ) > 0
                    );

            if (
                chartEntries.length === 0
            ) {
                return {
                    points: [],
                    minimum: 0,
                    maximum: 0
                };
            }

            const values =
                chartEntries.map(
                    (entry) =>
                        toNumber(
                            entry[
                                selectedMetric
                            ]
                        )
                );

            const rawMinimum =
                Math.min(...values);

            const rawMaximum =
                Math.max(...values);

            const difference =
                rawMaximum -
                rawMinimum;

            const padding =
                difference === 0
                    ? Math.max(
                        rawMaximum * 0.05,
                        1
                    )
                    : difference * 0.18;

            const minimum =
                rawMinimum -
                padding;

            const maximum =
                rawMaximum +
                padding;

            const chartWidth = 640;
            const chartHeight = 240;

            const left = 52;
            const right = 20;
            const top = 22;
            const bottom = 45;

            const availableWidth =
                chartWidth -
                left -
                right;

            const availableHeight =
                chartHeight -
                top -
                bottom;

            const range =
                maximum -
                    minimum || 1;

            const points =
                chartEntries.map(
                    (entry, index) => {
                        const divisor =
                            Math.max(
                                chartEntries.length -
                                    1,
                                1
                            );

                        const x =
                            left +
                            (
                                index /
                                divisor
                            ) *
                                availableWidth;

                        const value =
                            toNumber(
                                entry[
                                    selectedMetric
                                ]
                            );

                        const y =
                            top +
                            (
                                (
                                    maximum -
                                    value
                                ) /
                                range
                            ) *
                                availableHeight;

                        return {
                            x,
                            y,
                            value,
                            date:
                                entry.date
                        };
                    }
                );

            return {
                points,
                minimum,
                maximum
            };
        }, [
            sortedEntries,
            selectedMetric
        ]);


    // Saves progress entries whenever they change.
    useEffect(() => {
        localStorage.setItem(
            PROGRESS_STORAGE_KEY,
            JSON.stringify(entries)
        );
    }, [entries]);


    // Saves personal records whenever they change.
    useEffect(() => {
        localStorage.setItem(
            RECORDS_STORAGE_KEY,
            JSON.stringify(records)
        );
    }, [records]);


    // Saves progress settings whenever they change.
    useEffect(() => {
        localStorage.setItem(
            SETTINGS_STORAGE_KEY,
            JSON.stringify(settings)
        );
    }, [settings]);


    // Updates one field in the progress entry form.
    function updateForm(
        field,
        value
    ) {
        setForm(
            (current) => ({
                ...current,
                [field]: value
            })
        );
    }


    // Clears the progress form and exits edit mode.
    function resetForm() {
        setForm(
            createEmptyForm()
        );

        setEditingId(null);
        setFormMessage("");
    }


    // Validates and saves a new or edited progress entry.
    function handleSaveEntry(event) {
        event.preventDefault();

        const weight =
            toNumber(form.weight);

        if (
            !form.date ||
            weight <= 0
        ) {
            setFormMessage(
                "Enter a valid date and weight."
            );

            return;
        }

        const entry = {
            id:
                editingId ||
                createId(),

            date:
                form.date,

            weight,

            bodyFat:
                Math.max(
                    0,
                    toNumber(
                        form.bodyFat
                    )
                ),

            workouts:
                Math.max(
                    0,
                    toNumber(
                        form.workouts
                    )
                ),

            note:
                form.note.trim()
        };

        setEntries(
            (current) => {
                if (editingId) {
                    return current.map(
                        (item) =>
                            item.id ===
                            editingId
                                ? entry
                                : item
                    );
                }

                return [
                    ...current,
                    entry
                ];
            }
        );

        setFormMessage(
            editingId
                ? "Progress entry updated."
                : "Progress entry added."
        );

        setForm(
            createEmptyForm()
        );

        setEditingId(null);
    }


    // Loads an existing progress entry into the edit form.
    function handleEditEntry(entry) {
        setEditingId(entry.id);

        setForm({
            date: entry.date,

            weight:
                entry.weight || "",

            bodyFat:
                entry.bodyFat || "",

            workouts:
                entry.workouts || "",

            note:
                entry.note || ""
        });

        setFormMessage(
            "Editing selected entry."
        );

        document
            .getElementById(
                "progress-entry-form"
            )
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    }


    // Deletes a progress entry.
    function handleDeleteEntry(
        entryId
    ) {
        setEntries(
            (current) =>
                current.filter(
                    (entry) =>
                        entry.id !==
                        entryId
                )
        );

        if (
            editingId === entryId
        ) {
            resetForm();
        }
    }


    // Updates one personal strength record.
    function updateRecord(
        field,
        value
    ) {
        setRecords(
            (current) => ({
                ...current,

                [field]:
                    Math.max(
                        0,
                        toNumber(value)
                    )
            })
        );
    }


    // Updates the user goal weight.
    function updateGoalWeight(value) {
        setSettings(
            (current) => ({
                ...current,

                goalWeight:
                    Math.max(
                        0,
                        toNumber(value)
                    )
            })
        );
    }


    // Converts chart points into an SVG polyline string.
    const chartPointString =
        chartData.points
            .map(
                (point) =>
                    `${point.x},${point.y}`
            )
            .join(" ");


    // Displays the complete progress tracker interface.
    return (
        <main className="dashboard-page">

            {/* Displays the sidebar navigation and user profile. */}
            <aside className="dashboard-sidebar">

                <div className="dashboard-logo">

                    <div className="dashboard-logo-icon">
                        <FaDumbbell />
                    </div>

                    <div>
                        <h2>FITTRACK</h2>

                        <span>
                            Fitness System
                        </span>
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
                            navigate(
                                "/workouts"
                            )
                        }
                    >
                        <FaDumbbell />
                        <span>Workouts</span>
                    </button>


                    <button
                        type="button"
                        className="sidebar-link"
                        onClick={() =>
                            navigate(
                                "/food-log"
                            )
                        }
                    >
                        <FaUtensils />
                        <span>Food Log</span>
                    </button>


                    <button
                        type="button"
                        className="sidebar-link"
                        onClick={() =>
                            navigate(
                                "/calories"
                            )
                        }
                    >
                        <FaFire />
                        <span>Calories</span>
                    </button>


                    <button
                        type="button"
                        className="sidebar-link active"
                        onClick={() =>
                            navigate(
                                "/progress"
                            )
                        }
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


            {/* Contains all progress tracking content. */}
            <section className="dashboard-content progress-content">

                {/* Displays the page heading and goal weight control. */}
                <header className="progress-header">

                    <div>

                        <p className="progress-kicker">
                            WEIGHT AND STRENGTH TRACKER
                        </p>

                        <h1>
                            Your Progress
                            <span>.</span>
                        </h1>

                        <p>
                            Track your weight, body fat,
                            workouts and strength progress.
                        </p>

                    </div>


                    <div className="progress-goal-control">

                        <FaBullseye />

                        <label>
                            <span>
                                Goal Weight
                            </span>

                            <div>
                                <input
                                    type="number"
                                    min="30"
                                    max="300"
                                    step="0.1"
                                    value={
                                        settings
                                            .goalWeight
                                    }
                                    onChange={(event) =>
                                        updateGoalWeight(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                />

                                <small>kg</small>
                            </div>
                        </label>

                    </div>

                </header>


                {/* Displays summary cards for current progress. */}
                <section className="progress-summary-grid">

                    <article className="progress-summary-card primary-summary-card">

                        <div className="progress-summary-icon">
                            <FaWeight />
                        </div>

                        <span>
                            Current Weight
                        </span>

                        <strong>
                            {
                                latestEntry
                                    ? formatValue(
                                        latestEntry
                                            .weight
                                    )
                                    : "—"
                            }

                            <small>
                                {" "}
                                kg
                            </small>
                        </strong>

                        <div
                            className={
                                weightChange < 0
                                    ? "progress-change decrease"
                                    : weightChange > 0
                                        ? "progress-change increase"
                                        : "progress-change"
                            }
                        >

                            {weightChange < 0 && (
                                <FaArrowDown />
                            )}

                            {weightChange > 0 && (
                                <FaArrowUp />
                            )}

                            <span>
                                {previousEntry
                                    ? `${Math.abs(
                                        Number(
                                            weightChange.toFixed(
                                                1
                                            )
                                        )
                                    )} kg since previous entry`
                                    : "Add more entries to compare"}
                            </span>

                        </div>

                    </article>


                    <article className="progress-summary-card">

                        <div className="progress-summary-icon">
                            <FaChartLine />
                        </div>

                        <span>
                            Body Fat
                        </span>

                        <strong>
                            {
                                latestEntry &&
                                latestEntry.bodyFat >
                                    0
                                    ? formatValue(
                                        latestEntry
                                            .bodyFat
                                    )
                                    : "—"
                            }

                            <small>
                                {" "}
                                %
                            </small>
                        </strong>

                        <div
                            className={
                                bodyFatChange < 0
                                    ? "progress-change decrease"
                                    : bodyFatChange > 0
                                        ? "progress-change increase"
                                        : "progress-change"
                            }
                        >

                            {bodyFatChange < 0 && (
                                <FaArrowDown />
                            )}

                            {bodyFatChange > 0 && (
                                <FaArrowUp />
                            )}

                            <span>
                                {previousEntry &&
                                bodyFatChange !== 0
                                    ? `${Math.abs(
                                        Number(
                                            bodyFatChange.toFixed(
                                                1
                                            )
                                        )
                                    )}% since previous entry`
                                    : "Body fat is optional"}
                            </span>

                        </div>

                    </article>


                    <article className="progress-summary-card">

                        <div className="progress-summary-icon">
                            <FaDumbbell />
                        </div>

                        <span>
                            Logged Workouts
                        </span>

                        <strong>
                            {totalWorkouts}

                            <small>
                                {" "}
                                sessions
                            </small>
                        </strong>

                        <div className="progress-change">

                            <span>
                                Total completed workouts
                            </span>

                        </div>

                    </article>


                    <article className="progress-summary-card">

                        <div className="progress-summary-icon">
                            <FaHistory />
                        </div>

                        <span>
                            Total Weight Change
                        </span>

                        <strong>
                            {
                                sortedEntries.length >
                                1
                                    ? Math.abs(
                                        Number(
                                            totalWeightChange.toFixed(
                                                1
                                            )
                                        )
                                    )
                                    : "—"
                            }

                            <small>
                                {" "}
                                kg
                            </small>
                        </strong>

                        <div
                            className={
                                totalWeightChange < 0
                                    ? "progress-change decrease"
                                    : totalWeightChange > 0
                                        ? "progress-change increase"
                                        : "progress-change"
                            }
                        >

                            {totalWeightChange < 0 && (
                                <FaArrowDown />
                            )}

                            {totalWeightChange > 0 && (
                                <FaArrowUp />
                            )}

                            <span>
                                From first to latest entry
                            </span>

                        </div>

                    </article>

                </section>


                {/* Displays the progress form and goal progress panel. */}
                <section className="progress-main-grid">

                    <article
                        className="progress-panel progress-form-panel"
                        id="progress-entry-form"
                    >

                        <div className="progress-panel-heading">

                            <div className="progress-panel-icon">
                                <FaPlus />
                            </div>

                            <div>
                                <p>
                                    {editingId
                                        ? "EDIT ENTRY"
                                        : "NEW ENTRY"}
                                </p>

                                <h2>
                                    {editingId
                                        ? "Update Progress Entry"
                                        : "Log Your Progress"}
                                </h2>
                            </div>

                        </div>


                        <form
                            className="progress-entry-form"
                            onSubmit={
                                handleSaveEntry
                            }
                        >

                            <div className="progress-form-grid">

                                <label>
                                    <span>Date</span>

                                    <input
                                        type="date"
                                        value={
                                            form.date
                                        }
                                        onChange={(event) =>
                                            updateForm(
                                                "date",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />
                                </label>


                                <label>
                                    <span>
                                        Weight (kg)
                                    </span>

                                    <input
                                        type="number"
                                        min="30"
                                        max="300"
                                        step="0.1"
                                        placeholder="77"
                                        value={
                                            form.weight
                                        }
                                        onChange={(event) =>
                                            updateForm(
                                                "weight",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />
                                </label>


                                <label>
                                    <span>
                                        Body Fat (%) Optional
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        max="70"
                                        step="0.1"
                                        placeholder="18"
                                        value={
                                            form.bodyFat
                                        }
                                        onChange={(event) =>
                                            updateForm(
                                                "bodyFat",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />
                                </label>


                                <label>
                                    <span>
                                        Workouts Completed
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        placeholder="5"
                                        value={
                                            form.workouts
                                        }
                                        onChange={(event) =>
                                            updateForm(
                                                "workouts",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />
                                </label>


                                <label className="progress-note-field">

                                    <span>Notes</span>

                                    <textarea
                                        rows="4"
                                        placeholder="Example: Weight decreased and strength improved."
                                        value={
                                            form.note
                                        }
                                        onChange={(event) =>
                                            updateForm(
                                                "note",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />

                                </label>

                            </div>


                            {formMessage && (
                                <p className="progress-form-message">
                                    {formMessage}
                                </p>
                            )}


                            <div className="progress-form-actions">

                                <button
                                    type="button"
                                    className="progress-clear-button"
                                    onClick={
                                        resetForm
                                    }
                                >
                                    Clear
                                </button>

                                <button
                                    type="submit"
                                    className="progress-save-button"
                                >
                                    <FaSave />

                                    {editingId
                                        ? "Update Entry"
                                        : "Save Entry"}
                                </button>

                            </div>

                        </form>

                    </article>


                    <div className="progress-side-column">

                        <article className="progress-panel goal-progress-panel">

                            <div className="progress-panel-heading">

                                <div className="progress-panel-icon">
                                    <FaBullseye />
                                </div>

                                <div>
                                    <p>
                                        WEIGHT GOAL
                                    </p>

                                    <h2>
                                        Goal Progress
                                    </h2>
                                </div>

                            </div>


                            <div className="goal-progress-number">

                                <strong>
                                    {goalProgress}%
                                </strong>

                                <span>
                                    completed
                                </span>

                            </div>


                            <div className="goal-progress-track">

                                <div
                                    className="goal-progress-fill"
                                    style={{
                                        width:
                                            `${goalProgress}%`
                                    }}
                                />

                            </div>


                            <div className="goal-weight-details">

                                <div>
                                    <span>
                                        Starting
                                    </span>

                                    <strong>
                                        {
                                            oldestEntry
                                                ? `${formatValue(
                                                    oldestEntry
                                                        .weight
                                                )} kg`
                                                : "—"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Current
                                    </span>

                                    <strong>
                                        {
                                            latestEntry
                                                ? `${formatValue(
                                                    latestEntry
                                                        .weight
                                                )} kg`
                                                : "—"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Goal
                                    </span>

                                    <strong>
                                        {
                                            settings
                                                .goalWeight
                                        }
                                        {" "}
                                        kg
                                    </strong>
                                </div>

                            </div>

                        </article>

                    </div>

                </section>


                {/* Displays the weight or body fat trend chart. */}
                <section className="progress-panel chart-panel">

                    <div className="chart-panel-header">

                        <div className="progress-panel-heading">

                            <div className="progress-panel-icon">
                                <FaChartLine />
                            </div>

                            <div>
                                <p>
                                    LAST 8 ENTRIES
                                </p>

                                <h2>
                                    Progress Trend
                                </h2>
                            </div>

                        </div>


                        <div className="chart-metric-selector">

                            <button
                                type="button"
                                className={
                                    selectedMetric ===
                                    "weight"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setSelectedMetric(
                                        "weight"
                                    )
                                }
                            >
                                Weight
                            </button>

                            <button
                                type="button"
                                className={
                                    selectedMetric ===
                                    "bodyFat"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setSelectedMetric(
                                        "bodyFat"
                                    )
                                }
                            >
                                Body Fat
                            </button>

                        </div>

                    </div>


                    {chartData.points.length >
                    0 ? (
                        <div className="progress-chart-wrapper">

                            <svg
                                className="progress-chart"
                                viewBox="0 0 640 240"
                                role="img"
                                aria-label="Progress chart"
                            >

                                {[0, 1, 2, 3, 4].map(
                                    (line) => {
                                        const y =
                                            22 +
                                            (
                                                line /
                                                4
                                            ) *
                                                173;

                                        const value =
                                            chartData.maximum -
                                            (
                                                line /
                                                4
                                            ) *
                                                (
                                                    chartData.maximum -
                                                    chartData.minimum
                                                );

                                        return (
                                            <g key={line}>

                                                <line
                                                    x1="52"
                                                    y1={y}
                                                    x2="620"
                                                    y2={y}
                                                    className="chart-grid-line"
                                                />

                                                <text
                                                    x="43"
                                                    y={
                                                        y +
                                                        4
                                                    }
                                                    textAnchor="end"
                                                    className="chart-axis-label"
                                                >
                                                    {
                                                        Number(
                                                            value.toFixed(
                                                                1
                                                            )
                                                        )
                                                    }
                                                </text>

                                            </g>
                                        );
                                    }
                                )}


                                {chartData.points.length >
                                    1 && (
                                    <polyline
                                        points={
                                            chartPointString
                                        }
                                        className="chart-trend-line"
                                    />
                                )}


                                {chartData.points.map(
                                    (
                                        point,
                                        index
                                    ) => (
                                        <g
                                            key={
                                                `${point.date}-${index}`
                                            }
                                        >

                                            <circle
                                                cx={
                                                    point.x
                                                }
                                                cy={
                                                    point.y
                                                }
                                                r="5"
                                                className="chart-point"
                                            />

                                            <text
                                                x={
                                                    point.x
                                                }
                                                y={
                                                    point.y -
                                                    11
                                                }
                                                textAnchor="middle"
                                                className="chart-value-label"
                                            >
                                                {
                                                    point.value
                                                }
                                            </text>

                                            <text
                                                x={
                                                    point.x
                                                }
                                                y="222"
                                                textAnchor="middle"
                                                className="chart-date-label"
                                            >
                                                {
                                                    new Date(
                                                        `${point.date}T12:00:00`
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month:
                                                                "short",
                                                            day:
                                                                "numeric"
                                                        }
                                                    )
                                                }
                                            </text>

                                        </g>
                                    )
                                )}

                            </svg>

                        </div>
                    ) : (
                        <div className="progress-chart-empty">

                            <FaChartLine />

                            <h3>
                                No chart data yet
                            </h3>

                            <p>
                                Add progress entries to
                                display your trend.
                            </p>

                        </div>
                    )}

                </section>


                {/* Displays editable personal strength records. */}
                <section className="progress-panel records-panel">

                    <div className="progress-panel-heading">

                        <div className="progress-panel-icon">
                            <FaTrophy />
                        </div>

                        <div>
                            <p>
                                STRENGTH PROGRESS
                            </p>

                            <h2>
                                Personal Records
                            </h2>
                        </div>

                    </div>


                    <div className="record-card-grid">

                        {recordItems.map(
                            (record) => (
                                <article
                                    className="record-card"
                                    key={
                                        record.field
                                    }
                                >

                                    <div className="record-medal">
                                        <FaMedal />
                                    </div>

                                    <span>
                                        {record.label}
                                    </span>

                                    <div className="record-input-wrapper">

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={
                                                records[
                                                    record.field
                                                ]
                                            }
                                            onChange={(event) =>
                                                updateRecord(
                                                    record.field,
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                        <small>kg</small>

                                    </div>

                                </article>
                            )
                        )}

                    </div>

                    <p className="records-save-note">
                        Personal records are saved
                        automatically.
                    </p>

                </section>


                {/* Displays the history of saved progress entries. */}
                <section className="progress-panel history-panel">

                    <div className="progress-panel-heading">

                        <div className="progress-panel-icon">
                            <FaHistory />
                        </div>

                        <div>
                            <p>
                                PROGRESS HISTORY
                            </p>

                            <h2>
                                Previous Entries
                            </h2>
                        </div>

                    </div>


                    {sortedEntries.length ===
                    0 ? (
                        <div className="progress-history-empty">

                            <FaWeight />

                            <h3>
                                No progress entries
                            </h3>

                            <p>
                                Add your first weight
                                entry above.
                            </p>

                        </div>
                    ) : (
                        <div className="progress-table-wrapper">

                            <table className="progress-table">

                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Weight</th>
                                        <th>Body Fat</th>
                                        <th>Workouts</th>
                                        <th>Notes</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {sortedEntries.map(
                                        (entry) => (
                                            <tr
                                                key={
                                                    entry.id
                                                }
                                            >

                                                <td>
                                                    <div className="table-date-cell">

                                                        <FaCalendarAlt />

                                                        <span>
                                                            {
                                                                formatDate(
                                                                    entry.date
                                                                )
                                                            }
                                                        </span>

                                                    </div>
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            entry.weight
                                                        }
                                                        {" "}
                                                        kg
                                                    </strong>
                                                </td>

                                                <td>
                                                    {entry.bodyFat >
                                                    0
                                                        ? `${entry.bodyFat}%`
                                                        : "—"}
                                                </td>

                                                <td>
                                                    {
                                                        entry.workouts
                                                    }
                                                </td>

                                                <td className="progress-note-cell">
                                                    {
                                                        entry.note ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    <div className="progress-table-actions">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEditEntry(
                                                                    entry
                                                                )
                                                            }
                                                        >
                                                            <FaEdit />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="progress-delete-button"
                                                            onClick={() =>
                                                                handleDeleteEntry(
                                                                    entry.id
                                                                )
                                                            }
                                                        >
                                                            <FaTrash />
                                                        </button>

                                                    </div>
                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </section>

            </section>

        </main>
    );
}

export default Progress;