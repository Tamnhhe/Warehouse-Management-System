import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import {
  Container, Box, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TableSortLabel, CircularProgress, Alert, Stack, Avatar,
  ButtonGroup, useMediaQuery, useTheme, Card, CardContent, CardActions, Grid, TableFooter,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, FormControl,
  InputLabel, Select, FormHelperText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { visuallyHidden } from "@mui/utils";
import { motion, AnimatePresence } from "framer-motion";
import UpdateProductModal from "./UpdateProductModal";
import ProductDetails from "./ProductDetails";
import InventoryCheck from "../Inventory_Components/InventoryCheck";

const DESKTOP_PAGE_SIZE = 20;
const MOBILE_PAGE_SIZE = 10;

const listContainerVariants = {
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
  exit: {
    y: -20,
    opacity: 0,
  }
};

// --- AddProduct Component với kiểm tra kệ đầy đúng ---
const AddProduct = ({ open, handleClose, onSaveSuccess }) => {
  const [productData, setProductData] = useState({
    productName: "", categoryId: "", totalStock: 0,
    productImage: null, unit: "", inventoryId: ""
    // Không có status ở đây
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [filteredInventories, setFilteredInventories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fullShelfError, setFullShelfError] = useState("");

  useEffect(() => {
    if (open) {
      axios.get("http://localhost:9999/categories/getAllCategories")
        .then((response) => setCategories(response.data))
        .catch((error) => console.error("Error fetching categories:", error));
      axios.get("http://localhost:9999/inventory")
        .then((response) => setInventories(response.data))
        .catch((error) => console.error("Error fetching inventories:", error));
    } else {
      setProductData({
        productName: "", categoryId: "", totalStock: 0,
        productImage: null, unit: "", inventoryId: ""
      });
      setErrors({});
      setImagePreview(null);
      setLoading(false);
      setFilteredInventories([]);
      setFullShelfError("");
    }
  }, [open]);

  // Lọc lại danh sách kệ khi chọn danh mục
  useEffect(() => {
    if (productData.categoryId) {
      setFilteredInventories(
        inventories.filter(inv =>
          String(inv.categoryId) === String(productData.categoryId) ||
          (inv.category && String(inv.category._id) === String(productData.categoryId))
        )
      );
      if (!inventories.some(inv =>
        inv._id === productData.inventoryId &&
        (String(inv.categoryId) === String(productData.categoryId) ||
         (inv.category && String(inv.category._id) === String(productData.categoryId)))
      )) {
        setProductData(prev => ({ ...prev, inventoryId: "" }));
      }
    } else {
      setFilteredInventories([]);
      setProductData(prev => ({ ...prev, inventoryId: "" }));
    }
    setFullShelfError("");
  }, [productData.categoryId, inventories]);

  // Kiểm tra kệ đầy khi chọn
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "inventoryId") {
      const selectedInv = filteredInventories.find(inv => inv._id === value);
      const isFull =
        (typeof selectedInv?.maxQuantitative === "number" && typeof selectedInv?.currentQuantitative === "number" && selectedInv.currentQuantitative >= selectedInv.maxQuantitative);
      if (isFull) {
        setFullShelfError("Kệ đã đầy vui lòng chọn kệ khác");
      } else {
        setFullShelfError("");
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductData((prev) => ({ ...prev, productImage: file }));
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setProductData((prev) => ({ ...prev, productImage: null }));
      setImagePreview(null);
    }
    if (errors.productImage) {
      setErrors((prev) => ({ ...prev, productImage: "" }));
    }
  };

  const validate = async () => {
    let tempErrors = {};
    tempErrors.productName = productData.productName ? "" : "Tên sản phẩm không được bỏ trống.";
    tempErrors.categoryId = productData.categoryId ? "" : "Vui lòng chọn danh mục.";
    tempErrors.unit = productData.unit ? "" : "Đơn vị không được bỏ trống.";
    tempErrors.inventoryId = productData.inventoryId ? "" : "Vui lòng chọn vị trí (kệ).";
    if (!productData.productImage) {
      tempErrors.productImage = "Vui lòng chọn hình ảnh sản phẩm.";
    } else if (!["image/jpeg", "image/png"].includes(productData.productImage.type)) {
      tempErrors.productImage = "Hình ảnh phải là định dạng JPEG hoặc PNG.";
    } else {
      tempErrors.productImage = "";
    }
    setErrors(tempErrors);

    const isFormValid = Object.values(tempErrors).every((x) => x === "");

    if (isFormValid) {
      try {
        const response = await axios.get(`http://localhost:9999/products/checkProductName?name=${productData.productName}`);
        if (response.data.exists) {
          setErrors(prev => ({ ...prev, productName: "Sản phẩm đã tồn tại trong kho." }));
          return false;
        }
        // Kiểm tra kệ đầy khi lưu
        const selectedInv = filteredInventories.find(inv => inv._id === productData.inventoryId);
        const isFull =
          (typeof selectedInv?.maxQuantitative === "number" && typeof selectedInv?.currentQuantitative === "number" && selectedInv.currentQuantitative >= selectedInv.maxQuantitative);
        if (isFull) {
          setFullShelfError("Kệ đã đầy vui lòng chọn kệ khác");
          return false;
        }
        setFullShelfError("");
        return true;
      } catch (error) {
        console.error("Error checking product name:", error);
        setErrors(prev => ({ ...prev, general: "Có lỗi khi kiểm tra tên sản phẩm." }));
        return false;
      }
    }
    return false;
  };

  const handleSave = async () => {
    setErrors(prev => ({ ...prev, general: "" }));
    setFullShelfError("");
    if (await validate()) {
      setLoading(true);
      const formData = new FormData();
      Object.entries(productData).forEach(([key, value]) => formData.append(key, value));
      formData.append("status", "active"); // Luôn là đang bán

      try {
        await axios.post("http://localhost:9999/products/createProduct", formData, { headers: { "Content-Type": "multipart/form-data" } });
        onSaveSuccess();
        handleClose();
      } catch (error) {
        console.error("Error creating product:", error);
        setErrors((prev) => ({ ...prev, general: error.response?.data?.message || "Có lỗi xảy ra." }));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Thêm Sản Phẩm </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {errors.general && <Alert severity="error">{errors.general}</Alert>}
          <TextField autoFocus name="productName" label="Tên Sản Phẩm" value={productData.productName} onChange={handleChange} error={!!errors.productName} helperText={errors.productName} fullWidth />
          <FormControl fullWidth error={!!errors.categoryId}>
            <InputLabel id="category-select-label">Danh Mục</InputLabel>
            <Select labelId="category-select-label" name="categoryId" value={productData.categoryId} label="Danh Mục" onChange={handleChange}>
              <MenuItem value=""><em>Chọn danh mục</em></MenuItem>
              {categories.map((cat) => (<MenuItem key={cat._id} value={cat._id}>{cat.categoryName}</MenuItem>))}
            </Select>
            {errors.categoryId && <FormHelperText>{errors.categoryId}</FormHelperText>}
          </FormControl>
          <TextField name="unit" label="Đơn Vị (ví dụ: cái, hộp, kg)" value={productData.unit} onChange={handleChange} error={!!errors.unit} helperText={errors.unit} fullWidth />

          <FormControl fullWidth error={!!errors.inventoryId || !!fullShelfError}>
            <InputLabel id="inventory-select-label">Vị Trí (Kệ)</InputLabel>
            <Select
              labelId="inventory-select-label"
              name="inventoryId"
              value={productData.inventoryId}
              label="Vị Trí (Kệ)"
              onChange={handleChange}
              disabled={!productData.categoryId}
            >
              <MenuItem value="">
                <em>Chọn kệ</em>
              </MenuItem>
              {filteredInventories.map((inv) => {
                const isFull =
                  (typeof inv.maxQuantitative === "number" && typeof inv.currentQuantitative === "number" && inv.currentQuantitative >= inv.maxQuantitative);
                return (
                  <MenuItem key={inv._id} value={inv._id}>
                    {inv.name} {inv.category?.categoryName ? `- ${inv.category.categoryName}` : ""}
                    {isFull ? " (Kệ đã đầy)" : ""}
                  </MenuItem>
                );
              })}
            </Select>
            {errors.inventoryId && <FormHelperText>{errors.inventoryId}</FormHelperText>}
            {fullShelfError && <FormHelperText error>{fullShelfError}</FormHelperText>}
          </FormControl>

          {/* BỎ phần chọn trạng thái */}
          {/* <FormControl fullWidth>
            <InputLabel id="status-select-label">Trạng Thái</InputLabel>
            <Select labelId="status-select-label" name="status" value={productData.status} label="Trạng Thái" onChange={handleChange}>
              <MenuItem value="active">Đang bán</MenuItem>
              <MenuItem value="inactive">Ngừng bán</MenuItem>
            </Select>
          </FormControl> */}

          <Button variant="outlined" component="label" color={errors.productImage ? "error" : "primary"}>
            Chọn Hình Ảnh
            <input type="file" hidden accept="image/png, image/jpeg" onChange={handleFileChange} />
          </Button>
          {errors.productImage && <FormHelperText error>{errors.productImage}</FormHelperText>}
          {imagePreview && <Box sx={{ mt: 2, textAlign: 'center' }}><img src={imagePreview} alt="Xem trước sản phẩm" style={{ maxWidth: "200px", height: "auto", borderRadius: '8px' }} /></Box>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={handleClose} disabled={loading} color="secondary">Hủy</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : "Lưu Sản Phẩm"}</Button>
      </DialogActions>
    </Dialog>
  );
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // States for filtering and sorting
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [sortBy, setSortBy] = useState("productName");
  const [sortDirection, setSortDirection] = useState("asc");

  // States for modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Thêm state để lưu danh sách kệ
  const [inventories, setInventories] = useState([]);

  // Ref để gọi fetchInventories từ InventoryCheck
  const fetchInventoriesRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [itemsToShow, setItemsToShow] = useState(
    isMobile ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, supplierProductsRes] = await Promise.all([
        axios.get("http://localhost:9999/products/getAllProducts"),
        axios.get("http://localhost:9999/supplierProducts/getAllSupplierProducts"),
      ]);
      const productsData = productsRes.data;
      const supplierProducts = supplierProductsRes.data;
      const latestPrices = {}, priceMap = {};
      supplierProducts.forEach((sp) => {
        const productId = sp.product?._id;
        if (!productId) return;
        if (!latestPrices[productId]) latestPrices[productId] = sp.price;
        if (!priceMap[productId]) priceMap[productId] = [];
        priceMap[productId].push(sp.price);
      });
      const avgPrices = Object.entries(priceMap).reduce((acc, [productId, prices]) => {
        const sum = prices.reduce((total, price) => total + price, 0);
        acc[productId] = prices.length > 0 ? Math.round(sum / prices.length) : 0;
        return acc;
      }, {});
      const updatedProducts = productsData.map((p) => ({
        ...p,
        latestPrice: latestPrices[p._id] || 0,
        avgPrice: avgPrices[p._id] || 0,
      }));
      setProducts(updatedProducts);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy danh sách kệ khi load ProductList
  const fetchInventories = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:9999/inventory");
      setInventories(res.data);
    } catch {
      setInventories([]);
    }
  }, []);

  useEffect(() => {
    fetchInventories();
  }, [fetchInventories]);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // Hàm gọi lại cả fetchAllProducts và fetchInventories (InventoryCheck)
  const handleUpdateSuccess = () => {
    fetchAllProducts();
    // Gọi InventoryCheck reload lại dữ liệu kệ
    if (fetchInventoriesRef.current) {
      fetchInventoriesRef.current();
    }
    // Đồng bộ lại danh sách kệ ở ProductList (nếu cần)
    fetchInventories();
  };

  const filteredProducts = useMemo(() => {
    let updatedProducts = [...products];
    if (filterText) {
      updatedProducts = updatedProducts.filter((product) =>
        product.productName.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    if (statusFilter !== null) {
      updatedProducts = updatedProducts.filter(
        (product) => product.status === (statusFilter ? "active" : "inactive")
      );
    }
    updatedProducts.sort((a, b) => {
      const isAsc = sortDirection === "asc";
      const aVal = a[sortBy] || ''; const bVal = b[sortBy] || '';
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return isAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return isAsc ? aVal - bVal : bVal - aVal;
    });
    return updatedProducts;
  }, [products, filterText, sortBy, sortDirection, statusFilter]);

  useEffect(() => {
    setItemsToShow(isMobile ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE);
  }, [filterText, statusFilter, isMobile]);

  const handleSort = (column) => {
    const isAsc = sortBy === column && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortBy(column);
  };
  const handleOpenUpdateModal = (product) => { setSelectedProduct(product); setShowUpdateModal(true); };
  const handleOpenProductDetailsModal = (product) => { setSelectedProduct(product); setShowProductDetailsModal(true); };
  const handleChangeStatus = async (productId, currentStatus) => {
    if (!window.confirm("Bạn có chắc chắn muốn thay đổi trạng thái?")) return;
    try {
      await axios.put(`http://localhost:9999/products/inactivateProduct/${productId}`, { status: currentStatus === "active" ? "inactive" : "active" });
      await fetchAllProducts();
    } catch (err) {
      setDeleteError("Có lỗi xảy ra khi thay đổi trạng thái.");
      console.error("Change Status Error:", err);
    }
  };

  const observer = useRef();
  const hasMore = itemsToShow < filteredProducts.length;

  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setItemsToShow((prev) => prev + (isMobile ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE));
      setIsLoadingMore(false);
    }, 500);
  }, [isMobile]);

  const lastItemElementRef = useCallback(
    (node) => {
      if (isLoadingMore || loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          handleLoadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoadingMore, loading, hasMore, handleLoadMore]
  );

  const renderStatusChip = (status) => (
    <Box component="span" sx={{ color: "white", bgcolor: status === "active" ? "success.main" : "error.main", p: "4px 10px", borderRadius: "16px", display: "inline-block", fontSize: "0.75rem", fontWeight: "bold", textAlign: "center", }}>{status === "active" ? "Đang Bán" : "Ngừng Bán"}</Box>
  );
  const headCells = [
    { id: 'productImage', label: 'Hình Ảnh', sortable: false },
    { id: 'productName', label: 'Tên Sản Phẩm', sortable: true },
    { id: 'totalStock', label: 'Tổng SL', sortable: true, align: 'center' },
    { id: 'avgPrice', label: 'Giá TB', sortable: true, align: 'right' },
    { id: 'latestPrice', label: 'Giá Mới', sortable: true, align: 'right' },
    { id: 'unit', label: 'Đơn Vị', sortable: true },
    { id: 'inventoryId', label: 'Vị Trí', sortable: true },
    { id: 'status', label: 'Trạng Thái', sortable: true },
    { id: 'actions', label: 'Hành Động', sortable: false, align: 'center' },
  ];

  if (loading && products.length === 0) {
    return (<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>);
  }
  if (error) {
    return (<Container><Alert severity="error" sx={{ mt: 2 }}>{error}</Alert></Container>);
  }

  return (
    <Container maxWidth={false} disableGutters sx={{ p: { xs: 1, sm: 2, md: 3 }, mt: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>Quản Lý Sản Phẩm</Typography>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowAddProductModal(true)}>
          Thêm Sản Phẩm
        </Button>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          <TextField
            label="Tìm kiếm sản phẩm..."
            variant="outlined"
            size="small"
            fullWidth
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            sx={{ minWidth: { sm: 250, md: 300 } }}
          />
          <ButtonGroup variant="outlined" fullWidth>
            <Button onClick={() => setStatusFilter(true)} variant={statusFilter === true ? "contained" : "outlined"}>Đang Bán</Button>
            <Button onClick={() => setStatusFilter(false)} variant={statusFilter === false ? "contained" : "outlined"}>Ngừng Bán</Button>
            <Button onClick={() => setStatusFilter(null)} variant={statusFilter === null ? "contained" : "outlined"}>Tất Cả</Button>
          </ButtonGroup>
        </Stack>
      </Stack>
      {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
      {isMobile ? (
        <Box
          component={motion.div}
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredProducts.slice(0, itemsToShow).map((product, index, arr) => (
              <Box component={motion.div} key={product._id} variants={itemVariants} exit="exit">
                <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Card
                    elevation={2}
                    onClick={() => handleOpenProductDetailsModal(product)}
                    sx={{ mb: 2 }}
                    ref={index === arr.length - 1 ? lastItemElementRef : null}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={3}>
                          <Avatar variant="rounded" src={product.productImage ? `http://localhost:9999${product.productImage}` : "http://localhost:9999/uploads/default-product.png"} alt={product.productName} sx={{ width: '100%', height: 'auto' }} />
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="h6" component="div" noWrap>{product.productName}</Typography>
                          <Typography variant="body2" color="text.secondary">Tồn kho: <strong>{product.totalStock}</strong> {product.unit}</Typography>
                          <Typography variant="body1" color="primary.main" fontWeight="bold">{product.latestPrice.toLocaleString("vi-VN")} VND</Typography>
                          {renderStatusChip(product.status)}
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                      <Button size="small" color="warning" variant="outlined" onClick={(e) => { e.stopPropagation(); handleOpenUpdateModal(product); }}>Sửa</Button>
                      <Button size="small" color={product.status === "active" ? "error" : "success"} variant="outlined" onClick={(e) => { e.stopPropagation(); handleChangeStatus(product._id, product.status); }}>{product.status === "active" ? "Vô hiệu" : "Kích hoạt"}</Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Box>
            ))}
          </AnimatePresence>
        </Box>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>{headCells.map((headCell) => (
                  <TableCell key={headCell.id} align={headCell.align || 'left'} sortDirection={sortBy === headCell.id ? sortDirection : false}>
                    {headCell.sortable ? (
                      <TableSortLabel active={sortBy === headCell.id} direction={sortBy === headCell.id ? sortDirection : 'asc'} onClick={() => handleSort(headCell.id)}>
                        {headCell.label}
                        {sortBy === headCell.id ? (
                          <Box component="span" sx={visuallyHidden}>
                            {sortDirection === 'desc' ? 'sorted descending' : 'sorted ascending'}
                          </Box>
                        ) : null}
                      </TableSortLabel>
                    ) : (headCell.label)}
                  </TableCell>
                ))}</TableRow>
              </TableHead>
              <Box
                component={motion.tbody}
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {filteredProducts.slice(0, itemsToShow).map((product, index, arr) => (
                    <TableRow
                      component={motion.tr}
                      key={product._id}
                      variants={itemVariants}
                      exit="exit"
                      layout
                      hover
                      onClick={() => handleOpenProductDetailsModal(product)}
                      sx={{ cursor: 'pointer' }}
                      ref={index === arr.length - 1 ? lastItemElementRef : null}
                    >
                      <TableCell><Avatar variant="rounded" src={product.productImage ? `http://localhost:9999${product.productImage}` : "http://localhost:9999/uploads/default-product.png"} alt={product.productName} /></TableCell>
                      <TableCell><Typography variant="body2" fontWeight="medium">{product.productName}</Typography></TableCell>
                      <TableCell align="center">{product.totalStock}</TableCell>
                      <TableCell align="right">{product.avgPrice.toLocaleString("vi-VN")} VND</TableCell>
                      <TableCell align="right">{product.latestPrice.toLocaleString("vi-VN")} VND</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>
                        {
                          (() => {
                            // Tìm kệ chứa sản phẩm này dựa vào inventories
                            const foundInv = inventories.find(inv =>
                              Array.isArray(inv.products) &&
                              inv.products.some(p =>
                                (p.productId && (p.productId._id || p.productId) === product._id)
                              )
                            );
                            return foundInv ? foundInv.name : "";
                          })()
                        }
                      </TableCell>
                      <TableCell>{renderStatusChip(product.status)}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} onClick={(e) => e.stopPropagation()}>
                          <Button variant="outlined" color="warning" size="small" onClick={() => handleOpenUpdateModal(product)}>Sửa</Button>
                          <Button variant="outlined" color={product.status === "active" ? "error" : "success"} size="small" onClick={() => handleChangeStatus(product._id, product.status)}>{product.status === "active" ? "Vô hiệu" : "Kích hoạt"}</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </AnimatePresence>
              </Box>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={headCells.length} sx={{ textAlign: 'center', borderBottom: 'none' }}>
                    {isLoadingMore && <CircularProgress size={30} sx={{ my: 1 }} />}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Paper>
      )}

     {selectedProduct && (
  <>
    <ProductDetails
      open={showProductDetailsModal}
      handleClose={() => setShowProductDetailsModal(false)}
      product={selectedProduct}
    />
    <UpdateProductModal
      open={showUpdateModal}
      handleClose={() => setShowUpdateModal(false)}
      product={selectedProduct}
      onUpdateSuccess={handleUpdateSuccess}
      inventories={inventories} // <-- truyền inventories từ ProductList
    />
  </>
)}

      <AddProduct
        open={showAddProductModal}
        handleClose={() => setShowAddProductModal(false)}
        onSaveSuccess={handleUpdateSuccess}
      />

   
    </Container>
  );
};

export default ProductList;