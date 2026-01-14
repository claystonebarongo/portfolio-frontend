import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Terms from "./pages/Terms";
import VerifyPhone from "./pages/VerifyPhone";
import Register from "./pages/Register";
import RegistrationComplete from "./pages/RegistrationComplete";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Network from "./pages/Network";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import TrusteeDashboard from "./pages/TrusteeDashboard"; 
import ProtectedRoute from "./components/ProtectedRoute";

// Import your logo
import systemLogo from "./assets/logo.jpeg";

export default function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      /* This ensures the Navy to Crimson gradient is the base of everything */
      background: 'radial-gradient(circle at top left, #0a192f 20%, #0d1117 60%, #4d0d0d 100%)',
      position: 'relative'
    }}>
      
      {/* Background Watermark - stays fixed behind all pages */}
      <img 
        src={systemLogo} 
        className="bg-watermark" 
        alt="System Logo" 
      />

      {/* Background Glow */}
      <div className="watermark-glow-orb"></div>

      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/verify-phone" element={<VerifyPhone />} />
        <Route path="/register" element={<Register />} />

        {/* --- PROTECTED ROUTES (USER LEVEL) --- */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="user">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/portfolio" element={
          <ProtectedRoute requiredRole="user">
            <Portfolio />
          </ProtectedRoute>
        } />
        <Route path="/network" element={
          <ProtectedRoute requiredRole="user">
            <Network />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute requiredRole="user">
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/registration-complete" element={
          <ProtectedRoute requiredRole="user">
            <RegistrationComplete />
          </ProtectedRoute>
        } />
        <Route path="/trustee-dashboard" element={
          <ProtectedRoute requiredRole="user">
            <TrusteeDashboard />
          </ProtectedRoute>
        } />

        {/* --- PROTECTED ROUTES (ADMIN LEVEL) --- */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* --- REDIRECTS --- */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}