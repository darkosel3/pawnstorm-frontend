// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const guestMode = localStorage.getItem("guestMode");

    if (guestMode === "true") {
      // Guest mode
      setIsGuest(true);
      setUser({
        player_id: "guest_" + Date.now(),
        name: "Guest Player",
        username: "guest",
        email: "guest@chess.com",
      });
      setLoading(false);
    } else if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get("/me");
      setUser(response.data);
      setIsGuest(false);
    } catch (error) {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.removeItem("guestMode");
      setUser(user);
      setIsGuest(false);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const loginAsGuest = () => {
    localStorage.setItem("guestMode", "true");
    localStorage.removeItem("token");
    setIsGuest(true);
    setUser({
      player_id: "guest_" + Date.now(),
      name: "Guest Player",
      username: "guest",
      email: "guest@chess.com",
    });
    return { success: true };
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/register", userData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.removeItem("guestMode");
      setUser(user);
      setIsGuest(false);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("guestMode");
    setUser(null);
    setIsGuest(false);
  };

  const value = {
    user,
    login,
    loginAsGuest,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
