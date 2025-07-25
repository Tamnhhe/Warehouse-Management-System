const db = require("../models/index");
const User = db.User;
const {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyResetToken,
  verifyRefreshToken,
} = require("../utils/Jwt");
const { hashPassword, isMatch } = require("../utils/Hasher");
const { sendMail } = require("../utils/Mailer");
// Đăng ký người dùng mới

const register = async (req, res) => {
  const { email, password, fullname } = req.body;
  try {
    const existingUser = await User.findOne({ "account.email": email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      fullName: fullname,
      account: {
        email,
        password: hashedPassword,
      },
      status: "inactive", // Mặc định là inactive
    });

    // Gửi email xác minh tài khoản
    const verificationToken = generateResetToken(newUser);
    const verificationLink = `http://localhost:3000/verify-email/${newUser._id}/${verificationToken}`;
    const subject = "Xác minh tài khoản của bạn";
    const text = `Vui lòng nhấp vào liên kết sau để xác minh tài khoản của bạn: ${verificationLink}`;
    const html = `<p>Vui lòng nhấp vào liên kết sau để xác minh tài khoản của bạn: <a href="${verificationLink}">Xác minh tài khoản</a></p>`;
    sendMail(email, subject, text, html, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending email" });
      }
      return res.status(200).json({ message: "Registration successful", info });
    });

    await newUser.save();
    res
      .status(201)
      .json({
        message: "Đăng ký thành công! Vui lòng xác minh tài khoản của bạn.",
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.User.findOne({ "account.email": email });
    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    if (user.status === "inactive") {
      return res
        .status(401)
        .json({ message: "Vui lòng xác minh tài khoản của bạn!" });
    }
    if (user.status === "banned") {
      return res
        .status(401)
        .json({ message: "Tài khoản của bạn đã bị cấm đăng nhập" });
    }

    const isValidPassword = await isMatch(password, user.account.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: "Login successful!",
      token: accessToken,
      refreshToken: refreshToken,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const token = generateResetToken(user);
    const verificationLink = `http://localhost:3000/resetPassword/${user._id}/${token}`;
    await sendMail(
      email,
      "Reset Password",
      `Please click the link below to reset your password: Reset Password`,
      `<p>Please click the link below to reset your password: <a href="${verificationLink}">Reset Password</a></p>`
    );
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = verifyResetToken(token);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.password = await hashPassword(newPassword);
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { id, token } = req.params;
  try {
    if (!id || !token) {
      return res.status(400).json({ message: "Invalid verification link" });
    }
    console.log("Verifying email for user ID:", id, "with token:", token);

    const decoded = verifyResetToken(token);
    if (decoded.id !== id) {
      return res.status(400).json({ message: "Invalid verification link" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.status = "active"; // Set status to active
    await user.save();
    //Redirect to login page
    res.redirect("http://localhost:3000/login");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  console.log("Refreshing token with refreshToken:", refreshToken);
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const newAccessToken = generateAccessToken(user);
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000,
    });
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
};

// Hàm mới - lấy thông tin người dùng hiện tại từ token
const getCurrentUser = async (req, res) => {
  try {
    // req.user đã được xác thực từ middleware authenticateJWT
    const user = await User.findById(req.user.id).select("-account.password");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
  logout,
  getCurrentUser,
};
