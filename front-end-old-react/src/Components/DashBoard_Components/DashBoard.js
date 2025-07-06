import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";
import "chart.js/auto";

// Define common style constants
const colors = {
  primary: "#007BFF",
  success: "#28a745",
  warning: "#ffc107",
  danger: "#dc3545",
  info: "#17a2b8",
  light: "#f8f9fa",
  dark: "#343a40",
  white: "#ffffff",
  background: "#f0f2f5",
};

const commonInputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  transition: "all 0.3s ease",
};

const commonButtonStyle = {
  padding: "10px 20px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
};

const cardStyle = {
  backgroundColor: colors.white,
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

function SearchFilter({
  selectedCategory,
  setSelectedCategory,
  categories,
  searchTerm,
  setSearchTerm,
  displayCount,
  setDisplayCount,
  displayOption,
  setDisplayOption,
  sortedProducts,
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        marginBottom: "20px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div>
        <label style={{ marginRight: "5px" }}>Danh mục:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ ...commonInputStyle }}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? "Tất cả " : category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ marginRight: "5px" }}>Tìm kiếm :</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products or location..."
          style={{ ...commonInputStyle, width: "220px" }}
        />
      </div>

      <div>
        <label style={{ marginRight: "5px" }}>Hiển thị:</label>
        <select
          value={displayOption}
          onChange={(e) => {
            const value = e.target.value;
            setDisplayOption(value);
            setDisplayCount(
              value === "All" ? sortedProducts.length : parseInt(value)
            );
          }}
          style={{ ...commonInputStyle }}
        >
          {["5", "10", "15", "20", "All"].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function StatCards({ stats }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          style={{
            ...cardStyle,
            flex: "1 1 160px",
            border: `1px solid ${stat.color}`,
            textAlign: "center",
          }}
        >
          <h3 style={{ color: stat.color, margin: "0 0 10px 0" }}>
            {stat.title}
          </h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function ChartDisplay({ activeTab, chartData, timeRange, salesData }) {
  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return <p>No data available for selected filters.</p>;
  }

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text:
          activeTab === "stock"
            ? "Số lượng sản phẩm"
            : activeTab === "price"
            ? "So sánh giá sản phẩm"
            : activeTab === "category"
            ? "Lượng sản phẩm của danh mục"
            : activeTab === "status"
            ? "Tình trạng kho"
            : `Xu hướng tiêu thụ (${
                timeRange === "Tuần"
                  ? "7 ngày trước"
                  : timeRange === "tháng"
                  ? "30 ngày trước "
                  : "90 ngày trước "
              })`,
      },
      legend: {
        display: activeTab === "stock",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: activeTab === "trend" && {
          display: true,
          text: "Stock Units",
        },
      },
      x: {
        title: activeTab === "trend" && {
          display: true,
          text: "Date",
        },
      },
    },
    elements: {
      line: { tension: 0.3 },
      point: { radius: 2 },
    },
  };

  switch (activeTab) {
    case "stock":
    case "price":
      return <Bar data={chartData} options={chartOptions} />;
    case "category":
      return <Pie data={chartData} options={chartOptions} />;
    case "status":
      return <Doughnut data={chartData} options={chartOptions} />;
    case "trend":
      return <Line data={chartData} options={chartOptions} />;
    default:
      return <p>No data available for selected chart type.</p>;
  }
}

