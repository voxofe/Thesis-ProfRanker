export function normalizePath(pathname) {
  return pathname === "/" ? "/home" : pathname;
}

export function getParentPath(pathname) {
  const path = normalizePath(pathname);
  if (path === "/home") return null;
  if (path === "/positions") return "/home";
  if (path.startsWith("/positions/")) return "/positions";
  if (path === "/scientific-fields") return "/home";
  if (path.startsWith("/scientific-fields/")) return "/scientific-fields";
  if (path === "/register-admin") return "/home";
  if (path === "/ranking") return "/home";
  if (path.startsWith("/applicant-score/")) return "/home";
  if (path === "/form") return "/home";
  return "/home";
}

export function isChildRoute(parentPath, childPath) {
  const parent = normalizePath(parentPath);
  const child = normalizePath(childPath);
  return getParentPath(child) === parent;
}
