import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import BackLink from "./BackLink";
import { useBackLinkQueue } from "../contexts/PreviousLocationContext";
import { getParentPath } from "../utils/navigationHierarchy";

export default function BackLinkController({ className = "" }) {
  const location = useLocation();
  const { stack, pop, clear, markBackNavigation } = useBackLinkQueue();

  useEffect(() => {
    if (location.pathname === "/scientific-fields/view" && stack.length) {
      clear();
    }
  }, [location.pathname, stack.length, clear]);

  const parentPath = getParentPath(location.pathname);
  const current = location.pathname + (location.search || "");
  const stackTarget = useMemo(() => {
    for (let i = stack.length - 1; i >= 0; i -= 1) {
      const candidate = stack[i].pathname + (stack[i].search || "");
      if (candidate !== current) return candidate;
    }
    return null;
  }, [stack, current]);
  const target = stackTarget || parentPath || "/home";

  const handleClick = () => {
    if (stackTarget) {
      let item = pop();
      while (item && (item.pathname + (item.search || "")) !== stackTarget) {
        item = pop();
      }
    }
    markBackNavigation();
  };

  return <BackLink className={className} to={target} onClick={handleClick} />;
}
