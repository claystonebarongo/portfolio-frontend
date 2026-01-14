import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole"); // "admin", "user", etc.
  const location = useLocation();

  // 1. GLOBAL AUTH: If no token exists, they aren't logged in.
  // Redirect to login, but save the location they were trying to reach
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. ROLE AUTHORIZATION: If a specific role is required for this route
  if (requiredRole && userRole !== requiredRole) {
    console.warn(`UNAUTHORIZED: ${userRole} tried to access ${location.pathname}`);
    
    // Redirect based on who they actually are
    if (userRole === "admin") return <Navigate to="/admin" replace />;
    
    // Default fallback for regular users/trustees
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}