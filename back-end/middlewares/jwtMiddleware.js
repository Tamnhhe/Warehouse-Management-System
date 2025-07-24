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
  console.log("🔍 DEBUG JWT Middleware:");
  console.log("- Token received:", token ? "✅ Có token" : "❌ Không có token");
  console.log("- Token value:", token?.substring(0, 50) + "...");

  if (token) {
    try {
      const user = verifyAccessToken(token);
      console.log("- User decoded:", {
        id: user.id,
        email: user.email,
        role: user.role,
      });
      req.user = user;
      next();
    } catch (error) {
      console.error("❌ JWT Verification Error:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      } else {
        return res.status(403).json({ error: "Invalid token" });
      }
    }
  } else {
    console.log("❌ No token found in request");
    return res.status(401).json({ error: "Access token missing" });
  }
};

module.exports = {
  authenticateJWT,
  roleAuthenticate,
};
