import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase.jsx";
import { useState, useEffect } from "react";

export default function ExerciseList() {

  // State to hold our list of exercises.
  // Starts as an empty array until Firestore sends data back.
  const [exercises, setExercises] = useState([]);

  // useEffect runs side effects (like fetching data) after the component renders.
  useEffect(() => {

    // This function gets data from Firestore.
    // We use "async" because getting data takes time.
    async function fetchExercises() {

      // Wait for Firestore to send back the documents.
      const snapshot = await getDocs(collection(db, "exercises"));

      // "snapshot.docs" is a list of documents.
      // We use .map() to change each document into a simple object.
      const exercisesArray = snapshot.docs.map((exercise) => {
        return {
          id: exercise.id,                          // the document's unique ID
          name: exercise.data().name,                // the exercise name
          muscleGroup: exercise.data().muscleGroup    // the muscle group
        };
      });

      // Save the new list into state.
      // This tells React: "update the screen with this data."
      setExercises(exercisesArray);
    }

    // Call the function so it actually runs.
    fetchExercises();

  // Empty array = run this ONE time only, when the page first loads.
  }, []);

  // This is what gets displayed on screen.
  // We loop through "exercises" and create one <li> per exercise.
  return (
    <ul>
      {exercises.map((exercise) => (
        <li key={exercise.id}>
          {exercise.name} - {exercise.muscleGroup}
        </li>
      ))}
    </ul>
  );
}