import { useState } from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "firebase/auth";

import { auth } from "../firebase.jsx";
import PasswordInput from "../components/PasswordInput";


// Displays the signup page and manages account creation.
function Signup() {

    // Allows navigation between application pages.
    const navigate =
        useNavigate();


    // Stores the full name entered by the user.
    const [
        fullName,
        setFullName
    ] = useState("");


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


    // Stores the repeated password for confirmation.
    const [
        confirmPassword,
        setConfirmPassword
    ] = useState("");


    // Stores validation or Firebase error messages.
    const [
        errorMessage,
        setErrorMessage
    ] = useState("");


    // Tracks whether the account is being created.
    const [
        isLoading,
        setIsLoading
    ] = useState(false);


    // Validates the form and creates a Firebase account.
    async function handleSignup(event) {
        event.preventDefault();


        // Checks that the user entered a valid full name.
        if (fullName.trim().length < 2) {
            setErrorMessage(
                "Please enter your full name."
            );

            return;
        }


        // Checks that the password meets the minimum length.
        if (password.length < 6) {
            setErrorMessage(
                "Password must be at least 6 characters."
            );

            return;
        }


        // Checks that both password fields match.
        if (password !== confirmPassword) {
            setErrorMessage(
                "Passwords do not match."
            );

            return;
        }


        try {
            // Starts loading and clears the old error.
            setIsLoading(true);
            setErrorMessage("");


            // Creates a new Firebase user account.
            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            // Adds the user's full name to the Firebase profile.
            await updateProfile(
                userCredential.user,
                {
                    displayName:
                        fullName.trim()
                }
            );


            // Opens the dashboard after successful registration.
            navigate("/home");
        } catch (error) {
            console.error(
                "Signup error:",
                error
            );


            // Displays an error when the email is already registered.
            if (
                error.code ===
                "auth/email-already-in-use"
            ) {
                setErrorMessage(
                    "This email already has an account."
                );
            } else if (
                error.code ===
                "auth/invalid-email"
            ) {
                // Displays an error for an invalid email format.
                setErrorMessage(
                    "Please enter a valid email address."
                );
            } else if (
                error.code ===
                "auth/weak-password"
            ) {
                // Displays an error when Firebase rejects the password.
                setErrorMessage(
                    "Please choose a stronger password."
                );
            } else {
                // Displays a general account creation error.
                setErrorMessage(
                    "Unable to create your account."
                );
            }
        } finally {
            // Stops loading after the request finishes.
            setIsLoading(false);
        }
    }


    // Displays the account registration interface.
    return (
        <main className="account-page">

            {/* Displays the signup form card. */}
            <div className="form-card signup-card">

                {/* Displays the signup heading and description. */}
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


                {/* Submits the account registration form. */}
                <form onSubmit={handleSignup}>

                    {/* Collects the user's full name. */}
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


                    {/* Collects the user's email address. */}
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
                                setEmail(
                                    event.target.value
                                )
                            }
                            required
                        />

                    </div>


                    {/* Collects the user's password. */}
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


                    {/* Collects the password confirmation. */}
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


                    {/* Displays validation or Firebase errors. */}
                    {errorMessage && (
                        <p className="error-message">
                            {errorMessage}
                        </p>
                    )}


                    {/* Creates the account when the form is valid. */}
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


                {/* Returns the user to the login page. */}
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