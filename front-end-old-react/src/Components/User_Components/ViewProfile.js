import React, { useEffect, useState } from "react";
import { Container, Card, Row, Col, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        
        const response = await axios.get("http://localhost:9999/users/view-profile", {
          headers: { Authorization: token},
        });

        setProfile(response.data);
      } catch (err) {
        setError( "Không thể tải thông tin người dùng.");
      }
    };

    fetchProfile();
  }, []);

  return (
    <>
      <Container className="mt-4">
        {error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}

        <Row className="d-flex align-items-stretch">
          {profile && (
            <>
              {/* Left */}
              <Col md={4}>
                <Card className="text-center p-4 shadow-sm h-100">
                  <Card.Img
                    variant="top"
                    src={profile.profile.avatar
                      ? `http://localhost:9999${profile.profile.avatar}`: "/images/avatar/default.png"}
                    alt="User Avatar"
                    className="rounded-circle mx-auto"
                    style={{ width: "250px", height: "250px", objectFit: "cover" }}
                  />
                  <Card.Body>
                    <h4>{profile.fullName}</h4>
                    <p>
                      <span className={`badge bg-${profile.status === "active" ? "success" : "danger"}`}>
                        {profile.status === "active" ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </p>
                    <p className="text-muted">{profile.role === "manager" ? "Quản lý" : "Nhân viên"}</p>
                    {profile.role !== "manager" && (
                      <p className="text-muted">Kiểu nhân viên: {profile.type === "fulltime" ? "Toàn thời gian" : "Bán thời gian"}</p>
                    )}
                    {/* // <p className="text-muted">Ngày làm việc: {profile.schedule?.workDays?.map(day => ({"Monday": "T2", "Tuesday": "T3", "Wednesday": "T4", "Thursday": "T5", "Friday": "T6", "Saturday": "T7", "Sunday": "CN" }[day])).join(", ")}</p>
                  // <p className="text-muted">Ca làm việc: {profile.type === "parttime" ? profile.schedule?.shifts?.map(day => ({"Morning":"Sáng: 08:00 - 11:00", "Afternoon":"Chiều: 13:00 - 17:00","Evening":"Tối: 17:00 - 21:00"}[day])).join(", ") : "Từ 8:00AM tới 17:00PM"}</p>*/}
                  </Card.Body>
                </Card>
              </Col>
              {/* Right */}
              <Col md={8}>
                <Card className="p-4 shadow-sm h-100">
                  <Card.Body>
                    <h3 className="mb-3">Thông tin cá nhân</h3>
                    <hr />
                    <Row>
                      <Col sm={4}><strong>Số căn cước:</strong></Col>
                      <Col sm={8}><strong>{profile.profile.idCard}</strong></Col>
                    </Row>
                    <hr />
                    <Row>
                      <Col sm={4}><strong>Tên đầy đủ:</strong></Col>
                      <Col sm={8}>{profile.fullName}</Col>
                    </Row>
                    <hr />
                    <Row className="mt-2">
                      <Col sm={4}><strong>Email:</strong></Col>
                      <Col sm={8}>{profile.account.email}</Col>
                    </Row>
                    <hr />
                    <Row className="mt-2">
                      <Col sm={4}><strong>Số điện thoại:</strong></Col>
                      <Col sm={8}>{profile.profile.phoneNumber}</Col>
                    </Row>
                    <hr />
                    <Row className="mt-2">
                      <Col sm={4}><strong>Ngày sinh nhật:</strong></Col>
                      <Col sm={8}>{new Date(profile.profile.dob).toLocaleDateString()}</Col>
                    </Row>
                    <hr />
                    <Row className="mt-2">
                      <Col sm={4}><strong>Địa chỉ:</strong></Col>
                      <Col sm={8}>{profile.profile.address}</Col>
                    </Row>
                    <hr />
                    <Row className="mt-2">
                      <Col sm={4}><strong>Giới tính:</strong></Col>
                      <Col sm={8}>{profile.profile.gender === "male" ? "Nam" : "Nữ"}</Col>
                    </Row>
                    <div className="text-end mt-4">
                      <Button variant="success" onClick={() => navigate("/edit-profile")}>Chỉnh sửa thông tin</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </>
          )}
        </Row>
      </Container>
    </>
  );
};

export default Profile;
