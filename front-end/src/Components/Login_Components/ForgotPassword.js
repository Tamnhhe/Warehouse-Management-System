import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert, InputGroup } from "react-bootstrap";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await axios.post("http://localhost:9999/authentication/forgot-password", {
                email,
                phoneNumber,
            });
            setMessage(response.data.status);
        } catch (err) {
            setError(err.response?.data?.message || "Có lỗi xảy ra! Vui lòng thử lại.");
        }
    };

    return (
        <Container fluid className="vh-100 d-flex align-items-center justify-content-center" style={{ background: "url('/images/backgroundLogin.jpg') no-repeat center center / cover" }}>
            <Row className="w-90 h-90">
                <Col md={6} className="d-flex flex-column align-items-center justify-content-center p-4 h-95"
                    style={{ backgroundColor: "#FEFEFE", boxShadow: "0px 10px 10px rgba(0,0,0,0.3)", borderRadius: "10px 0 0 10px" }}>

                    <div className="p-4 rounded shadow" style={{ width: "100%", maxWidth: "350px", background: "#fff", textAlign: "center" }}>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {message && <Alert variant="success">{message}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <InputGroup>
                                    <InputGroup.Text>
                                        <FaEnvelope />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="email"
                                        placeholder="Nhập email của bạn"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{ borderRadius: "10px", boxShadow: "0px 2px 5px rgba(0,0,0,0.1)" }}
                                    />
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <InputGroup>
                                    <InputGroup.Text>
                                        <FaPhone />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập số điện thoại"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                        style={{ borderRadius: "10px", boxShadow: "0px 2px 5px rgba(0,0,0,0.1)" }}
                                    />
                                </InputGroup>
                            </Form.Group>


                            <div className="d-flex justify-content-between align-items-center">
                                <a href="/login" className="text-decoration-none text-primary">Bạn vừa nhớ ra mật khẩu?</a>
                            </div>
                            <Button type="submit" style={{ backgroundColor: "#48C1A6", border: "none", borderRadius: "20px", width: "70%", marginTop: "20px" }}>
                                Xác nhận
                            </Button>
                        </Form>
                    </div>
                </Col>

                <Col md={6} className="d-none d-md-block p-0"
                    style={{ backgroundColor: "#FEFEFE", boxShadow: "10px 10px 10px rgba(0,0,0,0.3)", borderRadius: "0 10px 10px 0" }}>
                    <img src={"/images/login_image.png"} alt="Forgot Password" className="img-fluid w-100 h-100" style={{ objectFit: "cover", borderRadius: "0 10px 10px 0" }} />
                </Col>
            </Row>
        </Container>
    );
};

export default ForgotPassword;
