# Tài liệu Thu thập Yêu cầu Client và Team Giáo dục

## 1. Thông tin thu thập yêu cầu

### 1.1 Lịch sử thu thập
- **Ngày bắt đầu**: 2024-01-15
- **Phương pháp**: Phỏng vấn, workshop, survey
- **Stakeholders tham gia**: 
  - Client representatives
  - Education team
  - Development team
  - Project manager

### 1.2 Công cụ thu thập
- **Meetings**: Microsoft Teams, Zoom
- **Documentation**: Confluence, Google Docs
- **Surveys**: Google Forms
- **Prototyping**: Figma, Draw.io

## 2. Yêu cầu từ Client (Doanh nghiệp)

### 2.1 Thông tin Client
- **Tên doanh nghiệp**: Movico Group
- **Lĩnh vực**: Logistics và quản lý kho
- **Quy mô**: 50-200 nhân viên
- **Vị trí**: Việt Nam
- **Hệ thống hiện tại**: Excel, quản lý thủ công

### 2.2 Pain Points hiện tại

#### 2.2.1 Vấn đề về quản lý tồn kho
- **Vấn đề**: Khó kiểm soát tồn kho thực tế tại từng vị trí
- **Ảnh hưởng**: Mất thời gian tìm kiếm, tồn kho không chính xác
- **Mức độ**: Critical
- **Tần suất**: Hàng ngày

#### 2.2.2 Vấn đề về giao dịch
- **Vấn đề**: Quản lý giao dịch thiếu minh bạch
- **Ảnh hưởng**: Sai sót trong nhập xuất, khó audit
- **Mức độ**: High
- **Tần suất**: Hàng tuần

#### 2.2.3 Vấn đề về báo cáo
- **Vấn đề**: Không có báo cáo tự động, phải tổng hợp thủ công
- **Ảnh hưởng**: Tốn thời gian, dễ sai sót
- **Mức độ**: Medium
- **Tần suất**: Hàng tháng

### 2.3 Yêu cầu chức năng từ Client

#### 2.3.1 Quản lý sản phẩm
```
Requirement ID: CR-001
Title: Quản lý sản phẩm toàn diện
Description: Hệ thống cần có khả năng quản lý thông tin sản phẩm đầy đủ
Priority: Must Have
Stakeholder: Warehouse Manager
```

**Chi tiết yêu cầu:**
- Tạo, sửa, xóa thông tin sản phẩm
- Quản lý danh mục sản phẩm có tính phân cấp
- Upload và quản lý hình ảnh sản phẩm
- Theo dõi thông tin: tên, mô tả, giá, barcode, expiry date
- Quản lý variants của sản phẩm (size, color, etc.)

**Acceptance Criteria:**
- Admin/Manager có thể CRUD sản phẩm
- Hỗ trợ bulk import/export sản phẩm
- Validate dữ liệu đầu vào
- Tích hợp barcode scanner

#### 2.3.2 Quản lý tồn kho
```
Requirement ID: CR-002
Title: Theo dõi tồn kho realtime
Description: Hệ thống cần cập nhật tồn kho theo thời gian thực
Priority: Must Have
Stakeholder: Warehouse Staff
```

**Chi tiết yêu cầu:**
- Theo dõi tồn kho theo thời gian thực
- Cảnh báo khi tồn kho thấp
- Quản lý vị trí lưu trữ trong kho
- Hỗ trợ FIFO/LIFO cho xuất hàng
- Báo cáo tồn kho định kỳ

**Acceptance Criteria:**
- Cập nhật tồn kho tự động khi có giao dịch
- Threshold alert configurable
- Location tracking với sơ đồ kho
- Aging report cho tồn kho

#### 2.3.3 Quản lý giao dịch
```
Requirement ID: CR-003
Title: Quản lý nhập xuất kho
Description: Hệ thống cần quản lý toàn bộ quy trình nhập xuất
Priority: Must Have
Stakeholder: Warehouse Staff, Manager
```

