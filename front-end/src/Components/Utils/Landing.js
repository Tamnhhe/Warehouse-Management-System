import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaWarehouse, FaBoxes, FaChartLine, FaUsers } from 'react-icons/fa';
import { GiFactory } from "react-icons/gi";
import { BiCategory } from "react-icons/bi";
import Header from './Header';

function Landing() {
    const features = [
        {
            icon: <FaWarehouse size={40} />,
            title: "Quản lý kho",
            description: "Theo dõi và quản lý hàng hóa trong kho một cách hiệu quả",
            link: "/list-transaction"
        },
        {
            icon: <FaBoxes size={40} />,
            title: "Quản lý sản phẩm",
            description: "Kiểm soát thông tin và số lượng sản phẩm",
            link: "/product"
        },
        {
            icon: <FaChartLine size={40} />,
            title: "Báo cáo thống kê",
            description: "Theo dõi và phân tích dữ liệu kho",
            link: "/dashboard"
        },
        {
            icon: <FaUsers size={40} />,
            title: "Quản lý nhân viên",
            description: "Phân quyền và quản lý người dùng hệ thống",
            link: "/manager/get-all-user"
        },
        {
            icon: <BiCategory size={40} />,
            title: "Quản lý danh mục",
            description: "Phân loại  và quản lý sản phẩm",
            link: "/category"
        },
        {
            icon: <GiFactory size={40} />,
            title: "Quản lý nhà cung cấp",
            description: "Danh sách nhà cung cấp",
            link: "/get-list-suppliers"
        }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
            {/* Hero Section */}
            <div style={{
                backgroundColor: '#A8E6CF',
                // padding: '80px 0',
                marginBottom: '50px'
            }}>
                <Header />
                <Container>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <h1 style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                marginBottom: '20px'
                            }}>
                                Hệ Thống Quản Lý Kho Nội Bộ
                            </h1>
                            <p style={{ fontSize: '1.2rem', color: '#333' }}>
                                Giải pháp quản lý kho thông minh, hiệu quả và dễ dàng sử dụng
                            </p>
                        </Col>
                        <Col md={6} className="text-center">
                            <img
                                src="/images/287930.png"
                                alt="Warehouse"
                                style={{
                                    maxWidth: '50%',
                                    height: 'auto',
                                    backgroundColor: 'transparent'  // Thêm thuộc tính này
                                }}
                            />
                        </Col>

                    </Row>
                </Container>
            </div>

            {/* Features Section */}
            <Container className="mb-5">
                <h2 className="text-center mb-5" style={{ color: '#333' }}>Tính Năng Chính</h2>
                <Row>
                    {features.map((feature, index) => (
                        <Col md={4} key={index} className="mb-4">
                            <Card
                                style={{
                                    border: 'none',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                    height: '100%',
                                    transition: 'transform 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                onClick={() => window.location.href = feature.link}
                            >
                                <Card.Body className="text-center">
                                    <div style={{
                                        color: '#A8E6CF',
                                        marginBottom: '20px'
                                    }}>
                                        {feature.icon}
                                    </div>
                                    <Card.Title style={{
                                        marginBottom: '15px',
                                        fontWeight: 'bold'
                                    }}>
                                        {feature.title}
                                    </Card.Title>
                                    <Card.Text style={{ color: '#666' }}>
                                        {feature.description}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* Stats Section */}
            <div style={{
                backgroundColor: '#f8f9fa',
                padding: '50px 0'
            }}>
                <Container>
                    <Row className="text-center">
                        <Col md={4}>
                            <h3 style={{ color: '#A8E6CF', fontSize: '2.5rem' }}>1000+</h3>
                            <p>Sản phẩm quản lý</p>
                        </Col>
                        <Col md={4}>
                            <h3 style={{ color: '#A8E6CF', fontSize: '2.5rem' }}>50+</h3>
                            <p>Nhân viên tin dùng</p>
                        </Col>
                        <Col md={4}>
                            <h3 style={{ color: '#A8E6CF', fontSize: '2.5rem' }}>24/7</h3>
                            <p>Hỗ trợ khách hàng</p>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
}

export default Landing;
