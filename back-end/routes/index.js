
const userRouter = require("./user.route");
const authenticationRouter = require("./authentication.route");
const notificationRouter = require("./notification.route");
const productRouter = require("./product.route");
const inventoryTransactionRouter = require("./inventoryTransaction.route");
const categoryRouter = require("./category.route");
const supplierRouter = require("./supplier.route");
const supplierProductRouter = require("./supplierProduct.route");
const customerRouter = require("./customer.route");
module.exports = {
    userRouter,
    authenticationRouter,
    notificationRouter,
    productRouter,
    inventoryTransactionRouter,
    categoryRouter,
    supplierRouter,
    supplierProductRouter,
    customerRouter
};
