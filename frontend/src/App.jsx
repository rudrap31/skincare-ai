import React from "react";
import "./App.css";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./components/Home";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp";
import Dashboard from "./components/Dashboard";
import Onboarding from "./components/auth/Onboarding";
import Profile from "./components/auth/Profile";

const App = () => {
  const { user, hasCompletedOnboarding, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div data-theme="corporate">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" /> : <SignUp />}
        />

        {/* Protected Routes */}
        <Route
        path="/dashboard"
        element={
            loading || hasCompletedOnboarding === null ? ( // wait until status is loaded
            <div className="flex justify-center items-center min-h-screen">Loading...</div>
            ) : !user ? (
            <Navigate to="/login" />
            ) : !hasCompletedOnboarding ? (
            <Navigate to="/onboarding" />
            ) : (
            <Dashboard />
            )
        }
        />

        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/" />}
        />
        <Route
          path="/onboarding"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : hasCompletedOnboarding ? (
              <Navigate to="/dashboard" />
            ) : (
              <Onboarding />
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
