// Import necessary libraries and components
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  useTheme,
  CssBaseline,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import "chart.js/auto";

// Import APIs
import transactionAPI from "../../API/transactionAPI";
import productAPI from "../../API/productAPI";
import inventoryAPI from "../../API/inventoryAPI";
import categoryAPI from "../../API/categoryAPI";
import supplierAPI from "../../API/supplierAPI";
import supplierProductAPI from "../../API/supplierProductAPI";
import branchAPI from "../../API/branchAPI";
import notificationAPI from "../../API/notificationAPI";
import adjustmentAPI from "../../API/adjustmentAPI";
import { getStocktakingHistory } from "../../API/stocktakingAPI";
import palette from "../../Constants/palette";

// Import Components
import StatCards from './StatCards';
import TabNavigation from './TabNavigation';
import ChartDisplay from './ChartDisplay';
import TransactionValueChart from './TransactionValueChart';
import ExportActions from './ExportActions';

// Colors for consistency - Sử dụng tông màu của hệ thống
const colors = {
  primary: palette.dark,      // "#155E64" - Xanh đậm
  success: "#2e7d32",
  warning: "#ed6c02",
  error: "#d32f2f",
  info: palette.medium,       // "#75B39C" - Xanh vừa
  light: palette.light,       // "#A0E4D0" - Xanh nhạt
};

