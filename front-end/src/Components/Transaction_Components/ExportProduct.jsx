//Nguyễn Bảo Phi-HE173187-7/2/2025
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from "@mui/material";
import CreateBranchDialog from "./CreateBranchDialog";
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import authorApi from "../../API/baseAPI/authorAPI";
import { useNavigate } from "react-router-dom";
import palette from "../../Constants/palette";

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
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const ExportProduct = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  // Add default exportPrice to each selected product
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [branch, setBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [openCreateBranch, setOpenCreateBranch] = useState(false);
  // Lấy danh sách chi nhánh từ backend
  useEffect(() => {
    authorApi
      .get("/branches/getAllBranches")
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data)) {
          setBranches(res.data.data);
          if (!branch && res.data.data.length > 0) {
            setBranch(res.data.data[0]._id);
          }
        }
      })
      .catch((err) => console.error("Không tải được danh sách chi nhánh", err));
  }, []);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    // Fetch regular products instead of supplier products
    authorApi
      .get("/products/getAllProducts")
      .then((response) => {
        const allProducts = response.data;
        console.log("Raw products:", allProducts);

        if (!Array.isArray(allProducts) || allProducts.length === 0) {
          setError("Không tìm thấy sản phẩm");
          setLoading(false);
          return;
        }

        // Filter active products
        const activeProducts = allProducts.filter(
          (product) => product && product.status === "active"
        );

        console.log("Active products count:", activeProducts.length);

        // Process products data
        const productsWithData = activeProducts.map((product) => {
          return {
            ...product,
            stock: product.stock || 0,
          };
        });

        console.log("Products with data:", productsWithData);
        setProducts(productsWithData);
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API:", error);
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    authorApi
      .get("/categories/getAllCategories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Không tải được danh mục", err));
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (value.trim() === "") {
      setFilteredProducts([]);
      return;
    }

    const filtered = products.filter(
      (p) =>
        p &&
        p.productName &&
        p.productName.toLowerCase().includes(value.toLowerCase())
    );

    console.log("Filtered products:", filtered);
    setFilteredProducts(filtered);
  };

  const handleSelectProduct = (product) => {
    if (!selectedProducts.some((p) => p._id === product._id)) {
      // Default exportPrice to import price (product.price)
      setSelectedProducts([
        ...selectedProducts,
        {
          ...product,
          quantity: 1,
          exportPrice: product.price || 0, // Always default to import price
        },
      ]);
    }
    setFilteredProducts([]);
    setSearch("");
  };

  const handleQuantityChange = (index, value) => {
    if (/^\d*$/.test(value)) {
      setSelectedProducts((prev) =>
        prev.map((p, i) => (i === index ? { ...p, quantity: value } : p))
      );
    }
  };

  // Handle export price change
  const handleExportPriceChange = (index, value) => {
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setSelectedProducts((prev) =>
        prev.map((p, i) => (i === index ? { ...p, exportPrice: value } : p))
      );
    }
  };

  const getCategoryName = (categoryId) => {
    const found = categories.find((c) => c._id === categoryId);
    return found ? found.categoryName : "Không có";
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts.splice(index, 1);
    setSelectedProducts(updatedProducts);
  };

  const handleCreateBranchSuccess = (newBranch) => {
    setBranches((prev) => [...prev, newBranch]);
    setBranch(newBranch._id);
  };

  const handleSubmit = async () => {
    console.log("📦 Danh sách sản phẩm trước khi gửi API:", selectedProducts);

    if (selectedProducts.length === 0) {
      setError("Vui lòng chọn ít nhất một sản phẩm.");
      return;
    }

    // Check for invalid quantity or export price
    const invalids = selectedProducts.filter(
      (product) => {
        const qty = parseInt(product.quantity, 10);
        const expPrice = parseFloat(product.exportPrice);
        return qty <= 0 || expPrice <= 0;
      }
    );
    if (invalids.length > 0) {
      const msg = invalids.map(p => `${p.productName} (số lượng: ${p.quantity}, giá xuất: ${p.exportPrice})`).join(", ");
      setError(`Số lượng hoặc giá xuất không hợp lệ cho: ${msg}`);
      return;
    }

    // Check if any product quantity exceeds available stock
    const invalidProducts = selectedProducts.filter(
      (product) => parseInt(product.quantity, 10) > product.totalStock
    );

    if (invalidProducts.length > 0) {
      const productNames = invalidProducts
        .map(
          (p) =>
            `${p.productName} (yêu cầu: ${p.quantity}, tồn kho: ${p.totalStock})`
        )
        .join(", ");
      setError(`Số lượng xuất vượt quá tồn kho: ${productNames}`);
      return;
    }

    // Check export price lower than import price and by how much percent
    const priceWarnings = selectedProducts
      .map((p) => {
        const importPrice = parseFloat(p.price) || 0;
        const exportPrice = parseFloat(p.exportPrice) || 0;
        if (importPrice > 0 && exportPrice > 0 && exportPrice < importPrice) {
          const percent = (((importPrice - exportPrice) / importPrice) * 100).toFixed(2);
          return `${p.productName}: Giá xuất thấp hơn giá nhập ${percent}%`;
        }
        return null;
      })
      .filter(Boolean);
    if (priceWarnings.length > 0) {
      setError(priceWarnings.join("; "));
      return;
    }

    // Kiểm tra giá xuất nhỏ hơn giá nhập từ supplierProduct
    const priceViolations = [];
    for (const product of selectedProducts) {
      // Nếu đã có supplierProductPrice (giá nhập) trong product
      if (product.supplierProductPrice !== undefined) {
        const exportPrice = parseFloat(product.exportPrice) || 0;
        const importPrice = parseFloat(product.supplierProductPrice) || 0;
        if (exportPrice < importPrice) {
          priceViolations.push(`${product.productName}: Giá xuất (${exportPrice}) < Giá nhập (${importPrice})`);
        }
      }
    }
    if (priceViolations.length > 0) {
      setError(`Giá xuất phải lớn hơn hoặc bằng giá nhập!\n${priceViolations.join("; ")}`);
      return;
    }

    try {
      // Chuẩn bị dữ liệu gửi đi
      const requestData = {
        products: selectedProducts.map((p) => ({
          productId: p._id,
          requestQuantity: parseInt(p.quantity, 10) || 1,
          exportPrice: parseFloat(p.exportPrice) || 0,
        })),
        transactionType: "export",
        status: "pending",
        branch: branch,
      };

      console.log(
        "📤 Dữ liệu gửi lên API:",
        JSON.stringify(requestData, null, 2)
      );

      const response = await authorApi.post(
        "/inventoryTransactions/createTransaction",
        requestData
      );

      console.log("✅ API response:", response.data);

      setMessage("Phiếu xuất kho đã được tạo thành công!");
      setSelectedProducts([]);
      setError("");
    } catch (error) {
      console.error("❌ Error details:", error);

      if (error.response) {
        console.error("❌ Response data:", error.response.data);
        console.error("❌ Response status:", error.response.status);
        setError(
          error.response.data.message || "Lỗi khi xuất kho, vui lòng thử lại."
        );
      } else if (error.request) {
        console.error("❌ Request was made but no response received");
        setError(
          "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        console.error("❌ Error setting up request:", error.message);
        setError("Lỗi khi tạo yêu cầu: " + error.message);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 5 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: palette.white,
            position: "relative",
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: palette.dark, fontWeight: "500", mb: 3 }}
          >
            Tạo phiếu xuất kho
          </Typography>

          {message && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
              <CircularProgress sx={{ color: palette.medium }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <Typography variant="h6" gutterBottom>
                    Tìm kiếm sản phẩm
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Nhập tên sản phẩm để tìm kiếm..."
                    variant="outlined"
                    value={search}
                    onChange={handleSearch}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  <AnimatePresence>
                    {filteredProducts.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Paper
                          elevation={3}
                          sx={{
                            maxHeight: 300,
                            overflowY: "auto",
                            mb: 2,
                          }}
                        >
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                  <TableCell>Hình ảnh</TableCell>
                                  <TableCell>Tên sản phẩm</TableCell>
                                  <TableCell align="right">Có sẵn</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {filteredProducts.map((product, index) => (
                                  <TableRow
                                    key={index}
                                    hover
                                    onClick={() => handleSelectProduct(product)}
                                    sx={{ cursor: "pointer" }}
                                  >
                                    <TableCell>
                                      <Box
                                        component="img"
                                        sx={{
                                          width: 50,
                                          height: 50,
                                          borderRadius: 1,
                                          objectFit: "cover",
                                        }}
                                        src={
                                          product?.productImage
                                            ? `http://localhost:9999${product?.productImage}`
                                            : "http://localhost:9999/uploads/default-product.png"
                                        }
                                        alt={product?.productName}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {product?.productName}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      {product?.totalStock} {product?.unit}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Paper>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Box sx={{ mt: 2, display: "flex", gap: 2, alignItems: "center" }}>
                    <FormControl fullWidth>
                      <InputLabel>Chi nhánh</InputLabel>
                      <Select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        label="Chi nhánh"
                      >
                        {branches.map((b) => (
                          <MenuItem key={b._id} value={b._id}>
                            {b.name} - {b.address}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      onClick={() => setOpenCreateBranch(true)}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Tạo chi nhánh
                    </Button>
                  </Box>
                  <CreateBranchDialog
                    open={openCreateBranch}
                    onClose={() => setOpenCreateBranch(false)}
                    onSuccess={handleCreateBranchSuccess}
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <Typography variant="h6" gutterBottom>
                    Danh sách sản phẩm xuất kho
                  </Typography>

                  {selectedProducts.length === 0 ? (
                    <Paper
                      elevation={0}
                      variant="outlined"
                      sx={{
                        p: 4,
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#f8f9fa",
                        minHeight: 200,
                      }}
                    >
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ textAlign: "center" }}
                      >
                        Chưa có sản phẩm nào được chọn
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1, textAlign: "center" }}
                      >
                        Tìm kiếm và chọn sản phẩm để thêm vào phiếu xuất
                      </Typography>
                    </Paper>
                  ) : (
                    <TableContainer
                      component={Paper}
                      variant="outlined"
                      sx={{ maxHeight: 350, overflowY: "auto" }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                            <TableCell>Sản phẩm</TableCell>
                            <TableCell align="center">Số lượng</TableCell>
                            <TableCell align="center">Giá xuất</TableCell>
                            <TableCell align="right">Thao tác</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedProducts.map((product, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <Box
                                    component="img"
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      mr: 2,
                                      borderRadius: 1,
                                      objectFit: "cover",
                                    }}
                                    src={
                                      product?.productImage
                                        ? `http://localhost:9999${product?.productImage}`
                                        : "http://localhost:9999/uploads/default-product.png"
                                    }
                                    alt={product?.productName}
                                  />
                                  <Typography
                                    variant="body2"
                                    noWrap
                                    sx={{ maxWidth: 150 }}
                                  >
                                    {product?.productName}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <TextField
                                  size="small"
                                  type="number"
                                  inputProps={{
                                    min: 1,
                                    style: { textAlign: "center" },
                                  }}
                                  value={product.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(index, e.target.value)
                                  }
                                  sx={{ width: 70 }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <TextField
                                  size="small"
                                  type="number"
                                  inputProps={{
                                    min: 0,
                                    step: "0.01",
                                    style: { textAlign: "center" },
                                  }}
                                  value={product.exportPrice}
                                  onChange={(e) =>
                                    handleExportPriceChange(index, e.target.value)
                                  }
                                  sx={{ width: 90 }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => {
                                    setModalProduct(product);
                                    setShowModal(true);
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveProduct(index)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </motion.div>
              </Grid>
            </Grid>
          )}

          <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate("/export")}
              startIcon={<ArrowBackIcon />}
            >
              Danh sách phiếu xuất
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={selectedProducts.length === 0 || loading}
              sx={{
                bgcolor: palette.medium,
                "&:hover": { bgcolor: palette.dark },
              }}
              startIcon={<AddIcon />}
            >
              Tạo phiếu xuất
            </Button>
          </Box>
        </Paper>
      </motion.div>

      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="sm"
      >
        <DialogTitle>Chi tiết sản phẩm</DialogTitle>
        <DialogContent dividers>
          {modalProduct && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card elevation={0}>
                  <CardMedia
                    component="img"
                    image={
                      modalProduct.productImage
                        ? `http://localhost:9999${modalProduct.productImage}`
                        : "http://localhost:9999/uploads/default-product.png"
                    }
                    alt={modalProduct.productName}
                    sx={{ height: 150, objectFit: "contain" }}
                  />
                </Card>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant="h6" gutterBottom>
                  {modalProduct.productName}
                </Typography>
                <Typography variant="body2">
                  <strong>Danh mục:</strong>{" "}
                  {getCategoryName(modalProduct.categoryId)}
                </Typography>
                <Typography variant="body2">
                  <strong>Tồn kho:</strong> {modalProduct.stock || 0}{" "}
                  {modalProduct.unit}
                </Typography>
                <Typography variant="body2">
                  <strong>Vị trí:</strong>{" "}
                  {modalProduct.location
                    ? Array.isArray(modalProduct.location)
                      ? modalProduct.location
                        .map(
                          (loc) =>
                            `${loc.inventoryId?.name || "Không rõ"}: ${loc.stock
                            } ${modalProduct.unit}`
                        )
                        .join(", ")
                      : "Không rõ"
                    : "Chưa có"}
                </Typography>
                {modalProduct.description && (
                  <Typography variant="body2">
                    <strong>Mô tả:</strong> {modalProduct.description}
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExportProduct;
