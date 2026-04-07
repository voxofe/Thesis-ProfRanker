import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

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
  const { isLoggedIn, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      setPositions([]);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);
    fetch(`${API_BASE_URL}/api/positions`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        setPositions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authLoading, isLoggedIn]);

  return (
    <PositionsContext.Provider value={{ positions, loading }}>
      {children}
    </PositionsContext.Provider>
  );
};