require("dotenv").config();

const morgan = require("morgan");
const express = require("express");
const bodyParser = require("body-parser");
const httpsErrors = require("http-errors");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const socketIo = require("socket.io");
// Import Swagger setup
const setupSwagger = require("./docs/swagger/setup");

// Khởi tạo ứng dụng Express
const app = express();
const server = http.createServer(app);

// Cấu hình Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Lưu instance của io vào app để có thể sử dụng trong controllers
app.set("io", io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user to a room based on their role and branch
  socket.on("join", (data) => {
    const { userId, role, branchId } = data;
    socket.join(`user_${userId}`);
    socket.join(`role_${role}`);
    if (branchId) {
      socket.join(`branch_${branchId}`);
    }
    console.log(
      `User ${userId} joined rooms: user_${userId}, role_${role}, branch_${branchId}`
    );
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Cấu hình cookie parser để xử lý cookies
app.use(cookieParser());
// Cấu hình body parser để xử lý dữ liệu JSON
app.use(express.json());
app.use(bodyParser.json());
// Cấu hình morgan để ghi log các request
app.use(morgan("dev"));

const db = require("./models/index");
const router = require("./routes");
const inventoryRouter = require("./routes/inventory.router");
const categoryRouter = require("./routes/category.route");
//Cung cấp URl công khai để lấy ảnh thông qua thư mục /uploads
//cho phep truy cap anh bang url tren server
//hien thi bang url /../.. nho express staticstatic
app.use("/uploads", express.static("uploads"));
// Sử dụng cors middleware để cho phép request từ localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

// Setup Swagger documentation
setupSwagger(app);

app.use("/inventory", inventoryRouter);
app.use("/category", categoryRouter);
app.get("/", async (req, res, next) => {
  res.status(200).json({ message: "Server is running" });
});

// Đăng ký các router
app.use("/", router);

app.use(async (req, res, next) => {
  next(httpsErrors(404, "Bad Request"));
});
app.use(async (err, req, res, next) => {
  res.status = err.status || 500;
  res.send({ error: { status: err.status, message: err.message } });
});

const host = process.env.HOSTNAME;
const port = process.env.PORT;

server.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
  console.log(`API documentation available at http://${host}:${port}/api-docs`);
  // Thực thi kết nối CSDL
  db.connectDB();
});
