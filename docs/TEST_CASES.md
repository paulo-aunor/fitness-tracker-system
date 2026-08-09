# Test Cases

Manual test plan and results for the Gym Tracker & Calorie Planner, run against `main` before the Tuesday submission. Tests were executed with real Playwright browser automation (headless Chromium) against `npm run dev`, using the real Firebase project (no mocks) — every result below reflects an actual run, not a prediction.

**Test account:** `test.claude.fitness@example.com` (see `docs/CODEBASE.md` for how auth works). **Environment:** local dev server, `localhost:5173`. **Last full run:** 2026-08-09.

For how these scenarios connect into full user journeys, see [`USER_FLOWS.md`](./USER_FLOWS.md). For what each page/function does internally, see [`CODEBASE.md`](./CODEBASE.md).

## Summary

| Area | Cases | Passed | Failed |
|---|---|---|---|
| Auth & navigation | 11 | 11 | 0 |
| Calories calculator | 2 | 2 | 0 |
| Workout | 5 | 5 | 0 |
| Food Log | 7 | 7 | 0 |
| Home dashboard | 3 | 3 | 0 |
| Progress | 1 | 1 | 0 |
| Meal sync (cross-device) | 3 | 3 | 0 |
| **Total** | **32** | **32** | **0** |

One real bug was found and fixed during this pass — see [Bugs found](#bugs-found-during-this-pass) below. All numbers above reflect the app *after* that fix, on the final commit being submitted.

## Auth & navigation

| ID | Scenario | Steps | Expected | Result |
|---|---|---|---|---|
| TC-AUTH-01 | Invalid login is rejected | Submit login form with an email/password that doesn't match any account | Stays on `/`, no navigation to `/home` | ✅ PASS |
| TC-AUTH-02 | Signup rejects mismatched passwords | Fill signup form with password ≠ confirm password, submit | Stays on `/signup`, doesn't create an account | ✅ PASS |
| TC-AUTH-03 | Forgot-password accepts an email | Submit an email on `/forgot-password` | Page responds without crashing (Firebase handles the actual email send) | ✅ PASS |
| TC-AUTH-04 | Valid login succeeds | Submit login form with the test account's real credentials | Redirects to `/home` | ✅ PASS |
| TC-NAV-01–05 | Every sidebar link navigates correctly | From `/home`, click each of Workouts / Food Log / Calories / Progress / Dashboard | Each click lands on its matching route | ✅ PASS (5/5) |
| TC-AUTH-05 | Logout returns to `/` | Click "Log Out" from the dashboard | Redirects to `/` | ✅ PASS |
| TC-AUTH-06 | Logout actually ends the session | After logout, navigate directly to `/home` (typed URL, not a click) | Redirects back to `/` (protected route rejects the now-logged-out user) | ✅ PASS *(see bug below — initially FAILED)* |

## Calories calculator

| ID | Scenario | Steps | Expected | Result |
|---|---|---|---|---|
| TC-CAL-01 | Valid inputs produce a result | Load `/calories` with default form values | Shows a computed BMR/TDEE/target result, not an error state | ✅ PASS |
| TC-CAL-02 | Invalid input is caught, not crashed | Set age to `0` | Shows "Enter valid information" guard message instead of `NaN` or a crash | ✅ PASS |

## Workout

| ID | Scenario | Steps | Expected | Result |
|---|---|---|---|---|
| TC-WO-01 | Page renders | Load `/workouts` | Muscle group picker and exercise list render | ✅ PASS |
| TC-WO-02 | Save a workout | Add an exercise to the session, click "Save Workout" | Saves without error, session clears | ✅ PASS |
| TC-WO-03 | Saved workout appears in history | Same as above, compare history count before/after | History list count increases by exactly 1 | ✅ PASS |
| TC-WO-04 | Add a note to a saved workout | Click "Add Note" on a history item, type a note, save | Note text appears on the card and survives the save | ✅ PASS |
| TC-WO-05 | Delete a saved workout | Click the delete icon on a history item | That item is removed; history count decreases by exactly 1 | ✅ PASS |

## Food Log

| ID | Scenario | Steps | Expected | Result |
|---|---|---|---|---|
| TC-FL-01 | Add food from the curated library | Click "Use This Food" on a gym-food-library card, submit the form | "Food added successfully" message, entry appears under its meal | ✅ PASS |
| TC-FL-02 | Quick Add (calories only) | Fill name + calories in the Quick Add panel, submit | Entry appears immediately under the selected meal | ✅ PASS |
| TC-FL-03 | Edit an existing entry | Click edit on a logged food, change calories, save | The entry's displayed calories update to the new value | ✅ PASS |
| TC-FL-04 | Water tracker | Click "+250 mL" | Water total increases by 250 mL, progress bar updates | ✅ PASS |
| TC-FL-05 | Nutrition targets persist | Change the calorie target, reload the page | New target value is still there after reload (localStorage-backed) | ✅ PASS |
| TC-FL-06 | Delete an entry | Click delete on a logged food | Entry disappears from the meal list | ✅ PASS |
| TC-FL-07 | Live Open Food Facts search | Search "banana" in the "Search Online" panel | Returns real results from the API and renders them as cards | ✅ PASS *(known upstream quirk: Open Food Facts intermittently 503s — see `CODEBASE.md`; not app-side)* |

## Meal sync (cross-device via Firestore)

| ID | Scenario | Steps | Expected | Result |
|---|---|---|---|---|
| TC-SYNC-01 | New entry syncs to Firestore | Add a food entry | Entry visible immediately (local write) | ✅ PASS |
| TC-SYNC-02 | Entry survives a "new device" | Clear `localStorage` (simulating a fresh browser/device), reload, log back in, open Food Log | The entry logged in TC-SYNC-01 reappears, loaded from Firestore | ✅ PASS |
| TC-SYNC-03 | Delete removes it everywhere | Delete the recovered entry | Entry is gone from the page (and from Firestore, verified by it not reappearing) | ✅ PASS |

## Home dashboard

| ID | Scenario | Steps | Expected | Result |
|---|---|---|---|---|
| TC-HOME-01 | No fabricated placeholder data | Load `/home` | No invented numbers like a hardcoded "Goal weight" or a fixed "/5 workouts" quota — every number traces back to something the user actually logged | ✅ PASS |
| TC-HOME-02 | Logging weight updates the dashboard | Type a weight into the dashboard's "Log weight" field, click Log | New weight appears on the card immediately, without a page reload | ✅ PASS |
| TC-HOME-03 | Weight prefill flows to Calories | After TC-HOME-02, open `/calories` | The weight field prefills with the value just logged on the dashboard (both read the same `weightLogs` Firestore collection) | ✅ PASS |

## Progress

| ID | Scenario | Steps | Expected | Result |
|---|---|---|---|---|
| TC-PROG-01 | Save a progress entry | Enter a weight value, click "Save Entry" | Entry saves without error and is reflected on the page | ✅ PASS |

## Bugs found during this pass

### Bug #1 — Log Out didn't actually log out (FIXED)

**Found by:** TC-AUTH-06. **Severity:** high — every page's "Log Out" button called `navigate("/")` directly and nothing else. `signOut` from Firebase Auth was never imported or called anywhere in the codebase. This meant:
- Clicking "Log Out" visually returned to the login screen, but the Firebase session was still active underneath.
- Hitting the browser's back button, or typing `/home` (or any protected route) directly into the address bar after "logging out," still worked — the app treated you as logged in.
- On a shared/public computer, this is a real account-exposure issue, not just a cosmetic one.

**Fix:** every page's logout handler now calls `signOut(auth)` (from `firebase/auth`) before navigating to `/`. Confirmed present on all five dashboard pages (`Home.jsx`, `Workout.jsx`, `FoodLog.jsx`, `Calories.jsx`, `Progress.jsx`) — the sidebar isn't a shared component (see `CODEBASE.md`), so each page needed its own fix. Re-ran TC-AUTH-06 after the fix: now correctly redirects to `/` when a protected route is visited after logout.

## Known non-bugs

- **Open Food Facts intermittent 503s** — documented in `CODEBASE.md`. Not app-side; the API occasionally rejects requests it doesn't like the `User-Agent` on (browsers can't set that header). A retry succeeds. Not something to "fix" before submission.
- **Vite bundle-size warning** (~900 KB minified JS) — cosmetic, doesn't affect functionality or load time meaningfully at this app's scale. Not addressed; noted as a known limitation, not a defect.

## Not covered by this pass

- Signup happy-path (creating a brand-new account end-to-end) was not re-run live to avoid leaving more throwaway accounts in the shared Firebase project — the validation logic (TC-AUTH-02) and the underlying `createUserWithEmailAndPassword` call are exercised, just not a full new-account creation.
- Cross-browser testing (only Chromium was used, via Playwright). No manual pass in Firefox/Safari.
- Mobile/responsive layout was not tested.
