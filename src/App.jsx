import { useEffect, useState } from "react";

import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

// Authentification imports.
import { auth } from "./firebase.jsx";
import { onAuthStateChanged } from "firebase/auth";
import ProtectedRoute from "./components/ProtectedRoute";


import Calories from "./pages/Calories";
import FoodLog from "./pages/FoodLog";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Workout from "./pages/Workout";

function App() {
  const navigate = useNavigate();

  // Nobody has log in thta why user it = null
const [user,setUser] = useState(null);
const [loading,setLoading] = useState(true);

// 
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    setUser(firebaseUser);
    setLoading(false)
  });

  return () => {
    unsubscribe();
  };
}, []);

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


  // loading guard
  if (loading){
    return<div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/home" element={<ProtectedRoute user={user}><Home user={user} /> </ProtectedRoute>}/> 

      <Route path="/workouts" element={<ProtectedRoute user={user}><Workout user={user} /> </ProtectedRoute>}/> 

      <Route path="/food-log" element={<ProtectedRoute user={user}><FoodLog user={user} /> </ProtectedRoute>}/> 

      <Route path="/calories" element={<ProtectedRoute user={user}><Calories user={user} /> </ProtectedRoute>}/> 

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
