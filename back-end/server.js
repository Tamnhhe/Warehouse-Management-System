require("dotenv").config();

const morgan = require("morgan");
const express = require("express");
const bodyParser = require("body-parser");
const httpsErrors = require("http-errors");
const cors = require("cors");

const app = express();
const db = require("./models/index");
const {
  userRouter,
  authenticationRouter,
  notificationRouter,
  productRouter,
  inventoryTransactionRouter,
  categoryRouter,
  supplierRouter,
  supplierProductRouter,
} = require("./routes");
//Cung cấp URl công khai để lấy ảnh thông qua thư mục /uploads
//cho phep truy cap anh bang url tren server 
//hien thi bang url /../.. nho express staticstatic
app.use("/uploads", express.static("uploads"));
// Sử dụng cors middleware để cho phép request từ localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(bodyParser.json());

app.get("/", async (req, res, next) => {
  res.status(200).json({ message: "Server is running" });
});

// Định tuyến theo các chức năng thực tế

// ko tạo thêm app.use, làm đến đâu mở cmt ở dưới đến đấy, mở hết 1 lượt sẽ bị crash project
app.use("/suppliers", supplierRouter);
app.use("/authentication", authenticationRouter);
// app.use("/notifications", notificationRouter);
app.use("/products", productRouter);
app.use("/inventoryTransactions", inventoryTransactionRouter);
app.use("/categories", categoryRouter); // Nguyễn Đức Linh - HE170256 23/1/2025
app.use("/users", userRouter);
app.use("/supplierProducts", supplierProductRouter);

app.use(async (req, res, next) => {
  next(httpsErrors(404, "Bad Request"));
});
app.use(async (err, req, res, next) => {
  res.status = err.status || 500;
  res.send({ error: { status: err.status, message: err.message } });
});

const host = process.env.HOSTNAME;
const port = process.env.PORT;

app.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
  // Thực thi kết nối CSDL
  db.connectDB();
});
