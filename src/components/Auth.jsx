import { useState } from "react";
import { auth } from "../firebase.jsx";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  
async function handleSubmit(e) {
  e.preventDefault(); // stops the page from refreshing when the form submits

  try {
    if (isLogin) {
      // User is logging in — check their email/password against Firebase
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      // User is signing up — create a brand new account
      await createUserWithEmailAndPassword(auth, email, password);
    }
  } catch (err) {
    // If either call fails (wrong password, email already used, etc.),
    // save the error message so we can display it to the user
    setError(err.message);
  }
}
return (
  <form onSubmit={handleSubmit}>
    <h2>{isLogin ? "Log In" : "Sign Up"}</h2>

    {error && <p style={{ color: "red" }}>{error}</p>}

    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    <button type="submit">{isLogin ? "Log In" : "Sign Up"}</button>

    <p>
      {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
      <button type="button" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Sign Up" : "Log In"}
      </button>
    </p>
  </form>
);  
}

