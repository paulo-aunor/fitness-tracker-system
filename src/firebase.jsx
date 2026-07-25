// Pulls the initializeApp function from Firebase's core module - needed to start any Firebase connection
import { initializeApp } from "firebase/app";
// Pulls the getAuth function from Firebase's Authentication module
import { getAuth } from "firebase/auth";
// Pulls the getFirestore function from Firebase's Firestore module - the database service
import { getFirestore } from "firebase/firestore";


// Initializes the connection to your specific Firebase project using firebaseConfig
const app = initializeApp(firebaseConfig);
// Connects to the Authentication service of this Firebase project
export const auth = getAuth(app);
// Connects to the Firestore database of this Firebase project
export const db = getFirestore(app);