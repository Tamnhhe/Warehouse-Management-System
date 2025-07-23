# Hệ thống thông báo Socket.IO - Warehouse Management System

## Tổng quan

Hệ thống thông báo real-time đã được tích hợp vào ứng dụng quản lý kho sử dụng Socket.IO để gửi thông báo tự động giữa manager và nhân viên.

## Tính năng đã triển khai

### Backend

1. **Socket.IO Server Integration** (server.js)

   - Cấu hình Socket.IO server
   - Quản lý rooms cho users theo role và branch
   - CORS configuration cho frontend

2. **Notification Service** (utils/NotificationService.js)

   - Service để gửi thông báo qua Socket.IO
   - Hỗ trợ gửi cho manager, employee, và branch

3. **Notification Controller** (controllers/notification.controller.js)

   - API endpoints để quản lý thông báo
   - Helper functions để tạo thông báo tự động
   - CRUD operations cho notifications

4. **Routes Integration** (routes/notification.route.js)

   - REST API endpoints cho notifications
   - Authentication middleware

5. **Controller Updates**
   - **InventoryTransaction Controller**: Thông báo khi tạo/duyệt phiếu nhập/xuất
   - **Stocktaking Controller**: Thông báo khi tạo phiếu kiểm kê và điều chỉnh

### Frontend

1. **Socket Service** (services/socketService.js)

   - Quản lý kết nối Socket.IO
   - Auto-reconnection và error handling

2. **Notification Service** (services/notificationService.js)

   - API calls cho notification operations
   - RESTful service cho CRUD operations

3. **Toast Notification Component** (components/ToastNotification/)

   - Popup thông báo ở góc màn hình
   - Auto-dismiss và manual close
   - Styled theo từng loại thông báo

4. **Notification Bell Component** (components/NotificationBell/)

   - Icon chuông trong header navbar
   - Dropdown list thông báo
   - Badge hiển thị số lượng chưa đọc
   - Mark as read functionality

5. **Notification Provider** (contexts/NotificationProvider.jsx)

   - Context để quản lý Socket.IO connection
   - Global toast management
   - Real-time notification handling

6. **App Integration**
   - Tích hợp NotificationProvider vào App.jsx
   - Cập nhật Header component với NotificationBell

## Luồng hoạt động

### Khi nhân viên tạo phiếu (nhập/xuất/kiểm kê):

1. Backend tạo notification record trong database
2. Gửi thông báo qua Socket.IO đến room `role_manager`
3. Manager nhận toast notification và thấy badge tăng ở icon chuông
4. Manager có thể xem chi tiết trong dropdown notification

### Khi manager duyệt phiếu:

1. Backend tạo notification record cho nhân viên cụ thể
2. Gửi thông báo qua Socket.IO đến room `user_{employeeId}`
3. Nhân viên nhận toast notification và thấy badge tăng

### Khi manager tạo phiếu điều chỉnh:

1. Backend tạo notification cho nhân viên đã tạo phiếu kiểm kê
2. Thông báo được gửi real-time qua Socket.IO

## API Endpoints

```
GET    /notifications/user/:userId              - Lấy danh sách thông báo
GET    /notifications/user/:userId/unread-count - Lấy số lượng chưa đọc
POST   /notifications                           - Tạo thông báo mới
PUT    /notifications/:id/read                  - Đánh dấu đã đọc
PUT    /notifications/user/:userId/read-all     - Đánh dấu tất cả đã đọc
```

## Socket.IO Events

```javascript
// Client events
'join' - Join user rooms based on role and branch
'disconnect' - Handle disconnection

// Server events
'newNotification' - Receive new notification
'connect' - Connection established
'disconnect' - Connection lost
```

## Cấu hình

### Backend Environment

- Socket.IO port: 5000 (cùng với HTTP server)
- CORS origin: http://localhost:3000

### Frontend Configuration

- Socket.IO client connects to: http://localhost:5000
- Notification service API base: http://localhost:5000

## Cách sử dụng

1. **Khởi động Backend**:

   ```bash
   cd back-end
   npm start
   ```

2. **Khởi động Frontend**:

   ```bash
   cd front-end
   npm run dev
   ```

3. **Test thông báo**:
   - Đăng nhập với tài khoản nhân viên
   - Tạo phiếu nhập/xuất/kiểm kê
   - Đăng nhập với tài khoản manager để xem thông báo
   - Duyệt phiếu và xem nhân viên nhận thông báo

## Tùy chỉnh

### Thêm loại thông báo mới:

1. Cập nhật `notification.type` enum trong model
2. Thêm icon và màu sắc trong ToastNotification và NotificationBell
3. Cập nhật NotificationService với logic mới

### Thay đổi thời gian hiển thị toast:

```javascript
// Trong NotificationProvider.jsx
<ToastNotification duration={5000} /> // 5 giây
```

### Tùy chỉnh styling:

- Chỉnh sửa CSS files trong components
- Cập nhật màu sắc và layout theo design system
