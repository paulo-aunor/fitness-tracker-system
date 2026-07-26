import { useState } from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "firebase/auth";

import { auth } from "../firebase";
import PasswordInput from "../components/PasswordInput";

function Signup() {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [
        confirmPassword,
        setConfirmPassword
    ] = useState("");

    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSignup(event) {
        event.preventDefault();

        if (fullName.trim().length < 2) {
            setErrorMessage(
                "Please enter your full name."
            );

            return;
        }

        if (password.length < 6) {
            setErrorMessage(
                "Password must be at least 6 characters."
            );

            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage(
                "Passwords do not match."
            );

            return;
        }

        try {
            setIsLoading(true);
            setErrorMessage("");

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            await updateProfile(
                userCredential.user,
                {
                    displayName: fullName.trim()
                }
            );

            navigate("/home");
        } catch (error) {
            console.error("Signup error:", error);

            if (
                error.code ===
                "auth/email-already-in-use"
            ) {
                setErrorMessage(
                    "This email already has an account."
                );
            } else if (
                error.code === "auth/invalid-email"
            ) {
                setErrorMessage(
                    "Please enter a valid email address."
                );
            } else if (
                error.code === "auth/weak-password"
            ) {
                setErrorMessage(
                    "Please choose a stronger password."
                );
            } else {
                setErrorMessage(
                    "Unable to create your account."
                );
            }
        } finally {
            setIsLoading(false);
        }
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
                        Create an account and begin tracking your
                        workouts and nutrition.
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
                                setFullName(event.target.value)
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
                                setPassword(event.target.value)
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


                    {errorMessage && (
                        <p className="error-message">
                            {errorMessage}
                        </p>
                    )}


                    <button
                        type="submit"
                        className="main-button"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Creating Account..."
                            : "Create Account"
                        }
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