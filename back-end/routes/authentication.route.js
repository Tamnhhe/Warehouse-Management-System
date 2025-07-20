const express = require("express");
const authRouter = express.Router();
const { AuthenticationController } = require("../controllers");
const {
  login,
  register,
  verifyEmail,
  refreshToken,
  logout,
  getCurrentUser,
} = require("../controllers/auth.controller");
const { authenticateJWT } = require("../middlewares/jwtMiddleware");

authRouter.post("/login", login);
authRouter.post("/new-register", register);
authRouter.get("/verify-email/:id/:token", verifyEmail);
authRouter.post("/refresh", refreshToken);
authRouter.post("/logout", logout);
authRouter.get("/current-user", authenticateJWT, getCurrentUser);

authRouter.post("/forgot-password", AuthenticationController.forgotPassword);
authRouter.post(
  "/reset-password/:id/:token",
  AuthenticationController.resetPassword
);
authRouter.post("/verify/:token", AuthenticationController.verifyAccount);
authRouter.post("/register", AuthenticationController.registerCustomer);

authRouter.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the authentication route!" });
});
module.exports = authRouter;
