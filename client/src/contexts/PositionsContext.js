import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { EMAIL_VERIFICATION_ENABLED } from "../utils/featureFlags";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000"
).replace(
  /\/+$/,
  ""
);

const PositionsContext = createContext();

export const usePositions = () => useContext(PositionsContext);

export const PositionsProvider = ({ children }) => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, isLoading: authLoading, currentUser } = useAuth();

  const refreshPositions = useCallback(async () => {
    if (authLoading) return;
    if (!isLoggedIn) {
      setPositions([]);
      setLoading(false);
      return;
    }

    if (EMAIL_VERIFICATION_ENABLED && currentUser?.verified === false) {
      setPositions([]);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/positions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setPositions(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [authLoading, isLoggedIn, currentUser?.verified]);

  useEffect(() => {
    refreshPositions();
  }, [refreshPositions]);

  return (
    <PositionsContext.Provider value={{ positions, loading, refreshPositions }}>
      {children}
    </PositionsContext.Provider>
  );
};