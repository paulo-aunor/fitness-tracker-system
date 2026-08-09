import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase.jsx";

import {
  FaChartLine,
  FaDumbbell,
  FaFire,
  FaHome,
  FaSignOutAlt,
  FaUserCircle,
  FaUtensils,
} from "react-icons/fa";

//every dashboard page (Home, Workout, FoodLog, Calories, Progress) had this
//exact sidebar duplicated in its own JSX -- pulled out into one component so
//nav links/icons/logout only need to be right in one place. `active` is
//which page's link gets the "active" class; each page passes its own key.
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", path: "/home", icon: FaHome },
  { key: "workouts", label: "Workouts", path: "/workouts", icon: FaDumbbell },
  { key: "food-log", label: "Food Log", path: "/food-log", icon: FaUtensils },
  { key: "calories", label: "Calories", path: "/calories", icon: FaFire },
  { key: "progress", label: "Progress", path: "/progress", icon: FaChartLine },
];

function Sidebar({ user, active }) {
  const navigate = useNavigate();

  const memberName = user?.displayName || "Demo User";
  const memberEmail = user?.email || "demo@fitness.com";

  //signOut actually ends the Firebase session -- without it, the user was
  //still "logged in" per Firebase even after clicking Log Out, so hitting
  //back or typing a protected url still worked (see docs/TEST_CASES.md)
  function handleLogout() {
    signOut(auth).finally(() => navigate("/"));
  }

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-logo">
        <div className="dashboard-logo-icon">
          <FaDumbbell />
        </div>

        <div>
          <h2>FITTRACK</h2>
          <span>Fitness System</span>
        </div>
      </div>

      <nav className="sidebar-navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <button
              type="button"
              key={item.key}
              className={
                item.key === active ? "sidebar-link active" : "sidebar-link"
              }
              onClick={() => navigate(item.path)}
            >
              <Icon />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <FaUserCircle />

          <div>
            <strong>{memberName}</strong>
            <span>{memberEmail}</span>
          </div>
        </div>

        <button type="button" className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
