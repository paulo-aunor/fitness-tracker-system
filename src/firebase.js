import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Stores the Firebase configuration for this project.
const firebaseConfig = {
    apiKey: "PASTE_YOUR_API_KEY",
    authDomain: "PASTE_YOUR_AUTH_DOMAIN",
    projectId: "PASTE_YOUR_PROJECT_ID",
    storageBucket: "PASTE_YOUR_STORAGE_BUCKET",
    messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
    appId: "PASTE_YOUR_APP_ID"
};

// Connects the application to the Firebase project.
const app = initializeApp(firebaseConfig);

// Creates and exports the Firebase Authentication service.
export const auth = getAuth(app);