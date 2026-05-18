export function normalizePath(pathname) {
  return pathname === "/" ? "/home" : pathname;
}

export function getParentPath(pathname) {
  const path = normalizePath(pathname);
  if (path === "/home") return null;
  if (path.startsWith("/positions/")) return "/home";
  if (path === "/scientific-fields") return "/home";
  if (path.startsWith("/scientific-fields/")) return "/scientific-fields";
  if (path === "/users") return "/home";
  if (path === "/users/view") return "/users";
  if (path === "/users/register-admin") return "/users";
  if (path === "/register-admin") return "/users";
  if (path === "/analytics") return "/home";
  if (path === "/ranking") return "/home";
  if (path === "/my-applications") return "/home";
  if (path.startsWith("/application-score/")) return "/my-applications";
  if (path === "/form") return "/home";
  return "/home";
}

export function isChildRoute(parentPath, childPath) {
  const parent = normalizePath(parentPath);
  const child = normalizePath(childPath);
  return getParentPath(child) === parent;
}
