//small shared helper for the one piece of user profile data that needs to
//persist across pages -- the weight entered into the calorie calculator.
//shared between Calories.jsx (writes it) and Home.jsx (reads it for the
//"last recorded" body weight card)

const LAST_WEIGHT_KEY = "fittrack-last-weight";

//reads the last weight saved from Calories.jsx, falls back to a
//reasonable default (77) if nothing's been saved yet or it's not a valid number
export function loadLastWeight() {
  const saved = localStorage.getItem(LAST_WEIGHT_KEY);
  const parsed = Number(saved);

  return saved && Number.isFinite(parsed) && parsed > 0 ? parsed : 77;
}

export function saveLastWeight(weight) {
  localStorage.setItem(LAST_WEIGHT_KEY, String(weight));
}
