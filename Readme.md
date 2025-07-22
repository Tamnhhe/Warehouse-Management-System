# Warehouse Management System (WMS) – Dự án Quản lý Kho Thông Minh

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/Tamnhhe/Warehouse-Management-System)
[![License](https://img.shields.io/badge/license-ISC-blue)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](package.json)

---

## 📋 Tài liệu phân tích yêu cầu

**🎯 Hoàn thành**: Thu thập yêu cầu từ client và team giáo dục, viết đặc tả tính năng người dùng (user stories)

### 📑 Tài liệu chính

- **[📊 Requirements Summary](docs/requirements-summary.md)** - Tóm tắt phân tích yêu cầu
- **[📋 Requirements Analysis](docs/requirements-analysis.md)** - Phân tích yêu cầu chi tiết
- **[👥 User Stories](docs/user-stories.md)** - Đặc tả tính năng người dùng (27 stories)
- **[🤝 Client &amp; Education Requirements](docs/client-education-requirements.md)** - Yêu cầu từ stakeholders
- **[🗓️ Implementation Roadmap](docs/implementation-roadmap.md)** - Lộ trình thực hiện dự án

### 🚀 Quick Start

```bash
# Đọc tài liệu theo thứ tự
1. docs/requirements-summary.md      # Tổng quan dự án
2. docs/user-stories.md             # Các tính năng cần phát triển
3. docs/implementation-roadmap.md   # Kế hoạch thực hiện
```

---

# Warehouse Management System

## Tính năng chính

- Quản lý sản phẩm, tồn kho, nhập/xuất kho, kiểm kê, nhà cung cấp, chi nhánh, vị trí kho.
- Quản lý giao dịch nhập kho, xuất kho, kiểm kê kho, điều chỉnh tồn kho.
- Quản lý và tra cứu lịch sử giao dịch, báo cáo tồn kho.
- Hệ thống phân quyền người dùng (quản trị, nhân viên).
- Giao diện hiện đại, responsive, sử dụng React (frontend) và Node.js/Express/MongoDB (backend).

## Hướng dẫn chạy dự án

### 1. Cài đặt

- Yêu cầu: Node.js >= 16, MongoDB >= 4.4
- Clone source code về máy:
  ```bash
  git clone <repo-url>
  cd Warehouse-Management-System
  ```
- Cài đặt dependencies cho backend và frontend:
  ```bash
  cd back-end
  npm install
  cd ../front-end
  npm install
  ```

### 2. Chạy backend

```bash
cd back-end
npm start
```

Backend sẽ chạy ở `http://localhost:9999`

### 3. Chạy frontend

```bash
cd front-end
npm run dev
```

Frontend sẽ chạy ở `http://localhost:5173` (hoặc port Vite mặc định)

## Import nhanh dữ liệu test

Bạn có thể import toàn bộ dữ liệu mẫu (test data) vào database chỉ với 1 API:

- Đảm bảo backend đã chạy và MongoDB đã kết nối.
- Dữ liệu mẫu nằm trong thư mục `back-end/docs/data/` (các file như `WHS.products.json`, `WHS.categories.json`, ...)
- Gửi request POST tới:

```
POST http://localhost:9999/test/import-data
```

- Không cần body, API sẽ tự động đọc tất cả file trong thư mục data và import vào các bảng tương ứng (trừ bảng User).
- Dữ liệu sẽ được chuyển đổi đúng kiểu (ObjectId, Date) tự động.

## Reset/xóa sạch dữ liệu test

Để xóa toàn bộ dữ liệu test (trừ bảng User), gửi request:

```
POST http://localhost:9999/test/clear-data
```

## Ghi chú

- Nếu muốn import lại dữ liệu test, nên chạy clear-data trước để tránh trùng lặp.
- Các API test này chỉ nên dùng cho môi trường phát triển/dev.

---

## **I. Giới thiệu chung**

- **Tên hệ thống:** Warehouse Management System (WMS)
- **Nhu cầu:** Hệ thống quản lí kho sinh ra với mục đích hỗ trợ Quản lý cho phép quản lí sản phẩm trong kho, quản lí việc xuất, nhập hàng vào kho và cho phép khách hàng có thể tạo đơn nhập hàng nhằm tối ưu trong công việc
- **Lý do chọn đề tài:**

  - Trong bối cảnh số hóa ngày càng mạnh mẽ, việc quản lý kho bằng phương pháp thủ công hoặc các công cụ đơn giản như Excel đang bộc lộ nhiều hạn chế về hiệu quả và độ chính xác. Điều này đặt ra nhu cầu cấp thiết về một hệ thống quản lý kho thông minh, linh hoạt và dễ sử dụng, đặc biệt đối với các doanh nghiệp vừa và nhỏ.Doanh nghiệp lớn đang gặp nhiều vấn đề trong quá trình vận hành kho như:
  - Khó kiểm soát tồn kho thực tế tại từng vị trí lưu trữ.
  - Quản lý hóa giao dịch gặp nhiều khó khăn, thiếu sự minh bạch.
  -

- **Mục tiêu:**

  - Phát triển hệ thống web quản lý kho có chức năng phân quyền, quản lý sản phẩm, nhân viên, hóa đơn, nhà cung cấp,khách hàng đặt đơn, xem đơn của mình,...

- **Phạm vi chức năng:**

  - Tối thiểu: Quản lý người dùng, sản phẩm, giao dịch nhập xuất, kiểm kê hàng hóa,.
  - Mở rộng: Phân quyền, thống kê, thông báo, quản lý danh mục, tích hợp nhà cung cấp,...

---

### 1. **Luồng nhập kho(Inbound Operator)**

- Nhà cung cấp → Giao hàng tại kho → Nhân viên nhập hàng:
  1. Tạo phiếu nhập (`Receiving_Order`)
  2. Gán nhiệm vụ `Putaway_Task`
  3. Giao hàng vào pallet (có thể in barcode)
  4. Cập nhật tồn kho (`Inventory`)

### 2. **Luồng xuất kho(Outbound Operator)**

- Hệ thống nhận yêu cầu từ bộ phận bán lẻ → Nhân viên xuất hàng:
  1. Tạo đơn xuất (`Picking_Task`) dựa trên yêu cầu
  2. Gợi ý vị trí lấy hàng theo FIFO/LIFO
  3. Soạn hàng, đóng gói, xác nhận số lượng
  4. In hóa đơn giao hàng (`Invoice`)
  5. Cập nhật `Stock_Transaction` và trừ tồn kho

### 3. **Luồng kiểm kho(Inventory Auditor)**

- Lập lịch kiểm định kỳ → Nhân viên kiểm kho:
  1. Chọn khu vực/sản phẩm cần kiểm
  2. Tạo `Stocktaking_Task`
  3. Kiểm thực tế, nhập số lượng
  4. So sánh với hệ thống → tạo `Adjustment` nếu lệch

---

## 🧾 **III. Quản lý hóa đơn xuất cho đơn vị bán lẻ**

- Mỗi đơn xuất hàng sẽ:
  - Gắn với một khách hàng hoặc đơn vị bán lẻ (`Customer`)
  - Gồm danh sách sản phẩm, số lượng, giá xuất
  - Có thể sinh **PDF hóa đơn** để in/gửi mail
  - Có trạng thái: "Đã tạo", "Đã xuất", "Đã giao", "Đã thanh toán"

---
