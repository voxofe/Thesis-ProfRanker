import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import BackLink from "./BackLink";
import { useBackLinkQueue } from "../contexts/PreviousLocationContext";
import { getParentPath } from "../utils/navigationHierarchy";

export default function BackLinkController({ className = "" }) {
  const location = useLocation();
  const { peek, pop, markBackNavigation } = useBackLinkQueue();

  const parentPath = getParentPath(location.pathname);
  const target = useMemo(() => {
    if (peek) return peek.pathname + (peek.search || "");
    return parentPath || "/home";
  }, [peek, parentPath]);

  const handleClick = () => {
    if (peek) pop();
    markBackNavigation();
  };

  return <BackLink className={className} to={target} onClick={handleClick} />;
}
