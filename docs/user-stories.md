# User Stories - Warehouse Management System

## Mục lục
1. [User Stories cho Admin](#1-user-stories-cho-admin)
2. [User Stories cho Manager](#2-user-stories-cho-manager)
3. [User Stories cho Staff](#3-user-stories-cho-staff)
4. [User Stories cho Customer](#4-user-stories-cho-customer)
5. [User Stories cho Supplier](#5-user-stories-cho-supplier)

---

## 1. User Stories cho Admin

### 1.1 Quản lý người dùng

**US-A001: Tạo tài khoản người dùng**
- **Là một**: Admin
- **Tôi muốn**: Tạo tài khoản cho nhân viên mới
- **Để**: Họ có thể truy cập vào hệ thống và thực hiện công việc

**Acceptance Criteria:**
- Admin có thể tạo tài khoản với đầy đủ thông tin: tên, email, số điện thoại, vai trò
- Hệ thống tự động gửi email xác thực cho người dùng mới
- Mật khẩu tạm thời được gửi qua email an toàn
- Validate email không trùng lặp trong hệ thống

**Priority:** High
**Estimate:** 5 story points

---

**US-A002: Phân quyền người dùng**
- **Là một**: Admin
- **Tôi muốn**: Phân quyền cho người dùng theo vai trò
- **Để**: Kiểm soát quyền truy cập vào các chức năng của hệ thống

**Acceptance Criteria:**
- Admin có thể gán vai trò: Manager, Staff, Customer cho người dùng
- Mỗi vai trò có quyền truy cập khác nhau vào các module
- Có thể thay đổi quyền của người dùng bất cứ lúc nào
- Log lại lịch sử thay đổi quyền

**Priority:** High
**Estimate:** 8 story points

---

**US-A003: Quản lý danh mục sản phẩm**
- **Là một**: Admin
- **Tôi muốn**: Tạo và quản lý danh mục sản phẩm
- **Để**: Tổ chức sản phẩm một cách có hệ thống

**Acceptance Criteria:**
- Admin có thể tạo, sửa, xóa danh mục sản phẩm
- Danh mục có thể có danh mục con (nested categories)
- Validate tên danh mục không trùng lặp
- Hiển thị số lượng sản phẩm trong mỗi danh mục

**Priority:** Medium
**Estimate:** 5 story points

---

### 1.2 Quản lý hệ thống

**US-A004: Xem báo cáo tổng quan**
- **Là một**: Admin
- **Tôi muốn**: Xem báo cáo tổng quan về hoạt động hệ thống
- **Để**: Theo dõi hiệu suất và đưa ra quyết định quản lý

**Acceptance Criteria:**
- Dashboard hiển thị: tổng sản phẩm, tổng giao dịch, doanh thu, người dùng active
- Biểu đồ thống kê theo ngày, tháng, năm
- Xuất báo cáo dưới dạng PDF, Excel
- Có thể filter theo khoảng thời gian

**Priority:** High
**Estimate:** 13 story points

---

**US-A005: Quản lý backup và bảo mật**
- **Là một**: Admin
- **Tôi muốn**: Thiết lập backup tự động và theo dõi bảo mật
- **Để**: Đảm bảo dữ liệu an toàn và khôi phục khi cần

**Acceptance Criteria:**
- Thiết lập lịch backup tự động hàng ngày
- Xem log hoạt động của người dùng
- Khóa tài khoản có hoạt động bất thường
- Restore dữ liệu từ backup point

**Priority:** Medium
**Estimate:** 8 story points

---

## 2. User Stories cho Manager

### 2.1 Quản lý sản phẩm

**US-M001: Quản lý thông tin sản phẩm**
- **Là một**: Manager
- **Tôi muốn**: Quản lý thông tin chi tiết của sản phẩm
- **Để**: Đảm bảo thông tin sản phẩm luôn chính xác và cập nhật

**Acceptance Criteria:**
- Manager có thể tạo, sửa, xóa thông tin sản phẩm
- Thông tin bao gồm: tên, mô tả, giá, danh mục, hình ảnh
- Upload và quản lý hình ảnh sản phẩm
- Validate dữ liệu đầu vào và hiển thị lỗi rõ ràng

**Priority:** High
**Estimate:** 8 story points

---

**US-M002: Quản lý tồn kho**
- **Là một**: Manager
- **Tôi muốn**: Theo dõi và quản lý tồn kho sản phẩm
- **Để**: Đảm bảo luôn có đủ hàng để bán và tránh tồn kho thừa

**Acceptance Criteria:**
- Xem số lượng tồn kho theo thời gian thực
- Thiết lập mức tồn kho tối thiểu (min stock level)
- Nhận thông báo khi sản phẩm sắp hết hàng
- Tạo báo cáo tồn kho theo danh mục, thời gian

**Priority:** High
**Estimate:** 13 story points

---

**US-M003: Quản lý giá sản phẩm**
- **Là một**: Manager
- **Tôi muốn**: Quản lý giá nhập, giá bán của sản phẩm
- **Để**: Tối ưu hóa lợi nhuận và cạnh tranh trên thị trường

**Acceptance Criteria:**
- Cập nhật giá nhập, giá bán cho từng sản phẩm
- Lịch sử thay đổi giá với timestamp
- Tính toán lợi nhuận theo sản phẩm
- Thiết lập giá theo số lượng (bulk pricing)

**Priority:** Medium
**Estimate:** 8 story points

---

### 2.2 Quản lý nhân viên

**US-M004: Phân công nhiệm vụ**
- **Là một**: Manager
- **Tôi muốn**: Phân công nhiệm vụ cho nhân viên
- **Để**: Tối ưu hóa hiệu suất làm việc và theo dõi tiến độ

**Acceptance Criteria:**
- Tạo và gán task cho nhân viên: nhập kho, xuất kho, kiểm kê
- Theo dõi trạng thái task: pending, in-progress, completed
- Nhân viên có thể cập nhật progress của task
- Báo cáo hiệu suất làm việc của nhân viên

**Priority:** High
**Estimate:** 13 story points

---

**US-M005: Quản lý ca làm việc**
- **Là một**: Manager
- **Tôi muốn**: Lập lịch ca làm việc cho nhân viên
- **Để**: Đảm bảo kho luôn có người trực và tối ưu hóa nhân lực

**Acceptance Criteria:**
- Tạo lịch ca làm việc theo tuần/tháng
- Nhân viên có thể xem lịch làm việc của mình
- Thay đổi ca làm việc và thông báo cho nhân viên
- Tính toán giờ làm việc và overtime

**Priority:** Medium
**Estimate:** 8 story points

---

### 2.3 Quản lý giao dịch

**US-M006: Duyệt phiếu nhập kho**
- **Là một**: Manager
- **Tôi muốn**: Duyệt các phiếu nhập kho từ nhân viên
- **Để**: Kiểm soát chất lượng và số lượng hàng nhập kho

**Acceptance Criteria:**
- Xem danh sách phiếu nhập kho chờ duyệt
- Chi tiết phiếu nhập: sản phẩm, số lượng, giá, nhà cung cấp
- Approve hoặc reject phiếu nhập với lý do
- Thông báo kết quả duyệt cho nhân viên tạo phiếu

**Priority:** High
**Estimate:** 8 story points

---

**US-M007: Duyệt phiếu xuất kho**
- **Là một**: Manager
- **Tôi muốn**: Duyệt các phiếu xuất kho trước khi giao hàng
- **Để**: Đảm bảo chính xác thông tin và tránh thiếu hụt

**Acceptance Criteria:**
- Xem danh sách phiếu xuất kho chờ duyệt
- Kiểm tra tồn kho trước khi duyệt
- Approve hoặc reject với lý do cụ thể
- Tự động cập nhật tồn kho sau khi duyệt

**Priority:** High
**Estimate:** 8 story points

---

## 3. User Stories cho Staff

### 3.1 Nhập kho

**US-S001: Tạo phiếu nhập kho**
- **Là một**: Staff
- **Tôi muốn**: Tạo phiếu nhập kho khi nhận hàng từ nhà cung cấp
- **Để**: Ghi nhận hàng hóa vào hệ thống và cập nhật tồn kho

**Acceptance Criteria:**
- Tạo phiếu nhập với thông tin: ngày nhập, nhà cung cấp, danh sách sản phẩm
- Scan barcode để thêm sản phẩm vào phiếu
- Nhập số lượng thực tế nhận được
- Gửi phiếu nhập cho Manager duyệt

**Priority:** High
**Estimate:** 8 story points

---

**US-S002: Cập nhật vị trí lưu trữ**
- **Là một**: Staff
- **Tôi muốn**: Cập nhật vị trí lưu trữ sản phẩm trong kho
- **Để**: Dễ dàng tìm kiếm và quản lý sản phẩm

**Acceptance Criteria:**
- Gán vị trí lưu trữ cho sản phẩm (kệ, tầng, vị trí)
- Scan barcode để xác định sản phẩm
- Cập nhật vị trí trong hệ thống
- Xem sơ đồ kho và vị trí sản phẩm

**Priority:** Medium
**Estimate:** 5 story points

---

### 3.2 Xuất kho

**US-S003: Tạo phiếu xuất kho**
- **Là một**: Staff
- **Tôi muốn**: Tạo phiếu xuất kho để giao hàng cho khách hàng
- **Để**: Ghi nhận hàng xuất và trừ tồn kho

**Acceptance Criteria:**
- Tạo phiếu xuất với thông tin khách hàng và sản phẩm
- Kiểm tra tồn kho trước khi tạo phiếu
- Gợi ý vị trí lấy hàng theo FIFO
- Tạo picking list để lấy hàng

**Priority:** High
**Estimate:** 8 story points

---

**US-S004: Scan và đóng gói sản phẩm**
- **Là một**: Staff
- **Tôi muốn**: Scan và đóng gói sản phẩm theo phiếu xuất
- **Để**: Đảm bảo đúng sản phẩm và số lượng

**Acceptance Criteria:**
- Scan barcode để xác nhận sản phẩm
- Nhập số lượng thực tế đóng gói
- Đánh dấu hoàn thành từng item
- In nhãn giao hàng

**Priority:** High
**Estimate:** 5 story points

---

### 3.3 Kiểm kê

**US-S005: Thực hiện kiểm kê**
- **Là một**: Staff
- **Tôi muốn**: Thực hiện kiểm kê theo lịch định kỳ
- **Để**: Đảm bảo tồn kho trong hệ thống khớp với thực tế

**Acceptance Criteria:**
- Nhận task kiểm kê từ Manager
- Scan sản phẩm và đếm số lượng thực tế
- Nhập kết quả kiểm kê vào hệ thống
- Báo cáo chênh lệch (nếu có)

**Priority:** Medium
**Estimate:** 8 story points

---

**US-S006: Cập nhật chênh lệch tồn kho**
- **Là một**: Staff
- **Tôi muốn**: Cập nhật chênh lệch tồn kho sau kiểm kê
- **Để**: Đồng bộ dữ liệu hệ thống với thực tế

**Acceptance Criteria:**
- Xem danh sách chênh lệch từ kiểm kê
- Nhập lý do chênh lệch (hư hỏng, mất mát, sai sót)
- Cập nhật tồn kho theo số liệu thực tế
- Tạo báo cáo điều chỉnh

**Priority:** Medium
**Estimate:** 5 story points

---

## 4. User Stories cho Customer

### 4.1 Đặt hàng

**US-C001: Xem danh sách sản phẩm**
- **Là một**: Customer
- **Tôi muốn**: Xem danh sách sản phẩm có sẵn trong kho
- **Để**: Chọn sản phẩm cần đặt hàng

**Acceptance Criteria:**
- Hiển thị danh sách sản phẩm với hình ảnh, giá, tồn kho
- Tìm kiếm sản phẩm theo tên, danh mục
- Lọc sản phẩm theo giá, danh mục
- Xem chi tiết sản phẩm

**Priority:** High
**Estimate:** 8 story points

---

**US-C002: Tạo đơn hàng**
- **Là một**: Customer
- **Tôi muốn**: Tạo đơn hàng với các sản phẩm đã chọn
- **Để**: Đặt mua sản phẩm từ kho

**Acceptance Criteria:**
- Thêm sản phẩm vào giỏ hàng
- Nhập số lượng và kiểm tra tồn kho
- Nhập thông tin giao hàng
- Xác nhận đơn hàng và nhận mã đơn hàng

**Priority:** High
**Estimate:** 13 story points

---

**US-C003: Theo dõi đơn hàng**
- **Là một**: Customer
- **Tôi muốn**: Theo dõi trạng thái đơn hàng đã đặt
- **Để**: Biết được tiến độ xử lý và giao hàng

**Acceptance Criteria:**
- Xem danh sách đơn hàng đã đặt
- Trạng thái đơn hàng: Pending, Processing, Shipped, Delivered
- Nhận thông báo khi trạng thái thay đổi
- Xem chi tiết từng đơn hàng

**Priority:** High
**Estimate:** 8 story points

---

### 4.2 Quản lý tài khoản

**US-C004: Đăng ký tài khoản**
- **Là một**: Customer
- **Tôi muốn**: Đăng ký tài khoản khách hàng
- **Để**: Có thể đặt hàng và theo dõi lịch sử mua hàng

**Acceptance Criteria:**
- Đăng ký với email, password, thông tin cá nhân
- Xác thực email trước khi kích hoạt tài khoản
- Validate thông tin đầu vào
- Đăng nhập sau khi đăng ký thành công

**Priority:** High
**Estimate:** 8 story points

---

**US-C005: Quản lý thông tin cá nhân**
- **Là một**: Customer
- **Tôi muốn**: Cập nhật thông tin cá nhân và địa chỉ giao hàng
- **Để**: Đảm bảo thông tin chính xác cho việc giao hàng

**Acceptance Criteria:**
- Cập nhật thông tin: tên, số điện thoại, địa chỉ
- Quản lý nhiều địa chỉ giao hàng
- Đổi mật khẩu với xác thực mật khẩu cũ
- Xem lịch sử đơn hàng

**Priority:** Medium
**Estimate:** 5 story points

---

### 4.3 Hóa đơn và thanh toán

**US-C006: Xem hóa đơn**
- **Là một**: Customer
- **Tôi muốn**: Xem và tải hóa đơn của đơn hàng
- **Để**: Có chứng từ cho việc mua hàng

**Acceptance Criteria:**
- Xem hóa đơn online với đầy đủ thông tin
- Tải hóa đơn dưới dạng PDF
- Gửi hóa đơn qua email
- Lịch sử hóa đơn của tất cả đơn hàng

**Priority:** Medium
**Estimate:** 5 story points

---

## 5. User Stories cho Supplier

### 5.1 Quản lý sản phẩm cung cấp

**US-U001: Đăng ký tài khoản nhà cung cấp**
- **Là một**: Supplier
- **Tôi muốn**: Đăng ký tài khoản nhà cung cấp
- **Để**: Có thể cung cấp sản phẩm cho kho

**Acceptance Criteria:**
- Đăng ký với thông tin doanh nghiệp
- Admin duyệt tài khoản nhà cung cấp
- Xác thực email và thông tin doanh nghiệp
- Đăng nhập sau khi được duyệt

**Priority:** Medium
**Estimate:** 8 story points

---

**US-U002: Cập nhật sản phẩm cung cấp**
- **Là một**: Supplier
- **Tôi muốn**: Cập nhật danh sách sản phẩm và giá
- **Để**: Kho có thông tin mới nhất về sản phẩm

**Acceptance Criteria:**
- Thêm sản phẩm mới vào danh sách cung cấp
- Cập nhật giá và tình trạng sản phẩm
- Upload hình ảnh và mô tả sản phẩm
- Thông báo cho kho khi có sản phẩm mới

**Priority:** Medium
**Estimate:** 8 story points

---

**US-U003: Xem lịch sử giao dịch**
- **Là một**: Supplier
- **Tôi muốn**: Xem lịch sử các đơn hàng đã cung cấp
- **Để**: Theo dõi doanh số và lên kế hoạch sản xuất

**Acceptance Criteria:**
- Xem danh sách đơn hàng theo thời gian
- Chi tiết từng đơn hàng: sản phẩm, số lượng, giá trị
- Thống kê doanh thu theo tháng/quý
- Xuất báo cáo doanh số

**Priority:** Low
**Estimate:** 5 story points

---

## Tóm tắt

### Tổng quan User Stories
- **Total Stories**: 27 stories
- **Admin**: 5 stories
- **Manager**: 7 stories  
- **Staff**: 6 stories
- **Customer**: 6 stories
- **Supplier**: 3 stories

### Phân loại theo Priority
- **High Priority**: 15 stories
- **Medium Priority**: 11 stories
- **Low Priority**: 1 story

### Tổng Story Points
- **Total Estimate**: 194 story points
- **Average per story**: 7.2 story points
- **Sprint capacity**: 40 story points/sprint (2 weeks)
- **Estimated duration**: 5 sprints (10 weeks)

### Thứ tự thực hiện đề xuất
1. **Sprint 1**: Authentication, User Management, Basic Product Management
2. **Sprint 2**: Inventory Management, Stock Operations
3. **Sprint 3**: Transaction Management (Inbound/Outbound)
4. **Sprint 4**: Customer Portal, Order Management
5. **Sprint 5**: Reporting, Analytics, Supplier Portal

---

*Tài liệu này sẽ được cập nhật và refine trong quá trình phát triển dự án.*