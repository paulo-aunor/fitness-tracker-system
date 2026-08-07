//file that holds the functions related to firestore
import {
  collection,
  addDoc,
  getDocs,
  doc,
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

//function to get Workout from db
export async function getWorkouts() {
  const snapshot = await getDocs(collection(db, "workouts"));
  //maps each doc into a plain object with its id included, since
  //snapshot.docs only gives you doc.data() and doc.id separately
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

//function to add Meals to db
export async function addMeal(data) {
  if (data == null || Object.keys(data).length === 0) {
    throw new Error(`Data is null/empty. Please check`);
  }
  //variable to store collection of meals for addDoc
  const docRef = await addDoc(collection(db, "meals"), data);
  return docRef.id;
}

//function to get Meals from db
export async function getMeals() {
  const snapshot = await getDocs(collection(db, "meals"));
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