**Chi tiết yêu cầu:**
- Tạo phiếu nhập kho từ purchase order
- Tạo phiếu xuất kho từ sales order
- Workflow approval cho giao dịch
- Tích hợp với barcode scanner
- Tracking history của từng sản phẩm

**Acceptance Criteria:**
- Multi-level approval workflow
- Barcode integration
- Audit trail đầy đủ
- Exception handling

#### 2.3.4 Quản lý khách hàng và đơn hàng
```
Requirement ID: CR-004
Title: Customer portal và order management
Description: Khách hàng cần có thể đặt hàng và theo dõi online
Priority: Should Have
Stakeholder: Customer, Sales Team
```

**Chi tiết yêu cầu:**
- Portal cho khách hàng đặt hàng
- Theo dõi trạng thái đơn hàng
- Lịch sử mua hàng
- Notification system
- Integration với hóa đơn

**Acceptance Criteria:**
- Responsive customer portal
- Real-time order tracking
- Email notifications
- PDF invoice generation

### 2.4 Yêu cầu phi chức năng từ Client

#### 2.4.1 Performance Requirements
```
Requirement ID: CNR-001
Title: Hiệu suất hệ thống
Description: Hệ thống cần đảm bảo hiệu suất cao
Priority: Must Have
```

**Chi tiết:**
- Response time < 2 seconds for normal operations
- Support 50 concurrent users
- Database query < 1 second
- Page load time < 3 seconds

#### 2.4.2 Security Requirements
```
Requirement ID: CNR-002
Title: Bảo mật dữ liệu
Description: Đảm bảo bảo mật thông tin doanh nghiệp
Priority: Must Have
```

**Chi tiết:**
- Role-based access control
- Data encryption in transit và at rest
- Audit logging
- Regular security updates
- Backup và disaster recovery

#### 2.4.3 Usability Requirements
```
Requirement ID: CNR-003
Title: Dễ sử dụng
Description: Giao diện thân thiện với người dùng
Priority: Should Have
```

**Chi tiết:**
- Vietnamese language support
- Intuitive navigation
- Mobile responsive design
- Consistent UI/UX
- Help documentation

### 2.5 Constraints từ Client

#### 2.5.1 Technical Constraints
- **Technology stack**: Prefer web-based solution
- **Integration**: Không cần tích hợp với legacy system
- **Database**: NoSQL preferred (MongoDB)
- **Hosting**: Cloud-based deployment

#### 2.5.2 Business Constraints
- **Budget**: Limited budget for student project
- **Timeline**: 3 months development
- **Resources**: 4 developers
- **Training**: Minimal training required

#### 2.5.3 Operational Constraints
- **Availability**: 8AM-6PM working hours
- **Maintenance**: Weekly maintenance window
- **Support**: Basic support during business hours
- **Scalability**: Support growth to 200 users

## 3. Yêu cầu từ Team Giáo dục

### 3.1 Thông tin Team Giáo dục
- **Trường**: FPT University
- **Khoa**: Software Engineering
- **Môn học**: WDP301 - Web Development Project
- **Học kỳ**: Spring 2024
- **Giảng viên**: [Tên giảng viên]

### 3.2 Mục tiêu học tập

#### 3.2.1 Learning Objectives
```
Requirement ID: ER-001
Title: Áp dụng kiến thức full-stack development
Description: Sinh viên cần demonstrate kỹ năng full-stack
Priority: Must Have
```

**Chi tiết:**
- Frontend development với React
- Backend development với Node.js
- Database design và integration
- API development và documentation
- Testing và deployment

#### 3.2.2 Technical Skills
```
Requirement ID: ER-002
Title: Sử dụng công nghệ hiện đại
Description: Áp dụng tech stack hiện đại trong industry
Priority: Must Have
```

**Chi tiết:**
- React for frontend
- Node.js và Express for backend
- MongoDB for database
- RESTful API design
- Git version control

