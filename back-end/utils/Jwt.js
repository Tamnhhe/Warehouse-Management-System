const jwt = require("jsonwebtoken");
require("dotenv").config();

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.account.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    {
      expiresIn: "8h", // ✅ TĂNG LÊN 8 TIẾNG cho ca làm việc
    }
  );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.account.email },
    process.env.REFRESH_TOKEN_SECRET_KEY,
    {
      expiresIn: 60 * 60 * 24 * 7, // 1 week
    }
  );
};

// Generate Reset Token
const generateResetToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.account.email },
    process.env.RESET_TOKEN_SECRET_KEY,
    {
      expiresIn: 60 * 15, // 15 minutes
    }
  );
};

/* Verify Tokens */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET_KEY);
};

const verifyResetToken = (token) => {
  return jwt.verify(token, process.env.RESET_TOKEN_SECRET_KEY);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateResetToken,
  verifyResetToken,
};