function DataTable({
  sortedProducts,
  handleSortChange,
  sortBy,
  sortOrder,
  displayCount,
  setDisplayCount,
}) {
  return (
    <div style={{ ...cardStyle, overflowX: "auto" }}>
      <h3 style={{ marginBottom: "10px" }}>
        Danh sách sản phẩm ({sortedProducts.length} Sản phẩm)
      </h3>
      {sortedProducts.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: colors.light }}>
              {[
                { field: "productName", label: "Tên " },
                { field: "categoryName", label: "Danh mục " },
                { field: "supplierName", label: "Nhà cung cấp " },
                { field: "price", label: "Giá (VND)" },
                { field: "totalStock", label: "Tổng kho" },
                { field: "stockStatus", label: "Trạng thái" },
                { field: "location", label: "Vị trí" },
                { field: "daysUntilExpiry", label: "Ngày trước khi hết hạn" },
              ].map((column) => (
                <th
                  key={column.field}
                  onClick={() => handleSortChange(column.field)}
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #ddd",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {column.label}
                  {sortBy === column.field && (
                    <span style={{ marginLeft: "5px" }}>
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedProducts.slice(0, displayCount).map((product, index) => (
              <tr
                key={product.id}
                style={{
                  backgroundColor: index % 2 === 0 ? colors.white : "#f9f9f9",
                }}
              >
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {product.productName}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {product.categoryName}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {product.supplierName}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #ddd",
                    textAlign: "right",
                  }}
                >
                  {product.price ? product.price.toLocaleString() : "N/A"}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #ddd",
                    textAlign: "center",
                  }}
                >
                  {product.totalStock}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor:
                        product.stockStatus === "Normal"
                          ? "#d4edda"
                          : product.stockStatus === "Critical"
                          ? "#f8d7da"
                          : "#fff3cd",
                      color:
                        product.stockStatus === "Normal"
                          ? "#155724"
                          : product.stockStatus === "Critical"
                          ? "#721c24"
                          : "#856404",
                      fontSize: "0.85em",
                    }}
                  >
                    {product.stockStatus}
                  </span>
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {product.location}
                </td>
                <td
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #ddd",
                    textAlign: "center",
                  }}
                >
                  {product.daysUntilExpiry ? (
                    <span
                      style={{
                        color:
                          product.daysUntilExpiry <= 30
                            ? colors.danger
                            : product.daysUntilExpiry <= 90
                            ? colors.warning
                            : colors.success,
                        fontWeight:
                          product.daysUntilExpiry <= 30 ? "bold" : "normal",
                      }}
                    >
                      {product.daysUntilExpiry}
                    </span>
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No products match your filter criteria.</p>
      )}
      {sortedProducts.length > displayCount && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            style={{
              ...commonButtonStyle,
              backgroundColor: colors.primary,
              color: colors.white,
            }}
            onClick={() => setDisplayCount(sortedProducts.length)}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = colors.primary)
            }
          >
           Hiển thị toàn bộ sản phẩm
          </button>
        </div>
      )}
    </div>
  );
}

