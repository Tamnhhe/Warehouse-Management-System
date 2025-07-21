//list
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import EditUserModal from "./EditUserModal";
import CreateEmployeeModal from "./CreateEmployeeModal";
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  Chip,
  Collapse,
  IconButton,
  InputAdornment,
  Tooltip,
  Stack,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Block as BlockIcon,
  Add as AddIcon,
  Search as SearchIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
  exit: { opacity: 0, x: -20 },
};

const UserTableRow = ({ user, index, handleUpdateStatus, setEditingUser }) => {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow
        component={motion.tr}
        variants={tableRowVariants}
        sx={{
          "&:nth-of-type(odd)": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <TableCell>{index + 1}</TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon
              sx={{
                color: user.profile.gender === "male" ? "#1976d2" : "#e91e63",
              }}
            />
            <Box>
              <Typography variant="body1" fontWeight="medium">
                {user.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.type === "fulltime" ? "Toàn thời gian" : "Bán thời gian"}
              </Typography>
              <br />
              <Chip
                size="small"
                label={
                  user.status === "active"
                    ? "Hoạt động"
                    : user.status === "banned"
                    ? "Đã bị ban"
                    : "Chưa xác thực"
                }
                color={
                  user.status === "active"
                    ? "success"
                    : user.status === "banned"
                    ? "error"
                    : "warning"
                }
                variant="outlined"
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
        </TableCell>
        <TableCell>{user.profile.gender === "male" ? "Nam" : "Nữ"}</TableCell>
        <TableCell>{user.account.email}</TableCell>
        <TableCell>{user.profile.phoneNumber}</TableCell>
        <TableCell>{user.profile.address}</TableCell>
        <TableCell align="right">
          <Typography fontWeight="medium">
            {Math.ceil(user.salary).toLocaleString("en-US")} VND
          </Typography>
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Chỉnh sửa thông tin">
              <span>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => setEditingUser(user)}
                  disabled={
                    user.status === "inactive" || user.status === "banned"
                  }
                  sx={{
                    opacity:
                      user.status === "inactive" || user.status === "banned"
                        ? 0.5
                        : 1,
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip
              title={
                user.status === "active"
                  ? "Ban người dùng"
                  : "Bỏ ban người dùng"
              }
            >
              <span>
                <IconButton
                  size="small"
                  color={user.status === "active" ? "error" : "success"}
                  onClick={() =>
                    handleUpdateStatus(
                      user._id,
                      user.status === "active" ? "banned" : "active"
                    )
                  }
                  disabled={user.status === "inactive"}
                >
                  {user.status === "active" ? (
                    <BlockIcon fontSize="small" />
                  ) : (
                    <CheckCircleIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Xem lịch làm việc">
              <IconButton
                size="small"
                color="info"
                onClick={() => setOpen(!open)}
              >
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ padding: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  component="span"
                  fontWeight="bold"
                >
                  Ngày làm việc:
                </Typography>{" "}
                {user.schedule.workDays
                  .map(
                    (day) =>
                      ({
                        Monday: "T2",
                        Tuesday: "T3",
                        Wednesday: "T4",
                        Thursday: "T5",
                        Friday: "T6",
                        Saturday: "T7",
                        Sunday: "CN",
                      }[day])
                  )
                  .join(", ")}
              </Box>
              <Typography
                variant="subtitle2"
                component="span"
                fontWeight="bold"
              >
                Ca làm việc:
              </Typography>{" "}
              {user.type === "parttime"
                ? user.schedule.shifts
                    .map(
                      (shift) =>
                        ({
                          Morning: "Sáng: 8:00 - 11:00",
                          Afternoon: "Chiều: 13:00 - 17:00",
                          Evening: "Tối: 17:00 - 21:00",
                        }[shift])
                    )
                    .join(", ")
                : "Từ 8:00AM tới 17:00PM"}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const ListAllUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState({
    "Hoạt động": false,
    "Chưa hoạt động": false,
    "Bị ban": false,
  });
  const [filterType, setFilterType] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:9999/users/get-all-user"
        );
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        setError("Không thể tải dữ liệu danh sách các người dùng.");
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:9999/users/banUser/${id}`, {
        status: newStatus,
      });
      const newUser = users.map((u) =>
        u._id === id ? { ...u, status: newStatus } : u
      );
      setUsers(newUser);
    } catch (error) {
      console.log("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  const handleFilterChange = (e) => {
    setFilterStatus({
      ...filterStatus,
      [e.target.name]: e.target.checked,
    });
  };

  const handleCreateEmployee = (newEmployee) => {
    setUsers([...users, newEmployee]);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.role !== "manager" &&
      user.fullName.toLowerCase().includes(search.toLowerCase()) &&
      (Object.values(filterStatus).some((value) => value)
        ? filterStatus[
            user.status === "active"
              ? "Hoạt động"
              : user.status === "banned"
              ? "Bị ban"
              : "Chưa hoạt động"
          ]
        : true) &&
      (filterType ? user.type === filterType : true)
  );

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{ p: { xs: 1, sm: 2, md: 3 }, mt: 2 }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        fontWeight="bold"
        sx={{ mb: 4, color: "#333" }}
      >
        Quản lý nhân viên
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          {/* Thanh công cụ và tìm kiếm */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
            sx={{ mb: 3 }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateModalOpen(true)}
              sx={{
                bgcolor: "#48C1A6",
                "&:hover": { bgcolor: "#3aa18a" },
              }}
            >
              Tạo nhân viên
            </Button>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              <TextField
                placeholder="Tìm kiếm nhân viên..."
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: "200px" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl size="small" sx={{ minWidth: "150px" }}>
                <InputLabel>Loại hợp đồng</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Loại hợp đồng"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="fulltime">Toàn thời gian</MenuItem>
                  <MenuItem value="parttime">Bán thời gian</MenuItem>
                </Select>
              </FormControl>

              <FormGroup row>
                {["Hoạt động", "Chưa hoạt động", "Bị ban"].map((status) => (
                  <FormControlLabel
                    key={status}
                    control={
                      <Checkbox
                        checked={filterStatus[status]}
                        onChange={handleFilterChange}
                        name={status}
                        size="small"
                      />
                    }
                    label={status}
                  />
                ))}
              </FormGroup>
            </Stack>
          </Stack>

          {/* Bảng dữ liệu */}
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: "calc(100vh - 280px)" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "#eafaf4" }}>
                      #
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "#eafaf4" }}>
                      Tên nhân viên
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "#eafaf4" }}>
                      Giới tính
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "#eafaf4" }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "#eafaf4" }}>
                      Số điện thoại
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "#eafaf4" }}>
                      Địa chỉ
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", bgcolor: "#eafaf4" }}
                      align="right"
                    >
                      Mức lương/1h
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "#eafaf4" }}>
                      Hành động
                    </TableCell>
                  </TableRow>
                </TableHead>
                <Box
                  component={motion.tbody}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Box sx={{ p: 3 }}>
                            <Typography>Đang tải dữ liệu...</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <UserTableRow
                          key={user._id}
                          user={user}
                          index={index}
                          handleUpdateStatus={handleUpdateStatus}
                          setEditingUser={setEditingUser}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Box sx={{ p: 3 }}>
                            <Typography>
                              Không tìm thấy người dùng nào
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </Box>
              </Table>
            </TableContainer>
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Tổng cộng: {filteredUsers.length} nhân viên
              </Typography>
            </Box>
          </Paper>
        </>
      )}

      {/* Edit User Modal */}
      <EditUserModal
        user={editingUser}
        closeModal={() => setEditingUser(null)}
        users={users}
        setUsers={setUsers}
      />

      {/* Create Employee Modal */}
      <CreateEmployeeModal
        open={createModalOpen}
        handleClose={() => setCreateModalOpen(false)}
        onCreateSuccess={handleCreateEmployee}
      />
    </Container>
  );
};

export default ListAllUsers;
