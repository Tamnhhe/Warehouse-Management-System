# Documentation Index - Warehouse Management System

## 📋 Tài liệu phân tích yêu cầu

### 1. Tài liệu chính
- **[Requirements Summary](requirements-summary.md)** - Tóm tắt phân tích yêu cầu
- **[Requirements Analysis](requirements-analysis.md)** - Phân tích yêu cầu chi tiết
- **[User Stories](user-stories.md)** - Đặc tả tính năng người dùng
- **[Client & Education Requirements](client-education-requirements.md)** - Yêu cầu từ client và team giáo dục
- **[Implementation Roadmap](implementation-roadmap.md)** - Lộ trình thực hiện dự án

### 2. Tài liệu kỹ thuật
- **[API Documentation](../back-end/docs/SUPPLIER_PRODUCT_MANAGEMENT.md)** - Hướng dẫn API
- **[Technical Architecture](technical-architecture.md)** - Kiến trúc hệ thống (Coming soon)
- **[Database Schema](database-schema.md)** - Thiết kế cơ sở dữ liệu (Coming soon)

### 3. Tài liệu quản lý dự án
- **[Sprint Planning](sprint-planning.md)** - Kế hoạch sprint (Coming soon)
- **[Team Assignments](team-assignments.md)** - Phân công nhiệm vụ (Coming soon)
- **[Progress Tracking](progress-tracking.md)** - Theo dõi tiến độ (Coming soon)

## 🎯 Mục tiêu dự án

### Mục tiêu chính
Phát triển hệ thống quản lý kho thông minh nhằm:
- Tối ưu hóa quy trình vận hành kho
- Hỗ trợ quản lý sản phẩm, nhân viên, giao dịch
- Tự động hóa các quy trình nghiệp vụ
- Cung cấp báo cáo và thống kê realtime

### Đối tượng sử dụng
- **Admin**: Quản lý hệ thống và người dùng
- **Manager**: Quản lý kho và nhân viên
- **Staff**: Thực hiện các thao tác nhập/xuất kho
- **Customer**: Đặt hàng và theo dõi đơn hàng
- **Supplier**: Cung cấp sản phẩm cho kho

## 📊 Thống kê dự án

### User Stories
- **Total**: 27 stories
- **High Priority**: 15 stories
- **Medium Priority**: 11 stories
- **Low Priority**: 1 story
- **Total Story Points**: 194 points

### Timeline
- **Duration**: 3 months (12 weeks)
- **Sprints**: 6 sprints (2 weeks each)
- **Team Size**: 4 developers
- **Methodology**: Agile Scrum

### Technology Stack
- **Frontend**: React, Material-UI, Axios
- **Backend**: Node.js, Express, MongoDB
- **Tools**: Git, Docker, CI/CD
- **Deployment**: Cloud (Heroku/AWS)

## 🚀 Getting Started

### 1. Đọc tài liệu theo thứ tự
1. **[Requirements Summary](requirements-summary.md)** - Bắt đầu từ đây
2. **[User Stories](user-stories.md)** - Hiểu các tính năng
3. **[Implementation Roadmap](implementation-roadmap.md)** - Xem kế hoạch thực hiện

### 2. Cho Developers
- Đọc **[Requirements Analysis](requirements-analysis.md)** để hiểu yêu cầu kỹ thuật
- Xem **[API Documentation](../back-end/docs/SUPPLIER_PRODUCT_MANAGEMENT.md)** cho backend
- Tham khảo **[Client & Education Requirements](client-education-requirements.md)** để hiểu context

### 3. Cho Stakeholders
- **[Requirements Summary](requirements-summary.md)** - Tổng quan dự án
- **[User Stories](user-stories.md)** - Các tính năng sẽ phát triển
- **[Implementation Roadmap](implementation-roadmap.md)** - Timeline và milestones

## 📝 Quy trình phát triển

### Sprint Structure
```
Sprint 0: Project Setup & Requirements (Week 1-2)
Sprint 1: Authentication & User Management (Week 3-4)
Sprint 2: Product & Category Management (Week 5-6)
Sprint 3: Inventory & Stock Management (Week 7-8)
Sprint 4: Transaction Management & Workflow (Week 9-10)
Sprint 5: Customer Portal & Order Management (Week 11-12)
Sprint 6: Reporting & Analytics (Week 13-14)
```

### Quality Assurance
- **Code Review**: Mandatory cho tất cả PRs
- **Testing**: Unit testing (70%+ coverage)
- **Documentation**: Inline comments và API docs
- **Performance**: Response time < 2 seconds

## 🔗 Quick Links

### Repository Structure
```
/
├── docs/                    # Documentation
│   ├── requirements-*.md    # Requirements documents
│   ├── user-stories.md     # User stories
│   └── implementation-*.md # Implementation docs
├── back-end/               # Backend API
│   ├── docs/              # API documentation
│   └── ...
├── front-end/             # Frontend React app
└── README.md              # Project overview
```

### Important Links
- **[Main Repository](../README.md)** - Project overview
- **[Backend Setup](../back-end/README.md)** - API development
- **[Frontend Setup](../front-end/README.md)** - React app development
- **[Issues](https://github.com/Tamnhhe/Warehouse-Management-System/issues)** - Bug tracking

## 📞 Contact Information

### Team Members
- **Team Lead**: [Tên]
- **Frontend Developers**: [Tên]
- **Backend Developer**: [Tên]
- **Full-stack Developer**: [Tên]

### Stakeholders
- **Client**: Movico Group
- **Education**: FPT University - WDP301
- **Course**: SE1827 - Group 5

### Communication
- **Daily Standup**: 9:00 AM (Monday-Friday)
- **Sprint Review**: End of each sprint
- **Stakeholder Updates**: Weekly reports

---

**Last Updated**: 2024-01-15
**Version**: 1.0
**Status**: ✅ Requirements Analysis Complete