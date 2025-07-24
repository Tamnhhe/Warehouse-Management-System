const { verifyAccessToken } = require("../utils/Jwt");

// Helper function để lấy token từ request
const getTokenFromRequest = (req) => {
  // Thử lấy từ Authorization header trước
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Nếu không có thì thử lấy từ cookies
  return req.cookies?.accessToken || null;
};

// Middleware to authenticate JWT also validate role
const roleAuthenticate = (roles) => {
  return (req, res, next) => {
    const token = getTokenFromRequest(req);
    if (token) {
      try {
        const user = verifyAccessToken(token);
        if (roles.includes(user.role)) {
          req.user = user;
          next();
        } else {
          return res
            .status(403)
            .json({ error: "Forbidden: Insufficient permissions" });
        }
      } catch (error) {
        console.error(error);
        if (error.name === "TokenExpiredError") {
          return res.status(401).json({ error: "Token expired" });
        } else {
          return res.status(403).json({ error: "Invalid token" });
        }
      }
    } else {
      return res.status(401).json({ error: "Access token missing" });
    }
  };
};

const authenticateJWT = (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (token) {
    try {
      const user = verifyAccessToken(token);
      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      } else {
        return res.status(403).json({ error: "Invalid token" });
      }
    }
  } else {
    return res.status(401).json({ error: "Access token missing" });
  }
};

module.exports = {
  authenticateJWT,
  roleAuthenticate,
};
