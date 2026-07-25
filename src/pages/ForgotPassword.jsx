import { useState } from "react";
import { Link } from "react-router-dom";
import { FaLock } from "react-icons/fa6";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    function handleResetPassword(event) {
        event.preventDefault();

        setMessage(
            "Reset link request submitted."
        );

        console.log("Reset password email:", email);
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
                        Enter your email address and we will send
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


                    <button
                        type="submit"
                        className="main-button"
                    >
                        Send Reset Link
                    </button>

                </form>


                {message && (
                    <p className="success-message">
                        {message}
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