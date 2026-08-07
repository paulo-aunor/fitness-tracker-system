import {
    useEffect,
    useMemo,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import {
    FaArrowDown,
    FaChartLine,
    FaChevronUp,
    FaClock,
    FaDumbbell,
    FaEdit,
    FaExpandArrowsAlt,
    FaFire,
    FaGripHorizontal,
    FaHandRock,
    FaHome,
    FaPause,
    FaPlay,
    FaPlus,
    FaRedoAlt,
    FaRunning,
    FaSave,
    FaSignOutAlt,
    FaStopwatch,
    FaTimes,
    FaTrash,
    FaUserCircle,
    FaUtensils
} from "react-icons/fa";

import "../workout.css";
import "../customExercise.css";

//firestore CRUD wrappers for the "workouts" collection (src/services/firestoreService.js)
//used here to save a logged session, load past sessions, edit a saved
//session's note, and delete a saved session
import {
    addWorkout,
    deleteWorkout,
    getWorkouts,
    updateWorkout
} from "../services/firestoreService";

//localStorage key for exercises the user creates themselves
const STORAGE_KEY =
    "fittrack-custom-exercises";

//dropdown options for sets/reps/rest time pickers
const setOptions = [
    1,
    2,
    3,
    4,
    5,
    6
];

const repOptions = [
    5,
    6,
    8,
    10,
    12,
    15,
    20
];

const restOptions = [
    30,
    45,
    60,
    75,
    90,
    120,
    180
];

const difficultyOptions = [
    "Beginner",
    "Intermediate",
    "Advanced"
];

//the 8 muscle groups exercises get filed under
const muscleGroups = [
    {
        id: "chest",
        name: "Chest",
        description:
            "Chest and pressing movements",
        Icon: FaDumbbell
    },
    {
        id: "shoulders",
        name: "Shoulders",
        description:
            "Front, side and rear deltoids",
        Icon: FaChevronUp
    },
    {
        id: "back",
        name: "Back",
        description:
            "Lats, traps and lower back",
        Icon: FaExpandArrowsAlt
    },
    {
        id: "biceps",
        name: "Biceps",
        description:
            "Biceps and pulling strength",
        Icon: FaHandRock
    },
    {
        id: "triceps",
        name: "Triceps",
        description:
            "Triceps and pressing strength",
        Icon: FaArrowDown
    },
    {
        id: "forearms",
        name: "Forearms",
        description:
            "Grip and forearm strength",
        Icon: FaGripHorizontal
    },
    {
        id: "legs",
        name: "Legs",
        description:
            "Quads, hamstrings and calves",
        Icon: FaRunning
    },
    {
        id: "abs",
        name: "Abs",
        description:
            "Core strength and stability",
        Icon: FaFire
    }
];

//builds one built-in exercise entry (isCustom: false separates these from user-added ones)
function createExercise(
    id,
    name,
    sets,
    reps,
    restSeconds,
    difficulty
) {
    return {
        id,
        name,
        defaultSets: sets,
        defaultReps: reps,
        restSeconds,
        difficulty,
        isCustom: false
    };
}

//built-in exercise library, grouped by muscle group id
const defaultExercises = {
    chest: [
        createExercise(
            "bench-press",
            "Bench Press",
            4,
            8,
            90,
            "Intermediate"
        ),
        createExercise(
            "incline-dumbbell-press",
            "Incline Dumbbell Press",
            3,
            10,
            75,
            "Intermediate"
        ),
        createExercise(
            "push-up",
            "Push-Up",
            3,
            12,
            60,
            "Beginner"
        ),
        createExercise(
            "cable-chest-fly",
            "Cable Chest Fly",
            3,
            12,
            60,
            "Intermediate"
        )
    ],

    shoulders: [
        createExercise(
            "overhead-press",
            "Overhead Press",
            4,
            8,
            90,
            "Intermediate"
        ),
        createExercise(
            "lateral-raise",
            "Lateral Raise",
            3,
            12,
            60,
            "Beginner"
        ),
        createExercise(
            "front-raise",
            "Front Raise",
            3,
            10,
            60,
            "Beginner"
        ),
        createExercise(
            "reverse-fly",
            "Reverse Fly",
            3,
            12,
            60,
            "Intermediate"
        )
    ],

    back: [
        createExercise(
            "lat-pulldown",
            "Lat Pulldown",
            4,
            10,
            75,
            "Beginner"
        ),
        createExercise(
            "barbell-row",
            "Barbell Row",
            4,
            8,
            90,
            "Intermediate"
        ),
        createExercise(
            "seated-cable-row",
            "Seated Cable Row",
            3,
            10,
            75,
            "Beginner"
        ),
        createExercise(
            "deadlift",
            "Deadlift",
            3,
            5,
            120,
            "Advanced"
        )
    ],

    biceps: [
        createExercise(
            "barbell-curl",
            "Barbell Curl",
            3,
            10,
            60,
            "Beginner"
        ),
        createExercise(
            "dumbbell-curl",
            "Dumbbell Curl",
            3,
            10,
            60,
            "Beginner"
        ),
        createExercise(
            "hammer-curl",
            "Hammer Curl",
            3,
            12,
            60,
            "Beginner"
        ),
        createExercise(
            "preacher-curl",
            "Preacher Curl",
            3,
            12,
            60,
            "Intermediate"
        )
    ],

    triceps: [
        createExercise(
            "tricep-pushdown",
            "Tricep Pushdown",
            3,
            12,
            60,
            "Beginner"
        ),
        createExercise(
            "skull-crusher",
            "Skull Crusher",
            3,
            10,
            75,
            "Intermediate"
        ),
        createExercise(
            "dips",
            "Dips",
            3,
            8,
            75,
            "Intermediate"
        ),
        createExercise(
            "overhead-extension",
            "Overhead Tricep Extension",
            3,
            12,
            60,
            "Beginner"
        )
    ],

    forearms: [
        createExercise(
            "wrist-curl",
            "Wrist Curl",
            3,
            15,
            45,
            "Beginner"
        ),
        createExercise(
            "reverse-wrist-curl",
            "Reverse Wrist Curl",
            3,
            15,
            45,
            "Beginner"
        ),
        createExercise(
            "farmers-carry",
            "Farmer's Carry",
            4,
            10,
            60,
            "Intermediate"
        ),
        createExercise(
            "dead-hang",
            "Dead Hang",
            3,
            10,
            60,
            "Beginner"
        )
    ],

    legs: [
        createExercise(
            "barbell-squat",
            "Barbell Squat",
            4,
            8,
            120,
            "Intermediate"
        ),
        createExercise(
            "leg-press",
            "Leg Press",
            4,
            10,
            90,
            "Beginner"
        ),
        createExercise(
            "romanian-deadlift",
            "Romanian Deadlift",
            3,
            10,
            90,
            "Intermediate"
        ),
        createExercise(
            "calf-raise",
            "Standing Calf Raise",
            4,
            15,
            60,
            "Beginner"
        )
    ],

    abs: [
        createExercise(
            "crunch",
            "Crunch",
            3,
            20,
            45,
            "Beginner"
        ),
        createExercise(
            "plank",
            "Plank",
            3,
            10,
            45,
            "Beginner"
        ),
        createExercise(
            "hanging-leg-raise",
            "Hanging Leg Raise",
            3,
            12,
            60,
            "Intermediate"
        ),
        createExercise(
            "russian-twist",
            "Russian Twist",
            3,
            20,
            45,
            "Beginner"
        )
    ]
};

//reads user-created exercises out of localStorage, falls back to [] if
//nothing saved yet or the saved data is corrupted
function loadCustomExercises() {
    try {
        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!saved) {
            return [];
        }

        const parsed =
            JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : [];
    } catch (error) {
        console.error(
            "Unable to load custom exercises:",
            error
        );

        return [];
    }
}

