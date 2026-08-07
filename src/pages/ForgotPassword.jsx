
import { useState } from "react";
import { Link } from "react-router-dom";

import { FaLock } from "react-icons/fa";

import {
    sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../firebase.jsx";


// Displays the password recovery page.
function ForgotPassword() {

    // Stores the email entered by the user.
    const [email, setEmail] =
        useState("");


    // Stores the password reset success message.
    const [
        successMessage,
        setSuccessMessage
    ] = useState("");


    // Stores any password reset error message.
    const [
        errorMessage,
        setErrorMessage
    ] = useState("");


    // Tracks whether the reset request is being processed.
    const [
        isLoading,
        setIsLoading
    ] = useState(false);


    // Sends a password reset email through Firebase.
    async function handleResetPassword(event) {
        event.preventDefault();

        try {
            // Starts the loading state and clears old messages.
            setIsLoading(true);
            setErrorMessage("");
            setSuccessMessage("");


            // Requests a password reset email from Firebase.
            await sendPasswordResetEmail(
                auth,
                email
            );


            // Displays a success message after the email is sent.
            setSuccessMessage(
                "Password reset instructions have been sent. Please check your email."
            );
        } catch (error) {
            console.error(
                "Password reset error:",
                error
            );


            // Displays a message when the email format is invalid.
            if (
                error.code ===
                "auth/invalid-email"
            ) {
                setErrorMessage(
                    "Please enter a valid email address."
                );
            } else {
                // Displays a general error for other failures.
                setErrorMessage(
                    "Unable to send the reset email."
                );
            }
        } finally {
            // Stops the loading state after the request finishes.
            setIsLoading(false);
        }
    }


    // Displays the password recovery form.
    return (
        <main className="account-page">

            {/* Displays the password recovery card. */}
            <div className="form-card reset-card">

                {/* Displays the password recovery icon. */}
                <div className="reset-icon">
                    <FaLock />
                </div>


                {/* Displays the form title and instructions. */}
                <div className="form-header">

                    <p className="form-tag">
                        ACCOUNT RECOVERY
                    </p>

                    <h2>Forgot Password?</h2>

                    <p className="subtitle">
                        Enter your email and we will send you
                        instructions to reset your password.
                    </p>

                </div>


                {/* Submits the password reset request. */}
                <form onSubmit={handleResetPassword}>

                    {/* Collects the user's email address. */}
                    <div className="input-group">

                        <label htmlFor="resetEmail">
                            Email
                        </label>

                        <input
                            type="email"
                            id="resetEmail"
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


                    {/* Displays an error when the request fails. */}
                    {errorMessage && (
                        <p className="error-message">
                            {errorMessage}
                        </p>
                    )}


                    {/* Sends the password reset request. */}
                    <button
                        type="submit"
                        className="main-button"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Sending..."
                            : "Send Reset Link"
                        }
                    </button>

                </form>


                {/* Displays confirmation after the email is sent. */}
                {successMessage && (
                    <p className="success-message">
                        {successMessage}
                    </p>
                )}


                {/* Returns the user to the login page. */}
                <p className="switch-text">
                    Remember your password?

                    <Link to="/">
                        Back to Log In
                    </Link>
                </p>

            </div>

        </main>
    );
}

export default ForgotPassword;

