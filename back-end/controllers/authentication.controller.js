
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const db = require("../models/index");

// Hàm gửi email
async function sendEmail(type, email, link) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    let subject;
    let text;

    if (type == "verify") {
        subject = "Verify your account";
        text = `Click this link to verify your account: ${link}`;
    } else if (type == "reset") {
        subject = "Change your password";
        text = `Click this link to change your password: ${link}`;
    } else {
        throw new Error("Invalid email type");
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: text,
    };

    return transporter.sendMail(mailOptions);
}

// Hàm đăng nhập
async function login(req, res) {
    const { email, password } = req.body;
    try {
        const user = await db.User.findOne({ "account.email": email });
        if (!user) {
            return res.status(404).json({ message: "Tài khoản không tồn tại" });
        }

        if (user.status === "inactive") {
            return res.status(401).json({ message: "Vui lòng xác minh tài khoản của bạn!" });
        }
        if (user.status === "banned") {
            return res.status(401).json({ message: "Tài khoản của bạn đã bị cấm đăng nhập" });
        }
        const isMatch = await bcrypt.compare(password, user.account.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Sai mật khẩu!" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.account.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "4h" }
        );

        res.status(200).json({
            status: "Login successful!",
            token: token,
            user,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: error.message });
    }
}
//Nghĩa sửa hàm này để cho phép tạo tài khoản cho customer gửi thông báo đặt mật khẩu về Gmail
async function registerCustomer(req, res) {
    try {
        const { fullName, email, phoneNumber, password, confirmPassword } = req.body;

        if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Mật khẩu nhập lại không khớp!" });
        }

        const existingUser = await db.User.findOne({ "account.email": email });
        if (existingUser) return res.status(409).json({ message: "Email đã tồn tại." });

        const existingPhoneNumber = await db.User.findOne({ "profile.phoneNumber": phoneNumber });
        if (existingPhoneNumber) return res.status(409).json({ message: "Số điện thoại này đã được sử dụng" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new db.User({
            fullName,
            account: {
                email,
                password: hashedPassword,
            },
            profile: {
                phoneNumber,
            },
            role: "customer",
            status: "active",
        });

        await newUser.save();

        res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (error) {
        console.error("Error registering customer:", error);
        res.status(500).json({ message: "Có lỗi xảy ra!" });
    }
}
// Hàm thêm nhân viên
async function addEmployee(req, res) {
    try {
        const {
            fullName, email, phoneNumber, avatar, dob, address, gender, idCard, salary, role, type,
            workDays, shifts, startTime, endTime
        } = req.body;

        if (!fullName || !email || !phoneNumber || !idCard || !salary || !role || !type) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
        }

        // Kiểm tra dữ liệu lịch làm việc
        if (type === "fulltime" && (!workDays || !startTime || !endTime)) {
            return res.status(400).json({ message: "Nhân viên fulltime cần có ngày làm việc, giờ bắt đầu và giờ kết thúc." });
        }

        if (type === "parttime" && (!workDays || !shifts)) {
            return res.status(400).json({ message: "Nhân viên parttime cần có ngày làm việc và ca làm việc." });
        }

        // Kiểm tra email, ID card, số điện thoại đã tồn tại hay chưa
        const existingUser = await db.User.findOne({ "account.email": email });
        if (existingUser) return res.status(409).json({ message: "Email đã tồn tại." });

        const existingIdCard = await db.User.findOne({ "profile.idCard": idCard });
        if (existingIdCard) return res.status(409).json({ message: "Căn cước này đã có trong hệ thống" });

        const existingPhoneNumber = await db.User.findOne({ "profile.phoneNumber": phoneNumber });
        if (existingPhoneNumber) return res.status(409).json({ message: "Số điện thoại này đã được sử dụng" });

        // Tạo mật khẩu ngẫu nhiên
        const generateRandomPassword = (length = 8) => {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
        };
        const password = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo thông tin nhân viên mới
        const newUser = new db.User({
            fullName,
            account: {
                email,
                password: hashedPassword,
            },
            profile: {
                phoneNumber,
                avatar: avatar || null,
                dob: dob || null,
                address: address || null,
                gender: gender || null,
                idCard,
            },
            salary,
            role,
            type,
            schedule: {
                workDays,
                shifts: type === "parttime" ? shifts : undefined,
                startTime: type === "fulltime" ? startTime : undefined,
                endTime: type === "fulltime" ? endTime : undefined,
            },
            status: "inactive",
        });

        await newUser.save();

        // Tạo token xác minh
        const verificationToken = jwt.sign(
            { id: newUser._id, email: newUser.account.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const verificationLink = `http://localhost:3000/verify/${verificationToken}`;
        await sendEmail("verify", email, verificationLink);

        res.status(201).json({ message: "Tạo tài khoản thành công, vui lòng xác minh tài khoản sớm!" });

    } catch (error) {
        console.error("Error adding employee:", error);
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Salary must be a positive number" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

// Hàm quên mật khẩu
async function forgotPassword(req, res) {
    const { phoneNumber, email } = req.body;
    try {
        const oldUser = await db.User.findOne({ "profile.phoneNumber": phoneNumber, "account.email": email });
        if (!oldUser) {
            return res.status(404).json({ message: "Email hoặc số điện thoại không chính xác!" });
        }

        const resetToken = jwt.sign(
            { id: oldUser._id, email: oldUser.account.email },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }  // Hết hạn sau 15 phút
        );

        const resetLink = `http://localhost:3000/resetPassword/${oldUser._id}/${resetToken}`;

        await sendEmail("reset", email, resetLink);

        res.json({ status: "Email đã gửi, vui lòng kiểm tra hòm thư" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Có lỗi xảy ra!" });
    }
}

// Hàm đặt lại mật khẩu
async function resetPassword(req, res) {
    const { id, token } = req.params;
    const { password, confirmPassword } = req.body;

    try {
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Mật khẩu nhập lại không khớp!" });
        }

        const oldUser = await db.User.findById(id);
        if (!oldUser) {
            return res.status(404).json({ message: "Nhân viên không tồn tại!" });
        }

        // Xác minh JWT token
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err || decoded.id !== oldUser._id.toString()) {
                return res.status(400).json({ message: "Invalid or expired token!" });
            }

            const encryptedPassword = await bcrypt.hash(password, 10);
            await db.User.updateOne(
                { _id: id },
                { $set: { "account.password": encryptedPassword } }
            );

            res.json({ message: "Đổi mật khẩu thành công!" });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Có lỗi xảy ra!" });
    }
}

//xác minh và thiết lập password
async function verifyAccount(req, res) {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await db.User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        if (user.status === "active") {
            return res.status(400).json({ message: "Tài khaonr này đã được kích hoạt." });
        }

        if (!newPassword) {
            return res.status(400).json({ message: "Vui lòng nhập mật khẩu mới" });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Mật khẩu không khớp" });
        }
        user.status = "active";

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.account.password = hashedPassword;

        await user.save();

        res.json({ message: "Kích hoạt tài khoản thành công" });
    } catch (error) {
        console.error("Error verifying account:", error);
        res.status(500).json({ message: `${error._message}` });
    }
}

const authenticationController = {
    sendEmail,
    login,
    addEmployee,
    forgotPassword,
    resetPassword,
    verifyAccount,
    registerCustomer
};

module.exports = authenticationController;

