//file that holds the functions related to firestore
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

//function to add Workout to db
export async function addWorkout(data) {
  //throws if data is missing or an empty object, instead of writing a blank doc
  if (data == null || Object.keys(data).length === 0) {
    throw new Error(`Data is null/empty. Please check`);
  }
  //variable to store collection of workouts for addDoc
  const docRef = await addDoc(collection(db, "workouts"), data);
  //returns the new doc's id so the caller can reference it right away
  return docRef.id;
}


// function to get Workout from db, scoped to one user
export async function getWorkouts(uid) {
  if (!uid) {
    throw new Error("uid is required to fetch workouts");
  }
  const q = query(collection(db, "workouts"), where("userId", "==", uid));
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data(),
  }));
  return items;
}


//function to update Workouts in db
export async function updateWorkout(id, data) {
  //throws if id is missing OR data is missing/empty -- either one being bad is enough to reject
  if (!id || data == null || Object.keys(data).length === 0) {
    throw new Error(`Data is null/empty. Please check`);
  }
  //doc(db, "workouts", id) points at one specific document, unlike collection() above
  //updateDoc merges these fields in, it doesn't replace the whole document
  await updateDoc(doc(db, "workouts", id), data);
  return `Updates are done`;
}

//function to delete Workouts in db
export async function deleteWorkout(id) {
  if (!id) {
    throw new Error(`Workout id is required`);
  }
  await deleteDoc(doc(db, "workouts", id));
  return `Deletions are done`;
}

//function to add Meals to db, keyed by an id the caller already has (the
//food entry's own client-generated id) via setDoc instead of addDoc -- this
//keeps the local id and the firestore doc id the same, so update/delete can
//reference it right away without waiting on a generated id first
export async function addMeal(id, data) {
  if (!id || data == null || Object.keys(data).length === 0) {
    throw new Error(`Data is null/empty. Please check`);
  }
  await setDoc(doc(db, "meals", id), data);
}

//function to get Meals from db, scoped to one user (same fix as getWorkouts --
//without this, every user would see every other user's logged food)
export async function getMeals(uid) {
  if (!uid) {
    throw new Error("uid is required to fetch meals");
  }
  const q = query(collection(db, "meals"), where("userId", "==", uid));
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data(),
  }));
  return items;
}

//function to update Meals in db
export async function updateMeal(id, data) {
  if (!id || data == null || Object.keys(data).length === 0) {
    throw new Error(`Data is null/empty. Please check`);
  }
  await updateDoc(doc(db, "meals", id), data);
  return `Updates are done`;
}

//function to delete Meal in db
export async function deleteMeal(id) {
  if (!id) {
    throw new Error(`Meals id is required`);
  }
  await deleteDoc(doc(db, "meals", id));
  return `Deletions are done`;
}
// This function saves a new weight entry to the database.
// We pass in an object with userId, weight, and date.
export async function addWeightLog(data) {
  // check that we actually received something before saving
  if (!data) {
    throw new Error("data is required to log weight");
  }

  // addDoc saves the data as a new document inside the "weightLogs" collection
  const docRef = await addDoc(collection(db, "weightLogs"), data);

  // we return the new document's id, in case we need it later
  return docRef.id;
}

// This function gets all weight entries that belong to one user.
export async function getWeightLogs(uid) {
  // we need a user id to know whose data to fetch
  if (!uid) {
    throw new Error("uid is required to fetch weight logs");
  }

  // this builds a query: "get documents from weightLogs where userId matches"
  const q = query(collection(db, "weightLogs"), where("userId", "==", uid));

  // this actually runs the query and gets the documents
  const snapshot = await getDocs(q);

  // Firestore gives us documents in a special format.
  // this line turns each document into a normal object we can use,
  // and adds the document's id as a field called "id"
  const logs = [];
  for (const document of snapshot.docs) {
    logs.push({ id: document.id, ...document.data() });
  }

  // sort the list so the newest entry comes first
  logs.sort((a, b) => new Date(b.date) - new Date(a.date));

  return logs;
}
// saves one day's nutrition totals for one user, overwriting if it already exists
export async function saveDailyNutrition(uid, date, totals) {
  if (!uid || !date) {
    throw new Error("uid and date are required to save nutrition totals");
  }

  const docId = `${uid}_${date}`;
  await setDoc(doc(db, "nutritionLogs", docId), {
    userId: uid,
    date: date,
    ...totals,
  });
}

// gets one user's nutrition totals for one specific date
export async function getDailyNutrition(uid, date) {
  if (!uid || !date) {
    throw new Error("uid and date are required to fetch nutrition totals");
  }

  const docId = `${uid}_${date}`;
  const snapshot = await getDoc(doc(db, "nutritionLogs", docId));

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}