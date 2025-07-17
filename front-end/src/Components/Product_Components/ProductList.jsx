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

// --- BƯỚC 1: IMPORT FRAMER MOTION ---
import { motion, AnimatePresence } from "framer-motion";

// Import the AddProduct component from the separate file
import AddProduct from "./AddProduct";
import UpdateProductModal from "./UpdateProductModal";
import ProductDetails from "./ProductDetails";

const DESKTOP_PAGE_SIZE = 20;
const MOBILE_PAGE_SIZE = 10;

// --- BƯỚC 2: ĐỊNH NGHĨA CÁC VARIANTS CHO ANIMATION ---
const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Thời gian trễ giữa các item con
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


// Remove the AddProduct component definition here since it's now in its own file


const ProductList = () => {
  // ... state và các hàm khác giữ nguyên ...
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

  // --- Responsive Design & Unified State for Infinite Scroll ---
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
      // const supplierProducts = supplierProductsRes.data;
      // const latestPrices = {}, priceMap = {};
      // supplierProducts.forEach((sp) => {
      //   const productId = sp.product?._id;
      //   if (!productId) return;
      //   if (!latestPrices[productId]) latestPrices[productId] = sp.price;
      //   if (!priceMap[productId]) priceMap[productId] = [];
      //   priceMap[productId].push(sp.price);
      // });
      // const avgPrices = Object.entries(priceMap).reduce((acc, [productId, prices]) => {
      //   const sum = prices.reduce((total, price) => total + price, 0);
      //   acc[productId] = prices.length > 0 ? Math.round(sum / prices.length) : 0;
      //   return acc;
      // }, {});
      const updatedProducts = productsData.map((p) => ({
        ...p,
        // latestPrice: latestPrices[p._id] || 0,
        // avgPrice: avgPrices[p._id] || 0,
        latestPrice: 0,
        avgPrice: 0,
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

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

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

  const renderStatusChip = (status) => (<Box component="span" sx={{ color: "white", bgcolor: status === "active" ? "success.main" : "error.main", p: "4px 10px", borderRadius: "16px", display: "inline-block", fontSize: "0.75rem", fontWeight: "bold", textAlign: "center", }}>{status === "active" ? "Đang Bán" : "Ngừng Bán"}</Box>);
  const headCells = [{ id: 'productImage', label: 'Hình Ảnh', sortable: false }, { id: 'productName', label: 'Tên Sản Phẩm', sortable: true }, { id: 'totalStock', label: 'Tổng SL', sortable: true, align: 'center' }, { id: 'avgPrice', label: 'Giá TB', sortable: true, align: 'right' }, { id: 'latestPrice', label: 'Giá Mới', sortable: true, align: 'right' }, { id: 'unit', label: 'Đơn Vị', sortable: true }, { id: 'location', label: 'Vị Trí', sortable: true }, { id: 'status', label: 'Trạng Thái', sortable: true }, { id: 'actions', label: 'Hành Động', sortable: false, align: 'center' },];

  if (loading && products.length === 0) {
    return (<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>);
  }
  if (error) {
    return (<Container><Alert severity="error" sx={{ mt: 2 }}>{error}</Alert></Container>);
  }


  return (
    <Container maxWidth={false} disableGutters sx={{ p: { xs: 1, sm: 2, md: 3 }, mt: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>Quản Lý Sản Phẩm</Typography>

      {/* --- BƯỚC 3: CẢI TIẾN THANH LỌC --- */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }} // Stretch trên mobile, center trên desktop
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowAddProductModal(true)}>
          Thêm Sản Phẩm
        </Button>

        {/* Nhóm các control tìm kiếm và lọc vào một Stack */}
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
        // --- BƯỚC 4: ÁP DỤNG MOTION CHO MOBILE VIEW ---
        <>
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
                      sx={{ mb: 2 }} // Thêm margin bottom cho mỗi card
                      ref={index === arr.length - 1 ? lastItemElementRef : null}
                    >
                      <CardContent><Grid container spacing={2} alignItems="center"><Grid item xs={3}><Avatar variant="rounded" src={product.productImage ? `http://localhost:9999${product.productImage}` : "http://localhost:9999/uploads/default-product.png"} alt={product.productName} sx={{ width: '100%', height: 'auto' }} /></Grid><Grid item xs={9}><Typography variant="h6" component="div" noWrap>{product.productName}</Typography><Typography variant="body2" color="text.secondary">Tồn kho: <strong>{product.totalStock}</strong> {product.unit}</Typography><Typography variant="body1" color="primary.main" fontWeight="bold">{product.latestPrice.toLocaleString("vi-VN")} VND</Typography>{renderStatusChip(product.status)}</Grid></Grid></CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}><Button size="small" color="warning" variant="outlined" onClick={(e) => { e.stopPropagation(); handleOpenUpdateModal(product); }}>Sửa</Button><Button size="small" color={product.status === "active" ? "error" : "success"} variant="outlined" onClick={(e) => { e.stopPropagation(); handleChangeStatus(product._id, product.status); }}>{product.status === "active" ? "Vô hiệu" : "Kích hoạt"}</Button></CardActions>
                    </Card>
                  </motion.div>
                </Box>
              ))}
            </AnimatePresence>
          </Box>
          {isLoadingMore && <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
        </>
      ) : (
        // --- BƯỚC 5: ÁP DỤNG MOTION CHO DESKTOP VIEW ---
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>{headCells.map((headCell) => (<TableCell key={headCell.id} align={headCell.align || 'left'} sortDirection={sortBy === headCell.id ? sortDirection : false}>{headCell.sortable ? (<TableSortLabel active={sortBy === headCell.id} direction={sortBy === headCell.id ? sortDirection : 'asc'} onClick={() => handleSort(headCell.id)}>{headCell.label}{sortBy === headCell.id ? (<Box component="span" sx={visuallyHidden}>{sortDirection === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box>) : null}</TableSortLabel>) : (headCell.label)}</TableCell>))}</TableRow>
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
                      layout // Prop quan trọng giúp animation mượt mà khi lọc/sắp xếp
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
                      {/* <TableCell>{product.location}</TableCell> */}
                      <TableCell>
                        {product.location.map((loc, idx) => (
                          <Box key={idx} sx={{ display: 'inline-block', mr: 1, mb: 1, p: 0.5, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
                            {loc.inventoryId} ({loc.stock})
                          </Box>
                        ))}
                      </TableCell>
                      <TableCell>{renderStatusChip(product.status)}</TableCell>
                      <TableCell align="center"><Stack direction="row" spacing={1} onClick={(e) => e.stopPropagation()}><Button variant="outlined" color="warning" size="small" onClick={() => handleOpenUpdateModal(product)}>Sửa</Button><Button variant="outlined" color={product.status === "active" ? "error" : "success"} size="small" onClick={() => handleChangeStatus(product._id, product.status)}>{product.status === "active" ? "Vô hiệu" : "Kích hoạt"}</Button></Stack></TableCell>
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

      {selectedProduct && (<>
        <ProductDetails open={showProductDetailsModal} handleClose={() => setShowProductDetailsModal(false)} product={selectedProduct} />
        <UpdateProductModal open={showUpdateModal} handleClose={() => setShowUpdateModal(false)} product={selectedProduct} onUpdateSuccess={fetchAllProducts} />
      </>)}

      <AddProduct
        open={showAddProductModal}
        handleClose={() => setShowAddProductModal(false)}
        onSaveSuccess={fetchAllProducts}
      />
    </Container>
  );
};

export default ProductList;