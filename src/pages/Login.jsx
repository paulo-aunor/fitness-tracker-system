import { useState } from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import PasswordInput from "../components/PasswordInput";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.jsx";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

async function  handleLogin(event) {
        event.preventDefault();
    try{
        await signInWithEmailAndPassword(auth, email,password);
        navigate("/home");
    } catch (err) {
    setError(err.message);
}
}


    return (
        <main className="login-page">

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

                    <ul className="features">
                        <li>Log your daily workouts</li>
                        <li>Track calories and meals</li>
                        <li>Plan protein, carbs, and fat</li>
                        <li>Monitor your fitness progress</li>
                    </ul>

                </div>

            </section>


            <section className="form-section">

                <div className="form-card">

                    <div className="form-header">

                        <p className="form-tag">
                            MEMBER LOGIN
                        </p>

                        <h2>Welcome Back</h2>

                    </div>

                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <form onSubmit={handleLogin}>

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
                                    setEmail(event.target.value)
                                }
                                required
                            />

                        </div>


                        <div className="input-group">

                            <label htmlFor="loginPassword">
                                Password
                            </label>

                            <PasswordInput
                                id="loginPassword"
                                placeholder="Enter any password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                            />

                        </div>


                        <div className="forgot-password">

                            <Link to="/forgot-password">
                                Forgot Password?
                            </Link>

                        </div>


                        <button
                            type="submit"
                            className="main-button"
                        >
                            View Dashboard
                        </button>

                    </form>


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