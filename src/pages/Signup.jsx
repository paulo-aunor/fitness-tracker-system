import { useState } from "react";
import { Link } from "react-router-dom";

import PasswordInput from "../components/PasswordInput";

function Signup() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [
        confirmPassword,
        setConfirmPassword
    ] = useState("");

    const [
        errorMessage,
        setErrorMessage
    ] = useState("");

    function handleSignup(event) {
        event.preventDefault();

        if (password.length < 6) {
            setErrorMessage(
                "Password must contain at least 6 characters."
            );

            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage(
                "Passwords do not match."
            );

            return;
        }

        setErrorMessage("");

        console.log("New account:", {
            fullName,
            email,
            password
        });

        alert("Account form submitted!");
    }

    return (
        <main className="account-page">

            <div className="form-card signup-card">

                <div className="form-header">

                    <p className="form-tag">
                        START YOUR JOURNEY
                    </p>

                    <h2>Create Account</h2>

                    <p className="subtitle">
                        Create your account and start tracking
                        your fitness progress.
                    </p>

                </div>


                <form onSubmit={handleSignup}>

                    <div className="input-group">

                        <label htmlFor="fullName">
                            Full Name
                        </label>

                        <input
                            type="text"
                            id="fullName"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(event) =>
                                setFullName(
                                    event.target.value
                                )
                            }
                            required
                        />

                    </div>


                    <div className="input-group">

                        <label htmlFor="signupEmail">
                            Email
                        </label>

                        <input
                            type="email"
                            id="signupEmail"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            required
                        />

                    </div>


                    <div className="input-group">

                        <label htmlFor="signupPassword">
                            Password
                        </label>

                        <PasswordInput
                            id="signupPassword"
                            placeholder="Create a password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    <div className="input-group">

                        <label htmlFor="confirmPassword">
                            Confirm Password
                        </label>

                        <PasswordInput
                            id="confirmPassword"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    <p className="error-message">
                        {errorMessage}
                    </p>


                    <button
                        type="submit"
                        className="main-button"
                    >
                        Create Account
                    </button>

                </form>


                <p className="switch-text">
                    Already have an account?

                    <Link to="/">
                        Back to Log In
                    </Link>
                </p>

            </div>

        </main>
    );
}

export default Signup;