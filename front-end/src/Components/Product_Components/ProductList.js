import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  ButtonGroup,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { visuallyHidden } from "@mui/utils";

// Giả sử các component Modal này đã được cập nhật để dùng MUI Dialog
import UpdateProductModal from "./UpdateProductModal";
import ProductDetails from "./ProductDetails";
import AddProduct from "./AddProduct";

const ProductList = () => {
  // --- State Management ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // States for filtering and sorting
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null); // null: all, true: active, false: inactive
  const [sortBy, setSortBy] = useState("productName");
  const [sortDirection, setSortDirection] = useState("asc");

  // States for modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // --- Data Fetching ---
  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, supplierProductsRes] = await Promise.all([
        axios.get("http://localhost:9999/products/getAllProducts"),
        axios.get(
          "http://localhost:9999/supplierProducts/getAllSupplierProducts"
        ),
      ]);

      const productsData = productsRes.data;
      const supplierProducts = supplierProductsRes.data;

      const latestPrices = {};
      const priceMap = {};

      supplierProducts.forEach((sp) => {
        const productId = sp.product?._id;
        if (!productId) return;

        if (!latestPrices[productId]) {
          latestPrices[productId] = sp.price;
        }
        if (!priceMap[productId]) priceMap[productId] = [];
        priceMap[productId].push(sp.price);
      });

      const avgPrices = Object.entries(priceMap).reduce(
        (acc, [productId, prices]) => {
          const sum = prices.reduce((total, price) => total + price, 0);
          acc[productId] = prices.length > 0 ? Math.round(sum / prices.length) : 0;
          return acc;
        },
        {}
      );

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

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // --- Memoized Filtering and Sorting ---
  const filteredProducts = useMemo(() => {
    let updatedProducts = [...products];

    if (filterText) {
      updatedProducts = updatedProducts.filter((product) =>
        product.productName.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    if (statusFilter !== null) {
      const targetStatus = statusFilter ? "active" : "inactive";
      updatedProducts = updatedProducts.filter(
        (product) => product.status === targetStatus
      );
    }

    updatedProducts.sort((a, b) => {
      const isAsc = sortDirection === "asc";
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return isAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return isAsc ? aVal - bVal : bVal - aVal;
    });

    return updatedProducts;
  }, [products, filterText, sortBy, sortDirection, statusFilter]);

  // --- Handlers ---
  const handleSort = (column) => {
    const isAsc = sortBy === column && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortBy(column);
  };

  const handleOpenUpdateModal = (product) => {
    setSelectedProduct(product);
    setShowUpdateModal(true);
  };

  const handleOpenProductDetailsModal = (product) => {
    setSelectedProduct(product);
    setShowProductDetailsModal(true);
  };

  const handleChangeStatus = async (productId, currentStatus) => {
    if (!window.confirm("Bạn có chắc chắn muốn thay đổi trạng thái của sản phẩm không?")) return;

    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await axios.put(
        `http://localhost:9999/products/inactivateProduct/${productId}`,
        { status: newStatus }
      );
      // Refresh data to get the latest state
      fetchAllProducts();
    } catch (err) {
      setDeleteError("Có lỗi xảy ra khi thay đổi trạng thái sản phẩm.");
      console.error("Change Status Error:", err);
    }
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Container>
    );
  }

  const headCells = [
    { id: 'productImage', label: 'Hình Ảnh', sortable: false },
    { id: 'productName', label: 'Tên Sản Phẩm', sortable: true },
    { id: 'totalStock', label: 'Tổng SL', sortable: true, align: 'center' },
    { id: 'avgPrice', label: 'Giá TB', sortable: true, align: 'right' },
    { id: 'latestPrice', label: 'Giá Mới', sortable: true, align: 'right' },
    { id: 'unit', label: 'Đơn Vị', sortable: true },
    { id: 'location', label: 'Vị Trí', sortable: true },
    { id: 'status', label: 'Trạng Thái', sortable: true },
    { id: 'actions', label: 'Hành Động', sortable: false, align: 'center' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Quản Lý Sản Phẩm
      </Typography>

      {/* --- Filter and Actions Bar --- */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddProductModal(true)}
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          Thêm Sản Phẩm
        </Button>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="flex-start" // Align items to the left
          justifyContent="flex-start" // Move sorting menu to the left
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          <TextField
            label="Tìm kiếm sản phẩm..."
            variant="outlined"
            size="small"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            sx={{ width: { xs: '100%', sm: 300 } }}
          />
          <ButtonGroup variant="outlined" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              onClick={() => setStatusFilter(true)}
              variant={statusFilter === true ? "contained" : "outlined"}
            >
              Đang Bán
            </Button>
            <Button
              onClick={() => setStatusFilter(false)}
              variant={statusFilter === false ? "contained" : "outlined"}
            >
              Ngừng Bán
            </Button>
            <Button
              onClick={() => setStatusFilter(null)}
              variant={statusFilter === null ? "contained" : "outlined"}
            >
              Tất Cả
            </Button>
          </ButtonGroup>
        </Stack>
      </Stack>

      {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}

      {/* --- Products Table --- */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.align || 'left'}
                    sortDirection={sortBy === headCell.id ? sortDirection : false}
                  >
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={sortBy === headCell.id}
                        direction={sortBy === headCell.id ? sortDirection : 'asc'}
                        onClick={() => handleSort(headCell.id)}
                      >
                        {headCell.label}
                        {sortBy === headCell.id ? (
                          <Box component="span" sx={visuallyHidden}>
                            {sortDirection === 'desc' ? 'sorted descending' : 'sorted ascending'}
                          </Box>
                        ) : null}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow
                  hover
                  key={product._id}
                  onClick={() => handleOpenProductDetailsModal(product)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={
                        product.productImage
                          ? `http://localhost:9999${product.productImage}`
                          : "http://localhost:9999/uploads/default-product.png"
                      }
                      alt={product.productName}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {product.productName}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{product.totalStock}</TableCell>
                  <TableCell align="right">
                    {product.avgPrice.toLocaleString("vi-VN")} VND
                  </TableCell>
                  <TableCell align="right">
                    {product.latestPrice.toLocaleString("vi-VN")} VND
                  </TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell>{product.location}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        color: 'white', // Set text color to white
                        bgcolor: product.status === 'active' ? 'success.light' : 'error.light',
                        p: '4px 8px',
                        borderRadius: '12px',
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {product.status === "active" ? "Đang Bán" : "Ngừng Bán"}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Stack 
                      direction="row" 
                      spacing={1} 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        onClick={() => handleOpenUpdateModal(product)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="outlined"
                        color={product.status === "active" ? "error" : "success"}
                        size="small"
                        onClick={() => handleChangeStatus(product._id, product.status)}
                      >
                        {product.status === "active" ? "Vô hiệu" : "Kích hoạt"}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* --- Modals --- */}
      {selectedProduct && (
        <>
          <ProductDetails
            show={showProductDetailsModal}
            handleClose={() => setShowProductDetailsModal(false)}
            product={selectedProduct}
          />
          <UpdateProductModal
            show={showUpdateModal}
            handleClose={() => setShowUpdateModal(false)}
            product={selectedProduct}
            onUpdateSuccess={fetchAllProducts} // Thay đổi prop để dễ hiểu hơn
          />
        </>
      )}

      <AddProduct
        show={showAddProductModal}
        handleClose={() => setShowAddProductModal(false)}
        onSaveSuccess={fetchAllProducts} // Thay đổi prop để dễ hiểu hơn
      />
    </Container>
  );
};

export default ProductList;