//unique id for a new custom exercise, uses randomUUID when available
function generateExerciseId() {
    if (
        window.crypto &&
        typeof window.crypto.randomUUID ===
            "function"
    ) {
        return window.crypto.randomUUID();
    }

    return `custom-${Date.now()}`;
}

function Workout({ user }) {
    const navigate = useNavigate();

    //which muscle group tab is currently shown
    const [
        selectedGroup,
        setSelectedGroup
    ] = useState("chest");

    //exercises added to the current (unsaved) session, each with its own sets/reps
    const [
        selectedExercises,
        setSelectedExercises
    ] = useState([]);

    //user-created exercises, persisted to localStorage (see useEffect below)
    const [
        customExercises,
        setCustomExercises
    ] = useState(loadCustomExercises);

    //per-exercise sets/reps overrides, keyed by createExerciseKey() so they
    //persist even when switching muscle groups and back
    const [
        exerciseSettings,
        setExerciseSettings
    ] = useState({});

    //workout timer state
    const [
        elapsedSeconds,
        setElapsedSeconds
    ] = useState(0);

    const [
        isTimerRunning,
        setIsTimerRunning
    ] = useState(false);

    //form values for adding a new custom exercise
    const [
        customForm,
        setCustomForm
    ] = useState({
        name: "",
        groupId: "chest",
        sets: 3,
        reps: 10,
        restSeconds: 60,
        difficulty: "Beginner"
    });

    //success/error text for the custom exercise form and the save-workout action
    const [
        formMessage,
        setFormMessage
    ] = useState("");

    const [
        formError,
        setFormError
    ] = useState("");

    // Workouts loaded from Firestore (via getWorkouts), shown in the
    // "Workout History" section below the session builder.
    const [
        savedWorkouts,
        setSavedWorkouts
    ] = useState([]);

    const [
        isLoadingHistory,
        setIsLoadingHistory
    ] = useState(true);

    const [
        isSavingWorkout,
        setIsSavingWorkout
    ] = useState(false);

    // Separate from formError/formMessage above -- those are for the
    // custom-exercise form, this is for the history list (load/save/
    // delete/note errors), so the two don't stomp on each other.
    const [
        historyError,
        setHistoryError
    ] = useState("");

    // Tracks which saved workout (by id) currently has its note field open
    // for editing. null means no card is being edited.
    const [
        editingNoteId,
        setEditingNoteId
    ] = useState(null);

    const [
        noteDraft,
        setNoteDraft
    ] = useState("");

    const memberName =
        user?.displayName || "Demo User";

    const memberEmail =
        user?.email || "demo@fitness.com";

    //full muscleGroups entry for whichever group is selected
    const activeGroup =
        muscleGroups.find(
            (group) =>
                group.id === selectedGroup
        );

    //built-in + custom exercises for the currently selected muscle group
    const activeExercises =
        useMemo(() => {
            const builtIn =
                defaultExercises[
                    selectedGroup
                ] || [];

            const custom =
                customExercises.filter(
                    (exercise) =>
                        exercise.groupId ===
                        selectedGroup
                );

            return [
                ...builtIn,
                ...custom
            ];
        }, [
            selectedGroup,
            customExercises
        ]);

    //sum of sets across every exercise in the current session
    const totalSets =
        useMemo(() => {
            return selectedExercises.reduce(
                (total, exercise) =>
                    total +
                    Number(exercise.sets),
                0
            );
        }, [selectedExercises]);

    //persists customExercises to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                customExercises
            )
        );
    }, [customExercises]);

    //ticks elapsedSeconds up by 1 every second while the timer is running
    useEffect(() => {
        if (!isTimerRunning) {
            return undefined;
        }

        const timerId =
            window.setInterval(() => {
                setElapsedSeconds(
                    (seconds) =>
                        seconds + 1
                );
            }, 1000);

        return () => {
            window.clearInterval(
                timerId
            );
        };
    }, [isTimerRunning]);

    //load the user's saved workouts from firestore once, when the page
    //first mounts. runs async work inside an inner function since the
    //useEffect callback itself can't be async directly
    useEffect(() => {
        async function loadHistory() {
            try {
                const workouts = await getWorkouts();

                //show the most recently logged workout first
                const sortedWorkouts = [...workouts].sort(
                    (a, b) =>
                        new Date(b.loggedAt) - new Date(a.loggedAt)
                );

                setSavedWorkouts(sortedWorkouts);
            } catch {
                setHistoryError(
                    "Could not load your workout history. Please refresh the page."
                );
            } finally {
                setIsLoadingHistory(false);
            }
        }

        loadHistory();
    }, []);

    //formats a seconds count as HH:MM:SS for the timer display
    function formatTime(seconds) {
        const hours =
            Math.floor(
                seconds / 3600
            );

        const minutes =
            Math.floor(
                (seconds % 3600) /
                60
            );

        const remainingSeconds =
            seconds % 60;

        return [
            hours,
            minutes,
            remainingSeconds
        ]
            .map((value) =>
                String(value).padStart(
                    2,
                    "0"
                )
            )
            .join(":");
    }

    //unique key for one exercise within one muscle group, used to track
    //per-exercise settings and session selection
    function createExerciseKey(
        exercise,
        groupId = selectedGroup
    ) {
        return `${groupId}-${exercise.id}`;
    }

    //current sets/reps for an exercise -- either a saved override, or the exercise's own defaults
    function getExerciseSettings(
        exercise
    ) {
        const key =
            createExerciseKey(
                exercise
            );

        return (
            exerciseSettings[key] || {
                sets:
                    exercise.defaultSets,
                reps:
                    exercise.defaultReps
            }
        );
    }

    //saves a sets/reps override for one exercise (used before it's added to the session)
    function updateExerciseSetting(
        exercise,
        field,
        value
    ) {
        const key =
            createExerciseKey(
                exercise
            );

        const currentSettings =
            getExerciseSettings(
                exercise
            );

        setExerciseSettings(
            (current) => ({
                ...current,

                [key]: {
                    ...currentSettings,
                    [field]:
                        Number(value)
                }
            })
        );
    }

    //toggles an exercise in/out of the current session
    function addOrRemoveExercise(
        exercise
    ) {
        const key =
            createExerciseKey(
                exercise
            );

        const alreadySelected =
            selectedExercises.some(
                (item) =>
                    item.key === key
            );

        if (alreadySelected) {
            setSelectedExercises(
                (current) =>
                    current.filter(
                        (item) =>
                            item.key !== key
                    )
            );

            return;
        }

        const settings =
            getExerciseSettings(
                exercise
            );

        setSelectedExercises(
            (current) => [
                ...current,

                {
                    ...exercise,
                    key,
                    groupId:
                        selectedGroup,
                    groupName:
                        activeGroup?.name ||
                        selectedGroup,
                    sets:
                        settings.sets,
                    reps:
                        settings.reps
                }
            ]
        );
    }

    //updates sets/reps for an exercise that's already in the session
    function updateSessionExercise(
        key,
        field,
        value
    ) {
        setSelectedExercises(
            (current) =>
                current.map(
                    (exercise) =>
                        exercise.key === key
                            ? {
                                ...exercise,
                                [field]:
                                    Number(
                                        value
                                    )
                            }
                            : exercise
                )
        );
    }

    //updates one field in the custom-exercise form
    function updateCustomForm(
        field,
        value
    ) {
        setCustomForm(
            (current) => ({
                ...current,
                [field]: value
            })
        );
    }

    //validates + saves a new custom exercise, then switches to its muscle group
    function addCustomExercise(
        event
    ) {
        event.preventDefault();

        setFormError("");
        setFormMessage("");

        const cleanName =
            customForm.name.trim();

        if (cleanName.length < 2) {
            setFormError(
                "Enter an exercise name."
            );

            return;
        }

        const exercisesInGroup = [
            ...(
                defaultExercises[
                    customForm.groupId
                ] || []
            ),

            ...customExercises.filter(
                (exercise) =>
                    exercise.groupId ===
                    customForm.groupId
            )
        ];

        const duplicate =
            exercisesInGroup.some(
                (exercise) =>
                    exercise.name
                        .toLowerCase() ===
                    cleanName.toLowerCase()
            );

        if (duplicate) {
            setFormError(
                "This exercise already exists."
            );

            return;
        }

        const newExercise = {
            id: generateExerciseId(),
            name: cleanName,
            groupId:
                customForm.groupId,
            defaultSets:
                Number(
                    customForm.sets
                ),
            defaultReps:
                Number(
                    customForm.reps
                ),
            restSeconds:
                Number(
                    customForm.restSeconds
                ),
            difficulty:
                customForm.difficulty,
            isCustom: true
        };

        setCustomExercises(
            (current) => [
                ...current,
                newExercise
            ]
        );

        setSelectedGroup(
            customForm.groupId
        );

        setCustomForm(
            (current) => ({
                ...current,
                name: ""
            })
        );

        setFormMessage(
            `${cleanName} was added successfully.`
        );
    }

    //removes a custom exercise entirely, and drops it from the session if it was added
    function deleteCustomExercise(
        exercise
    ) {
        const key =
            createExerciseKey(
                exercise,
                exercise.groupId
            );

        setCustomExercises(
            (current) =>
                current.filter(
                    (item) =>
                        item.id !==
                        exercise.id
                )
        );

        setSelectedExercises(
            (current) =>
                current.filter(
                    (item) =>
                        item.key !== key
                )
        );
    }

    //clears the current session and resets the timer, without saving anything
    function clearSession() {
        setSelectedExercises([]);
        setIsTimerRunning(false);
        setElapsedSeconds(0);
    }

    //saves the current session (selected exercises + timer) as a new
    //document in the "workouts" firestore collection via addWorkout
    async function handleSaveWorkout() {
        if (selectedExercises.length === 0) {
            return;
        }

        setIsSavingWorkout(true);
        setFormError("");
        setFormMessage("");

        //trim each exercise down to just the fields worth keeping in the
        //saved record -- selectedExercises also carries UI-only fields
        //(key, groupId, difficulty, etc.) that don't need to live in firestore
        const workoutData = {
            exercises: selectedExercises.map((exercise) => ({
                name: exercise.name,
                groupName: exercise.groupName,
                sets: exercise.sets,
                reps: exercise.reps
            })),
            totalSets,
            durationSeconds: elapsedSeconds,
            loggedAt: new Date().toISOString()
        };

        try {
            const id = await addWorkout(workoutData);

            //put the new workout at the top of the history list right
            //away instead of waiting on a full refetch from firestore
            setSavedWorkouts((current) => [
                { id, ...workoutData },
                ...current
            ]);

            setFormMessage("Workout saved to your history.");
            clearSession();
        } catch {
            setFormError("Could not save this workout. Please try again.");
        } finally {
            setIsSavingWorkout(false);
        }
    }

    //deletes a saved workout from firestore and removes it from the list
    async function handleDeleteWorkout(id) {
        try {
            await deleteWorkout(id);

            setSavedWorkouts((current) =>
                current.filter((workout) => workout.id !== id)
            );
        } catch {
            setHistoryError(
                "Could not delete that workout. Please try again."
            );
        }
    }

    //opens the note editor on a specific saved workout card
    function startEditingNote(workout) {
        setEditingNoteId(workout.id);
        setNoteDraft(workout.notes || "");
    }

    //saves the note draft to firestore via updateWorkout, then updates the
    //matching card in local state so the UI reflects it immediately
    async function saveNote(id) {
        try {
            await updateWorkout(id, { notes: noteDraft });

            setSavedWorkouts((current) =>
                current.map((workout) =>
                    workout.id === id
                        ? { ...workout, notes: noteDraft }
                        : workout
                )
            );

            setEditingNoteId(null);
        } catch {
            setHistoryError("Could not save that note. Please try again.");
        }
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
                        onClick={() =>
                            navigate("/home")
                        }
                    >
                        <FaHome />
                        <span>Dashboard</span>
                    </button>

                    <button
                        type="button"
                        className="sidebar-link active"
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

            <section className="dashboard-content workout-content">
                {/* exercise count, total sets, elapsed time -- all read from state above */}
                <header className="workout-page-header">
                    <div className="workout-heading">
                        <p className="workout-kicker">
                            TRAINING LIBRARY
                        </p>

                        <h1>
                            Build Your Workout
                            <span>.</span>
                        </h1>

                        <p>
                            Add custom exercises,
                            select sets and reps,
                            and track workout time.
                        </p>
                    </div>

                    <div className="workout-summary">
                        <div className="summary-chip">
                            <strong>
                                {
                                    selectedExercises
                                        .length
                                }
                            </strong>

                            <span>Exercises</span>
                        </div>

                        <div className="summary-chip">
                            <strong>
                                {totalSets}
                            </strong>

                            <span>Total Sets</span>
                        </div>

                        <div className="summary-chip">
                            <strong>
                                {
                                    formatTime(
                                        elapsedSeconds
                                    )
                                }
                            </strong>

                            <span>Elapsed Time</span>
                        </div>
                    </div>
                </header>

                {/* form for adding a custom exercise, calls addCustomExercise on submit */}
                <section className="custom-exercise-section">
                    <div className="custom-exercise-heading">
                        <div>
                            <p>CUSTOM EXERCISE</p>

                            <h2>
                                Add Your Own Exercise
                            </h2>

                            <span>
                                Enter your exercise
                                information below.
                            </span>
                        </div>

                        <FaPlus />
                    </div>

                    <form
                        className="custom-exercise-form"
                        onSubmit={
                            addCustomExercise
                        }
                    >
                        <div className="custom-form-grid">
                            <div className="custom-form-field exercise-name-field">
                                <label htmlFor="customName">
                                    Exercise Name
                                </label>

                                <input
                                    id="customName"
                                    type="text"
                                    placeholder="Example: Machine Chest Press"
                                    value={
                                        customForm.name
                                    }
                                    onChange={(event) =>
                                        updateCustomForm(
                                            "name",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                />
                            </div>

                            <div className="custom-form-field">
                                <label htmlFor="customGroup">
                                    Muscle Group
                                </label>

                                <select
                                    id="customGroup"
                                    value={
                                        customForm.groupId
                                    }
                                    onChange={(event) =>
                                        updateCustomForm(
                                            "groupId",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                >
                                    {muscleGroups.map(
                                        (group) => (
                                            <option
                                                key={
                                                    group.id
                                                }
                                                value={
                                                    group.id
                                                }
                                            >
                                                {
                                                    group.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="custom-form-field">
                                <label htmlFor="customSets">
                                    Default Sets
                                </label>

                                <select
                                    id="customSets"
                                    value={
                                        customForm.sets
                                    }
                                    onChange={(event) =>
                                        updateCustomForm(
                                            "sets",
                                            Number(
                                                event
                                                    .target
                                                    .value
                                            )
                                        )
                                    }
                                >
                                    {setOptions.map(
                                        (option) => (
                                            <option
                                                key={
                                                    option
                                                }
                                                value={
                                                    option
                                                }
                                            >
                                                {option}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="custom-form-field">
                                <label htmlFor="customReps">
                                    Default Reps
                                </label>

                                <select
                                    id="customReps"
                                    value={
                                        customForm.reps
                                    }
                                    onChange={(event) =>
                                        updateCustomForm(
                                            "reps",
                                            Number(
                                                event
                                                    .target
                                                    .value
                                            )
                                        )
                                    }
                                >
                                    {repOptions.map(
                                        (option) => (
                                            <option
                                                key={
                                                    option
                                                }
                                                value={
                                                    option
                                                }
                                            >
                                                {option}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="custom-form-field">
                                <label htmlFor="customRest">
                                    Rest Time
                                </label>

                                <select
                                    id="customRest"
                                    value={
                                        customForm
                                            .restSeconds
                                    }
                                    onChange={(event) =>
                                        updateCustomForm(
                                            "restSeconds",
                                            Number(
                                                event
                                                    .target
                                                    .value
                                            )
                                        )
                                    }
                                >
                                    {restOptions.map(
                                        (option) => (
                                            <option
                                                key={
                                                    option
                                                }
                                                value={
                                                    option
                                                }
                                            >
                                                {option} sec
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="custom-form-field">
                                <label htmlFor="customDifficulty">
                                    Difficulty
                                </label>

                                <select
                                    id="customDifficulty"
                                    value={
                                        customForm
                                            .difficulty
                                    }
                                    onChange={(event) =>
                                        updateCustomForm(
                                            "difficulty",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                >
                                    {difficultyOptions.map(
                                        (option) => (
                                            <option
                                                key={
                                                    option
                                                }
                                                value={
                                                    option
                                                }
                                            >
                                                {option}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>

                        {formError && (
                            <p className="custom-form-error">
                                {formError}
                            </p>
                        )}

                        {formMessage && (
                            <p className="custom-form-success">
                                {formMessage}
                            </p>
                        )}

                        <div className="custom-form-actions">
                            <button
                                type="button"
                                className="cancel-custom-button"
                                onClick={() => {
                                    setCustomForm(
                                        (current) => ({
                                            ...current,
                                            name: ""
                                        })
                                    );

                                    setFormError("");
                                    setFormMessage("");
                                }}
                            >
                                <FaRedoAlt />
                                Clear Form
                            </button>

                            <button
                                type="submit"
                                className="save-custom-button"
                            >
                                <FaSave />
                                Add Exercise
                            </button>
                        </div>
                    </form>
                </section>

                {/* muscle group tabs -- clicking one sets selectedGroup, which drives activeExercises below */}
                <section className="muscle-section">
                    <div className="workout-section-heading">
                        <div>
                            <p>STEP 01</p>

                            <h2>
                                Select a Muscle Group
                            </h2>
                        </div>

                        <span>
                            {muscleGroups.length}
                            {" "}
                            muscle groups
                        </span>
                    </div>

                    <div className="muscle-group-grid">
                        {muscleGroups.map(
                            (group) => {
                                const Icon =
                                    group.Icon;

                                const customCount =
                                    customExercises.filter(
                                        (exercise) =>
                                            exercise
                                                .groupId ===
                                            group.id
                                    ).length;

                                return (
                                    <button
                                        type="button"
                                        key={
                                            group.id
                                        }
                                        className={
                                            selectedGroup ===
                                            group.id
                                                ? "muscle-group-card active"
                                                : "muscle-group-card"
                                        }
                                        onClick={() =>
                                            setSelectedGroup(
                                                group.id
                                            )
                                        }
                                    >
                                        <div className="muscle-group-icon">
                                            <Icon />
                                        </div>

                                        <div>
                                            <strong>
                                                {
                                                    group.name
                                                }
                                            </strong>

                                            <small>
                                                {
                                                    group.description
                                                }
                                            </small>

                                            {customCount >
                                                0 && (
                                                <span className="muscle-custom-count">
                                                    {
                                                        customCount
                                                    }
                                                    {" "}
                                                    custom
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            }
                        )}
                    </div>
                </section>

                {/* left: exercise picker for the selected muscle group. right: the session-in-progress panel */}
                <section className="workout-exercise-layout">
                    <div className="exercise-library">
                        <div className="workout-section-heading">
                            <div>
                                <p>STEP 02</p>

                                <h2>
                                    {
                                        activeGroup?.name
                                    }
                                    {" "}
                                    Exercises
                                </h2>
                            </div>

                            <span>
                                {
                                    activeExercises
                                        .length
                                }
                                {" "}
                                exercises
                            </span>
                        </div>

                        <div className="workout-exercise-grid">
                            {activeExercises.map(
                                (
                                    exercise,
                                    index
                                ) => {
                                    const key =
                                        createExerciseKey(
                                            exercise
                                        );

                                    const settings =
                                        getExerciseSettings(
                                            exercise
                                        );

                                    const selected =
                                        selectedExercises.some(
                                            (item) =>
                                                item.key ===
                                                key
                                        );

                                    return (
                                        <article
                                            key={
                                                exercise.id
                                            }
                                            className={
                                                selected
                                                    ? "workout-exercise-card selected"
                                                    : "workout-exercise-card"
                                            }
                                        >
                                            <div className="workout-exercise-card-header">
                                                <span className="exercise-number">
                                                    {
                                                        String(
                                                            index +
                                                                1
                                                        ).padStart(
                                                            2,
                                                            "0"
                                                        )
                                                    }
                                                </span>

                                                <div className="exercise-card-actions">
                                                    {exercise.isCustom && (
                                                        <span className="custom-exercise-badge">
                                                            Custom
                                                        </span>
                                                    )}

                                                    <span className="exercise-level">
                                                        {
                                                            exercise
                                                                .difficulty
                                                        }
                                                    </span>

                                                    {exercise.isCustom && (
                                                        <button
                                                            type="button"
                                                            className="delete-custom-exercise-button"
                                                            onClick={() =>
                                                                deleteCustomExercise(
                                                                    exercise
                                                                )
                                                            }
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <h3>
                                                {
                                                    exercise.name
                                                }
                                            </h3>

                                            <div className="exercise-customize-grid">
                                                <label>
                                                    <span>
                                                        Sets
                                                    </span>

                                                    <select
                                                        value={
                                                            settings.sets
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateExerciseSetting(
                                                                exercise,
                                                                "sets",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        {setOptions.map(
                                                            (
                                                                option
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        option
                                                                    }
                                                                    value={
                                                                        option
                                                                    }
                                                                >
                                                                    {
                                                                        option
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </label>

                                                <label>
                                                    <span>
                                                        Reps
                                                    </span>

                                                    <select
                                                        value={
                                                            settings.reps
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateExerciseSetting(
                                                                exercise,
                                                                "reps",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        {repOptions.map(
                                                            (
                                                                option
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        option
                                                                    }
                                                                    value={
                                                                        option
                                                                    }
                                                                >
                                                                    {
                                                                        option
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </label>

                                                <div className="exercise-rest-box">
                                                    <span>
                                                        Rest
                                                    </span>

                                                    <strong>
                                                        {
                                                            exercise
                                                                .restSeconds
                                                        }
                                                        {" "}
                                                        sec
                                                    </strong>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                className={
                                                    selected
                                                        ? "exercise-add-button added"
                                                        : "exercise-add-button"
                                                }
                                                onClick={() =>
                                                    addOrRemoveExercise(
                                                        exercise
                                                    )
                                                }
                                            >
                                                {selected ? (
                                                    <>
                                                        <FaTimes />
                                                        Remove
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaPlus />
                                                        Add to Session
                                                    </>
                                                )}
                                            </button>
                                        </article>
                                    );
                                }
                            )}
                        </div>
                    </div>

                    {/* current (unsaved) session -- exercises, timer, and the save/clear actions */}
                    <aside className="session-panel">
                        <div className="session-panel-header">
                            <div>
                                <p>YOUR SESSION</p>
                                <h2>Workout Plan</h2>
                            </div>

                            <div className="session-count">
                                {
                                    selectedExercises
                                        .length
                                }
                            </div>
                        </div>

                        <div className="workout-timer-card">
                            <div className="timer-icon">
                                <FaStopwatch />
                            </div>

                            <div className="timer-information">
                                <span>
                                    Workout Time
                                </span>

                                <strong>
                                    {
                                        formatTime(
                                            elapsedSeconds
                                        )
                                    }
                                </strong>
                            </div>

                            <div
                                className={
                                    isTimerRunning
                                        ? "timer-status running"
                                        : "timer-status paused"
                                }
                            >
                                {isTimerRunning
                                    ? "Running"
                                    : "Paused"}
                            </div>
                        </div>

                        {selectedExercises.length ===
                        0 ? (
                            <div className="session-empty">
                                <FaDumbbell />

                                <strong>
                                    No exercises added
                                </strong>

                                <p>
                                    Add exercises to
                                    create your workout.
                                </p>
                            </div>
                        ) : (
                            <div className="session-list">
                                {selectedExercises.map(
                                    (
                                        exercise,
                                        index
                                    ) => (
                                        <div
                                            className="session-list-item"
                                            key={
                                                exercise.key
                                            }
                                        >
                                            <div className="session-item-top">
                                                <div className="session-item-number">
                                                    {
                                                        index +
                                                        1
                                                    }
                                                </div>

                                                <div className="session-item-info">
                                                    <strong>
                                                        {
                                                            exercise
                                                                .name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            exercise
                                                                .groupName
                                                        }
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="session-remove-button"
                                                    onClick={() =>
                                                        setSelectedExercises(
                                                            (
                                                                current
                                                            ) =>
                                                                current.filter(
                                                                    (
                                                                        item
                                                                    ) =>
                                                                        item.key !==
                                                                        exercise.key
                                                                )
                                                        )
                                                    }
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>

                                            <div className="session-edit-controls">
                                                <label>
                                                    <span>
                                                        Sets
                                                    </span>

                                                    <select
                                                        value={
                                                            exercise.sets
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateSessionExercise(
                                                                exercise.key,
                                                                "sets",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        {setOptions.map(
                                                            (
                                                                option
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        option
                                                                    }
                                                                    value={
                                                                        option
                                                                    }
                                                                >
                                                                    {
                                                                        option
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </label>

                                                <label>
                                                    <span>
                                                        Reps
                                                    </span>

                                                    <select
                                                        value={
                                                            exercise.reps
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateSessionExercise(
                                                                exercise.key,
                                                                "reps",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        {repOptions.map(
                                                            (
                                                                option
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        option
                                                                    }
                                                                    value={
                                                                        option
                                                                    }
                                                                >
                                                                    {
                                                                        option
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </label>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        <div className="session-total">
                            <div>
                                <FaClock />

                                <span>
                                    Estimated workout
                                </span>
                            </div>

                            <strong>
                                {totalSets * 2}
                                {" "}
                                min
                            </strong>
                        </div>

                        {isTimerRunning ? (
                            <button
                                type="button"
                                className="session-pause-button"
                                onClick={() =>
                                    setIsTimerRunning(
                                        false
                                    )
                                }
                            >
                                <FaPause />
                                Pause Timer
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="session-start-button"
                                onClick={() =>
                                    setIsTimerRunning(
                                        true
                                    )
                                }
                                disabled={
                                    selectedExercises
                                        .length === 0
                                }
                            >
                                <FaPlay />

                                {elapsedSeconds > 0
                                    ? "Resume Timer"
                                    : "Start Timer"}
                            </button>
                        )}

                        <button
                            type="button"
                            className="session-reset-button"
                            onClick={() => {
                                setIsTimerRunning(
                                    false
                                );

                                setElapsedSeconds(
                                    0
                                );
                            }}
                            disabled={
                                elapsedSeconds === 0
                            }
                        >
                            <FaRedoAlt />
                            Reset Timer
                        </button>

                        {/* saves the current session to firestore (addWorkout), then
                            clears it -- disabled while empty or already saving so it
                            can't be double-clicked into two firestore writes */}
                        <button
                            type="button"
                            className="session-start-button"
                            onClick={handleSaveWorkout}
                            disabled={
                                selectedExercises.length === 0 ||
                                isSavingWorkout
                            }
                        >
                            <FaSave />
                            {isSavingWorkout
                                ? "Saving..."
                                : "Save Workout"}
                        </button>

                        <button
                            type="button"
                            className="session-clear-button"
                            onClick={
                                clearSession
                            }
                            disabled={
                                selectedExercises
                                    .length === 0
                            }
                        >
                            <FaTimes />
                            Clear Session
                        </button>
                    </aside>
                </section>

                {/*
                  workout history, backed by firestore (addWorkout/getWorkouts/
                  updateWorkout/deleteWorkout in src/services/firestoreService.js).
                  separate section from the exercise-builder layout above --
                  this just lists what's already been saved
                */}
                <section className="workout-history-section">
                    <div className="workout-history-header">
                        <h2>Workout History</h2>
                        <span>Workouts you have saved to your account.</span>
                    </div>

                    {historyError && (
                        <p className="form-error">{historyError}</p>
                    )}

                    {isLoadingHistory ? (
                        <p>Loading your workout history...</p>
                    ) : savedWorkouts.length === 0 ? (
                        <div className="session-empty">
                            <FaDumbbell />
                            <strong>No saved workouts yet</strong>
                            <p>
                                Build a session above, then click "Save
                                Workout" to log it here.
                            </p>
                        </div>
                    ) : (
                        <div className="workout-history-list">
                            {savedWorkouts.map((workout) => (
                                <div
                                    className="workout-history-item"
                                    key={workout.id}
                                >
                                    <div className="workout-history-item-top">
                                        <strong>
                                            {new Date(
                                                workout.loggedAt
                                            ).toLocaleDateString()}
                                        </strong>

                                        <span>
                                            {formatTime(
                                                workout.durationSeconds
                                            )}
                                        </span>

                                        <button
                                            type="button"
                                            className="session-remove-button"
                                            onClick={() =>
                                                handleDeleteWorkout(
                                                    workout.id
                                                )
                                            }
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>

                                    <p>{workout.totalSets} total sets</p>

                                    <ul>
                                        {workout.exercises.map(
                                            (exercise, index) => (
                                                <li
                                                    key={`${workout.id}-${index}`}
                                                >
                                                    {exercise.name} --{" "}
                                                    {exercise.sets} x{" "}
                                                    {exercise.reps}
                                                </li>
                                            )
                                        )}
                                    </ul>

                                    {editingNoteId === workout.id ? (
                                        <div className="workout-history-note-edit">
                                            <input
                                                type="text"
                                                value={noteDraft}
                                                onChange={(event) =>
                                                    setNoteDraft(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Add a note about this workout..."
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    saveNote(workout.id)
                                                }
                                            >
                                                Save Note
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="workout-history-note-display">
                                            <p>
                                                {workout.notes ||
                                                    "No notes yet."}
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    startEditingNote(workout)
                                                }
                                            >
                                                <FaEdit />
                                                {workout.notes
                                                    ? "Edit Note"
                                                    : "Add Note"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </section>
        </main>
    );
}

export default Workout;