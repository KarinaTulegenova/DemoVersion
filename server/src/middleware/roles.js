function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden." });
    }
    return next();
  };
}

function allowOwnerOrAdmin(getOwnerId) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    if (req.user.role === "admin") {
      return next();
    }
    const ownerId = getOwnerId(req);
    if (!ownerId) {
      return res.status(403).json({ message: "Forbidden." });
    }
    if (ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden." });
    }
    return next();
  };
}

module.exports = { requireRole, allowOwnerOrAdmin };
