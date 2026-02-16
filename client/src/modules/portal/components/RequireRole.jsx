import { Navigate } from "react-router-dom";

export default function RequireRole({
  profile,
  allow = [],
  children,
}) {
  if (!profile) {
    return <Navigate to="/portal/login" replace />;
  }

  const role = profile.role || "user";

  if (!allow.includes(role)) {
    return <Navigate to="/portal" replace />;
  }

  return children;
}