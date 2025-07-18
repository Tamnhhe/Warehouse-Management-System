const express = require("express");
const router = express();

//Import all routers
const userRouter = require("./user.route");
const authenticationRouter = require("./authentication.route");
const notificationRouter = require("./notification.route");
const productRouter = require("./product.route");
const inventoryTransactionRouter = require("./inventoryTransaction.route");
const categoryRouter = require("./category.route");
const supplierRouter = require("./supplier.route");
const supplierProductRouter = require("./supplierProduct.route");
const stocktakingRouter = require("./stocktaking.route");

// Assign routers to router
router.use("/suppliers", supplierRouter);
router.use("/authentication", authenticationRouter);
// router.use("/notifications", notificationRouter);
router.use("/products", productRouter);
router.use("/inventoryTransactions", inventoryTransactionRouter);
router.use("/categories", categoryRouter); // Nguyễn Đức Linh - HE170256 23/1/2025
router.use("/users", userRouter);
router.use("/supplierProduct", supplierProductRouter);
router.use("/stocktaking", stocktakingRouter);

module.exports = router;
