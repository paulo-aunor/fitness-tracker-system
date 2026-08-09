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
- Defines all routes. `/`, `/signup`, `/forgot-password` are public. `/home`, `/workouts`, `/food-log`, `/calories`, `/progress` are each wrapped in `<ProtectedRoute user={user}>`, which redirects to `/` if `user` is null.

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

### `src/components/Sidebar.jsx`
The shared nav sidebar for every logged-in page — extracted out of five separately-duplicated copies. Takes two props: `user` (for the name/email footer) and `active` (a key like `"dashboard"`/`"workouts"`/`"food-log"`/`"calories"`/`"progress"`, used to highlight the current page's link). Renders its links from a single `NAV_ITEMS` array, each with a real `onClick={() => navigate(item.path)}` — no reliance on button text or a document-level click listener. Logout also lives here: `handleLogout` calls `signOut(auth)` then navigates to `/`.

Each dashboard page now just renders `<Sidebar user={user} active="..." />` instead of its own sidebar JSX. If you're adding a new dashboard page, add it to `NAV_ITEMS` here rather than copy-pasting sidebar markup.

## Dashboard pages

All five of these render `<Sidebar user={user} active="..." />` (see above) and share the same `.dashboard-page` / `.dashboard-sidebar` / `.dashboard-content` CSS class structure.

### `src/pages/Home.jsx`
The landing dashboard after login. Reads real data from three places, all on mount:

- **Today's calories/protein/carbs/fat** — `getDailyNutrition(user.uid, today)` from `firestoreService.js`, reading the `nutritionLogs` document `FoodLog.jsx` writes on every change (see that page's section below). Targets (the "/ 2100 kcal" denominators) come from `loadTargets()` in `src/utils/foodLog.js` — the same editable, localStorage-backed targets `FoodLog.jsx`'s "Nutrition Targets" panel writes, not hardcoded numbers.
- **Body weight** — `getWeightLogs(user.uid)` from `firestoreService.js`, reading the `weightLogs` Firestore collection. This page also *writes* to it directly: a "Log weight" input on the dashboard calls `addWeightLog({ userId, weight, date })`, then re-fetches the list so the card updates immediately. `Calories.jsx`'s weight field prefills from this same collection (see below) — logging weight here is what makes that prefill show something other than the default.
- **Workouts this week / Last Workout** — `getWorkouts(user.uid)` from `firestoreService.js` (same function `Workout.jsx` uses), loaded in a `useEffect`. `workoutsThisWeek` filters by `loggedAt` falling in the last 7 days; the "Last Workout" panel shows the most recently saved one instead of a fictional *upcoming* session, since nothing in the app represents a scheduled/planned workout.

None of this is live-updating across tabs/pages — it's read once when `Home.jsx` mounts (or once per `useEffect` when `user` resolves), so if you log food on `/food-log` and then navigate back to `/home`, the numbers refresh because the component remounts, not because of any shared state or subscription.

### `src/pages/Calories.jsx`
BMR/TDEE/target-calorie calculator. This is the page that actually uses `src/utils/calculations.js`.

- Form state: `gender`, `age`, `height`, `weight`, `activity` (a string key like `"moderate"`, not the raw multiplier number), `goal` (a string key like `"cutting"`).
- `results` is a `useMemo` that calls `calculateBMR` → `calculateTDEE` → `calculateTargetCalories` from `calculations.js`, wrapped in `try/catch`. Those functions **throw** on invalid input (age/height/weight ≤ 0, etc.) — the `catch` returns `null` instead of crashing, and the JSX shows an "Enter valid information" message whenever `results` is `null`. This recalculates automatically whenever any form field changes, since they're all in the `useMemo`'s dependency array.
- `goalProfiles` (this file) holds each goal's *display* info (name, badge text, protein-per-kg, fat %) and the actual *math* (the percentage adjustment) lives in `GOAL_ADJUSTMENTS`, exported from `calculations.js`. They're kept in sync by both using the same goal keys (`maintenance`/`cutting`/`recomp`/`bulking`) — if you add a new goal, you need to add it in **both** places.
- Macro math (protein/carbs/fat/fiber/water) happens directly in this component, not in `calculations.js` — `calculateTargetCalories` only returns a single calorie number.
- `weight` defaults to `77` and prefills from `getWeightLogs(user.uid)` in `firestoreService.js` on mount — the same `weightLogs` Firestore collection `Home.jsx`'s "Log weight" card writes to. This page only reads it; logging a new weight happens on `Home.jsx`, not here.

### `src/pages/FoodLog.jsx`
The largest page. Two separate food-search mechanisms feed the same add/edit form:

