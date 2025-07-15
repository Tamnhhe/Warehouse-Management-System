import React, { useEffect, useState } from "react";
import { Container, Form, Button, Alert, Row, Col, Card } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import  useUser  from "../../Hook\s/useUser"; // Giả sử bạn có hook này để quản lý người dùng
const EditProfile = () => {
    const navigate = useNavigate();
        //khoi tao cac state (luu data ng dung de hien thi va editedit)
    const [profile, setProfile] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        dob: "",
        address: "",
        gender: "",
        avatar: "",
        idCard: ""
    });
    //hien thi anh dai dien (avatar) trc khi uploadupload
    const [avatarPreview, setAvatarPreview] = useState("");
    //message success hoac errorerror
    const [statusMessage, setStatusMessage] = useState("");
    //true neu co loi xay rara
    const [isError, setIsError] = useState(false);
    //true neu avatar hop le
    const [isAvatarValid, setIsAvatarValid] = useState(true);
    //luu anh moimoi
    const [newAvatarFile, setNewAvatarFile] = useState(null);

    const { getProfile, editProfile } = useUser(); // Giả sử bạn có hook này để lấy thông tin người dùng
    //get profile info 
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getProfile(); // Gọi hàm lấy thông tin người dùng từ hook

                const { fullName = "", account = {}, profile = {} } = response.data;
                const { email = "" } = account;
                const { phoneNumber = "", dob = "", address = "", gender = "", avatar = "", idCard = "" } = profile;
                //lay du lieu avatar tu api, neu co tren server thi lay duong dan day dudu
                const avatarUrl = avatar ? `http://localhost:9999${avatar}` : "/images/avatar/default.png";

                setProfile({ fullName, email, phoneNumber, dob: dob ? dob.split("T")[0] : "", address, gender, avatar, idCard });
                setAvatarPreview(avatarUrl);
            } catch {
                setIsError(true);
                setStatusMessage("Không thể load thông tin người dùng");
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };
    //avatar control 
    const handleAvatarChange = (e) => {
        const file = e.target.files[0]; //lay file ng dung chonchon
        if (!file) return;

        if (!file.type.includes("image")) {
            setIsAvatarValid(false); // not valid 
            setIsError(true);
            setStatusMessage("Vui lòng chọn file hình ảnh hợp lệ.");
            e.target.value = ""; // Reset input file
            return;
        }

        setIsAvatarValid(true); // valid
        setStatusMessage("");
        setAvatarPreview(URL.createObjectURL(file));//hien thi anh tam thoithoi
        setNewAvatarFile(file);//luu file vao state va gui len serverserver
    };



    //submit form 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsError(false);
        setStatusMessage("");

        // If avatar is not valid then no submit form 
        if (!isAvatarValid) {
            setIsError(true);
            setStatusMessage("File không hợp lệ. Vui lòng chọn file hình ảnh hợp lệ.");
            return;
        }
        //du lieu gui len server theo dang multipart/form datadata
        const formData = new FormData();
        formData.append("fullName", profile.fullName);
        formData.append("phoneNumber", profile.phoneNumber);
        formData.append("dob", profile.dob);
        formData.append("address", profile.address);
        formData.append("gender", profile.gender);
        formData.append("idCard", profile.idCard);

        if (newAvatarFile) {
            formData.append("avatar", newAvatarFile);
        }

        try {
            const response = await editProfile(formData); // Gọi hàm chỉnh sửa thông tin người dùng từ hook
            setStatusMessage(response.data.message);

            setTimeout(() => {
                navigate("/view-profile");
            }, 2000);
        } catch (error) {
            setIsError(true);
            setStatusMessage(error.response?.data?.message || "Không thể load thông tin người dùng");
        }
    };

    return (
        <>
            <Container className="mt-4">
                <Button
                    variant="light"
                    className="mb-3"
                    onClick={() => navigate(-1)} // quay lại trang trước
                    style={{ fontWeight: "bold", fontFamily: "Arial, sans-serif" }}
                >
                    &#60; Back
                </Button>
                {statusMessage && <Alert variant={isError ? "danger" : "success"}>{statusMessage}</Alert>}

                <Row className="d-flex align-items-stretch">
                    <Col md={4}>
                        <Card className="text-center p-4 shadow-sm h-100">
                            <Card.Img
                                variant="top"
                                src={avatarPreview}
                                alt="User Avatar"
                                className="rounded-circle mx-auto"
                                style={{ width: "250px", height: "250px", objectFit: "cover" }}
                            />
                            {/* goi  handle de cap nhat previewpreview*/}
                            <Form.Group className="mt-3">
                                <Form.Label><strong>Thay đổi avatar ở phía dưới</strong></Form.Label>
                                <Form.Control type="file" name="avatar" onChange={handleAvatarChange} />
                            </Form.Group>
                        </Card>
                    </Col>

                    <Col md={8}>
                        <Card className="p-4 shadow-sm h-100">
                            {/*edit section*/}
                            <Card.Body>
                                <h3 className="mb-3">Chỉnh sửa thông tin cá nhân</h3>
                                <hr />
                                <Form onSubmit={handleSubmit}>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Label><strong>Số căn cước</strong></Form.Label>
                                            <Form.Control type="number" name="idCard" value={profile.idCard} onChange={handleChange} required />
                                        </Col>
                                        <Col md={6}>
                                            <Form.Label><strong>Tên đầy đủ</strong></Form.Label>
                                            <Form.Control type="text" name="fullName" value={profile.fullName} onChange={handleChange} required />
                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Label><strong>Email<span className="text-danger">*</span></strong></Form.Label>
                                            <Form.Control type="email" name="email" value={profile.email} disabled />
                                        </Col>
                                        <Col md={6}>
                                            <Form.Label><strong>Số điện thoại</strong></Form.Label>
                                            <Form.Control type="number" name="phoneNumber" value={profile.phoneNumber} onChange={handleChange} />
                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Label><strong>Ngày sinh nhật</strong></Form.Label>
                                            <Form.Control type="date" name="dob" value={profile.dob} onChange={handleChange} />
                                        </Col>
                                        <Col md={6}>
                                            <Form.Label><strong>Địa chỉ</strong></Form.Label>
                                            <Form.Control type="text" name="address" value={profile.address} onChange={handleChange} />
                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Label><strong>Giới tính</strong></Form.Label>
                                            <Form.Select name="gender" value={profile.gender} onChange={handleChange}>
                                                <option value="male">Nam</option>
                                                <option value="female">Nữ</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <Button variant="warning" className="float-end mt-4 m-3" onClick={() => navigate("/change-password")}>Đổi mật khẩu</Button>
                                    <Button variant="success" type="submit" className="float-end mt-4">Lưu thay đổi</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default EditProfile;
