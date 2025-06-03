import React from "react";
import { Container, Navbar, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { TbLogout } from "react-icons/tb";

function Header() {
  const navigate = useNavigate();
  const curentToken = localStorage.getItem("authToken");

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Xóa authToken khi đăng nhập
    navigate("/login");
  };

  return (
    <Navbar expand="lg" className="px-3" style={{ background: 'linear-gradient(to right, white, #7BD1C2)' }}>
      <Container className="d-flex justify-content-between">
        <Navbar.Brand
          onClick={() => navigate("/")}
          className="cursor-pointer"
        >
          Trang chủ
        </Navbar.Brand>

        {curentToken ? (
          <div>
            <Button variant="light" className="me-2" onClick={() => navigate("/view-profile")}>
              Go to Profile
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              <TbLogout />
            </Button>
          </div>
        ) : (
          <div>
            <Button variant="light" className="me-2" onClick={() => navigate("/login")}>
              Đăng nhập
            </Button>
          </div>
        )}

      </Container>s
    </Navbar>
  );
}

export default Header;
