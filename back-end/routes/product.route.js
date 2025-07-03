//Nguyễn Huy Tâm - HE173108 5/2/2025
const express = require("express");
const productRouter = express.Router();
const { ProductController } = require("../controllers");
const multer = require("multer"); // Import Multer để upload file

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Đường dẫn tới thư mục lưu file upload
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Tạo tên file mới không bị trùng
  },
});
const upload = multer({ storage: storage });

productRouter.get("/getAllProducts", ProductController.getAllProducts);
productRouter.get("/getProductById/:id", ProductController.getProductById);
productRouter.post(
  "/createProduct",
  upload.single("productImage"),
  ProductController.createProduct
);
productRouter.put(
  "/updateProduct/:id",
  upload.single("productImage"),
  ProductController.updateProduct
);
productRouter.put("/inactivateProduct/:id", ProductController.inactiveProduct);

module.exports = productRouter;
