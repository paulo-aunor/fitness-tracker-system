# User Flows

How someone actually moves through the app, end to end. For what each screen does technically, see [`CODEBASE.md`](./CODEBASE.md). For what was tested and the results, see [`TEST_CASES.md`](./TEST_CASES.md).

## App map

Every page below `/home` shares the same sidebar (Dashboard / Workouts / Food Log / Calories / Progress / Log Out) — from anywhere in the app, every other page is one click away.

```mermaid
flowchart LR
    Login["/  (Login)"] -->|valid credentials| Home["/home  (Dashboard)"]
    Login -->|"Sign up" link| Signup["/signup"]
    Login -->|"Forgot password?"| Forgot["/forgot-password"]
    Signup -->|account created| Home
    Forgot -->|email sent| Login

    Home <--> Workouts["/workouts"]
    Home <--> FoodLog["/food-log"]
    Home <--> Calories["/calories"]
    Home <--> Progress["/progress"]
    Workouts <--> FoodLog
    Workouts <--> Calories
    Workouts <--> Progress
    FoodLog <--> Calories
    FoodLog <--> Progress
    Calories <--> Progress

    Home -->|"Log Out"| Login
    Workouts -->|"Log Out"| Login
    FoodLog -->|"Log Out"| Login
    Calories -->|"Log Out"| Login
    Progress -->|"Log Out"| Login
```

Every page except Login/Signup/Forgot-Password is behind `ProtectedRoute` — typing any of those URLs directly while logged out redirects straight back to `/`.

## New user: sign up → first look at the dashboard

```mermaid
sequenceDiagram
    actor U as User
    participant S as Signup page
    participant FB as Firebase Auth
    participant H as Home dashboard

    U->>S: Fill name / email / password / confirm
    S->>S: Validate (name length, password length, passwords match)
    alt validation fails
        S-->>U: Show inline error, stay on page
    else validation passes
        S->>FB: createUserWithEmailAndPassword
        FB-->>S: Account created
        S->>FB: updateProfile(displayName)
        S->>H: navigate to /home
        H->>FB: getDailyNutrition, getWeightLogs, getWorkouts (all empty for a new account)
        H-->>U: Dashboard renders with honest empty states -- no invented numbers
    end
```

A brand-new account shows real zeros and empty states everywhere, not placeholder demo data — there's nothing to fake, since nothing's been logged yet.

## Logging a workout

```mermaid
flowchart TD
    A["Open /workouts"] --> B["Pick a muscle group"]
    B --> C["Click 'ADD TO SESSION' on an exercise"]
    C --> D{"Add more exercises?"}
    D -->|yes| B
    D -->|no| E["Optionally start the timer"]
    E --> F["Click 'SAVE WORKOUT'"]
    F --> G["addWorkout() writes to Firestore, scoped to this user"]
    G --> H["Session clears, workout appears in History"]
    H --> I["Optionally: Add Note, or Delete"]
```

Saved workouts are scoped to the logged-in user (`userId`), so logging in on a different device shows the same history.

## Logging food (three ways, one destination)

```mermaid
flowchart TD
    Start["Open /food-log"] --> Choice{"How to add a food?"}
    Choice -->|"pick from curated list"| Curated["Gym Food Library card -> 'Use This Food'"]
    Choice -->|"search the real world"| API["'Search Online' -> Open Food Facts API"]
    Choice -->|"just log calories"| Quick["Quick Add panel (calories only, no macros)"]

    Curated --> Form["Add/Edit Food form"]
    API --> Form
    Form --> Save["Click 'Add Food'"]
    Quick --> Save2["Submit Quick Add"]

    Save --> Local["Written instantly to this day's local food log"]
    Save2 --> Local
    Local --> Mirror["Mirrored to Firestore in the background\n(addMeal/updateMeal, plus saveDailyNutrition for the day's totals)"]
    Mirror --> Dashboard["Home dashboard's 'today' numbers read from the mirrored totals"]
```

The local write is what the user sees instantly — the Firestore mirror happens after, without blocking the UI. If it fails (offline, etc.), the entry still exists locally; only the cross-device sync is what's at risk.

## Food log syncing across devices

```mermaid
sequenceDiagram
    actor U as User
    participant D1 as Device A
    participant FS as Firestore (meals collection)
    participant D2 as Device B

    U->>D1: Log a food entry
    D1->>D1: Save to localStorage (instant)
    D1->>FS: addMeal(id, data) -- fire and forget
    Note over U,D2: later, different device, same account
    U->>D2: Log in, open Food Log
    D2->>FS: getMeals(uid)
    FS-->>D2: Every synced entry for this user
    D2->>D2: Merge into local food log, keyed by id (no duplicates)
    D2-->>U: The entry from Device A is here
```

This is the piece that was missing for most of development — see `TEST_CASES.md`'s meal-sync section for how it was verified, and `CODEBASE.md` for the id-matching detail that makes edits/deletes work without a round-trip.

## Calculating and tracking calorie targets

```mermaid
flowchart TD
    A["Open /calories"] --> B["Weight field prefills from the last weight logged on /home"]
    B --> C["Fill in gender, age, height, activity level, goal"]
    C --> D["calculateBMR -> calculateTDEE -> calculateTargetCalories\n(pure functions, recalculate on every change)"]
    D --> E{"Valid inputs?"}
    E -->|no| F["Show 'Enter valid information'"]
    E -->|yes| G["Show target calories + macro breakdown"]
```

`Calories.jsx` only *reads* weight — logging a new weight happens back on the dashboard (see below), which is what this page's prefill reflects.

## Logging body weight from the dashboard

```mermaid
flowchart TD
    A["On /home, type a weight into 'Log weight'"] --> B["Click Log"]
    B --> C["addWeightLog({userId, weight, date}) to Firestore"]
    C --> D["Re-fetch getWeightLogs -- dashboard card updates immediately"]
    D --> E["Next visit to /calories prefills from this same weight"]
```

## Signing out

```mermaid
flowchart TD
    A["Click 'Log Out' on any page"] --> B["signOut(auth) ends the Firebase session"]
    B --> C["navigate('/')"]
    C --> D["Any protected route now redirects back to /\n(typed URL, back button, refresh -- all rejected)"]
```

This flow used to skip step B entirely (see `TEST_CASES.md`, Bug #1) — the button navigated back to the login screen without ending the Firebase session underneath, so a protected route was still reachable afterward. Fixed and verified across all five pages.
