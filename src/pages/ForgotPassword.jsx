import { useState } from "react";
import { Link } from "react-router-dom";

import { FaLock } from "react-icons/fa";

import {
    sendPasswordResetEmail
} from "firebase/auth";

import { auth } from "../firebase";

function ForgotPassword() {
    const [email, setEmail] = useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    const [errorMessage, setErrorMessage] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(false);

    async function handleResetPassword(event) {
        event.preventDefault();

        try {
            setIsLoading(true);
            setErrorMessage("");
            setSuccessMessage("");

            await sendPasswordResetEmail(
                auth,
                email
            );

            setSuccessMessage(
                "Password reset instructions have been sent. Please check your email."
            );
        } catch (error) {
            console.error(
                "Password reset error:",
                error
            );

            if (error.code === "auth/invalid-email") {
                setErrorMessage(
                    "Please enter a valid email address."
                );
            } else {
                setErrorMessage(
                    "Unable to send the reset email."
                );
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="account-page">

            <div className="form-card reset-card">

                <div className="reset-icon">
                    <FaLock />
                </div>


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


                <form onSubmit={handleResetPassword}>

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
                                setEmail(event.target.value)
                            }
                            required
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
                            ? "Sending..."
                            : "Send Reset Link"
                        }
                    </button>

                </form>


                {successMessage && (
                    <p className="success-message">
                        {successMessage}
                    </p>
                )}


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