#### 3.2.3 Soft Skills
```
Requirement ID: ER-003
Title: Kỹ năng làm việc nhóm
Description: Phát triển kỹ năng collaboration
Priority: Should Have
```

**Chi tiết:**
- Project management
- Code review process
- Documentation skills
- Communication skills
- Problem-solving

### 3.3 Yêu cầu về deliverables

#### 3.3.1 Documentation Requirements
```
Requirement ID: EDR-001
Title: Tài liệu dự án hoàn chỉnh
Description: Cần có tài liệu chi tiết cho từng phase
Priority: Must Have
```

**Chi tiết:**
- Requirements analysis document
- System design document
- API documentation
- User manual
- Deployment guide
- Test reports

#### 3.3.2 Code Quality Requirements
```
Requirement ID: EDR-002
Title: Chất lượng code
Description: Code cần follow best practices
Priority: Must Have
```

**Chi tiết:**
- Code commenting và documentation
- Consistent coding style
- Error handling
- Input validation
- Security best practices

#### 3.3.3 Testing Requirements
```
Requirement ID: EDR-003
Title: Testing coverage
Description: Cần có testing strategy đầy đủ
Priority: Should Have
```

**Chi tiết:**
- Unit testing (target 70% coverage)
- Integration testing
- API testing
- User acceptance testing
- Performance testing

### 3.4 Yêu cầu về process

#### 3.4.1 Development Process
```
Requirement ID: EPR-001
Title: Agile development process
Description: Sử dụng Agile methodology
Priority: Must Have
```

**Chi tiết:**
- Sprint planning (2-week sprints)
- Daily standups
- Sprint review và retrospective
- Backlog management
- Scrum roles và ceremonies

#### 3.4.2 Quality Assurance
```
Requirement ID: EPR-002
Title: QA process
Description: Có process đảm bảo chất lượng
Priority: Must Have
```

**Chi tiết:**
- Code review mandatory
- Testing before deployment
- Bug tracking và resolution
- Performance monitoring
- Security testing

#### 3.4.3 Version Control
```
Requirement ID: EPR-003
Title: Git workflow
Description: Sử dụng Git properly
Priority: Must Have
```

**Chi tiết:**
- Feature branch workflow
- Pull request process
- Commit message standards
- Branch naming conventions
- Merge strategies

### 3.5 Assessment Criteria

#### 3.5.1 Technical Assessment (60%)
- **Code quality**: 20%
- **Functionality**: 20%
- **System design**: 10%
- **Testing**: 10%

#### 3.5.2 Process Assessment (25%)
- **Project management**: 10%
- **Team collaboration**: 10%
- **Documentation**: 5%

#### 3.5.3 Presentation Assessment (15%)
- **Demo quality**: 10%
- **Q&A handling**: 5%

## 4. Conflict Resolution

### 4.1 Identified Conflicts

#### 4.1.1 Technical Conflicts
```
Conflict ID: CON-001
Description: Client muốn nhiều features vs Education timeline constraints
Priority: High
Resolution: Prioritize MVP features cho educational goals
```

#### 4.1.2 Resource Conflicts
```
Conflict ID: CON-002
Description: Client expectations vs Student skill level
Priority: Medium
Resolution: Simplify complex features, focus on learning
```

### 4.2 Resolution Strategy
1. **Prioritize educational objectives**
2. **Negotiate scope với client**
3. **Create phased delivery plan**
4. **Regular stakeholder communication**

## 5. Sign-off

### 5.1 Client Approval
- **Date**: ___________
- **Signature**: ___________
- **Name**: ___________
- **Title**: ___________

### 5.2 Education Team Approval
- **Date**: ___________
- **Signature**: ___________
- **Name**: ___________
- **Title**: ___________

### 5.3 Development Team Acknowledgment
- **Date**: ___________
- **Team Lead**: ___________
- **Members**: ___________

---

*Tài liệu này là kết quả của quá trình thu thập yêu cầu chi tiết từ client và team giáo dục, sẽ được sử dụng làm cơ sở cho toàn bộ quá trình phát triển dự án.*