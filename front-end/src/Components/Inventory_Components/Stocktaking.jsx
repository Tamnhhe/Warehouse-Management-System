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
} from "@mui/material";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  getInventories,
  getStocktakingHistory,
  getStocktakingDetail,
  createPendingStocktaking,
  updateStocktaking,
  createAdjustment,
} from "../../API/stocktakingAPI";
import useAuth from "../../Hooks/useAuth";

function Stocktaking() {
  const { user, loading: authLoading, getCurrentUser } = useAuth();
  const [inventories, setInventories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
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

    setCreateInventoryId("");
    setCreateProducts([]);
    setCreateProductIds([]);
    setErrorMessage("");
    setOpenCreate(true);
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

      // Kiểm tra dữ liệu đầu vào
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
      console.log("Gửi dữ liệu:", data);
      const result = await createPendingStocktaking(data);
      console.log("Kết quả:", result);

      // Đóng modal trước
      setOpenCreate(false);

      // Đảm bảo các state được reset
      setCreateInventoryId("");
      setCreateProducts([]);
      setCreateProductIds([]);

      // Hiển thị thông báo thành công
      setSuccessMessage("Tạo phiếu kiểm kê thành công!");
      setOpenSnackbar(true);

      // Tải lại danh sách phiếu kiểm kê
      try {
        await fetchTasks();
        setErrorMessage(""); // Xóa thông báo lỗi nếu có
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
    try {
      const reqProducts = currentTask.products.map((p) => ({
        productId: p.productId,
        actualQuantity: Number(actualQuantities[p.productId] || 0),
        note: productNotes[p.productId] || "",
      }));
      const response = await updateStocktaking(currentTask._id, {
        products: reqProducts,
      });
      setCurrentTask(response.task);
      fetchTasks();
    } catch (err) {
      console.error("Lỗi khi xác nhận kiểm kê:", err);
      setErrorMessage(
        err.response?.data?.message || "Lỗi khi xác nhận kiểm kê!"
      );
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

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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
                        {task.status === "completed"
                          ? "Đã hoàn thành"
                          : "Chờ kiểm kê"}
                      </TableCell>
                      <TableCell>
                        {task.adjustmentId ? "Đã điều chỉnh" : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleOpenTask(task)}
                        >
                          Xem
                        </Button>
                        {task.status === "pending" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="info"
                            sx={{ ml: 1 }}
                            startIcon={<FactCheckIcon />}
                            onClick={() => handleOpenTask(task)}
                          >
                            Kiểm kê
                          </Button>
                        )}
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

          {/* Popup tạo phiếu kiểm kê mới */}
          <Dialog
            open={openCreate}
            onClose={() => setOpenCreate(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Tạo phiếu kiểm kê mới</DialogTitle>
            <DialogContent>
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
                      {inv.name} ({inv.category?.categoryName || inv.categoryId}
                      )
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {createProducts.length > 0 && (
                <FormControl fullWidth margin="dense">
                  <InputLabel id="create-product-label">
                    Chọn sản phẩm kiểm kê
                  </InputLabel>
                  <Select
                    labelId="create-product-label"
                    multiple
                    value={createProductIds}
                    onChange={(e) => setCreateProductIds(e.target.value)}
                    renderValue={(selected) => selected.length + " sản phẩm"}
                  >
                    {createProducts.map((prod) => (
                      <MenuItem key={prod.productId} value={prod.productId}>
                        <Checkbox
                          checked={createProductIds.includes(prod.productId)}
                        />
                        <ListItemText
                          primary={`${prod.productName} (${prod.unit || ""})`}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                  !createInventoryId ||
                  createProductIds.length === 0 ||
                  createLoading
                }
              >
                Tạo phiếu
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
                    Trạng thái:{" "}
                    {currentTask.status === "completed"
                      ? "Đã hoàn thành"
                      : "Chờ kiểm kê"}
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
                        {currentTask.status === "completed" && (
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
                  ) : !currentTask.adjustmentId &&
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
                  ) : !currentTask.adjustmentId &&
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
        </>
      )}
    </Box>
  );
}

export default Stocktaking;
