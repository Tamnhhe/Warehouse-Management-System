# Phân tích yêu cầu hệ thống - Warehouse Management System (WMS)

## Thông tin dự án

**Tên dự án**: Movico Group - Warehouse Management System (WMS)  
**Phiên bản**: 1.0.0  
**Ngày tạo**: 2024  
**Nhóm phát triển**: Group 5 - WDP301 - SE1827  

## 1. Tổng quan dự án

### 1.1 Mục đích
Phát triển hệ thống quản lý kho thông minh nhằm tối ưu hóa quy trình vận hành kho hàng, hỗ trợ quản lý sản phẩm, nhân viên, giao dịch nhập xuất, và tự động hóa các quy trình nghiệp vụ.

### 1.2 Phạm vi dự án
- **Đối tượng sử dụng**: Nhân viên kho, quản lý kho, khách hàng, nhà cung cấp
- **Quy mô**: Hệ thống web application với backend API và frontend responsive
- **Công nghệ**: Node.js, React, MongoDB, RESTful API

### 1.3 Bối cảnh và lý do chọn đề tài
Trong bối cảnh số hóa ngày càng mạnh mẽ, việc quản lý kho bằng phương pháp thủ công đang bộc lộ nhiều hạn chế:
- Khó kiểm soát tồn kho thực tế tại từng vị trí lưu trữ
- Quản lý giao dịch thiếu sự minh bạch
- Quy trình nhập xuất không được tự động hóa
- Thiếu báo cáo thống kê và phân tích dữ liệu

## 2. Phân tích yêu cầu từ Client và Team Giáo dục

### 2.1 Yêu cầu từ Client (Doanh nghiệp)

#### 2.1.1 Yêu cầu chức năng cốt lõi
- **Quản lý sản phẩm**: CRUD sản phẩm, danh mục, theo dõi tồn kho
- **Quản lý nhà cung cấp**: Thông tin nhà cung cấp, sản phẩm cung cấp
- **Quản lý khách hàng**: Thông tin khách hàng, lịch sử đặt hàng
- **Quản lý nhân viên**: Phân quyền, quản lý ca làm việc, theo dõi KPI
- **Quản lý giao dịch**: Nhập kho, xuất kho, kiểm kê
- **Quản lý hóa đơn**: Tạo hóa đơn, in PDF, theo dõi thanh toán

#### 2.1.2 Yêu cầu về hiệu suất
- Thời gian phản hồi < 2 giây cho các thao tác cơ bản
- Hỗ trợ đồng thời tối thiểu 50 người dùng
- Backup dữ liệu hàng ngày
- Uptime 99.5%

#### 2.1.3 Yêu cầu về bảo mật
- Xác thực và phân quyền người dùng
- Mã hóa thông tin nhạy cảm
- Audit trail cho các thao tác quan trọng
- Backup và recovery dữ liệu

### 2.2 Yêu cầu từ Team Giáo dục

#### 2.2.1 Yêu cầu học tập
- Áp dụng kiến thức về full-stack development
- Thực hành các design patterns và best practices
- Sử dụng công nghệ hiện đại (React, Node.js, MongoDB)
- Triển khai CI/CD pipeline

#### 2.2.2 Yêu cầu về tài liệu
- Tài liệu phân tích yêu cầu chi tiết
- User stories và acceptance criteria
- API documentation
- Deployment guide
- User manual

#### 2.2.3 Yêu cầu về chất lượng code
- Code review process
- Unit testing coverage > 70%
- Integration testing
- Code linting và formatting
- Git workflow với branch strategy

## 3. Phân tích stakeholders

### 3.1 Primary Stakeholders
- **Quản lý kho**: Người chịu trách nhiệm tổng thể về vận hành kho
- **Nhân viên kho**: Thực hiện các thao tác nhập xuất, kiểm kê
- **Khách hàng**: Đặt hàng và theo dõi đơn hàng
- **Nhà cung cấp**: Cung cấp sản phẩm cho kho

### 3.2 Secondary Stakeholders
- **IT Administrator**: Quản lý hệ thống và bảo trì
- **Kế toán**: Theo dõi các giao dịch tài chính
- **Management**: Xem báo cáo và phân tích

## 4. Phân tích yêu cầu chức năng

### 4.1 Quản lý người dùng và phân quyền
- **Đăng ký/Đăng nhập**: Email verification, password reset
- **Phân quyền**: Admin, Manager, Staff, Customer
- **Quản lý profile**: Cập nhật thông tin cá nhân
- **Audit log**: Theo dõi hoạt động người dùng

### 4.2 Quản lý sản phẩm
- **CRUD sản phẩm**: Tạo, đọc, cập nhật, xóa sản phẩm
- **Quản lý danh mục**: Phân loại sản phẩm theo category
- **Quản lý tồn kho**: Theo dõi số lượng, vị trí lưu trữ
- **Quản lý giá**: Giá nhập, giá bán, giá khuyến mãi

