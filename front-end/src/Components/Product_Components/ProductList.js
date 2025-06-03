import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Alert } from "react-bootstrap";
import axios from "axios";
import useProduct from "./useProduct";
import FilterProduct from "./FilterProduct";
import UpdateProductModal from "./UpdateProductModal";
import ProductDetails from "./ProductDetails"; // Import ProductDetails component
import AddProduct from "./AddProduct"; // Import AddProduct Modal
import style from "./style.css"; // Nếu bạn có style.css, thêm vào đây

const ProductList = () => {
  const { loading, error, fetchAllProducts } = useProduct();
  const [deleteError, setDeleteError] = useState("");
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null); // State to filter products by status
  const [showAddProductModal, setShowAddProductModal] = useState(false); // State to show Add Product modal

  const handleOpenUpdateModal = (product) => {
    setSelectedProduct(product);
    setShowUpdateModal(true);
  };

  const handleOpenProductDetailsModal = (product) => {
    setSelectedProduct(product);
    setShowProductDetailsModal(true);
  };

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const [productsRes, supplierProductsRes] = await Promise.all([
          axios.get("http://localhost:9999/products/getAllProducts"),
          axios.get(
            "http://localhost:9999/supplierProducts/getAllSupplierProducts"
          ),
        ]);

        const products = productsRes.data;
        const supplierProducts = supplierProductsRes.data;

        const latestPrices = {};
        const avgPrices = {};
        const priceMap = {};

        supplierProducts.forEach((sp) => {
          const productId = sp.product?._id;
          if (!productId) return;

          // Lấy giá mới nhất (lấy bản ghi đầu tiên)
          if (!latestPrices[productId]) {
            latestPrices[productId] = sp.price;
          }

          // Gom giá để tính trung bình
          if (!priceMap[productId]) priceMap[productId] = [];
          priceMap[productId].push(sp.price);
        });

        // Tính giá trung bình cho từng sản phẩm
        Object.entries(priceMap).forEach(([productId, prices]) => {
          const sum = prices.reduce((acc, price) => acc + price, 0);
          avgPrices[productId] =
            prices.length > 0 ? Math.round(sum / prices.length) : 0;
        });

        const updated = products.map((p) => ({
          ...p,
          latestPrice: latestPrices[p._id] || 0,
          avgPrice: avgPrices[p._id] || 0,
        }));

        setProducts(updated);
      } catch (error) {
        console.error("Error fetching product or price info:", error);
      }
    };

    fetchAllProducts();
  }, []);

  const handleSort = (column) => {
    setSortBy(column);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const filteredProducts = useMemo(() => {
    let updatedProducts = [...products];

    if (filterText) {
      updatedProducts = updatedProducts.filter((product) =>
        product.productName.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    if (statusFilter !== null) {
      updatedProducts = updatedProducts.filter((product) =>
        statusFilter
          ? product.status === "active"
          : product.status === "inactive"
      );
    }

    updatedProducts.sort((a, b) => {
      if (sortBy === "name") {
        return sortDirection === "asc"
          ? a.productName.localeCompare(b.productName)
          : b.productName.localeCompare(a.productName);
      } else if (sortBy === "stock") {
        return sortDirection === "asc"
          ? a.totalStock - b.totalStock
          : b.totalStock - a.totalStock;
      } else if (sortBy === "unit") {
        return sortDirection === "asc"
          ? a.unit.localeCompare(b.unit)
          : b.unit.localeCompare(a.unit);
      } else if (sortBy === "location") {
        return sortDirection === "asc"
          ? a.location.localeCompare(b.location)
          : b.location.localeCompare(a.location);
      }
      return 0;
    });

    return updatedProducts;
  }, [products, filterText, sortBy, sortDirection, statusFilter]);

  const handleChangeStatus = async (productId, newStatus) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn thay đổi trạng thái của sản phẩm không?"
      )
    )
      return;

    try {
      await axios.put(
        `http://localhost:9999/products/inactivateProduct/${productId}`,
        { status: newStatus }
      );

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId
            ? { ...product, status: newStatus }
            : product
        )
      );
    } catch (err) {
      setDeleteError("Có lỗi xảy ra khi thay đổi trạng thái sản phẩm.");
      console.error("Change Status Error:", err);
    }
  };

  const handleFilter = ({ filterText }) => {
    setFilterText(filterText);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>Có lỗi xảy ra: {error.message}</p>;

  return (
    <div className="product-list-container">
      <div>
        {/* Add Product Button */}
        <Button
          variant="success"
          onClick={() => setShowAddProductModal(true)}
          style={{ marginBottom: "20px" }}
        >
          Thêm Sản Phẩm
        </Button>
      </div>
      {deleteError && <Alert variant="danger">{deleteError}</Alert>}
      <FilterProduct onFilter={handleFilter} />

      <div className="filter-buttons">
        <Button
          variant={statusFilter === true ? "primary" : "light"}
          onClick={() => handleStatusFilter(true)}
          className={statusFilter === true ? "active" : ""}
        >
          Đang Bán
        </Button>
        <Button
          variant={statusFilter === false ? "primary" : "light"}
          onClick={() => handleStatusFilter(false)}
          className={statusFilter === false ? "active" : ""}
        >
          Ngừng Bán
        </Button>
        <Button
          variant={statusFilter === null ? "primary" : "light"}
          onClick={() => setStatusFilter(null)}
          className={statusFilter === null ? "active" : ""}
        >
          Tất Cả
        </Button>
      </div>

      <div className="scrollable-table">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th style={{ textAlign: "left", verticalAlign: "middle" }}>
                Hình Ảnh
              </th>
              <th
                style={{
                  cursor: "pointer",
                  textAlign: "left",
                  verticalAlign: "middle",
                }}
                onClick={() => handleSort("name")}
              >
                Tên Sản Phẩm{" "}
                {sortBy === "name" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                style={{
                  width: "100px",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                Tổng SL
              </th>
              <th
                style={{
                  width: "120px",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                Giá TB
              </th>
              <th
                style={{
                  width: "120px",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                Giá mới
              </th>
              <th
                style={{
                  cursor: "pointer",
                  textAlign: "left",
                  verticalAlign: "middle",
                }}
                onClick={() => handleSort("unit")}
              >
                Đơn Vị{" "}
                {sortBy === "unit" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                style={{
                  cursor: "pointer",
                  textAlign: "left",
                  verticalAlign: "middle",
                }}
                onClick={() => handleSort("location")}
              >
                Vị Trí{" "}
                {sortBy === "location" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th style={{ textAlign: "left", verticalAlign: "middle" }}>
                Trạng Thái
              </th>
              <th style={{ textAlign: "left", verticalAlign: "middle" }}>
                Hành Động
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product._id}
                onClick={(e) => {
                  // Kiểm tra xem người dùng có nhấn vào nút "Chỉnh sửa" hoặc "Vô hiệu hóa" không
                  if (e.target.closest(".action-buttons") === null) {
                    handleOpenProductDetailsModal(product);
                  }
                }}
              >
                <td>
                  <img
                    src={
                      product.productImage
                        ? `http://localhost:9999${product.productImage}`
                        : "http://localhost:9999/uploads/default-product.png"
                    }
                    alt="Product Image"
                    width="50"
                  />
                </td>
                <td>
                  <Button
                    variant="link"
                    style={{ textDecoration: "none", color: "inherit" }}
                    onClick={() => handleOpenProductDetailsModal(product)}
                  >
                    {product.productName}
                  </Button>
                </td>
                <td style={{ textAlign: "center" }}>{product.totalStock}</td>
                <td style={{ textAlign: "right" }}>
                  {(product.avgPrice || 0).toLocaleString("en-US")} VND
                </td>
                <td style={{ textAlign: "right" }}>
                  {(product.latestPrice || 0).toLocaleString("en-US")} VND
                </td>
                <td>{product.unit}</td>
                <td>{product.location}</td>
                <td>
                  {product.status === "active" ? "Có sẵn" : "Không có sẵn"}
                </td>
                <td className="action-buttons">
                  <Button
                    className="fixed-button"
                    variant="warning"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn sự kiện click truyền ra ngoài
                      handleOpenUpdateModal(product);
                    }}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    className="fixed-button"
                    variant={product.status === "active" ? "danger" : "success"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn sự kiện click truyền ra ngoài
                      handleChangeStatus(
                        product._id,
                        product.status === "active" ? "inactive" : "active"
                      );
                    }}
                  >
                    {product.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <ProductDetails
        show={showProductDetailsModal}
        handleClose={() => setShowProductDetailsModal(false)}
        product={selectedProduct}
      />

      <UpdateProductModal
        show={showUpdateModal}
        handleClose={() => setShowUpdateModal(false)}
        product={selectedProduct}
        handleUpdate={fetchAllProducts}
      />

      {/* Modal Thêm Sản Phẩm */}
      <AddProduct
        show={showAddProductModal}
        handleClose={() => setShowAddProductModal(false)}
        handleSave={fetchAllProducts}
      />
    </div>
  );
};

export default ProductList;
