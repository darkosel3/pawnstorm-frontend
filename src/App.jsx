import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import LocalGame from "./components/LocalGame";

// import GameRoom from "./components/GameRoom";
// import Friends from "./components/Friends";
// import Profile from "./components/Profile";
import Navbar from "./components/Navbar";
import "./App.css";
import SignUp from "./components/SignUp";
import FriendsPage from "./components/Friends";
import AdminPanel from "./components/Admin";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isGuest } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  // ako je guest ili nije ulogovan → šaljemo ga na login
  if (!isAuthenticated || isGuest) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main App Layout
const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const location = useLocation(); // Premestite ovde

  const isLoginPage = location.pathname === "/login"; // Dodajte ovo
  const isLocalGame = location.pathname === "/game/local"; // Dodajte ovo

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? "ml-64" : ""}>
        {isLoginPage || isLocalGame ? (
          // Login i Local Game - centrirano u preostalom prostoru
          <div className="min-h-screen flex items-center justify-center">
            {children}
          </div>
        ) : (
          // Ostale stranice - normalno
          <div className="p-8">{children}</div>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/game/local" element={<LocalGame />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/admin" element={<AdminPanel />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* <Route
              path="/game/:gameId"
              element={
                <ProtectedRoute>
                  <GameRoom />
                </ProtectedRoute>
              }
            /> */}
            {/* <Route
              path="/friends"
              element={
                <ProtectedRoute>
                  <Friends />
                </ProtectedRoute>
              }
            /> */}
            {/* <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            /> */}
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
