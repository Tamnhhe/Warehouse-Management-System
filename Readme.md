 **Warehouse Management System (WMS)** – Dự án Quản lý Kho Thông Minh

---

## **

```

```

I. Giới thiệu chung**

* **Tên hệ thống:** Warehouse Management System (WMS)
* **Nhu cầu:** Hệ thống quản lí kho sinh ra với mục đích hỗ trợ Quản lý cho phép quản lí sản phẩm trong kho, quản lí việc xuất, nhập hàng vào kho và cho phép khách hàng có thể tạo đơn nhập hàng nhằm tối ưu trong công việc
* **Lý do chọn đề tài:**

  * Trong bối cảnh số hóa ngày càng mạnh mẽ, việc quản lý kho bằng phương pháp thủ công hoặc các công cụ đơn giản như Excel đang bộc lộ nhiều hạn chế về hiệu quả và độ chính xác. Điều này đặt ra nhu cầu cấp thiết về một hệ thống quản lý kho thông minh, linh hoạt và dễ sử dụng, đặc biệt đối với các doanh nghiệp vừa và nhỏ.Doanh nghiệp lớn đang gặp nhiều vấn đề trong quá trình vận hành kho như:
  * Khó kiểm soát tồn kho thực tế tại từng vị trí lưu trữ.
  * Quản lý hóa giao dịch gặp nhiều khó khăn, thiếu sự minh bạch.
  * 
* **Mục tiêu:**

  * Phát triển hệ thống web quản lý kho có chức năng phân quyền, quản lý sản phẩm, nhân viên, hóa đơn, nhà cung cấp,khách hàng đặt đơn, xem đơn của mình,...
* **Phạm vi chức năng:**

  * Tối thiểu: Quản lý người dùng, sản phẩm, giao dịch nhập xuất, kiểm kê hàng hóa,.
  * Mở rộng: Phân quyền, thống kê, thông báo, quản lý danh mục, tích hợp nhà cung cấp,...

---

### 1. **Luồng nhập kho(Inbound Operator)**

* Nhà cung cấp → Giao hàng tại kho → Nhân viên nhập hàng:
  1. Tạo phiếu nhập (`Receiving_Order`)
  2. Gán nhiệm vụ `Putaway_Task`
  3. Giao hàng vào pallet (có thể in barcode)
  4. Cập nhật tồn kho (`Inventory`)

### 2. **Luồng xuất kho(Outbound Operator)**

* Hệ thống nhận yêu cầu từ bộ phận bán lẻ → Nhân viên xuất hàng:
  1. Tạo đơn xuất (`Picking_Task`) dựa trên yêu cầu
  2. Gợi ý vị trí lấy hàng theo FIFO/LIFO
  3. Soạn hàng, đóng gói, xác nhận số lượng
  4. In hóa đơn giao hàng (`Invoice`)
  5. Cập nhật `Stock_Transaction` và trừ tồn kho

### 3. **Luồng kiểm kho(Inventory Auditor)**

* Lập lịch kiểm định kỳ → Nhân viên kiểm kho:
  1. Chọn khu vực/sản phẩm cần kiểm
  2. Tạo `Stocktaking_Task`
  3. Kiểm thực tế, nhập số lượng
  4. So sánh với hệ thống → tạo `Adjustment` nếu lệch

---

## 🧾 **III. Quản lý hóa đơn xuất cho đơn vị bán lẻ**

* Mỗi đơn xuất hàng sẽ:
  * Gắn với một khách hàng hoặc đơn vị bán lẻ (`Customer`)
  * Gồm danh sách sản phẩm, số lượng, giá xuất
  * Có thể sinh **PDF hóa đơn** để in/gửi mail
  * Có trạng thái: "Đã tạo", "Đã xuất", "Đã giao", "Đã thanh toán"

---

## 🕒 **IV. Quản lý thời gian làm việc của nhân viên**

| **Tính năng**                     | **Mô tả**                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| **Chấm công**                     | Check-in/check-out bằng mã nhân viên hoặc quét QR                   |
| **Bảng phân ca**                  | Giao việc theo ca/ngày cho từng nhân viên                            |
| **Báo cáo thời gian làm việc** | Tổng hợp số giờ làm, số phiếu đã xử lý, KPI                    |
| **Giao task tự động**            | Hệ thống phân bổ Putaway/Picking/Stocktaking Task theo năng lực/KPI |

---

## 📌 **Gợi ý bảng dữ liệu bổ sung**

| **Bảng**      | **Vai trò**                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `Employee_WorkLog` | Lưu thời gian làm việc, check-in/check-out                                                       |
| `Order`            | Lưu trữ đơn hàng để cho khách hàng có thể xem và theo dõi tình trạng đơn của mình |
| `Customer`         | Thông tin đơn vị bán lẻ, để xuất hóa đơn và theo dõi lịch sử đơn hàng             |
| `Invoice`          | Hóa đơn bán hàng chi tiết (sản phẩm, đơn vị, giá, ngày xuất)                           |

# Công việc cần làm

## 1. Huy Tâm

- Thêm màn hình quản lý khách hàng
- Thêm màn hình quản lý nhà cung cấp
- Sửa phần back-end:
  - Nhập hàng
  - Xuất hàng
  - Tính giá hàng

---

## 2. Trường

- Tạo màn hình Home cho Customer( Bao gồm cả back-end và front-end)

---

## 3. Nghĩa

- Thêm Màn quản lý khách hàng(CRUD Customer)

---

## 4. Việt

- Nghiên cứu tổ chức file của dự  án sau https://drive.google.com/drive/folders/1YzLBlUK-bdz2FA9Pg4_7eSkABDH_GAEG
- Sửa lại drive nhóm và tạo ra các diagram có trong RDS ra 1 thư mục riêng rồi tạo bằng drawIO
- Sửa giao diện màn Login,register,Confirm account, reset password
- Template UI preview [Inbox | Rasket - Responsive Admin Dashboard Template](https://techzaa.in/rasket/admin/apps-email.html)
- Tên dự án là Movico Group
