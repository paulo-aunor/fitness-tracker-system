import { useState } from "react";

import {
    FaEye,
    FaEyeSlash
} from "react-icons/fa";

function PasswordInput({
    id,
    placeholder,
    value,
    onChange
}) {
    const [showPassword, setShowPassword] =
        useState(false);

    function togglePassword() {
        setShowPassword((currentValue) => !currentValue);
    }

    return (
        <div className="password-box">

            <input
                type={showPassword ? "text" : "password"}
                id={id}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
            />

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