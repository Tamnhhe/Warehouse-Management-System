const express = require("express");
const authRouter = express.Router();
const { AuthenticationController } = require("../controllers");

authRouter.post("/login", AuthenticationController.login);
authRouter.post("/add-employee", AuthenticationController.addEmployee);
authRouter.post("/forgot-password", AuthenticationController.forgotPassword);
authRouter.post("/reset-password/:id/:token", AuthenticationController.resetPassword);
authRouter.post("/verify/:token", AuthenticationController.verifyAccount);


module.exports = authRouter;
