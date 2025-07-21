import React, { useState, useEffect } from "react";
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
  Avatar,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

// Icons cho các chức năng
import Inventory2Icon from "@mui/icons-material/Inventory2";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import OutputIcon from "@mui/icons-material/Output";
import BadgeIcon from "@mui/icons-material/Badge";
import HandshakeIcon from "@mui/icons-material/Handshake";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import CategoryIcon from "@mui/icons-material/Category";
import ViewListIcon from "@mui/icons-material/ViewList";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import GridViewIcon from "@mui/icons-material/GridView";
import PeopleIcon from "@mui/icons-material/People";
import Header from "./Header";
import Footer from "./Footer";
import useUser from "../../Hooks/useUser";

// Màu sắc chính
const palette = {
  dark: "#155E64",
  medium: "#75B39C",
  light: "#A0E4D0",
  white: "#FFFFFF",
  black: "#000000",
  purple: "#6a11cb",
  blue: "#2575fc",
};

// --- DỮ LIỆU CHỨC NĂNG ---
const mainFunctions = [
  {
    title: "Sản phẩm",
    icon: <Inventory2Icon />,
    path: "/product",
    allowedRoles: ["manager", "employee"],
  },
  {
    title: "Thống kê",
    icon: <AnalyticsIcon />,
    path: "/dashboard",
    allowedRoles: ["manager", "employee"],
  },
  {
    title: "Nhập hàng",
    icon: <MoveToInboxIcon />,
    path: "/receipt/create",
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
    title: "Nhà cung cấp",
    icon: <HandshakeIcon />,
    path: "/get-list-suppliers",
    allowedRoles: ["manager", "employee"],
  },
  {
    title: "Kiểm kê",
    icon: <FactCheckIcon />,
    path: "/stocktaking",
    allowedRoles: ["manager", "employee"],
  },
  {
    title: "Kệ hàng",
    icon: <GridViewIcon />,
    path: "/inventory-check",
    allowedRoles: ["manager", "employee"],
  },
  {
    title: "Danh mục",
    icon: <CategoryIcon />,
    path: "/category",
    allowedRoles: ["manager"],
  },
  {
    title: "Giao dịch",
    icon: <ViewListIcon />,
    path: "/list-transaction",
    allowedRoles: ["manager"],
  },
  {
    title: "Khách hàng",
    icon: <PeopleIcon />,
    path: "/listcustomer",
    allowedRoles: ["manager", "employee"],
  },
  {
    title: "Sơ đồ kho",
    icon: <WarehouseIcon />,
    path: "/warehouse",
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
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          transform: "translateY(-3px)",
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
          boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
          color: "#155E64", // Màu icon từ palette
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: { xs: 32, md: 40 } } })}
      </Box>
      <Typography
        variant="body2"
        sx={{
          fontWeight: "500",
          color: "#fff",
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
  const [searchTerm, setSearchTerm] = useState("");
  const [profile, setProfile] = useState(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const { getProfile } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      getProfile().then((data) => {
        setProfile(data);
      });
    }
  }, []);

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleProfileMenuClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setProfile(null);
    handleProfileMenuClose();
    navigate("/login");
  };

  const accessibleFunctions = mainFunctions
    .filter((func) => userRole && func.allowedRoles.includes(userRole))
    .filter((func) =>
      func.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const avatarUrl = profile?.profile?.avatar
    ? `http://localhost:9999${profile.profile.avatar}`
    : "/images/avatar/default.png";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #155E64 0%, #2575fc 100%)",
        pt: 2,
        pb: 6,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at center, transparent 10%, rgba(255,255,255,0.1) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        {/* User Profile Card */}
        {profile && (
          <Box
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Tooltip title={profile?.fullName || "Tài khoản"}>
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{
                  p: 0.5,
                  borderRadius: "8px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.2)",
                  },
                }}
              >
                <Avatar
                  src={avatarUrl}
                  alt={profile.fullName}
                  sx={{
                    width: 40,
                    height: 40,
                  }}
                />
                <Box sx={{ ml: 1, textAlign: "left" }}>
                  <Typography variant="body2" fontWeight="bold" color="white">
                    {profile.fullName}
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.8)">
                    {userRole === "manager" ? "Quản lý" : "Nhân viên"}
                  </Typography>
                </Box>
                <ArrowDropDownIcon sx={{ color: "white", ml: 1 }} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              anchorEl={profileMenuAnchor}
              anchorOrigin={{ vertical: "top", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(profileMenuAnchor)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem onClick={() => handleNavigate("/view-profile")}>
                Tài khoản
              </MenuItem>
              <MenuItem onClick={() => handleNavigate("/change-password")}>
                Đổi mật khẩu
              </MenuItem>
              <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
            </Menu>
          </Box>
        )}

        {/* Title and Search */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            component="h1"
            color="white"
            fontWeight="bold"
            sx={{
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              mb: 3,
            }}
          >
            Hệ thống quản lý kho
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Tìm kiếm chức năng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "rgba(255,255,255,0.8)" }} />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: "16px",
                color: "white",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.5)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "white",
                },
                "& input::placeholder": {
                  color: "rgba(255,255,255,0.7)",
                  opacity: 1,
                },
                "& input": {
                  color: "white",
                },
              },
            }}
            sx={{
              maxWidth: "500px",
              mx: "auto",
              mb: 4,
            }}
          />
        </Box>

        {/* Functions Grid */}
        <Grid
          container
          spacing={{ xs: 1, sm: 2, md: 3 }}
          justifyContent="center"
        >
          {accessibleFunctions.map((func) => (
            <Grid item key={func.title} xs={3} sm={3} md={2}>
              <OdooAppButton
                title={func.title}
                icon={func.icon}
                onClick={() => navigate(func.path)}
              />
            </Grid>
          ))}
        </Grid>

        {/* No functions found message */}
        {accessibleFunctions.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 5 }}>
            <Typography variant="h5" color="white">
              Không tìm thấy chức năng phù hợp
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default Landing;
