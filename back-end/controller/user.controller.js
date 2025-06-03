const mongoose = require("mongoose");
const db = require("../models/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
async function getProfile(req, res, next) {
  try {
    const token = req.headers.authorization;
    /* console.log(req.headers);*/
    if (!token) {
      return res.status(401).json({ message: "Không tồn tại token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded token:", decoded);

    const user = await db.User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi lấy dữ liệu người dùng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
}
// - Ham edit Profile
async function editProfile(req, res, next) {
    try {
        const token = req.headers.authorization;
        //xac thuc ng dung bang jwtjwt
        if (!token) {
            return res.status(401).json({ message: "Không tồn tại token" });
        }
        //lay token tu header
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const user = await db.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        //lay data tu req.bodybody
        const { fullName, phoneNumber, dob, address, gender, idCard } = req.body;
        //kiem tra neu co file anh dai dien, cap nhat duong dan cua anh neu khong giu nguyen avatar cucu
        const avatar = req.file ? `/uploads/${req.file.filename}` : req.body.avatar;
        // Validate tuổi (phải trên 18)
        const birthDate = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        // Kiểm tra nếu chưa đủ 18 tuổi
        if (age < 18 || (age === 18 && monthDiff < 0)) {
            return res.status(400).json({ message: "Người dùng phải trên 18 tuổi." });
        }
        // Validation
        if (!fullName || !phoneNumber || !idCard || !address) {
            return res.status(400).json({ message: "Tên đầy đủ , Số điện thoại, Số căn cước, và Địa chỉ không được để trống ." });
        }
        // Validate phone 10-15 number
        if (!/^\d{10,15}$/.test(phoneNumber)) {
            return res.status(400).json({ message: "Số điện thoại không hợp lệ." });
        }
        // Validate 12 number - positive 
        if (!/^\d{12}$/.test(idCard) || Number(idCard) < 0) {
            return res.status(400).json({ message: "Số căn cước phải có 12 số và không được nhập số âm." });
        }
        // Validate Full Name (chỉ cho phép chữ cái và khoảng trắng, không số, không ký tự đặc biệt)
        if (!/^[\p{L}\s]+$/u.test(fullName)) {
            return res.status(400).json({ message: "Tên đầy đủ không hợp lệ." });
        }
        //ID card is unique 
        const existingUser = await db.User.findOne({ "profile.idCard": idCard, _id: { $ne: userId } });
        if (existingUser) {
            return res.status(409).json({ message: "Số căn cước đã tồn tại." });
        }
        //Phone number is unique 
        const existingPhoneNumber = await db.User.findOne({ "profile.phoneNumber": phoneNumber, _id: { $ne: userId } });
        if (existingPhoneNumber) {
            return res.status(409).json({ message: "Số điện thoại đã tồn tại." });
        }
            //update 
        const updatedData = {
            fullName,
            "profile.phoneNumber": phoneNumber,
            "profile.dob": dob,
            "profile.address": address,
            "profile.gender": gender,
            "profile.idCard": idCard,
        };
        //neu co avatar moi thi update dg dan avatar
        if (avatar) updatedData["profile.avatar"] = avatar;

    const updatedUser = await db.User.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true }
    );

    res
      .status(200)
      .json({
        message: "Cập nhật thông tin cá nhân thành công",
        user: updatedUser,
      });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin cá nhân:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
}
//Minh Phuong - Ham get user
async function getAllUsers(req, res, next) {
  try {
    const users = await db.User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi lấy dữ liệu người dùng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
}
//Minh Phuong - Ham change password
async function changePassword(req, res) {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: "Không tồn tại token" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await db.User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        //du lieu nhap vaovao
        const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng không để trống các trường" });
    }
    if (newPassword.includes(" ")) {
      return res
        .status(400)
        .json({ message: "Mật khẩu không được chứa dấu cách" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải dài ít nhất 6 chữ " });
    }

        if (confirmPassword !== newPassword) {
            return res.status(400).json({ message: "Xác nhận mật khẩu không khớp với mật khẩu mới" });
        }
        //check old pass, bcrypt so sanh pass word nhap vao voi mk da ma hoa trong db 
        const isMatch = await bcrypt.compare(oldPassword, user.account.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu cũ không đúng, vui lòng thử lại" });
        }
        //ma hoa va luu mk moi, so lan b se thuc hien qua trinh ma hoahoa
        user.account.password = await bcrypt.hash(newPassword, 10);
        await user.save();

    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi thay đổi mật khẩu:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}
async function updatedUser(req, res, next) {
  try {
    const { userId } = req.params;
    const { salary, type, shifts, workDays } = req.body;

    // cehck salary có phải là số hợp lệ không
    if (!/^\d+$/.test(salary)) {
      return res
        .status(400)
        .json({ error: "Mức lương phải là số và không chứa ký tự đặc biệt." });
    }

    const user = await db.User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // cập nhật thông tin
    const updatedUser = await db.User.findByIdAndUpdate(
      userId,
      {
        salary,
        type,
        "schedule.shifts": shifts,
        "schedule.workDays": workDays,
      },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Cập nhật thông tin thành công", user: updatedUser });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin người dùng:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}
// Thay đổi trạng thái user
async function banUser(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = await db.User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.status === "inactive") {
            return res.status(400).json({ message: "Người dùng này chưa được xác thực!" });
        }
        user.status = status;
        await user.save();
        res.status(200).json({ message: "User status changed successfully", user });
    } catch (error) {
        next(error);
    }
}


const userController = {
  getProfile,
  editProfile,
  getAllUsers,
  changePassword,
  updatedUser,
  banUser,
};

module.exports = userController;
