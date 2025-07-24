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
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
  Badge,
  Tooltip,
  Fade,
  Collapse,
} from "@mui/material";
import CreateBranchDialog from "./CreateBranchDialog";
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Calculate as CalculateIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
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
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const ExportProduct = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [branch, setBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [openCreateBranch, setOpenCreateBranch] = useState(false);
  const [showPriceCalculator, setShowPriceCalculator] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [expandedSummary, setExpandedSummary] = useState(true);
  const [priceCalculatorData, setPriceCalculatorData] = useState({
    basePrice: 0,
    transportCostType: 'percentage',
    transportCostPercent: 1,
    transportCostFixed: 0,
    storageCostType: 'percentage',
    storageCostPercent: 1,
    storageCostFixed: 0,
    insuranceType: 'percentage',
    insurancePercent: 1,
    insuranceFixed: 0,
    otherCostType: 'percentage',
    otherCostPercent: 2,
    otherCostFixed: 0,
    fixedCosts: 0,
    profitMarginType: 'percentage',
    profitMarginPercent: 5,
    profitMarginFixed: 0,
    formula: 'percentage'
  });
  const [customerDiscount, setCustomerDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const steps = ['Chọn sản phẩm', 'Cấu hình đơn hàng', 'Xác nhận & Tạo phiếu'];

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

  useEffect(() => {
    setLoading(true);
    authorApi
      .get("/products/getAllProducts")
      .then((response) => {
        const allProducts = response.data;
        if (!Array.isArray(allProducts) || allProducts.length === 0) {
          setError("Không tìm thấy sản phẩm");
          setLoading(false);
          return;
        }
        const activeProducts = allProducts.filter(
          (product) => product && product.status === "active"
        );
        const productsWithData = activeProducts.map((product) => {
          return {
            ...product,
            stock: product.stock || 0,
          };
        });
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

  // Auto advance steps based on conditions
  useEffect(() => {
    if (selectedProducts.length > 0 && activeStep === 0) {
      setActiveStep(1);
    }
    if (selectedProducts.length > 0 && branch && activeStep === 1) {
      // Can proceed to step 2
    }
  }, [selectedProducts, branch, activeStep]);

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
    setFilteredProducts(filtered);
  };

  const handleSelectProduct = (product) => {
    if (!selectedProducts.some((p) => p._id === product._id)) {
      const basePrice = product.importPrice || product.price || 0;
      setSelectedProducts([
        ...selectedProducts,
        {
          ...product,
          quantity: 1,
          exportPrice: basePrice,
          baseImportPrice: basePrice,
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

  const handleExportPriceChange = (index, value) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setSelectedProducts((prev) =>
        prev.map((p, i) => (i === index ? { ...p, exportPrice: value } : p))
      );

      // Clear error nếu có khi người dùng đang sửa
      if (error && error.includes('GIÁ XUẤT PHẢI LỚN HƠN')) {
        setError("");
      }
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
    if (updatedProducts.length === 0) {
      setActiveStep(0);
    }
  };

  const handleCreateBranchSuccess = (newBranch) => {
    setBranches((prev) => [...prev, newBranch]);
    setBranch(newBranch._id);
  };

  const calculateTotalValue = () => {
    return selectedProducts.reduce((total, product) => {
      const price = parseFloat(product.exportPrice) || 0;
      const quantity = parseInt(product.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  const calculateTotalQuantity = () => {
    return selectedProducts.reduce((total, product) => {
      const quantity = parseInt(product.quantity) || 0;
      return total + quantity;
    }, 0);
  };

  const calculateExportPrice = (product, formula, transportCostPercent, transportCostFixed, storageCostPercent, storageCostFixed, insurancePercent, insuranceFixed, otherCostPercent, otherCostFixed, fixedCosts, profitMarginPercent = 10, profitMarginFixed = 0) => {
    const basePrice = parseFloat(product.baseImportPrice || product.importPrice || product.price) || 0;

    let transportCost = 0;
    let storageCost = 0;
    let insuranceCost = 0;
    let otherCost = 0;
    let profitMargin = 0;

    switch (formula) {
      case 'percentage':
        transportCost = (transportCostPercent / 100) * basePrice;
        storageCost = (storageCostPercent / 100) * basePrice;
        insuranceCost = (insurancePercent / 100) * basePrice;
        otherCost = (otherCostPercent / 100) * basePrice;
        break;
      case 'fixed':
        transportCost = transportCostFixed;
        storageCost = storageCostFixed;
        insuranceCost = insuranceFixed;
        otherCost = otherCostFixed;
        break;
      case 'combined':
        transportCost = (transportCostPercent / 100) * basePrice;
        storageCost = (storageCostPercent / 100) * basePrice;
        insuranceCost = (insurancePercent / 100) * basePrice;
        otherCost = (otherCostPercent / 100) * basePrice;
        break;
      case 'dynamic':
        transportCost = priceCalculatorData.transportCostType === 'percentage'
          ? (transportCostPercent / 100) * basePrice
          : transportCostFixed;
        storageCost = priceCalculatorData.storageCostType === 'percentage'
          ? (storageCostPercent / 100) * basePrice
          : storageCostFixed;
        insuranceCost = priceCalculatorData.insuranceType === 'percentage'
          ? (insurancePercent / 100) * basePrice
          : insuranceFixed;
        otherCost = priceCalculatorData.otherCostType === 'percentage'
          ? (otherCostPercent / 100) * basePrice
          : otherCostFixed;
        break;
    }

    let totalCost = basePrice + transportCost + storageCost + insuranceCost + otherCost;

    if (formula === 'combined') {
      totalCost += fixedCosts;
    }

    if (formula === 'dynamic' && priceCalculatorData.profitMarginType === 'fixed') {
      profitMargin = profitMarginFixed;
    } else if (formula === 'fixed' && profitMarginFixed > 0) {
      profitMargin = profitMarginFixed;
    } else {
      profitMargin = (profitMarginPercent / 100) * totalCost;
    }

    totalCost += profitMargin;
    const finalPrice = Math.max(totalCost, 0);
    return finalPrice.toFixed(2);
  };

  // ✅ THÊM: Hàm validation giá xuất so với giá nhập
  const validateExportPrices = () => {
    const priceViolations = [];

    selectedProducts.forEach((product) => {
      const exportPrice = parseFloat(product.exportPrice) || 0;

      // Ưu tiên kiểm tra theo thứ tự: importPrice -> price -> baseImportPrice
      let importPrice = 0;
      let priceSource = '';

      if (product.importPrice && parseFloat(product.importPrice) > 0) {
        importPrice = parseFloat(product.importPrice);
        priceSource = 'giá nhập gốc';
      } else if (product.price && parseFloat(product.price) > 0) {
        importPrice = parseFloat(product.price);
        priceSource = 'giá bán cơ sở';
      } else if (product.baseImportPrice && parseFloat(product.baseImportPrice) > 0) {
        importPrice = parseFloat(product.baseImportPrice);
        priceSource = 'giá nhập cơ sở';
      } else if (product.supplierProductPrice && parseFloat(product.supplierProductPrice) > 0) {
        importPrice = parseFloat(product.supplierProductPrice);
        priceSource = 'giá nhà cung cấp';
      }

      // Kiểm tra điều kiện: Giá xuất phải >= Giá nhập
      if (importPrice > 0 && exportPrice < importPrice) {
        const difference = importPrice - exportPrice;
        const percent = ((difference / importPrice) * 100).toFixed(1);

        priceViolations.push({
          productName: product.productName,
          exportPrice: exportPrice,
          importPrice: importPrice,
          difference: difference,
          percent: percent,
          priceSource: priceSource
        });
      }
    });

    return priceViolations;
  };

  // ✅ THÊM: Hàm hiển thị warning khi giá xuất gần bằng giá nhập
  const checkPriceMarginWarnings = () => {
    const warnings = [];

    selectedProducts.forEach((product) => {
      const exportPrice = parseFloat(product.exportPrice) || 0;
      let importPrice = 0;

      if (product.importPrice && parseFloat(product.importPrice) > 0) {
        importPrice = parseFloat(product.importPrice);
      } else if (product.price && parseFloat(product.price) > 0) {
        importPrice = parseFloat(product.price);
      } else if (product.baseImportPrice && parseFloat(product.baseImportPrice) > 0) {
        importPrice = parseFloat(product.baseImportPrice);
      }

      // Cảnh báo khi margin < 5%
      if (importPrice > 0 && exportPrice >= importPrice) {
        const margin = ((exportPrice - importPrice) / importPrice) * 100;
        if (margin < 5) {
          warnings.push({
            productName: product.productName,
            margin: margin.toFixed(1)
          });
        }
      }
    });

    return warnings;
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setError("");

    if (selectedProducts.length === 0) {
      setError("⚠️ Vui lòng chọn ít nhất một sản phẩm để tạo phiếu xuất.");
      return;
    }

    // 1. Kiểm tra số lượng và giá xuất hợp lệ
    const invalids = selectedProducts.filter(
      (product) => {
        const qty = parseInt(product.quantity, 10);
        const expPrice = parseFloat(product.exportPrice);
        return qty <= 0 || expPrice <= 0 || isNaN(qty) || isNaN(expPrice);
      }
    );

    if (invalids.length > 0) {
      const msg = invalids.map(p => `• ${p.productName}`).join('\n');
      setError(`❌ Thông tin không hợp lệ cho các sản phẩm sau:\n${msg}\n\nVui lòng kiểm tra lại số lượng và giá xuất.`);
      return;
    }

    // 2. Kiểm tra số lượng xuất vs tồn kho
    const invalidStock = selectedProducts.filter(
      (product) => parseInt(product.quantity, 10) > (product.totalStock || 0)
    );

    if (invalidStock.length > 0) {
      const stockMsg = invalidStock.map(p =>
        `• ${p.productName}: Yêu cầu ${p.quantity} ${p.unit || 'cái'}, chỉ còn ${p.totalStock || 0} ${p.unit || 'cái'}`
      ).join('\n');
      setError(`📦 Số lượng xuất vượt quá tồn kho:\n${stockMsg}`);
      return;
    }

    // 3. ✅ KIỂM TRA BỮT BUỘC: Giá xuất phải >= Giá nhập
    const priceViolations = validateExportPrices();
    if (priceViolations.length > 0) {
      const violationMsg = priceViolations.map(v =>
        `• ${v.productName}:\n  - Giá xuất: ${v.exportPrice.toLocaleString()} VNĐ\n  - ${v.priceSource}: ${v.importPrice.toLocaleString()} VNĐ\n  - Chênh lệch: -${v.difference.toLocaleString()} VNĐ (${v.percent}%)`
      ).join('\n\n');

      setError(`🚫 GIÁ XUẤT PHẢI LỚN HƠN HOẶC BẰNG GIÁ NHẬP!\n\n${violationMsg}\n\n💡 Vui lòng điều chỉnh giá xuất cho phù hợp.`);
      return;
    }

    // 4. ✅ CẢNH BÁO: Margin thấp (< 5%)
    const marginWarnings = checkPriceMarginWarnings();
    if (marginWarnings.length > 0) {
      const warningMsg = marginWarnings.map(w =>
        `• ${w.productName}: Margin chỉ ${w.margin}%`
      ).join('\n');

      // Hiển thị cảnh báo nhưng vẫn cho phép tiếp tục
      console.warn(`⚠️ Cảnh báo margin thấp:\n${warningMsg}`);
    }

    try {
      setLoading(true);
      const requestData = {
        products: selectedProducts.map((p) => ({
          productId: p._id,
          requestQuantity: parseInt(p.quantity, 10) || 1,
          exportPrice: parseFloat(p.exportPrice) || 0,
        })),
        transactionType: "export",
        status: "pending",
        branch: branch,
        customerDiscount: customerDiscount || 0,
        subtotal: calculateTotalValue(),
        discountAmount: (customerDiscount / 100) * calculateTotalValue(),
        totalAmount: calculateTotalValue() - (customerDiscount / 100) * calculateTotalValue()
      };

      console.log("📤 Dữ liệu gửi lên API:", JSON.stringify(requestData, null, 2));

      const response = await authorApi.post(
        "/inventoryTransactions/createTransaction",
        requestData
      );

      console.log("✅ API response:", response.data);

      setMessage("🎉 Phiếu xuất kho đã được tạo thành công!");
      setSelectedProducts([]);
      setActiveStep(0);
      setError("");

      // Auto navigate after success
      setTimeout(() => {
        navigate("/export");
      }, 2000);
    } catch (error) {
      console.error("❌ Error details:", error);
      if (error.response) {
        setError(
          error.response.data.message || "❌ Lỗi khi tạo phiếu xuất kho, vui lòng thử lại."
        );
      } else if (error.request) {
        setError(
          "🌐 Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        setError("⚠️ Lỗi khi tạo yêu cầu: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: "700",
                background: `linear-gradient(45deg, ${palette.medium}, ${palette.dark})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Tạo phiếu xuất kho
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Quản lý và tạo phiếu xuất kho một cách dễ dàng
            </Typography>
          </Box>
        </motion.div>

        {/* Progress Stepper */}
        <motion.div variants={itemVariants}>
          <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontWeight: activeStep === index ? 600 : 400,
                        color: activeStep === index ? palette.medium : 'text.secondary',
                      },
                      '& .MuiStepIcon-root': {
                        color: activeStep >= index ? palette.medium : 'action.disabled',
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert
                severity="success"
                sx={{ mb: 3, borderRadius: 2 }}
                icon={<CheckCircleIcon />}
              >
                {message}
              </Alert>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={60} sx={{ color: palette.medium }} />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {/* Left Panel - Product Search and Selection */}
            <Grid item xs={12} lg={8}>
              <motion.div variants={itemVariants}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {/* Search Section */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <ShoppingCartIcon sx={{ mr: 2, color: palette.medium }} />
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Tìm kiếm sản phẩm
                      </Typography>
                    </Box>

                    <TextField
                      fullWidth
                      placeholder="Nhập tên sản phẩm để tìm kiếm..."
                      variant="outlined"
                      value={search}
                      onChange={handleSearch}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: palette.medium }} />
                          </InputAdornment>
                        ),
                        endAdornment: search && (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => { setSearch(""); setFilteredProducts([]); }}>
                              <ClearIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'white',
                          '&:hover fieldset': {
                            borderColor: palette.medium,
                          },
                        },
                      }}
                    />

                    {/* Search Results */}
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
                              mt: 2,
                              maxHeight: 400,
                              overflowY: "auto",
                              borderRadius: 2,
                              border: '2px solid',
                              borderColor: palette.light,
                            }}
                          >
                            <TableContainer>
                              <Table>
                                <TableHead>
                                  <TableRow sx={{ bgcolor: `${palette.light}20` }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Hình ảnh</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Tên sản phẩm</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Tồn kho</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {filteredProducts.map((product, index) => (
                                    <TableRow
                                      key={index}
                                      hover
                                      sx={{
                                        cursor: "pointer",
                                        '&:hover': {
                                          backgroundColor: `${palette.light}10`,
                                        },
                                      }}
                                    >
                                      <TableCell>
                                        <Box
                                          component="img"
                                          sx={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 2,
                                            objectFit: "cover",
                                            border: '2px solid',
                                            borderColor: 'divider',
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
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                          {product?.productName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {getCategoryName(product?.categoryId)}
                                        </Typography>
                                      </TableCell>
                                      <TableCell align="right">
                                        <Chip
                                          label={`${product?.totalStock || 0} ${product?.unit || 'cái'}`}
                                          color={product?.totalStock > 0 ? "success" : "error"}
                                          variant="outlined"
                                          size="small"
                                        />
                                      </TableCell>
                                      <TableCell align="center">
                                        <Button
                                          variant="contained"
                                          size="small"
                                          onClick={() => handleSelectProduct(product)}
                                          disabled={selectedProducts.some((p) => p._id === product._id)}
                                          sx={{
                                            bgcolor: palette.medium,
                                            "&:hover": { bgcolor: palette.dark },
                                            borderRadius: 2,
                                          }}
                                        >
                                          {selectedProducts.some((p) => p._id === product._id) ? "Đã chọn" : "Chọn"}
                                        </Button>
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
                  </Box>

                  <Divider sx={{ my: 4 }} />

                  {/* Selected Products */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ReceiptIcon sx={{ mr: 2, color: palette.medium }} />
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          Sản phẩm đã chọn
                        </Typography>
                        {selectedProducts.length > 0 && (
                          <Badge badgeContent={selectedProducts.length} color="primary" sx={{ ml: 2 }}>
                            <Chip label="sản phẩm" size="small" />
                          </Badge>
                        )}
                      </Box>

                      {selectedProducts.length > 0 && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setSelectedProductIndex(null);
                            setShowPriceCalculator(true);
                          }}
                          startIcon={<CalculateIcon />}
                          sx={{
                            borderColor: palette.medium,
                            color: palette.medium,
                            "&:hover": {
                              borderColor: palette.dark,
                              bgcolor: `${palette.medium}10`,
                            },
                          }}
                        >
                          Tính giá tự động
                        </Button>
                      )}
                    </Box>

                    {selectedProducts.length === 0 ? (
                      <Paper
                        elevation={0}
                        variant="outlined"
                        sx={{
                          p: 6,
                          borderRadius: 3,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "#f8f9fa",
                          borderStyle: 'dashed',
                          borderWidth: 2,
                          borderColor: 'divider',
                        }}
                      >
                        <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          sx={{ textAlign: "center", mb: 1 }}
                        >
                          Chưa có sản phẩm nào được chọn
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textAlign: "center" }}
                        >
                          Tìm kiếm và chọn sản phẩm để thêm vào phiếu xuất
                        </Typography>
                      </Paper>
                    ) : (
                      <TableContainer
                        component={Paper}
                        variant="outlined"
                        sx={{
                          maxHeight: 400,
                          overflowY: "auto",
                          borderRadius: 2,
                        }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: `${palette.light}20` }}>
                              <TableCell sx={{ fontWeight: 600 }}>Sản phẩm</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>Số lượng</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>Giá xuất (VNĐ)</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>Thành tiền</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedProducts.map((product, index) => (
                              <TableRow key={index} sx={{ '&:hover': { bgcolor: `${palette.light}05` } }}>
                                <TableCell>
                                  <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Box
                                      component="img"
                                      sx={{
                                        width: 50,
                                        height: 50,
                                        mr: 2,
                                        borderRadius: 2,
                                        objectFit: "cover",
                                        border: '1px solid',
                                        borderColor: 'divider',
                                      }}
                                      src={
                                        product?.productImage
                                          ? `http://localhost:9999${product?.productImage}`
                                          : "http://localhost:9999/uploads/default-product.png"
                                      }
                                      alt={product?.productName}
                                    />
                                    <Box>
                                      <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 500, maxWidth: 200 }}
                                        noWrap
                                      >
                                        {product?.productName}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Tồn: {product?.totalStock || 0} {product?.unit}
                                      </Typography>
                                    </Box>
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
                                    sx={{
                                      width: 80,
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 1,
                                      },
                                    }}
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
                                    sx={{
                                      width: 120,
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 1,
                                      },
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: palette.medium }}>
                                    {((parseFloat(product.exportPrice) || 0) * (parseInt(product.quantity) || 0)).toLocaleString()}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Tooltip title="Xem chi tiết">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setModalProduct(product);
                                        setShowModal(true);
                                      }}
                                      sx={{ color: palette.medium }}
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Xóa sản phẩm">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveProduct(index)}
                                      sx={{ color: 'error.main' }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

            {/* Right Panel - Configuration and Summary */}
            <Grid item xs={12} lg={4}>
              <motion.div variants={itemVariants}>
                <Box sx={{ position: 'sticky', top: 20 }}>
                  {/* Branch Selection */}
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      mb: 3,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <StoreIcon sx={{ mr: 2, color: palette.medium }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Cấu hình đơn hàng
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <FormControl fullWidth>
                        <InputLabel>Chi nhánh/Khách Hàng</InputLabel>
                        <Select
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          label="Chi nhánh xuất hàng"
                          sx={{
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: palette.medium,
                            },
                          }}
                        >
                          {branches.map((b) => (
                            <MenuItem key={b._id} value={b._id}>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {b.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {b.address}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => setOpenCreateBranch(true)}
                      sx={{
                        mb: 3,
                        borderColor: palette.medium,
                        color: palette.medium,
                        "&:hover": {
                          borderColor: palette.dark,
                          bgcolor: `${palette.medium}10`,
                        },
                        borderRadius: 2,
                      }}
                    >
                      + Thêm Chi nhánh/Khách Hàng
                    </Button>

                    <Box>
                      <TextField
                        fullWidth
                        type="number"
                        label="Chiết khấu khách hàng"
                        value={customerDiscount}
                        onChange={(e) => setCustomerDiscount(parseFloat(e.target.value) || 0)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          inputProps: { min: 0, max: 100, step: 0.1 }
                        }}
                        helperText="Chiết khấu áp dụng cho toàn bộ đơn hàng"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            backgroundColor: "#f8f9fa",
                            "&:hover fieldset": {
                              borderColor: palette.medium,
                            },
                          }
                        }}
                      />
                    </Box>
                  </Paper>

                  {/* Order Summary */}
                  <AnimatePresence>
                    {selectedProducts.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                      >
                        <Paper
                          elevation={3}
                          sx={{
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${palette.light}20 0%, ${palette.medium}10 100%)`,
                            border: '2px solid',
                            borderColor: palette.light,
                          }}
                        >
                          <Box
                            sx={{
                              p: 3,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                            onClick={() => setExpandedSummary(!expandedSummary)}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 600, color: palette.dark }}>
                              📋 Tóm tắt đơn hàng
                            </Typography>
                            {expandedSummary ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </Box>

                          <Collapse in={expandedSummary}>
                            <Box sx={{ p: 3 }}>
                              <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2">Tổng số sản phẩm:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {calculateTotalQuantity()} sản phẩm
                                  </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2">Tổng giá trị:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {calculateTotalValue().toLocaleString()} VNĐ
                                  </Typography>
                                </Box>

                                {customerDiscount > 0 && (
                                  <>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                      <Typography variant="body2" color="warning.main">
                                        Chiết khấu ({customerDiscount}%):
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                                        -{((customerDiscount / 100) * calculateTotalValue()).toLocaleString()} VNĐ
                                      </Typography>
                                    </Box>
                                  </>
                                )}

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: palette.dark }}>
                                    Thành tiền:
                                  </Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: palette.medium }}>
                                    {(calculateTotalValue() - (customerDiscount / 100) * calculateTotalValue()).toLocaleString()} VNĐ
                                  </Typography>
                                </Box>
                              </Box>

                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                  variant="outlined"
                                  fullWidth
                                  onClick={() => navigate("/export")}
                                  startIcon={<ArrowBackIcon />}
                                  sx={{
                                    borderColor: 'text.secondary',
                                    color: 'text.secondary',
                                    "&:hover": {
                                      borderColor: 'text.primary',
                                      bgcolor: 'action.hover',
                                    },
                                    borderRadius: 2,
                                  }}
                                >
                                  Quay lại
                                </Button>
                                <Button
                                  variant="contained"
                                  fullWidth
                                  onClick={handleSubmit}
                                  disabled={selectedProducts.length === 0 || loading || !branch}
                                  startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                                  sx={{
                                    bgcolor: palette.medium,
                                    "&:hover": { bgcolor: palette.dark },
                                    borderRadius: 2,
                                    py: 1.5,
                                    fontWeight: 600,
                                  }}
                                >
                                  {loading ? "Đang tạo..." : "Tạo phiếu xuất"}
                                </Button>
                              </Box>
                            </Box>
                          </Collapse>
                        </Paper>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        )}

        <CreateBranchDialog
          open={openCreateBranch}
          onClose={() => setOpenCreateBranch(false)}
          onSuccess={handleCreateBranchSuccess}
        />

        {/* Modal tính giá xuất kho tự động */}
        <Dialog
          open={showPriceCalculator}
          onClose={() => setShowPriceCalculator(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalculateIcon />
              <Typography variant="h6">Tính giá xuất kho tự động</Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              {/* Thông tin tổng quan */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: "#f8f9fa" }}>
                  <Typography variant="h6" gutterBottom>
                    Tính giá xuất cho {selectedProducts.length} sản phẩm
                  </Typography>
                  <Typography variant="body2">
                    Công thức sẽ được áp dụng cho tất cả sản phẩm đã chọn. Chiết khấu đã nhập bên ngoài: {customerDiscount}%
                  </Typography>
                </Paper>
              </Grid>

              {/* Chọn công thức tính giá */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Công thức tính giá</InputLabel>
                  <Select
                    value={priceCalculatorData.formula}
                    onChange={(e) => setPriceCalculatorData({ ...priceCalculatorData, formula: e.target.value })}
                    label="Công thức tính giá"
                  >
                    <MenuItem value="percentage">Công thức theo phần trăm</MenuItem>
                    <MenuItem value="fixed">Công thức theo số tiền cố định</MenuItem>
                    <MenuItem value="combined">Công thức kết hợp (Phần trăm + Chi phí cố định)</MenuItem>
                    <MenuItem value="dynamic">Công thức linh hoạt (Từng chi phí chọn riêng)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Chi phí vận chuyển */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: palette.dark }}>
                  Chi phí vận chuyển
                </Typography>
                <Grid container spacing={2}>
                  {(priceCalculatorData.formula === 'dynamic' || priceCalculatorData.formula === 'combined') && (
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Loại chi phí</InputLabel>
                        <Select
                          value={priceCalculatorData.transportCostType}
                          onChange={(e) => setPriceCalculatorData({ ...priceCalculatorData, transportCostType: e.target.value })}
                          label="Loại chi phí"
                        >
                          <MenuItem value="percentage">Phần trăm (%)</MenuItem>
                          <MenuItem value="fixed">Số tiền cố định (VNĐ)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {(priceCalculatorData.formula === 'percentage' ||
                    priceCalculatorData.transportCostType === 'percentage') && (
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Chi phí vận chuyển (%)"
                          value={priceCalculatorData.transportCostPercent}
                          onChange={(e) => setPriceCalculatorData({ ...priceCalculatorData, transportCostPercent: parseFloat(e.target.value) || 0 })}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            inputProps: { min: 0, step: 0.1 }
                          }}
                        />
                      </Grid>
                    )}
                  {(priceCalculatorData.formula === 'fixed' ||
                    priceCalculatorData.transportCostType === 'fixed') && (
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Chi phí vận chuyển (VNĐ)"
                          value={priceCalculatorData.transportCostFixed}
                          onChange={(e) => setPriceCalculatorData({ ...priceCalculatorData, transportCostFixed: parseFloat(e.target.value) || 0 })}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                            inputProps: { min: 0 }
                          }}
                        />
                      </Grid>
                    )}
                </Grid>
              </Grid>

              {/* Chi phí lưu kho */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: palette.dark }}>
                  Chi phí lưu kho
                </Typography>
                <Grid container spacing={2}>
                  {(priceCalculatorData.formula === 'dynamic' || priceCalculatorData.formula === 'combined') && (
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Loại chi phí</InputLabel>
                        <Select
                          value={priceCalculatorData.storageCostType}
                          onChange={(e) => setPriceCalculatorData({ ...priceCalculatorData, storageCostType: e.target.value })}
                          label="Loại chi phí"
                        >
                          <MenuItem value="percentage">Phần trăm (%)</MenuItem>
                          <MenuItem value="fixed">Số tiền cố định (VNĐ)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {(priceCalculatorData.formula === 'percentage' ||
                    priceCalculatorData.storageCostType === 'percentage') && (
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Chi phí lưu kho (%)"
                          value={priceCalculatorData.storageCostPercent}
                          onChange={(e) => setPriceCalculatorData({ ...priceCalculatorData, storageCostPercent: parseFloat(e.target.value) || 0 })}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            inputProps: { min: 0, step: 0.1 }
                          }}
                        />
                      </Grid>
                    )}
                  {(priceCalculatorData.formula === 'fixed' ||
                    priceCalculatorData.storageCostType === 'fixed') && (
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Chi phí lưu kho (VNĐ)"
                          value={priceCalculatorData.storageCostFixed}
                          onChange={(e) => setPriceCalculatorData({ ...priceCalculatorData, storageCostFixed: parseFloat(e.target.value) || 0 })}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                            inputProps: { min: 0 }
                          }}
                        />
                      </Grid>
                    )}
                </Grid>
              </Grid>

              {/* Phí bảo hiểm */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: palette.dark }}>
                  Phí bảo hiểm
                </Typography>
                <Grid container spacing={2}>
                  {(priceCalculatorData.formula === 'dynamic' || priceCalculatorData.formula === 'combined') && (
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Loại chi phí</InputLabel>
                        <Select
                          value={priceCalculatorData.insuranceType}
                          onChange={(e) => setPriceCalculatorData({ ...priceCalculatorData, insuranceType: e.target.value })}
                          label="Loại chi phí"
                        >
                          <MenuItem value="percentage">Phần trăm (%)</MenuItem>
                          <MenuItem value="fixed">Số tiền cố định (VNĐ)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {(priceCalculatorData.formula === 'percentage' ||
                    priceCalculatorData.insuranceType === 'percentage') && (
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Phí bảo hiểm (%)"
                          value={priceCalculatorData.insurancePercent}
                          onChange={(e) => setPriceCalculatorData({ ...priceCalculatorData, insurancePercent: parseFloat(e.target.value) || 0 })}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            inputProps: { min: 0, step: 0.1 }
                          }}
                        />
                      </Grid>
                    )}
                  {(priceCalculatorData.formula === 'fixed' ||
                    priceCalculatorData.insuranceType === 'fixed') && (
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Phí bảo hiểm (VNĐ)"
                          value={priceCalculatorData.insuranceFixed}
                          onChange={(e) => setPriceCalculatorData({ ...priceCalculatorData, insuranceFixed: parseFloat(e.target.value) || 0 })}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                            inputProps: { min: 0 }
                          }}
                        />
                      </Grid>
                    )}
                </Grid>
              </Grid>

              {/* Chi phí khác */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: palette.dark }}>
                  Chi phí khác
                </Typography>
                <Grid container spacing={2}>
                  {(priceCalculatorData.formula === 'dynamic' || priceCalculatorData.formula === 'combined') && (
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Loại chi phí</InputLabel>
                        <Select
                          value={priceCalculatorData.otherCostType}
                          onChange={(e) => setPriceCalculatorData({ ...priceCalculatorData, otherCostType: e.target.value })}
                          label="Loại chi phí"
                        >
                          <MenuItem value="percentage">Phần trăm (%)</MenuItem>
                          <MenuItem value="fixed">Số tiền cố định (VNĐ)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {(priceCalculatorData.formula === 'percentage' ||
                    priceCalculatorData.otherCostType === 'percentage') && (
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Chi phí khác (%)"
                          value={priceCalculatorData.otherCostPercent}
                          onChange={(e) => setPriceCalculatorData({ ...priceCalculatorData, otherCostPercent: parseFloat(e.target.value) || 0 })}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            inputProps: { min: 0, step: 0.1 }
                          }}
                        />
                      </Grid>
                    )}
                  {(priceCalculatorData.formula === 'fixed' ||
                    priceCalculatorData.otherCostType === 'fixed') && (
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Chi phí khác (VNĐ)"
                          value={priceCalculatorData.otherCostFixed}
                          onChange={(e) => setPriceCalculatorData({ ...priceCalculatorData, otherCostFixed: parseFloat(e.target.value) || 0 })}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                            inputProps: { min: 0 }
                          }}
                        />
                      </Grid>
                    )}
                </Grid>
              </Grid>

              {/* Lợi nhuận */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: palette.dark }}>
                  Lợi nhuận
                </Typography>
                <Grid container spacing={2}>
                  {(priceCalculatorData.formula === 'dynamic' || priceCalculatorData.formula === 'combined') && (
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Loại lợi nhuận</InputLabel>
                        <Select
                          value={priceCalculatorData.profitMarginType}
                          onChange={(e) => setPriceCalculatorData({ ...priceCalculatorData, profitMarginType: e.target.value })}
                          label="Loại lợi nhuận"
                        >
                          <MenuItem value="percentage">Phần trăm (%)</MenuItem>
                          <MenuItem value="fixed">Số tiền cố định (VNĐ)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {(priceCalculatorData.formula === 'percentage' ||
                    priceCalculatorData.profitMarginType === 'percentage') && (
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Lợi nhuận (%)"
                          value={priceCalculatorData.profitMarginPercent}
                          onChange={(e) => setPriceCalculatorData({ ...priceCalculatorData, profitMarginPercent: parseFloat(e.target.value) || 0 })}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            inputProps: { min: 0, step: 0.1 }
                          }}
                        />
                      </Grid>
                    )}
                  {(priceCalculatorData.formula === 'fixed' ||
                    priceCalculatorData.profitMarginType === 'fixed') && (
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Lợi nhuận (VNĐ)"
                          value={priceCalculatorData.profitMarginFixed}
                          onChange={(e) => setPriceCalculatorData({ ...priceCalculatorData, profitMarginFixed: parseFloat(e.target.value) || 0 })}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                            inputProps: { min: 0 }
                          }}
                        />
                      </Grid>
                    )}
                </Grid>
              </Grid>

              {/* Chi phí cố định tổng (chỉ hiện khi chọn công thức kết hợp) */}
              {priceCalculatorData.formula === 'combined' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Chi phí cố định tổng (VNĐ)"
                    value={priceCalculatorData.fixedCosts}
                    onChange={(e) => setPriceCalculatorData({ ...priceCalculatorData, fixedCosts: parseFloat(e.target.value) || 0 })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                      inputProps: { min: 0 }
                    }}
                    helperText="Chi phí cố định này sẽ được cộng vào tổng chi phí"
                  />
                </Grid>
              )}

              {/* Preview kết quả */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: "#e8f5e8" }}>
                  <Typography variant="h6" gutterBottom>
                    Preview giá xuất cho từng sản phẩm
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                    * Chiết khấu khách hàng ({customerDiscount}%) sẽ được áp dụng ở cấp độ đơn hàng
                  </Typography>
                  <Box sx={{ maxHeight: 250, overflowY: "auto" }}>
                    {selectedProducts.map((product, index) => {
                      const basePrice = parseFloat(product.baseImportPrice || product.importPrice || product.price) || 0;

                      // Tính toán chi phí theo loại đã chọn
                      const getTransportCost = () => {
                        if (priceCalculatorData.formula === 'percentage' || priceCalculatorData.transportCostType === 'percentage') {
                          return (priceCalculatorData.transportCostPercent / 100) * basePrice;
                        } else {
                          return priceCalculatorData.transportCostFixed;
                        }
                      };

                      const getStorageCost = () => {
                        if (priceCalculatorData.formula === 'percentage' || priceCalculatorData.storageCostType === 'percentage') {
                          return (priceCalculatorData.storageCostPercent / 100) * basePrice;
                        } else {
                          return priceCalculatorData.storageCostFixed;
                        }
                      };

                      const getInsuranceCost = () => {
                        if (priceCalculatorData.formula === 'percentage' || priceCalculatorData.insuranceType === 'percentage') {
                          return (priceCalculatorData.insurancePercent / 100) * basePrice;
                        } else {
                          return priceCalculatorData.insuranceFixed;
                        }
                      };

                      const getOtherCost = () => {
                        if (priceCalculatorData.formula === 'percentage' || priceCalculatorData.otherCostType === 'percentage') {
                          return (priceCalculatorData.otherCostPercent / 100) * basePrice;
                        } else {
                          return priceCalculatorData.otherCostFixed;
                        }
                      };

                      const getProfitMargin = (costBase) => {
                        if (priceCalculatorData.formula === 'percentage' || priceCalculatorData.profitMarginType === 'percentage') {
                          return (priceCalculatorData.profitMarginPercent / 100) * costBase;
                        } else {
                          return priceCalculatorData.profitMarginFixed;
                        }
                      };

                      const transportCost = getTransportCost();
                      const storageCost = getStorageCost();
                      const insuranceCost = getInsuranceCost();
                      const otherCost = getOtherCost();
                      let totalCost = basePrice + transportCost + storageCost + insuranceCost + otherCost;

                      if (priceCalculatorData.formula === 'combined') {
                        totalCost += priceCalculatorData.fixedCosts;
                      }

                      const profitMargin = getProfitMargin(totalCost);
                      totalCost += profitMargin;

                      // ✅ SỬA: Không hiển thị chiết khấu trong preview từng sản phẩm nữa
                      const finalPrice = totalCost;

                      return (
                        <Box key={index} sx={{ mb: 2, p: 2, bgcolor: "white", borderRadius: 1, border: '1px solid #e0e0e0' }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                            {product.productName}
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="body2">Giá gốc: {basePrice.toLocaleString()} VNĐ</Typography>
                              <Typography variant="body2">Vận chuyển: +{transportCost.toLocaleString()} VNĐ</Typography>
                              <Typography variant="body2">Lưu kho: +{storageCost.toLocaleString()} VNĐ</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2">Bảo hiểm: +{insuranceCost.toLocaleString()} VNĐ</Typography>
                              <Typography variant="body2">Chi phí khác: +{otherCost.toLocaleString()} VNĐ</Typography>
                              <Typography variant="body2">Lợi nhuận: +{profitMargin.toLocaleString()} VNĐ</Typography>
                            </Grid>
                          </Grid>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'green', mt: 1 }}>
                            Giá sản phẩm: {finalPrice.toLocaleString()} VNĐ
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: "#f8f9fa" }}>
            <Button
              onClick={() => setShowPriceCalculator(false)}
              sx={{
                borderRadius: 2,
                px: 3,
                color: 'text.secondary',
                "&:hover": { bgcolor: 'action.hover' }
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                const updatedProducts = selectedProducts.map(product => {
                  const calculatedPrice = calculateExportPrice(
                    product,
                    priceCalculatorData.formula,
                    priceCalculatorData.transportCostPercent,
                    priceCalculatorData.transportCostFixed,
                    priceCalculatorData.storageCostPercent,
                    priceCalculatorData.storageCostFixed,
                    priceCalculatorData.insurancePercent,
                    priceCalculatorData.insuranceFixed,
                    priceCalculatorData.otherCostPercent,
                    priceCalculatorData.otherCostFixed,
                    priceCalculatorData.fixedCosts,
                    priceCalculatorData.profitMarginPercent,
                    priceCalculatorData.profitMarginFixed
                  );
                  return { ...product, exportPrice: calculatedPrice };
                });
                setSelectedProducts(updatedProducts);
                setShowPriceCalculator(false);
              }}
              startIcon={<CalculateIcon />}
              sx={{
                bgcolor: palette.medium,
                "&:hover": { bgcolor: palette.dark },
                borderRadius: 2,
                px: 4,
                py: 1,
                fontWeight: 600,
              }}
            >
              Áp dụng cho tất cả
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal chi tiết sản phẩm */}
        <Dialog
          open={showModal}
          onClose={() => setShowModal(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden',
            }
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: `${palette.light}20`,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <VisibilityIcon sx={{ color: palette.medium }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Chi tiết sản phẩm
            </Typography>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0 }}>
            {modalProduct && (
              <Box>
                {/* Product Header */}
                <Box
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${palette.light}10 0%, white 100%)`,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: 'white',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minHeight: 200,
                        }}
                      >
                        <Box
                          component="img"
                          src={
                            modalProduct.productImage
                              ? `http://localhost:9999${modalProduct.productImage}`
                              : "http://localhost:9999/uploads/default-product.png"
                          }
                          alt={modalProduct.productName}
                          sx={{
                            maxWidth: '100%',
                            maxHeight: 180,
                            objectFit: "contain",
                            borderRadius: 1,
                          }}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: palette.dark, mb: 2 }}>
                        {modalProduct.productName}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                          label={getCategoryName(modalProduct.categoryId)}
                          color="primary"
                          variant="outlined"
                          size="small"
                          sx={{ borderColor: palette.medium, color: palette.medium }}
                        />
                        <Chip
                          label={`Tồn kho: ${modalProduct.totalStock || modalProduct.stock || 0} ${modalProduct.unit || 'cái'}`}
                          color={modalProduct.totalStock > 0 ? "success" : "error"}
                          variant="outlined"
                          size="small"
                        />
                      </Box>

                      {modalProduct.description && (
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                          {modalProduct.description}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Box>

                {/* Product Details */}
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: palette.dark }}>
                    📍 Thông tin chi tiết
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: palette.medium }}>
                          Thông tin cơ bản
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Mã sản phẩm:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {modalProduct._id?.slice(-8) || 'N/A'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Đơn vị:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {modalProduct.unit || 'Chưa xác định'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                            <Chip
                              label={modalProduct.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}
                              color={modalProduct.status === 'active' ? 'success' : 'error'}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: palette.medium }}>
                          Thông tin giá
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Giá nhập:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {modalProduct.importPrice ? `${parseFloat(modalProduct.importPrice).toLocaleString()} VNĐ` : 'Chưa có'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Giá bán:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {modalProduct.price ? `${parseFloat(modalProduct.price).toLocaleString()} VNĐ` : 'Chưa có'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Giá xuất hiện tại:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: palette.medium }}>
                              {modalProduct.exportPrice ? `${parseFloat(modalProduct.exportPrice).toLocaleString()} VNĐ` : 'Chưa set'}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Inventory Locations */}
                    {modalProduct.location && Array.isArray(modalProduct.location) && modalProduct.location.length > 0 && (
                      <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: palette.medium }}>
                            📦 Vị trí trong kho
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {modalProduct.location.map((loc, index) => (
                              <Chip
                                key={index}
                                label={`${loc.inventoryId?.name || 'Kho không xác định'}: ${loc.stock || 0} ${modalProduct.unit || 'cái'}`}
                                variant="outlined"
                                size="small"
                                sx={{
                                  borderColor: palette.light,
                                  color: palette.dark,
                                  '&:hover': {
                                    backgroundColor: `${palette.light}20`,
                                  },
                                }}
                              />
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: "#f8f9fa" }}>
            <Button
              onClick={() => setShowModal(false)}
              variant="contained"
              sx={{
                bgcolor: palette.medium,
                "&:hover": { bgcolor: palette.dark },
                borderRadius: 2,
                px: 4,
                fontWeight: 600,
              }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default ExportProduct;
