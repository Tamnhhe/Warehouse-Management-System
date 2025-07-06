import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Typography,
  Chip,
  IconButton,
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Stack,
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  TablePagination,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Fab,
  Menu,
} from "@mui/material";
import {
  Edit as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  RestartAlt as RestartAltIcon,
  Business as BusinessIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Inventory as InventoryIcon,
  MoreVert as MoreVertIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Import API modules for consistency
import supplierAPI from "../../API/supplierAPI";
import supplierProductAPI from "../../API/supplierProductAPI";
import productAPI from "../../API/productAPI";

// Bảng màu từ navbar
const palette = {
  dark: "#155E64",
  medium: "#75B39C",
  light: "#A0E4D0",
  white: "#FFFFFF",
  black: "#000000",
};

const SupplierList = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState({
    "Còn cung cấp": false,
    "Ngừng cung cấp": false,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal states
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    email: "",
    description: "",
    status: "active",
  });
  const [formErrors, setFormErrors] = useState({});

  // Supplier details states
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [openSupplierDetails, setOpenSupplierDetails] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Expanded rows
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Menu anchor
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuSupplier, setMenuSupplier] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      console.log("=== SupplierList fetchSuppliers ===");

      const response = await supplierAPI.getAll();
      console.log("Suppliers API response:", response);

      // Handle different response structures
      const suppliersData = response.data?.data || response.data || [];
      setSuppliers(suppliersData);
      setError(null);

      console.log("Suppliers set to:", suppliersData);
      console.log("=== End fetchSuppliers ===");
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setError(
        "Không thể tải dữ liệu danh sách nhà cung cấp: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierProducts = async (supplierId) => {
    try {
      setLoadingProducts(true);
      console.log("=== SupplierList fetchSupplierProducts ===");
      console.log("Fetching products for supplier:", supplierId);

      const response = await supplierProductAPI.getProductsBySupplier(
        supplierId
      );

      console.log("API Response:", response.data);
      console.log("Products data:", response.data.data);
      console.log("Total products:", response.data.total);

      // Handle standardized response structure
      const products = response.data?.data || [];
      setSupplierProducts(products);

      if (products.length === 0) {
        console.log("No products found for supplier:", supplierId);
      }

      console.log("=== End fetchSupplierProducts ===");
    } catch (error) {
      console.error("=== SupplierList fetchSupplierProducts Error ===");
      console.error("Error fetching supplier products:", error);
      console.error("Error details:", error.response?.data);
      console.error("=== End Error ===");
      setSupplierProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Cập nhật trạng thái nhà cung cấp
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:9999/suppliers/update-status/${id}`, {
        status: newStatus,
      });
      const updatedSuppliers = suppliers.map((s) =>
        s._id === id ? { ...s, status: newStatus } : s
      );
      setSuppliers(updatedSuppliers);
      handleMenuClose();
    } catch (error) {
      console.log("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  // Form validation
  const validateForm = (data) => {
    const errors = {};

    if (!data.name.trim()) errors.name = "Tên nhà cung cấp là bắt buộc";
    if (!data.address.trim()) errors.address = "Địa chỉ là bắt buộc";
    if (!data.contact.trim()) {
      errors.contact = "Số điện thoại là bắt buộc";
    } else if (!/^\d{10,15}$/.test(data.contact)) {
      errors.contact = "Số điện thoại phải có 10-15 chữ số";
    }
    if (!data.email.trim()) {
      errors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Email không hợp lệ";
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (isEdit = false) => {
    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:9999/suppliers/updateSupplier/${editingSupplier._id}`,
          formData
        );
        const updatedSuppliers = suppliers.map((s) =>
          s._id === editingSupplier._id ? { ...s, ...formData } : s
        );
        setSuppliers(updatedSuppliers);
        setOpenEditModal(false);
      } else {
        const response = await axios.post(
          "http://localhost:9999/suppliers/addSupplier",
          formData
        );
        setSuppliers([...suppliers, response.data]);
        setOpenAddModal(false);
      }

      // Reset form
      setFormData({
        name: "",
        address: "",
        contact: "",
        email: "",
        description: "",
        status: "active",
      });
      setFormErrors({});
    } catch (error) {
      console.error("Lỗi khi lưu nhà cung cấp:", error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      }
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || "",
      address: supplier.address || "",
      contact: supplier.contact || "",
      email: supplier.email || "",
      description: supplier.description || "",
      status: supplier.status || "active",
    });
    setFormErrors({});
    setOpenEditModal(true);
  };

  const handleViewDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setOpenSupplierDetails(true);
    setTabValue(0);
    fetchSupplierProducts(supplier._id);
  };

  const handleFilterChange = (e) => {
    setFilterStatus({ ...filterStatus, [e.target.name]: e.target.checked });
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExpandRow = (supplierId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(supplierId)) {
      newExpanded.delete(supplierId);
    } else {
      newExpanded.add(supplierId);
      // Fetch products for this supplier
      fetchSupplierProducts(supplierId);
    }
    setExpandedRows(newExpanded);
  };

  const handleMenuOpen = (event, supplier) => {
    setAnchorEl(event.currentTarget);
    setMenuSupplier(supplier);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuSupplier(null);
  };

  // Function tạo dữ liệu mẫu cho test
  const createSampleData = async () => {
    try {
      // Trước tiên kiểm tra xem có suppliers và products không
      console.log("=== SupplierList createSampleData ===");
      console.log("Checking prerequisites for sample data...");
      const [suppliersRes, productsRes] = await Promise.all([
        supplierAPI.getAll(),
        productAPI.getAll().catch(() => ({ data: [] })),
      ]);

      // Handle different response structures
      const suppliersData = suppliersRes.data?.data || suppliersRes.data || [];
      const productsData = productsRes.data?.data || productsRes.data || [];

      console.log("Available suppliers:", suppliersData.length);
      console.log("Available products:", productsData.length);

      if (suppliersData.length === 0) {
        alert(
          "Cần có ít nhất 1 supplier để tạo dữ liệu mẫu. Vui lòng thêm supplier trước!"
        );
        return;
      }

      if (productsRes.data.length === 0) {
        alert(
          "Cần có ít nhất 1 product để tạo dữ liệu mẫu. Vui lòng thêm product trước!"
        );
        return;
      }

      const response = await axios.post(
        "http://localhost:9999/supplier-products/create-sample-data"
      );
      console.log("Sample data created:", response.data);
      alert("Đã tạo dữ liệu mẫu thành công!");
      // Refresh suppliers sau khi tạo dữ liệu
      fetchSuppliers();
    } catch (error) {
      console.error("Lỗi khi tạo dữ liệu mẫu:", error);
      const errorMsg = error.response?.data?.message || error.message;
      alert("Lỗi khi tạo dữ liệu mẫu: " + errorMsg);

      // Nếu lỗi 400, có thể là thiếu suppliers hoặc products
      if (error.response?.status === 400) {
        alert(
          "Có thể thiếu suppliers hoặc products active. Vui lòng kiểm tra dữ liệu cơ bản trước!"
        );
      }
    }
  };

  // Function test API
  const testAPI = async () => {
    try {
      // Test lấy tất cả supplier products bằng API module
      console.log("=== SupplierList testAPI ===");
      const response = await supplierProductAPI.getAll();
      console.log("All supplier products response:", response);

      // Handle different response structures
      const products = response.data?.data || response.data || [];
      console.log("All supplier products:", products);

      alert(`Tìm thấy ${products.length} supplier products trong database`);
      console.log("=== End testAPI ===");
    } catch (error) {
      console.error("=== SupplierList testAPI Error ===");
      console.error("Error testing API:", error);
      if (error.response?.status === 404) {
        alert(
          "Database trống - chưa có supplier products nào. Hãy tạo dữ liệu mẫu!"
        );
      } else {
        alert(
          "Lỗi khi test API: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  // Lọc danh sách nhà cung cấp
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(search.toLowerCase()) &&
      (Object.values(filterStatus).some((value) => value)
        ? filterStatus[
            supplier.status === "active" ? "Còn cung cấp" : "Ngừng cung cấp"
          ]
        : true)
  );

  // Pagination
  const paginatedSuppliers = filteredSuppliers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusChip = (status) => {
    if (status === "active") {
      return (
        <Chip
          label="Còn cung cấp"
          size="small"
          icon={<CheckCircleIcon />}
          sx={{
            backgroundColor: palette.light,
            color: palette.dark,
            fontWeight: "medium",
          }}
        />
      );
    } else {
      return (
        <Chip
          label="Ngừng cung cấp"
          color="error"
          size="small"
          icon={<BlockIcon />}
          sx={{ fontWeight: "medium" }}
        />
      );
    }
  };

  const formatPhoneNumber = (contact) => {
    if (!contact) return "N/A";
    return ("0" + String(contact).replace(/\D/g, "")).replace(/^00/, "0");
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} sx={{ color: palette.dark }} />
          <Typography variant="h6" sx={{ mt: 2, color: palette.dark }}>
            Đang tải dữ liệu...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ height: "100vh", p: 3, backgroundColor: "#f5f5f5" }}>
        <Alert severity="error" sx={{ textAlign: "center" }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          backgroundColor: palette.dark,
          color: palette.white,
          borderRadius: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <BusinessIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: "bold" }}
              >
                Quản lý nhà cung cấp
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                Tổng: {suppliers.length} nhà cung cấp
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={testAPI}
              sx={{
                borderColor: palette.white,
                color: palette.white,
                "&:hover": {
                  borderColor: palette.light,
                  backgroundColor: palette.light + "20",
                },
                fontSize: "0.75rem",
              }}
            >
              Test API
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={createSampleData}
              sx={{
                borderColor: palette.white,
                color: palette.white,
                "&:hover": {
                  borderColor: palette.light,
                  backgroundColor: palette.light + "20",
                },
                fontSize: "0.8rem",
              }}
            >
              Tạo dữ liệu mẫu
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddModal(true)}
              sx={{
                backgroundColor: palette.medium,
                color: palette.dark,
                "&:hover": {
                  backgroundColor: palette.light,
                  transform: "scale(1.05)",
                },
                borderRadius: 2,
                px: 3,
                py: 1,
                fontSize: "1rem",
                fontWeight: "bold",
              }}
            >
              Thêm nhà cung cấp
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          p: 3,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Toolbar */}
        <Paper
          elevation={1}
          sx={{ p: 2, mb: 2, backgroundColor: palette.white }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="center"
          >
            {/* Tìm kiếm */}
            <TextField
              placeholder="Tìm kiếm nhà cung cấp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: palette.dark }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Bộ lọc trạng thái */}
            <FormGroup row>
              {["Còn cung cấp", "Ngừng cung cấp"].map((status) => (
                <FormControlLabel
                  key={status}
                  control={
                    <Checkbox
                      name={status}
                      checked={filterStatus[status]}
                      onChange={handleFilterChange}
                      size="small"
                      sx={{ color: palette.dark }}
                    />
                  }
                  label={<Typography variant="body2">{status}</Typography>}
                />
              ))}
            </FormGroup>

            {/* Thông tin kết quả */}
            <Box sx={{ ml: "auto" }}>
              <Typography variant="body2" sx={{ color: palette.dark }}>
                Hiển thị {filteredSuppliers.length} kết quả
                {search && ` cho "${search}"`}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Bảng danh sách */}
        <Paper
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TableContainer sx={{ flex: 1 }}>
            <Table stickyHeader aria-label="supplier table">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: palette.light,
                      color: palette.dark,
                    }}
                  >
                    #
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: palette.light,
                      color: palette.dark,
                    }}
                  >
                    Tên nhà cung cấp
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: palette.light,
                      color: palette.dark,
                    }}
                  >
                    Liên hệ
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: palette.light,
                      color: palette.dark,
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: palette.light,
                      color: palette.dark,
                    }}
                  >
                    Địa chỉ
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: palette.light,
                      color: palette.dark,
                    }}
                  >
                    Trạng thái
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: palette.light,
                      color: palette.dark,
                      textAlign: "center",
                    }}
                  >
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSuppliers.length > 0 ? (
                  paginatedSuppliers.map((supplier, index) => (
                    <React.Fragment key={supplier._id}>
                      <TableRow
                        hover
                        sx={{
                          "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                          "&:hover": { backgroundColor: palette.light + "20" },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {page * rowsPerPage + index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: "medium",
                                  color: palette.dark,
                                }}
                              >
                                {supplier.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary" }}
                              >
                                {supplier.description || "Không có mô tả"}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleExpandRow(supplier._id)}
                              sx={{ ml: 1, color: palette.dark }}
                            >
                              {expandedRows.has(supplier._id) ? (
                                <ExpandLessIcon />
                              ) : (
                                <ExpandMoreIcon />
                              )}
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatPhoneNumber(supplier.contact)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: 180 }}
                          >
                            {supplier.email || "Chưa cập nhật"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: 200 }}
                          >
                            {supplier.address || "Chưa cập nhật"}
                          </Typography>
                        </TableCell>
                        <TableCell>{getStatusChip(supplier.status)}</TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                          >
                            <Tooltip title="Xem chi tiết" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(supplier)}
                                sx={{
                                  color: palette.dark,
                                  "&:hover": {
                                    backgroundColor: palette.light + "40",
                                    transform: "scale(1.1)",
                                  },
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Chỉnh sửa" arrow>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEdit(supplier)}
                                  disabled={supplier.status === "inactive"}
                                  sx={{
                                    color: palette.medium,
                                    "&:hover": {
                                      backgroundColor: palette.light + "40",
                                      transform: "scale(1.1)",
                                    },
                                    opacity:
                                      supplier.status === "inactive" ? 0.5 : 1,
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title="Thêm tùy chọn" arrow>
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, supplier)}
                                sx={{
                                  color: palette.dark,
                                  "&:hover": {
                                    backgroundColor: palette.light + "40",
                                    transform: "scale(1.1)",
                                  },
                                }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>

                      {/* Expanded row for products */}
                      <TableRow>
                        <TableCell colSpan={7} sx={{ p: 0, border: "none" }}>
                          <Collapse in={expandedRows.has(supplier._id)}>
                            <Box
                              sx={{
                                p: 2,
                                backgroundColor: palette.light + "20",
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{ mb: 2, color: palette.dark }}
                              >
                                <InventoryIcon
                                  sx={{ mr: 1, verticalAlign: "middle" }}
                                />
                                Sản phẩm của nhà cung cấp
                                <Typography
                                  component="span"
                                  variant="body2"
                                  sx={{ ml: 1, color: "text.secondary" }}
                                >
                                  (ID: {supplier._id})
                                </Typography>
                              </Typography>
                              {loadingProducts ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    p: 2,
                                  }}
                                >
                                  <CircularProgress
                                    size={24}
                                    sx={{ color: palette.dark }}
                                  />
                                </Box>
                              ) : supplierProducts.length > 0 ? (
                                <>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 2 }}
                                  >
                                    Debug: Tìm thấy {supplierProducts.length}{" "}
                                    sản phẩm
                                  </Typography>
                                  <Grid container spacing={2}>
                                    {supplierProducts
                                      .slice(0, 6)
                                      .map((product) => (
                                        <Grid
                                          item
                                          xs={12}
                                          sm={6}
                                          md={4}
                                          key={product.supplierProductId}
                                        >
                                          <Card
                                            variant="outlined"
                                            sx={{
                                              p: 2,
                                              height: "100%",
                                              "&:hover": {
                                                boxShadow: 2,
                                                transform: "translateY(-2px)",
                                              },
                                              transition: "all 0.2s",
                                            }}
                                          >
                                            <Typography
                                              variant="subtitle2"
                                              sx={{
                                                fontWeight: "bold",
                                                color: palette.dark,
                                              }}
                                            >
                                              {product.productName}
                                            </Typography>
                                            <Typography
                                              variant="body2"
                                              color="text.secondary"
                                              sx={{ mb: 1 }}
                                            >
                                              {product.categoryName}
                                            </Typography>
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                color: palette.medium,
                                                fontWeight: "medium",
                                              }}
                                            >
                                              Giá:{" "}
                                              {new Intl.NumberFormat(
                                                "vi-VN"
                                              ).format(product.price)}{" "}
                                              VNĐ
                                            </Typography>
                                            <Typography
                                              variant="body2"
                                              color="text.secondary"
                                            >
                                              Tồn kho: {product.stock}
                                            </Typography>
                                          </Card>
                                        </Grid>
                                      ))}
                                  </Grid>
                                </>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ textAlign: "center", py: 2 }}
                                >
                                  Chưa có sản phẩm nào
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 6 }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <BusinessIcon
                          sx={{ fontSize: 48, color: "grey.300" }}
                        />
                        <Typography variant="h6" color="textSecondary">
                          Không tìm thấy nhà cung cấp nào
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {filteredSuppliers.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredSuppliers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số hàng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} trong tổng số ${
                  count !== -1 ? count : `hơn ${to}`
                }`
              }
              sx={{
                borderTop: `1px solid ${palette.light}`,
                backgroundColor: palette.white,
              }}
            />
          )}
        </Paper>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem
          onClick={() => handleViewDetails(menuSupplier)}
          sx={{
            "&:hover": { backgroundColor: palette.light + "40" },
            color: palette.dark,
          }}
        >
          <VisibilityIcon sx={{ mr: 1, fontSize: 20 }} />
          Xem chi tiết
        </MenuItem>
        {menuSupplier?.status === "active" ? (
          <MenuItem
            onClick={() => handleUpdateStatus(menuSupplier._id, "inactive")}
            sx={{
              "&:hover": { backgroundColor: "#ffebee" },
              color: "#d32f2f",
            }}
          >
            <BlockIcon sx={{ mr: 1, fontSize: 20 }} />
            Ngừng cung cấp
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => handleUpdateStatus(menuSupplier._id, "active")}
            sx={{
              "&:hover": { backgroundColor: palette.light + "40" },
              color: palette.medium,
            }}
          >
            <RestartAltIcon sx={{ mr: 1, fontSize: 20 }} />
            Kích hoạt lại
          </MenuItem>
        )}
      </Menu>

      {/* Add Supplier Modal */}
      <Dialog
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: palette.dark,
            color: palette.white,
            display: "flex",
            alignItems: "center",
            pb: 2,
          }}
        >
          <AddIcon sx={{ mr: 1 }} />
          Thêm nhà cung cấp mới
          <IconButton
            onClick={() => setOpenAddModal(false)}
            sx={{
              ml: "auto",
              color: palette.white,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên nhà cung cấp"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: palette.dark,
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: palette.dark,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                error={!!formErrors.contact}
                helperText={formErrors.contact}
                required
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: palette.dark,
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: palette.dark,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: palette.dark,
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: palette.dark,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                error={!!formErrors.address}
                helperText={formErrors.address}
                required
                multiline
                rows={2}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: palette.dark,
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: palette.dark,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả (tùy chọn)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={3}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: palette.dark,
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: palette.dark,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel
                  sx={{
                    "&.Mui-focused": { color: palette.dark },
                  }}
                >
                  Trạng thái
                </InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  label="Trạng thái"
                  sx={{
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: palette.dark,
                    },
                  }}
                >
                  <MenuItem value="active">Còn cung cấp</MenuItem>
                  <MenuItem value="inactive">Ngừng cung cấp</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, backgroundColor: "#f8fafc" }}>
          <Button
            onClick={() => setOpenAddModal(false)}
            sx={{
              color: "text.secondary",
              "&:hover": { backgroundColor: "grey.100" },
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={() => handleSubmit(false)}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              backgroundColor: palette.dark,
              "&:hover": {
                backgroundColor: palette.medium,
                color: palette.dark,
              },
              borderRadius: 2,
              px: 3,
            }}
          >
            Thêm nhà cung cấp
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Supplier Modal */}
      <Dialog
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: palette.medium,
            color: palette.dark,
            display: "flex",
            alignItems: "center",
            pb: 2,
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Chỉnh sửa nhà cung cấp
          <IconButton
            onClick={() => setOpenEditModal(false)}
            sx={{
              ml: "auto",
              color: palette.dark,
              "&:hover": { backgroundColor: "rgba(0,0,0,0.1)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên nhà cung cấp"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: palette.dark,
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: palette.dark,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                error={!!formErrors.contact}
                helperText={formErrors.contact}
                required
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: palette.dark,
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: palette.dark,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: palette.dark,
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: palette.dark,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                error={!!formErrors.address}
                helperText={formErrors.address}
                required
                multiline
                rows={2}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: palette.dark,
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: palette.dark,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả (tùy chọn)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={3}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: palette.dark,
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: palette.dark,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel
                  sx={{
                    "&.Mui-focused": { color: palette.dark },
                  }}
                >
                  Trạng thái
                </InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  label="Trạng thái"
                  sx={{
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: palette.dark,
                    },
                  }}
                >
                  <MenuItem value="active">Còn cung cấp</MenuItem>
                  <MenuItem value="inactive">Ngừng cung cấp</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, backgroundColor: "#f8fafc" }}>
          <Button
            onClick={() => setOpenEditModal(false)}
            sx={{
              color: "text.secondary",
              "&:hover": { backgroundColor: "grey.100" },
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              backgroundColor: palette.medium,
              color: palette.dark,
              "&:hover": {
                backgroundColor: palette.dark,
                color: palette.white,
              },
              borderRadius: 2,
              px: 3,
            }}
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Supplier Details Modal */}
      <Dialog
        open={openSupplierDetails}
        onClose={() => setOpenSupplierDetails(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            height: "80vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: palette.dark,
            color: palette.white,
            display: "flex",
            alignItems: "center",
            pb: 2,
          }}
        >
          <BusinessIcon sx={{ mr: 1 }} />
          Chi tiết nhà cung cấp: {selectedSupplier?.name}
          <IconButton
            onClick={() => setOpenSupplierDetails(false)}
            sx={{
              ml: "auto",
              color: palette.white,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: "100%" }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              backgroundColor: "#f8fafc",
            }}
          >
            <Tab
              label="Thông tin cơ bản"
              sx={{
                "&.Mui-selected": { color: palette.dark },
              }}
            />
            <Tab
              label={`Sản phẩm (${supplierProducts.length})`}
              sx={{
                "&.Mui-selected": { color: palette.dark },
              }}
            />
          </Tabs>

          {/* Tab 1: Basic Info */}
          {tabValue === 0 && selectedSupplier && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 3, height: "100%" }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, color: palette.dark }}
                    >
                      Thông tin liên hệ
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Tên nhà cung cấp
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: "medium" }}
                        >
                          {selectedSupplier.name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Số điện thoại
                        </Typography>
                        <Typography variant="body1">
                          {formatPhoneNumber(selectedSupplier.contact)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {selectedSupplier.email || "Chưa cập nhật"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Địa chỉ
                        </Typography>
                        <Typography variant="body1">
                          {selectedSupplier.address || "Chưa cập nhật"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 3, height: "100%" }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, color: palette.dark }}
                    >
                      Thông tin khác
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Trạng thái
                        </Typography>
                        {getStatusChip(selectedSupplier.status)}
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Mô tả
                        </Typography>
                        <Typography variant="body1">
                          {selectedSupplier.description || "Không có mô tả"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Số lượng sản phẩm
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{ color: palette.medium, fontWeight: "bold" }}
                        >
                          {supplierProducts.length}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Tab 2: Products */}
          {tabValue === 1 && (
            <Box sx={{ p: 3, height: "100%", overflow: "auto" }}>
              {loadingProducts ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 200,
                  }}
                >
                  <CircularProgress sx={{ color: palette.dark }} />
                </Box>
              ) : supplierProducts.length > 0 ? (
                <Grid container spacing={3}>
                  {supplierProducts.map((product) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={product.supplierProductId}
                    >
                      <Card
                        variant="outlined"
                        sx={{
                          p: 3,
                          height: "100%",
                          "&:hover": {
                            boxShadow: 4,
                            transform: "translateY(-4px)",
                          },
                          transition: "all 0.3s",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <ShoppingCartIcon
                            sx={{ color: palette.dark, mr: 1 }}
                          />
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", color: palette.dark }}
                          >
                            {product.productName}
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={1}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Danh mục
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "medium" }}
                            >
                              {product.categoryName}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Giá bán
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ color: palette.medium, fontWeight: "bold" }}
                            >
                              {new Intl.NumberFormat("vi-VN").format(
                                product.price
                              )}{" "}
                              VNĐ
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Tồn kho
                            </Typography>
                            <Chip
                              label={`${product.stock} sản phẩm`}
                              size="small"
                              color={product.stock > 0 ? "success" : "error"}
                              variant="outlined"
                            />
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <InventoryIcon
                    sx={{ fontSize: 64, color: "grey.300", mb: 2 }}
                  />
                  <Typography variant="h6" color="textSecondary">
                    Nhà cung cấp này chưa có sản phẩm nào
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SupplierList;
