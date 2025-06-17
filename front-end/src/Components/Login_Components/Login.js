import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  InputGroup,
  Card, // <-- Import Card
} from "react-bootstrap";
import { FaEnvelope, FaLock } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const response = await axios.post(
        "http://localhost:9999/authentication/login",
        { email, password }
      );
      if (response.data) {
        const { token } = response.data;
        localStorage.setItem("authToken", token);
        setSuccess(true);
        setTimeout(() => navigate("/product"), 500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại!");
    }
  };

  // --- BẮT ĐẦU KHU VỰC THAY ĐỔI LỚN ---
  return (
    <Container
      fluid
      className="vh-100 d-flex align-items-center justify-content-center p-3" // Thêm padding cho màn hình nhỏ
      style={{
        background: "url('/images/backgroundLogin.jpg') no-repeat center center / cover",
      }}
    >
      {/* Sử dụng Card để bọc toàn bộ, giúp quản lý shadow và border radius dễ dàng */}
      <Card className="shadow-lg" style={{ maxWidth: '900px', width: '100%', border: 'none', overflow: 'hidden' }}>
        <Row className="g-0"> {/* g-0 (no-gutters) để loại bỏ khoảng cách giữa các Col */}
          
          {/* Cột Form */}
          <Col xs={12} md={6} className="d-flex flex-column justify-content-center">
            <Card.Body className="p-4 p-md-5"> {/* Thêm padding responsive */}
              <h2 className="text-center mb-4 fw-bold" style={{ color: '#155E64' }}>Đăng Nhập</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">Đăng nhập thành công! Chuyển hướng...</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <InputGroup>
                    <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                    <Form.Control
                      type="email"
                      placeholder="Nhập email đăng nhập"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <InputGroup>
                    <InputGroup.Text><FaLock /></InputGroup.Text>
                    <Form.Control
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                {/* Làm cho các nút/link linh hoạt hơn trên mobile */}
                <div className="d-flex flex-column flex-sm-row justify-content-sm-between align-items-center gap-3">
                  <a href="/forgot-password" className="text-decoration-none" style={{ color: '#155E64' }}>
                    Quên mật khẩu?
                  </a>
                  <Button
                    type="submit"
                    className="w-100 w-sm-auto" // Chiếm full width trên mobile, auto trên desktop
                    style={{
                      backgroundColor: "#48C1A6",
                      border: "none",
                      padding: '10px 25px',
                    }}
                  >
                    Đăng nhập
                  </Button>
                </div>
                <div className="text-center mt-4">
                  <span className="text-muted">Chưa có tài khoản? </span>
                  <a href="/register" className="text-decoration-none fw-bold" style={{ color: '#155E64' }}>
                    Đăng ký ngay
                  </a>
                </div>
              </Form>
            </Card.Body>
          </Col>

          {/* Cột Hình ảnh (vẫn ẩn trên mobile) */}
          <Col md={6} className="d-none d-md-block">
            <Card.Img
              src={"/images/login_image.png"}
              alt="Login"
              style={{ objectFit: "cover", height: '100%' }}
            />
          </Col>
        </Row>
      </Card>
    </Container>
    // --- KẾT THÚC KHU VỰC THAY ĐỔI LỚN ---
  );
};

export default Login;