
import { useState } from "react";

import {
    FaEye,
    FaEyeSlash
} from "react-icons/fa";


// Displays a password input with a show and hide button.
function PasswordInput({
    id,
    placeholder,
    value,
    onChange
}) {
    // Stores whether the password is visible.
    const [showPassword, setShowPassword] =
        useState(false);


    // Shows or hides the password text.
    function togglePassword() {
        setShowPassword(
            (currentValue) =>
                !currentValue
        );
    }


    // Displays the password field and visibility button.
    return (
        <div className="password-box">

            {/* Displays the password input field. */}
            <input
                type={
                    showPassword
                        ? "text"
                        : "password"
                }
                id={id}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
            />


            {/* Changes the password visibility. */}
            <button
                type="button"
                className="eye-button"
                onClick={togglePassword}
                aria-label={
                    showPassword
                        ? "Hide password"
                        : "Show password"
                }
            >
                {/* Displays the correct visibility icon. */}
                {showPassword ? (
                    <FaEyeSlash />
                ) : (
                    <FaEye />
                )}
            </button>

        </div>
    );
}

export default PasswordInput;

