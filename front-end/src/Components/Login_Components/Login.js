// Nguyễn Đức Linh - HE170256 19/1/2025
import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { FaEnvelope, FaLock } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  // Minh Phuong add navigate
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
        {
          email,
          password,
        }
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

  return (
    <Container
      fluid
      className="vh-100 d-flex align-items-center justify-content-center"
      style={{
        background:
          "url('/images/backgroundLogin.jpg') no-repeat center center / cover",
      }}
    >
      <Row className="w-90 h-90">
        <Col
          md={6}
          className="d-flex flex-column align-items-center justify-content-center p-4 h-95"
          style={{
            backgroundColor: "#FEFEFE",
            boxShadow: "0px 10px 10px rgba(0,0,0,0.3)",
            borderRadius: "10px 0 0 10px",
          }}
        >
          <div
            className="p-4 rounded shadow"
            style={{
              width: "100%",
              maxWidth: "350px",
              background: "#fff",
              textAlign: "center",
            }}
          >
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">Đăng nhập thành công!</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <InputGroup>
                  <InputGroup.Text>
                    <FaEnvelope />
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    placeholder="Nhập email đăng nhập"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      borderRadius: "10px",
                      boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                    }}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <InputGroup>
                  <InputGroup.Text>
                    <FaLock />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      borderRadius: "10px",
                      boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                    }}
                  />
                </InputGroup>
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center">
                <a
                  href="/forgot-password"
                  className="text-decoration-none text-primary"
                >
                  Quên mật khẩu?
                </a>
                <Button
                  type="submit"
                  style={{
                    backgroundColor: "#48C1A6",
                    border: "none",
                    borderRadius: "20px",
                  }}
                >
                  Đăng nhập
                </Button>
              </div>
            </Form>
          </div>
        </Col>

        <Col
          md={6}
          className="d-none d-md-block p-0"
          style={{
            backgroundColor: "#FEFEFE",
            boxShadow: "10px 10px 10px rgba(0,0,0,0.3)",
            borderRadius: "0 10px 10px 0",
          }}
        >
          <img
            src={"/images/login_image.png"}
            alt="Login"
            className="img-fluid w-100 h-100"
            style={{ objectFit: "cover", borderRadius: "0 10px 10px 0" }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
