```jsx
import {
    Navigate
} from "react-router-dom";


// Protects pages that require a logged-in user.
function ProtectedRoute({
    user,
    children
}) {
    // Redirects guests to the login page.
    if (!user) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }


    // Displays the protected page for logged-in users.
    return children;
}

export default ProtectedRoute;
```
