import React from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

// Icons cho các chức năng
import Inventory2Icon from "@mui/icons-material/Inventory2";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import OutputIcon from "@mui/icons-material/Output";
import BadgeIcon from "@mui/icons-material/Badge";
import HandshakeIcon from "@mui/icons-material/Handshake";

import Header from "./Header"; // Đảm bảo đường dẫn chính xác
import Footer from "./Footer"; // Đảm bảo đường dẫn chính xác

// --- DỮ LIỆU CHỨC NĂNG ---
const mainFunctions = [
  {
    title: "Sản phẩm",
    icon: <Inventory2Icon />,
    path: "/product",
    allowedRoles: ["manager", "employee"],
  },
  {
    title: "Kiểm kê",
    icon: <FactCheckIcon />,
    path: "/inventory-check",
    allowedRoles: ["manager", "employee"],
  },
  {
    title: "Nhập hàng",
    icon: <MoveToInboxIcon />,
    path: "/create-receipt",
    allowedRoles: ["manager"],
  },
  {
    title: "Xuất hàng",
    icon: <OutputIcon />,
    path: "/export",
    allowedRoles: ["manager", "employee"],
  },
  {
    title: "Nhân viên",
    icon: <BadgeIcon />,
    path: "/manager/get-all-user",
    allowedRoles: ["manager"],
  },
  {
    title: "Đối tác",
    icon: <HandshakeIcon />,
    path: "/get-list-suppliers",
    allowedRoles: ["manager", "employee"],
  },
];

// Helper function để lấy vai trò người dùng
const getUserRole = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;
  try {
    return jwtDecode(token).role;
  } catch (error) {
    return null;
  }
};

// --- COMPONENT CON CHO MỘT "APP" THEO PHONG CÁCH ODOO ---
const OdooAppButton = ({ title, icon, onClick }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        cursor: "pointer",
        p: { xs: 1, md: 2 },
        borderRadius: "8px",
        transition: "background-color 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
      }}
    >
      <Box
        sx={{
          width: { xs: 60, md: 72 },
          height: { xs: 60, md: 72 },
          borderRadius: "12px",
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          color: "#155E64", // Màu icon từ palette
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: { xs: 32, md: 40 } } })}
      </Box>
      <Typography
        variant="body2"
        sx={{
          fontWeight: "500",
          color: "text.secondary",
          width: { xs: "70px", md: "90px" }, // Giới hạn chiều rộng của text
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};

function Landing() {
  const navigate = useNavigate();
  const userRole = getUserRole();
  const [searchTerm, setSearchTerm] = React.useState("");

  const accessibleFunctions = mainFunctions
    .filter((func) => userRole && func.allowedRoles.includes(userRole))
    .filter((func) =>
      func.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // --- RENDER GIAO DIỆN KIỂU ODOO ---
  const renderOdooStyleDashboard = () => (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: "#f7f9fc", // Màu nền sáng giống Odoo
        overflowY: "auto",
        p: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        {/* Thanh tìm kiếm */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm ứng dụng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 4,
            maxWidth: "500px",
            display: "block",
            mx: "auto",
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
              backgroundColor: "#fff",
            },
          }}
        />

        {/* Lưới các ứng dụng */}
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
          {accessibleFunctions.map((func) => (
            // Bố cục responsive: 4 cột trên mobile (xs), 6 cột trên desktop (md)
            <Grid item key={func.title} xs={3} md={2}>
              <OdooAppButton
                title={func.title}
                icon={func.icon}
                onClick={() => navigate(func.path)}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );

  // --- RENDER GIAO DIỆN MARKETING KHI CHƯA ĐĂNG NHẬP ---
  const renderMarketingPage = () => (
    <Paper elevation={0} sx={{ py: 8 }}>
      <Container>
        <Grid container alignItems="center" spacing={4}>
          <Grid item md={7} xs={12}>
            <Typography
              variant="h2"
              component="h1"
              sx={{ fontWeight: "bold", mb: 2 }}
            >
              Movico Group
            </Typography>
            <Typography
              variant="h5"
              component="p"
              sx={{ mb: 4, color: "#155E64" }}
            >
              Nơi công nghệ gặp gỡ phong cách.
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: "550px", mb: 4 }}>
              Hệ thống quản lý kho vận thông minh, hiệu quả cho mọi ngành hàng.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/login")}
              sx={{
                backgroundColor: "#155E64",
                "&:hover": { backgroundColor: "#104c50" },
                px: 4,
                py: 1.5,
              }}
            >
              Đăng Nhập Hệ Thống
            </Button>
          </Grid>
          <Grid
            item
            md={5}
            xs={12}
            sx={{ textAlign: "center", display: { xs: "none", md: "block" } }}
          >
            <Box
              component="img"
              src="/images/287930.png"
              alt="Movico Group"
              sx={{ maxWidth: "100%", height: "auto" }}
            />
          </Grid>
        </Grid>
      </Container>
    </Paper>
  );
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Box
        component="main"
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        {userRole ? renderOdooStyleDashboard() : renderMarketingPage()}
      </Box>
      {!userRole && <Footer />}
    </Box>
  );
}
export default Landing;
