import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Snackbar,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getInventories,
  getStocktakingHistory,
  getStocktakingDetail,
  createPendingStocktaking,
  updateStocktaking,
  createAdjustment,
  deleteStocktakingTask,
} from "../../API/stocktakingAPI";
import useAuth from "../../Hooks/useAuth";

function Stocktaking() {
  const { user, loading: authLoading, getCurrentUser } = useAuth();
  const [inventories, setInventories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);

  // Thêm state cho loại kiểm kê
  const [stocktakingType, setStocktakingType] = useState("single"); // "single" hoặc "warehouse"
  const [selectedInventories, setSelectedInventories] = useState([]); // Cho kiểm kê toàn bộ kho
  const [createInventoryId, setCreateInventoryId] = useState("");
  const [createProducts, setCreateProducts] = useState([]);
  const [createProductIds, setCreateProductIds] = useState([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [openTask, setOpenTask] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [actualQuantities, setActualQuantities] = useState({});
  const [productNotes, setProductNotes] = useState({});
  const [adjustmentResult, setAdjustmentResult] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Thêm state cho dialog xác nhận xóa
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchInventories = useCallback(async () => {
    try {
      const data = await getInventories();
      setInventories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách kệ:", err);
      setInventories([]);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await getStocktakingHistory();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi khi lấy lịch sử kiểm kê:", err);
      setTasks([]);
    }
  }, []);

  // Khởi tạo dữ liệu chỉ chạy một lần
  useEffect(() => {
    const initializeData = async () => {
      setPageLoading(true);
      try {
        // Đảm bảo chúng ta có thông tin người dùng
        if (!user && localStorage.getItem("authToken")) {
          await getCurrentUser();
        }
        await Promise.all([fetchInventories(), fetchTasks()]);
        setInitialized(true);
      } catch (err) {
        console.error("Lỗi khi khởi tạo dữ liệu:", err);
      } finally {
        setPageLoading(false);
      }
    };

    if (!initialized) {
      initializeData();
    }
  }, [initialized, getCurrentUser, fetchInventories, fetchTasks, user]);

  // Kiểm tra đăng nhập - chỉ chạy khi authLoading hoặc user thay đổi
  useEffect(() => {
    if (!authLoading && !user && !localStorage.getItem("authToken")) {
      setErrorMessage("Vui lòng đăng nhập trước khi kiểm kê kho");
    } else if (user) {
      setErrorMessage("");
    }
  }, [user, authLoading]);

  // Tạo phiếu kiểm kê mới
  const handleOpenCreate = () => {
    // Kiểm tra nếu người dùng chưa đăng nhập
    if (!user || !user._id) {
      setErrorMessage("Vui lòng đăng nhập trước khi kiểm kê kho");
      return;
    }

    // Reset states
    setStocktakingType("single");
    setSelectedInventories([]);
    setCreateInventoryId("");
    setCreateProducts([]);
    setCreateProductIds([]);
    setErrorMessage("");
    setOpenCreate(true);
  };

  // Xử lý thay đổi loại kiểm kê
  const handleStocktakingTypeChange = (event) => {
    const type = event.target.value;
    setStocktakingType(type);

    if (type === "warehouse") {
      // Khi chọn kiểm kê toàn bộ kho, tự động chọn tất cả kệ
      setSelectedInventories(inventories.map(inv => inv._id));

      // Lấy tất cả sản phẩm từ tất cả kệ
      const allProducts = [];
      const allProductIds = [];
      inventories.forEach(inv => {
        if (inv.products && inv.products.length > 0) {
          inv.products.forEach(prod => {
            if (!allProductIds.includes(prod.productId)) {
              allProducts.push(prod);
              allProductIds.push(prod.productId);
            }
          });
        }
      });
      setCreateProducts(allProducts);
      setCreateProductIds(allProductIds);
    } else {
      // Reset về chế độ chọn từng kệ
      setSelectedInventories([]);
      setCreateInventoryId("");
      setCreateProducts([]);
      setCreateProductIds([]);
    }
  };

  const handleSelectCreateInventory = (id) => {
    setCreateInventoryId(id);
    const inv = inventories.find((i) => i._id === id);
    setCreateProducts(inv?.products || []);
    setCreateProductIds([]);
  };

  const handleToggleProduct = (id) => {
    setCreateProductIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // Hàm chọn tất cả sản phẩm trong kệ hiện tại
  const handleSelectAllProducts = () => {
    if (createProductIds.length === createProducts.length) {
      // Nếu đã chọn tất cả, bỏ chọn tất cả
      setCreateProductIds([]);
    } else {
      // Chọn tất cả sản phẩm
      setCreateProductIds(createProducts.map(prod => prod.productId));
    }
  };

  const handleSubmitCreate = async () => {
    setCreateLoading(true);
    setErrorMessage("");

    try {
      // Kiểm tra người dùng có đăng nhập không
      if (!user || !user._id) {
        setErrorMessage("Vui lòng đăng nhập trước khi kiểm kê kho");
        setCreateLoading(false);
        return;
      }

      if (stocktakingType === "warehouse") {
        // Kiểm kê toàn bộ kho - tạo nhiều phiếu kiểm kê
        if (selectedInventories.length === 0) {
          setErrorMessage("Không có kệ nào để kiểm kê");
          setCreateLoading(false);
          return;
        }

        const results = [];
        for (const inventoryId of selectedInventories) {
          const inv = inventories.find(i => i._id === inventoryId);
          if (inv && inv.products && inv.products.length > 0) {
            const productIds = inv.products.map(prod => prod.productId);

            const data = {
              inventoryId: inventoryId,
              productIds: productIds,
              auditor: user._id,
            };

            try {
              const result = await createPendingStocktaking(data);
              results.push(result);
            } catch (err) {
              console.error(`Lỗi tạo phiếu kiểm kê cho kệ ${inv.name}:`, err);
            }
          }
        }

        if (results.length > 0) {
          setSuccessMessage(`Đã tạo thành công ${results.length} phiếu kiểm kê cho toàn bộ kho!`);
        } else {
          setErrorMessage("Không thể tạo phiếu kiểm kê nào");
        }
      } else {
        // Kiểm kê từng kệ - logic cũ
        if (!createInventoryId) {
          setErrorMessage("Vui lòng chọn kệ");
          setCreateLoading(false);
          return;
        }
        if (createProductIds.length === 0) {
          setErrorMessage("Vui lòng chọn ít nhất một sản phẩm");
          setCreateLoading(false);
          return;
        }

        const data = {
          inventoryId: createInventoryId,
          productIds: createProductIds,
          auditor: user._id,
        };

        await createPendingStocktaking(data);
        setSuccessMessage("Tạo phiếu kiểm kê thành công!");
      }

      // Đóng modal và reset states
      setOpenCreate(false);
      setStocktakingType("single");
      setSelectedInventories([]);
      setCreateInventoryId("");
      setCreateProducts([]);
      setCreateProductIds([]);

      // Hiển thị thông báo thành công
      setOpenSnackbar(true);

      // Tải lại danh sách phiếu kiểm kê
      try {
        await fetchTasks();
        setErrorMessage("");
      } catch (fetchError) {
        console.error("Lỗi khi tải lại danh sách phiếu:", fetchError);
      }
    } catch (err) {
      console.error("Chi tiết lỗi:", err);
      setErrorMessage(
        err.response?.data?.message || "Lỗi khi tạo phiếu kiểm kê!"
      );
    } finally {
      setCreateLoading(false);
    }
  };

  // Xem/Thao tác phiếu kiểm kê
  const handleOpenTask = async (task) => {
    setDetailLoading(true);
    setErrorMessage("");
    try {
      const data = await getStocktakingDetail(task._id);
      setCurrentTask(data);
      if (data.status === "pending") {
        // Chuẩn bị actualQuantities mặc định = systemQuantity
        setActualQuantities(
          Object.fromEntries(
            data.products.map((p) => [p.productId, p.systemQuantity])
          )
        );
        // Khởi tạo giá trị note trống
        setProductNotes(
          Object.fromEntries(
            data.products.map((p) => [p.productId, p.note || ""])
          )
        );
      }
      setAdjustmentResult(null);
      setOpenTask(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết phiếu kiểm kê:", err);
      setErrorMessage(
        err.response?.data?.message || "Lỗi khi lấy chi tiết phiếu kiểm kê!"
      );
    }
    setDetailLoading(false);
  };

  const handleChangeActual = (productId, value) => {
    setActualQuantities({ ...actualQuantities, [productId]: value });
  };

  const handleChangeNote = (productId, note) => {
    setProductNotes({ ...productNotes, [productId]: note });
  };

  const handleSubmitStocktaking = async () => {
    setErrorMessage("");
    
    // Validation phía frontend trước khi gửi request
    const validationErrors = [];
    const reqProducts = currentTask.products.map((p) => {
      const actualQuantity = Number(actualQuantities[p.productId] || 0);
      
      // Kiểm tra số lượng hợp lệ
      if (isNaN(actualQuantity)) {
        validationErrors.push(`Số lượng thực tế của sản phẩm "${p.productName || p.productId}" phải là một số hợp lệ`);
        return null;
      }
      
      // Kiểm tra số lượng không được âm
      if (actualQuantity < 0) {
        validationErrors.push(`Số lượng thực tế của sản phẩm "${p.productName || p.productId}" không được âm (${actualQuantity})`);
        return null;
      }
      
      // Cảnh báo nếu số lượng bằng 0
      if (actualQuantity === 0) {
        console.warn(`⚠️ Cảnh báo: Sản phẩm "${p.productName || p.productId}" có số lượng thực tế bằng 0`);
      }
      
      // Cảnh báo chênh lệch lớn
      const difference = Math.abs(actualQuantity - p.systemQuantity);
      const percentageDiff = p.systemQuantity > 0 ? (difference / p.systemQuantity) * 100 : 0;
      
      if (percentageDiff > 50 && p.systemQuantity > 0) {
        console.warn(`⚠️ Cảnh báo: Sản phẩm "${p.productName || p.productId}" có chênh lệch lớn: Hệ thống ${p.systemQuantity}, Thực tế ${actualQuantity} (${percentageDiff.toFixed(1)}%)`);
      }
      
      return {
        productId: p.productId,
        actualQuantity: actualQuantity,
        note: productNotes[p.productId] || "",
      };
    }).filter(p => p !== null); // Loại bỏ các sản phẩm lỗi
    
    // Hiển thị lỗi validation nếu có
    if (validationErrors.length > 0) {
      setErrorMessage(validationErrors.join(". "));
      return;
    }
    
    try {
      const response = await updateStocktaking(currentTask._id, {
        products: reqProducts,
      });
      setCurrentTask(response.task);
      fetchTasks();
    } catch (err) {
      console.error("Lỗi khi xác nhận kiểm kê:", err);
      
      // Xử lý lỗi từ backend
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setErrorMessage(err.response.data.errors.join(". "));
      } else {
        setErrorMessage(
          err.response?.data?.message || "Lỗi khi xác nhận kiểm kê!"
        );
      }
    }
  };

  const handleCreateAdjustment = async () => {
    setErrorMessage("");
    try {
      // 检查用户是否有权限创建调整单
      if (!user || user.role !== "manager") {
        setErrorMessage("Chỉ quản lý mới có quyền tạo phiếu điều chỉnh!");
        return;
      }

      const response = await createAdjustment({
        stocktakingTaskId: currentTask._id,
        createdBy: user?._id,
      });
      setAdjustmentResult(response.adjustment);
      fetchTasks();
    } catch (err) {
      console.error("Lỗi khi tạo phiếu điều chỉnh:", err);
      setErrorMessage(
        err.response?.data?.message || "Lỗi khi tạo phiếu điều chỉnh!"
      );
    }
  };

  // Hàm xử lý xóa phiếu kiểm kê
  const handleDeleteTask = (task) => {
    if (task.status !== "pending") {
      setErrorMessage("Chỉ có thể xóa phiếu kiểm kê đang chờ xử lý");
      return;
    }
    setTaskToDelete(task);
    setOpenDeleteDialog(true);
  };

  // Xác nhận xóa phiếu kiểm kê
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteStocktakingTask(taskToDelete._id);
      setSuccessMessage("Xóa phiếu kiểm kê thành công!");
      setOpenSnackbar(true);

      // Tải lại danh sách phiếu kiểm kê
      await fetchTasks();

      // Đóng dialog
      setOpenDeleteDialog(false);
      setTaskToDelete(null);
    } catch (err) {
      console.error("Lỗi khi xóa phiếu kiểm kê:", err);
      setErrorMessage(
        err.response?.data?.message || "Lỗi khi xóa phiếu kiểm kê!"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Hủy xóa phiếu kiểm kê
  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setTaskToDelete(null);
  };

  // Hàm đóng snackbar thông báo
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Hàm để hiển thị trạng thái
  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Chờ kiểm kê";
      case "completed":
        return "Chờ điều chỉnh";
      case "adjusted":
        return "Đã hoàn thành";
      default:
        return status;
    }
  };

  // Hàm để lấy màu chip theo trạng thái
  const getStatusChipColor = (status) => {
    switch (status) {
      case "pending":
        return "warning"; // Màu cam cho chờ kiểm kê
      case "completed":
        return "info";    // Màu xanh dương cho chờ điều chỉnh
      case "adjusted":
        return "success"; // Màu xanh lá cho đã hoàn thành
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: 3, background: "#fff", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        fontWeight={900}
        color="#1976d2"
        sx={{ letterSpacing: 2, mb: 3 }}
      >
        Kiểm Kê Kho
      </Typography>

      {pageLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Hiển thị thông báo lỗi nếu không có userId hợp lệ */}
          {errorMessage && !openCreate && !openTask && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mb: 2 }}
            onClick={handleOpenCreate}
            disabled={!user || !user._id}
          >
            Tạo phiếu kiểm kê mới
          </Button>

          {/* Danh sách phiếu kiểm kê */}
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kệ</TableCell>
                  <TableCell>Người kiểm kê</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Điều chỉnh</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <TableRow key={task._id}>
                      <TableCell>
                        {task.inventoryId?.name ||
                          (typeof task.inventoryId === "string"
                            ? task.inventoryId
                            : "N/A")}
                      </TableCell>
                      <TableCell>
                        {task.auditor?.fullName ||
                          task.auditor?.name ||
                          (typeof task.auditor === "string"
                            ? task.auditor
                            : "N/A")}
                      </TableCell>
                      <TableCell>
                        {task.checkedAt
                          ? new Date(task.checkedAt).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(task.status)}
                          color={getStatusChipColor(task.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {task.adjustmentId ? "Đã điều chỉnh" : "-"}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenTask(task)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>

                          {task.status === "pending" && (
                            <>
                              <Tooltip title="Kiểm kê">
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="info"
                                  startIcon={<FactCheckIcon />}
                                  onClick={() => handleOpenTask(task)}
                                >
                                  Kiểm kê
                                </Button>
                              </Tooltip>

                              <Tooltip title="Xóa phiếu kiểm kê">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteTask(task)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Không có dữ liệu phiếu kiểm kê
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Snackbar thông báo thành công */}
          <Snackbar
            open={openSnackbar}
            autoHideDuration={5000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity="success"
              sx={{ width: "100%" }}
            >
              {successMessage}
            </Alert>
          </Snackbar>

          {/* Popup tạo phiếu kiểm kê mới - CẬP NHẬT */}
          <Dialog
            open={openCreate}
            onClose={() => setOpenCreate(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FactCheckIcon color="primary" />
                Tạo phiếu kiểm kê mới
              </Box>
            </DialogTitle>
            <DialogContent>
              {/* Chọn loại kiểm kê */}
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Chọn loại kiểm kê
                </FormLabel>
                <RadioGroup
                  value={stocktakingType}
                  onChange={handleStocktakingTypeChange}
                  row
                >
                  <FormControlLabel
                    value="single"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SelectAllIcon />
                        Kiểm kê từng kệ
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="warehouse"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarehouseIcon />
                        Kiểm kê toàn bộ kho
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>

              <Divider sx={{ mb: 3 }} />

              {stocktakingType === "warehouse" ? (
                /* Hiển thị thông tin kiểm kê toàn bộ kho */
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Kiểm kê toàn bộ kho:</strong> Hệ thống sẽ tự động tạo phiếu kiểm kê cho tất cả {inventories.length} kệ có sản phẩm trong kho.
                    </Typography>
                  </Alert>

                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Danh sách kệ sẽ được kiểm kê:
                  </Typography>

                  <Box sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                    {inventories.filter(inv => inv.products && inv.products.length > 0).map((inv) => (
                      <Chip
                        key={inv._id}
                        label={`${inv.name} (${inv.products?.length || 0} sản phẩm)`}
                        variant="outlined"
                        sx={{ m: 0.5 }}
                        color="primary"
                      />
                    ))}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Tổng cộng: {inventories.filter(inv => inv.products && inv.products.length > 0).length} kệ sẽ được tạo phiếu kiểm kê
                  </Typography>
                </Box>
              ) : (
                /* Hiển thị form chọn từng kệ */
                <Box>
                  <FormControl fullWidth margin="dense">
                    <InputLabel id="create-inventory-label">Chọn kệ</InputLabel>
                    <Select
                      labelId="create-inventory-label"
                      value={createInventoryId}
                      label="Chọn kệ"
                      onChange={(e) => handleSelectCreateInventory(e.target.value)}
                    >
                      <MenuItem value="">-- Chọn kệ --</MenuItem>
                      {inventories.map((inv) => (
                        <MenuItem key={inv._id} value={inv._id}>
                          {inv.name} ({inv.category?.categoryName || inv.categoryId}) - {inv.products?.length || 0} sản phẩm
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {createProducts.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Chọn sản phẩm kiểm kê ({createProductIds.length}/{createProducts.length})
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<SelectAllIcon />}
                          onClick={handleSelectAllProducts}
                          sx={{ minWidth: 120 }}
                        >
                          {createProductIds.length === createProducts.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                        </Button>
                      </Box>

                      <FormControl fullWidth margin="dense">
                        <Select
                          multiple
                          value={createProductIds}
                          onChange={(e) => setCreateProductIds(e.target.value)}
                          renderValue={(selected) =>
                            selected.length === createProducts.length
                              ? "Đã chọn tất cả sản phẩm"
                              : `${selected.length} sản phẩm được chọn`
                          }
                          sx={{ maxHeight: 200 }}
                        >
                          {createProducts.map((prod) => (
                            <MenuItem key={prod.productId} value={prod.productId}>
                              <Checkbox
                                checked={createProductIds.includes(prod.productId)}
                              />
                              <ListItemText
                                primary={`${prod.productName} (${prod.unit || ""})`}
                                secondary={`Số lượng: ${prod.quantity}`}
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </Box>
              )}

              {errorMessage && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errorMessage}
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenCreate(false)}>Hủy</Button>
              <Button
                variant="contained"
                onClick={handleSubmitCreate}
                disabled={
                  createLoading ||
                  (stocktakingType === "single" && (!createInventoryId || createProductIds.length === 0)) ||
                  (stocktakingType === "warehouse" && inventories.filter(inv => inv.products && inv.products.length > 0).length === 0)
                }
                startIcon={createLoading ? <CircularProgress size={20} /> : <FactCheckIcon />}
              >
                {createLoading ? 'Đang tạo...' : 'Tạo phiếu kiểm kê'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Popup chi tiết/thao tác phiếu kiểm kê */}
          <Dialog
            open={openTask}
            onClose={() => setOpenTask(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Phiếu kiểm kê</DialogTitle>
            <DialogContent>
              {detailLoading || !currentTask ? (
                <Typography>Đang tải...</Typography>
              ) : (
                <>
                  <Typography fontWeight={700}>
                    Kệ:{" "}
                    {currentTask.inventoryId?.name ||
                      (typeof currentTask.inventoryId === "string"
                        ? currentTask.inventoryId
                        : "N/A")}
                  </Typography>
                  <Typography>
                    Người kiểm kê:{" "}
                    {currentTask.auditor?.fullName ||
                      currentTask.auditor?.name ||
                      (typeof currentTask.auditor === "string"
                        ? currentTask.auditor
                        : "N/A")}
                  </Typography>
                  <Typography>
                    Thời gian:{" "}
                    {currentTask.checkedAt
                      ? new Date(currentTask.checkedAt).toLocaleString()
                      : "-"}
                  </Typography>
                  <Typography>
                    Trạng thái: {getStatusLabel(currentTask.status)}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {currentTask.products.map((prod, idx) => (
                      <Box
                        key={prod.productId}
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Typography sx={{ minWidth: 120 }}>
                          {prod.productName || prod.productId}
                        </Typography>
                        <Typography sx={{ mx: 2, color: "#1976d2" }}>
                          Hệ thống: {prod.systemQuantity} {prod.unit}
                        </Typography>
                        {currentTask.status === "pending" ? (
                          <>
                            <TextField
                              label="Thực tế"
                              type="number"
                              size="small"
                              value={actualQuantities[prod.productId]}
                              onChange={(e) =>
                                handleChangeActual(
                                  prod.productId,
                                  e.target.value
                                )
                              }
                              sx={{ width: 100, mr: 2 }}
                            />
                            <TextField
                              label="Ghi chú"
                              type="text"
                              size="small"
                              value={productNotes[prod.productId] || ""}
                              onChange={(e) =>
                                handleChangeNote(prod.productId, e.target.value)
                              }
                              sx={{ width: 250 }}
                            />
                          </>
                        ) : (
                          <>
                            <Typography sx={{ mx: 2 }}>
                              Thực tế: {prod.actualQuantity} {prod.unit}
                            </Typography>
                            {prod.note && (
                              <Typography
                                sx={{
                                  mx: 2,
                                  color: "text.secondary",
                                  fontStyle: "italic",
                                }}
                              >
                                Ghi chú: {prod.note}
                              </Typography>
                            )}
                          </>
                        )}
                        {(currentTask.status === "completed" || currentTask.status === "adjusted") && (
                          <Typography
                            sx={{
                              mx: 2,
                              fontWeight: 500,
                              color: prod.difference === 0 ? "green" : "red",
                            }}
                          >
                            Chênh lệch: {prod.difference > 0 ? "+" : ""}
                            {prod.difference} {prod.unit}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                  {errorMessage && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {errorMessage}
                    </Alert>
                  )}
                  {currentTask.status === "pending" ? (
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                      onClick={handleSubmitStocktaking}
                    >
                      Xác nhận kiểm kê
                    </Button>
                  ) : currentTask.status === "completed" &&
                    !currentTask.adjustmentId &&
                    !adjustmentResult &&
                    user?.role === "manager" ? (
                    <Button
                      variant="contained"
                      color="warning"
                      sx={{ mt: 2 }}
                      onClick={handleCreateAdjustment}
                    >
                      Tạo phiếu điều chỉnh
                    </Button>
                  ) : currentTask.status === "completed" &&
                    !currentTask.adjustmentId &&
                    !adjustmentResult &&
                    user?.role !== "manager" ? (
                    <Typography
                      sx={{
                        mt: 2,
                        fontStyle: "italic",
                        color: "text.secondary",
                      }}
                    >
                      Chỉ quản lý mới có quyền tạo phiếu điều chỉnh
                    </Typography>
                  ) : null}

                  {adjustmentResult && (
                    <Box
                      sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}
                    >
                      <Typography fontWeight={700} color="primary">
                        Phiếu điều chỉnh đã được tạo thành công!
                      </Typography>
                      <Typography>ID: {adjustmentResult._id}</Typography>
                      <Typography>
                        Thời gian:{" "}
                        {new Date(adjustmentResult.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenTask(false)}>Đóng</Button>
            </DialogActions>
          </Dialog>

          {/* Dialog xác nhận xóa phiếu kiểm kê */}
          <Dialog
            open={openDeleteDialog}
            onClose={handleCancelDelete}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DeleteIcon color="error" />
                Xác nhận xóa phiếu kiểm kê
              </Box>
            </DialogTitle>
            <DialogContent>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Bạn có chắc chắn muốn xóa phiếu kiểm kê này không?
              </Alert>
              {taskToDelete && (
                <Box>
                  <Typography variant="body1">
                    <strong>Kệ:</strong> {taskToDelete.inventoryId?.name || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Người kiểm kê:</strong> {taskToDelete.auditor?.fullName || taskToDelete.auditor?.name || "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Trạng thái:</strong> {taskToDelete.status === "pending" ? "Chờ kiểm kê" : "Đã hoàn thành"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Hành động này không thể hoàn tác!
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDelete} disabled={deleteLoading}>
                Hủy
              </Button>
              <Button
                onClick={handleConfirmDelete}
                color="error"
                variant="contained"
                disabled={deleteLoading}
                startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
              >
                {deleteLoading ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}

export default Stocktaking;
