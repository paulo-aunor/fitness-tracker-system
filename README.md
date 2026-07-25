# Gym Tracker & Calorie Planner

## Project Description

A React-based web application designed to help users log their gym workouts and track their nutrition. The application calculates personal Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) to provide targeted calorie goals for cutting, maintaining, or bulking. Users can log daily meals using an open-source food API and track their weightlifting sets and reps over time.

## Team Members

- Daniel Jimenez - Database Design and Implementation
- Tuan Hao Nhan - User Interface and Experience
- Paulo Aunor - Backend and Functionality

## Features Implemented

This project fulfills all minimum requirements for the Group Project assignment, including complete CRUD functionality and Firebase Firestore integration.

- **Calorie Calculator:** Calculates daily caloric needs based on user inputs (age, weight, height, activity level, and goal).
- **Workout Logging (Create & Read):** Users can add new exercise sets (exercise name, reps, weight) to their daily log and view past workouts fetched from Firestore.
- **Nutrition Tracking (Create & Read):** Integrates with an open-source Food API to search for foods and log caloric intake against the daily target.
- **Record Management (Update & Delete):** Users can edit the details of a previously logged gym set or completely delete erroneous workout/meal entries from the database.
- **State Management:** Utilizes React functional components, `useState`, and props to manage form inputs and synchronize UI state with the database.

## Setup & Installation

### 1. Firebase Setup Instructions

To run this project locally, you must connect it to your own Firebase Firestore database.

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Register a new Web App to generate your unique Firebase configuration keys.
3. In the left sidebar, navigate to **Build > Firestore Database** and click **Create database**.
4. Start the database in **Test Mode** to allow read/write access during development.

### 2. Configure Environment Variables

This project uses Vite, so environment variables must be prefixed with `VITE_`.

1. Create a `.env` file in the root directory of this project.
2. Add your Firebase keys in the following format:

```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
```
