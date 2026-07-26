import {
    useEffect
} from "react";

import {
    Navigate,
    Route,
    Routes,
    useNavigate
} from "react-router-dom";

import Calories from "./pages/Calories";
import FoodLog from "./pages/FoodLog";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Progress from "./pages/Progress";
import Signup from "./pages/Signup";
import Workout from "./pages/Workout";


// Manages the application routes and navigation.
function App() {
    // Allows the application to navigate between pages.
    const navigate =
        useNavigate();


    // Provides a temporary user for demo mode.
    const demoUser = {
        displayName: "Demo User",
        email: "demo@fitness.com"
    };


    // Adds navigation support to all sidebar buttons.
    useEffect(() => {
        // Connects each sidebar label to its route.
        const routeByLabel = {
            Dashboard: "/home",
            Workouts: "/workouts",
            "Food Log": "/food-log",
            Calories: "/calories",
            Progress: "/progress"
        };


        // Handles clicks on sidebar navigation buttons.
        function handleSidebarClick(
            event
        ) {
            // Finds the closest clicked sidebar button.
            const button =
                event.target.closest(
                    ".sidebar-link"
                );


            // Stops the function when no sidebar button was clicked.
            if (!button) {
                return;
            }


            // Gets the visible text from the clicked button.
            const label =
                button.textContent.trim();


            // Finds the route connected to the button label.
            const route =
                routeByLabel[label];


            // Opens the selected page when a route exists.
            if (route) {
                navigate(route);
            }
        }


        // Listens for clicks anywhere in the document.
        document.addEventListener(
            "click",
            handleSidebarClick
        );


        // Removes the click listener when the component is closed.
        return () => {
            document.removeEventListener(
                "click",
                handleSidebarClick
            );
        };
    }, [navigate]);


    // Displays the correct page based on the current URL.
    return (
        <Routes>

            {/* Displays the login page. */}
            <Route
                path="/"
                element={<Login />}
            />


            {/* Displays the account registration page. */}
            <Route
                path="/signup"
                element={<Signup />}
            />


            {/* Displays the password recovery page. */}
            <Route
                path="/forgot-password"
                element={
                    <ForgotPassword />
                }
            />


            {/* Displays the main dashboard. */}
            <Route
                path="/home"
                element={
                    <Home user={demoUser} />
                }
            />


            {/* Displays the workout page. */}
            <Route
                path="/workouts"
                element={
                    <Workout user={demoUser} />
                }
            />


            {/* Displays the daily food log page. */}
            <Route
                path="/food-log"
                element={
                    <FoodLog user={demoUser} />
                }
            />


            {/* Displays the calorie calculator page. */}
            <Route
                path="/calories"
                element={
                    <Calories user={demoUser} />
                }
            />


            {/* Displays the fitness progress page. */}
            <Route
                path="/progress"
                element={
                    <Progress user={demoUser} />
                }
            />


            {/* Redirects unknown URLs to the login page. */}
            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

        </Routes>
    );
}

export default App;