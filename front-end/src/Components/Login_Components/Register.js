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
import { FaUser, FaEnvelope, FaPhone, FaLock } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  // State các trường form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State thông báo lỗi và thành công
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Kiểm tra mật khẩu khớp client-side (có thể bỏ nếu muốn backend xử lý)
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:9999/authentication/register",
        {
          fullName,
          email,
          phoneNumber,
          password,
          confirmPassword,
        }
      );

      if (response.status === 201) {
        setSuccess(true);
        // Chuyển về trang login sau 1s
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại!");
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
              maxWidth: "400px",
              background: "#fff",
              textAlign: "center",
            }}
          >
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">Đăng ký thành công!</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formFullName">
                <InputGroup>
                  <InputGroup.Text>
                    <FaUser />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Họ và tên"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={{
                      borderRadius: "10px",
                      boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                    }}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formEmail">
                <InputGroup>
                  <InputGroup.Text>
                    <FaEnvelope />
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    placeholder="Email"
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

              <Form.Group className="mb-3" controlId="formPhoneNumber">
                <InputGroup>
                  <InputGroup.Text>
                    <FaPhone />
                  </InputGroup.Text>
                  <Form.Control
                    type="tel"
                    placeholder="Số điện thoại"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    pattern="[0-9]{10,15}"
                    title="Số điện thoại gồm 10-15 chữ số"
                    style={{
                      borderRadius: "10px",
                      boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                    }}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <InputGroup>
                  <InputGroup.Text>
                    <FaLock />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{
                      borderRadius: "10px",
                      boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                    }}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4" controlId="formConfirmPassword">
                <InputGroup>
                  <InputGroup.Text>
                    <FaLock />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{
                      borderRadius: "10px",
                      boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                    }}
                  />
                </InputGroup>
              </Form.Group>

              <Button
                type="submit"
                className="w-100"
                style={{
                  backgroundColor: "#48C1A6",
                  border: "none",
                  borderRadius: "20px",
                  fontWeight: "600",
                }}
              >
                Đăng ký
              </Button>
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
            src={"/images/login_image.png"} // Bạn có thể đổi hình nền nếu muốn
            alt="Register"
            className="img-fluid w-100 h-100"
            style={{ objectFit: "cover", borderRadius: "0 10px 10px 0" }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
