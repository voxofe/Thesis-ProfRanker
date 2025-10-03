import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const PreviousLocationContext = createContext({ previous: null });

export const usePreviousLocation = () => useContext(PreviousLocationContext);

export function PreviousLocationProvider({ children }) {
  const location = useLocation();
  const prevRef = useRef(null);
  const [previous, setPrevious] = useState(null);

  useEffect(() => {
    // On every location change, update the stored previous location with the last value.
    // We store the location object so callers can reuse pathname and search.
    setPrevious(prevRef.current);
    prevRef.current = location;
  }, [location]);

  return (
    <PreviousLocationContext.Provider value={{ previous }}>
      {children}
    </PreviousLocationContext.Provider>
  );
}

export default PreviousLocationProvider;
