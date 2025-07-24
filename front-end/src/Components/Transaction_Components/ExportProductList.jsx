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
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SyncLockIcon from "@mui/icons-material/SyncLock";
import useTransaction from "../../Hooks/useTransaction";
import useAuth from "../../Hooks/useAuth"; // ✅ Thêm useAuth
import palette from "../../Constants/palette";

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

const getStatusLabel = (status) => {
  switch (status) {
    case "completed":
      return "Hoàn thành";
    case "pending":
      return "Chờ xử lý";
    case "cancelled":
      return "Từ chối";
    default:
      return status;
  }
};

const ExportProductList = () => {
  const [sortByDateOrder, setSortByDateOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Use transaction custom hook
  const { transactions, loading, getAllTransactions, updateTransactionStatus } =
    useTransaction();

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

    setSelectedTransaction(transaction);
    setNewStatus(transaction.status);
    setShowModal(true);
  };

  const handleStatusChange = async () => {
    if (!selectedTransaction || !newStatus) return;
    await updateTransactionStatus(selectedTransaction._id, {
      status: newStatus,
    });
    getAllTransactions(); // Refresh data
    setShowModal(false);
  };

  const filteredAndSortedTransactions = transactions
    .filter((t) => t.transactionType === "export")
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
        <CircularProgress sx={{ color: palette.medium }} />
        <Typography sx={{ ml: 2 }}>
          Đang tải danh sách phiếu xuất kho...
        </Typography>
      </Box>
    );
  }

  const renderDesktopView = () => (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow
            sx={{
              "& .MuiTableCell-root": {
                fontWeight: "bold",
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            <TableCell>Chi nhánh</TableCell>
            <TableCell>
              <TableSortLabel
                active={true}
                direction={sortByDateOrder}
                onClick={handleSortByDate}
              >
                Ngày giao dịch
              </TableSortLabel>
            </TableCell>
            <TableCell>Số sản phẩm</TableCell>
            <TableCell>Giá trị phiếu xuất</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell align="center">Hành động</TableCell>
          </TableRow>
        </TableHead>
        <motion.tbody
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredAndSortedTransactions.length > 0 ? (
            filteredAndSortedTransactions.map((transaction) => {
              const totalExportPrice = transaction.products?.reduce(
                (sum, p) => sum + (p.price || 0) * (p.requestQuantity || 1),
                0
              );
              return (
                <motion.tr
                  key={transaction._id}
                  variants={itemVariants}
                  component={TableRow}
                  hover
                >
                  <TableCell>
                    {transaction.branch && typeof transaction.branch === "object"
                      ? `${transaction.branch.name} - ${transaction.branch.address}`
                      : "Không xác định"}
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.transactionDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {transaction.products?.length || 0} sản phẩm
                  </TableCell>
                  <TableCell>
                    {totalExportPrice?.toLocaleString("vi-VN")} VND
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(transaction.status)}
                      color={getStatusChipColor(transaction.status)}
                      size="small"
                      sx={{
                        cursor: isManager ? "pointer" : "default", // ✅ Chỉ cho cursor pointer với manager
                      }}
                      onClick={() => openStatusModal(transaction)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      title="Xem chi tiết"
                      onClick={() =>
                        navigate(`/export-detail/${transaction._id}`)
                      }
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {/* ✅ CHỈ HIỂN THỊ NÚT ĐỔI TRẠNG THÁI CHO MANAGER */}
                    {isManager && (
                      <IconButton
                        title="Thay đổi trạng thái"
                        onClick={() => openStatusModal(transaction)}
                        color="primary"
                      >
                        <SyncLockIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </motion.tr>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                <Typography variant="body1">
                  Không có phiếu xuất kho nào
                </Typography>
              </TableCell>
            </TableRow>
          )}
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
      {filteredAndSortedTransactions.length > 0 ? (
        filteredAndSortedTransactions.map((transaction) => {
          const totalExportPrice = transaction.products?.reduce(
            (sum, p) => sum + (p.price || 0) * (p.requestQuantity || 1),
            0
          );
          return (
            <motion.div key={transaction._id} variants={itemVariants}>
              <Card sx={{ mb: 2 }}>
                <CardHeader
                  title={`Phiếu #${transaction._id.slice(-6)}`}
                  subheader={`${transaction.branch || "Không xác định"
                    } - ${new Date(
                      transaction.transactionDate
                    ).toLocaleDateString()}`}
                  action={
                    <Chip
                      label={getStatusLabel(transaction.status)}
                      color={getStatusChipColor(transaction.status)}
                      size="small"
                      sx={{
                        cursor: isManager ? "pointer" : "default", // ✅ Chỉ cho cursor pointer với manager
                      }}
                      onClick={() => openStatusModal(transaction)}
                    />
                  }
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Số lượng sản phẩm: {transaction.products?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    Giá trị phiếu xuất: {totalExportPrice?.toLocaleString("vi-VN")} VND
                  </Typography>
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
                    onClick={() => navigate(`/export-detail/${transaction._id}`)}
                  >
                    Xem chi tiết
                  </Button>
                  {/* ✅ CHỈ HIỂN THỊ NÚT ĐỔI TRẠNG THÁI CHO MANAGER */}
                  {isManager && (
                    <Button
                      startIcon={<SyncLockIcon />}
                      onClick={() => openStatusModal(transaction)}
                      color="primary"
                    >
                      Đổi trạng thái
                    </Button>
                  )}
                </Box>
              </Card>
            </motion.div>
          );
        })
      ) : (
        <Card sx={{ mb: 2, p: 3, textAlign: "center" }}>
          <Typography variant="body1">Không có phiếu xuất kho nào</Typography>
        </Card>
      )}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: palette.dark,
            m: { xs: 0, md: 0 },
          }}
        >
          Danh sách phiếu xuất kho
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/export-product")}
          startIcon={<AddIcon />}
          sx={{
            bgcolor: palette.medium,
            "&:hover": { bgcolor: palette.dark },
            whiteSpace: "nowrap",
          }}
        >
          Tạo phiếu xuất
        </Button>
      </Stack>

      <Card sx={{ mb: 4, p: 2 }}>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                sx={{ "&.Mui-checked": { color: palette.medium } }}
                onChange={handleStatusFilterChange}
                value="pending"
              />
            }
            label="Chờ xử lý"
          />
          <FormControlLabel
            control={
              <Checkbox
                sx={{ "&.Mui-checked": { color: palette.medium } }}
                onChange={handleStatusFilterChange}
                value="completed"
              />
            }
            label="Hoàn thành"
          />
          <FormControlLabel
            control={
              <Checkbox
                sx={{ "&.Mui-checked": { color: palette.medium } }}
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
        <DialogTitle>Cập nhật trạng thái phiếu xuất</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel>
              Chọn trạng thái mới cho phiếu:{" "}
              <strong>{selectedTransaction?._id}</strong>
            </FormLabel>
            <RadioGroup
              row
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <FormControlLabel
                value="pending"
                control={
                  <Radio sx={{ "&.Mui-checked": { color: palette.medium } }} />
                }
                label="Chờ xử lý"
              />
              <FormControlLabel
                value="completed"
                control={
                  <Radio sx={{ "&.Mui-checked": { color: palette.medium } }} />
                }
                label="Hoàn thành"
              />
              <FormControlLabel
                value="cancelled"
                control={
                  <Radio sx={{ "&.Mui-checked": { color: palette.medium } }} />
                }
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
            sx={{
              bgcolor: palette.medium,
              "&:hover": { bgcolor: palette.dark },
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExportProductList;
