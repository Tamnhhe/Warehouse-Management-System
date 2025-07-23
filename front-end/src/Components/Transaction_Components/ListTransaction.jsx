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
  TextField,
  InputAdornment,
} from "@mui/material";
import { motion } from "framer-motion";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SyncLockIcon from "@mui/icons-material/SyncLock";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import useTransaction from "../../Hooks/useTransaction";
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

const ListTransaction = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterTransactionType, setFilterTransactionType] = useState("all");
  const [editedTransactions, setEditedTransactions] = useState(new Set());
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortByDateOrder, setSortByDateOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState([]);

  // New search and date filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  useEffect(() => {
    getAllTransactions();
  }, []);

  useEffect(() => {
    let updatedTransactions = [...transactions];

    // Filter by transaction type
    if (filterTransactionType !== "all") {
      updatedTransactions = updatedTransactions.filter(
        (t) => t.transactionType === filterTransactionType
      );
    }

    // Filter by status
    if (filterStatus.length > 0) {
      updatedTransactions = updatedTransactions.filter((t) =>
        filterStatus.includes(t.status)
      );
    }

    // Filter by search term (supplier name or branch name/receiver)
    if (searchTerm.trim()) {
      updatedTransactions = updatedTransactions.filter((t) => {
        const supplierName = t.supplier?.name?.toLowerCase() || "";
        const branchName = t.branch?.name?.toLowerCase() || "";
        const branchReceiver = t.branch?.receiver?.toLowerCase() || "";
        const searchLower = searchTerm.toLowerCase();

        return supplierName.includes(searchLower) ||
          branchName.includes(searchLower) ||
          branchReceiver.includes(searchLower);
      });
    }

    // Filter by date range
    if (startDate) {
      updatedTransactions = updatedTransactions.filter((t) => {
        const transactionDate = new Date(t.transactionDate);
        const filterStartDate = new Date(startDate);
        return transactionDate >= filterStartDate;
      });
    }

    if (endDate) {
      updatedTransactions = updatedTransactions.filter((t) => {
        const transactionDate = new Date(t.transactionDate);
        const filterEndDate = new Date(endDate);
        filterEndDate.setHours(23, 59, 59, 999); // Include the entire end date
        return transactionDate <= filterEndDate;
      });
    }

    setFilteredTransactions(updatedTransactions);
  }, [filterTransactionType, filterStatus, transactions, searchTerm, startDate, endDate]);

  const handleStatusFilterChange = (event) => {
    const { value, checked } = event.target;
    setFilterStatus((prev) => {
      const newFilterStatus = checked
        ? [...prev, value]
        : prev.filter((status) => status !== value);
      return newFilterStatus;
    });
  };

  const openStatusModal = (transaction) => {
    if (
      transaction.status !== "pending" ||
      editedTransactions.has(transaction._id)
    )
      return;
    setSelectedTransaction(transaction);
    setNewStatus(transaction.status);
    setShowModal(true);
  };

  const handleStatusChange = async () => {
    if (!selectedTransaction) return;
    const res = await updateTransactionStatus(selectedTransaction._id, { status: newStatus });
    if (res && res.status) {
      setEditedTransactions((prev) =>
        new Set(prev).add(selectedTransaction._id)
      );
      getAllTransactions(); // Refresh data
      setShowModal(false);
    }
  };

  const handleFilterChange = (event) =>
    setFilterTransactionType(event.target.value);

  const handleSortBySupplierOrBranch = () => {
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      const nameA = a.transactionType === "import"
        ? (a.supplier?.name || "")
        : (a.branch?.receiver || a.branch?.name || "");
      const nameB = b.transactionType === "import"
        ? (b.supplier?.name || "")
        : (b.branch?.receiver || b.branch?.name || "");

      return sortOrder === "asc"
        ? nameA.localeCompare(nameB, "vi")
        : nameB.localeCompare(nameA, "vi");
    });
    setFilteredTransactions(sortedTransactions);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleSortByDate = () => {
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      return sortByDateOrder === "asc"
        ? new Date(a.transactionDate || 0) - new Date(b.transactionDate || 0)
        : new Date(b.transactionDate || 0) - new Date(a.transactionDate || 0);
    });
    setFilteredTransactions(sortedTransactions);
    setSortByDateOrder(sortByDateOrder === "asc" ? "desc" : "asc");
  };

  const getEntityName = (transaction) => {
    if (transaction.transactionType === "import") {
      return transaction.supplier?.name || "Chưa có nhà cung cấp";
    } else {
      return transaction.branch?.receiver || transaction.branch?.name || "Chưa có người nhận";
    }
  };

  const calculateTransactionTotal = (transaction) => {
    if (transaction.transactionType === "import") {
      // Đối với phiếu nhập, sử dụng totalPrice có sẵn
      return transaction.totalPrice || 0;
    } else {
      // Đối với phiếu xuất, tính tổng từ products
      if (!transaction.products || transaction.products.length === 0) {
        return 0;
      }

      return transaction.products.reduce((total, product) => {
        // Ưu tiên exportPrice, nếu không có thì dùng price
        const price = typeof product.exportPrice === "number"
          ? product.exportPrice
          : (typeof product.price === "number" ? product.price : 0);
        const quantity = typeof product.requestQuantity === "number"
          ? product.requestQuantity
          : 0;
        return total + (price * quantity);
      }, 0);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setFilterStatus([]);
    setFilterTransactionType("all");
  };

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
        <Typography sx={{ ml: 2 }}>Đang tải dữ liệu...</Typography>
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
            <TableCell>#</TableCell>
            <TableCell>
              <TableSortLabel
                active={true}
                direction={sortOrder}
                onClick={handleSortBySupplierOrBranch}
              >
                Nhà cung cấp / Người nhận
              </TableSortLabel>
            </TableCell>
            <TableCell>Loại giao dịch</TableCell>
            <TableCell>
              <TableSortLabel
                active={true}
                direction={sortByDateOrder}
                onClick={handleSortByDate}
              >
                Ngày giao dịch
              </TableSortLabel>
            </TableCell>
            <TableCell>Tổng tiền</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell align="center">Hành động</TableCell>
          </TableRow>
        </TableHead>
        <motion.tbody
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction, index) => (
              <motion.tr
                key={transaction._id}
                variants={itemVariants}
                component={TableRow}
                hover
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {getEntityName(transaction)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {transaction.transactionType === "import" ? "Nhà cung cấp" : "Người nhận"}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={transaction.transactionType === "import" ? "Nhập" : "Xuất"}
                    color={transaction.transactionType === "import" ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {transaction.transactionDate
                    ? new Date(transaction.transactionDate).toLocaleDateString("vi-VN")
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {(() => {
                    const total = calculateTransactionTotal(transaction);
                    return total > 0 ? total.toLocaleString("vi-VN") + " VNĐ" : "N/A";
                  })()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(transaction.status)}
                    color={getStatusChipColor(transaction.status)}
                    size="small"
                    sx={{ cursor: transaction.status === "pending" && !editedTransactions.has(transaction._id) ? "pointer" : "default" }}
                    onClick={() => openStatusModal(transaction)}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    title="Xem chi tiết"
                    onClick={() =>
                      navigate(
                        transaction.transactionType === "import"
                          ? `/transaction/${transaction._id}`
                          : `/export-detail/${transaction._id}`
                      )
                    }
                    sx={{ color: palette.medium }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {transaction.transactionType === "import" && (
                    <IconButton
                      title="Rà soát"
                      onClick={() =>
                        navigate(`/edit-transaction/${transaction._id}`)
                      }
                      disabled={transaction.status !== "pending"}
                      sx={{ color: transaction.status === "pending" ? "warning.main" : "grey.400" }}
                    >
                      <EditNoteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </motion.tr>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                <Typography variant="body1">
                  Không có giao dịch nào
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
      {filteredTransactions.length > 0 ? (
        filteredTransactions.map((transaction) => (
          <motion.div key={transaction._id} variants={itemVariants}>
            <Card sx={{ mb: 2 }}>
              <CardHeader
                title={getEntityName(transaction)}
                subheader={
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {transaction.transactionType === "import" ? "Nhà cung cấp" : "Người nhận"}
                    </Typography>
                    <br />
                    <Typography variant="caption">
                      {transaction.transactionDate
                        ? new Date(transaction.transactionDate).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </Typography>
                  </Box>
                }
                action={
                  <Chip
                    label={transaction.transactionType === "import" ? "Nhập" : "Xuất"}
                    color={transaction.transactionType === "import" ? "success" : "error"}
                    size="small"
                  />
                }
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Tổng tiền:</strong>{" "}
                  <span style={{ color: palette.medium, fontWeight: "bold" }}>
                    {(() => {
                      const total = calculateTransactionTotal(transaction);
                      return total > 0 ? total.toLocaleString("vi-VN") + " VNĐ" : "N/A";
                    })()}
                  </span>
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Typography variant="body2"><strong>Trạng thái:</strong></Typography>
                  <Chip
                    label={getStatusLabel(transaction.status)}
                    color={getStatusChipColor(transaction.status)}
                    size="small"
                    sx={{ cursor: transaction.status === "pending" && !editedTransactions.has(transaction._id) ? "pointer" : "default" }}
                    onClick={() => openStatusModal(transaction)}
                  />
                </Box>
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
                  onClick={() =>
                    navigate(
                      transaction.transactionType === "import"
                        ? `/transaction/${transaction._id}`
                        : `/export-detail/${transaction._id}`
                    )
                  }
                  sx={{ color: palette.medium }}
                >
                  Xem chi tiết
                </Button>
                {transaction.transactionType === "import" && (
                  <Button
                    startIcon={<EditNoteIcon />}
                    onClick={() =>
                      navigate(`/edit-transaction/${transaction._id}`)
                    }
                    disabled={transaction.status !== "pending"}
                    color="warning"
                  >
                    Rà soát
                  </Button>
                )}
              </Box>
            </Card>
          </motion.div>
        ))
      ) : (
        <Card sx={{ mb: 2, p: 3, textAlign: "center" }}>
          <Typography variant="body1">Không có giao dịch nào</Typography>
        </Card>
      )}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: palette.dark,
          mb: 3,
          textAlign: "center",
        }}
      >
        Danh sách giao dịch
      </Typography>

      {/* Search and Date Filter */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm theo tên nhà cung cấp hoặc người nhận..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: palette.medium }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: palette.medium,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: palette.medium,
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Từ ngày"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayIcon sx={{ color: palette.medium, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Đến ngày"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayIcon sx={{ color: palette.medium, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Clear Filters Button */}
        {(searchTerm || startDate || endDate || filterStatus.length > 0 || filterTransactionType !== "all") && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              size="small"
              onClick={clearFilters}
              sx={{
                color: palette.medium,
                borderColor: palette.medium,
                "&:hover": {
                  borderColor: palette.dark,
                  color: palette.dark,
                },
              }}
            >
              Xóa bộ lọc
            </Button>
          </Box>
        )}
      </Card>

      {/* Filter Cards */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
              Loại giao dịch
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={filterTransactionType}
                onChange={handleFilterChange}
              >
                <FormControlLabel
                  value="all"
                  control={<Radio size="small" sx={{ "&.Mui-checked": { color: palette.medium } }} />}
                  label="Tất cả"
                />
                <FormControlLabel
                  value="import"
                  control={<Radio size="small" sx={{ "&.Mui-checked": { color: palette.medium } }} />}
                  label="Nhập hàng"
                />
                <FormControlLabel
                  value="export"
                  control={<Radio size="small" sx={{ "&.Mui-checked": { color: palette.medium } }} />}
                  label="Xuất hàng"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
              Trạng thái
            </Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    sx={{ "&.Mui-checked": { color: palette.medium } }}
                    value="pending"
                    checked={filterStatus.includes("pending")}
                    onChange={handleStatusFilterChange}
                  />
                }
                label="Chờ xử lý"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    sx={{ "&.Mui-checked": { color: palette.medium } }}
                    value="completed"
                    checked={filterStatus.includes("completed")}
                    onChange={handleStatusFilterChange}
                  />
                }
                label="Hoàn thành"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    sx={{ "&.Mui-checked": { color: palette.medium } }}
                    value="cancelled"
                    checked={filterStatus.includes("cancelled")}
                    onChange={handleStatusFilterChange}
                  />
                }
                label="Từ chối"
              />
            </FormGroup>
          </Grid>
        </Grid>
      </Card>

      {/* Results Summary */}
      {(searchTerm || startDate || endDate || filterStatus.length > 0 || filterTransactionType !== "all") && (
        <Card sx={{ mb: 3, p: 2, backgroundColor: `${palette.light}20` }}>
          <Typography variant="body2" color="text.secondary">
            Hiển thị <strong>{filteredTransactions.length}</strong> kết quả
            {searchTerm && ` cho "${searchTerm}"`}
            {startDate && ` từ ${new Date(startDate).toLocaleDateString("vi-VN")}`}
            {endDate && ` đến ${new Date(endDate).toLocaleDateString("vi-VN")}`}
          </Typography>
        </Card>
      )}

      {isMobile ? renderMobileView() : renderDesktopView()}

      {/* Status Update Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>Cập nhật trạng thái</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Giao dịch: <strong>{selectedTransaction?._id}</strong>
          </Typography>
          <FormControl component="fieldset">
            <FormLabel>Chọn trạng thái mới:</FormLabel>
            <RadioGroup
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              sx={{ mt: 1 }}
            >
              <FormControlLabel
                value="pending"
                control={<Radio sx={{ "&.Mui-checked": { color: palette.medium } }} />}
                label="🟡 Chờ xử lý"
              />
              <FormControlLabel
                value="completed"
                control={<Radio sx={{ "&.Mui-checked": { color: palette.medium } }} />}
                label="✅ Hoàn thành"
              />
              <FormControlLabel
                value="cancelled"
                control={<Radio sx={{ "&.Mui-checked": { color: palette.medium } }} />}
                label="❌ Từ chối"
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

export default ListTransaction;