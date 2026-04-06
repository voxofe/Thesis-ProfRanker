import React, { createContext, useContext, useEffect, useState } from "react";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/api/positions`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        setPositions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <PositionsContext.Provider value={{ positions, loading }}>
      {children}
    </PositionsContext.Provider>
  );
};