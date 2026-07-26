import { useEffect } from "react";

import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import Calories from "./pages/Calories";
import FoodLog from "./pages/FoodLog";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Workout from "./pages/Workout";

function App() {
  const navigate = useNavigate();

  const demoUser = {
    displayName: "Demo User",
    email: "demo@fitness.com",
  };

  useEffect(() => {
    const routeByLabel = {
      Dashboard: "/home",
      Workouts: "/workouts",
      "Food Log": "/food-log",
      Calories: "/calories",
    };

    function handleSidebarClick(event) {
      const button = event.target.closest(".sidebar-link");

      if (!button) {
        return;
      }

      const label = button.textContent.trim();

      const route = routeByLabel[label];

      if (route) {
        navigate(route);
      }
    }

    document.addEventListener("click", handleSidebarClick);

    return () => {
      document.removeEventListener("click", handleSidebarClick);
    };
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/home" element={<Home user={demoUser} />} />

      <Route path="/workouts" element={<Workout user={demoUser} />} />

      <Route path="/food-log" element={<FoodLog user={demoUser} />} />

      <Route path="/calories" element={<Calories user={demoUser} />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