function ExpiringAlert({ productData }) {
  const expiringProducts = productData
    .filter((p) => p.daysUntilExpiry && p.daysUntilExpiry <= 30)
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  if (expiringProducts.length === 0) return null;

  return (
    <div
      style={{
        ...cardStyle,
        backgroundColor: "#fff3cd",
        border: "1px solid #ffeeba",
      }}
    >
      <h3 style={{ color: "#856404", marginTop: 0 }}>
        Expiring Products Alert
      </h3>
      <p>
        You have {expiringProducts.length} products expiring in the next 30
        days.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#ffeeba" }}>
            <th style={{ padding: "8px", textAlign: "left" }}>Product Name</th>
            <th style={{ padding: "8px", textAlign: "left" }}>
              Days Until Expiry
            </th>
            <th style={{ padding: "8px", textAlign: "right" }}>Stock</th>
          </tr>
        </thead>
        <tbody>
          {expiringProducts.slice(0, 3).map((product) => (
            <tr key={product.id}>
              <td style={{ padding: "8px" }}>{product.productName}</td>
              <td style={{ padding: "8px" }}>{product.daysUntilExpiry} days</td>
              <td style={{ padding: "8px", textAlign: "right" }}>
                {product.totalStock} {product.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {expiringProducts.length > 3 && (
        <p style={{ textAlign: "right", margin: "10px 0 0 0" }}>
          <button
            style={{
              ...commonButtonStyle,
              backgroundColor: "#856404",
              color: colors.white,
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#6d4c41")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#856404")}
          >
            View All Expiring Products
          </button>
        </p>
      )}
    </div>
  );
}

function Recommendations({
  productData,
  getCriticalStockProducts,
  getExpiringProductsCount,
  getTotalInventoryValue,
}) {
  const healthyPercentage = Math.round(
    (productData.filter((p) => p.stockStatus === "Normal").length /
      productData.length) *
      100
  );
  return (
    <div style={{ ...cardStyle, marginTop: "20px" }}>
      <h3>Recommendations</h3>
      <ul style={{ paddingLeft: "20px" }}>
        {getCriticalStockProducts() > 0 && (
          <li style={{ marginBottom: "10px", color: colors.danger }}>
            <b>Critical Stock Alert:</b> {getCriticalStockProducts()} products
            are below threshold stock levels and need immediate restocking.
          </li>
        )}
        {getExpiringProductsCount() > 0 && (
          <li style={{ marginBottom: "10px", color: "#856404" }}>
            <b>Expiration Alert:</b> {getExpiringProductsCount()} products will
            expire within 30 days. Consider promotional activities or price
            reductions.
          </li>
        )}
        {getTotalInventoryValue() > 500000000 && (
          <li style={{ marginBottom: "10px", color: "#0c5460" }}>
            <b>High Inventory Value:</b> Your total inventory value is{" "}
            {getTotalInventoryValue().toLocaleString()} VND. Consider optimizing
            stock levels for better cash flow.
          </li>
        )}
        <li style={{ marginBottom: "10px" }}>
          <b>Inventory Health:</b> {healthyPercentage}% of your inventory is at
          healthy stock levels.
        </li>
      </ul>
    </div>
  );
}

function Dashboard() {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("stock");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("productName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [displayCount, setDisplayCount] = useState(10);
  const [displayOption, setDisplayOption] = useState("10");
  const [timeRange, setTimeRange] = useState("week");
  const [salesData, setSalesData] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:9999/products/getAllProducts")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const processedData = data.map((product) => {
          let categoryName = "Uncategorized";
          if (product.categoryId && product.categoryId.categoryName) {
            categoryName = product.categoryId.categoryName;
          }
          let price = 0,
            supplierStock = 0,
            supplierName = "",
            expiryDate = null;
          if (product.suppliers && product.suppliers.length > 0) {
            price = product.suppliers[0].price;
            supplierStock = product.suppliers[0].stock;
            supplierName = product.suppliers[0].name;
            expiryDate = new Date(product.suppliers[0].expiry);
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
          return {
            id: product._id.$oid || product._id,
            productName: product.productName,
            categoryName: categoryName,
            price: price,
            supplierName: supplierName,
            supplierStock: supplierStock,
            totalStock: product.totalStock,
            thresholdStock: product.thresholdStock,
            stockStatus: stockStatus,
            daysUntilExpiry: daysUntilExpiry,
            unit: product.unit,
            location: product.location,
            status: product.status,
            image: product.productImage,
          };
        });

        setProductData(processedData);
        const uniqueCategories = [
          ...new Set(
            processedData
              .map((product) => product.categoryName)
              .filter((name) => name && name !== "Uncategorized")
          ),
        ];
        setCategories(["all", ...uniqueCategories]);
        generateMockSalesData(processedData, timeRange);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const generateMockSalesData = (products, range) => {
    const today = new Date();
    const labels = [];
    const datasets = [];
    const daysToShow = range === "week" ? 7 : range === "month" ? 30 : 90;

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(
        date.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })
      );
    }

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
  };

  const filteredProducts = useMemo(() => {
    return productData.filter((product) => {
      const matchesSearch =
        searchTerm === "" ||
        product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.categoryName === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [productData, searchTerm, selectedCategory]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      }
      valueA = String(valueA || "").toLowerCase();
      valueB = String(valueB || "").toLowerCase();
      return sortOrder === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
  }, [filteredProducts, sortBy, sortOrder]);

  const getChartData = useCallback(() => {
    if (activeTab === "stock") {
      return {
        labels: sortedProducts.slice(0, 8).map((p) => p.productName),
        datasets: [
          {
            label: "Current Stock",
            data: sortedProducts.slice(0, 8).map((p) => p.totalStock),
            backgroundColor: sortedProducts
              .slice(0, 8)
              .map((p) =>
                p.stockStatus === "Critical"
                  ? colors.danger
                  : p.stockStatus === "Low"
                  ? colors.warning
                  : colors.success
              ),
            borderWidth: 1,
          },
          {
            label: "Threshold",
            data: sortedProducts.slice(0, 8).map((p) => p.thresholdStock),
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderWidth: 1,
            type: "line",
            pointRadius: 6,
          },
        ],
      };
    } else if (activeTab === "price") {
      return {
        labels: sortedProducts.slice(0, 8).map((p) => p.productName),
        datasets: [
          {
            label: "Price (VND)",
            data: sortedProducts.slice(0, 8).map((p) => p.price),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      };
    } else if (activeTab === "category") {
      const categoryCount = {};
      sortedProducts.forEach((product) => {
        const category = product.categoryName || "Uncategorized";
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
        Critical: sortedProducts.filter((p) => p.stockStatus === "Critical")
          .length,
        Low: sortedProducts.filter((p) => p.stockStatus === "Low").length,
        Normal: sortedProducts.filter((p) => p.stockStatus === "Normal").length,
      };
      return {
        labels: Object.keys(statusCount),
        datasets: [
          {
            data: Object.values(statusCount),
            backgroundColor: [colors.danger, colors.warning, colors.success],
            borderWidth: 1,
          },
        ],
      };
    } else if (activeTab === "trend") {
      return salesData;
    }
  }, [activeTab, sortedProducts, salesData]);

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
  const getAveragePrice = useCallback(() => {
    const prices = productData
      .filter((product) => product.price)
      .map((product) => parseFloat(product.price));
    return prices.length > 0
      ? prices.reduce((sum, price) => sum + price, 0) / prices.length
      : 0;
  }, [productData]);
  const getExpiringProductsCount = useCallback(
    () =>
      productData.filter((p) => p.daysUntilExpiry && p.daysUntilExpiry <= 30)
        .length,
    [productData]
  );

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const exportCSV = () => {
    const csvProducts = sortedProducts;
    if (csvProducts.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(csvProducts[0]);
    const csvRows = [
      headers.join(","),
      ...csvProducts.map((product) =>
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

    // ✅ Chỉ khai báo csvContent 1 lần và thêm BOM ở đầu
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

  if (loading) return <div>Loading dashboard data...</div>;
  if (error) return <div>Error loading data: {error}</div>;

  const chartData = getChartData();

  const stats = [
    {
      title: "Tổng số sản phẩm",
      value: getTotalProducts(),
      color: colors.primary,
    },
    { title: "Còn ít ", value: getLowStockProducts(), color: colors.warning },
    {
      title: "Gần hết",
      value: getCriticalStockProducts(),
      color: colors.danger,
    },
    {
      title: "Gần hết hạn",
      value: getExpiringProductsCount(),
      color: "#FF5722",
    },
    {
      title: "Tổng giá trị",
      value: `${getTotalInventoryValue().toLocaleString()} VND`,
      color: "#4CAF50",
    },
  ];

  return (
    <div
      className="dashboard-container"
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: colors.background,
        minHeight: "100vh",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "30px",
          color: colors.dark,
        }}
      >
        Thống kê và phân tích
      </h2>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <SearchFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          displayCount={displayCount}
          setDisplayCount={setDisplayCount}
          displayOption={displayOption}
          setDisplayOption={setDisplayOption}
          sortedProducts={filteredProducts}
        />
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={exportCSV}
            style={{
              ...commonButtonStyle,
              backgroundColor: colors.primary,
              color: colors.white,
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = colors.primary)
            }
          >
            Xuất file CSV
          </button>
        </div>
      </div>

      <StatCards stats={stats} />

      <div
        className="chart-tabs"
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          justifyContent: "center",
        }}
      >
        {[
          { id: "stock", label: "Biểu đồ số lượng" },
          { id: "price", label: "So sánh giá" },
          { id: "category", label: "Phân phối danh mục" },
          { id: "status", label: "Tình trạng kho" },
          { id: "trend", label: "Xu hướng tiêu thụ" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...commonButtonStyle,
              backgroundColor:
                activeTab === tab.id ? colors.dark : colors.light,
              color: activeTab === tab.id ? colors.white : colors.dark,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "trend" && (
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <label style={{ marginRight: "10px" }}>Khoảng thời gian:</label>
          <select
            value={timeRange}
            onChange={(e) => {
              setTimeRange(e.target.value);
              generateMockSalesData(productData, e.target.value);
            }}
            style={{ ...commonInputStyle, width: "160px" }}
          >
            <option value="week">7 ngày trước</option>
            <option value="month">30 ngày trước </option>
            <option value="quarter">90 ngày trước </option>
          </select>
        </div>
      )}

      <div style={{ ...cardStyle, height: "400px", marginBottom: "20px" }}>
        <ChartDisplay
          activeTab={activeTab}
          chartData={chartData}
          timeRange={timeRange}
          salesData={salesData}
        />
      </div>

      <ExpiringAlert productData={productData} />

      <DataTable
        sortedProducts={sortedProducts}
        handleSortChange={handleSortChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        displayCount={displayCount}
        setDisplayCount={setDisplayCount}
      />

      <Recommendations
        productData={productData}
        getCriticalStockProducts={getCriticalStockProducts}
        getExpiringProductsCount={getExpiringProductsCount}
        getTotalInventoryValue={getTotalInventoryValue}
      />
    </div>
  );
}

export default Dashboard;
