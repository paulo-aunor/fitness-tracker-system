// Pulls the initializeApp function from Firebase's core module - needed to start any Firebase connection
import { initializeApp } from "firebase/app";
// Pulls the getAuth function from Firebase's Authentication module
import { getAuth } from "firebase/auth";
// Pulls the getFirestore function from Firebase's Firestore module - the database service
import { getFirestore } from "firebase/firestore";

// Your Firebase project's configuration values (from the Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyCHGmSsODzFopQHO5N44IQdJiOYRNXeIOA",
  authDomain: "fatless-468c3.firebaseapp.com",
  projectId: "fatless-468c3",
  storageBucket: "fatless-468c3.firebasestorage.app",
  messagingSenderId: "41947761342",
  appId: "1:41947761342:web:1c92385c662357f4866cef"
};

// Initializes the connection to your specific Firebase project using firebaseConfig
const app = initializeApp(firebaseConfig);
// Connects to the Authentication service of this Firebase project
export const auth = getAuth(app);
// Connects to the Firestore database of this Firebase project
export const db = getFirestore(app);