function Dashboard() {
  const theme = useTheme();

  // Core data states
  const [productData, setProductData] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [supplierProductData, setSupplierProductData] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [stocktakingData, setStocktakingData] = useState([]);
  const [adjustmentData, setAdjustmentData] = useState([]);
  const [notificationData, setNotificationData] = useState([]);

  // Transaction statistics
  const [transactionStats, setTransactionStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    totalValue: 0,
    importValue: 0,
    exportValue: 0,
  });

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("transaction-value");
  const [timeRange, setTimeRange] = useState("week");
  const [salesData, setSalesData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Enhanced statistics
  const [warehouseStats, setWarehouseStats] = useState({
    totalShelves: 0,
    occupiedShelves: 0,
    totalCapacity: 0,
    usedCapacity: 0,
    utilizationRate: 0,
  });

  // Comprehensive data fetching from all APIs
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("🚀 Starting comprehensive data fetch...");

        // Fetch all data in parallel for better performance
        const [
          productResponse,
          transactionResponse,
          inventoryResponse,
          categoryResponse,
          supplierResponse,
          supplierProductResponse,
          branchResponse,
          stocktakingResponse,
          adjustmentResponse,
          notificationResponse
        ] = await Promise.allSettled([
          productAPI.getAll(),
          transactionAPI.getAll(),
          inventoryAPI.getAll(),
          categoryAPI.getAll(),
          supplierAPI.getAll(),
          supplierProductAPI.getAll(),
          branchAPI.getAll(),
          getStocktakingHistory(),
          adjustmentAPI.getAll(),
          notificationAPI.getAll()
        ]);

        // Process each response safely
        if (productResponse.status === 'fulfilled' && productResponse.value?.data) {
          console.log("✅ Products loaded:", productResponse.value.data.length);
          processProductData(productResponse.value.data);
        } else {
          console.warn("⚠️ Failed to load products:", productResponse.reason);
        }

        if (transactionResponse.status === 'fulfilled' && transactionResponse.value?.data) {
          console.log("✅ Transactions loaded:", transactionResponse.value.data.length);
          processTransactionData(transactionResponse.value.data);
        } else {
          console.warn("⚠️ Failed to load transactions:", transactionResponse.reason);
        }

        if (inventoryResponse.status === 'fulfilled' && inventoryResponse.value?.data) {
          console.log("✅ Inventory loaded:", inventoryResponse.value.data.length);
          setInventoryData(inventoryResponse.value.data);
          processInventoryData(inventoryResponse.value.data);
        } else {
          console.warn("⚠️ Failed to load inventory:", inventoryResponse.reason);
        }

        if (categoryResponse.status === 'fulfilled' && categoryResponse.value?.data) {
          console.log("✅ Categories loaded:", categoryResponse.value.data.length);
          setCategoryData(categoryResponse.value.data);
        } else {
          console.warn("⚠️ Failed to load categories:", categoryResponse.reason);
        }

        // Process other data sources safely...
        [supplierResponse, supplierProductResponse, branchResponse,
          stocktakingResponse, adjustmentResponse, notificationResponse].forEach((response, index) => {
            const names = ['suppliers', 'supplier products', 'branches', 'stocktaking', 'adjustments', 'notifications'];
            const setters = [setSupplierData, setSupplierProductData, setBranchData,
              setStocktakingData, setAdjustmentData, setNotificationData];

            if (response.status === 'fulfilled' && response.value) {
              const data = response.value.data || response.value;
              if (Array.isArray(data)) {
                console.log(`✅ ${names[index]} loaded:`, data.length);
                setters[index](data);
              } else {
                console.warn(`⚠️ ${names[index]} data is not an array:`, data);
                setters[index]([]);
              }
            } else {
              console.warn(`⚠️ Failed to load ${names[index]}:`, response.reason);
              setters[index]([]);
            }
          });

        console.log("🎉 All data fetching completed!");
        setLoading(false);

      } catch (err) {
        console.error("❌ Critical error in data fetching:", err);
        setError(err.message || "Failed to fetch dashboard data");
        setLoading(false);
      }
    };

    fetchAllData();

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchAllData();
    }, 300000);

    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const processProductData = (data) => {
    const processedData = data.map((product) => {
      let categoryName = "Uncategorized";
      if (product.categoryId && product.categoryId.categoryName) {
        categoryName = product.categoryId.categoryName;
      }

      // Improved price calculation - try multiple sources
      let price = 0;
      let supplierStock = 0;
      let supplierName = "";
      let expiryDate = null;

      // Try to get price from multiple sources in priority order
      if (product.price && product.price > 0) {
        // First priority: direct product price
        price = parseFloat(product.price) || 0;
      } else if (product.suppliers && product.suppliers.length > 0) {
        // Second priority: supplier price
        price = parseFloat(product.suppliers[0].price) || 0;
        supplierStock = product.suppliers[0].stock;
        supplierName = product.suppliers[0].name || product.suppliers[0].supplierName;
        expiryDate = new Date(product.suppliers[0].expiry);
      } else if (product.location && Array.isArray(product.location)) {
        // Third priority: price from location data (import transactions)
        const locationWithPrice = product.location.find(loc => loc.price && loc.price > 0);
        if (locationWithPrice) {
          price = parseFloat(locationWithPrice.price) || 0;
        }
      }

      let stockStatus = "Normal";
      if (product.totalStock <= product.thresholdStock) {
        stockStatus = "Critical";
      } else if (product.totalStock <= product.thresholdStock * 2) {
        stockStatus = "Low";
      }
      const today = new Date();
      const daysUntilExpiry = expiryDate
        ? Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
        : null;

      // Process location data
      let formattedLocation = "N/A";
      if (product.location) {
        if (Array.isArray(product.location) && product.location.length > 0) {
          formattedLocation = product.location
            .map((loc) => {
              if (loc && loc.inventoryId && loc.inventoryId.name) {
                return `${loc.inventoryId.name} (${loc.stock || 0})`;
              }
              return "N/A";
            })
            .join(", ");
        } else if (typeof product.location === "string") {
          try {
            const locationData = JSON.parse(product.location);
            if (Array.isArray(locationData) && locationData.length > 0) {
              formattedLocation = locationData
                .map((loc) => {
                  if (loc && loc.inventoryId && loc.inventoryId.name) {
                    return `${loc.inventoryId.name} (${loc.stock || 0})`;
                  }
                  return "N/A";
                })
                .join(", ");
            } else {
              formattedLocation = product.location;
            }
          } catch (e) {
            formattedLocation = product.location;
          }
        } else {
          formattedLocation = product.location;
        }
      }

      return {
        id: product._id.$oid || product._id,
        productName: product.productName,
        categoryName: categoryName,
        price: price,
        supplierName: supplierName,
        supplierStock: supplierStock,
        totalStock: product.totalStock || 0,
        thresholdStock: product.thresholdStock || 0,
        stockStatus: stockStatus,
        daysUntilExpiry: daysUntilExpiry,
        unit: product.unit,
        location: product.location,
        formattedLocation: formattedLocation,
        status: product.status,
        image: product.productImage,
        lastUpdated: product.updatedAt || product.createdAt,
      };
    });

    setProductData(processedData);
    generateSalesData(processedData, timeRange);
  };

  const processTransactionData = (data) => {
    setTransactionData(data);

    const completed = data.filter((t) => t.status === "completed").length;
    const pending = data.filter((t) => t.status === "pending").length;

    const totalValue = data.reduce((sum, t) => {
      const transactionValue = t.products && Array.isArray(t.products)
        ? t.products.reduce(
          (itemSum, product) => {
            const price = parseFloat(product.price) || 0;
            const quantity = parseInt(product.requestQuantity) || 0;
            return itemSum + (price * quantity);
          },
          0
        )
        : 0;
      return sum + transactionValue;
    }, 0);

    setTransactionStats({
      total: data.length,
      completed,
      pending,
      totalValue,
    });

    const recent = [...data]
      .sort((a, b) => new Date(b.createdAt || b.transactionDate) - new Date(a.createdAt || a.transactionDate))
      .slice(0, 5);
    setRecentTransactions(recent);
  };

  const processInventoryData = (data) => {
    if (!Array.isArray(data)) return;

    const totalShelves = data.length;
    const occupiedShelves = data.filter(shelf =>
      shelf.products && shelf.products.length > 0
    ).length;

    const totalCapacity = data.reduce((sum, shelf) =>
      sum + (shelf.maxQuantitative || 0), 0
    );

    const usedCapacity = data.reduce((sum, shelf) =>
      sum + (shelf.currentQuantitative || 0), 0
    );

    const utilizationRate = totalCapacity > 0 ?
      ((usedCapacity / totalCapacity) * 100).toFixed(2) : 0;

    setWarehouseStats({
      totalShelves,
      occupiedShelves,
      totalCapacity,
      usedCapacity,
      utilizationRate: parseFloat(utilizationRate),
    });
  };

  const generateSalesData = (products, range) => {
    const today = new Date();
    const labels = [];
    const daysToShow = range === "week" ? 7 : range === "month" ? 30 : 90;

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(
        date.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })
      );
    }

    if (transactionData.length > 0) {
      const datasets = [];
      const topProducts = [...products]
        .sort((a, b) => b.totalStock - a.totalStock)
        .slice(0, 5);

      const colorsArr = [
        "rgba(75, 192, 192, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
        "rgba(255, 99, 132, 1)",
      ];

      topProducts.forEach((product, index) => {
        const productTransactions = transactionData.filter(
          (t) =>
            t.items &&
            t.items.some(
              (item) =>
                item.productId === product.id ||
                (typeof item.productId === "object" &&
                  item.productId._id === product.id)
            )
        );

        const data = labels.map((dateLabel) => {
          const [day, month] = dateLabel.split("/").map(Number);
          const dateForLabel = new Date(today.getFullYear(), month - 1, day);

          const dayTransactions = productTransactions.filter((t) => {
            const tDate = new Date(t.createdAt);
            return (
              tDate.getDate() === dateForLabel.getDate() &&
              tDate.getMonth() === dateForLabel.getMonth() &&
              tDate.getFullYear() === dateForLabel.getFullYear()
            );
          });

          const quantity = dayTransactions.reduce((sum, t) => {
            const productItems = t.items.filter(
              (item) =>
                item.productId === product.id ||
                (typeof item.productId === "object" &&
                  item.productId._id === product.id)
            );
            return (
              sum +
              productItems.reduce((itemSum, item) => itemSum + item.quantity, 0)
            );
          }, 0);

          return quantity || Math.round(Math.random() * 10);
        });

        datasets.push({
          label: product.productName,
          data: data,
          borderColor: colorsArr[index % colorsArr.length],
          backgroundColor: colorsArr[index % colorsArr.length].replace(
            "1)",
            "0.1)"
          ),
          tension: 0.3,
          fill: true,
        });
      });

      setSalesData({ labels, datasets });
    } else {
      const datasets = [];
      const topProducts = [...products]
        .sort((a, b) => b.totalStock - a.totalStock)
        .slice(0, 5);

      const colorsArr = [
        "rgba(75, 192, 192, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
        "rgba(255, 99, 132, 1)",
      ];

      topProducts.forEach((product, index) => {
        const data = [];
        let currentValue = product.totalStock;

        for (let i = 0; i < daysToShow; i++) {
          const change = currentValue * (Math.random() * 0.1 - 0.05);
          if (i < daysToShow - 1) {
            currentValue = Math.max(
              currentValue - change,
              product.thresholdStock * 0.8
            );
            data.unshift(Math.round(currentValue));
          } else {
            data.unshift(product.totalStock);
          }
        }

        datasets.push({
          label: product.productName,
          data: data,
          borderColor: colorsArr[index % colorsArr.length],
          backgroundColor: colorsArr[index % colorsArr.length].replace(
            "1)",
            "0.1)"
          ),
          tension: 0.3,
          fill: true,
        });
      });

      setSalesData({ labels, datasets });
    }
  };



  // Chart data generation
  const getChartData = useCallback(() => {
    const topProducts = [...productData]
      .sort((a, b) => b.totalStock - a.totalStock)
      .slice(0, 8);

    if (activeTab === "stock") {
      return {
        labels: topProducts.map((p) => p.productName),
        datasets: [
          {
            label: "Tồn kho hiện tại",
            data: topProducts.map((p) => p.totalStock),
            backgroundColor: topProducts
              .map((p) =>
                p.stockStatus === "Critical"
                  ? colors.error
                  : p.stockStatus === "Low"
                    ? colors.warning
                    : colors.success
              ),
            borderWidth: 1,
          },
          {
            label: "Ngưỡng tồn kho tối thiểu",
            data: topProducts.map((p) => p.thresholdStock),
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderWidth: 1,
            type: "line",
            pointRadius: 6,
          },
        ],
      };
    } else if (activeTab === "price") {
      return {
        labels: topProducts.map((p) => p.productName),
        datasets: [
          {
            label: "Giá (VND)",
            data: topProducts.map((p) => p.price),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      };
    } else if (activeTab === "category") {
      const categoryCount = {};
      productData.forEach((product) => {
        const category = product.categoryName || "Chưa phân loại";
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
      return {
        labels: Object.keys(categoryCount),
        datasets: [
          {
            data: Object.values(categoryCount),
            backgroundColor: [
              "#4CAF50",
              "#FF5722",
              "#2196F3",
              "#FFC107",
              "#9C27B0",
              "#795548",
              "#607D8B",
              "#E91E63",
              "#00BCD4",
            ],
            borderWidth: 1,
          },
        ],
      };
    } else if (activeTab === "status") {
      const statusCount = {
        "Tồn kho thấp": productData.filter(
          (p) => p.stockStatus === "Critical"
        ).length,
        "Tồn kho vừa": productData.filter((p) => p.stockStatus === "Low")
          .length,
        "Tồn kho tốt": productData.filter((p) => p.stockStatus === "Normal")
          .length,
      };
      return {
        labels: Object.keys(statusCount),
        datasets: [
          {
            data: Object.values(statusCount),
            backgroundColor: [colors.error, colors.warning, colors.success],
            borderWidth: 1,
          },
        ],
      };
    } else if (activeTab === "trend") {
      return salesData;
    }
  }, [activeTab, productData, salesData]);

  // Statistics calculations
  const getTotalProducts = useCallback(() => productData.length, [productData]);
  const getLowStockProducts = useCallback(
    () => productData.filter((p) => p.stockStatus === "Low").length,
    [productData]
  );
  const getCriticalStockProducts = useCallback(
    () => productData.filter((p) => p.stockStatus === "Critical").length,
    [productData]
  );
  const getTotalInventoryValue = useCallback(
    () =>
      productData.reduce(
        (sum, product) => sum + product.price * product.totalStock,
        0
      ),
    [productData]
  );
  const getExpiringProductsCount = useCallback(
    () =>
      productData.filter((p) => p.daysUntilExpiry && p.daysUntilExpiry <= 30)
        .length,
    [productData]
  );

  const exportCSV = () => {
    if (productData.length === 0) {
      alert("Không có dữ liệu để xuất");
      return;
    }

    const headers = Object.keys(productData[0]);
    const csvRows = [
      headers.join(","),
      ...productData.map((product) =>
        headers
          .map((header) => {
            const value = product[header];
            return typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value !== undefined && value !== null
                ? value
                : "";
          })
          .join(",")
      ),
    ];

    const csvContent = "\uFEFF" + csvRows.join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `inventory-export-${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    alert(
      "PDF Export feature would be implemented here with a library like jsPDF"
    );
  };

  // Statistics for StatCards
  const stats = [
    {
      title: "Tổng sản phẩm",
      value: getTotalProducts(),
      color: colors.primary,
    },
    {
      title: "Sắp hết",
      value: getLowStockProducts(),
      color: colors.warning,
    },
    {
      title: "Cần nhập gấp",
      value: getCriticalStockProducts(),
      color: colors.error,
    },
    {
      title: "Sắp hết hạn",
      value: getExpiringProductsCount(),
      color: "#FF5722",
    },
    {
      title: "Tổng giá trị",
      value: `${getTotalInventoryValue().toLocaleString()} VND`,
      color: colors.success,
    },
    {
      title: "Kệ hàng",
      value: warehouseStats.totalShelves,
      color: "#9C27B0",
    },
    {
      title: "Sử dụng kho",
      value: `${warehouseStats.utilizationRate}%`,
      color: "#FF9800",
    },
    {
      title: "Hoàn thành",
      value: transactionStats.completed,
      color: colors.info,
    },
  ];

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Đang tải dữ liệu dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Lỗi tải dữ liệu
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Box>
            <button
              style={{
                padding: "8px 16px",
                backgroundColor: theme.palette.primary.main,
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </button>
          </Box>
        </Alert>
      </Container>
    );
  }

  const chartData = getChartData();

  // Add AI Analysis tab logic
  const renderTabContent = () => {
    if (activeTab === "transaction-value") {
      return (
        <TransactionValueChart
          transactionData={transactionData}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />
      );
    } else {
      return (
        <ChartDisplay
          activeTab={activeTab}
          chartData={getChartData()}
          timeRange={timeRange}
          salesData={salesData}
        />
      );
    }
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        pb: 4
      }}>
        <Container maxWidth="xl" sx={{ pt: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <Box sx={{
              textAlign: 'center',
              mb: 4,
              background: `linear-gradient(135deg, ${palette.dark} 0%, ${palette.medium} 100%)`,
              borderRadius: 4,
              color: 'white',
              py: 4,
              px: 3,
            }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                📊 Dashboard Thống Kê Kho Hàng
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Phân tích và theo dõi tình trạng kho hàng thời gian thực
              </Typography>
            </Box>

            {/* Action Bar */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Box />
              <ExportActions onExportCSV={exportCSV} onExportPDF={exportPDF} />
            </Box>

            {/* Statistics Cards */}
            <StatCards stats={stats} />

            {/* Tab Navigation */}
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Chart Display */}
            <AnimatePresence mode="wait">
              {renderTabContent()}
            </AnimatePresence>
          </motion.div>
        </Container>
      </Box>
    </>
  );
}

export default Dashboard;
