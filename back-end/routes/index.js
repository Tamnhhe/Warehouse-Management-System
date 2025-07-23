const express = require("express");
const router = express();

//Import all routers
const userRouter = require("./user.route");
const authenticationRouter = require("./authentication.route");
const notificationRouter = require("./notification.route"); // Enable lại notification routes
const productRouter = require("./product.route");
const inventoryTransactionRouter = require("./inventoryTransaction.route");
const categoryRouter = require("./category.route");
const supplierRouter = require("./supplier.route");
const supplierProductRouter = require("./supplierProduct.route");
const stocktakingRouter = require("./stocktaking.route");
const branchRouter = require("./branch.route");

// Assign routers to router
router.use("/suppliers", supplierRouter);
router.use("/authentication", authenticationRouter);
router.use("/notifications", notificationRouter); // Enable lại notification routes
router.use("/products", productRouter);
router.use("/inventoryTransactions", inventoryTransactionRouter);
router.use("/categories", categoryRouter); // Nguyễn Đức Linh - HE170256 23/1/2025
router.use("/users", userRouter);
router.use("/supplierProduct", supplierProductRouter);
router.use("/test", require("./testData.route"));

router.use("/stocktaking", stocktakingRouter);
router.use("/branches", branchRouter);

module.exports = router;
