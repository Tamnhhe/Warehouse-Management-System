import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// MUI Imports
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
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// Bảng màu của bạn
const palette = {
  dark: '#155E64',
  medium: '#75B39C',
  light: '#A0E4D0',
  white: '#FFFFFF',
  black: '#000000'
};

const navButtonHoverStyle = {
  '&:hover': {
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
  const currentToken = localStorage.getItem("authToken");
  const userRole = getUserRole();

  const [profile, setProfile] = useState(null);
  const [transactionMenuAnchor, setTransactionMenuAnchor] = useState(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentToken) {
        try {
          const response = await axios.get("http://localhost:9999/users/view-profile", {
            headers: { Authorization: currentToken },
          });
          setProfile(response.data);
        } catch (err) {
          console.error("Không thể tải thông tin người dùng cho header:", err);
        }
      }
    };

    fetchProfile();
  }, [currentToken]);

  const handleTransactionMenuClick = (event) => setTransactionMenuAnchor(event.currentTarget);
  const handleTransactionMenuClose = () => setTransactionMenuAnchor(null);
  const handleProfileMenuOpen = (event) => setProfileMenuAnchor(event.currentTarget);
  const handleProfileMenuClose = () => setProfileMenuAnchor(null);

  const handleNavigate = (path) => {
    navigate(path);
    handleTransactionMenuClose();
    handleProfileMenuClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setProfile(null);
    navigate("/login");
  };
  
  const avatarUrl = profile?.profile?.avatar
    ? `http://localhost:9999${profile.profile.avatar}`
    : "/images/avatar/default.png";

  const navItems = [
    { label: 'Thống kê', path: '/dashboard', allowedRoles: ['manager'] },
    { label: 'Sản phẩm', path: '/product', allowedRoles: ['manager', 'employee'] },
    { label: 'Danh mục', path: '/category', allowedRoles: ['manager'] },
    { label: 'Nhân viên', path: '/manager/get-all-user', allowedRoles: ['manager'] },
    { label: 'Nhà cung cấp', path: '/get-list-suppliers', allowedRoles: ['manager', 'employee'] },
  ];

  const transactionMenuItems = [
    { label: 'Nhập Kho', path: '/create-receipt', allowedRoles: ['manager'] },
    { label: 'Xuất Kho', path: '/export', allowedRoles: ['manager', 'employee'] },
    { label: 'Danh Sách Giao Dịch', path: '/list-transaction', allowedRoles: ['manager'] },
  ];
  
  const visibleTransactionItems = transactionMenuItems.filter(item =>
    userRole && item.allowedRoles.includes(userRole)
  );

  return (
    <AppBar position="sticky" sx={{ top: 0, zIndex: 1100, backgroundColor: palette.medium, color: palette.white }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" onClick={() => navigate(userRole === 'manager' ? "/" : "/product")} sx={{ fontWeight: "bold", cursor: "pointer", "&:hover": { opacity: 0.9 } }}>
            Movico Group
          </Typography>

          {currentToken && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {navItems.map((item) =>
                userRole && item.allowedRoles.includes(userRole) && (
                  <Button key={item.path} color="inherit" onClick={() => navigate(item.path)} sx={navButtonHoverStyle}>
                    {item.label}
                  </Button>
                )
              )}

              {visibleTransactionItems.length > 0 && (
                <>
                  <Button color="inherit" onClick={handleTransactionMenuClick} endIcon={<ArrowDropDownIcon />} sx={navButtonHoverStyle}>
                    Giao Dịch
                  </Button>
                  <Menu anchorEl={transactionMenuAnchor} open={Boolean(transactionMenuAnchor)} onClose={handleTransactionMenuClose} PaperProps={{ sx: { mt: 1.5 } }}>
                    {visibleTransactionItems.map(item => (
                       <MenuItem key={item.path} onClick={() => handleNavigate(item.path)} sx={{ color: palette.dark, '&:hover': { backgroundColor: palette.light, color: palette.black }}}>
                         {item.label}
                       </MenuItem>
                    ))}
                  </Menu>
                </>
              )}
            </Box>
          )}
          <Box>
            {currentToken ? (
              // Nếu đã đăng nhập, hiển thị avatar
              <>
                <Tooltip title={profile?.fullName || "Tài khoản"}>
                  <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
                    <Avatar alt={profile?.fullName} src={avatarUrl} />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  anchorEl={profileMenuAnchor}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  keepMounted
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  open={Boolean(profileMenuAnchor)}
                  onClose={handleProfileMenuClose}
                >
                  <MenuItem onClick={() => handleNavigate('/view-profile')}>
                    <Typography textAlign="center">Tài khoản</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">Đăng xuất</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              // <-- KHU VỰC ĐÃ THAY ĐỔI
              // Nếu chưa đăng nhập, hiển thị nút Đăng nhập và Đăng ký
              <>
                <Button variant="contained" sx={{ backgroundColor: palette.dark, '&:hover': { backgroundColor: '#104c50' } }} onClick={() => navigate("/login")}>
                  Đăng nhập
                </Button>
                
                {/* <-- NÚT ĐĂNG KÝ MỚI */}
                <Button
                  variant="outlined"
                  onClick={() => navigate("/register")}
                  sx={{
                    ml: 2, // Tạo khoảng cách với nút Đăng nhập
                    color: palette.white,
                    borderColor: palette.white,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: palette.white,
                    }
                  }}
                >
                  Đăng ký
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;