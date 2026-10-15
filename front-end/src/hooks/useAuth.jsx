import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
    }

    authService
      .getMe()
      .then((response) => setUser(response.data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));

    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const signIn = async (payload) => {
    const response = await authService.login(payload);
    localStorage.setItem("token", response.data.token);
    setUser(response.data.user);
  };

  const signUp = async (payload) => {
    const response = await authService.register(payload);
    localStorage.setItem("token", response.data.token);
    setUser(response.data.user);
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    setLoading(false);
  };

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, isAuthenticated: Boolean(user) }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
