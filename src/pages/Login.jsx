import { useState } from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import PasswordInput from "../components/PasswordInput";


// Displays the login page and manages demo login data.
function Login() {

    // Allows navigation between application pages.
    const navigate =
        useNavigate();


    // Stores the email entered by the user.
    const [
        email,
        setEmail
    ] = useState("");


    // Stores the password entered by the user.
    const [
        password,
        setPassword
    ] = useState("");


    // Opens the dashboard after the login form is submitted.
    function handleLogin(event) {
        event.preventDefault();

        navigate("/home");
    }


    // Displays the login page interface.
    return (
        <main className="login-page">

            {/* Displays the fitness application introduction. */}
            <section className="hero-section">

                <div className="hero-content">

                    <p className="small-title">
                        FITNESS • NUTRITION • PROGRESS
                    </p>

                    <h1>
                        Gym Tracker<span>.</span>
                    </h1>

                    <p className="hero-description">
                        Track your workouts, calories, and daily
                        macros in one powerful fitness application.
                    </p>


                    {/* Displays the main application features. */}
                    <ul className="features">
                        <li>Log your daily workouts</li>
                        <li>Track calories and meals</li>
                        <li>Plan protein, carbs, and fat</li>
                        <li>Monitor your fitness progress</li>
                    </ul>

                </div>

            </section>


            {/* Displays the member login form. */}
            <section className="form-section">

                <div className="form-card">

                    {/* Displays the login form heading. */}
                    <div className="form-header">

                        <p className="form-tag">
                            MEMBER LOGIN
                        </p>

                        <h2>Welcome Back</h2>

                        <p className="subtitle">
                            Demo mode: enter anything to view
                            the dashboard.
                        </p>

                    </div>


                    {/* Submits the entered login information. */}
                    <form onSubmit={handleLogin}>

                        {/* Collects the user's email address. */}
                        <div className="input-group">

                            <label htmlFor="loginEmail">
                                Email
                            </label>

                            <input
                                type="email"
                                id="loginEmail"
                                placeholder="Enter any email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                required
                            />

                        </div>


                        {/* Collects the user's password. */}
                        <div className="input-group">

                            <label htmlFor="loginPassword">
                                Password
                            </label>

                            <PasswordInput
                                id="loginPassword"
                                placeholder="Enter any password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        {/* Opens the password recovery page. */}
                        <div className="forgot-password">

                            <Link to="/forgot-password">
                                Forgot Password?
                            </Link>

                        </div>


                        {/* Submits the login form. */}
                        <button
                            type="submit"
                            className="main-button"
                        >
                            View Dashboard
                        </button>

                    </form>


                    {/* Opens the account registration page. */}
                    <p className="switch-text">
                        Do not have an account?

                        <Link to="/signup">
                            Create Account
                        </Link>
                    </p>

                </div>

            </section>

        </main>
    );
}

export default Login;