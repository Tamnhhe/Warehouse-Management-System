// Header.js

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// MUI Imports (Thêm các import cần thiết cho responsive)
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Menu,
  MenuItem,
  Avatar,
  IconButton,
  Tooltip,
  useTheme, // Để truy cập theme mặc định của MUI
  useMediaQuery, // Để check kích thước màn hình
  Drawer, // Menu trượt ra ở giao diện mobile
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuIcon from "@mui/icons-material/Menu"; // Icon Hamburger
import useUser from "../../Hooks/useUser";
// Bảng màu của bạn
const palette = {
  dark: "#155E64",
  medium: "#75B39C",
  light: "#A0E4D0",
  white: "#FFFFFF",
  black: "#000000",
};

const navButtonHoverStyle = {
  "&:hover": {
    backgroundColor: palette.dark,
    color: palette.white,
  },
};

const getUserRole = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;
  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.role;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentToken = localStorage.getItem("authToken");
  const userRole = getUserRole();
  const isHomePage = location.pathname === "/";
  // --- STATE MANAGEMENT ---
  const [profile, setProfile] = useState(null);
  const [transactionMenuAnchor, setTransactionMenuAnchor] = useState(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [partnerMenuAnchor, setPartnerMenuAnchor] = useState(null);

  // <-- KHU VỰC THAY ĐỔI: State cho mobile drawer -->
  const [mobileOpen, setMobileOpen] = useState(false);

  // <-- KHU VỰC THAY ĐỔI: Hooks để check màn hình mobile -->
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // true nếu màn hình < 900px

  const { getProfile } = useUser();
  useEffect(() => {
    getProfile().then((data) => {
      setProfile(data);
    });
  }, [currentToken]);

  // --- HANDLERS ---
  const handleTransactionMenuClick = (event) =>
    setTransactionMenuAnchor(event.currentTarget);
  const handleTransactionMenuClose = () => setTransactionMenuAnchor(null);
  const handleProfileMenuOpen = (event) =>
    setProfileMenuAnchor(event.currentTarget);
  const handleProfileMenuClose = () => setProfileMenuAnchor(null);
  const handlePartnerMenuClick = (event) =>
    setPartnerMenuAnchor(event.currentTarget);
  const handlePartnerMenuClose = () => setPartnerMenuAnchor(null);

  // <-- KHU VỰC THAY ĐỔI: Handler cho mobile drawer -->
  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleTransactionMenuClose();
    handleProfileMenuClose();
    handlePartnerMenuClose();
    // Đảm bảo drawer cũng đóng lại khi điều hướng
    if (mobileOpen) {
      handleDrawerToggle();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setProfile(null);
    handleProfileMenuClose();
    navigate("/login");
  };

  const avatarUrl = profile?.profile?.avatar
    ? `http://localhost:9999${profile.profile.avatar}`
    : "/images/avatar/default.png";

  // --- NAVIGATION ITEMS ---
  const navItems = [
    { label: "Thống kê", path: "/dashboard", allowedRoles: ["manager"] },
    {
      label: "Sản phẩm",
      path: "/product",
      allowedRoles: ["manager", "employee"],
    },
    { label: "Danh mục", path: "/category", allowedRoles: ["manager"] },
    {
      label: "Nhân viên",
      path: "/manager/get-all-user",
      allowedRoles: ["manager"],
    },
    {
      label: "Kiểm kê",
      path: "/stocktaking",
      allowedRoles: ["manager", "employee"],
    },
    {
      label: "Kệ hàng",
      path: "/inventory-check",
      allowedRoles: ["manager", "employee"],
    },
    {
      label: "Sơ đồ kho",
      path: "/warehouse",
      allowedRoles: ["manager", "employee"],
    },
  ];

  const partnerMenuItems = [
    {
      label: "Nhà cung cấp",
      path: "/get-list-suppliers",
      allowedRoles: ["manager", "employee"],
    },
    {
      label: "Quản lý Nhà cung cấp - Sản phẩm",
      path: "/manager/manage-supplier-products",
      allowedRoles: ["manager"],
    },
    {
      label: "Khách hàng",
      path: "/listcustomer",
      allowedRoles: ["manager", "employee"],
    },
  ];

  const transactionMenuItems = [
    { label: "Phiếu Nhập Kho", path: "/receipts", allowedRoles: ["manager"] },
    {
      label: "Xuất Kho",
      path: "/export",
      allowedRoles: ["manager", "employee"],
    },
    {
      label: "Danh Sách Giao Dịch",
      path: "/list-transaction",
      allowedRoles: ["manager"],
    },
  ];

  const visibleNavItems = navItems.filter(
    (item) => userRole && item.allowedRoles.includes(userRole)
  );
  const visiblePartnerItems = partnerMenuItems.filter(
    (item) => userRole && item.allowedRoles.includes(userRole)
  );
  const visibleTransactionItems = transactionMenuItems.filter(
    (item) => userRole && item.allowedRoles.includes(userRole)
  );

  // <-- KHU VỰC THAY ĐỔI LỚN: Nội dung cho Drawer trên mobile -->
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2, color: palette.dark }}>
        Movico Group
      </Typography>
      <Divider />
      <List>
        {/* Kết hợp tất cả các mục điều hướng vào một danh sách */}
        {visibleNavItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              sx={{ textAlign: "left" }}
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        {visiblePartnerItems.length > 0 && <Divider>Đối tác</Divider>}
        {visiblePartnerItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              sx={{ textAlign: "left" }}
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        {visibleTransactionItems.length > 0 && <Divider>Giao dịch</Divider>}
        {visibleTransactionItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              sx={{ textAlign: "left" }}
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          top: 0,
          zIndex: 1100,
          backgroundColor: palette.medium,
          color: palette.white,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* --- Giao diện Mobile: Icon Hamburger --- */}
            {isMobile && currentToken && !isHomePage && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* --- Logo (Căn giữa trên mobile) --- */}
            <Typography
              variant="h6"
              onClick={() => navigate(userRole ? "/" : "/login")}
              sx={{
                fontWeight: "bold",
                cursor: "pointer",
                "&:hover": { opacity: 0.9 },
                flexGrow: isMobile ? 1 : 0, // Đẩy logo ra giữa trên mobile
                textAlign: isMobile ? "center" : "left",
              }}
            >
              Movico Group
            </Typography>

            {/* --- Giao diện Desktop: Các nút điều hướng --- */}
            {!isMobile && currentToken && !isHomePage && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, ml: 3 }}
              >
                {visibleNavItems.map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    onClick={() => navigate(item.path)}
                    sx={navButtonHoverStyle}
                  >
                    {item.label}
                  </Button>
                ))}

                {visiblePartnerItems.length > 0 && (
                  <>
                    <Button
                      color="inherit"
                      onClick={handlePartnerMenuClick}
                      endIcon={<ArrowDropDownIcon />}
                      sx={navButtonHoverStyle}
                    >
                      Đối tác
                    </Button>
                    <Menu
                      anchorEl={partnerMenuAnchor}
                      open={Boolean(partnerMenuAnchor)}
                      onClose={handlePartnerMenuClose}
                    >
                      {visiblePartnerItems.map((item) => (
                        <MenuItem
                          key={item.path}
                          onClick={() => handleNavigate(item.path)}
                        >
                          {item.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                )}

                {visibleTransactionItems.length > 0 && (
                  <>
                    <Button
                      color="inherit"
                      onClick={handleTransactionMenuClick}
                      endIcon={<ArrowDropDownIcon />}
                      sx={navButtonHoverStyle}
                    >
                      Giao Dịch
                    </Button>
                    <Menu
                      anchorEl={transactionMenuAnchor}
                      open={Boolean(transactionMenuAnchor)}
                      onClose={handleTransactionMenuClose}
                    >
                      {visibleTransactionItems.map((item) => (
                        <MenuItem
                          key={item.path}
                          onClick={() => handleNavigate(item.path)}
                        >
                          {item.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                )}
              </Box>
            )}

            {/* --- Box này để đẩy phần Profile/Login sang phảiสุด --- */}
            {!isMobile && <Box sx={{ flexGrow: 1 }} />}

            {/* --- Profile Avatar / Nút Login --- */}
            <Box>
              {currentToken ? (
                <>
                  <Tooltip title="Thông báo">
                    <IconButton color="inherit" aria-label="show notifications">
                      <Badge badgeContent={4} color="error">
                        <NotificationsIcon
                          sx={{ color: isHomePage ? "action" : "inherit" }}
                        />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={profile?.fullName || "Tài khoản"}>
                    <IconButton
                      onClick={handleProfileMenuOpen}
                      sx={{ p: 0.5, borderRadius: "8px" }}
                    >
                      <Avatar
                        alt={profile?.fullName}
                        src={avatarUrl}
                        sx={{ width: 32, height: 32 }}
                      />
                      <ArrowDropDownIcon sx={{ color: palette.white }} />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: "45px" }}
                    anchorEl={profileMenuAnchor}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    open={Boolean(profileMenuAnchor)}
                    onClose={handleProfileMenuClose}
                  >
                    <MenuItem onClick={() => handleNavigate("/view-profile")}>
                      Tài khoản
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: "flex" }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: palette.dark,
                      "&:hover": { backgroundColor: "#104c50" },
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                    onClick={() => navigate("/login")}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/register")}
                    sx={{
                      ml: { xs: 1, sm: 2 },
                      color: palette.white,
                      borderColor: palette.white,
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    Đăng ký
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* --- Drawer cho Mobile --- */}
      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} // Cải thiện SEO và performance trên mobile
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </>
  );
}

export default Header;
