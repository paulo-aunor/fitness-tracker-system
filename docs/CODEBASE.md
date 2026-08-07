# Codebase Guide

This explains what each page, component, and service does, how it works, and how data flows through the app. Written for anyone new to the codebase who needs to make changes without re-deriving all of this from scratch.

For setup/installation, see the main [README](../README.md).

## App shell

### `src/main.jsx`
Entry point. Wraps `<App />` in `<BrowserRouter>` so `react-router-dom` routing works, and renders into `#root`.

### `src/firebase.jsx`
Initializes the Firebase app from env vars (`VITE_FIREBASE_*`, set in `.env.local`) and exports two things every other file imports from here:
- `auth` — the Firebase Auth instance, used by Login/Signup/ForgotPassword and `App.jsx`'s login-state listener.
- `db` — the Firestore instance, used by `firestoreService.js`.

### `src/App.jsx`
Owns routing and the app's login state.

- On mount, subscribes to `onAuthStateChanged(auth, ...)`, which fires whenever the user logs in or out (including on page refresh, once Firebase resolves the existing session). This is stored in `user` state; `loading` is true until that first check resolves, showing a "Loading..." screen so protected routes don't flash the login page before Firebase has had a chance to say whether someone's logged in.
- Defines all routes. `/`, `/signup`, `/forgot-password` are public. `/home`, `/workouts`, `/food-log`, `/calories` are each wrapped in `<ProtectedRoute user={user}>`, which redirects to `/` if `user` is null.
- Also runs a `useEffect` that adds a single click listener on `document` for sidebar navigation — every page's sidebar buttons have class `sidebar-link`, and this listener reads the button's text and looks it up in `routeByLabel` to navigate. This is why sidebar nav works identically across every page despite each page defining its own sidebar JSX independently (there's no shared `<Sidebar>` component — it's duplicated per page).

## Auth pages

### `src/pages/Login.jsx`
Email/password form. On submit, calls `signInWithEmailAndPassword(auth, email, password)`. On success, navigates to `/home`; on failure, shows `error.message` in red text above the form. `App.jsx`'s `onAuthStateChanged` listener is what actually updates the app's logged-in state — this page doesn't set any global state itself, it just triggers the Firebase call and lets that propagate.

### `src/pages/Signup.jsx`
Similar shape, plus client-side validation before hitting Firebase: full name ≥ 2 characters, password ≥ 6 characters, password === confirm password. Calls `createUserWithEmailAndPassword`, then `updateProfile(user, { displayName })` so the name shows up elsewhere (sidebar, greeting text) without a separate Firestore write. Maps specific Firebase error codes (`auth/email-already-in-use`, `auth/invalid-email`, `auth/weak-password`) to friendlier messages.

### `src/pages/ForgotPassword.jsx`
Single email field, calls `sendPasswordResetEmail(auth, email)`. Firebase handles the actual email + reset flow; this page just triggers it and shows a success/error message.

### `src/components/ProtectedRoute.jsx`
```jsx
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/" replace />;
  return children;
}
```
That's the whole thing. Wrap any route element in this, pass the current `user` from `App.jsx`, and it redirects unauthenticated visitors to the login page instead of rendering `children`.

### `src/components/PasswordInput.jsx`
A password `<input>` with a show/hide toggle button (eye icon). Fully controlled — takes `value`/`onChange` from the parent, holds no data of its own besides the show/hide boolean. Used by Login, Signup, and (originally) `Auth.jsx`.

## Dashboard pages

All four of these share the same sidebar markup (duplicated per file, see `App.jsx` notes above) and the same `.dashboard-page` / `.dashboard-sidebar` / `.dashboard-content` CSS class structure.

### `src/pages/Home.jsx`
The landing dashboard after login. **Currently all placeholder data** — calorie totals, protein numbers, "Next Session" workout, body weight, etc. are hardcoded JSX, not read from Firestore or any of the other pages' state. Only real behavior: `handleLogout` navigates to `/`, and the quick-action cards navigate to `/workouts` / `/calories`. If you're looking for "why doesn't my logged workout show up on the dashboard" — it's because this page doesn't read from Firestore at all yet.

### `src/pages/Calories.jsx`
BMR/TDEE/target-calorie calculator. This is the page that actually uses `src/utils/calculations.js`.

