import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getParentPath, isChildRoute, normalizePath } from "../utils/navigationHierarchy";

const BackLinkQueueContext = createContext({
  stack: [],
  peek: null,
  pop: () => null,
  markBackNavigation: () => {},
});

export const useBackLinkQueue = () => useContext(BackLinkQueueContext);

export function PreviousLocationProvider({ children }) {
  const location = useLocation();
  const prevRef = useRef(null);
  const stackRef = useRef([]);
  const backNavRef = useRef(false);
  const [stack, setStack] = useState([]);

  useEffect(() => {
    const prev = prevRef.current;
    if (!prev || prev.pathname === location.pathname) {
      prevRef.current = location;
      return;
    }

    if (backNavRef.current) {
      backNavRef.current = false;
      prevRef.current = location;
      return;
    }

    const prevPath = normalizePath(prev.pathname);
    const nextPath = normalizePath(location.pathname);
    const isChild = isChildRoute(prevPath, nextPath);
    const isParent = getParentPath(prevPath) === nextPath;
    if (isChild || isParent) {
      if (stackRef.current.length) {
        stackRef.current = [];
        setStack([]);
      }
    } else {
      const nextStack = [...stackRef.current, { pathname: prevPath, search: prev.search || "" }];
      stackRef.current = nextStack;
      setStack(nextStack);
    }

    prevRef.current = location;
  }, [location]);

  const pop = () => {
    if (!stackRef.current.length) return null;
    const nextStack = stackRef.current.slice(0, -1);
    const item = stackRef.current[stackRef.current.length - 1];
    stackRef.current = nextStack;
    setStack(nextStack);
    return item;
  };

  const markBackNavigation = () => {
    backNavRef.current = true;
  };

  const peek = stack.length ? stack[stack.length - 1] : null;

  return (
    <BackLinkQueueContext.Provider value={{ stack, peek, pop, markBackNavigation }}>
      {children}
    </BackLinkQueueContext.Provider>
  );
}

export default PreviousLocationProvider;
