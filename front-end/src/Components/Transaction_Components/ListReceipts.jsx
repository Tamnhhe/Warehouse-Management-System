import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  TableSortLabel,
  useTheme,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  RadioGroup,
  Radio,
  FormLabel,
} from "@mui/material";
import { motion } from "framer-motion";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SyncLockIcon from "@mui/icons-material/SyncLock";
import useTransaction from "../../Hooks/useTransaction";
import useAuth from "../../Hooks/useAuth"; // ✅ Thêm useAuth

const palette = {
  dark: "#155E64",
  medium: "#75B39C",
  light: "#A0E4D0",
};

const getStatusChipColor = (status) => {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

const ListReceipts = () => {
  const [sortByDateOrder, setSortByDateOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Use transaction custom hook
  const {
    transactions,
    loading,
    getAllTransactions,
    updateTransactionStatus,
  } = useTransaction();

  // ✅ Thêm useAuth để kiểm tra role
  const { user } = useAuth();
  const isManager = user?.role === "manager";

  useEffect(() => {
    getAllTransactions();
  }, []);

  const handleStatusFilterChange = (event) => {
    const { value, checked } = event.target;
    setFilterStatus((prev) =>
      checked ? [...prev, value] : prev.filter((status) => status !== value)
    );
  };

  const handleSortByDate = () =>
    setSortByDateOrder(sortByDateOrder === "asc" ? "desc" : "asc");

  const openStatusModal = (transaction) => {
    // ✅ CHỈ CHO PHÉP MANAGER THAO TÁC VỚI TRẠNG THÁI
    if (!isManager) return;
    if (transaction.status === "completed" || transaction.status === "cancelled") return;

    setSelectedTransaction(transaction);
    setNewStatus(transaction.status);
    setShowModal(true);
  };

  const handleStatusChange = async () => {
    if (!selectedTransaction || !newStatus) return;
    await updateTransactionStatus(selectedTransaction._id, { status: newStatus });
    getAllTransactions(); // Refresh data
    setShowModal(false);
  };

  const filteredAndSortedTransactions = transactions
    .filter((t) => t.transactionType === "import")
    .filter((t) => filterStatus.length === 0 || filterStatus.includes(t.status))
    .sort((a, b) => {
      const dateA = new Date(a.transactionDate);
      const dateB = new Date(b.transactionDate);
      return sortByDateOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress sx={{ color: palette.dark }} />
        <Typography sx={{ ml: 2 }}>Đang tải danh sách phiếu nhập...</Typography>
      </Box>
    );
  }

  const renderDesktopView = () => (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ "& .MuiTableCell-root": { fontWeight: "bold" } }}>
            <TableCell>Nhà cung cấp</TableCell>
            <TableCell>
              <TableSortLabel
                active={true}
                direction={sortByDateOrder}
                onClick={handleSortByDate}
              >
                Ngày giao dịch
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">Tổng tiền</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell align="center">Hành động</TableCell>
          </TableRow>
        </TableHead>
        <motion.tbody
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredAndSortedTransactions.map((transaction) => (
            <motion.tr
              key={transaction._id}
              variants={itemVariants}
              component={TableRow}
              hover
            >
              <TableCell>{transaction.supplier?.name || "N/A"}</TableCell>
              <TableCell>
                {new Date(transaction.transactionDate).toLocaleDateString()}
              </TableCell>
              <TableCell align="right">
                {transaction.totalPrice.toLocaleString()} VNĐ
              </TableCell>
              <TableCell>
                <Chip
                  label={transaction.status}
                  color={getStatusChipColor(transaction.status)}
                  size="small"
                  sx={{
                    textTransform: "capitalize",
                    cursor: (isManager && transaction.status === "pending") ? "pointer" : "default"
                  }}
                  onClick={() => openStatusModal(transaction)}
                />
                {/* ✅ THÊM: Hiển thị badge "Đã rà soát" nếu có reviewedBy */}
                {transaction.reviewedBy && (
                  <Chip
                    label={`Đã rà soát bởi ${transaction.reviewedBy.fullName}`}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{
                      ml: 1,
                      fontSize: '0.75rem',
                      height: '20px'
                    }}
                  />
                )}
              </TableCell>
              <TableCell align="center">
                <IconButton
                  title="Xem chi tiết"
                  onClick={() => navigate(`/transaction/${transaction._id}`)}
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  title="Rà soát đơn hàng"
                  disabled={transaction.status !== "pending"}
                  onClick={() =>
                    navigate(`/edit-transaction/${transaction._id}`)
                  }
                  sx={{
                    display: transaction.status === "cancelled" ? "none" : "inline-flex"
                  }}
                >
                  <EditNoteIcon />
                </IconButton>
                {/* ✅ CHỈ HIỂN THỊ NÚT ĐỔI TRẠNG THÁI CHO MANAGER */}
                {isManager && (
                  <IconButton
                    title="Thay đổi trạng thái"
                    onClick={() => openStatusModal(transaction)}
                    disabled={transaction.status === "completed" || transaction.status === "cancelled"}
                    sx={{
                      cursor: (transaction.status === "completed" || transaction.status === "cancelled") ? "not-allowed" : "pointer"
                    }}
                  >
                    <SyncLockIcon />
                  </IconButton>
                )}
              </TableCell>
            </motion.tr>
          ))}
        </motion.tbody>
      </Table>
    </TableContainer>
  );

  const renderMobileView = () => (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {filteredAndSortedTransactions.map((transaction) => (
        <motion.div key={transaction._id} variants={itemVariants}>
          <Card sx={{ mb: 2 }}>
            <CardHeader
              title={transaction.supplier?.name || "Giao dịch nhập"}
              subheader={new Date(
                transaction.transactionDate
              ).toLocaleDateString()}
              action={
                <Chip
                  label={transaction.status}
                  color={getStatusChipColor(transaction.status)}
                  size="small"
                  sx={{
                    textTransform: "capitalize",
                    cursor: (isManager && transaction.status === "pending") ? "pointer" : "default" // ✅ Chỉ cho cursor pointer với manager và pending
                  }}
                  onClick={() => openStatusModal(transaction)}
                />
              }
            />
            <CardContent>
              <Typography variant="h6" color="text.primary" align="right">
                {transaction.totalPrice.toLocaleString()} VNĐ
              </Typography>
              {/* ✅ THÊM: Hiển thị badge "Đã rà soát" trong mobile view */}
              {transaction.reviewedBy && (
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                  <Chip
                    label={`Đã rà soát bởi ${transaction.reviewedBy.fullName}`}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Box>
              )}
            </CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                p: 1,
                borderTop: "1px solid #eee",
              }}
            >
              <Button
                startIcon={<VisibilityIcon />}
                onClick={() => navigate(`/transaction/${transaction._id}`)}
              >
                Xem
              </Button>
              <Button
                startIcon={<EditNoteIcon />}
                disabled={transaction.status !== "pending"}
                onClick={() => navigate(`/edit-transaction/${transaction._id}`)}
              >
                Rà soát
              </Button>
              {/* ✅ CHỈ HIỂN THỊ NÚT ĐỔI TRẠNG THÁI CHO MANAGER */}
              {isManager && (
                <Button
                  startIcon={<SyncLockIcon />}
                  onClick={() => openStatusModal(transaction)}
                  disabled={transaction.status === "completed" || transaction.status === "cancelled"}
                >
                  Đổi trạng thái
                </Button>
              )}
            </Box>
          </Card>
        </motion.div>
      ))}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: "bold", color: palette.dark }}
        >
          Danh sách phiếu nhập
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/receipt/create")}
          sx={{ bgcolor: palette.dark, "&:hover": { bgcolor: "#104c50" } }}
        >
          Tạo phiếu nhập
        </Button>
      </Box>

      <Card sx={{ mb: 4, p: 2 }}>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                sx={{ "&.Mui-checked": { color: palette.dark } }}
                onChange={handleStatusFilterChange}
                value="pending"
              />
            }
            label="Chờ xử lý"
          />
          <FormControlLabel
            control={
              <Checkbox
                sx={{ "&.Mui-checked": { color: palette.dark } }}
                onChange={handleStatusFilterChange}
                value="completed"
              />
            }
            label="Hoàn thành"
          />
          <FormControlLabel
            control={
              <Checkbox
                sx={{ "&.Mui-checked": { color: palette.dark } }}
                onChange={handleStatusFilterChange}
                value="cancelled"
              />
            }
            label="Từ chối"
          />
        </FormGroup>
      </Card>

      {isMobile ? renderMobileView() : renderDesktopView()}

      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>Cập nhật trạng thái</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel>
              Chọn trạng thái mới cho đơn:{" "}
              <strong>{selectedTransaction?._id}</strong>
            </FormLabel>
            <RadioGroup
              row
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <FormControlLabel
                value="pending"
                control={<Radio />}
                label="Chờ xử lý"
                disabled
              />
              <FormControlLabel
                value="completed"
                control={<Radio />}
                label="Hoàn thành"
              />
              <FormControlLabel
                value="cancelled"
                control={<Radio />}
                label="Từ chối"
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Hủy</Button>
          <Button
            onClick={handleStatusChange}
            variant="contained"
            sx={{ bgcolor: palette.dark }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ListReceipts;
