
const express = require("express");
const userRouter = express.Router();
const {UserController} = require("../controllers");
const multer = require("multer"); // Import Multer để upload file

//config multer de xy ly filefile
const storage = multer.diskStorage({
    //anh upload dc luu vao thu muc /uploadsuploads
    destination: function (req, file, cb) {
        cb(null, './uploads'); // Đường dẫn tới thư mục lưu file upload
    },
    //dat ten file
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Tạo tên file mới không bị trùng
    }
});
const upload = multer({ storage: storage });
//Minh Phuong - Hàm View Profile
userRouter.get("/view-profile",UserController.getProfile);
//Minh Phuong - Hàm edit Profile
//Multer lay file tu formdata(avatar la name cua input file), luu file vao uploads, va tra ve dg dan file trong req file
userRouter.put("/edit-profile",upload.single("avatar"), UserController.editProfile);
//Minh Phuong - Ham get All User
userRouter.get("/get-all-user",UserController.getAllUsers);
//MinhPhuong - Ham change Password
userRouter.put("/change-password",UserController.changePassword);
//MinhPhuong - Ham updatedUser
userRouter.put("/update-user/:userId",UserController.updatedUser);
//MinhPhuong - Ham ban User
userRouter.put("/banUser/:id", UserController.banUser);
module.exports = userRouter