- Form state: `gender`, `age`, `height`, `weight`, `activity` (a string key like `"moderate"`, not the raw multiplier number), `goal` (a string key like `"cutting"`).
- `results` is a `useMemo` that calls `calculateBMR` → `calculateTDEE` → `calculateTargetCalories` from `calculations.js`, wrapped in `try/catch`. Those functions **throw** on invalid input (age/height/weight ≤ 0, etc.) — the `catch` returns `null` instead of crashing, and the JSX shows an "Enter valid information" message whenever `results` is `null`. This recalculates automatically whenever any form field changes, since they're all in the `useMemo`'s dependency array.
- `goalProfiles` (this file) holds each goal's *display* info (name, badge text, protein-per-kg, fat %) and the actual *math* (the percentage adjustment) lives in `GOAL_ADJUSTMENTS`, exported from `calculations.js`. They're kept in sync by both using the same goal keys (`maintenance`/`cutting`/`recomp`/`bulking`) — if you add a new goal, you need to add it in **both** places.
- Macro math (protein/carbs/fat/fiber/water) happens directly in this component, not in `calculations.js` — `calculateTargetCalories` only returns a single calorie number.

### `src/pages/FoodLog.jsx`
The largest page. Two separate food-search mechanisms feed the same add/edit form:

1. **Local curated list** (`suggestedFoods`, a hardcoded array in this file) — filtered client-side by `searchTerm` + `selectedCategory` in a `useMemo` (`filteredFoods`). Clicking a result calls `loadSuggestedFood`.
2. **Live Open Food Facts search** — a separate "Search Online" section, its own `apiSearchTerm`/`apiResults`/`isSearching`/`searchError` state. Submitting the form calls `handleApiSearch`, which is `async` (can't live in a `useMemo` like the local search) and calls `searchFoods()` from `src/services/foodApi.js`. Clicking a result calls `loadApiFood` — same idea as `loadSuggestedFood`, but API results have no `servingSize` (values are per 100g), so it's hardcoded to `"100 g"`.

Both loaders write into the same `foodForm` state, which `handleSaveFood` then pushes into `foodDays` (keyed by date, then by meal) on submit. Everything here persists to **`localStorage`** (`FOOD_STORAGE_KEY`/`TARGET_STORAGE_KEY`), not Firestore — this page doesn't touch `firestoreService.js` at all.

Other pieces: `mealTotals`/`dailyTotals` (derived nutrition sums via `useMemo`), a water tracker (`addWater`/`resetWater`), a "quick add" calories-only form, and editable nutrition targets (`updateTarget`).

### `src/pages/Workout.jsx`
Two distinct halves:

1. **Exercise browser/session builder** (top of the page) — pick a muscle group (`selectedGroup`), see `defaultExercises[selectedGroup]` plus any matching `customExercises`, add exercises to the current session (`selectedExercises`) with per-exercise sets/reps. Includes a workout timer (`elapsedSeconds`/`isTimerRunning`, ticked by a `setInterval` in a `useEffect`). Custom exercises persist to `localStorage` (`STORAGE_KEY`), same pattern as `FoodLog.jsx`'s local data.
2. **Workout history** (bottom of the page) — this is the part that actually uses `firestoreService.js`:
   - On mount, a `useEffect` calls `getWorkouts()` and stores the result in `savedWorkouts`.
   - `handleSaveWorkout` (wired to the "Save Workout" button) strips `selectedExercises` down to just `{ name, groupName, sets, reps }` per exercise, adds `totalSets`/`durationSeconds`/`loggedAt`, and calls `addWorkout(workoutData)`. On success it prepends the new workout to `savedWorkouts` locally (rather than re-fetching) and calls `clearSession()`.
   - Each saved workout card can have a note added/edited (`startEditingNote` / `saveNote`, calling `updateWorkout(id, { notes })`) and deleted (`handleDeleteWorkout`, calling `deleteWorkout(id)`).

This is the one page where "session builder" state and "Firestore-backed" state are separate — building a session doesn't touch Firestore until you click "Save Workout".

## Services (`src/services/`, `src/utils/`)

These are pure/async logic with no JSX — the three milestone deliverables.

### `src/utils/calculations.js`
Pure functions, no side effects, no fetch/Firestore calls.

- `calculateBMR({ weight, height, age, gender, unitSystem })` — Mifflin-St Jeor formula. Converts imperial → metric internally via an unexported `toMetric` helper if `unitSystem === "imperial"`. Throws on invalid weight/height/age or an unrecognized gender/unit system, rather than returning `NaN` or a silently wrong number.
- `calculateTDEE(bmr, activityLevel)` — multiplies `bmr` by a lookup in `ACTIVITY_MULTIPLIERS` (keys: `sedentary`/`light`/`moderate`/`active`/`veryActive`). Throws if `activityLevel` isn't a known key.
- `calculateTargetCalories({ ...same as calculateBMR, activityLevel, goal })` — calls the two functions above, then applies `GOAL_ADJUSTMENTS[goal]` as a percentage multiplier and rounds. Throws if `goal` isn't a known key.
- Every "invalid input → throw" here is intentional: callers (`Calories.jsx`) are expected to catch and handle it, not have it silently produce wrong numbers.

### `src/services/foodApi.js`
One function: `searchFoods(query)`. Hits the Open Food Facts **v2** API (`/api/v2/search`) — not the legacy `cgi/search.pl` endpoint, which has no CORS headers and can't be called from a browser at all. Returns `[]` immediately for a blank query. Maps each result to `{ name, calories, protein, carbs, fat, fiber }`, using `?.` + `?? 0`/`?? "Unknown"` throughout since Open Food Facts entries frequently have missing fields. Throws on a non-OK response (includes the status code in the message).

Known quirk: Open Food Facts intermittently returns `503` for real browser requests (their API recommends a custom `User-Agent` header for reliability, which browser `fetch()` can't set). Callers should expect occasional failures and typically retry.

### `src/services/firestoreService.js`
Eight CRUD functions, four each for `workouts` and `meals` collections, all using the Firebase v9+ modular SDK (`collection`/`addDoc`/`getDocs`/`doc`/`updateDoc`/`deleteDoc`) against the `db` instance from `firebase.jsx`.

Pattern is identical for both collections:
- `add*(data)` — throws if `data` is null/empty, otherwise `addDoc`s it and returns the new doc's `id`.
- `get*()` — `getDocs` over the whole collection, returns an array of `{ id, ...doc.data() }`.
- `update*(id, data)` — throws if `id` is missing or `data` is null/empty, otherwise `updateDoc` (merges fields, doesn't replace the whole document).
- `delete*(id)` — throws if `id` is missing, otherwise `deleteDoc`.

Only `Workout.jsx` currently calls the `*Workout` functions (see above). Nothing in the codebase currently calls `addMeal`/`getMeals`/`updateMeal`/`deleteMeal` — meal logging (`FoodLog.jsx`) still uses `localStorage`, not Firestore. Wiring `FoodLog.jsx` to these functions is the natural next step if meal history needs to persist across devices/accounts instead of just one browser.

## Present in the repo but not currently used

- `src/components/ExerciseList.jsx` — reads the `exercises` Firestore collection directly (not through `firestoreService.js`) and renders a plain `<ul>`. Not imported anywhere.
- `src/components/Auth.jsx` — a combined login/signup form using `createUserWithEmailAndPassword`/`signInWithEmailAndPassword` directly. Superseded by the separate `Login.jsx`/`Signup.jsx` pages. Not imported anywhere.

Both look like early prototypes. Safe to delete once confirmed nobody's relying on them, or worth checking with the teammate who wrote them first.

## End-to-end flows

**Sign up → land on dashboard**
`Signup.jsx` form → `createUserWithEmailAndPassword` + `updateProfile` → `navigate("/home")` → `App.jsx`'s `onAuthStateChanged` fires (already in progress from mount) → `user` state updates → `ProtectedRoute` on `/home` now passes → `Home.jsx` renders (with placeholder data, not real).

**Calculate target calories**
User edits any field in `Calories.jsx` → `results` `useMemo` re-runs → `calculateBMR` → `calculateTDEE` → `calculateTargetCalories` (all in `calculations.js`, pure, synchronous, throw on bad input) → macro math in the component itself → results panel re-renders, or shows the invalid-input state if any function threw.

**Search & log a food from Open Food Facts**
User types in the "Search Online" box, submits → `handleApiSearch` → `searchFoods(query)` in `foodApi.js` → `fetch` to Open Food Facts v2 API → mapped results → `apiResults` state → user clicks "Use This Food" → `loadApiFood` fills `foodForm` → user clicks "Add Food" → `handleSaveFood` → `foodDays` state updates → `useEffect` persists it to `localStorage`. No Firestore involved anywhere in this flow.

**Log and save a workout**
User picks a muscle group → adds exercises to `selectedExercises` (client-only state) → optionally starts the timer → clicks "Save Workout" → `handleSaveWorkout` builds a trimmed `workoutData` object → `addWorkout(workoutData)` in `firestoreService.js` → `addDoc` to the `workouts` Firestore collection → new workout prepended to `savedWorkouts` locally → session cleared. Reloading the page re-fetches `savedWorkouts` from Firestore via the mount `useEffect`, so this one *does* persist across devices/browsers (unlike `FoodLog.jsx`'s food log).
