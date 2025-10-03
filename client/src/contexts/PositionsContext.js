import React, { createContext, useContext, useEffect, useState } from "react";

const PositionsContext = createContext();

export const usePositions = () => useContext(PositionsContext);

export const PositionsProvider = ({ children }) => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://127.0.0.1:8000/api/positions", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        setPositions(data);
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