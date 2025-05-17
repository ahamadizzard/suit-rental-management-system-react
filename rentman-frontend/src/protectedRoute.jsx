// ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

// This component is used to protect routes based on user roles
const ProtectedRoute = ({ allowedRoles }) => {
    // Get the user role from local storage
    const userRole = localStorage.getItem('userRole');
    // Check if the user role is in the allowed roles array
    const isAllowed = allowedRoles.includes(userRole);

    // If the user role is not allowed, navigate to the unauthorized page
    if (!isAllowed) {
        return <Navigate to="/unauthorized" replace />;
    }

    // If the user role is allowed, render the outlet
    return <Outlet />;
};
// Export the ProtectedRoute component

export default ProtectedRoute;