### 4.3 Quản lý nhà cung cấp
- **Thông tin nhà cung cấp**: Tên, địa chỉ, liên hệ
- **Sản phẩm cung cấp**: Danh sách sản phẩm và giá
- **Lịch sử giao dịch**: Các đơn hàng đã nhập
- **Đánh giá nhà cung cấp**: Rating và feedback

### 4.4 Quản lý khách hàng
- **Thông tin khách hàng**: Cá nhân và doanh nghiệp
- **Lịch sử đặt hàng**: Các đơn hàng đã đặt
- **Trạng thái đơn hàng**: Theo dõi từ đặt hàng đến giao hàng
- **Hóa đơn**: Tạo và quản lý hóa đơn

### 4.5 Quản lý giao dịch
- **Nhập kho**: Tạo phiếu nhập, cập nhật tồn kho
- **Xuất kho**: Tạo phiếu xuất, picking list
- **Kiểm kê**: Stocktaking, adjustment
- **Chuyển kho**: Di chuyển sản phẩm giữa các vị trí

### 4.6 Báo cáo và thống kê
- **Báo cáo tồn kho**: Số lượng, giá trị tồn kho
- **Báo cáo doanh thu**: Theo ngày, tháng, năm
- **Báo cáo nhân viên**: Hiệu suất, KPI
- **Export dữ liệu**: Excel, PDF, CSV

## 5. Phân tích yêu cầu phi chức năng

### 5.1 Yêu cầu về hiệu suất
- **Response time**: < 2 giây cho web pages
- **Throughput**: Hỗ trợ 50 concurrent users
- **Scalability**: Có thể mở rộng lên 200 users
- **Database**: Query response < 1 giây

### 5.2 Yêu cầu về tính khả dụng
- **Uptime**: 99.5% availability
- **Recovery time**: < 4 giờ khi có sự cố
- **Backup**: Daily automated backup
- **Monitoring**: Real-time system monitoring

### 5.3 Yêu cầu về bảo mật
- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **Data encryption**: HTTPS, password hashing
- **Input validation**: Prevent SQL injection, XSS

### 5.4 Yêu cầu về khả năng sử dụng
- **Interface**: Responsive design, mobile-friendly
- **Language**: Vietnamese interface
- **Navigation**: Intuitive menu structure
- **Help system**: User manual, tooltips

### 5.5 Yêu cầu về tính tương thích
- **Browser**: Chrome, Firefox, Safari, Edge
- **Device**: Desktop, tablet, mobile
- **OS**: Windows, macOS, Linux
- **Database**: MongoDB compatibility

## 6. Ràng buộc và giả định

### 6.1 Ràng buộc kỹ thuật
- **Technology stack**: Node.js, React, MongoDB
- **Development time**: 3 tháng
- **Team size**: 4 developers
- **Budget**: Giới hạn cho dự án học tập

### 6.2 Ràng buộc nghiệp vụ
- **Compliance**: Không yêu cầu certification đặc biệt
- **Integration**: Không cần tích hợp với hệ thống khác
- **Data migration**: Không có dữ liệu legacy
- **Training**: Người dùng có thể tự học

### 6.3 Giả định
- **Network**: Stable internet connection
- **User knowledge**: Basic computer literacy
- **Data volume**: Medium-sized warehouse
- **Growth**: Gradual user base expansion

## 7. Rủi ro và giảm thiểu

### 7.1 Rủi ro kỹ thuật
- **Risk**: Thiếu kinh nghiệm với technology stack
- **Mitigation**: Training, mentoring, incremental development

### 7.2 Rủi ro về thời gian
- **Risk**: Delay trong development timeline
- **Mitigation**: Agile methodology, regular sprints

### 7.3 Rủi ro về yêu cầu
- **Risk**: Thay đổi yêu cầu trong quá trình phát triển
- **Mitigation**: Clear documentation, stakeholder communication

## 8. Tiêu chí chấp nhận

### 8.1 Functional Acceptance Criteria
- Tất cả user stories được implement và test
- All APIs hoạt động đúng specification
- Database schema complete và optimized
- UI/UX theo design mockups

### 8.2 Non-functional Acceptance Criteria
- Performance benchmarks đạt yêu cầu
- Security testing passed
- Cross-browser compatibility verified
- Mobile responsiveness confirmed

### 8.3 Documentation Acceptance Criteria
- Complete API documentation
- User manual và admin guide
- Deployment instructions
- Source code documentation

## 9. Phê duyệt

| Vai trò | Họ tên | Chữ ký | Ngày |
|---------|---------|---------|------|
| Product Owner | | | |
| Tech Lead | | | |
| Project Manager | | | |
| QA Lead | | | |

---

*Tài liệu này sẽ được cập nhật thường xuyên trong quá trình phát triển dự án.*