1. **Local curated list** (`suggestedFoods`, a hardcoded array in this file) — filtered client-side by `searchTerm` + `selectedCategory` in a `useMemo` (`filteredFoods`). Clicking a result calls `loadSuggestedFood`.
2. **Live Open Food Facts search** — a separate "Search Online" section, its own `apiSearchTerm`/`apiResults`/`isSearching`/`searchError` state. Submitting the form calls `handleApiSearch`, which is `async` (can't live in a `useMemo` like the local search) and calls `searchFoods()` from `src/services/foodApi.js`. Clicking a result calls `loadApiFood` — same idea as `loadSuggestedFood`, but API results have no `servingSize` (values are per 100g), so it's hardcoded to `"100 g"`.

Both loaders write into the same `foodForm` state, which `handleSaveFood` then pushes into `foodDays` (keyed by date, then by meal) on submit.

**Storage is two-layer.** `localStorage` (`FOOD_STORAGE_KEY`/`TARGET_STORAGE_KEY`) is still the source of truth for what's on screen — every read/calculation runs off it, same as before. On top of that, this page now mirrors to Firestore:
- Every add, edit, delete, and quick-add calls `addMeal`/`updateMeal`/`deleteMeal` (via the `syncMealToDatabase` helper, which tries `updateMeal` first when editing and falls back to `addMeal` if that entry was never actually synced — e.g. logged before this existed, or an earlier save silently failed).
- `addMeal(id, data)` uses `setDoc` keyed by the food entry's own client-generated `id` (not Firestore's auto-generated `addDoc` id) — this is what lets a freshly-created entry be edited or deleted immediately without waiting on a round-trip to learn its "real" id.
- On mount, `getMeals(user.uid)` loads this user's previously-synced meals and merges them into `foodDays` (additively, matched by `id`, so nothing gets duplicated) — this is what makes a food log built on one device show up on another.
- `dailyTotals` (the whole day's summed nutrition) is separately mirrored to the `nutritionLogs` collection via `saveDailyNutrition(user.uid, selectedDate, dailyTotals)` on every change — this is what `Home.jsx` reads for "today's calories."

All of this Firestore mirroring is fire-and-forget (not awaited by the UI) — a failed sync just logs to the console, it doesn't block adding/editing/deleting locally.

Other pieces: `mealTotals`/`dailyTotals` (derived nutrition sums via `useMemo`), a water tracker (`addWater`/`resetWater`), a "quick add" calories-only form, and editable nutrition targets (`updateTarget`).

The localStorage keys, `createEmptyDay`/`createLocalDateValue`/`loadFoodDays`/`loadTargets`/`calculateFoodNutrition`/`calculateMealTotals`/`calculateDailyTotals` all live in **`src/utils/foodLog.js`**, not in this file — they were pulled out so `Home.jsx` can read the exact same data this page writes, without duplicating the storage keys or the day/meal shape in two places. `FoodLog.jsx` imports them like any other module; `createId`/`formatValue`/`calculateProgress` stayed local since nothing else needs them.

### `src/pages/Workout.jsx`
Two distinct halves:

1. **Exercise browser/session builder** (top of the page) — pick a muscle group (`selectedGroup`), see `defaultExercises[selectedGroup]` plus any matching `customExercises`, add exercises to the current session (`selectedExercises`) with per-exercise sets/reps. Includes a workout timer (`elapsedSeconds`/`isTimerRunning`, ticked by a `setInterval` in a `useEffect`). Custom exercises persist to `localStorage` (`STORAGE_KEY`), same pattern as `FoodLog.jsx`'s local data.
2. **Workout history** (bottom of the page) — this is the part that actually uses `firestoreService.js`:
   - On mount, a `useEffect` calls `getWorkouts()` and stores the result in `savedWorkouts`.
   - `handleSaveWorkout` (wired to the "Save Workout" button) strips `selectedExercises` down to just `{ name, groupName, sets, reps }` per exercise, adds `totalSets`/`durationSeconds`/`loggedAt`, and calls `addWorkout(workoutData)`. On success it sets `savedWorkoutSummary` (rather than a plain text message) and calls `clearSession()`.
   - Each saved workout card can have a note added/edited (`startEditingNote` / `saveNote`, calling `updateWorkout(id, { notes })`) and deleted (`handleDeleteWorkout`, calling `deleteWorkout(id)`).

This is the one page where "session builder" state and "Firestore-backed" state are separate — building a session doesn't touch Firestore until you click "Save Workout".

**Post-save summary popup** — `savedWorkoutSummary` state (set by `handleSaveWorkout` above) drives a confirmation modal (`.workout-summary-overlay`/`.workout-summary-card` in `workout.css`) showing the saved workout's date, exercise/set/duration stats, and per-exercise breakdown. This exists separately from `formMessage`/`formError` (which are still used for custom-exercise-creation feedback only) specifically so the save confirmation isn't buried near an unrelated form. Clicking "Back to Dashboard" (`handleConfirmWorkoutSummary`) clears `savedWorkoutSummary` and navigates to `/home`, so no saved-workout state lingers if the user comes back to `/workouts` later — a fresh mount re-fetches `savedWorkouts` from Firestore instead.

### `src/pages/Progress.jsx`
Personal-records and progress-photo tracking. Entirely self-contained — its own `localStorage` keys (`PROGRESS_STORAGE_KEY` for logged entries, `RECORDS_STORAGE_KEY` for personal strength records, plus a settings key), no dependency on `firestoreService.js` or any other page's data. Only reads `user` for the display name/email in the sidebar, same as every other dashboard page. Built by the UI teammate; kept as-is when wired into `main`'s routing.

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
CRUD functions across four Firestore collections, all using the Firebase v9+ modular SDK (`collection`/`addDoc`/`setDoc`/`getDoc`/`getDocs`/`doc`/`query`/`where`/`updateDoc`/`deleteDoc`) against the `db` instance from `firebase.jsx`.

**`workouts`** — used by `Workout.jsx`:
- `addWorkout(data)` — throws if `data` is null/empty, otherwise `addDoc`s it and returns the new doc's `id`.
- `getWorkouts(uid)` — **requires `uid`**, queries `where("userId", "==", uid)`. Without this scoping every user would see every other user's workouts — this was a real bug caught and fixed mid-project.
- `updateWorkout(id, data)` — `updateDoc` (merges fields, doesn't replace the whole document).
- `deleteWorkout(id)` — `deleteDoc`.

**`meals`** — used by `FoodLog.jsx`:
- `addMeal(id, data)` — takes an explicit `id` (the food entry's own client-generated id) and `setDoc`s it, overwriting rather than generating a new Firestore id. This is different from `addWorkout`'s `addDoc` pattern, deliberately — it keeps the local id and the Firestore doc id identical, so an entry can be edited/deleted right after creation without a round-trip to learn a server-generated id first.
- `getMeals(uid)` — **requires `uid`**, same scoping fix as `getWorkouts`.
- `updateMeal(id, data)` — `updateDoc`, throws if the doc doesn't exist (which `FoodLog.jsx`'s `syncMealToDatabase` handles by falling back to `addMeal`).
- `deleteMeal(id)` — `deleteDoc`.

**`weightLogs`** — used by `Home.jsx` (write + read) and `Calories.jsx` (read-only prefill):
- `addWeightLog(data)` — expects `{ userId, weight, date }`.
- `getWeightLogs(uid)` — queries `where("userId", "==", uid)`, returns entries sorted newest-first by `date`.

**`nutritionLogs`** — used by `FoodLog.jsx` (write) and `Home.jsx` (read):
- `saveDailyNutrition(uid, date, totals)` — `setDoc` keyed by `${uid}_${date}`, so saving the same day twice overwrites rather than duplicating.
- `getDailyNutrition(uid, date)` — reads that same keyed doc, returns `null` if it doesn't exist yet.

### `src/utils/foodLog.js`
Shared food-log data layer, extracted out of `FoodLog.jsx` so `Home.jsx` can read the same localStorage-backed data without duplicating the storage keys or shape. See the `FoodLog.jsx` section above for what moved here.

## Housekeeping notes

`src/components/ExerciseList.jsx` and `src/components/Auth.jsx` — early-prototype components (a Firestore-reading exercise list, and a combined login/signup form) that were never imported anywhere, confirmed unused, and removed.

`src/utils/profile.js` — an earlier localStorage-only weight-tracking module (`loadLastWeight`/`saveLastWeight`), retired once `Home.jsx`/`Calories.jsx` moved to the Firestore-backed `weightLogs` collection instead. Deleted rather than left dead.

`src/dashborad.css` — never imported by any `.jsx` file (confirmed via `grep -rn "dashborad" src`); all dashboard-page styling actually comes from the global `style.css` import in `main.jsx`. Left in place (not deleted, out of scope) but don't add styles here — they won't render.

**Global `form` reset gotcha (`src/style.css`)** — there's a `form { display: flex; flex-direction: column; width: 100%; }` rule meant for the stacked Login/Signup/Add-Food forms. It cascades into *any* `<form>` element, including ones that want a horizontal layout (e.g. `.gym-food-search` in `gymFoodLibrary.css`), silently stacking their children vertically unless that component's own CSS explicitly sets `flex-direction: row`. If a new form-based component looks vertically squashed for no obvious reason, check for this before anything else.

## End-to-end flows

**Sign up → land on dashboard**
`Signup.jsx` form → `createUserWithEmailAndPassword` + `updateProfile` → `navigate("/home")` → `App.jsx`'s `onAuthStateChanged` fires (already in progress from mount) → `user` state updates → `ProtectedRoute` on `/home` now passes → `Home.jsx` mounts and, once `user.uid` is available, fires three separate `useEffect`s: `getDailyNutrition` (today's totals), `getWeightLogs` (body weight), `getWorkouts` (workout stats). For a brand-new account all three come back empty/`null`, so the dashboard shows honest zero/empty states rather than fabricated numbers.

**Calculate target calories**
User edits any field in `Calories.jsx` → `results` `useMemo` re-runs → `calculateBMR` → `calculateTDEE` → `calculateTargetCalories` (all in `calculations.js`, pure, synchronous, throw on bad input) → macro math in the component itself → results panel re-renders, or shows the invalid-input state if any function threw. Separately, on mount, `getWeightLogs(user.uid)` prefills the weight field with the most recent logged value (from `Home.jsx`'s "Log weight" card), defaulting to `77` if nothing's been logged yet.

**Search & log a food from Open Food Facts**
User types in the "Search Online" box, submits → `handleApiSearch` → `searchFoods(query)` in `foodApi.js` → `fetch` to Open Food Facts v2 API → mapped results → `apiResults` state → user clicks "Use This Food" → `loadApiFood` fills `foodForm` → user clicks "Add Food" → `handleSaveFood` → `foodDays` state updates immediately (local, synchronous) → `useEffect` persists it to `localStorage` → in parallel, `syncMealToDatabase` fire-and-forgets `addMeal(id, data)` to the `meals` Firestore collection, and a separate `useEffect` fire-and-forgets `saveDailyNutrition` with the day's new totals to `nutritionLogs`. The UI never waits on either Firestore call — the local update is what the user sees instantly.

**Food log surviving a new device/browser**
User logs food on device A (writes to `localStorage` + mirrors to `meals` in Firestore, as above) → opens the app on device B, logs in as the same account → `FoodLog.jsx` mounts with empty `localStorage` → the mount `useEffect` calls `getMeals(user.uid)`, gets back every entry ever synced for that user, and merges them into `foodDays` (matched by each entry's own id, so nothing duplicates if some entries already happen to be in local storage) → the meals from device A now show up on device B.

**Log and save a workout**
User picks a muscle group → adds exercises to `selectedExercises` (client-only state) → optionally starts the timer → clicks "Save Workout" → `handleSaveWorkout` builds a trimmed `workoutData` object (including `userId: user.uid`) → `addWorkout(workoutData)` in `firestoreService.js` → `addDoc` to the `workouts` Firestore collection → `savedWorkoutSummary` is set, showing the post-save popup card (date, exercise/set/duration stats, exercise breakdown) → session cleared. Clicking "Back to Dashboard" clears `savedWorkoutSummary` and navigates to `/home`. Reloading `/workouts` (or coming back to it later) re-fetches `savedWorkouts` from Firestore via the mount `useEffect` (scoped to `user.uid`), so the saved workout persists across devices/browsers, same as the food log now does — and the summary popup itself never lingers past the confirm click or a fresh mount.

**Log body weight from the dashboard**
User types a number into `Home.jsx`'s "Log weight" input, clicks the log button → `handleLogWeight` validates it's a positive number → `addWeightLog({ userId, weight, date })` → on success, re-fetches `getWeightLogs(user.uid)` so the card's "latest weight" and month-over-month comparison update immediately, without waiting for a remount. The next time `Calories.jsx` is opened, its weight field prefills from this same updated list.

**Dashboard reflecting logged data**
None of `Home.jsx`'s reads are reactive to changes on other pages — everything happens once, on mount (or once per `user` change). So the actual sequence is: user does something on `Calories.jsx`/`FoodLog.jsx`/`Workout.jsx` (which write to `localStorage` and/or Firestore as described above) → user navigates to `/home` → `Home.jsx` mounts fresh → its three `useEffect`s each fire their own async fetch → dashboard renders with whatever was most recently saved once each fetch resolves. If you're debugging "the dashboard shows stale data," check whether the user actually left and re-entered the page (remounting `Home.jsx`), not just whether the underlying data changed.
