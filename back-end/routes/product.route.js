//Nguyễn Huy Tâm - HE173108 5/2/2025
const express = require("express");
const productRouter = express.Router();
const { ProductController } = require("../controllers");
const upload = require("../utils/Upload");

productRouter.get("/getAllProducts", ProductController.getAllProducts);
productRouter.get("/getProductById/:id", ProductController.getProductById);
productRouter.post("/createProduct", upload.single("productImage"), ProductController.createProduct);
productRouter.put("/updateProduct/:id", upload.single("productImage"), ProductController.updateProduct);
productRouter.put("/inactivateProduct/:id", ProductController.inactiveProduct);
productRouter.get("/checkProductName", ProductController.checkProductName);
module.exports = productRouter;
