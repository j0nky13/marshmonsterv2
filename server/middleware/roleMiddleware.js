export function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.status === "blocked" || req.user.role === "blocked") {
      return res.status(403).json({
        message: "Your account is not authorized yet.",
        blocked: true
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource."
      });
    }

    next();
  };
}