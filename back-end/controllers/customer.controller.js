const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models/index"); // db.Customer

// Đăng ký customer mới (không cần verify email)
async function registerCustomer(req, res) {
  try {
    const { fullName, email, password, phoneNumber, dob, address, gender, idCard } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc" });
    }

    // Kiểm tra email đã tồn tại chưa
    const existing = await db.Customer.findOne({ "account.email": email });
    if (existing) {
      return res.status(409).json({ message: "Email đã được sử dụng" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCustomer = new db.Customer({
      fullName,
      account: {
        email,
        password: hashedPassword,
      },
      profile: {
        phoneNumber: phoneNumber || null,
        dob: dob || null,
        address: address || null,
        gender: gender || null,
        idCard: idCard || null,
      },
      status: "active",
    });

    await newCustomer.save();

    res.status(201).json({ message: "Đăng ký thành công! Bạn có thể đăng nhập ngay." });
  } catch (error) {
    console.error("Error registering customer:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}

// Đăng nhập customer
async function loginCustomer(req, res) {
  try {
    const { email, password } = req.body;

    const customer = await db.Customer.findOne({ "account.email": email });
    if (!customer) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    if (customer.status !== "active") {
      return res.status(401).json({ message: "Tài khoản chưa được kích hoạt hoặc bị khóa" });
    }

    const isMatch = await bcrypt.compare(password, customer.account.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu!" });
    }

    const token = jwt.sign(
      { id: customer._id, email: customer.account.email, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    res.status(200).json({
      status: "Login successful",
      token,
      customer,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}

// Lấy profile customer
async function getProfile(req, res) {
  try {
    const customerId = req.user.id; // giả sử middleware auth đã gán req.user
    const customer = await db.Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    res.status(200).json(customer);
  } catch (error) {
    console.error("Lỗi lấy profile khách hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
}

// Cập nhật profile customer
async function editProfile(req, res) {
  try {
    const customerId = req.user.id;
    const { fullName, phoneNumber, dob, address, gender, idCard } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : req.body.avatar;

    // Kiểm tra dữ liệu cần thiết nếu muốn

    const updateData = {
      fullName,
      "profile.phoneNumber": phoneNumber,
      "profile.dob": dob,
      "profile.address": address,
      "profile.gender": gender,
      "profile.idCard": idCard,
    };

    if (avatar) updateData["profile.avatar"] = avatar;

    const updatedCustomer = await db.Customer.findByIdAndUpdate(customerId, { $set: updateData }, { new: true });
    if (!updatedCustomer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }

    res.status(200).json({ message: "Cập nhật thông tin thành công", customer: updatedCustomer });
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
}

module.exports = {
  registerCustomer,
  loginCustomer,
  getProfile,
  editProfile,
};
